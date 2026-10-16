<?PHP
	//--------------------------------------------------------------------------------
	// PAYCO 주문 완료시 호출되는 RETURN 페이지 샘플 ( PHP EASYPAY / PAY2 )
	// - PAYCO 결제창에서 비밀번호 입력후, 호출 하여 처리
	// payco_return.php
	// 2016-12-02	PAYCO기술지원 <dl_payco_ts@nhnent.com>
	//--------------------------------------------------------------------------------

	//-----------------------------------------------------------------------------
	// 이 문서는 text/html 형태의 데이터를 반환합니다.
	//-----------------------------------------------------------------------------
	ini_set( "display_errors", 0 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	header("Content-Type:text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payco_mobile.xml');
	$logger = Logger::getLogger("mobile");

	//-----------------------------------------------------------------------------
	// 오류가 발생했는지 기억할 변수와 결과를 담을 변수를 선언합니다.
	//-----------------------------------------------------------------------------
	$doApproval = true;																// 기본적으로 주문예약 및 결제인증 받은것으로 설정

	$reserveOrderNo					= $_REQUEST["reserveOrderNo"];					// 주문 예약 번호
	$orderNo					= $_REQUEST["orderNo"];
	$sellerOrderReferenceKey		= $_REQUEST["sellerOrderReferenceKey"];			// 외부가맹점에서 관리하는 주문연동Key
	$paymentCertifyToken			= $_REQUEST["paymentCertifyToken"];				// 결제인증토큰(결제승인시 필요)
	$totalPaymentAmt				= $_REQUEST["totalPaymentAmt"];					// 총결제금액
	$discountAmt					= $_REQUEST["discountAmt"];						// 쿠폰할인금액(PAYCO포인트 미포함 )
	$totalRemoteAreaDeliveryFeeAmt	= $_REQUEST["totalRemoteAreaDeliveryFeeAmt"];	// 총 도서산간비( 추가배송비 )
	$pointAmt						= $_REQUEST["pointAmt"];						// PAYCO 포인트 사용금액
	$mainPgCode						= $_REQUEST["mainPgCode"];						// 결제건에 대항하는 주결제수단 코드 입니다.

	$m_no							= $_REQUEST["m_no"];							// returnUrlParam 에서 던진 값을 수신(회원고유 번호 )
	$m_id							= $_REQUEST["m_id"];							// returnUrlParam 에서 던진 값을 수신(회원아이디 )
	$use_emoney							= $_REQUEST["use_emoney"];							// returnUrlParam 에서 던진 값을 수신(사용포인트 )

	//-----------------------------------------------------------------------------

	$code							= $_REQUEST["code"];							// 결과코드
	$message						= $_REQUEST["message"];							// 결과코드

	if($code != 0){
		 if($code == 2222){
	?>
		 			<html>
		 				<head>
		 					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		 					<title>사용자 취소</title>
		 				</head>
		 				<script type="text/javascript">

		 					alert("사용자에 의해 결제취소 되었습니다.  \n" + "ErrCode : <?=$code?> \n");

		 					var isMobile = "0";

		 					if(isMobile == 0){
		 						location.href = "/index.php";
		 					}else{
		 						opener.location.href = "/index.php";
		 						window.close();
		 					}

		 				</script>
		 				<body>
		 				</body>
		 			</html>
<?
	}
	return;
}

	$ItemStock= 10;
	$ItemTotalOrderAmt = 102500;

	if( $ItemStock < 1 ){
		$doApproval = false;
	?>
						<html>
							<head>
							<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
								<title>재고 부족</title>
							</head>
							<script type="text/javascript">
								alert("재고 수량이 부족합니다.");

								var isMobile = "0";

								if(isMobile == 0){
									location.href = "/index.php";
								}else{
									opener.location.href = "/index.php";
									window.close();
								}
							</script>
							<body>
							</body>
						</html>
<?
}

if ( $doApproval == true ){
		$approvalOrder["reserveOrderNo"]			= $reserveOrderNo;
		$approvalOrder["paymentCertifyToken"]		= $paymentCertifyToken;
		$approvalOrder["sellerOrderReferenceKey"]	= $sellerOrderReferenceKey;
		$approvalOrder["sellerOrderReferenceKeyType"]	= $sellerOrderReferenceKeyType;
		$approvalOrder["totalPaymentAmt"]			= $totalPaymentAmt;

		$logger->info("\n####결제 승인 요청API#########\n");
		$logger->info($approvalOrder);

		$paycoPG = new PaycoPG("");
		$Result = $paycoPG->paycoApproval($approvalOrder);

		$Read_Data = json_decode( $Result, true );

		$logger->info("\n####결제 승인 응답API#########\n");
		$logger->info($Read_Data);

		try{
			//리뉴얼 DB
			$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			//기존 DB
			$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
			$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			$order = new Order($conn);
			$member = new Member($conn_dgkr);

			$asset = new Asset();
			$genba = new Genba("Live");
			$ztorm = new Ztorm();
			$vaultn = new Vaultn();
			$pointnexus = new PointNexus(); //mode 미지정 → PointNexus::DEFAULT_MODE (운영 전환은 PointNexus.php 한 줄)

			//배송시스템별로 발송로직 분리
			$fulfillment = new OrderFulfillment($conn, array(
				'asset'      => $asset,
				'ztorm'      => $ztorm,
				'vaultn'     => $vaultn,
				'genba'      => $genba,
				'pointnexus' => $pointnexus,
			), $logger);

			//공통 후처리 헬퍼
			$order_repo = new OrderRepository($conn, $logger);

			//1. 페이코 결제정보
			$query = "insert into payco_log set sellerOrderReferenceKey=:sellerOrderReferenceKey,reserveOrderNo=:reserveOrderNo,orderNo=:orderNo,memberName=:memberName,memberEmail=:memberEmail,orderChannel=:orderChannel,totalOrderAmt=:totalOrderAmt,totalPaymentAmt=:totalPaymentAmt,paymentCompletionYn=:paymentCompletionYn,orderCertifyKey=:orderCertifyKey,orderProducts=:orderProducts,paymentDetails=:paymentDetails,pointAmt=:pointAmt";
			$params = array(
				":sellerOrderReferenceKey"=>$sellerOrderReferenceKey,
				":reserveOrderNo"=>$reserveOrderNo,
				":orderNo"=>$Read_Data["result"]["orderNo"],
				":memberName"=>$Read_Data["result"]["memberName"],
				":memberEmail"=>$Read_Data["result"]["memberEmail"],
				":orderChannel"=>$Read_Data["result"]["orderChannel"],
				":totalOrderAmt"=>$Read_Data["result"]["totalOrderAmt"],
				":totalPaymentAmt"=>$totalPaymentAmt,
				":paymentCompletionYn"=>$Read_Data["result"]["paymentCompletionYn"],
				":orderCertifyKey"=>$Read_Data["result"]["orderCertifyKey"],
				":orderProducts"=>json_encode($Read_Data["result"]["orderProducts"]),
				":paymentDetails"=>json_encode($Read_Data["result"]["paymentDetails"]),
				":pointAmt"=>$pointAmt
			);

			$stmt = $conn->prepare($query);
			$stmt->execute($params);

			foreach($Read_Data["result"]["paymentDetails"] as $value){
				//페이코 결제 상세로그
				$query = "insert into payco_log_detail set sellerOrderReferenceKey=:sellerOrderReferenceKey,paymentTradeNo=:paymentTradeNo,paymentMethodCode=:paymentMethodCode,paymentMethodName=:paymentMethodName,paymentAmt=:paymentAmt,tradeYmdt=:tradeYmdt,pgAdmissionNo=:pgAdmissionNo,pgAdmissionYmdt=:pgAdmissionYmdt,easyPaymentYn=:easyPaymentYn,cardSettleInfo=:cardSettleInfo,cellphoneSettleInfo=:cellphoneSettleInfo,realtimeAccountTransferSettleInfo=:realtimeAccountTransferSettleInfo,nonBankbookSettleInfo=:nonBankbookSettleInfo,couponSettleInfo=:couponSettleInfo";
				$params = array(
					":sellerOrderReferenceKey"=>$sellerOrderReferenceKey,
					":paymentTradeNo"=>$value['paymentTradeNo'],
					":paymentMethodCode"=>$value['paymentMethodCode'],
					":paymentMethodName"=>$value['paymentMethodName'],
					":paymentAmt"=>$value['paymentAmt'],
					":tradeYmdt"=>$value['tradeYmdt'],
					":pgAdmissionNo"=>$value['pgAdmissionNo'],
					":pgAdmissionYmdt"=>$value['pgAdmissionYmdt'],
					":easyPaymentYn"=>$value['easyPaymentYn'],
					":cardSettleInfo"=>json_encode($value["cardSettleInfo"]),
					":cellphoneSettleInfo"=>json_encode($value["cellphoneSettleInfo"]),
					":realtimeAccountTransferSettleInfo"=>json_encode($value["realtimeAccountTransferSettleInfo"]),
					":nonBankbookSettleInfo"=>json_encode($value["nonBankbookSettleInfo"]),
					":couponSettleInfo"=>json_encode($value["couponSettleInfo"])
				);

				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}

			if($Read_Data["result"]["paymentCompletionYn"]=="Y"){ //결제완료시
				$step="2";
				$is_result=true;
			} else if($Read_Data["result"]["paymentCompletionYn"]=="N") { //무통장입금
				$step="1";
				$is_result=true;
			} else {	//결제실패 - 결제테이블 업데이트 하지 않음 (중복결제인 경우)
				$logger->info("###결제실패###");
				$step="1";
				$is_result=false;
			}

			//26-01-12(월) 17:32 [이종석] 주문에 성공했을 경우에만 키 발송
			if($is_result==true){
				//주결제수단 및 결제완료 업데이트
				$u_query="update tbl_order set step=:step,payment_date=now() where settle_no=:settle_no";
				$params = array(
					":settle_no"=>$sellerOrderReferenceKey,
					":step"=>$step
				);
				$logger->info($params);
				$stmt = $conn->prepare($u_query);
				$stmt->execute($params);

				//IP 취득 (원본 코드에서 누락되어 있던 것을 보완)
				$ip = get_client_ip_env();

				//Payco의 paymentCompletionYn=='N'(무통장 입금대기)을 KCP의 VCNT 처리와 매핑
				$pay_type = ($Read_Data["result"]["paymentCompletionYn"]=="Y") ? '' : 'VCNT';

				//주문상품목록 및 게임코드발송
				$order_item = $order->getOrderItem($sellerOrderReferenceKey);
				foreach($order_item as $value){
					//게임코드 발송아이템 정보
					$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);

					switch($value['delivery_type']){
						case "1": //디지털상품 주문
							$send_status = "pending";
							$item_order_id = "";

							$payment_info = array(
								'pay_type'       => $pay_type,
								'ip'             => $ip,
								'm_no'           => $m_no,
								'm_id'           => $m_id,
								'name'           => $_SESSION['member']['name'],
								'nickname'       => $_SESSION['member']['nickname'],
								'payment_method' => $payment_method,
							);
							foreach($delivery_item_list as $sub_value){
								$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
								$order_status = $res['order_status'];
								$send_status  = $res['send_status'];
								$order_system = $res['order_system'];
							}
						break;
						case "2": //실물상품 주문
							if($Read_Data["result"]["paymentCompletionYn"]=="Y"){
								$order_status="2";
							} else {
								$order_status="3";
							}

							$order_repo->insertShipment($sellerOrderReferenceKey, $value, $buyr_name, $order_status);

						break;
						case "3": //디지털 + 실물상품 배송
							//디지털 상품 주문
							$send_status = "pending";
							$item_order_id = "";

							$payment_info = array(
								'pay_type'       => $pay_type,
								'ip'             => $ip,
								'm_no'           => $m_no,
								'm_id'           => $m_id,
								'name'           => $_SESSION['member']['name'],
								'nickname'       => $_SESSION['member']['nickname'],
								'payment_method' => $payment_method,
							);
							foreach($delivery_item_list as $sub_value){
								$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
								$order_status = $res['order_status'];
								$send_status  = $res['send_status'];
								$order_system = $res['order_system'];
							}

							if($Read_Data["result"]["paymentCompletionYn"]=="Y"){
								$order_status="2";
							} else {
								$order_status="3";
							}
							//실물상품 주문
							$order_repo->insertShipment($sellerOrderReferenceKey, $value, $buyr_name, $order_status);
						break;
					}

					//주문상품 상세정보 업데이트
					$order_repo->updateItemStatus($value['ordno'], $order_status, $send_status, $order_system);
				}

				//장바구니 삭제
				$logger->info("###장바구니 삭제###");
				$order_repo->clearCart($_SESSION['member']['m_no']);

				//사용 적립금 차감
				if($use_emoney>0){
					$member->setMemberEmoney($_SESSION['member']['m_no'],$use_emoney,'주문결제시 할인',$sellerOrderReferenceKey);
				}
			}
		}catch (PDOException $e){
			echo 'Error!: '.$e->getMessage();
			die();
		}


		$sellerOrderReferenceKey			= $Read_Data["result"]["sellerOrderReferenceKey"];
		$reserveOrderNo						= $Read_Data["result"]["reserveOrderNo"];
		$orderNo							= $Read_Data["result"]["orderNo"];
		$memberName							= $Read_Data["result"]["memberName"];
		$totalOrderAmt						= $Read_Data["result"]["totalOrderAmt"];
		$totalDeliveryFeeAmt				= $Read_Data["result"]["totalDeliveryFeeAmt"];
		$totalRemoteAreaDeliveryFeeAmt		= $Read_Data["result"]["totalRemoteAreaDeliveryFeeAmt"];
		$totalPaymentAmt					= $Read_Data["result"]["totalPaymentAmt"];

		$sellerOrderProductReferenceKey     = $Read_Data["result"]["orderProducts"][0]["sellerOrderProductReferenceKey"];
		$orderCertifyKey 					= $Read_Data["result"]["orderCertifyKey"];

		$ErrBoolean = false;

		if($ErrBoolean){
			$resultValue = "ERROR";
		} else {
			$resultValue = "OK";
		}

		if ($resultValue == "ERROR"){
			$detailForVerify = array();
			$detailForVerify["sellerKey"] 				= $sellerKey;
			$detailForVerify["reserveOrderNo"] 			= $reserveOrderNo;
			$detailForVerify["sellerOrderReferenceKey"] = $sellerOrderReferenceKey;

			$detailForVerify_Result = payco_detailForVerify(stripslashes(json_encode($detailForVerify)));
			$detailForVerify_Read_Data = json_decode($detailForVerify_Result, true);

			$cancelOrder = array();
			$cancelOrder["sellerKey"]					= $sellerKey;
			$cancelOrder["sellerOrderReferenceKey"]		= $detailForVerify_Read_Data["result"]["sellerOrderReferenceKey"];
			$cancelOrder["orderCertifyKey"]				= $detailForVerify_Read_Data["result"]["orderCertifyKey"];
			$cancelOrder["cancelTotalAmt"]				= $detailForVerify_Read_Data["result"]["totalPaymentAmt"];

			?>
						 			<html>
						 				<head>
						 					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
						 					<title>DB 저장오류 결제취소</title>
						 				</head>
						 				<script type="text/javascript">

					 						alert("DB 저장오류 발생하여 결제취소 되었습니다. ");

						 					var isMobile = "0";

						 					if(isMobile == 0){
						 						location.href = "/index.php";

						 					}else{
						 						opener.location.href = "/index.php";
						 						window.close();
						 					}
						 				</script>
						 				<body>
						 				</body>
						 			</html>
						 		<?php
					return;
			}


		if($Read_Data["code"] == "0"){
		?>

					<html>
						<head>
						<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
							<title>주문 완료</title>
						</head>

						<script type="text/javascript">

							//alert("장바구니 <?=$cartNo?>번 의 주문이 정상적으로 완료되었습니다.");

							var isMobile = "0";

							if(isMobile == 0){     // MOBILE

								 location.href = "/order/order_end.html?settle_no=<?=$sellerOrderReferenceKey?>";


							}else{				   // PC
								opener.location.href = "/order/order_end.html?settle_no=<?=$sellerOrderReferenceKey?>";
								window.close();
							}

						</script>
						<body>
						</body>
					</html>


<?

		}else if($Read_Data["code"] == "4005"){
			?>
			 			<html>
			 				<head>
			 					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
			 					<title>중복결제 확인</title>
			 				</head>
			 				<script type="text/javascript">

		 						alert("이미 주문 완료되었습니다. \n" + "ErrCode : : <?=$Read_Data["code"]?> \n");

			 					var isMobile = "0";

			 					if(isMobile == 0){
			 						location.href = "/index.php";
			 						window.close();
			 					}else{
			 						opener.location.href = "/index.php";
			 						window.close();
			 					}
			 				</script>
			 				<body>
			 				</body>
			 			</html>
			 		<?php

		}else{

			$ErrBoolean = true;

			$Err_code    = $Read_Data["code"];
			$Err_message = $Read_Data["message"];

			?>
				<html>
					<head>
						<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
						<title>결제 승인 실패</title>
					</head>
					<script type="text/javascript">
						alert("code : <?=$Read_Data["code"]?> \n" + "message : <?=$Read_Data["message"]?>");
						var isMobile = "0";
						if(isMobile == 0){
							location.href = "/index.php";
						}else{
							opener.location.href = "/index.php";
							window.close();
						}
					</script>
					<body>
					</body>
				</html>
			<?
			return;

		}

}else{
		if($code != 0){

?>
		<html>
			<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				<title>주문 실패</title>
			</head>
			<script type="text/javascript">

				alert("결제가 승인되지 않았습니다. \n" + "code : <?=$code?> ");

				var isMobile = "0";

				if(isMobile == 0){
					location.href = "/index.php";
				}else{
					//opener.location.href = "index.php";
					window.close();
				}
			</script>
			<body>
			</body>
		</html>
<?
	}
	return;
}
?>
