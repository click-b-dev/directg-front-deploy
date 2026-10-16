<?
//PointNexus 비동기 취소(operationCancel) 결과 검증 배치 — AJAX 엔드포인트
//대상: tbl_order_item_pointnexus 최신 row가 status='cancel_pending' 인 건 (어드민취소 order_ps.php / VCNT배치가 접수한 operationCancel)
//처리: OrderFulfillment_PointNexus::resolveCancelPending() 공용 헬퍼로 GET /operation 조회 후 확정
//      done → canceled(+주문상품 취소완료9) / error → cancel_failed(수동확인) / 그 외 → 보류
//기록: 같은 취소 op의 비동기 상태 확정이므로 append 아닌 UPDATE(status/update_date, raw_response에 accept+verify 병합)
//멱등성: 최신 row가 cancel_pending 인 건만 선정 → 확정되면(canceled/cancel_failed) 재선정 안 됨
//주의: 이 서버는 cron 미사용. 관리자 수동 실행 페이지(pointnexus_cancel_verify.php) 및 order_view 자동검증으로 트리거됨.
header('Content-Type: application/json; charset=UTF-8');
ini_set("display_errors", 0);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');

$mode    = filter_input(INPUT_POST, "mode",    FILTER_SANITIZE_STRING);
$limit   = (int)filter_input(INPUT_POST, "limit",   FILTER_SANITIZE_NUMBER_INT);
$dry_run = (int)filter_input(INPUT_POST, "dry_run", FILTER_SANITIZE_NUMBER_INT);

$mode = pn_normalize_mode($mode);
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
	"count"         => 0,      //이번 호출에서 검사한 cancel_pending row 수
	"has_more"      => false,
	"resolved_ok"   => 0,      //canceled 확정
	"resolved_fail" => 0,      //cancel_failed 확정
	"still_pending" => 0,      //아직 처리중 → 보류
	"items"         => array(),
	"error"         => null,
);

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//최신 row가 cancel_pending 인 건 (operationID 필수 — GET /operation 조회 대상)
	$cand_query = "
		SELECT pn.idx, pn.ordno, pn.productID, pn.Name, pn.operationID, pn.parent_operationID, pn.mode, pn.raw_response
		FROM tbl_order_item_pointnexus pn
		INNER JOIN (
			SELECT ordno, productID, MAX(idx) AS max_idx
			FROM tbl_order_item_pointnexus
			WHERE mode = :mode
			GROUP BY ordno, productID
		) latest ON latest.ordno = pn.ordno AND latest.productID = pn.productID AND latest.max_idx = pn.idx
		WHERE pn.status = 'cancel_pending'
		  AND pn.operationID IS NOT NULL AND pn.operationID != ''
		ORDER BY pn.idx
		LIMIT ".((int)$limit + 1);
	$cand_stmt = $conn->prepare($cand_query);
	$cand_stmt->execute(array(':mode' => $mode));
	$rows = $cand_stmt->fetchAll(PDO::FETCH_ASSOC);

	if(count($rows) > $limit){
		$response['has_more'] = true;
		$rows = array_slice($rows, 0, $limit);
	}
	$response['count'] = count($rows);

	if($response['count'] === 0){
		$response['success'] = true;
		echo json_encode($response, JSON_UNESCAPED_UNICODE);
		exit;
	}

	$adminOrder = new AdminOrder($conn);
	$pointnexus = $dry_run ? null : new PointNexus($mode);

	foreach($rows as $row){
		//결제번호(settle_no) — 목록 링크용 (ordno = settle_no + "_" + n)
		$settle_no = (strrpos($row['ordno'], '_') !== false) ? substr($row['ordno'], 0, strrpos($row['ordno'], '_')) : $row['ordno'];

		$item = array(
			'idx'         => $row['idx'],
			'ordno'       => $row['ordno'],
			'settle_no'   => $settle_no,
			'productID'   => $row['productID'],
			'name'        => isset($row['Name']) ? $row['Name'] : '',
			'operationID' => $row['operationID'],
			'state'       => '',
			'result'      => 'preview',
			'message'     => 'GET /operation 예정',
		);

		if($dry_run){
			$response['items'][] = $item;
			continue;
		}

		//공용 헬퍼로 검증·확정 (order_view 자동검증과 동일 로직)
		$rv = OrderFulfillment_PointNexus::resolveCancelPending($conn, $pointnexus, $row, $adminOrder);
		$item['state']   = $rv['state'];
		$item['result']  = $rv['result'];
		$item['message'] = $rv['message'];

		if($rv['result'] === 'ok'){
			$response['resolved_ok']++;
		}else if($rv['result'] === 'fail'){
			$response['resolved_fail']++;
		}else{
			$response['still_pending']++;
		}
		$response['items'][] = $item;
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
