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
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payco.xml');
	$logger = Logger::getLogger("pc");

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

	//-----------------------------------------------------------------------------
	// Read_code 값이 0 또는 2222, 또는 실패시 오류코드 값 중 하나가 옵니다.
	//	 0 - 결제 인증 성공
	// 2222 - 사용자에 의한 결제 취소
	// 내역을 표시하고 창을 닫습니다.
	//-----------------------------------------------------------------------------

	//-----------------------------------------------------------------------------
	// response 값이 없으면 에러(ERROR)를 돌려주고 로그를 기록한 뒤
	// 오류페이지를 보여주거나 주문되지 않았음을 고객에게 통보하는 페이지로 이동합니다.
	//-----------------------------------------------------------------------------

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

		 					var isMobile = "1";

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

	//-----------------------------------------------------------------------------
	// 이곳에 위의 변수들을 이용해 가맹점에서 필요한 데이터를 처리합니다.
	// 예) 재고 체크, 매출금액 확인, 주문서 생성 , 총결제 금액 비교($totalPaymentAmt) , 외부가맹점 번호일치($sellerOrderReferenceKey) 등등
	//-----------------------------------------------------------------------------


	$ItemStock= 10;							// DB 재고수량 , 연동 실패를 테스트 하시려면 값을 0 으로 설정하시고 정상으로 테스트 하시려면 1보다 큰 값을 넣으세요.

	$ItemTotalOrderAmt = 102500;                // DB에서 주문시 주문했던 총 금액(PAYCO 에 주문예약할때 던졌던 값.)을 가져옵니다.(주문값) // 연동 실패를 테스트 하시려면 값을 주문값을 totalPaymentAmt 값과 틀리게 설정하세요.


	//-----------------------------------------------------------------------------
	// 수신 데이터 사용 예제1 ( 재고 체크 )
	//-----------------------------------------------------------------------------

	if( $ItemStock < 1 ){

		//Write_Log("payco_return.php 재고 확인 > ".$ItemName." 상품의 재고 부족으로 연동 오류 발생 하였습니다.");

		$doApproval = false;   					// 재고가 1보다 작다면 오류로 설정

		//-----------------------------------------------------------------------------
		//오류일 경우 오류페이지를 표시하거나 결제되지 않았음을 고객에게 통보합니다.
		//-----------------------------------------------------------------------------
	?>
						<html>
							<head>
							<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
								<title>재고 부족</title>
							</head>
							<script type="text/javascript">
								alert("재고 수량이 부족합니다.");

								var isMobile = "1";

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
		//-----------------------------------------------------------------------------
		// 확인결과(재고확인,결제금액 위변조 확인)가 정상이면 PAYCO 에 결제 승인을 요청
		//-----------------------------------------------------------------------------
		//-----------------------------------------------------------------------------
		// 결제 승인 요청에 담을 JSON OBJECT를 선언합니다.
		//-----------------------------------------------------------------------------

		$approvalOrder["reserveOrderNo"]			= $reserveOrderNo;				// 예약주문번호.
		$approvalOrder["paymentCertifyToken"]		= $paymentCertifyToken;			// 결제인증토큰.
		$approvalOrder["sellerOrderReferenceKey"]	= $sellerOrderReferenceKey;		// 외부가맹점에서 관리하는 주문연동Key
		$approvalOrder["sellerOrderReferenceKeyType"]	= $sellerOrderReferenceKeyType;		// 외부가맹점에서 관리하는 주문연동Key
		$approvalOrder["totalPaymentAmt"]			= $totalPaymentAmt;				// 주문 총 금액.

		// 결제승인 요청( approval )
			$logger->info("\n####결제 승인 요청API#########\n");
			$logger->info($approvalOrder);

			$paycoPG = new PaycoPG("test");
			$Result = $paycoPG->paycoApproval($approvalOrder);

			// JSON 결과값을 배열로 변환한다.
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


		//----------------------------------------------------------------------------
		// 수신 데이터 추출 예제 ( 종합 )
		//----------------------------------------------------------------------------

		/*

		$Result_Total = $Read_Data["result"];

		foreach ($Result_Total as $key => $value){
			switch ($key){
				case "deliveryPlace":
					$deliveryPlace = $Result_Total["deliveryPlace"];

					foreach ($deliveryPlace as $key => $value){
						Write_Log("deliveryPlace[$key] : ".$value);
					}
				break;
				case "orderProducts":
					$orderProducts = $Result_Total["orderProducts"];

					foreach ($orderProducts as $key => $value){
						Write_Log("orderProducts[$key]");
						$orderProduct = $orderProducts[$key];

						foreach ($orderProduct as $key => $value){
							Write_Log("    $key : ".$value);
						}
					}

				break;
				case "paymentDetails":
					$paymentDetails = $Result_Total["paymentDetails"];

					foreach ($paymentDetails as $key => $value){
						Write_Log("paymentDetails[$key] : ");
						$paymentDetail = $paymentDetails[$key];

						foreach ($paymentDetail as $key => $value){
							switch ($paymentDetail["paymentMethodCode"]){
								case "31":
									if ($key=="cardSettleInfo"){
										Write_Log("    cardSettleInfo :");
										$cardSettleInfo = $paymentDetail["cardSettleInfo"];

										foreach ($cardSettleInfo as $key => $value){
											Write_Log("        $key : ".$value);
										}
									} else {
										Write_Log("    $key : ".$value);
									}
								break;
								case "75":
								case "76":
								case "77":
									if ($key=="couponSettleInfo"){
										Write_Log("    couponSettleInfo : ");
										$couponSettleInfo = $paymentDetail["couponSettleInfo"];

										foreach ($couponSettleInfo as $key => $value){
											Write_Log("        $key : ".$value);
										}
									} else {
										Write_Log("    $key : ".$value);
									}
								break;
								case "98":
									Write_Log("    $key : ".$value);
								break;
								default:
								break;
							}
						}
					}
					break;
					default:
						Write_Log("$key : ".$value);
					break;
				}
			}

		*/

		//-----------------------------------------------------------------------------
		// 결제 승인 수신 데이터 사용
		//-----------------------------------------------------------------------------

		$sellerOrderReferenceKey			= $Read_Data["result"]["sellerOrderReferenceKey"];			// 가맹점에서 발급했던 주문 연동 Key
		$reserveOrderNo						= $Read_Data["result"]["reserveOrderNo"];					// PAYCO에서 발급한 주문예약번호
		$orderNo							= $Read_Data["result"]["orderNo"];							// PAYCO에서 발급한 주문번호
		$memberName							= $Read_Data["result"]["memberName"];						// 주문자명
		$totalOrderAmt						= $Read_Data["result"]["totalOrderAmt"];					// 총 주문 금액
		$totalDeliveryFeeAmt				= $Read_Data["result"]["totalDeliveryFeeAmt"];				// 총 배송비 금액
		$totalRemoteAreaDeliveryFeeAmt		= $Read_Data["result"]["totalRemoteAreaDeliveryFeeAmt"];	// 총 추가배송비 금액
		$totalPaymentAmt					= $Read_Data["result"]["totalPaymentAmt"];					// 총 결제 금액

		$sellerOrderProductReferenceKey     = $Read_Data["result"]["orderProducts"][0]["sellerOrderProductReferenceKey"];	// 가맹점에서 관리하는 	주문상품 연동key
		$orderCertifyKey 					= $Read_Data["result"]["orderCertifyKey"];					// 주문인증키

		//-----------------------------------------------------------------------------
		// <<<< 시작 >>>>
		// DB 저장중 오류가 발생하였으면 , 전체 취소 API( payco_cancel.php )를 호출 합니다.
		//
		//-----------------------------------------------------------------------------

			//$ErrBoolean = true;              //  기본 적으로  DB 저장 성공으로 설정
			$ErrBoolean = false;              //  기본 적으로  DB 저장 성공으로 설정

		//------------------------------------------------------------------------------
		// $ErrBoolean 상태값에 따른 결과값 생성
		//------------------------------------------------------------------------------
			if($ErrBoolean){
				$resultValue = "ERROR";		//오류가 있으면 ERROR를 설정
			} else {
				$resultValue = "OK";		//오류가 없으면 OK 설정
			}

			if ($resultValue == "ERROR"){

				// 결제상세 조회(검증용)API 호출 - 승인완료 후 DB 저장시 오류 났을 경우, 결제취소시에 사용합니다.
				$detailForVerify = array();
				$detailForVerify["sellerKey"] 				= $sellerKey;					// 가맹점 코드. payco_config.php 에 설정
				$detailForVerify["reserveOrderNo"] 			= $reserveOrderNo; 				// 예약주문번호.
				$detailForVerify["sellerOrderReferenceKey"] = $sellerOrderReferenceKey; 	// 외부가맹점에서 관리하는 주문연동Key

				$detailForVerify_Result = payco_detailForVerify(stripslashes(json_encode($detailForVerify)));  		// 배열을 JSON 형식으로 변환 및 백슬래시 제거 후에, 결제 승인 요청함.
				$detailForVerify_Read_Data = json_decode($detailForVerify_Result, true);                  			// JSON 형식의 전달받은 값을, 배열로 변환.

				//-----------------------------------------------------------------------------
				//결제 취소 API 호출 ( PAYCO 에서 받은 결제정보를 이용해 전체 취소를 합니다. )
			    // 취소 내역을 담을 JSON OBJECT를 선언합니다.
				//------------------------------------------------------------------------------
				$cancelOrder = array();
				$cancelOrder["sellerKey"]					= $sellerKey;							// 가맹점 코드. payco_config.php 에 설정
				$cancelOrder["sellerOrderReferenceKey"]		= $detailForVerify_Read_Data["result"]["sellerOrderReferenceKey"];				// 취소주문연동키. ( 파라메터로 넘겨 받은 값 )
				$cancelOrder["orderCertifyKey"]				= $detailForVerify_Read_Data["result"]["orderCertifyKey"];						// 주문완료통보시 내려받은 인증값
				$cancelOrder["cancelTotalAmt"]				= $detailForVerify_Read_Data["result"]["totalPaymentAmt"];						// PAYCO 주문서의 총 금액을 입력합니다. (전체취소, 부분취소 전부다)

				//Write_Log("payco_return.php is DB Error : try cancel : ".$cancelOrder);

				//$cancel_Result = payco_cancel(stripslashes(json_encode($cancelOrder)));

			?>
						 			<html>
						 				<head>
						 					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
						 					<title>DB 저장오류 결제취소</title>
						 				</head>
						 				<script type="text/javascript">

					 						alert("DB 저장오류 발생하여 결제취소 되었습니다. ");

						 					var isMobile = "1";

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

		//-----------------------------------------------------------------------------
		//
		// DB 저장중 오류가 발생하였으면 , 전체 취소 API( payco_cancel.php )를 호출 합니다.
		// <<<< 끝 >>>>
		//-----------------------------------------------------------------------------



		if($Read_Data["code"] == "0"){
		?>

					<html>
						<head>
						<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
							<title>주문 완료</title>
						</head>

						<script type="text/javascript">

							alert("장바구니의 주문이 정상적으로 완료되었습니다.");

							var isMobile = "1";

							if(isMobile == 0){     // MOBILE

								 location.href = "/order/order_end.html?settle_no=<?=$sellerOrderReferenceKey?>";

								window.close();


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

			 					var isMobile = "1";

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

			$ErrBoolean = true;              //  결제 승인 코드값이 0 (성공) 이 아니면 오류로 설정

			$Err_code    = $Read_Data["code"];
			$Err_message = $Read_Data["message"];

			//Write_Log("payco_return.php 결제 승인 실패 - code : $Err_code , message : $Err_message ");
			?>
				<html>
					<head>
						<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
						<title>결제 승인 실패</title>
					</head>
					<script type="text/javascript">
						alert("code : <?=$Read_Data["code"]?> \n" + "message : <?=$Read_Data["message"]?>");
						var isMobile = "1";
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

		}	// 결제 승인 실패
		//-----------------------------------------------------------------------------
		// ...
		// 결제 승인 수신 데이터를 이용하여 결제 승인후 처리할 부분을 이곳에 작성합니다.
		// ...
		//-----------------------------------------------------------------------------


	}else{

		//-----------------------------------------------------------------------------
		//
		// 오류일 경우 오류페이지를 표시하거나 결제되지 않았음을 고객에게 통보합니다.
		// 팝업창 닫기 또는 구매 실패 페이지 작성 ( 팝업창 닫을때 Opener 페이지 이동 등 )
		//
		//-----------------------------------------------------------------------------
		//결제 인증 후 내부 오류가 있어 승인은 받지 않았습니다. 오류내역을 여기에 표시하세요. 예) 재고 수량이 부족합니다.

		if($code != 0){

?>
		<html>
			<head>
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
				<title>주문 실패</title>
			</head>
			<script type="text/javascript">

				alert("결제가 승인되지 않았습니다. \n" + "code : <?=$code?> ");

				var isMobile = "1";

				if(isMobile == 0){
					location.href = "/index.php";
				}else{
					// 주문페이지로 다시 돌아가기 위해 창만 닫거나 특정 페이지로 이동합니다.
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
