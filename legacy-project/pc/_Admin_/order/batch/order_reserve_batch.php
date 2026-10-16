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
	
	$before_asset_id='5655';
	$after_asset_id='5660';
	$product_code='60000490';

	//$query = "select b.ordno,b.asset_id,a.email,b.reserve_id from tbl_order_event a inner join tbl_order_item_event b on a.settle_no=b.settle_no where b.reserve_id is null limit 50";
	$query = "select a.m_id,a.ordno,b.asset_id,a.product_name,a.order_date from tbl_order_item a inner join tbl_order_item_asset b on a.ordno=b.ordno where b.product_code=:product_code and a.status='2' and b.asset_id=:asset_id order by a.ordno asc limit 100";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code,
		":asset_id"=>$before_asset_id,
	);
	$stmt->execute($params);
	
	$data = $stmt->fetchAll();
	echo "<table>";
	foreach($data as $value){
//		echo $value['ordno']." / ".$value['m_id']."<br/>";
		$reserve_data = $asset->runReserveRegisterAdmin($value['ordno'],$after_asset_id,$value['m_id'],'');
		$reserve = json_decode($reserve_data);
		
		foreach($reserve->list as $key=>$asset_value){
			$sub_query = "update tbl_order_item_asset set reserve_id=:reserve_id,asset_id=:after_asset_id where ordno=:ordno and asset_id=:before_asset_id";
			$stmt = $conn->prepare($sub_query);
			$sub_params = array(
				":reserve_id"=>$asset_value->reserveId,
				":after_asset_id"=>$asset_value->assetId,
				":ordno"=> $value['ordno'],
				":before_asset_id"=>$before_asset_id,
			);
			$stmt->execute($sub_params);
//			print_r($asset_value);
//			echo $value['m_id']."||".$value['ordno']."||".$product_code."||".$value['product_name']."||".$value['order_date']."<br>";
			echo "<tr><td>".$value['m_id']."</td><td>".$value['ordno']."</td><td>".$product_code."</td><td>".$value['product_name']."</td><td>".$value['order_date']."</td></tr>";
		}
	}
	//print_r($data);
	echo "</table>";
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>