<?php
	ini_set( "display_errors", 0 );
	//-------------------------------------------------------------------------------
	// PAYCO 무통장입금 처리 통보 API 페이지 샘플 ( PHP )
	// payco_without_bankbook.php
	// 2015-03-25	PAYCO기술지원 <dl_payco_ts@nhnent.com>
	//-------------------------------------------------------------------------------

	//-------------------------------------------------------------------------------
	// 이 문서는 text/html 형태의 데이터를 반환합니다. ( OK 또는 ERROR 만 반환 )
	//-------------------------------------------------------------------------------
	header('Content-type: text/html; charset: UTF-8');
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payco_vbank.xml');
	$logger = Logger::getLogger("pc");
	
	try {

		//-----------------------------------------------------------------------------
		// 오류가 발생했는지 기억할 변수와 결과를 담을 변수를 선언합니다.
		//-----------------------------------------------------------------------------
		$ErrBoolean = True;		// 미리 오류라고 가정

		//$readValue	= stripslashes($_REQUEST["response"]);		   // PHP 5.2 / PHP 함수 stripslashes() 사용하여, Payco 에서 송신하는 값(response)을 JSON 형태로 변경하기전 백슬래시 기호 제거
		$readValue	= $_REQUEST["response"];				   // PHP 5.3 이상에서 적용 / Payco 에서 전달하는 값(response)을 저장


		//-----------------------------------------------------------------------------
		// (로그) 호출 시점과 호출값을 파일에 기록합니다.
		//-----------------------------------------------------------------------------
		//Write_Log("payco_without_bankbook.php is Called - response : $readValue");
		$logger->info($_REQUEST);
		
		//-----------------------------------------------------------------------------
		// POST 값 중 response 값이 없으면 에러를 표시하고 API를 종료합니다.
		//-----------------------------------------------------------------------------
		if( $readValue == "" ){
			$resultValue = "Parameter is nothing.";
			//Write_Log("payco_without_bankbook.php send Result : ERROR ($resultValue)");
			echo "ERROR";
			return;
		}

		//-----------------------------------------------------------------------------
		// Payco 에서 송신하는 값(response)을 JSON 형태로 변경
		// 데이터 확인에 필요한 값을 변수에 담아 처리합니다.
		//-----------------------------------------------------------------------------
		$Read_Data = json_decode($readValue, true);

		//-----------------------------------------------------------------------------
		// 이곳에 가맹점에서 필요한 데이터 처리를 합니다.
		//-----------------------------------------------------------------------------

		//-----------------------------------------------------------------------------
		// 수신 데이터 사용 예제( 주문서 찾기 )
		//-----------------------------------------------------------------------------
		$sellerOrderReferenceKey	= $Read_Data["sellerOrderReferenceKey"];			// 가맹점에서 발급하는 주문 연동 Key
		$reserveOrderNo				= $Read_Data["reserveOrderNo"];						// 주문예약번호
		$orderNo					= $Read_Data["orderNo"];							// 주문번호
		$memberName					= $Read_Data["memberName"];							// 주문자명
		$memberEmail				= $Read_Data["memberEmail"];						// 주문자EMAIL(일부 마스킹처리)
		$orderChannel				= $Read_Data["orderChannel"];						// 주문채널 (PC/MOBILE)
		$totalOrderAmt				= $Read_Data["totalOrderAmt"];						// 총주문금액
		$totalPaymentAmt			= $Read_Data["totalPaymentAmt"];					// 총결제금액
		$orderCertifyKey			= $Read_Data["orderCertifyKey"];					// 주문완료통보시 내려받은 인증값
		$paymentCompleteYmdt		= $Read_Data["paymentCompleteYmdt"];				
		//-----------------------------------------------------------------------------
		// ...
		// 기타 주문서 생성에 필요한 정보를 가지고 주문서를 조회합니다.
		// 예) 무통장 입금 확인 필드 업데이트
		//-----------------------------------------------------------------------------
		$paymentCompletionYn = $Read_Data["paymentCompletionYn"];			// 지급완료 값 ( Y/N )
		if( $paymentCompletionYn == "Y" ){
			//-------------------------------------------------------------------------
			//지급이 완료 되었다고 받았으면 지급 완료 처리
			//--------------------------------------------------------------------------
			try{
				$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				
				//기존 DB
				$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
				$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				

				$order = new Order($conn);
				$member = new Member($conn_dgkr);
				$paycoPG = new PaycoPG("");

				$asset = new Asset();
				$genba = new Genba("Live");
				$ztorm = new Ztorm();
				$vaultn = new Vaultn();

				$query = "UPDATE payco_log SET paymentCompletionYn='Y',orderNo=:orderNo,memberName=:memberName,memberEmail=:memberEmail,orderChannel=:orderChannel,totalOrderAmt=:totalOrderAmt,orderCertifyKey=:orderCertifyKey,paymentCompleteYmdt=:paymentCompleteYmdt,paymentDetails=:paymentDetails,orderProducts=:orderProducts WHERE sellerOrderReferenceKey=:sellerOrderReferenceKey";
				$params = array(
					":orderNo"=>$orderNo,
					":memberName"=>$memberName,
					":memberEmail"=>$memberEmail,
					":orderChannel"=>$orderChannel,
					":totalOrderAmt"=>$totalOrderAmt,
					":orderCertifyKey"=>$orderCertifyKey,
					":paymentCompleteYmdt"=>$paymentCompleteYmdt,
					":paymentDetails"=>json_encode($Read_Data["paymentDetails"]),
					":orderProducts"=>json_encode($Read_Data["orderProducts"]),
					":sellerOrderReferenceKey" => $sellerOrderReferenceKey
				);
				$logger->info($params);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);

				foreach($Read_Data["paymentDetails"] as $value){
					//페이코 결제 상세로그
					$query = "UPDATE payco_log_detail SET paymentTradeNo=:paymentTradeNo,paymentMethodCode=:paymentMethodCode,paymentMethodName=:paymentMethodName,paymentAmt=:paymentAmt,tradeYmdt=:tradeYmdt,pgAdmissionNo=:pgAdmissionNo,pgAdmissionYmdt=:pgAdmissionYmdt,easyPaymentYn=:easyPaymentYn,cardSettleInfo=:cardSettleInfo,cellphoneSettleInfo=:cellphoneSettleInfo,realtimeAccountTransferSettleInfo=:realtimeAccountTransferSettleInfo,couponSettleInfo=:couponSettleInfo WHERE sellerOrderReferenceKey=:sellerOrderReferenceKey";
					$params = array(
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
						":couponSettleInfo"=>json_encode($value["couponSettleInfo"]),
						":sellerOrderReferenceKey"=>$sellerOrderReferenceKey,
					);
//						":nonBankbookSettleInfo"=>json_encode($value["nonBankbookSettleInfo"]),

					$stmt = $conn->prepare($query);
					$stmt->execute($params);
				}

				$u_query="update tbl_order set step='2',payment_date=now() where settle_no=:settle_no";
				$params = array(
					":settle_no"=>$sellerOrderReferenceKey,
				);
				$logger->info($params);
				$stmt = $conn->prepare($u_query);
				$stmt->execute($params);

				//주문상품목록 및 게임코드발송
				$order_item = $order->getOrderItem($sellerOrderReferenceKey);
				foreach($order_item as $value){
					//게임코드 발송아이템 정보
					$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);
					
					switch($value['delivery_type']){
						case "1": //디지털상품 주문
							$order_status="2";
							$send_status = "delivered";
						break;
						case "2": //실물상품 주문
							$query="UPDATE tbl_order_shipment SET shipment_status='2' WHERE settle_no=:settle_no";
							$stmt = $conn->prepare($query);
							$d_params = array(
								":settle_no"=>$sellerOrderReferenceKey,
							);
							$logger->info($d_params);
							$stmt->execute($d_params);
							$order_status="2";
							$send_status = "delivered";
						break;
						case "3": //디지털 + 실물상품 배송
							//디지털 상품 주문
							$query="UPDATE tbl_order_shipment SET shipment_status='2' WHERE settle_no=:settle_no";
							$stmt = $conn->prepare($query);
							$d_params = array(
								":settle_no"=>$sellerOrderReferenceKey,
							);
							$logger->info($d_params);
							$stmt->execute($d_params);
							$order_status="2";
							$send_status = "delivered";
						break;
					}

					//주문상품 상세정보 업데이트
					$query="update tbl_order_item set status=:status,send_status=:send_status where ordno=:ordno";
					$params = array(
						":status"=>$order_status,
						":send_status"=>$send_status,
						":ordno"=>$value['ordno'],
					);
					$logger->info($params);
					$stmt = $conn->prepare($query);
					$stmt->execute($params);
				}
				
			
				$use_emoney = $order->getOrderUsePoint($sellerOrderReferenceKey);
				
				//사용 적립금 차감
				if($use_emoney>0){
					$member->setMemberEmoney($value['m_no'],$use_emoney,'주문결제시 할인',$sellerOrderReferenceKey);
				}

			}catch (PDOException $e){
				echo 'Error!: '.$e->getMessage();
				die();
			}

			$ErrBoolean = False;											// 정상처리를 위해 오류 표시를 해제
		}

		//-----------------------------------------------------------------------------
		// 결과값을 생성
		//-----------------------------------------------------------------------------
		if( $ErrBoolean == true ){
			$resultValue = "ERROR";											// 오류가 있으면 ERROR를 설정
		} else {
			$resultValue = "OK";											// 오류가 없으면 OK 설정
		}

		//-----------------------------------------------------------------------------
		// 오류일 경우 상세내역을 기록
		//-----------------------------------------------------------------------------
		if( $resultValue == "ERROR" ){
			//Write_Log("payco_without_bankbook.php has item error : Couldn't find order.");		// 오류 상세 내역을 이곳에 표시합니다. ( DB 및 주문서 찾기등 오류)
			$logger->info("error");
		}

	} catch ( Exception $e ){
		$resultValue = "ERROR";
		//Write_Log("payco_without_bankbook.php has logical error : Code - ".$e->getCode().", Description - ".$e->getMessage());
		$logger->info($e);
	}

	//---------------------------------------------------------------------------------
	// 결과를 PAYCO 쪽에 리턴
	//---------------------------------------------------------------------------------
	//Write_Log("payco_without_bankbook.php send Result : $resultValue");		// 리턴 내역을 기록
	$logger->info($resultValue);
	echo $resultValue;
?>