<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$api_type = filter_input(INPUT_GET, 'api_type', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$publisher_id = filter_input(INPUT_GET, 'publisher_id', FILTER_SANITIZE_STRING);

if(!$page){
	$offset = 0;
}else{
	$offset = 100 *($page-1);
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$mode ="";
	$ztorm = new Ztorm($mode);

	switch($api_type){
		case "promotion":
			$params = array(
				"Offset"=>$offset,
				"Length"=>"200",
				"From"=>strtotime("-72hour")
			);
			$discount_response = $ztorm->runGetDiscounts($params);
			
			foreach($discount_response->Value->Discount as $value2){
				$is_rrp = false;
				foreach($value2->Countries->CountryCode as $country){
					if($country=="KR"){
						$is_rrp = true;
						$country_code = $country;
						break;
					}
				}
				
				if($is_rrp){
					foreach($value2->Products->ProductID as $value3){
						$ProductID = $value3;
						$ValidFrom = $value2->ValidFrom->UnixTimestamp;
						$ValidTo = $value2->ValidTo->UnixTimestamp;
						$Percent = $value2->Percent;

						$chk_query="select count(*) from ztorm_promotion where zt_item_id=:zt_item_id and valid_from=:valid_from and country_code=:country_code";
						$stmt = $conn->prepare($chk_query);
						$params2 = array(
							':zt_item_id'=>$ProductID ,
							':valid_from'=> $ValidFrom,
							':country_code'=>$country_code
							
						);
						$stmt->execute($params2);
						$chk_data = $stmt->fetchColumn();
						
						if($chk_data==0){
							$query = "insert into ztorm_promotion set zt_item_id=:zt_item_id,country_code=:country_code,valid_from=:valid_from,valid_to=:valid_to,percent=:percent,reg_date=now()";
							$stmt = $conn->prepare($query);
							$params2 = array(
								':zt_item_id'=>$ProductID ,
								':country_code'=>$country_code ,
								':valid_from'=> $ValidFrom,
								':valid_to'=> $ValidTo,
								':percent'=> $Percent
								
							);
							$stmt->execute($params2);
						}
						//echo $ProductID." / ".$ValidFrom."/".$ValidTo."/".$Percent."/".$ValidTo."<br/>";	
					}
					//print_r($params2);
				}
				$loop++;
			}
		break;
		case "reorder":
			$m_no="1088815";
			$m_id = "kyw4570742@gmail.com";
			$customer_ip = "222.235.160.83";
			$item_id = "41367";
			$item_price = "41000";
			$settlekind = "payco";
			$item_publisher_code="187";
			$ordno = "P1758005997192_2";
			$product_code="50003115";
			$user_name = explode("@",$m_id);
			//ztorm 회원가입
			$params = array(
						"RetailerCustomerID"=>$m_id,
						"Username"=>$user_name[0],
						"Email"=>$m_id,
						"FirstName"=>'',
						"LastName"=>'',
						"CountryCode"=>'KR',
						"YearOfBirth"=>''
				);
			$member_response = $ztorm->runCreateCustomer($params);
			print_r($member_response);

			$zt_ord_no = $ztorm->runZtormOrder($m_id,$customer_ip,$ordno,$item_id,$item_price,$settlekind,$item_publisher_code);
			
			print_r($zt_ord_no);

		break;
		case "publisher":
		break;
		case "product_add":
			$zt_item_id = filter_input(INPUT_GET, 'zt_item_id', FILTER_SANITIZE_STRING);
			$params = array(
				"ProductID"=>$zt_item_id,
			);
			$response = $ztorm->runGetProduct($params);
			
			echo $response->Value->Product->Name."/".$response->Value->Product->RegionTag."<br/>";
			
			//print_r($response->Value->Product);
			if($response->Value->Product->ID){
				$query= "insert into ztorm_catalogue set ProductID=:ProductID,name=:name,publisher_id=:publisher_id,publisher_name=:publisher_name,status=:status,UpdateTimestamp=:UpdateTimestamp,OrderDate=:OrderDate,RegionTag=:RegionTag,IsDLC=:IsDLC,blacklist=:blacklist,whiteList=:whiteList,HasInstallKey=:HasInstallKey,download_date=:download_date,release_date=:release_date,provider_channel=:provider_channel,provider_name=:provider_name,reg_date=now(),batch_date=now(),view_flag='Y' ON DUPLICATE KEY UPDATE provider_channel=:provider_channel,provider_name=:provider_name,publisher_name=:publisher_name,RegionTag=:RegionTag,status=:status,release_date=:release_date,batch_date=now(),view_flag='Y'";
				$stmt = $conn->prepare($query);
				$q_params = array(
					":ProductID"=>$response->Value->Product->ID,
					":name"=>$response->Value->Product->Name,
					":publisher_id"=>$response->Value->Product->PublisherID,
					":publisher_name"=>$response->Value->Product->PublisherName,
					":status"=>$response->Value->Product->Status,
					":UpdateTimestamp"=>$response->Value->Product->UpdateTimestamp->UnixTimestamp,
					":OrderDate"=>$response->Value->Product->OrderDate->UnixTimestamp,
					":RegionTag"=>$response->Value->Product->RegionTag,
					":IsDLC"=>$response->Value->Product->IsDLC,
					":blacklist"=>json_encode($response->Value->Product->GeoRestrictions->BlackList->CountryCode),
					":whiteList"=>json_encode($response->Value->Product->GeoRestrictions->WhiteList->CountryCode),
					":HasInstallKey"=>$response->Value->Product->HasInstallKey,
					":download_date"=>$response->Value->Product->DownloadDate->UnixTimestamp,
					":release_date"=>$response->Value->Product->ReleaseDate->UnixTimestamp,
					":provider_channel"=>$response->Value->Product->Providers->Provider->Channel,
					":provider_name"=>$response->Value->Product->Providers->Provider->Name,
				);
				$stmt->execute($q_params);
			}
		break;
		case "product":
			$params = array(
				"Offset"=>$offset,
				"Length"=>"100",
				"PublisherID"=>$publisher_id,
			);
			$response = $ztorm->runGetProducts($params);
			
			
			foreach($response->Value->Product as $key=>$value){
				
				$is_product = true;
				foreach($value->GeoRestrictions->BlackList->CountryCode as $country){
					if($country=="KR"){
						$is_product = false;
					}
				}
				
				foreach($value->GeoRestrictions->WhiteList->CountryCode as $country){
					if($country=="KR"){
						$is_product = true;
					}
				}
				
				if($is_product==true){
					echo $value->Name."/".$value->RegionTag."<br/>";
					$query= "insert into ztorm_catalogue set ProductID=:ProductID,name=:name,publisher_id=:publisher_id,publisher_name=:publisher_name,status=:status,UpdateTimestamp=:UpdateTimestamp,OrderDate=:OrderDate,RegionTag=:RegionTag,IsDLC=:IsDLC,blacklist=:blacklist,whiteList=:whiteList,HasInstallKey=:HasInstallKey,download_date=:download_date,release_date=:release_date,provider_channel=:provider_channel,provider_name=:provider_name,reg_date=now(),batch_date=now() ON DUPLICATE KEY UPDATE provider_channel=:provider_channel,provider_name=:provider_name,publisher_name=:publisher_name,RegionTag=:RegionTag,status=:status,release_date=:release_date,batch_date=now()";
					$stmt = $conn->prepare($query);
					$q_params = array(
						":ProductID"=>$value->ID,
						":name"=>$value->Name,
						":publisher_id"=>$value->PublisherID,
						":publisher_name"=>$value->PublisherName,
						":status"=>$value->Status,
						":UpdateTimestamp"=>$value->UpdateTimestamp->UnixTimestamp,
						":OrderDate"=>$value->OrderDate->UnixTimestamp,
						":RegionTag"=>$value->RegionTag,
						":IsDLC"=>$value->IsDLC,
						":blacklist"=>json_encode($value->GeoRestrictions->BlackList->CountryCode),
						":whiteList"=>json_encode($value->GeoRestrictions->WhiteList->CountryCode),
						":HasInstallKey"=>$value->HasInstallKey,
						":download_date"=>$value->DownloadDate->UnixTimestamp,
						":release_date"=>$value->ReleaseDate->UnixTimestamp,
						":provider_channel"=>$value->Providers->Provider->Channel,
						":provider_name"=>$value->Providers->Provider->Name,
					);
					$stmt->execute($q_params);
				}
				//print_r($q_params);
			}
		break;
		case "rrp_search":
			$zt_item_id = filter_input(INPUT_GET, 'zt_item_id', FILTER_SANITIZE_STRING);
			$params = array(
				"ProductID"=>$zt_item_id,
			);
			$response = $ztorm->runGetRecommendedRetailPrice($params);
			
			$ProductID = $response->Value->ProductPrice->ProductID;
			
			$view_flag='N';
			
			//print_r($response->Value->ProductPrice);
			
			foreach($response->Value->ProductPrice->Assignments->Assignment as $rrp){
				if($rrp->RRP->Currency=="KRW"){
					$query = "update ztorm_catalogue set rrp=:rrp,rrp_currency=:rrp_currency,view_flag='Y' where ProductID=:ProductID";
					$stmt = $conn->prepare($query);
					$q_params = array(
						":rrp"=>$rrp->RRP->Value,
						":rrp_currency"=>$rrp->RRP->Currency,
						":ProductID"=>$ProductID,
					);
					$stmt->execute($q_params);
					print_r($q_params);
					
					$view_flag='Y';
				}
			}
			
			$query = "update ztorm_catalogue set view_flag=:view_flag where ProductID=:ProductID";
			$stmt = $conn->prepare($query);
			$params = array(
				":view_flag"=>$view_flag,
				":ProductID"=>$ProductID,
			);
			$stmt->execute($params);
		break;
		case "ppr_batch":
			
			$params = array(
				"SaleCountryCode"=>"KR",
				"SaleTimestamp"=>strtotime('-7 day', time()),
			);
			$response = $ztorm->runGetProductCostEstimates($params);
			print_r($response);
		break;
		case "promotion":
			$params = array(
				"Offset"=>$offset,
				"Length"=>"200",
				"From"=>strtotime("-72hour")
			);
			$response = $ztorm->runGetDiscounts($params);
			
			$promotion = [];
			$promotion_item = [];
			
			$loop = 0;
			
			foreach($response->Value->Discount as $key=>$value){
				/*
				$promotion[]= array(
						"ValidFrom"=> $value->ValidFrom->UnixTimestamp,
						"ValidTo"=> $value->ValidTo->UnixTimestamp,
						"Percent"=> $value->Percent,
					);
				*/
				print_r($value);
			}
		break;
	}
	
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}
?>