<?php
ini_set('display_errors', '1');
session_start();
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss.xml');
$logger = Logger::getLogger("pc");

// 토스페이에서 콜백으로 전달한 파라미터
$status = filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);
$payToken = filter_input(INPUT_POST, 'payToken', FILTER_SANITIZE_STRING);
$orderNo = filter_input(INPUT_POST, 'orderNo', FILTER_SANITIZE_STRING);
$payMethod = filter_input(INPUT_POST, 'payMethod', FILTER_SANITIZE_STRING);
$amount = filter_input(INPUT_POST, 'amount', FILTER_SANITIZE_NUMBER_INT);
$discountedAmount = filter_input(INPUT_POST, 'discountedAmount', FILTER_SANITIZE_NUMBER_INT);
$paidAmount = filter_input(INPUT_POST, 'paidAmount', FILTER_SANITIZE_NUMBER_INT);
$paidTs = filter_input(INPUT_POST, 'paidTs', FILTER_SANITIZE_STRING);
$transactionId = filter_input(INPUT_POST, 'transactionId', FILTER_SANITIZE_STRING);
$cardCompanyCode = filter_input(INPUT_POST, 'cardCompanyCode', FILTER_SANITIZE_STRING);
$cardAuthorizationNo = filter_input(INPUT_POST, 'cardAuthorizationNo', FILTER_SANITIZE_STRING);
$spreadOut = filter_input(INPUT_POST, 'spreadOut', FILTER_SANITIZE_STRING);
$noInterest = filter_input(INPUT_POST, 'noInterest', FILTER_SANITIZE_STRING);
$cardMethodType = filter_input(INPUT_POST, 'cardMethodType', FILTER_SANITIZE_STRING);
$cardNumber = filter_input(INPUT_POST, 'cardNumber', FILTER_SANITIZE_STRING);
$cardUserType = filter_input(INPUT_POST, 'cardUserType', FILTER_SANITIZE_STRING);
$cardBinNumber = filter_input(INPUT_POST, 'cardBinNumber', FILTER_SANITIZE_STRING);
$cardNum4Print = filter_input(INPUT_POST, 'cardNum4Print', FILTER_SANITIZE_STRING);
$salesCheckLinkUrl = filter_input(INPUT_POST, 'salesCheckLinkUrl', FILTER_SANITIZE_STRING);
$accountBankCode = filter_input(INPUT_POST, 'accountBankCode', FILTER_SANITIZE_STRING);
$accountBankName = filter_input(INPUT_POST, 'accountBankName', FILTER_SANITIZE_STRING);
$accountNumber = filter_input(INPUT_POST, 'accountNumber', FILTER_SANITIZE_STRING);
$settle_no = $orderNo;

$logger->info($_REQUEST);

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//기존 DB
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$order = new Order($conn);
	$asset = new Asset();
	$genba = new Genba("Live");
	$ztorm = new Ztorm();
	$vaultn = new Vaultn();
	$member = new Member($conn_dgkr);

	$toss = new Toss("");
	$order_info = $order->getOrder($settle_no);

	if (!$order_info) {
		throw new Exception("주문 정보를 찾을 수 없습니다.");
	}
	
	// 이미 결제된 내역일 경우
	if($order_info["step"]=="2"){
		header('Location: /order/order_end.html?settle_no=' . $settle_no);
		exit;
	}
	
	// 2. 금액 검증
	if ($order_info['total_price'] != $amount) {
		throw new Exception("결제 금액이 일치하지 않습니다. (주문금액: {$order_info['total_price']}, 결제금액: {$amount})");
	}
	
	// 5. ⭐ toss_log 테이블에 전체 결제 정보 저장
	$query = "INSERT INTO tosspay_log (settle_no, status, payToken, orderNo, payMethod, amount, discountedAmount, paidAmount, paidTs, transactionId, cardCompanyCode, cardAuthorizationNo, spreadOut, noInterest, cardMethodType, cardNumber, cardUserType, cardBinNumber, cardNum4Print, salesCheckLinkUrl, accountBankCode, accountBankName, accountNumber, reg_date)
	VALUES
	(:settle_no, :status, :payToken, :orderNo, :payMethod, :amount, :discountedAmount, :paidAmount, :paidTs, :transactionId, :cardCompanyCode, :cardAuthorizationNo, :spreadOut, :noInterest, :cardMethodType, :cardNumber, :cardUserType, :cardBinNumber, :cardNum4Print, :salesCheckLinkUrl, :accountBankCode, :accountBankName, :accountNumber, NOW())";

	$params = array(
		':settle_no' => $settle_no,
		':status' => $status,
		':payToken' => $payToken,
		':orderNo' => $orderNo,
		':payMethod' => $payMethod,
		':amount' => $amount,
		':discountedAmount' => $discountedAmount,
		':paidAmount' => $paidAmount,
		':paidTs' => $paidTs,
		':transactionId' => $transactionId,
		':cardCompanyCode' => $cardCompanyCode,
		':cardAuthorizationNo' => $cardAuthorizationNo,
		':spreadOut' => $spreadOut,
		':noInterest' => $noInterest,
		':cardMethodType' => $cardMethodType,
		':cardNumber' => $cardNumber,
		':cardUserType' => $cardUserType,
		':cardBinNumber' => $cardBinNumber,
		':cardNum4Print' => $cardNum4Print,
		':salesCheckLinkUrl' => $salesCheckLinkUrl,
		':accountBankCode' => $accountBankCode,
		':accountBankName' => $accountBankName,
		':accountNumber' => $accountNumber
	);
	$logger->info($params);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	switch($result['method']){
		case "CARD":
			$payment_method = "SC0010";
		break;
		case"TOSS_MONEY":
			$payment_method = "toss_pay";
		break;
	}

	//주결제수단 및 결제완료 업데이트
	$u_query="UPDATE tbl_order SET step='2',pg_provider='toss_pay',payment_method=:payment_method, payment_date=now() WHERE settle_no=:settle_no";
	$params = array(
		":payment_method"=>$payment_method,
		":settle_no"=>$settle_no,
	);
	$logger->info($params);
	$stmt = $conn->prepare($u_query);
	$stmt->execute($params);


	//주문상품목록 및 게임코드발송
	$order_item = $order->getOrderItem($settle_no);
	
	foreach($order_item as $value){
		//게임코드 발송아이템 정보
		$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);
		
		switch($value['delivery_type']){
			case "1": //디지털상품 주문
				$send_status = "pending";
				$item_order_id = "";
				foreach($delivery_item_list as $sub_value){
					switch($sub_value['order_system']){
						case "1": //Asset API 주문
							$order_system="Asset";
							try{
								$asset_response = $asset->runReserveRegister($order_info['m_id'],$value['ordno'],$sub_value['item_id']);
								$logger->info($asset_response);
								foreach($asset_response->list as $asset_key=>$asset_item){
									$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd ";
									$stmt = $conn->prepare($query);
									$c_params = array(
										":m_no"=>$order_info['m_no'],
										":m_id"=>$order_info['m_id'],
										":ordno"=>$asset_item->po,
										":product_code"=>$value['product_code'],
										":product_name"=>$value['product_name'],
										":asset_id"=>$asset_item->assetId,
										":asset_name"=>$sub_value['item_name'],
										":reserve_id"=>$asset_item->reserveId,
										":asset_publisher"=>$sub_value['item_publisher'],
										":asset_platform"=>$sub_value['item_platform'],
										":asset_type"=>$sub_value['item_type'],
										":ord_ymd"=>date('Y-m-d'),
									);
									$stmt->execute($c_params);
								}
								
								$order_status="2";
								$send_status = "delivered";
							}catch(Exception $e){
								//print_r($e);
								$order_status="1";
								$send_status = "fail";
							}
						break;
						case "2": //Ztorm API 주문
							if($_SESSION['member']['name']){
								$name = $_SESSION['member']['name'];
							}else{
								$name = $_SESSION['member']['nickname'];
							}
							//회원가입
							$member_params = array(
									"RetailerCustomerID"=>$order_info['m_id'],
									"Username"=>$name,
									"Email"=>$order_info['m_id'],
									"FirstName"=>'',
									"LastName"=>'',
									"CountryCode"=>'KR',
									"YearOfBirth"=>''
							);
							$member_response = $ztorm->runCreateCustomer($member_params);
							$logger->info($member_response);
							
							$zt_ord_no = $ztorm->runZtormOrder($order_info['m_id'],$ip,$value['ordno'],$sub_value['item_id'],$value['price'],$payment_method,$value['publisher_code']);
							$logger->info($zt_ord_no);
							
							$query="insert into tbl_order_item_ztorm set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,ztorm_item_id=:ztorm_item_id,ztorm_item_name=:ztorm_item_name,customer_product_id=:customer_product_id,ztorm_publisher=:ztorm_publisher,ztorm_platform=:ztorm_platform,order_date=now(),ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE batch_date=now()";
							$stmt = $conn->prepare($query);
							$c_params = array(
								":m_no"=>$order_info['m_no'],
								":m_id"=>$order_info['m_id'],
								":ordno"=>$value['ordno'],
								":product_code"=>$value['product_code'],
								":product_name"=>$value['product_name'],
								":ztorm_item_id"=>$sub_value['item_id'],
								":ztorm_item_name"=>$sub_value['item_name'],
								":customer_product_id"=>$zt_ord_no,
								":ztorm_publisher"=>$sub_value['item_publisher'],
								":ztorm_platform"=>$sub_value['item_platform'],
								":ord_ymd"=>date('Y-m-d'),
							);
							//print_r($c_params);
							$logger->info($c_params);
							$stmt->execute($c_params);
							
							$order_status="2";
							$send_status = "delivered";
							$order_system="Ztorm";
						break;
						case "8": //Vaultn API 주문
							$order_system="Vaultn";
							
							$params = array(
								"sku"=>$sub_value['item_id'],
								"ipAddress"=>$ip,
								"salesPriceGross"=>$value['price'],
								"clientOrderReference"=>$value['ordno'],
								"clientCustomerReference"=>(string)$order_info['m_no'],
							);
							$logger->info($params);
							$vaultn_data = $vaultn->runOrderCreate($params);
							$logger->info($vaultn_data);

							if($vaultn_data->orderId){
								$query="insert into tbl_order_item_vaultn set m_no=:m_no,m_id=:m_id,orderId=:orderId,clientOrderReference=:clientOrderReference,sku=:sku,clientCustomerReference=:clientCustomerReference,created=:created,status=:status,salesCurrency=:salesCurrency,salesCountry=:salesCountry,salesCountryCode=:salesCountryCode,salesPriceGross=:salesPriceGross,publisherName=:publisherName,publisherGuid=:publisherGuid,priceModel=:priceModel,priceListGuid=:priceListGuid,countryCode=:countryCode,srpCurrency=:srpCurrency,purchasePriceCurrency=:purchasePriceCurrency,baseSRP=:baseSRP,discountedSRP=:discountedSRP,netDiscountedSRP=:netDiscountedSRP,priceListVAT=:priceListVAT,basePurchasePrice=:basePurchasePrice,promoPercentage=:promoPercentage,netPurchasePrice=:netPurchasePrice,estimatedMargin=:estimatedMargin,provider=:provider,fulfilmentStatus=:fulfilmentStatus,reg_date=now(),ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name ON DUPLICATE KEY UPDATE update_date=now()";
								$stmt = $conn->prepare($query);
								$c_params2 = array(
									":m_no"=>$order_info['m_no'],
									":m_id"=>$order_info['m_id'],
									":orderId"=>$vaultn_data->orderId,
									":clientOrderReference"=>$value['ordno'],
									":sku"=>$vaultn_data->orderItemDetails->sku,
									":clientCustomerReference"=>$order_info['m_no'],
									":created"=>$vaultn_data->created,
									":status"=>$vaultn_data->status,
									":salesCurrency"=>$vaultn_data->orderDetails->salesCurrency,
									":salesCountry"=>$vaultn_data->orderDetails->salesCountry,
									":salesCountryCode"=>$vaultn_data->orderDetails->salesCountryCode,
									":salesPriceGross"=>$vaultn_data->orderDetails->salesPriceGross,
									":publisherName"=>$vaultn_data->orderDetails->priceListDetails->publisherName,
									":publisherGuid"=>$vaultn_data->orderDetails->priceListDetails->publisherGuid,
									":priceModel"=>$vaultn_data->orderDetails->priceListDetails->priceModel,
									":priceListGuid"=>$vaultn_data->orderDetails->priceListDetails->priceListGuid,
									":countryCode"=>$vaultn_data->orderDetails->priceListDetails->countryCode,
									":srpCurrency"=>$vaultn_data->orderDetails->priceListDetails->srpCurrency,
									":purchasePriceCurrency"=>$vaultn_data->orderDetails->priceListDetails->purchasePriceCurrency,
									":baseSRP"=>$vaultn_data->orderDetails->priceListDetails->baseSRP,
									":discountedSRP"=>$vaultn_data->orderDetails->priceListDetails->discountedSRP,
									":netDiscountedSRP"=>$vaultn_data->orderDetails->priceListDetails->netDiscountedSRP,
									":priceListVAT"=>$vaultn_data->orderDetails->priceListDetails->priceListVAT,
									":basePurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->basePurchasePrice,
									":promoPercentage"=>$vaultn_data->orderDetails->priceListDetails->promoPercentage,
									":netPurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->netPurchasePrice,
									":estimatedMargin"=>$vaultn_data->orderDetails->priceListDetails->estimatedMargin,
									":provider"=>$vaultn_data->orderItemDetails->provider,
									":fulfilmentStatus"=>$vaultn_data->orderItemDetails->fulfilmentStatus,
									":ord_ymd"=>date('Y-m-d'),
									":product_code"=>$value['product_code'],
									":product_name"=>$value['product_name'],
									":Name"=>$sub_value['item_name'],
								);
								$logger->info($c_params2);
								$stmt->execute($c_params2);
								
								
								$order_status="2";
								$send_status = "delivered";
							}else{
								$order_status="1";
								$send_status = "fail";
							}
						break;
						case "9": //Genba API 주문
							$order_system="Genba";
							if($value['is_preorder']=="Y"){ // 예약구매
								$reservationid = "";
								$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
								$logger->info($order_response);
								$Created = $order_response->Created;
								$Expiration="";

							}else{ // 일반구매
								$reservation_response = $genba->runGenbaPlaceReservationAsync($sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
								$logger->info($reservation_response);
								
								if($reservation_response->Code=="2007"){ //품절 back-order처리
									$reservationid = "";
									$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
									$logger->info($order_response);
									$Created = $order_response->Created;
									$Expiration="";
								}else{ // 정상판매
									$reservationid = $reservation_response->ID;
									$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
									$logger->info($order_response);
									$Created = $reservation_response->Created;
									$Expiration = $reservation_response->Expiration;
								}
							}
							if($order_response->ID){ // Genba 주문성공
								$genba_query = "insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,ID=:ID,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name,Platform=:Platform,Publisher=:Publisher";
								$stmt = $conn->prepare($genba_query);
								$params = array(
									':m_no'=> $order_info['m_no'],
									':m_id'=> $order_info['m_id'],
									':ordno'=> $value['ordno'],
									':ID' =>$order_response->ID,
									':ClientTransactionID'=> $order_response->ClientTransactionID,
									':Sku' =>$order_response->Sku,
									':Created' =>$Created,
									':Expiration' =>$Expiration,
									':State' =>$order_response->State,
									':CommunicatedBuyingPrice' =>$order_response->CommunicatedBuyingPrice->Amount,
									':ActualBuyingPrice' =>$order_response->ActualBuyingPrice->Amount,
									':NetAmount' =>$order_response->SellingPrice->NetAmount,
									':GrossAmount' =>$order_response->SellingPrice->GrossAmount,
									':ReservationID' =>$order_response->ReservationID,
									":ord_ymd"=>date('Y-m-d'),
									":product_code"=>$value['product_code'],
									":product_name"=>$value['product_name'],
									":Name"=>$sub_value['Name'],
									":Platform"=>$sub_value['Platform'],
									":Publisher"=>$sub_value['Publisher'],
									
								);
								$stmt->execute($params);
								
								$order_status="2";
								$send_status = "delivered";
							}else{ // Genba 주문실패
								$query="insert into  genba_error_log set ordno=:ordno,sku=:sku,name=:name,Code=:Code,Details=:Details,reg_date=now()";
								$params = array(
									":ordno"=>$value['ordno'],
									":sku"=>$sub_value['item_id'],
									":name"=>$sub_value['Name'],
									":Code"=>$order_response->Code,
									":Details"=>$order_response->Details,
								);
								$stmt = $conn->prepare($query);
								$stmt->execute($params);
								$order_status="1";
								$send_status = "fail";
							}
						break;
					}
				}
			break;
			case "2": //실물상품 주문
				if($_SESSION['member']['name']){
					$name = $_SESSION['member']['name'];
				}else{
					$name = $_SESSION['member']['nickname'];
				}

				$query="insert into tbl_order_shipment set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,model_code=:model_code,model_name=:model_name,courier_name=:courier_name,shipment_status='2'";
				$stmt = $conn->prepare($query);
				$d_params = array(
					":settle_no"=>$settle_no,
					":ordno"=>$value['ordno'],
					":product_code"=>$value['product_code'],
					":product_name"=>$value['product_name'],
					":model_code"=>$value['model_code'],
					":model_name"=>$value['model_name'],
					":courier_name"=>$name
				);
				$logger->info($d_params);
				$stmt->execute($d_params);
				$order_status="2";
			break;
			case "3": //디지털 + 실물상품 배송
				if($_SESSION['member']['name']){
					$name = $_SESSION['member']['name'];
				}else{
					$name = $_SESSION['member']['nickname'];
				}
				//디지털 상품 주문
				$send_status = "pending";
				$item_order_id = "";
				foreach($delivery_item_list as $sub_value){
					switch($sub_value['order_system']){
						case "1": //Asset API 주문
							$order_system="Asset";
							try{
								$asset_response = $asset->runReserveRegister($order_info['m_id'],$value['ordno'],$sub_value['item_id']);
								$logger->info($asset_response);
								foreach($asset_response->list as $asset_key=>$asset_item){
									$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd ";
									$stmt = $conn->prepare($query);
									$c_params = array(
										":m_no"=>$order_info['m_no'],
										":m_id"=>$order_info['m_id'],
										":ordno"=>$asset_item->po,
										":product_code"=>$value['product_code'],
										":product_name"=>$value['product_name'],
										":asset_id"=>$asset_item->assetId,
										":asset_name"=>$sub_value['item_name'],
										":reserve_id"=>$asset_item->reserveId,
										":asset_publisher"=>$sub_value['item_publisher'],
										":asset_platform"=>$sub_value['item_platform'],
										":asset_type"=>$sub_value['item_type'],
										":ord_ymd"=>date('Y-m-d'),
									);
									$stmt->execute($c_params);
								}
								
								$order_status="2";
								$send_status = "delivered";
							}catch(Exception $e){
								print_r($e);
								$order_status="1";
								$send_status = "fail";
							}
						break;
						case "2": //Ztorm API 주문
							if($_SESSION['member']['name']){
								$name = $_SESSION['member']['name'];
							}else{
								$name = $_SESSION['member']['nickname'];
							}
							//회원가입
							$member_params = array(
									"RetailerCustomerID"=>$order_info['m_id'],
									"Username"=>$name,
									"Email"=>$order_info['m_id'],
									"FirstName"=>'',
									"LastName"=>'',
									"CountryCode"=>'KR',
									"YearOfBirth"=>''
							);
							$member_response = $ztorm->runCreateCustomer($member_params);
							$logger->info($member_response);
							
							$zt_ord_no = $ztorm->runZtormOrder($order_info['m_id'],$ip,$value['ordno'],$sub_value['item_id'],$value['price'],$payment_method,$value['publisher_code']);
							$logger->info($zt_ord_no);
							
							$query="insert into tbl_order_item_ztorm set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,ztorm_item_id=:ztorm_item_id,ztorm_item_name=:ztorm_item_name,customer_product_id=:customer_product_id,ztorm_publisher=:ztorm_publisher,ztorm_platform=:ztorm_platform,order_date=now(),ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE batch_date=now()";
							$stmt = $conn->prepare($query);
							$c_params = array(
								":m_no"=>$order_info['m_no'],
								":m_id"=>$order_info['m_id'],
								":ordno"=>$value['ordno'],
								":product_code"=>$value['product_code'],
								":product_name"=>$value['product_name'],
								":ztorm_item_id"=>$sub_value['item_id'],
								":ztorm_item_name"=>$sub_value['item_name'],
								":customer_product_id"=>$zt_ord_no,
								":ztorm_publisher"=>$sub_value['item_publisher'],
								":ztorm_platform"=>$sub_value['item_platform'],
								":ord_ymd"=>date('Y-m-d'),
							);
							//print_r($c_params);
							$logger->info($c_params);
							$stmt->execute($c_params);
							
							$order_status="2";
							$send_status = "delivered";
							$order_system="Ztorm";
						break;
						case "8": //Vaultn API 주문
							$order_system="Vaultn";
							
							$params = array(
								"sku"=>$sub_value['item_id'],
								"ipAddress"=>$ip,
								"salesPriceGross"=>$value['price'],
								"clientOrderReference"=>$value['ordno'],
								"clientCustomerReference"=>(string)$order_info['m_no'],
							);
							$vaultn_data = $vaultn->runOrderCreate($params);
							$logger->info($vaultn_data);

							if($vaultn_data->orderId){
								$query="insert into tbl_order_item_vaultn set m_no=:m_no,m_id=:m_id,orderId=:orderId,clientOrderReference=:clientOrderReference,sku=:sku,clientCustomerReference=:clientCustomerReference,created=:created,status=:status,salesCurrency=:salesCurrency,salesCountry=:salesCountry,salesCountryCode=:salesCountryCode,salesPriceGross=:salesPriceGross,publisherName=:publisherName,publisherGuid=:publisherGuid,priceModel=:priceModel,priceListGuid=:priceListGuid,countryCode=:countryCode,srpCurrency=:srpCurrency,purchasePriceCurrency=:purchasePriceCurrency,baseSRP=:baseSRP,discountedSRP=:discountedSRP,netDiscountedSRP=:netDiscountedSRP,priceListVAT=:priceListVAT,basePurchasePrice=:basePurchasePrice,promoPercentage=:promoPercentage,netPurchasePrice=:netPurchasePrice,estimatedMargin=:estimatedMargin,provider=:provider,fulfilmentStatus=:fulfilmentStatus,reg_date=now(),ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name ON DUPLICATE KEY UPDATE update_date=now()";
								$stmt = $conn->prepare($query);
								$c_params2 = array(
									":m_no"=>$order_info['m_no'],
									":m_id"=>$order_info['m_id'],
									":orderId"=>$vaultn_data->orderId,
									":clientOrderReference"=>$value['ordno'],
									":sku"=>$vaultn_data->orderItemDetails->sku,
									":clientCustomerReference"=>$order_info['m_no'],
									":created"=>$vaultn_data->created,
									":status"=>$vaultn_data->status,
									":salesCurrency"=>$vaultn_data->orderDetails->salesCurrency,
									":salesCountry"=>$vaultn_data->orderDetails->salesCountry,
									":salesCountryCode"=>$vaultn_data->orderDetails->salesCountryCode,
									":salesPriceGross"=>$vaultn_data->orderDetails->salesPriceGross,
									":publisherName"=>$vaultn_data->orderDetails->priceListDetails->publisherName,
									":publisherGuid"=>$vaultn_data->orderDetails->priceListDetails->publisherGuid,
									":priceModel"=>$vaultn_data->orderDetails->priceListDetails->priceModel,
									":priceListGuid"=>$vaultn_data->orderDetails->priceListDetails->priceListGuid,
									":countryCode"=>$vaultn_data->orderDetails->priceListDetails->countryCode,
									":srpCurrency"=>$vaultn_data->orderDetails->priceListDetails->srpCurrency,
									":purchasePriceCurrency"=>$vaultn_data->orderDetails->priceListDetails->purchasePriceCurrency,
									":baseSRP"=>$vaultn_data->orderDetails->priceListDetails->baseSRP,
									":discountedSRP"=>$vaultn_data->orderDetails->priceListDetails->discountedSRP,
									":netDiscountedSRP"=>$vaultn_data->orderDetails->priceListDetails->netDiscountedSRP,
									":priceListVAT"=>$vaultn_data->orderDetails->priceListDetails->priceListVAT,
									":basePurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->basePurchasePrice,
									":promoPercentage"=>$vaultn_data->orderDetails->priceListDetails->promoPercentage,
									":netPurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->netPurchasePrice,
									":estimatedMargin"=>$vaultn_data->orderDetails->priceListDetails->estimatedMargin,
									":provider"=>$vaultn_data->orderItemDetails->provider,
									":fulfilmentStatus"=>$vaultn_data->orderItemDetails->fulfilmentStatus,
									":ord_ymd"=>date('Y-m-d'),
									":product_code"=>$value['product_code'],
									":product_name"=>$value['product_name'],
									":Name"=>$sub_value['item_name'],
								);
								$logger->info($c_params2);
								$stmt->execute($c_params2);
								
								
								$order_status="2";
								$send_status = "delivered";
							}else{
								$order_status="1";
								$send_status = "fail";
							}
						break;
						case "9": //Genba API 주문
							$order_system="Genba";
							if($value['is_preorder']=="Y"){ // 예약구매
								$reservationid = "";
								$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
								$logger->info($order_response);
								$Created = $order_response->Created;
								$Expiration="";

							}else{ // 일반구매
								$reservation_response = $genba->runGenbaPlaceReservationAsync($sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
								$logger->info($reservation_response);
								
								if($reservation_response->Code=="2007"){ //품절 back-order처리
									$reservationid = "";
									$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
									$logger->info($order_response);
									$Created = $order_response->Created;
									$Expiration="";
								}else{ // 정상판매
									$reservationid = $reservation_response->ID;
									$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
									$logger->info($order_response);
									$Created = $reservation_response->Created;
									$Expiration = $reservation_response->Expiration;
								}
							}
							if($order_response->ID){ // Genba 주문성공
								$genba_query = "insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,ID=:ID,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name,Platform=:Platform,Publisher=:Publisher";
								$stmt = $conn->prepare($genba_query);
								$params = array(
									':m_no'=> $order_info['m_no'],
									':m_id'=> $order_info['m_id'],
									':ordno'=> $value['ordno'],
									':ID' =>$order_response->ID,
									':ClientTransactionID'=> $order_response->ClientTransactionID,
									':Sku' =>$order_response->Sku,
									':Created' =>$Created,
									':Expiration' =>$Expiration,
									':State' =>$order_response->State,
									':CommunicatedBuyingPrice' =>$order_response->CommunicatedBuyingPrice->Amount,
									':ActualBuyingPrice' =>$order_response->ActualBuyingPrice->Amount,
									':NetAmount' =>$order_response->SellingPrice->NetAmount,
									':GrossAmount' =>$order_response->SellingPrice->GrossAmount,
									':ReservationID' =>$order_response->ReservationID,
									":ord_ymd"=>date('Y-m-d'),
									":product_code"=>$value['product_code'],
									":product_name"=>$value['product_name'],
									":Name"=>$sub_value['Name'],
									":Platform"=>$sub_value['Platform'],
									":Publisher"=>$sub_value['Publisher'],
									
								);
								$stmt->execute($params);
								
								$order_status="2";
								$send_status = "delivered";
							}else{ // Genba 주문실패
								$query="insert into  genba_error_log set ordno=:ordno,sku=:sku,name=:name,Code=:Code,Details=:Details,reg_date=now()";
								$params = array(
									":ordno"=>$value['ordno'],
									":sku"=>$sub_value['item_id'],
									":name"=>$sub_value['Name'],
									":Code"=>$order_response->Code,
									":Details"=>$order_response->Details,
								);
								$stmt = $conn->prepare($query);
								$stmt->execute($params);
								$order_status="1";
								$send_status = "fail";
							}
						break;
					}
				}
				
				//실물상품 주문
				$query="insert into tbl_order_shipment set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,model_code=:model_code,model_name=:model_name,courier_name=:courier_name,shipment_status='2'";
				$stmt = $conn->prepare($query);
				$d_params = array(
					":settle_no"=>$settle_no,
					":ordno"=>$value['ordno'],
					":product_code"=>$value['product_code'],
					":product_name"=>$value['product_name'],
					":model_code"=>$value['model_code'],
					":model_name"=>$value['model_name'],
					":courier_name"=>$name,
				);
				$logger->info($d_params);
				$stmt->execute($d_params);
				$order_status="2";
			break;
		}
		
		$query="update tbl_order_item set status=:status,send_status=:send_status,order_system=:order_system where ordno=:ordno";
		$params = array(
			":status"=>$order_status,
			":send_status"=>$send_status,
			":order_system"=>$order_system,
			":ordno"=>$value['ordno'],
		);
		$logger->info($params);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
	}
	
	//장바구니 삭제
	$query = "delete from tbl_cart where m_no=:m_no and selected='1'";
	$stmt = $conn->prepare($query);
	$params = array(
		':m_no'=>$order_info['m_no'],
	);
	$logger->info($params);
	$stmt->execute($params);
	
	//##############################################################
	//사용 적립금 차감
	//##############################################################
	$use_emoney = $order->getOrderUsePoint($settle_no);
	if($use_emoney>0){
		$member->setMemberEmoney($order_info['m_no'],$use_emoney,'주문결제시 할인',$settle_no);
	}
} catch (Exception $e) {
	exit;
}
?>