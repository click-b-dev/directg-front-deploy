<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$vaultn = new Vaultn();
	switch($mode){
		case "promotion":
			$connectionGuid = filter_input(INPUT_GET, 'connectionGuid', FILTER_SANITIZE_STRING);
			$promotionGuid = filter_input(INPUT_GET, 'promotionGuid', FILTER_SANITIZE_STRING);
			$result = $vaultn->runConnectionPromotionRetrieve($connectionGuid,$promotionGuid);
			
			foreach($result->items as $value){
				$query="insert into vaultn_promotion set promotionGuid=:promotionGuid,title=:title,validFrom=:validFrom,validTo=:validTo,sku=:sku,discountPercentage=:discountPercentage,reg_date=now() ON DUPLICATE KEY UPDATE validFrom=:validFrom,validTo=:validTo,discountPercentage=:discountPercentage,update_date=now()";
				$param = array(
					":promotionGuid"=>$result->guid,
					":title"=>$result->title,
					":validFrom"=>date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($result->validFrom))),
					":validTo"=>date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($result->validTo))),
					":sku"=>$value->sku,
					":discountPercentage"=>$value->discountPercentage,
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($param);
			}
			print_r($result);
		break;
		case "product":
			$connectionGuid = filter_input(INPUT_GET, 'connectionGuid', FILTER_SANITIZE_STRING);
			$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
			$result = $vaultn->runConnectionProduct($connectionGuid,$page);
			// print_r($result);
			 foreach($result->payload as $key=>$value){
				if(count($value->skus)>0){
					foreach($value->skus as $skus){
						if(count($skus->prices)>0){
							foreach($skus->prices as $price){
								$query="insert into vaultn_catalogue set connectionGuid=:connectionGuid,publisher=:publisher,productGUID=:productGUID,title=:title,productType=:productType,edition=:edition,sku=:sku,provider=:provider,regionCode=:regionCode,priceListGuid=:priceListGuid,srp=:srp,purchasePrice=:purchasePrice,priceListVAT=:priceListVAT,currencyCode=:currencyCode,pricePoint=:pricePoint,batch_date=now() ON DUPLICATE KEY UPDATE title=:title,provider=:provider,regionCode=:regionCode,priceListGuid=:priceListGuid,srp=:srp,purchasePrice=:purchasePrice,priceListVAT=:priceListVAT,currencyCode=:currencyCode,pricePoint=:pricePoint,update_date=now()";
								$param = array(
									":connectionGuid"=>$connectionGuid,
									":publisher"=>$value->publisher,
									":productGUID"=>$value->guid,
									":title"=>$value->title,
									":productType"=>$value->productType,
									":edition"=>$value->edition,
									":sku"=>$skus->sku,
									":provider"=>$skus->provider,
									":regionCode"=>$skus->regionCode,
									":priceListGuid"=>$price->priceListGuid,
									":srp"=>$price->srp,
									":purchasePrice"=>$price->purchasePrice,
									":priceListVAT"=>$price->priceListVAT,
									":currencyCode"=>$price->currencyCode,
									":pricePoint"=>$price->pricePoint,
								);
								$stmt = $conn->prepare($query);
								$stmt->execute($param);
								
								echo "[1] ".$count." ".$value->guid."/".$value->title."/".$skus->sku."/".$price->currencyCode."</br>";
							}
						}else{
							$query="insert into vaultn_catalogue set connectionGuid=:connectionGuid,publisher=:publisher,productGUID=:productGUID,title=:title,productType=:productType,edition=:edition,sku=:sku,provider=:provider,regionCode=:regionCode,batch_date=now() ON DUPLICATE KEY UPDATE provider=:provider,regionCode=:regionCode,update_date=now()";
							$param = array(
								":connectionGuid"=>$connectionGuid,
								":publisher"=>$value->publisher,
								":productGUID"=>$value->guid,
								":title"=>$value->title,
								":productType"=>$value->productType,
								":edition"=>$value->edition,
								":sku"=>$skus->sku,
								":provider"=>$skus->provider,
								":regionCode"=>$skus->regionCode
							);
							$stmt = $conn->prepare($query);
							$stmt->execute($param);
							echo "[2] ".$count." ".$value->guid."/".$value->title."</br>";
						}
					}
				}else{
					$query="insert into vaultn_catalogue set connectionGuid=:connectionGuid,publisher=:publisher,productGUID=:productGUID,title=:title,productType=:productType,edition=:edition,batch_date=now() ON DUPLICATE KEY UPDATE update_date=now()";
					$param = array(
						":connectionGuid"=>$connectionGuid,
						":publisher"=>$value->publisher,
						":productGUID"=>$value->guid,
						":title"=>$value->title,
						":productType"=>$value->productType,
						":edition"=>$value->edition,
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($param);
					echo "[3] ".$count." ".$value->guid."/".$value->title."</br>";
				}
				$count++;
			}
		break;
		case "stock":
			$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
		
			$result = $vaultn->runVaultnStock($page);
			
			foreach($result->stockLevelInformation as $sub_value){
				print_r($sub_value);
				foreach($sub_value->connections as $stock){
					$query="update vaultn_catalogue set reservedUnits=:reservedUnits,networkUnits=:networkUnits,update_date=now() where sku=:sku";
					$param = array(
						":reservedUnits"=>$stock->reservedUnits,
						":networkUnits"=>$stock->networkUnits,
						":sku"=>$sub_value->sku
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($param);
					
					$query="update tbl_goods_item_delivery set stock=:stock where item_id=:item_id";
					$param = array(
						":stock"=>$stock->networkUnits,
						":item_id"=>$sub_value->sku
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($param);
				}
				
				
			}
		break;
		case "order":
			$ip = "14.40.7.241";
			$sku = "BET2-PA-STE-THEEVILW12-XXX-REG24";
			$price = "6900";
			$ordno="N1774265656369_1";
			$m_no="1272515";
			$m_id="jsy1527@naver.com";
			$product_code="50005065";
			$product_name="이블 위딘 번들";
		
			$params = array(
			"sku"=>$sku,
			"ipAddress"=>$ip,
			"salesPriceGross"=>$price,
			"clientOrderReference"=>$ordno,
			"clientCustomerReference"=>$m_no,
		);
		$vaultn_data = $vaultn->runOrderCreate($params);
		//$logger->info($vaultn_data);
		print_r($vaultn_data);

			if($vaultn_data->orderId){
				$query="insert into tbl_order_item_vaultn set m_no=:m_no,m_id=:m_id,orderId=:orderId,clientOrderReference=:clientOrderReference,sku=:sku,clientCustomerReference=:clientCustomerReference,created=:created,status=:status,salesCurrency=:salesCurrency,salesCountry=:salesCountry,salesCountryCode=:salesCountryCode,salesPriceGross=:salesPriceGross,publisherName=:publisherName,publisherGuid=:publisherGuid,priceModel=:priceModel,priceListGuid=:priceListGuid,countryCode=:countryCode,srpCurrency=:srpCurrency,purchasePriceCurrency=:purchasePriceCurrency,baseSRP=:baseSRP,discountedSRP=:discountedSRP,netDiscountedSRP=:netDiscountedSRP,priceListVAT=:priceListVAT,basePurchasePrice=:basePurchasePrice,promoPercentage=:promoPercentage,netPurchasePrice=:netPurchasePrice,estimatedMargin=:estimatedMargin,provider=:provider,fulfilmentStatus=:fulfilmentStatus,reg_date=now(),ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name ON DUPLICATE KEY UPDATE update_date=now()";
				$stmt = $conn->prepare($query);
				$c_params2 = array(
					":m_no"=>$m_no,
					":m_id"=>$m_id,
					":orderId"=>$vaultn_data->orderId,
					":clientOrderReference"=>$ordno,
					":sku"=>$vaultn_data->orderItemDetails->sku,
					":clientCustomerReference"=>$m_no,
					":created"=>$vaultn_data->created,
					":status"=>$vaultn_data->status,
					":salesCurrency"=>$vaultn_data->orderDetails->salesCurrency,
					":salesCountry"=>$vaultn_data->orderDetails->salesCountry,
					":salesCountryCode"=>$vaultn_data->orderDetails->salesCountryCode,
					":salesPriceGross"=>$vaultn_data->orderDetails->salesPriceGross,
					":publisherName"=>$vaultn_data->orderDetails->publisherName,
					":publisherGuid"=>$vaultn_data->orderDetails->publisherGuid,
					":priceModel"=>$vaultn_data->orderDetails->priceModel,
					":priceListGuid"=>$vaultn_data->orderDetails->priceListGuid,
					":countryCode"=>$vaultn_data->orderDetails->countryCode,
					":srpCurrency"=>$vaultn_data->orderDetails->srpCurrency,
					":purchasePriceCurrency"=>$vaultn_data->orderDetails->purchasePriceCurrency,
					":baseSRP"=>$vaultn_data->orderDetails->baseSRP,
					":discountedSRP"=>$vaultn_data->orderDetails->discountedSRP,
					":netDiscountedSRP"=>$vaultn_data->orderDetails->netDiscountedSRP,
					":priceListVAT"=>$vaultn_data->orderDetails->priceListVAT,
					":basePurchasePrice"=>$vaultn_data->orderDetails->basePurchasePrice,
					":promoPercentage"=>$vaultn_data->orderDetails->promoPercentage,
					":netPurchasePrice"=>$vaultn_data->orderDetails->netPurchasePrice,
					":estimatedMargin"=>$vaultn_data->orderDetails->estimatedMargin,
					":provider"=>$vaultn_data->orderItemDetails->provider,
					":fulfilmentStatus"=>$vaultn_data->orderItemDetails->fulfilmentStatus,
					":ord_ymd"=>date('Y-m-d'),
					":product_code"=>$product_code,
					":product_name"=>$product_name,
					":Name"=>'',
				);
				print_r($c_params2);
				//$logger->info($c_params2);
				$stmt->execute($c_params2);
			}
		break;
		case "order_cancel":
			$orderid = filter_input(INPUT_GET, 'orderid', FILTER_SANITIZE_STRING);
			$response = $vaultn->runCancelOrder($orderid);
			print_r($response);
		break;
	}


}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>