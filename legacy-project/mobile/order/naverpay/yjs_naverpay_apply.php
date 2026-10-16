<?
	ini_set('display_errors', '0');
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
    header("Content-type: text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_naverpay_mobile.xml');
	$logger = Logger::getLogger("mobile");

	$resultCode = filter_input(INPUT_GET, 'resultCode', FILTER_SANITIZE_STRING);
	$resultMessage = filter_input(INPUT_GET, 'resultMessage', FILTER_SANITIZE_STRING);
	$paymentId = filter_input(INPUT_GET, 'paymentId', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//기존 DB
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$order = new Order($conn);
	$member = new Member($conn_dgkr);
	$naverpay = new NaverPay('');

	$asset = new Asset();
	$genba = new Genba("Live");
	$ztorm = new Ztorm();
	$vaultn = new Vaultn();
	$pointnexus = new PointNexus("test"); //TODO: 운영 전환 시 "prod"

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

	switch($resultCode){
		case "Success":
			//결제승인요청
			$response = $naverpay->naverPayPaymentApply($paymentId);
			$logger->info($response);
			if($response->code=="Success"){
				//결제로그저장
				$query="insert into naverpay_log set paymentId=:paymentId,payHistId=:payHistId,merchantName=:merchantName,merchantId=:merchantId,merchantPayKey=:merchantPayKey,merchantUserKey=:merchantUserKey,admissionTypeCode=:admissionTypeCode,admissionYmdt=:admissionYmdt,tradeConfirmYmdt=:tradeConfirmYmdt,admissionState=:admissionState,totalPayAmount=:totalPayAmount,applyPayAmount=:applyPayAmount,primaryPayAmount=:primaryPayAmount,npointPayAmount=:npointPayAmount,giftCardAmount=:giftCardAmount,discountPayAmount=:discountPayAmount,taxScopeAmount=:taxScopeAmount,taxExScopeAmount=:taxExScopeAmount,environmentDepositAmount=:environmentDepositAmount,primaryPayMeans=:primaryPayMeans,cardCorpCode=:cardCorpCode,cardNo=:cardNo,cardAuthNo=:cardAuthNo,cardInstCount=:cardInstCount,usedCardPoint=:usedCardPoint,bankCorpCode=:bankCorpCode,bankAccountNo=:bankAccountNo,productName=:productName,settleExpected=:settleExpected,settleExpectAmount=:settleExpectAmount,payCommissionAmount=:payCommissionAmount,merchantExtraParameter=:merchantExtraParameter,merchantPayTransactionKey=:merchantPayTransactionKey,userIdentifier=:userIdentifier,extraDeduction=:extraDeduction,useCfmYmdt=:useCfmYmdt,subMerchantInfo=:subMerchantInfo";
				$params = array(
					":paymentId"=>$response->body->detail->paymentId,
					":payHistId"=>$response->body->detail->payHistId,
					":merchantName"=>$response->body->detail->merchantName,
					":merchantId"=>$response->body->detail->merchantId,
					":merchantPayKey"=>$response->body->detail->merchantPayKey,
					":merchantUserKey"=>$response->body->detail->merchantUserKey,
					":admissionTypeCode"=>$response->body->detail->admissionTypeCode,
					":admissionYmdt"=>$response->body->detail->admissionYmdt,
					":tradeConfirmYmdt"=>$response->body->detail->tradeConfirmYmdt,
					":admissionState"=>$response->body->detail->admissionState,
					":totalPayAmount"=>$response->body->detail->totalPayAmount,
					":applyPayAmount"=>$response->body->detail->applyPayAmount,
					":primaryPayAmount"=>$response->body->detail->primaryPayAmount,
					":npointPayAmount"=>$response->body->detail->npointPayAmount,
					":giftCardAmount"=>$response->body->detail->giftCardAmount,
					":discountPayAmount"=>$response->body->detail->discountPayAmount,
					":taxScopeAmount"=>$response->body->detail->taxScopeAmount,
					":taxExScopeAmount"=>$response->body->detail->taxExScopeAmount,
					":environmentDepositAmount"=>$response->body->detail->environmentDepositAmount,
					":primaryPayMeans"=>$response->body->detail->primaryPayMeans,
					":cardCorpCode"=>$response->body->detail->cardCorpCode,
					":cardNo"=>$response->body->detail->cardNo,
					":cardAuthNo"=>$response->body->detail->cardAuthNo,
					":cardInstCount"=>$response->body->detail->cardInstCount,
					":usedCardPoint"=>$response->body->detail->usedCardPoint,
					":bankCorpCode"=>$response->body->detail->bankCorpCode,
					":bankAccountNo"=>$response->body->detail->bankAccountNo,
					":productName"=>$response->body->detail->productName,
					":settleExpected"=>$response->body->detail->settleExpected,
					":settleExpectAmount"=>$response->body->detail->settleExpectAmount,
					":payCommissionAmount"=>$response->body->detail->payCommissionAmount,
					":merchantExtraParameter"=>$response->body->detail->merchantExtraParameter,
					":merchantPayTransactionKey"=>$response->body->detail->merchantPayTransactionKey,
					":userIdentifier"=>$response->body->detail->userIdentifier,
					":extraDeduction"=>$response->body->detail->extraDeduction,
					":useCfmYmdt"=>$response->body->detail->useCfmYmdt,
					":subMerchantInfo"=>$response->body->detail->subMerchantInfo,
				);
				$logger->info($params);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);


				if($response->body->detail->primaryPayMeans==""){
					if($response->body->detail->npointPayAmount>0){
						$payment_method = "POINT";
					}
				}else{
					switch($response->body->detail->primaryPayMeans){
						case "CARD":
							$payment_method = "SC0010";
						break;
						case "BANK":
							$payment_method = "SC0030";
						break;
					}
				}

				//주결제수단 및 결제완료 업데이트
				$u_query="update tbl_order set step='2',payment_method=:payment_method,payment_date=now() where settle_no=:settle_no";
				$params = array(
					":payment_method"=>$payment_method,
					":settle_no"=>$response->body->detail->merchantPayKey,
				);
				$logger->info($params);
				$stmt = $conn->prepare($u_query);
				$stmt->execute($params);

				//IP 취득 (원본 코드에서 누락되어 있던 것을 보완)
				$ip = get_client_ip_env();

				//주문상품목록 및 게임코드발송
				$order_item = $order->getOrderItem($response->body->detail->merchantPayKey);

				foreach($order_item as $value){
					//게임코드 발송아이템 정보
					$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);

					//Mobile은 m_no/m_id를 주문 항목($value)에서 추출
					$payment_info = array(
						'pay_type'       => '',
						'ip'             => $ip,
						'm_no'           => $value['m_no'],
						'm_id'           => $value['m_id'],
						'name'           => $_SESSION['member']['name'],
						'nickname'       => $_SESSION['member']['nickname'],
						'payment_method' => $payment_method,
					);

					switch($value['delivery_type']){
						case "1": //디지털상품 주문
							$send_status = "pending";
							$item_order_id = "";
							foreach($delivery_item_list as $sub_value){
								$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
								$order_status = $res['order_status'];
								$send_status  = $res['send_status'];
								$order_system = $res['order_system'];
							}
						break;
						case "2": //실물상품 주문
							$order_repo->insertShipment($response->body->detail->merchantPayKey, $value, $buyr_name, '2');
							$order_status="2";
						break;
						case "3": //디지털 + 실물상품 배송
							//디지털 상품 주문
							$send_status = "pending";
							$item_order_id = "";
							foreach($delivery_item_list as $sub_value){
								$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
								$order_status = $res['order_status'];
								$send_status  = $res['send_status'];
								$order_system = $res['order_system'];
							}

							//실물상품 주문
							$order_repo->insertShipment($response->body->detail->merchantPayKey, $value, $buyr_name, '2');
							$order_status="2";
						break;
					}

					$order_repo->updateItemStatus($value['ordno'], $order_status, $send_status, $order_system);
				}

				//장바구니 삭제
				$order_repo->clearCart($response->body->detail->merchantUserKey);

				//##############################################################
				//사용 적립금 차감
				//##############################################################
				$use_emoney = $order->getOrderUsePoint($response->body->detail->merchantPayKey);
				if($use_emoney>0){
					$member->setMemberEmoney($response->body->detail->merchantUserKey,$use_emoney,'주문결제시 할인',$response->body->detail->merchantPayKey);
				}


				header( "HTTP/1.1 301 Moved Permanently" );
				header( 'Location: https://m.directg.net/order/order_end.html?settle_no='.$response->body->detail->merchantPayKey );
				exit;

			}else{
				echo $response->message;
				$naverpay_log = $order->getNaverPayLog($paymentId);
				header( "HTTP/1.1 301 Moved Permanently" );
				header( 'Location: https://m.directg.net/order/order_end.html?settle_no='.$naverpay_log['merchantPayKey'] );
				exit;
			}
		break;
		case "UserCancel": // 사용자 결제취소
			$logger->info($_GET);
			header( "HTTP/1.1 301 Moved Permanently" );
			header( 'Location: https://m.directg.net/order/naverpay/naverpay_cancel.php?resultCode='.$resultCode.'&resultMessage='.$resultMessage );
			exit;
		break;
	}
}catch(Exception $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
