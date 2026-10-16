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
	
	$asset_id="5380";
	$asset_name = "John Carpenter's Toxic Commando - Leon's Secret Stash";
	
	$product_code='60000323';
	$product_name="존 카펜터의 톡식 코만도 - 블러드 에디션 -";
	$ordno="T1774526436019_1";

	//$query = "select b.ordno,b.asset_id,a.email,b.reserve_id from tbl_order_event a inner join tbl_order_item_event b on a.settle_no=b.settle_no where b.reserve_id is null limit 50";
	$query = "select a.m_no,a.m_id,a.ordno,b.asset_id,a.order_date from tbl_order_item a inner join tbl_order_item_asset b on a.ordno=b.ordno where b.ordno=:ordno and a.status='2'";
	$stmt = $conn->prepare($query);
	$params = array(
		":ordno"=>$ordno,
	);
	$stmt->execute($params);
	
	$data = $stmt->fetch();
	
	
	//print_r($data);
	//	echo $ordno." / ".$data['m_id']."<br/>";
		
	//exit;
		$reserve_data = $asset->runReserveRegisterAdmin($ordno,$asset_id,$data['m_id'],'');
		$reserve = json_decode($reserve_data);
		
		foreach($reserve->list as $key=>$asset_value){
			$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd ";
			$stmt = $conn->prepare($query);
			$sub_params = array(
				":m_no"=>$data['m_no'],
				":m_id"=>$data['m_id'],
				":ordno"=>$data['ordno'],
				":product_code"=>$product_code,
				":product_name"=>$product_name,
				":asset_id"=>$asset_value->assetId,
				":asset_name"=>$asset_name,
				":reserve_id"=>$asset_value->reserveId,
				":asset_publisher"=>'Naverpay',
				":asset_platform"=>'기타',
				":asset_type"=>'기타',
				":ord_ymd"=>date('Y-m-d'),
			);
			$stmt->execute($sub_params);
			//print_r($asset_value);
		}
	
	//print_r($data);
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>