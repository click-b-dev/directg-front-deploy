<?
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: application/json; charset=utf-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_genba_webhook.xml');
$logger = Logger::getLogger("pc");

$rawBody = file_get_contents("php://input"); // 본문을 불러옴
$getData = array(json_decode($rawBody)); // 데이터를 변수에 넣고

$logger->info($getData);

$transactionid = $getData['0']->transactionid;
$orderid = $getData['0']->order;

$time = new DateTime("now", new DateTimeZone("UTC"));
$utc_time = $time->format("Y-m-d\TH:i:s.v\Z");

$response2 = array(
	"success"=>true,
	"timestamp"=>$utc_time,
	"transactionid"=>$transactionid
);

echo json_encode($response2);

$logger->info($response2);


define('DB_HOST', "110.10.130.54");
define('DB_DB', "dgkrshop");
define('DB_USER', "dgkrshop");
define('DB_PASSWORD', "!#dgkrdb$%");

define('DB_HOST_JP', '175.126.146.157' );
define('DB_USER_JP', 'directgjp' );
define('DB_PASSWORD_JP', '!#dgjp#%' );
define('DB_JP', 'directgjp' );

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "insert into directgames.genba_webhook_log set webhook_type=:webhook_type,status=:status,message=:message,transactionid=:transactionid,istest=:istest,sku=:sku,reg_date=now()";
	$stmt = $conn->prepare($query);
	$params = array(
		":webhook_type"=>"avaliability",
		":status"=>$getData['0']->status,
		":message"=>$getData['0']->message,
		":transactionid"=>$getData['0']->transactionid,
		":istest"=>$getData['0']->istest,
		":sku"=>$getData['0']->sku
	);
	//$logger->info($params);
	$stmt->execute($params);
	
	if($getData['0']->status=="2001"){
		$query = "select product_code,item_id,item_name from tbl_goods_item_delivery where item_id=:item_id";
		$params = array(
			":item_id"=>$getData['0']->sku
		);
		
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
		
		$data = $stmt->fetch();
		$logger->info($data);
		
		if($data['product_code']){
			$query2 = "update tbl_goods_item set soldout='Y' WHERE product_code=:product_code";
			$params2 = array(
				":product_code"=>$data['product_code']
			);
			$stmt2 = $conn->prepare($query2);
			$stmt2->execute($params2);
		}
	}
	
	if($getData['0']->status=="2002"){
		$query = "select product_code,item_id,item_name from tbl_goods_item_delivery where item_id=:item_id";
		$params = array(
			":item_id"=>$getData['0']->sku
		);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);
		
		$data = $stmt->fetch();
		$logger->info($data);
		
		if($data['product_code']){
			$query2 = "update tbl_goods_item set soldout='N' WHERE product_code=:product_code";
			$params2 = array(
				":product_code"=>$data['product_code']
			);
			$stmt2 = $conn->prepare($query2);
			$stmt2->execute($params2);
		}
	}
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
	die();  
	//exit;
}

try{
	$dsn_jp = 'mysql:host='.DB_HOST_JP.';dbname='.DB_JP.';port=3306;charset=utf8';

	$conn_jp = new PDO($dsn_jp,DB_USER_JP,DB_PASSWORD_JP);
	
	if($getData['0']->status=="2001"){
		$query = "UPDATE tbl_goods SET flag=4,soldOutFl='y' WHERE product_id=:sku AND flag=0";
		$params = array(
			":sku"=>$getData['0']->sku
		);
		$stmt = $conn_jp->prepare($query);
		$stmt->execute($params);
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
	die();  
	//exit;
}
?>