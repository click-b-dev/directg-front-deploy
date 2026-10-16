<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_admin.xml');
$logger = Logger::getLogger("pc");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
$admin_id = filter_input(INPUT_POST, 'admin_id', FILTER_SANITIZE_STRING);
$order_system = filter_input(INPUT_POST, 'order_system', FILTER_SANITIZE_STRING);
$delivery_type = filter_input(INPUT_POST, 'delivery_type', FILTER_SANITIZE_STRING);
$memo_gubun = filter_input(INPUT_POST, 'memo_gubun', FILTER_SANITIZE_STRING);
$tracking_no = filter_input(INPUT_POST, 'tracking_no', FILTER_SANITIZE_STRING);
$escw_yn = filter_input(INPUT_POST, 'escw_yn', FILTER_SANITIZE_STRING);
$payment_method = filter_input(INPUT_POST, 'payment_method', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	switch($mode){
		case "payco_refund":
			$orderNo = filter_input(INPUT_POST, 'orderNo', FILTER_SANITIZE_STRING);
			$cancelTotalAmt = filter_input(INPUT_POST, 'cancelTotalAmt', FILTER_SANITIZE_STRING);
			$orderCertifyKey = filter_input(INPUT_POST, 'orderCertifyKey', FILTER_SANITIZE_STRING);
		
			$params = array(
				"orderNo"=>$orderNo,
				"cancelTotalAmt"=>$cancelTotalAmt,
				"orderCertifyKey"=>$orderCertifyKey,
			);
			
			$logger->info($_SESSION['admin']["admin_id"]);
			$logger->info($params);
			
			$paycoPG = new PaycoPG("");
			$Result = $paycoPG->paycoCancel($params);
			
			$Read_Data = json_decode( $Result, true ); 
			
			//페이코 결제취소 로그 저장
			$query = "insert into payco_log_cancel set sellerOrderReferenceKey=:sellerOrderReferenceKey,code=:code,message=:message,result=:result,reg_date=now()";
			$stmt = $conn->prepare($query);
			$params = array(
				"sellerOrderReferenceKey"=>$settle_no,
				"code"=>$Read_Data["code"],
				"message"=>$Read_Data["message"],
				"result"=>json_encode($Read_Data["result"]),
			);
			$logger->info($params);
			$stmt->execute($params);
			
			if($Read_Data["message"]=="success"){
				//주문서 결제취소 업데이트 
				$u_query="update tbl_order set step='9',cancel_date=now() where settle_no=:settle_no";
				$stmt = $conn->prepare($u_query);
				$params = array(
					"settle_no"=>$settle_no,
				);
				$logger->info($params);
				$stmt->execute($params);
				
				//결제로그
				$i_query="insert into tbl_order_log set settle_no=:settle_no,memo=:memo,admin_id=:admin_id,reg_date=now()";
				$stmt = $conn->prepare($i_query);
				$params = array(
					"settle_no"=>$settle_no,
					"memo"=>"[".$orderNo."] PAYCO 결제취소 완료",
					"admin_id"=>$_SESSION['admin']["admin_id"],
				);
				$logger->info($params);
				$stmt->execute($params);
			}
			
		break;
		case "payco_cancel":
			$orderNo = filter_input(INPUT_POST, 'orderNo', FILTER_SANITIZE_STRING);
			$cancelTotalAmt = filter_input(INPUT_POST, 'cancelTotalAmt', FILTER_SANITIZE_STRING);
			$orderCertifyKey = filter_input(INPUT_POST, 'orderCertifyKey', FILTER_SANITIZE_STRING);
		
			$params = array(
				"orderNo"=>$orderNo,
				"cancelTotalAmt"=>$cancelTotalAmt,
				"orderCertifyKey"=>$orderCertifyKey,
			);
			
			$logger->info($_SESSION['admin']["admin_id"]);
			$logger->info($params);

			//페이코 결제취소 로그 저장
			$query = "insert into payco_log_cancel set sellerOrderReferenceKey=:sellerOrderReferenceKey,code=:code,message=:message,reg_date=now()";
			$stmt = $conn->prepare($query);
			$params = array(
				"sellerOrderReferenceKey"=>$settle_no,
				"code"=>"9999",
				"message"=>"[관리자 취소] 입금일 만료"
			);
			$logger->info($params);
			$stmt->execute($params);
			

			//주문서 결제취소 업데이트 
			$u_query="update tbl_order set step='9',cancel_date=now() where settle_no=:settle_no";
			$stmt = $conn->prepare($u_query);
			$params = array(
				"settle_no"=>$settle_no,
			);
			$logger->info($params);
			$stmt->execute($params);
			
			//결제로그
			$i_query="insert into tbl_order_log set settle_no=:settle_no,memo=:memo,admin_id=:admin_id,reg_date=now()";
			$stmt = $conn->prepare($i_query);
			$params = array(
				"settle_no"=>$settle_no,
				"memo"=>"[".$orderNo."] PAYCO 결제취소 완료",
				"admin_id"=>$_SESSION['admin']["admin_id"],
			);
			$logger->info($params);
			$stmt->execute($params);
			
		break;
		case "payco_refund_test":
			//[테스트 전용] PayCo test(alpha) 모드 결제취소 — 전액/부분. 주문상태(step)는 변경하지 않고 API 응답만 확인.
			$orderNo = filter_input(INPUT_POST, 'orderNo', FILTER_SANITIZE_STRING);
			$cancelTotalAmt = filter_input(INPUT_POST, 'cancelTotalAmt', FILTER_SANITIZE_STRING);
			$orderCertifyKey = filter_input(INPUT_POST, 'orderCertifyKey', FILTER_SANITIZE_STRING);

			$params = array(
				"orderNo"=>$orderNo,
				"cancelTotalAmt"=>$cancelTotalAmt,
				"orderCertifyKey"=>$orderCertifyKey,
			);

			$logger->info("[payco_refund_test] ".$_SESSION['admin']["admin_id"]);
			$logger->info($params);

			$paycoPG = new PaycoPG("test");
			$Result = $paycoPG->paycoCancel($params);
			$Read_Data = json_decode( $Result, true );

			//테스트 취소 로그 저장
			$query = "insert into payco_log_cancel set sellerOrderReferenceKey=:sellerOrderReferenceKey,code=:code,message=:message,result=:result,reg_date=now()";
			$stmt = $conn->prepare($query);
			$params = array(
				"sellerOrderReferenceKey"=>$settle_no,
				"code"=>$Read_Data["code"],
				"message"=>$Read_Data["message"],
				"result"=>json_encode($Read_Data["result"]),
			);
			$logger->info($params);
			$stmt->execute($params);

			if($Read_Data["message"]=="success"){
				$total_amt = filter_input(INPUT_POST, 'total_amt', FILTER_SANITIZE_STRING);
				$is_full = ((int)$cancelTotalAmt >= (int)$total_amt);

				if($is_full){
					//전액취소 → 운영과 동일하게 주문 취소완료(step=9) 처리
					$u_query="update tbl_order set step='9',cancel_date=now() where settle_no=:settle_no";
					$stmt = $conn->prepare($u_query);
					$stmt->execute(array("settle_no"=>$settle_no));
					$memo = "[".$orderNo."] PAYCO 결제취소 완료(테스트/전액 ".number_format($cancelTotalAmt)."원)";
				}else{
					//부분취소 → 주문상태(step)는 유지, 이력만 기록
					$memo = "[".$orderNo."] PAYCO 부분취소(테스트 ".number_format($cancelTotalAmt)."원)";
				}

				$i_query="insert into tbl_order_log set settle_no=:settle_no,memo=:memo,admin_id=:admin_id,reg_date=now()";
				$stmt = $conn->prepare($i_query);
				$stmt->execute(array(
					"settle_no"=>$settle_no,
					"memo"=>$memo,
					"admin_id"=>$_SESSION['admin']["admin_id"],
				));

				//연속 부분취소 지원: PayCo가 새로 발급한 orderCertifyKey를 payco_log에 갱신 (다음 취소 요청 시 사용)
				$new_key = isset($Read_Data["result"]["orderCertifyKey"]) ? $Read_Data["result"]["orderCertifyKey"] : "";
				if($new_key != ""){
					$k_query = "update payco_log set orderCertifyKey=:orderCertifyKey where sellerOrderReferenceKey=:settle_no";
					$stmt = $conn->prepare($k_query);
					$stmt->execute(array("orderCertifyKey"=>$new_key, "settle_no"=>$settle_no));
				}
			}

			//PayCo 응답 원문을 반환해 화면에서 확인.
			echo $Result;
		break;
		case "kcp_refund":
			$mod_type = filter_input(INPUT_POST, 'mod_type', FILTER_SANITIZE_STRING);
			$tno = filter_input(INPUT_POST, 'tno', FILTER_SANITIZE_STRING);
			$logger->info($_POST);
			$kcp = new Kcp("");
			
			$params = array(
				"tno"=>$tno,
				"mod_type"=>$mod_type
			);
			$res_data = $kcp->cancelPayment($params);
			$logger->info($res_data);
			$json_res = json_decode($res_data, true);
			$res_cd = $json_res["res_cd"];
			$res_msg = $json_res["res_msg"];
			
			$logger->info($res_data);
			if( $res_cd == "0000" || $res_cd == "8332"){
				//주문서 결제취소 업데이트 
				$u_query="update tbl_order set step='9',cancel_date=now() where settle_no=:settle_no";
				$stmt = $conn->prepare($u_query);
				$params = array(
					"settle_no"=>$settle_no,
				);
				$logger->info($params);
				$stmt->execute($params);
				
				//결제로그
				$i_query="insert into tbl_order_log set settle_no=:settle_no,memo=:memo,admin_id=:admin_id,reg_date=now()";
				$stmt = $conn->prepare($i_query);
				$params = array(
					"settle_no"=>$settle_no,
					"memo"=>"[".$tno."] KCP 결제취소 완료",
					"admin_id"=>$_SESSION['admin']["admin_id"],
				);
				$logger->info($params);
				$stmt->execute($params);
			}
			
		break;
		case "toss_adapter_refund":
			$mod_type = filter_input(INPUT_POST, 'mod_type', FILTER_SANITIZE_STRING);
			$tno = filter_input(INPUT_POST, 'tno', FILTER_SANITIZE_STRING);
			$logger->info($_POST);
			$toss = new Tossadapter("");
			
			$params = array(
				"tno"=>$tno,
				"mod_type"=>$mod_type
			);
			$res_data = $toss->cancelPayment($params);
			$logger->info($res_data);
			$json_res = json_decode($res_data, true);
			$res_cd = $json_res["res_cd"];
			$res_msg = $json_res["res_msg"];
			
			$logger->info($res_data);
			if( $res_cd == "0000"){
				//주문서 결제취소 업데이트 
				$u_query="update tbl_order set step='9',cancel_date=now() where settle_no=:settle_no";
				$stmt = $conn->prepare($u_query);
				$params = array(
					"settle_no"=>$settle_no,
				);
				$logger->info($params);
				$stmt->execute($params);
				
				//결제로그
				$i_query="insert into tbl_order_log set settle_no=:settle_no,memo=:memo,admin_id=:admin_id,reg_date=now()";
				$stmt = $conn->prepare($i_query);
				$params = array(
					"settle_no"=>$settle_no,
					"memo"=>"[".$tno."] 토스 결제취소 완료",
					"admin_id"=>$_SESSION['admin']["admin_id"],
				);
				$logger->info($params);
				$stmt->execute($params);
			}
			
		break;
		case "toss_refund":
			$paymentKey = filter_input(INPUT_POST, 'paymentKey', FILTER_SANITIZE_STRING);
			$cancelAmount = filter_input(INPUT_POST, 'cancelAmount', FILTER_SANITIZE_STRING);
		
			$logger->info($_POST);
			$toss = new Toss("");
			$adminOrder= new AdminOrder($conn);
			
			$params = array(
				"paymentKey"=>$paymentKey,
				"settle_no"=>$settle_no
			);
			
			if($cancelAmount>0){
				$params["cancelAmount"]=$cancelAmount;
			}
			
			$res_data = $toss->cancelPayment($params);
			$logger->info($res_data);
			
			$last_cancel=end($res_data['cancels']);
			
			if( $last_cancel['cancelAmount'] ){
				$query = "UPDATE toss_log SET status=:status,balance_amount=:balance_amount,cancels_info=:cancels_info WHERE payment_key=:payment_key";
				$params = array(
					':status'=>$res_data['status'],
					':balance_amount' => $res_data['balanceAmount'],
					':cancels_info' => json_encode($res_data['cancels'], JSON_UNESCAPED_UNICODE),
					':payment_key' => $paymentKey
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
				
				$message = "토스 결제취소 완료 / 금액: ".$last_cancel['cancelAmount']."/ 처리자:".$_SESSION['admin']["admin_id"];
				$adminOrder->setOrderLog($settle_no, $ordno, $message);
				if($res_data['balanceAmount']==0){
					$adminOrder->cancelOrder($settle_no,"9");
				}
			}
		break;
		case "tosspay_refund":
			//토스페이 환불처리 만들어야 함
			$payToken = filter_input(INPUT_POST, 'payToken', FILTER_SANITIZE_STRING);
			$refundNo = filter_input(INPUT_POST, 'refundNo', FILTER_SANITIZE_STRING);
			$cancelAmount = filter_input(INPUT_POST, 'cancelAmount', FILTER_SANITIZE_STRING);

			$logger->info($_POST);
			$tosspay = new Tosspay("");
			$adminOrder= new AdminOrder($conn);
			
			$params = array(
				"payToken"=>$payToken,
				"refundNo"=>$refundNo,
				"settle_no"=>$settle_no
			);
			
			if($cancelAmount>0){
				$params["amount"]=$cancelAmount;
			}
			
			$res_data = $tosspay->cancelPayment($params);
			$logger->info($res_data);
			
			if( $res_data['code']=="0" ){
				/*
				$query = "UPDATE toss_log SET status=:status,balance_amount=:balance_amount,cancels_info=:cancels_info WHERE payment_key=:payment_key";
				$params = array(
					':status'=>$res_data['status'],
					':balance_amount' => $res_data['balanceAmount'],
					':cancels_info' => json_encode($res_data['cancels'], JSON_UNESCAPED_UNICODE),
					':payment_key' => $paymentKey
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
				*/
				
				$message = "토스페이 결제취소 완료 / 금액: ".$res_data['refundNo']."/ 처리자:".$_SESSION['admin']["admin_id"];
				$adminOrder->setOrderLog($settle_no, $ordno, $message);
				$adminOrder->cancelOrder($settle_no,"9");
			} else {
				
			}
		break;
		case "naverpay_refund":
			$naverpay = new NaverPay('');
			$adminOrder= new AdminOrder($conn);

			$paymentId =filter_input(INPUT_POST,'paymentId',FILTER_SANITIZE_STRING);
			$cancelAmount=filter_input(INPUT_POST,'cancelAmount',FILTER_SANITIZE_NUMBER_INT);
			$merchantPayTransactionKey = "0";
			$cancelReason="고객요청에 의한 관리자 환불조치";
			$cancelRequester="2";
			$taxScopeAmount=$cancelAmount;
			$taxExScopeAmount=0;
			$doCompareRest=0;
			$expectedRestAmount=0;

			$result=$naverpay->naverPayCancel($paymentId,$merchantPayTransactionKey,$cancelAmount,$cancelReason,$cancelRequester,$taxScopeAmount,$taxExScopeAmount,$doCompareRest,$expectedRestAmount);
			if($result->code=="Success"){
				$message = "네이버페이 환불완료 / 금액: ".$cancelAmount."/ 처리자:".$_SESSION['admin']["admin_id"];
				$adminOrder->setOrderLog($settle_no, $ordno, $message);
				$adminOrder->cancelOrder($settle_no,"9");
			}
		break;
		case "point_refund":
			$logger->info($_POST);
			$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
		
			//사용된 포인트 로그 삭제
			$query="delete from tbl_emoney_log where settle_no=:settle_no";
			$stmt = $conn_dgkr->prepare($query);
			$params = array(
				":settle_no"=>$settle_no,
			);
			$stmt->execute($params);

			//주문정보에서 포인트할인 초기화 
			$query="update tbl_order set use_emoney='0' where settle_no=:settle_no";
			$stmt = $conn->prepare($query);
			$params = array(
				":settle_no"=>$settle_no,
			);
			$stmt->execute($params);

			//처리한 관리자 정보 기록
			$memo = "환불로 인한 사용포인트 ".number_format($use_emoney)."원 반환(환불)";
			$query2 = "insert into tbl_order_log set settle_no=:settle_no,memo=:memo,admin_id=:admin_id,reg_date=now()";
			$stmt = $conn->prepare($query2);
			$params = array(
				":settle_no"=>$settle_no,
				":memo"=>$memo,
				"admin_id"=>$_SESSION['admin']["admin_id"],
			);
			$stmt->execute($params);
		break;
		case "order_refund":
			$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
		
			//사용된 포인트 로그 삭제
			$query="delete from tbl_emoney_log where settle_no=:settle_no";
			$stmt = $conn_dgkr->prepare($query);
			$params = array(
				":settle_no"=>$settle_no,
			);
			$stmt->execute($params);

			//주문정보에서 포인트할인 초기화 
			$query="UPDATE tbl_order SET use_emoney='0',step='9',cancel_date=NOW() WHERE settle_no=:settle_no";
			$stmt = $conn->prepare($query);
			$params = array(
				":settle_no"=>$settle_no,
			);
			$stmt->execute($params);

			//처리한 관리자 정보 기록
			$memo = "[결제취소] 환불로 인한 사용포인트 ".number_format($use_emoney)."원 반환(환불)";
			$query2 = "insert into tbl_order_log set settle_no=:settle_no,memo=:memo,admin_id=:admin_id,reg_date=now()";
			$stmt = $conn->prepare($query2);
			$params = array(
				":settle_no"=>$settle_no,
				":memo"=>$memo,
				"admin_id"=>$_SESSION['admin']["admin_id"],
			);
			$stmt->execute($params);
		break;
		case "order_item_cancel":
			$adminOrder= new AdminOrder($conn);
			$message = "주문취소완료 / ".$message." / 처리자:".$admin_id;
			//PointNexus는 취소 API 성공을 확인한 뒤 아래 case "PointNexus"에서 취소완료 처리 (성공여부 무관 취소 방지)
			if($order_system != "PointNexus"){
				$adminOrder->setOrderLog($settle_no, $ordno, $message);
				$adminOrder->cancelOrderItem($ordno,"9");
			}
			
			if($delivery_type=="2"||$delivery_type=="3"){
				$shipment_item = $adminOrder->getOrderItemDelivery($ordno);
				foreach ($shipment_item as $value) {
					$adminOrder->updateOrderItemDelivery($ordno, "9");
				}
			}
			
			if($delivery_type=="1"||$delivery_type=="3"){
				switch($order_system){
					case "Asset":
						$asset = new Asset("");
						$order_item = $adminOrder->getOrderItemAsset($ordno);
						print_r($order_item);
						foreach ($order_item as $value) {
							print_r($value);
							if($value['reserve_id']){
								$asset->runReserveCancel($value['reserve_id']);
							}
						}
					break;
					case "Ztorm":
						$order_item = $adminOrder->getOrderItemZtorm($ordno);
					/*
						foreach ($order_item as $value) {
							if(){
								
							}
						}
						*/
					break;
					case "Genba":
						$order_item = $adminOrder->getOrderItemGenba($ordno);
						$genba = new Genba("Live");
						foreach ($order_item as $value) {
							if($value['ID']){
								$response = $genba->runGenbaPerformOrderActionAsync($value['ID']);
								if($response->State=="3"){
									$adminOrder->cancelOrderItemGenba($value['ID'],$response->State);
								}
							}
						}
					break;
					case "Vaultn":
						$order_item = $adminOrder->getOrderItemVaultn($ordno);
						$vaultn = new Vaultn();
						foreach ($order_item as $value) {
							if($value['orderId']){
								$result = $vaultn->runCancelOrder($value['orderId']);
								if($result->isSuccess==true || ($result->code==1 && $result->message=="order is already cancelled")){
									$adminOrder->cancelOrderItemVaultn($value['orderId'],"Cancelled");
								}
							}
						}
					break;
					case "PointNexus":
						//(ordno, productID)별 최신 row만 가져옴 — append-only 모델에서 현재 상태 기준
						$pn_fail = false;    //취소 API POST 실패 항목
						$pn_pending = false; //operationCancel 접수 — 비동기 검증 대기(cancel_pending)
						$pn_fail_resp = "";
						$order_item = $adminOrder->getActiveOrderItemPointNexus($ordno);
						$pointnexus = new PointNexus(); //mode 미지정 → PointNexus::DEFAULT_MODE (운영 전환은 PointNexus.php 한 줄)
						foreach ($order_item as $value) {
							//op(환불 op)와 parent_op(주문 op) 둘 다 없을 때만 skip — POST실패로 남긴 cancel_failed(op=NULL, parent=주문op)는 재시도 대상
							if(empty($value['operationID']) && empty($value['parent_operationID'])){
								continue;
							}
							//이미 종료된 상태는 skip
							if($value['status']=='canceled' || $value['status']=='failed'){
								continue;
							}
							if($value['status']=='cancel_pending'){ $pn_pending = true; continue; } //이미 검증 대기중
							//취소 대상 op — 최초 취소는 자기 op, cancel_failed 재시도는 원본(parent) op을 다시 취소 (getActive 최신=실패row라 재시도 불가 방지)
							if($value['status']=='cancel_failed'){
								$target_op = !empty($value['parent_operationID']) ? $value['parent_operationID'] : $value['operationID'];
							}else{
								$target_op = $value['operationID'];
							}
							//booked → runBookCancel(동기), 그 외(sold/confirmed/pending_reveal/cancel_failed 재시도) → runOperationCancel(비동기)
							if($value['status']=='booked'){
								$result = $pointnexus->runBookCancel($target_op);
								$cancel_action = 'bookCancel';
								$is_async = false;
							}else{
								$result = $pointnexus->runOperationCancel($target_op);
								$cancel_action = 'cancel';
								$is_async = true;
							}
							if(!empty($result->success)){
								//응답의 새 operationID 추출 — data가 객체({operationID})/배열([{operationID}]) 둘 다 대응
								//원본과 다를 때만 사용(bookCancel은 빈 응답, operationCancel은 에코 가능) — 같거나 없으면 NULL (uk_op 충돌 방지). parent_operationID로 원본 링크 유지.
								$new_opid = null;
								if($cancel_action === 'cancel' && !empty($result->data)){
									if(is_array($result->data)){
										if(isset($result->data[0]->operationID) && $result->data[0]->operationID !== $target_op) $new_opid = $result->data[0]->operationID;
									} elseif(isset($result->data->operationID) && $result->data->operationID !== $target_op){
										$new_opid = $result->data->operationID;
									}
								}
								//bookCancel(동기)=canceled 즉시 / operationCancel(비동기)=cancel_pending(검증배치가 done/error 확정)
								$cancel_status = $is_async ? 'cancel_pending' : 'canceled';
								//parent_operationID를 취소대상 op($target_op=원본)로 고정 — 재시도해도 원본 링크 유지(재재시도 가능)
								$src = $value;
								$src['operationID'] = $target_op;
								OrderFulfillment_PointNexus::insertLogRow(
									$conn,
									$src,
									$cancel_action,
									$new_opid,
									$cancel_status,
									array(
										'raw_response' => json_encode($result, JSON_UNESCAPED_UNICODE),
									)
								);
								if($is_async){ $pn_pending = true; }
							}else{
								//이미 취소됨 판정 — PointNexus 재취소 불가 응답(code=KEY008 "... operation already cancelled")
								$pn_already = false;
								if(!empty($result->errors) && is_array($result->errors)){
									foreach($result->errors as $pn_err){
										if((isset($pn_err->code) && $pn_err->code=='KEY008')
											|| (isset($pn_err->message) && stripos($pn_err->message,'already cancelled')!==false)){
											$pn_already = true; break;
										}
									}
								}
								$src = $value;
								$src['operationID'] = $target_op;
								if($pn_already){
									//이미 취소된 주문 — 로컬도 canceled로 확정(재시도 보류 대상 아님). pn_fail 미설정 → 다른 이상 없으면 취소완료(9)
									OrderFulfillment_PointNexus::insertLogRow(
										$conn,
										$src,
										$cancel_action,
										null,
										'canceled',
										array(
											'raw_response' => json_encode($result, JSON_UNESCAPED_UNICODE),
										)
									);
									$adminOrder->setOrderLog($settle_no, $ordno, "[PointNexus] 이미 취소된 주문(KEY008) — canceled 확정 (op=".$target_op.")");
								}else{
									//취소 API POST 실패 — 추적/재시도 위해 cancel_failed row 기록.
									//환불 op는 접수 실패라 존재하지 않음 → operationID=NULL(uk_op 회피), 취소 대상 주문 op는 parent_operationID(src)에 보존, 실패응답은 raw_response에.
									OrderFulfillment_PointNexus::insertLogRow(
										$conn,
										$src,
										$cancel_action,
										null,
										'cancel_failed',
										array(
											'raw_response' => json_encode($result, JSON_UNESCAPED_UNICODE),
										)
									);
									$pn_fail = true;
									$pn_fail_resp = json_encode($result, JSON_UNESCAPED_UNICODE);
								}
							}
						}
						//확정 규칙: 실패 있으면 보류(재시도) / 비동기 대기(cancel_pending) 있으면 검증배치가 done 확인 후 처리 / 그 외 전부 동기완료면 즉시 취소완료(9)
						if($pn_fail){
							$adminOrder->setOrderLog($settle_no, $ordno, "[PointNexus] 취소 API 실패 — 취소완료 처리 안 함(재시도 필요) resp=".$pn_fail_resp." / 처리자:".$admin_id);
						}elseif($pn_pending){
							$adminOrder->setOrderLog($settle_no, $ordno, "[PointNexus] 취소요청 접수(cancel_pending) — 비동기 처리 검증 대기중. 검증배치 완료(done) 후 취소완료 처리 / 처리자:".$admin_id);
						}else{
							$adminOrder->setOrderLog($settle_no, $ordno, $message);
							$adminOrder->cancelOrderItem($ordno,"9");
						}
					break;
				}
			}
		break;
		case "resend":
			//결제완료 후 키발급 실패건 재발송 — 결제흐름의 발급 로직만 차용(세션 없이 DB에서 컨텍스트 재구성)
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //발급 핸들러는 예외모드 전제 (resend 단일 실행이라 안전)
			$adminOrder = new AdminOrder($conn);
			$order      = new Order($conn);
			$order_repo = new OrderRepository($conn, $logger);
			$list_url   = "/_Admin_/order/order_view.php?settle_no=".$settle_no;

			$order_info = $order->getOrder($settle_no);
			$item       = $order->getOrderItemOption($ordno);

			if(!$order_info || !$item || $item['settle_no'] != $settle_no){
				msg("주문 정보를 찾을 수 없습니다.", -1); exit;
			}

			//가드: 결제완료(step=2)+발송실패(fail)+주문대기(status=1)+미수령(is_actv≠1)
			if($order_info['step'] != '2' || $item['send_status'] != 'fail' || $item['status'] != '1' || $item['is_actv'] == '1'){
				msg("재발송 대상이 아닙니다. 이미 처리·수령되었거나 취소된 주문입니다.", $list_url); exit;
			}

			//디지털 발송(1/3)만 대상
			if($item['delivery_type'] != '1' && $item['delivery_type'] != '3'){
				msg("디지털 발송 상품이 아니어서 재발송 대상이 아닙니다.", $list_url); exit;
			}

			//API 클라이언트 + 발송 디스패처 (결제흐름과 동일 구성)
			$asset      = new Asset();
			$ztorm      = new Ztorm();
			$vaultn     = new Vaultn();
			$genba      = new Genba("Live");
			$pointnexus = new PointNexus();
			$fulfillment = new OrderFulfillment($conn, array(
				'asset'=>$asset, 'ztorm'=>$ztorm, 'vaultn'=>$vaultn, 'genba'=>$genba, 'pointnexus'=>$pointnexus
			), $logger);

			//payment_info 재구성 — 세션 없음 → DB. 결제완료건이라 즉시발급(비-VCNT).
			$payment_info = array(
				'pay_type'       => 'PACA', //결제완료건 재발송 → 즉시발급(VCNT 입금대기 분기 회피)
				'ip'             => isset($order_info['ip']) ? $order_info['ip'] : '',
				'm_no'           => $item['m_no'],
				'm_id'           => $item['m_id'],
				'name'           => isset($order_info['buyr_name']) ? $order_info['buyr_name'] : '',
				'nickname'       => '',
				'payment_method' => isset($order_info['pg_provider']) ? $order_info['pg_provider'] : '',
				'pg'             => isset($order_info['pg_provider']) ? $order_info['pg_provider'] : '',
			);

			$delivery_item_list = $order->getGoodsItemDelivery($item['product_code']);
			if(!$delivery_item_list){
				msg("배송 아이템 정보가 없습니다.", $list_url); exit;
			}

			//동시 재발송 방지 — send_status 'fail'→'processing' 원자적 선점.
			//경쟁하는 두 요청 중 UPDATE가 매칭되는 한 명(rowCount=1)만 통과, 나머지(rowCount=0)는 중단 → 두번째 API 호출 자체를 차단.
			$claim = $conn->prepare("update tbl_order_item set send_status='processing' where ordno=:ordno and send_status='fail'");
			$claim->execute(array(':ordno'=>$ordno));
			if($claim->rowCount() == 0){
				msg("이미 다른 관리자가 재발송을 처리 중이거나 완료된 주문입니다.", $list_url); exit;
			}

			$resend_status = $item['status'];
			$resend_send   = $item['send_status'];
			$resend_system = '';
			try {
				foreach($delivery_item_list as $sub_value){
					$res = $fulfillment->processItem($sub_value['order_system'], $item, $sub_value, $payment_info);
					$resend_status = $res['order_status'];
					$resend_send   = $res['send_status'];
					$resend_system = $res['order_system'];
				}
				$order_repo->updateItemStatus($ordno, $resend_status, $resend_send, $resend_system);
			} catch (\Throwable $e){
				//발급 도중 예외/에러 → 선점(processing) 원복하여 재시도 가능하게
				$conn->prepare("update tbl_order_item set send_status='fail' where ordno=:ordno and send_status='processing'")->execute(array(':ordno'=>$ordno));
				$adminOrder->setOrderLog($settle_no, $ordno, "[재발송] 예외 발생 — ".$e->getMessage());
				msg("재발송 처리 중 오류가 발생했습니다. 다시 시도해 주세요.", $list_url); exit;
			}

			//tbl_order_log 이력 (order_view 주문로그에 표시) — admin_id는 setOrderLog가 세션에서 기록
			if($resend_send == 'fail'){
				$adminOrder->setOrderLog($settle_no, $ordno, "[재발송] 실패 — 재고/외부API 확인 필요 (".$resend_system.")");
				msg("재발송에 실패했습니다. 재고/외부 API 상태를 확인 후 다시 시도해 주세요.", $list_url); exit;
			}else{
				$adminOrder->setOrderLog($settle_no, $ordno, "[재발송] 완료 — 발송상태:".$resend_send." (".$resend_system.")");
				msg("재발송이 완료되었습니다. (발송상태: ".$resend_send.")", $list_url); exit;
			}
		break;
		case "memo_add":
			print_r($_POST);
			$adminOrder= new AdminOrder($conn);
			$message = "[".$memo_gubun."] / ".$ordno." / ".$message." / 처리자:".$admin_id;
			$adminOrder->setOrderLog($settle_no, $ordno, $message);
		break;
		case "order_reject":
			$adminOrder= new AdminOrder($conn);
			$message = "주문취소반려 / ".$message." / 처리자:".$admin_id;
			$adminOrder->setOrderLog($settle_no, $ordno, $message);
			$adminOrder->cancelOrderItem($ordno,"2");
		break;
		case "register_tracking_no":
			$logger->info($_POST);
			if($tracking_no){
				$query = "UPDATE tbl_order_shipment SET shipment_status=:shipment_status,tracking_number=:tracking_no WHERE settle_no=:settle_no";
				$params = array(
					":shipment_status"=>"3",
					":tracking_no"=>$tracking_no,
					":settle_no"=>$settle_no
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
				
				/*
				if($payment_method=="toss_bank"){
					$params = array(
						"settle_no"=>$settle_no,
						"dlvtype"=>"03",
						"dlvdate"=>"202512041800",
						"dlvcompcode"=>"CJ",
						"dlvno"=>$tracking_no
					);
					
					$logger->info($params);
					$toss = new Tossadapter("");
					$res_data = $toss->regDelivery($params);
					$logger->info($res_data);
					$res_msg = $res_data;
				}
				*/

				/*
				if($escw_yn=="Y"){
					$result = $kcp->kcpDelivery($tno,"STE1","CJ 대한통운",$tracking_no);
					$logger->info($result);

					$params = array(
						"tno"=>$tno,
						"mod_type"=>"STE1"
					);
					$res_data = $kcp->cancelPayment($params);
					$logger->info($res_data);
					$json_res = json_decode($res_data, true);
					$res_cd = $json_res["res_cd"];
					$res_msg = $json_res["res_msg"];
				}
				*/
			}
		break;

		case "shipment_shipping":
			$step_arr = $_POST['step_arr'];
			$settle_no_arr = $_POST['settle_no_arr'];
			$escw_arr = $_POST['escw_arr'];
			$tno_arr = $_POST['tno_arr'];
			$ondno_arr = $_POST['ordno_arr'];
			$pg_arr = $_POST['pg_arr'];
			$tracking_no_arr = $_POST['tracking_no_arr'];
			$delivery_code_arr = $_POST['delivery_code_arr'];

			foreach($settle_no_arr as $key=>$settleno){
				$query = "UPDATE tbl_order_shipment SET shipment_status=:shipment_status,shipped_date=NOW() WHERE settle_no=:settle_no AND ordno=:ondno AND shipment_status='3'";
				$params = array(
					":shipment_status"=>"4",
					":settle_no"=>$settleno,
					":ondno"=>$ondno_arr[$key]
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
				if($pg_arr[$key]=="toss"){
					if($escw_arr[$key]=="Y"){
						$params = array(
							"settle_no"=>$settleno,
							"dlvtype"=>"03",
							"dlvdate"=>date('YmdHi'),
							"dlvcompcode"=>$delivery_code_arr[$key],
							"dlvno"=>$tracking_no_arr[$key]
						);
						$toss = new Tossadapter("");
						$res_data = $toss->regDelivery($params);
						$logger->info($res_data);
						$res_msg = $res_data;
					}
				} else if($pg_arr[$key]=="kcp"){
					if($escw_arr[$key]=="Y"){
						$kcp_params = array(
							"tno"=>$tno_arr[$key],
							"mod_type"=>"STE1"
						);
						$res_data = $kcp->cancelPayment($kcp_params);
						$json_res = json_decode($res_data, true);
						$res_cd = $json_res["res_cd"];
						$res_msg = $json_res["res_msg"];
					}
				}
			}
		break;
		
		case"shipment_shipped":
			$step_arr = $_POST['step_arr'];
			$settle_no_arr = $_POST['settle_no_arr'];
			$escw_arr = $_POST['escw_arr'];
			$tno_arr = $_POST['tno_arr'];
			$ondno_arr = $_POST['ordno_arr'];

			foreach($settle_no_arr as $key=>$settleno){
				$query = "UPDATE tbl_order_shipment SET shipment_status=:shipment_status,estimated_delivery_date=NOW() WHERE settle_no=:settle_no AND ordno=:ondno AND shipment_status='4'";
				$params = array(
					":shipment_status"=>"5",
					":settle_no"=>$settleno,
					":ondno"=>$ondno_arr[$key]
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}
		break;
		
		case"actual_delivery":
			$step_arr = $_POST['step_arr'];
			$settle_no_arr = $_POST['settle_no_arr'];
			$escw_arr = $_POST['escw_arr'];
			$tno_arr = $_POST['tno_arr'];
			$ondno_arr = $_POST['ordno_arr'];

			foreach($settle_no_arr as $key=>$settleno){
				$query = "UPDATE tbl_order_shipment SET shipment_status=:shipment_status,actual_delivery_date=NOW() WHERE settle_no=:settle_no AND ordno=:ondno AND shipment_status='5'";
				$params = array(
					":shipment_status"=>"6",
					":settle_no"=>$settleno,
					":ondno"=>$ondno_arr[$key]
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}
		break;

		case "register_tracking_no_item":
			$delivery_code = $_POST['delivery_code'];
			$logger->info($_POST);
			if($tracking_no){
				$query = "UPDATE tbl_order_shipment SET shipment_status=:shipment_status,tracking_number=:tracking_no,delivery_code=:delivery_code WHERE ordno=:ordno";
				$params = array(
					":shipment_status"=>"3",
					":tracking_no"=>$tracking_no,
					":delivery_code"=>$delivery_code,
					":ordno"=>$ordno
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>