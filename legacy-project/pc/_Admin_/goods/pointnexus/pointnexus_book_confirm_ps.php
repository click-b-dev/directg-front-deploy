<?
//PointNexus Book Confirm 처리(PRG) — pointnexus_book_confirm.php 의 confirm/cancel 액션 전용 처리 파일.
//필터(mode/ordno/m_id/page)는 GET, 액션(action/idx)은 POST로 받아 처리 후 목록 페이지로 redirect.
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');

//필터 (redirect 시 보존)
$mode    = filter_input(INPUT_GET, "mode",  FILTER_SANITIZE_STRING);
$f_ordno = filter_input(INPUT_GET, "ordno", FILTER_SANITIZE_STRING);
$f_m_id  = filter_input(INPUT_GET, "m_id",  FILTER_SANITIZE_STRING);
$page    = (int)filter_input(INPUT_GET, "page", FILTER_SANITIZE_NUMBER_INT);
if($page < 1) $page = 1;

//POST 액션
$action   = filter_input(INPUT_POST, "action", FILTER_SANITIZE_STRING);
$post_idx = (int)filter_input(INPUT_POST, "idx", FILTER_SANITIZE_NUMBER_INT);

$ret_flash = "";
$ret_type  = "";

if($action == "confirm" || $action == "cancel"){
	try {
		$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		//대상 행 조회 — 전체 컬럼 (INSERT 헬퍼에 source로 전달)
		$stmt = $conn->prepare("SELECT * FROM tbl_order_item_pointnexus WHERE idx=:idx");
		$stmt->execute(array(":idx" => $post_idx));
		$row = $stmt->fetch(PDO::FETCH_ASSOC);

		//Race condition 가드 — 이 row가 (ordno, productID) 체인의 최신인지 확인
		$is_latest = false;
		if($row){
			$chk = $conn->prepare("SELECT MAX(idx) FROM tbl_order_item_pointnexus WHERE ordno=:ordno AND productID=:productID");
			$chk->execute(array(':ordno'=>$row['ordno'], ':productID'=>$row['productID']));
			$is_latest = ((int)$chk->fetchColumn() === (int)$row['idx']);
		}

		if(!$row){
			$ret_flash = "대상 행을 찾을 수 없습니다. (idx=".$post_idx.")";
			$ret_type  = "danger";
		} else if(!$is_latest){
			$ret_flash = "이미 다른 처리가 진행되어 더 이상 최신 상태가 아닙니다. 목록 새로고침 후 다시 시도하세요.";
			$ret_type  = "warning";
		} else if($row['action'] != 'book' || $row['status'] != 'booked'){
			$ret_flash = "처리 가능한 상태가 아닙니다. 현재 action=".$row['action'].", status=".$row['status'];
			$ret_type  = "warning";
		} else if(empty($row['operationID'])){
			$ret_flash = "operationID 가 비어있어 호출할 수 없습니다.";
			$ret_type  = "danger";
		} else {
			$row_mode = ($row['mode'] == 'prod') ? 'prod' : 'test';
			$pointnexus = new PointNexus($row_mode);

			if($action == "confirm"){
				$pn_result = $pointnexus->runBookConfirm($row['operationID']);

				if(!empty($pn_result->success) && !empty($pn_result->data->license->key)){
					$op = $pn_result->data;
					$new_opid = isset($op->operationID) ? $op->operationID : null; //새 op 없으면 NULL (book op 재사용 시 uk_op 충돌). parent_operationID로 book op 링크 유지.

					OrderFulfillment_PointNexus::insertLogRow(
						$conn,
						$row,
						'confirm',
						$new_opid,
						'confirmed',
						array(
							'license_key'       => $op->license->key,
							'license_type'      => isset($op->license->type) ? $op->license->type : '',
							'license_platform'  => isset($op->license->platform) ? $op->license->platform : '',
							'license_countries' => isset($op->license->countries) ? json_encode($op->license->countries, JSON_UNESCAPED_UNICODE) : '',
							'capsule_id'        => isset($op->capsule->id) ? $op->capsule->id : '',
							'raw_response'      => json_encode($pn_result, JSON_UNESCAPED_UNICODE),
						)
					);

					$ret_flash = "Confirm 완료: ordno=".$row['ordno'].", license_key=".$op->license->key;
					$ret_type  = "success";
				} else {
					$ret_flash = "Confirm 실패: ".pn_extract_error($pn_result, 'license.key 가 응답에 없습니다.');
					$ret_type  = "danger";
				}

			} else if($action == "cancel"){
				$pn_result = $pointnexus->runBookCancel($row['operationID']);

				if(!empty($pn_result->success)){
					//runBookCancel 응답에는 새 operationID 가 없을 수 있음 — 없으면 NULL (book op 재사용 시 uk_op 충돌). parent_operationID로 book op 링크 유지.
					$new_opid = isset($pn_result->data->operationID) ? $pn_result->data->operationID : null;

					OrderFulfillment_PointNexus::insertLogRow(
						$conn,
						$row,
						'bookCancel',
						$new_opid,
						'canceled',
						array(
							'raw_response' => json_encode($pn_result, JSON_UNESCAPED_UNICODE),
						)
					);

					$ret_flash = "Cancel 완료: ordno=".$row['ordno'];
					$ret_type  = "success";
				} else {
					//runBookCancel 실패 — book이 14일 만료/이미취소로 PointNexus에서 종료됐는지 GET operation으로 검증 후 정리.
					//(취소된 오퍼레이션도 GET으로 조회되므로 state로 판별. 404 등 미확인 응답은 강제 정리하지 않음)
					$op_state      = '';
					$verified_gone = false;
					$op_result     = null;
					try {
						$op_result = $pointnexus->runOperation($row['operationID']);
						if(!empty($op_result->success) && !empty($op_result->data)){
							$op_data  = is_array($op_result->data) ? $op_result->data[0] : $op_result->data;
							$op_state = isset($op_data->state) ? strtolower($op_data->state) : '';
							//종료(소멸) 상태 — 취소/만료/오류
							if(in_array($op_state, array('cancelled','canceled','cancelling','expired','error'), true)){
								$verified_gone = true;
							}
						}
					} catch (Exception $e) {
						$op_state = 'verify_error';
					}

					if($verified_gone){
						//소멸 확인 → DB를 canceled로 강제 정리 (일반 cancel과 구분: action='forceCancel')
						OrderFulfillment_PointNexus::insertLogRow(
							$conn,
							$row,
							'forceCancel',
							null,
							'canceled',
							array(
								'raw_request'  => 'runBookCancel 실패 → GET operation 검증(state='.$op_state.') 후 로컬 강제 정리',
								'raw_response' => json_encode(array('cancel'=>$pn_result, 'operation'=>$op_result), JSON_UNESCAPED_UNICODE),
							)
						);
						$ret_flash = "Cancel 실패했으나 book 종료(state=".$op_state.") 확인 → 로컬 정리 완료: ordno=".$row['ordno'];
						$ret_type  = "success";
					} else {
						//active 이거나 검증 불가 → 강제 정리 금지
						$ret_flash = "Cancel 실패: ".pn_extract_error($pn_result)." (book 검증 state=".($op_state !== '' ? $op_state : 'unknown').") — 아직 종료 안 됨/검증 불가로 정리하지 않음. 잠시 후 다시 시도하세요.";
						$ret_type  = "warning";
					}
				}
			}
		}

	} catch (PDOException $e) {
		$ret_flash = "DB 오류: ".$e->getMessage();
		$ret_type  = "danger";
	} catch (Exception $e) {
		$ret_flash = "API 호출 오류: ".$e->getMessage();
		$ret_type  = "danger";
	}
} else {
	$ret_flash = "잘못된 접근입니다. (action 누락)";
	$ret_type  = "danger";
}

//PRG redirect — 목록 페이지로 (필터 보존)
$qs = http_build_query(array(
	'mode'       => $mode,
	'ordno'      => $f_ordno,
	'm_id'       => $f_m_id,
	'page'       => $page,
	'flash'      => $ret_flash,
	'flash_type' => $ret_type,
));
header("Location: pointnexus_book_confirm.php?".$qs);
exit;
?>
