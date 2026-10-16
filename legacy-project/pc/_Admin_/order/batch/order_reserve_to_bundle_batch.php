<?
//임시키->번들상품으로 할당
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
exit;
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
	
	$before_asset_id='5457';
	$after_asset_id='5586'; //임시코드Asset에서 변경될 Asset
	$product_code='60000449';

	$query = "select a.m_no,a.m_id,a.ordno,b.asset_id,a.product_name,a.order_date from tbl_order_item a inner join tbl_order_item_asset b on a.ordno=b.ordno where b.product_code=:product_code and a.status='2' and b.asset_id=:asset_id order by a.ordno asc limit 20";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code,
		":asset_id"=>$before_asset_id,
	);
	$stmt->execute($params);
   	$order_list = $stmt->fetchAll();

    //tbl_goods_item_delivery 확인필수. 모두 재할당 할 asset 일 경우만 사용
    $query = "select product_code,order_system,item_id,item_name,item_platform,item_publisher from tbl_goods_item_delivery where product_code=:product_code order by item_name asc";
    $stmt = $conn->prepare($query);
    $params = array(
        ':product_code'=>$product_code
    );
    $stmt->execute($params);
    $item_list = $stmt->fetchAll();

   	echo "<table>";

   foreach($order_list as $value){
        foreach($item_list as $sub_value){
            $asset_response = $asset->runReserveRegister($value['m_id'], $value['ordno'], $sub_value['item_id']);

            foreach ($asset_response->list as $asset_item) {
                if($asset_item->assetId==$after_asset_id && $value['ordno']){
                    $sub_query = "update tbl_order_item_asset set reserve_id=:reserve_id,asset_id=:after_asset_id where ordno=:ordno and asset_id=:before_asset_id";
                    $stmt = $conn->prepare($sub_query);
                    $sub_params = array(
                        ":reserve_id"=>$asset_item->reserveId,
                        ":after_asset_id"=>$asset_item->assetId,
                        ":ordno"=> $value['ordno'],
                        ":before_asset_id"=>$before_asset_id,
                    );
           			$stmt->execute($sub_params);
                } else {
                    $sub_query = "insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd";
                    $stmt = $conn->prepare($sub_query);
                    $sub_params = array(
                        ":m_no"            => $value['m_no'],
                        ":m_id"            => $value['m_id'],
                        ":ordno"           => $value['ordno'],
                        ":product_code"    => $product_code,
                        ":product_name"    => $value['product_name'],
                        ":asset_id"        => $asset_item->assetId,
                        ":asset_name"      => $sub_value['item_name'],
                        ":reserve_id"      => $asset_item->reserveId,
                        ":asset_publisher" => $sub_value['item_publisher'],
                        ":asset_platform"  => $sub_value['item_platform'],
                        ":asset_type"      => $sub_value['item_type'],
                        ":ord_ymd"         => date('Y-m-d'),
                    );
                    $stmt->execute($sub_params);
                }
			}
        }
		echo "<tr><td>".$value['m_id']."</td><td>".$value['ordno']."</td><td>".$product_code."</td><td>".$value['product_name']."</td><td>".$value['order_date']."</td></tr>";
    }
	echo "</table>";
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>