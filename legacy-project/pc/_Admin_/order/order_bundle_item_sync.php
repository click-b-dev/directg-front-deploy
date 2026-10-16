<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$start_date = filter_input(INPUT_GET, 'start_date', FILTER_SANITIZE_STRING);
$end_date = filter_input(INPUT_GET, 'end_date', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 
	
	if($product_code){
	$query = "select a.email,a.m_no,a.ip,b.order_id,b.settle_no,b.ordno,b.product_code,b.product_nm,b.publisher_code,b.status,b.repay,b.pay,b.tot_pay,b.order_srp,b.order_ppr,b.supp_cd,b.asset_id,b.reserve_id,b.zt_item_id,b.zt_ord_no,b.is_lic_actv,b.reg_date from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.step='2' and b.status='2' and b.product_code=:product_code and b.supp_cd='4' and a.ord_ymd>='2020-08-01' and a.ord_ymd>=:start_date and a.ord_ymd<=:end_date order by a.id asc ";
	$params = array(
		":product_code"=>$product_code,
		":start_date"=>$start_date,
		":end_date"=>$end_date,
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
				$asset_info = $adminGoods->getAssetInfo($value['asset_id']);
				$item_name = $asset_info['asset_name'];
				$item_platform = $asset_info['platform'];
				$item_publisher = $asset_info['publisher'];
				$asset_type = $asset_info['assetType'];
			break;
			case "4":
				$order_system = "Asset";
			break;
		}
		
		$query="insert into tbl_order_item set order_id=:order_id,settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,quantity='1',status=:status,order_type='delivered',delivery_type='1',goods_price=:goods_price,price=:price,order_srp=:order_srp,publisher_code=:publisher_code,m_no=:m_no,m_id=:m_id,ip=:ip,order_date=:order_date,is_actv=:is_actv,repay=:repay,order_system=:order_system,batch_date=now(),version='1' ON DUPLICATE KEY UPDATE status=:status,is_actv=:is_actv,order_system=:order_system,batch_date=now()";
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
					$asset_info = $adminGoods->getAssetInfo($bundle_item['asset_id']);
					$item_name = $asset_info['asset_name'];
					$item_platform = $asset_info['platform'];
					$item_publisher = $asset_info['publisher'];
					$asset_type = $asset_info['assetType'];
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
						$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,asset_type=:asset_type,order_date=:order_date,ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE asset_name=:asset_name,asset_publisher=:asset_publisher,asset_platform=:asset_platform,asset_type=:asset_type,batch_date=now()";
						$stmt = $conn->prepare($query);
						$c_params = array(
							":m_no"=>$value['m_no'],
							":m_id"=>$value['email'],
							":ordno"=>$value['ordno'],
							":product_code"=>$value['product_code'],
							":product_name"=>$value['product_nm'],
							":asset_id"=>$item_id,
							":asset_name"=>$asset_info['asset_name'],
							":reserve_id"=>$item_order_id,
							":asset_publisher"=>$asset_info['publisher'],
							":asset_platform"=>$asset_info['platform'],
							":asset_type"=>$asset_info['assetType'],
							":order_date"=>$value['reg_date'],
							":ord_ymd"=>date('Y-m-d',strtotime($value['reg_date'])),
						);
						$stmt->execute($c_params);
					//	print_r($c_params);
					break;
				}
			}
			
		}
	}
	
	}
	
	echo "완료";


}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>