<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$ord_ymd = filter_input(INPUT_POST, 'ord_ymd', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$admin= new Admin($conn); 

	$query = "select a.email,a.m_no,a.ip,b.order_id,b.settle_no,b.ordno,b.product_code,b.product_nm,b.publisher_code,b.status,b.repay,b.pay,b.tot_pay,b.order_srp,b.order_ppr,b.supp_cd,b.asset_id,b.reserve_id,b.zt_item_id,b.zt_ord_no,b.is_lic_actv,b.reg_date ,b.cancel_dt from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where b.status='9' and a.ord_ymd=:ord_ymd order by id asc ";
	$params = array(
		":ord_ymd"=>$ord_ymd,
	);
	$stmt = $conn_dgkr->prepare($query);
	$stmt->execute($params);
	$order_data = $stmt->fetchAll();

	foreach($order_data as $value){
		switch($value['supp_cd']){
			case "1":
				$order_system = "Asset";
				$item_id = $value['asset_id'];
				$item_order_id = $value['reserve_id'];
			break;
			case "2":
				$order_system = "Ztorm";
				$item_id = $value['zt_item_id'];
				$item_order_id = $value['zt_ord_no'];
			break;
			case "3":
				$order_system = "Ztorm";
				$item_id = $value['zt_item_id'];
				$item_order_id = $value['zt_ord_no'];
			break;
			case "4":
				$order_system = "Asset";
			break;
			case "5":
				$order_system = "Asset";
				$item_id = $value['asset_id'];
				$item_order_id = $value['reserve_id'];
			break;
			case "6":
				$order_system = "Asset";
				$item_id = $value['asset_id'];
				$item_order_id = $value['reserve_id'];
			break;
			case "8":
				$order_system = "Vaultn";
				$item_order_id = "";
				$item_id = "";
			break;
			case "9":
				$order_system = "Genba";
				$item_order_id = "";
				$item_id = "";
			break;
		}
		
		$query="insert into tbl_order_item set order_id=:order_id,settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,quantity='1',status=:status,order_type='delivered',delivery_type='1',goods_price=:goods_price,price=:price,order_srp=:order_srp,publisher_code=:publisher_code,m_no=:m_no,m_id=:m_id,ip=:ip,order_date=:order_date,is_actv=:is_actv,repay=:repay,order_system=:order_system,cancel_date=:cancel_date,batch_date=now(),version='1' ON DUPLICATE KEY UPDATE batch_date=now(),status=:status,cancel_date=:cancel_date";
		$stmt = $conn->prepare($query);
		$i_params = array(
			":order_id"=>$value['order_id'],
			":settle_no"=>$value['settle_no'],
			":ordno"=>$value['ordno'],
			":product_code"=>$value['product_code'],
			":product_name"=>$value['product_nm'],
			":status"=>$value['status'],
			":goods_price"=>$value['pay'],
			":price"=>$value['tot_pay'],
			":order_srp"=>$value['order_srp'],
			":publisher_code"=>$value['publisher_code'],
			":m_no"=>$value['m_no'],
			":m_id"=>$value['email'],
			":ip"=>$value['ip'],
			":order_date"=>$value['reg_date'],
			":is_actv"=>$value['is_lic_actv'],
			":repay"=>$value['repay'],
			":order_system"=>$order_system,
			":cancel_date"=>$value['cancel_dt'],
		);
		
		$stmt->execute($i_params);
		
		if($value['supp_cd']=="4"){
			$b_query = "select ordno,item_id,item_nm,zt_item_id,zt_ord_no,asset_id,reserve_id,supp_cd from tbl_order_bundle_item where ordno=:ordno";
			$stmt = $conn_dgkr->prepare($b_query);
			$b_params = array(
				":ordno"=>$value['ordno'],
			);
			$stmt->execute($b_params);
			$bundle_item_data = $stmt->fetchAll();
			
			foreach($bundle_item_data as $bundle_item){
				if($bundle_item['asset_id']>0){
					$item_id = $bundle_item['asset_id'];
					$item_order_id = $bundle_item['reserve_id'];
					$order_system = "Asset";
				}else{
					$item_id = $bundle_item['zt_item_id'];
					$item_order_id = $bundle_item['zt_ord_no'];
					$order_system = "Ztorm";
				}
				
				$delivery_item_info= $admin->getGoodsItemDeliveryInfo($value['product_code'],$item_id);
			
				$item_name = $delivery_item_info['item_name'];
				$item_publisher = $delivery_item_info['item_publisher'];
				$item_platform = $delivery_item_info['item_platform'];
				$item_type = $delivery_item_info['item_type'];
				
				switch($order_system){
					case "Asset":
						$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,asset_type=:asset_type,order_date=:order_date,ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE asset_name=:asset_name,asset_publisher=:asset_publisher,asset_type=:asset_type,batch_date=now()";
						$stmt = $conn->prepare($query);
						$c_params = array(
							":m_no"=>$value['m_no'],
							":m_id"=>$value['email'],
							":ordno"=>$value['ordno'],
							":product_code"=>$value['product_code'],
							":product_name"=>$value['product_nm'],
							":asset_id"=>$item_id,
							":asset_name"=>$delivery_item_info['item_name'],
							":reserve_id"=>$item_order_id,
							":asset_publisher"=>$delivery_item_info['item_publisher'],
							":asset_platform"=>$delivery_item_info['item_platform'],
							":asset_type"=>$item_type,
							":order_date"=>$value['reg_date'],
							":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
						);
						$stmt->execute($c_params);
					//	print_r($c_params);
					break;
					case "Ztorm":
						$query="insert into tbl_order_item_ztorm set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,ztorm_item_id=:ztorm_item_id,ztorm_item_name=:ztorm_item_name,customer_product_id=:customer_product_id,ztorm_publisher=:ztorm_publisher,ztorm_platform=:ztorm_platform,order_date=:order_date,ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE batch_date=now()";
							$stmt = $conn->prepare($query);
							$c_params = array(
								":m_no"=>$value['m_no'],
								":m_id"=>$value['email'],
								":ordno"=>$value['ordno'],
								":product_code"=>$value['product_code'],
								":product_name"=>$value['product_nm'],
								":ztorm_item_id"=>$item_id,
								":ztorm_item_name"=>$delivery_item_info['item_name'],
								":customer_product_id"=>$item_order_id,
								":ztorm_publisher"=>$delivery_item_info['item_publisher'],
								":ztorm_platform"=>$delivery_item_info['item_platform'],
								":order_date"=>$value['reg_date'],
								":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
							);
							//print_r($c_params);
						$stmt->execute($c_params);
					break;
				}
			}
			
		}else{
			$delivery_item_info= $admin->getGoodsItemDeliveryInfo($value['product_code'],$item_id);
			
			$item_name = $delivery_item_info['item_name'];
			$item_publisher = $delivery_item_info['item_publisher'];
			$item_platform = $delivery_item_info['item_platform'];
			$item_type = $delivery_item_info['item_type'];
			
			switch($order_system){
				case "Asset":
					$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,asset_type=:asset_type,order_date=:order_date,ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE asset_name=:asset_name,asset_publisher=:asset_publisher,asset_type=:asset_type,batch_date=now()";
					$stmt = $conn->prepare($query);
					$c_params = array(
						":m_no"=>$value['m_no'],
						":m_id"=>$value['email'],
						":ordno"=>$value['ordno'],
						":product_code"=>$value['product_code'],
						":product_name"=>$value['product_nm'],
						":asset_id"=>$item_id,
						":asset_name"=>$delivery_item_info['item_name'],
						":reserve_id"=>$item_order_id,
						":asset_publisher"=>$delivery_item_info['item_publisher'],
						":asset_platform"=>$delivery_item_info['item_platform'],
						":asset_type"=>$item_type,
						":order_date"=>$value['reg_date'],
						":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
					);
					$stmt->execute($c_params);
					//print_r($c_params);
				break;
				case "Ztorm":
					$query="insert into tbl_order_item_ztorm set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,ztorm_item_id=:ztorm_item_id,ztorm_item_name=:ztorm_item_name,customer_product_id=:customer_product_id,ztorm_publisher=:ztorm_publisher,ztorm_platform=:ztorm_platform,order_date=:order_date,ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE batch_date=now()";
						$stmt = $conn->prepare($query);
						$c_params = array(
							":m_no"=>$value['m_no'],
							":m_id"=>$value['email'],
							":ordno"=>$value['ordno'],
							":product_code"=>$value['product_code'],
							":product_name"=>$value['product_nm'],
							":ztorm_item_id"=>$item_id,
							":ztorm_item_name"=>$delivery_item_info['item_name'],
							":customer_product_id"=>$item_order_id,
							":ztorm_publisher"=>$delivery_item_info['item_publisher'],
							":ztorm_platform"=>$delivery_item_info['item_platform'],
							":order_date"=>$value['reg_date'],
							":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
						);
						//print_r($c_params);
					$stmt->execute($c_params);
				break;
				case "Vaultn":
					$vaultn_query="select * from tbl_order_item_vaultn where clientOrderReference=:clientOrderReference";
					$params = array(
						":clientOrderReference"=>$value['ordno']
					);
					$stmt = $conn_dgkr->prepare($vaultn_query);
					$stmt->execute($params);
					$vaultn_data = $stmt->fetch();
					
					$query="insert into tbl_order_item_vaultn set m_no=:m_no,m_id=:m_id,orderId=:orderId,clientOrderReference=:clientOrderReference,sku=:sku,clientCustomerReference=:clientCustomerReference,created=:created,status=:status,salesCurrency=:salesCurrency,salesCountry=:salesCountry,salesCountryCode=:salesCountryCode,salesPriceGross=:salesPriceGross,publisherName=:publisherName,publisherGuid=:publisherGuid,priceModel=:priceModel,priceListGuid=:priceListGuid,countryCode=:countryCode,srpCurrency=:srpCurrency,purchasePriceCurrency=:purchasePriceCurrency,baseSRP=:baseSRP,discountedSRP=:discountedSRP,netDiscountedSRP=:netDiscountedSRP,priceListVAT=:priceListVAT,basePurchasePrice=:basePurchasePrice,promoPercentage=:promoPercentage,netPurchasePrice=:netPurchasePrice,estimatedMargin=:estimatedMargin,provider=:provider,fulfilmentStatus=:fulfilmentStatus,reg_date=:reg_date,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name ON DUPLICATE KEY UPDATE update_date=now()";
					$stmt = $conn->prepare($query);
					$c_params2 = array(
						":m_no"=>$value['m_no'],
						":m_id"=>$value['email'],
						":orderId"=>$vaultn_data['orderId'],
						":clientOrderReference"=>$value['ordno'],
						":sku"=>$vaultn_data['sku'],
						":clientCustomerReference"=>$vaultn_data['clientCustomerReference'],
						":created"=>$vaultn_data['created'],
						":status"=>$vaultn_data['status'],
						":salesCurrency"=>$vaultn_data['salesCurrency'],
						":salesCountry"=>$vaultn_data['salesCountry'],
						":salesCountryCode"=>$vaultn_data['salesCountryCode'],
						":salesPriceGross"=>$vaultn_data['salesPriceGross'],
						":publisherName"=>$vaultn_data['publisherName'],
						":publisherGuid"=>$vaultn_data['publisherGuid'],
						":priceModel"=>$vaultn_data['priceModel'],
						":priceListGuid"=>$vaultn_data['priceListGuid'],
						":countryCode"=>$vaultn_data['countryCode'],
						":srpCurrency"=>$vaultn_data['srpCurrency'],
						":purchasePriceCurrency"=>$vaultn_data['purchasePriceCurrency'],
						":baseSRP"=>$vaultn_data['baseSRP'],
						":discountedSRP"=>$vaultn_data['discountedSRP'],
						":netDiscountedSRP"=>$vaultn_data['netDiscountedSRP'],
						":priceListVAT"=>$vaultn_data['priceListVAT'],
						":basePurchasePrice"=>$vaultn_data['basePurchasePrice'],
						":promoPercentage"=>$vaultn_data['promoPercentage'],
						":netPurchasePrice"=>$vaultn_data['netPurchasePrice'],
						":estimatedMargin"=>$vaultn_data['estimatedMargin'],
						":provider"=>$vaultn_data['provider'],
						":fulfilmentStatus"=>$vaultn_data['fulfilmentStatus'],
						":reg_date"=>$vaultn_data['reg_date'],
						":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
						":product_code"=>$value['product_code'],
						":product_name"=>$value['product_nm'],
						":Name"=>$delivery_item_info['item_name'],
					);
					//print_r($c_params2);
					$stmt->execute($c_params2);
					
				break;
				case "Genba":
					$genba_query="select * from tbl_order_item_genba where ordno=:ordno";
					$params = array(
						":ordno"=>$value['ordno']
					);
					$stmt = $conn_dgkr->prepare($genba_query);
					$stmt->execute($params);
					$genba_data = $stmt->fetch();
					
					$query="insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,Sku=:Sku,Name=:Name,Publisher=:Publisher,Platform=:Platform,ord_ymd=:ord_ymd,ID=:ID,Created=:Created,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ClientTransactionID=:ClientTransactionID ON DUPLICATE KEY UPDATE Sku=:Sku,ID=:ID,Created=:Created,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ClientTransactionID=:ClientTransactionID ,batch_date=now()";
					$stmt = $conn->prepare($query);
					$c_params = array(
						":m_no"=>$value['m_no'],
						":m_id"=>$value['email'],
						":ordno"=>$value['ordno'],
						":product_code"=>$value['product_code'],
						":product_name"=>$value['product_nm'],
						":Sku"=>$genba_data['Sku'],
						":Name"=>$delivery_item_info['item_name'],
						":Publisher"=>$delivery_item_info['item_publisher'],
						":Platform"=>$delivery_item_info['item_platform'],
						":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
						":ID"=>$genba_data['ID'],
						":Created"=>$genba_data['Created'],
						":State"=>$genba_data['State'],
						":CommunicatedBuyingPrice"=>$genba_data['CommunicatedBuyingPrice'],
						":ActualBuyingPrice"=>$genba_data['ActualBuyingPrice'],
						":NetAmount"=>$genba_data['NetAmount'],
						":GrossAmount"=>$genba_data['GrossAmount'],
						":ReservationID"=>$genba_data['ReservationID'],
						":ClientTransactionID"=>$genba_data['ClientTransactionID'],
					);
					//print_r($c_params);
					$stmt->execute($c_params);
				break;
			}
		}
	}
	
	echo "완료";


}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>