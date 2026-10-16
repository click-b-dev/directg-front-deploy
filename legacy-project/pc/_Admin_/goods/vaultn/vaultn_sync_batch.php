<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
$connectionGuid = filter_input(INPUT_POST, 'connectionGuid', FILTER_SANITIZE_STRING);

$vaultn = new Vaultn();
$result = $vaultn->runConnectionProduct($connectionGuid,$page);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$count = 1;
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

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>