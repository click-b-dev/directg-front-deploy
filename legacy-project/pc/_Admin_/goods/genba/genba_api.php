<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$api_type = filter_input(INPUT_GET, 'api_type', FILTER_SANITIZE_STRING);
$productid = filter_input(INPUT_GET, 'productid', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$mode ="";
	
	$genba = new Genba($mode);
	date_default_timezone_set('Asia/Seoul');
	
	switch($api_type){
		case "promotion":
			//처음부터 동기화(reset=1)면 세션 연속토큰 초기화 → 1페이지부터. 아니면 이어받기(세션 토큰 유지).
			$reset = filter_input(INPUT_GET, 'reset', FILTER_SANITIZE_STRING);
			if($reset=="1"){
				$_SESSION['genba']['ContinuationToken'] = "";
			}
			$fromDate = date('Y-m-d', strtotime('+1 day', strtotime(date('Y-m-d'))));
			$max_page  = 5; //클릭당 최대 5페이지까지만 동기화(내일 이후 종료 프로모션 전체는 양이 많음)
			$sync_done = false;
			for($pg=0; $pg<$max_page; $pg++){
				$response = $genba->runGenbaGetPromotionsAsync($fromDate,$toDate);
				foreach($response->Promotions as $key=>$value){
					echo$value->Name." / ". count($value->PromotionItems)."\n";
					foreach($value->PromotionItems as $sub_key=>$sub_value){
						if($sub_value->CurrencyCode=="KRW"){
							$query = "insert into genba_promotion set Name=:Name,PromotionId=:PromotionId,fromDate=:fromDate,toDate=:toDate,Sku=:Sku,CurrencyCode=:CurrencyCode,DiscountPercentage=:DiscountPercentage,OriginalSRP=:OriginalSRP,OriginalWSP=:OriginalWSP,DiscountedSRP=:DiscountedSRP,DiscountedWSP=:DiscountedWSP,batch_date=now() ON DUPLICATE KEY UPDATE DiscountPercentage=:DiscountPercentage";
							$stmt = $conn->prepare($query);
							$params = array(
								":Name"=>$value->Name,
								":PromotionId"=>$value->PromotionId,
								":fromDate"=>date("Y-m-d H:i:s",strtotime($value->From)),
								":toDate"=>date("Y-m-d H:i:s",strtotime($value->To)),
								":Sku"=>$sub_value->Sku,
								":CurrencyCode"=>$sub_value->CurrencyCode,
								":DiscountPercentage"=>$sub_value->DiscountPercentage,
								":OriginalSRP"=>$sub_value->OriginalSRP,
								":OriginalWSP"=>$sub_value->OriginalWSP,
								":DiscountedSRP"=>$sub_value->DiscountedSRP,
								":DiscountedWSP"=>$sub_value->DiscountedWSP,
							);
							$stmt->execute($params);
						}
					}
				}
				//다음 연속토큰이 없으면 마지막 페이지 → 종료(계속 돌면 세션이 비어 1페이지부터 재시작됨)
				if(!$response->ContinuationToken){
					$sync_done = true;
					break;
				}
			}
			if($sync_done){
				echo "\n== 마지막 페이지까지 동기화 완료 ==";
			}else{
				echo "\n== 5페이지 동기화 완료 — 이어서 받으려면 [Genba 프로모션 동기화]를 다시 클릭하세요 ==";
			}
		break;
		case "product_sync":
			$sku = filter_input(INPUT_GET, 'sku', FILTER_SANITIZE_STRING);
			$response =$genba->runGenbaGetProductAsync($sku);
				//print_r($response);
			
			if(strtotime($response->EndDate)>0){
				$query = "update genba_catalogue set EndDate=:EndDate where Sku=:Sku";
				$stmt = $conn->prepare($query);
				$params = array(
					":EndDate"=>date("Y-m-d H:i:s",strtotime($response->EndDate)),
					":Sku"=>$sku,
				);
				$stmt->execute($params);
				
			}else{
				$query = "insert into genba_catalogue set ProductID=:ProductID,Sku=:Sku,RegionCode=:RegionCode,Name=:Name,EtailerSplitPercentage=:EtailerSplitPercentage,IsBundle=:IsBundle,ReleaseDate=:ReleaseDate,DigitalReleaseDate=:DigitalReleaseDate,EndDate=:EndDate,PreReleaseDate=:PreReleaseDate,EstimatedReleaseDate=:EstimatedReleaseDate,Platform=:Platform,Publisher=:Publisher,PublisherLabel=:PublisherLabel,Developer=:Developer,PreLiveState=:PreLiveState,ProtectionSystem=:ProtectionSystem,WhitelistCountryCodes=:WhitelistCountryCodes,BlacklistCountryCodes=:BlacklistCountryCodes,reg_date=now(),is_dgkr='1' ON DUPLICATE KEY UPDATE batch_date=now(),RegionCode=:RegionCode,ReleaseDate=:ReleaseDate,DigitalReleaseDate=:DigitalReleaseDate,EndDate=:EndDate,PreReleaseDate=:PreReleaseDate,EstimatedReleaseDate=:EstimatedReleaseDate,Platform=:Platform,Publisher=:Publisher,PublisherLabel=:PublisherLabel,Developer=:Developer,PreLiveState=:PreLiveState,ProtectionSystem=:ProtectionSystem,WhitelistCountryCodes=:WhitelistCountryCodes,BlacklistCountryCodes=:BlacklistCountryCodes,EtailerSplitPercentage=:EtailerSplitPercentage,Name=:Name";
				$stmt = $conn->prepare($query);
				$params = array(
					":ProductID"=>$response->ProductID,
					":Sku"=>$response->Sku,
					":RegionCode"=>$response->RegionCode,
					":Name"=>$response->Name,
					":Sku"=>$response->Sku,
					":EtailerSplitPercentage"=>$response->EtailerSplitPercentage,
					":IsBundle"=>$response->IsBundle,
					":ReleaseDate"=>date("Y-m-d H:i:s",strtotime($response->ReleaseDate)),
					":DigitalReleaseDate"=>date("Y-m-d H:i:s",strtotime($response->DigitalReleaseDate)),
					":EndDate"=>date("Y-m-d H:i:s",strtotime($response->EndDate)),
					":PreReleaseDate"=>date("Y-m-d H:i:s",strtotime($response->PreReleaseDate)),
					":EstimatedReleaseDate"=>date("Y-m-d H:i:s",strtotime($response->EstimatedReleaseDate)),
					":Platform"=>$response->Platform,
					":Publisher"=>$response->Publisher,
					":PublisherLabel"=>$response->PublisherLabel,
					":Developer"=>$response->Developer,
					":PreLiveState"=>$response->PreLiveState,
					":ProtectionSystem"=>$response->ProtectionSystem,
					':WhitelistCountryCodes'=> json_encode($response->Restrictions->WhitelistCountryCodes),
					':BlacklistCountryCodes'=>  json_encode($response->Restrictions->BlacklistCountryCodes),
				);
				$stmt->execute($params);
				
				$title_query = "insert into genba_title set ProductID=:ProductID,Name=:Name,publisher=:publisher,ReleaseDate=:ReleaseDate,EtailerSplitPercentage=:EtailerSplitPercentage,batch_date=now() ON DUPLICATE KEY UPDATE ReleaseDate=:ReleaseDate,EtailerSplitPercentage=:EtailerSplitPercentage,batch_date=now()";
				$stmt = $conn->prepare($title_query);
				$params = array(
					":ProductID"=>$response->ProductID,
					":Name"=>$response->Name,
					":publisher"=>$response->Publisher,
					":ReleaseDate"=>date("Y-m-d H:i:s",strtotime($response->ReleaseDate)),
					":EtailerSplitPercentage"=>$response->EtailerSplitPercentage,
				);
				$stmt->execute($params);
			}
			print_r($params);
		break;
		case "product":
			$fromDate = date('Y-m-d', strtotime('-60 day', strtotime(date('Y-m-d'))));
			$response =$genba->runGenbaGetProductsAsync("true",$productid,$fromDate);
			
			foreach($response->Products as $key=>$value){
				echo $value->Name." / ". count($response->Products)."\n";
				if($value->Publisher){
					$query = "insert into genba_catalogue set ProductID=:ProductID,Sku=:Sku,RegionCode=:RegionCode,Name=:Name,EtailerSplitPercentage=:EtailerSplitPercentage,IsBundle=:IsBundle,ReleaseDate=:ReleaseDate,DigitalReleaseDate=:DigitalReleaseDate,EndDate=:EndDate,PreReleaseDate=:PreReleaseDate,EstimatedReleaseDate=:EstimatedReleaseDate,Platform=:Platform,Publisher=:Publisher,PublisherLabel=:PublisherLabel,Developer=:Developer,PreLiveState=:PreLiveState,ProtectionSystem=:ProtectionSystem,WhitelistCountryCodes=:WhitelistCountryCodes,BlacklistCountryCodes=:BlacklistCountryCodes,reg_date=now(),is_dgkr='1' ON DUPLICATE KEY UPDATE batch_date=now(),RegionCode=:RegionCode,ReleaseDate=:ReleaseDate,DigitalReleaseDate=:DigitalReleaseDate,EndDate=:EndDate,PreReleaseDate=:PreReleaseDate,EstimatedReleaseDate=:EstimatedReleaseDate,Platform=:Platform,Publisher=:Publisher,PublisherLabel=:PublisherLabel,Developer=:Developer,PreLiveState=:PreLiveState,ProtectionSystem=:ProtectionSystem,WhitelistCountryCodes=:WhitelistCountryCodes,BlacklistCountryCodes=:BlacklistCountryCodes";
					$stmt = $conn->prepare($query);
					$params = array(
						":ProductID"=>$value->ProductID,
						":Sku"=>$value->Sku,
						":RegionCode"=>$value->RegionCode,
						":Name"=>$value->Name,
						":Sku"=>$value->Sku,
						":EtailerSplitPercentage"=>$value->EtailerSplitPercentage,
						":IsBundle"=>$value->IsBundle,
						":ReleaseDate"=>date("Y-m-d H:i:s",strtotime($value->ReleaseDate)),
						":DigitalReleaseDate"=>date("Y-m-d H:i:s",strtotime($value->DigitalReleaseDate)),
						":EndDate"=>date("Y-m-d H:i:s",strtotime($value->EndDate)),
						":PreReleaseDate"=>date("Y-m-d H:i:s",strtotime($value->PreReleaseDate)),
						":EstimatedReleaseDate"=>date("Y-m-d H:i:s",strtotime($value->EstimatedReleaseDate)),
						":Platform"=>$value->Platform,
						":Publisher"=>$value->Publisher,
						":PublisherLabel"=>$value->PublisherLabel,
						":Developer"=>$value->Developer,
						":PreLiveState"=>$value->PreLiveState,
						":ProtectionSystem"=>$value->ProtectionSystem,
						':WhitelistCountryCodes'=> json_encode($value->Restrictions->WhitelistCountryCodes),
						':BlacklistCountryCodes'=>  json_encode($value->Restrictions->BlacklistCountryCodes),
					);
					$stmt->execute($params);
					
					$publisher_query = "insert into genba_publisher set publisher=:publisher,status='N' ON DUPLICATE KEY UPDATE update_date=now()";
					$stmt = $conn->prepare($publisher_query);
					$params = array(
						":publisher"=>$value->Publisher,
					);
					$stmt->execute($params);
					
					$title_query = "insert into genba_title set ProductID=:ProductID,Name=:Name,publisher=:publisher,ReleaseDate=:ReleaseDate,EtailerSplitPercentage=:EtailerSplitPercentage,batch_date=now() ON DUPLICATE KEY UPDATE ReleaseDate=:ReleaseDate,EtailerSplitPercentage=:EtailerSplitPercentage,batch_date=now()";
					$stmt = $conn->prepare($title_query);
					$params = array(
						":ProductID"=>$value->ProductID,
						":Name"=>$value->Name,
						":publisher"=>$value->Publisher,
						":ReleaseDate"=>date("Y-m-d H:i:s",strtotime($value->ReleaseDate)),
						":EtailerSplitPercentage"=>$value->EtailerSplitPercentage,
					);
					$stmt->execute($params);
				}else{
					$query = "insert into genba_catalogue set ProductID=:ProductID,Sku=:Sku,RegionCode=:RegionCode,Name=:Name,EtailerSplitPercentage=:EtailerSplitPercentage,IsBundle=:IsBundle,reg_date=now(),is_dgkr='1' ON DUPLICATE KEY UPDATE batch_date=now(),RegionCode=:RegionCode";
					$stmt = $conn->prepare($query);
					$params = array(
						":ProductID"=>$value->ProductID,
						":Sku"=>$value->Sku,
						":RegionCode"=>$value->RegionCode,
						":Name"=>$value->Name,
						":Sku"=>$value->Sku,
						":EtailerSplitPercentage"=>$value->EtailerSplitPercentage,
						":IsBundle"=>$value->IsBundle
					);
					$stmt->execute($params);
					
					$title_query = "insert into genba_title set ProductID=:ProductID,Name=:Name,publisher=:publisher,ReleaseDate=:ReleaseDate,EtailerSplitPercentage=:EtailerSplitPercentage,batch_date=now() ON DUPLICATE KEY UPDATE ReleaseDate=:ReleaseDate,EtailerSplitPercentage=:EtailerSplitPercentage,batch_date=now()";
					$stmt = $conn->prepare($title_query);
					$params = array(
						":ProductID"=>$value->ProductID,
						":Name"=>$value->Name,
						":publisher"=>$value->Publisher,
						":ReleaseDate"=>date("Y-m-d H:i:s",strtotime($value->ReleaseDate)),
						":EtailerSplitPercentage"=>$value->EtailerSplitPercentage,
					);
					$stmt->execute($params);
				}
			}
		
			//print_r($response);
		break;
		case "price":
			$sku = filter_input(INPUT_GET, 'sku', FILTER_SANITIZE_STRING);
			$response =$genba->runGenbaGetPricesAsync($sku,$productid);
			//print_r($response);
			
			foreach($response->Prices as $key=>$value){
				if($value->CurrencyCode=="KRW" || $value->RegionCode=="SEA (SEP 2024)"){
					$query = "insert into genba_price set Sku=:Sku,Product=:Product,RegionCode=:RegionCode,DefaultStatus=:DefaultStatus,CurrencyCode=:CurrencyCode,Wsp=:Wsp,Srp=:Srp,IsPromotion=:IsPromotion,batch_date=now() ON DUPLICATE KEY UPDATE Product=:Product,RegionCode=:RegionCode,DefaultStatus=:DefaultStatus,CurrencyCode=:CurrencyCode,Wsp=:Wsp,Srp=:Srp,IsPromotion=:IsPromotion,update_date=now()";
					$stmt = $conn->prepare($query);
					$params = array(
						":Sku"=>$value->Sku,
						":Product"=>$value->Product,
						":RegionCode"=>$value->RegionCode,
						":DefaultStatus"=>$value->DefaultStatus,
						":CurrencyCode"=>$value->CurrencyCode,
						":Wsp"=>$value->Wsp,
						":Srp"=>$value->Srp,
						":IsPromotion"=>$value->IsPromotion
					);
					$stmt->execute($params);
					//print_r($params);
					
					if($productid){
						$u_query = "update genba_title set is_krw='Y' where ProductID=:ProductID";
						$stmt = $conn->prepare($u_query);
						$params = array(
							":ProductID"=>$productid
						);
						$stmt->execute($params);
					}
				}
			}
		break;
		case "order":
			$sku = "993c3d60-cbb3-4128-8345-1472b4b6264a";
			$price = "4800";
			$order_ppr ="4800";
			$ip = "211.188.51.101";
			$ordno ="N1777974140454_3";
			$m_no="1259332";
			$m_id="	yuikawa.no44@gmail.com";
			$product_code="50005314";
			$product_name="지옥에서 돌아온 이웃";
			
			$reservation_response = $genba->runGenbaPlaceReservationAsync($sku,$price,$order_ppr,$ip);
			print_r($reservation_response);
			$reservationid = $reservation_response->ID;
			if($reservationid){
				$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sku,$price,$order_ppr,$ip);
			
				if($order_response->ID){ // Genba 주문성공
					$genba_query = "insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,ID=:ID,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name,Platform=:Platform,Publisher=:Publisher";
					$stmt = $conn->prepare($genba_query);
					$params = array(
						':m_no'=> $m_no,
						':m_id'=> $m_id,
						':ordno'=> $ordno,
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
						":product_code"=>$product_code,
						":product_name"=>$product_name,
						":Name"=>$product_name,
						":Platform"=>'',
						":Publisher"=>'',
						
					);
					//$logger->info($params);
					$stmt->execute($params);
					
					print_r($params);
					
					$query="update tbl_order_item set status=:status,send_status=:send_status,order_system=:order_system where ordno=:ordno";
					$params = array(
						":status"=>'2',
						":send_status"=>'delivered',
						":order_system"=>'Genba',
						":ordno"=>$ordno,
					);
					print_r($params);
					//$logger->info($params);
					$stmt = $conn->prepare($query);
					$stmt->execute($params);
				}else{ // Genba 주문실패
					$query="insert into  genba_error_log set ordno=:ordno,sku=:sku,name=:name,Code=:Code,Details=:Details,reg_date=now()";
					$stmt = $conn->prepare($query);
					$params = array(
						":ordno"=>$ordno,
						":sku"=>$order_response->Sku,
						":name"=>$order_response->Name,
						":Code"=>$order_response->Code,
						":Details"=>$order_response->Details,
					);
					$stmt->execute($params);
				}
			}
		break;
		case "preorder":
			$sku = "230bcf8f-8495-48ef-af65-abceee7703c5";
			$price = "39000";
			$order_ppr ="39000";
			$ip = "211.235.91.228";
			$ordno ="T1774525717906_1";
			$m_no="1089020";
			$m_id="onejoo3547@gmail.com";
			$product_code="50005201";
			$product_name="마블 스파이더맨 2";
			
			$reservationid = "";
			
			$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sku,$price,$order_ppr,$ip);
			print_r($order_response);
			
			if($order_response->ID){ // Genba 주문성공
				$genba_query = "insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,ID=:ID,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name,Platform=:Platform,Publisher=:Publisher";
				$stmt = $conn->prepare($genba_query);
				$params = array(
					':m_no'=> $m_no,
					':m_id'=> $m_id,
					':ordno'=> $ordno,
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
					":product_code"=>$product_code,
					":product_name"=>$product_name,
					":Name"=>$product_name,
					":Platform"=>'',
					":Publisher"=>'',
					
				);
				//$logger->info($params);
				$stmt->execute($params);
				
				print_r($params);
				
				$query="update tbl_order_item set status=:status,send_status=:send_status,order_system=:order_system where ordno=:ordno";
				$params = array(
					":status"=>'2',
					":send_status"=>'delivered',
					":order_system"=>'Genba',
					":ordno"=>$ordno,
				);
				print_r($params);
				//$logger->info($params);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}else{ // Genba 주문실패
				$query="insert into  genba_error_log set ordno=:ordno,sku=:sku,name=:name,Code=:Code,Details=:Details,reg_date=now()";
				$stmt = $conn->prepare($query);
				$params = array(
					":ordno"=>$ordno,
					":sku"=>$order_response->Sku,
					":name"=>$order_response->Name,
					":Code"=>$order_response->Code,
					":Details"=>$order_response->Details,
				);
				$stmt->execute($params);
			}
		break;
		case "stock":
			$sku = filter_input(INPUT_GET, 'sku', FILTER_SANITIZE_STRING);
			$response = $genba->runGetProductStockStatusAsync($sku);
			//print_r($response);
			
			if($response->StockStatus){
				$StockStatus = "1";
			}else{
				$StockStatus = "0";
			}
			
			$query ="update genba_catalogue set StockStatus=:StockStatus where Sku=:Sku";
			$stmt = $conn->prepare($query);
			$params = array(
				":StockStatus"=>$StockStatus,
				":Sku"=>$sku,
			);
			$stmt->execute($params);
					
			if($response->StockStatus=="1"){
				echo "재고있음";
			}else{
				echo "품절";
			}
		break;
		case "prelive":
			$sku = filter_input(INPUT_GET, 'sku', FILTER_SANITIZE_STRING);
			$query="select b.product_code,b.product_name,b.game_type,b.goods_sku,b.product_platform,b.is_view,b.status from tbl_goods_item_delivery a inner join tbl_goods_item b on a.product_code=b.product_code where a.item_id=:item_id";
			$stmt = $conn->prepare($query);
			$params = array(
				":item_id"=>$sku,
			);
			$stmt->execute($params);
			$goods_item_info = $stmt->fetch();
			
			switch($goods_item_info['game_type']){
				case "game":
					$adminGoods= new AdminGoods($conn);
					$title_info = $adminGoods->getTitleInfo($goods_item_info['product_code']);
					$view_url = "https://directg.net/game/game_view.html?product_id=".$title_info['sku']."&sku=".$goods_item_info['goods_sku']."&platform=".$goods_item_info['product_platform'];
				break;
				case "dlc":
					$view_url = "https://directg.net/game/dlc_view.html?sku=".$goods_item_info['goods_sku']."&platform=".$goods_item_info['product_platform'];
				break;
				case "music":
					$view_url = "https://directg.net/game/dlc_view.html?sku=".$goods_item_info['goods_sku']."&platform=".$goods_item_info['product_platform'];
				break;
				case "bundle":
					$view_url = "https://directg.net/game/bundle_view.html?sku=".$goods_item_info['goods_sku']."&platform=".$goods_item_info['product_platform'];
				break;
			}
			
			if($goods_item_info['goods_sku']){
				$response = $genba->runSubmitPreliveApprovalRequestAsync($sku,$view_url);
				print_r($response);
			}
			
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}
	


?>