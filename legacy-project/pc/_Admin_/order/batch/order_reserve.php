<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_admin.xml');
$logger = Logger::getLogger("pc");


if($_SESSION['admin']['admin_id']==""){
	go("../index.php");
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$asset= new Asset($conn);
	
	$ordno="N1783600425156_6";
	$m_no="1262005";
	$m_id="kdb0402@naver.com";
	
	$asset_id="5213";
	$asset_name = "Yakuza Kiwami & Yakuza Kiwami 2 Bundle";
	$product_code="60000463";
	$product_name="용과 같이 극 & 용과 같이 극2 + 용과 같이 극3 / 용과 같이3 외전 다크 타이스 번들";

	$reserve_data = $asset->runReserveRegisterAdmin($ordno,$asset_id,$m_id,'');
	$reserve = json_decode($reserve_data);
		
		foreach($reserve->list as $key=>$asset_value){
			// $query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd ";
			// $stmt = $conn->prepare($query);
			// $sub_params = array(
			// 	":m_no"=>$m_no,
			// 	":m_id"=>$m_id,
			// 	":ordno"=>$ordno,
			// 	":product_code"=>$product_code,
			// 	":product_name"=>$product_name,
			// 	":asset_id"=>$asset_value->assetId,
			// 	":asset_name"=>$asset_name,
			// 	":reserve_id"=>$asset_value->reserveId,
			// 	":asset_publisher"=>'',
			// 	":asset_platform"=>'',
			// 	":asset_type"=>'',
			// 	":ord_ymd"=>date('Y-m-d'),
			// );
			// $stmt->execute($sub_params);
			
			$sub_query = "update tbl_order_item_asset set reserve_id=:reserve_id where ordno=:ordno and asset_id=:asset_id";
			$stmt = $conn->prepare($sub_query);
			$sub_params = array(
				":reserve_id"=>$asset_value->reserveId,
				":ordno"=> $ordno,
				":asset_id"=>$asset_id,
			);
			$stmt->execute($sub_params);
			print_r($sub_params);
	}
	//print_r($data);
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>