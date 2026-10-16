<?
//PointNexus VCNT 미입금 만료 자동 cancel — AJAX 배치 엔드포인트
//대상: KCP 가상계좌(VCNT) 주문 중 입금기한(kcp_log.va_date) 만료 + 미입금(tbl_order.step='1')인데
//      tbl_order_item_pointnexus 최신 row가 활성(booked/pending_reveal/sold)으로 남아있는 건
//처리: booked → runBookCancel(action=bookCancel) / pending_reveal·sold → runOperationCancel(action=cancel)
//      성공 시 insertLogRow(...'canceled') append (어드민 취소 order_ps.php case "PointNexus"와 동일 로직)
//멱등성: append-only 최신 row 기준 조회라 이미 취소된 체인은 재선정 안 됨. terminal(canceled/failed) skip
header('Content-Type: application/json; charset=UTF-8');
ini_set("display_errors", 0);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');

$mode    = filter_input(INPUT_POST, "mode",    FILTER_SANITIZE_STRING);
$limit   = (int)filter_input(INPUT_POST, "limit",   FILTER_SANITIZE_NUMBER_INT);
$dry_run = (int)filter_input(INPUT_POST, "dry_run", FILTER_SANITIZE_NUMBER_INT);

$mode = pn_normalize_mode($mode);
//미리보기는 한 번에 넓게(대상 전체 확인), 실행은 청크 단위로 반복
if($dry_run){
	if($limit < 1 || $limit > 1000){ $limit = 1000; }
} else {
	if($limit < 1 || $limit > 100){ $limit = 50; }
}

$response = array(
	"success"       => false,
	"mode"          => $mode,
	"limit"         => $limit,
	"dry_run"       => $dry_run ? 1 : 0,
	"count"         => 0,      //이번 호출에서 다룬 주문(ordno) 수
	"has_more"      => false,
	"canceled_ok"   => 0,
	"canceled_fail" => 0,
	"items"         => array(),
	"error"         => null,
);

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//대상 ordno 조회 — 최신 row가 활성 상태인 미입금 만료 VCNT 주문
	//pn 은 (ordno, productID)별 최신 row로 한정(latest 조인) → 이미 취소된 체인 자동 제외(무한루프 방지)
	$now = date('YmdHis');
	$cand_query = "
		SELECT DISTINCT pn.ordno
		FROM tbl_order_item_pointnexus pn
		INNER JOIN (
			SELECT ordno, productID, MAX(idx) AS max_idx
			FROM tbl_order_item_pointnexus
			WHERE mode = :mode
			GROUP BY ordno, productID
		) latest ON latest.ordno = pn.ordno AND latest.productID = pn.productID AND latest.max_idx = pn.idx
		INNER JOIN tbl_order_item a ON a.ordno = pn.ordno
		INNER JOIN tbl_order b ON b.settle_no = a.settle_no
		INNER JOIN (
			SELECT settle_no, MAX(va_date) AS va_date
			FROM kcp_log
			WHERE va_date IS NOT NULL AND va_date != ''
			GROUP BY settle_no
		) c ON c.settle_no = b.settle_no
		WHERE b.pg_provider = 'kcp'
		  AND b.step = '1'
		  AND pn.status IN ('booked','pending_reveal','sold')
		  AND pn.operationID IS NOT NULL AND pn.operationID != ''
		  AND c.va_date < :now
		ORDER BY pn.ordno
		LIMIT ".((int)$limit + 1);
	$cand_stmt = $conn->prepare($cand_query);
	$cand_stmt->execute(array(':mode' => $mode, ':now' => $now));
	$ordno_list = $cand_stmt->fetchAll(PDO::FETCH_COLUMN, 0);

	//limit+1건을 조회해서 다음 페이지 존재 여부 판정
	if(count($ordno_list) > $limit){
		$response['has_more'] = true;
		$ordno_list = array_slice($ordno_list, 0, $limit);
	}
	$response['count'] = count($ordno_list);

	if($response['count'] === 0){
		$response['success'] = true;
		echo json_encode($response, JSON_UNESCAPED_UNICODE);
		exit;
	}

	//대상 주문의 주문정보(주문일자/결제번호/회원/금액/마감시각) 일괄 조회 — 리스트 표시용
	$order_info = array();
	$ph   = array();
	$bind = array();
	foreach($ordno_list as $i => $od){
		$k = ':o'.$i;
		$ph[]    = $k;
		$bind[$k] = $od;
	}
	$oi_query = "
		SELECT a.ordno, b.settle_no, b.reg_date, b.m_id, b.total_price, b.step, c.va_date
		FROM tbl_order_item a
		INNER JOIN tbl_order b ON b.settle_no = a.settle_no
		LEFT JOIN (
			SELECT settle_no, MAX(va_date) AS va_date
			FROM kcp_log
			WHERE va_date IS NOT NULL AND va_date != ''
			GROUP BY settle_no
		) c ON c.settle_no = b.settle_no
		WHERE a.ordno IN (".implode(',', $ph).")";
	$oi_stmt = $conn->prepare($oi_query);
	$oi_stmt->execute($bind);
	foreach($oi_stmt->fetchAll(PDO::FETCH_ASSOC) as $oi){
		$order_info[$oi['ordno']] = $oi;
	}

	//마감시각(va_date) 표시용 포맷 — kcp_log엔 YmdHis(14자리) 문자열로 저장됨
	$fmt_va = function($raw){
		if(empty($raw)) return '';
		if(preg_match('/^\d{14}$/', $raw)){
			$dt = DateTime::createFromFormat('YmdHis', $raw);
			return $dt ? $dt->format('Y-m-d H:i:s') : $raw;
		}
		$ts = strtotime($raw);
		return $ts ? date('Y-m-d H:i:s', $ts) : $raw;
	};

	$adminOrder = new AdminOrder($conn);
	$pointnexus = $dry_run ? null : new PointNexus($mode);

	foreach($ordno_list as $ordno){
		$oi   = isset($order_info[$ordno]) ? $order_info[$ordno] : array();
		//(ordno, productID)별 최신 row
		$rows = $adminOrder->getActiveOrderItemPointNexus($ordno);
		foreach($rows as $row){
			if(empty($row['operationID'])){
				continue;
			}
			//이미 종료된 상태는 skip (멱등성)
			if($row['status'] == 'canceled' || $row['status'] == 'failed'){
				continue;
			}
			if(!in_array($row['status'], array('booked','pending_reveal','sold'), true)){
				continue;
			}

			$is_book       = ($row['status'] == 'booked');
			$cancel_action = $is_book ? 'bookCancel' : 'cancel';

			//리스트 표시용 공통 필드
			$item = array(
				'ordno'       => $row['ordno'],
				'settle_no'   => isset($oi['settle_no'])   ? $oi['settle_no']        : '',
				'reg_date'    => isset($oi['reg_date'])    ? $oi['reg_date']         : '',
				'm_id'        => isset($oi['m_id'])        ? $oi['m_id']             : '',
				'total_price' => isset($oi['total_price']) ? (int)$oi['total_price'] : 0,
				'va_date'     => isset($oi['va_date'])     ? $fmt_va($oi['va_date']) : '',
				'productID'   => $row['productID'],
				'name'        => isset($row['Name']) ? $row['Name'] : '',
				'operationID' => $row['operationID'],
				'status'      => $row['status'],
				'action'      => $cancel_action,
				'result'      => 'preview',
				'message'     => $is_book ? 'runBookCancel 예정' : 'runOperationCancel 예정',
			);

			//미리보기 — API 호출 없이 대상만 보고
			if($dry_run){
				$response['items'][] = $item;
				continue;
			}

			//실행 — 어드민 취소(order_ps.php)와 동일 로직
			if($is_book){
				$result = $pointnexus->runBookCancel($row['operationID']);
			}else{
				$result = $pointnexus->runOperationCancel($row['operationID']);
			}

			if(!empty($result->success)){
				//새 operationID는 원본과 다를 때만 사용(runBookCancel은 빈 응답, operationCancel은 에코 가능) — 같거나 없으면 NULL (uk_op 충돌 방지). parent_operationID로 원본 링크 유지.
				$resp_opid = isset($result->data->operationID) ? $result->data->operationID : null;
				$new_opid  = ($resp_opid !== null && $resp_opid !== $row['operationID']) ? $resp_opid : null;
				$cancel_status = $is_book ? 'canceled' : 'cancel_pending'; //booked=동기 반납 즉시 canceled / operationCancel=비동기 → cancel_pending(검증배치가 확정)
				OrderFulfillment_PointNexus::insertLogRow(
					$conn,
					$row,
					$cancel_action,
					$new_opid,
					$cancel_status,
					array(
						'raw_response' => json_encode($result, JSON_UNESCAPED_UNICODE),
					)
				);
				$response['canceled_ok']++;
				$item['result']  = 'ok';
				$item['message'] = 'canceled (new op: '.$new_opid.')';
			}else{
				$response['canceled_fail']++;
				$item['result']  = 'fail';
				$item['message'] = pn_extract_error($result, 'cancel 실패');
			}
			$response['items'][] = $item;
		}
	}

	$response['success'] = true;
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
	exit;

} catch (Exception $e) {
	$response['error'] = $e->getMessage();
	echo json_encode($response, JSON_UNESCAPED_UNICODE);
	exit;
}
?>
