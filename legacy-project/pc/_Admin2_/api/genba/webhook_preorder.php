<?
header('Content-Type: application/json; charset=utf-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_genba_webhook.xml');
$logger = Logger::getLogger("preorder");

//$logger->info(json_encode($_POST));

$rawBody = file_get_contents("php://input"); // 본문을 불러옴
$getData = array(json_decode($rawBody)); // 데이터를 변수에 넣고

$logger->info($getData);

//print_r($getData);

$is_mode= "";

//$genba = new Genba($is_mode);

$transactionid = $getData['0']->transactionid;
$orderid = $getData['0']->order;
//$response = $genba->runGenbaGetOrderAsync($orderid);

//$logger->info($response);

define('DB_HOST', "110.10.130.54");
define('DB_DB', "dgkrshop");
define('DB_USER', "dgkrshop");
define('DB_PASSWORD', "!#dgkrdb$%");
$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

$response2 = array(
	"success"=>true,
	"timestamp"=>date('Y-m-d H:i:s'),
	"transactionid"=>$transactionid
);

echo json_encode($response2);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "insert into directgames.genba_webhook_log set webhook_type=:webhook_type,orderid=:orderid,status=:status,message=:message,transactionid=:transactionid,istest=:istest,reg_date=now()";
	$params = array(
		":webhook_type"=>"preorder",
		":orderid"=>$getData['0']->order,
		":status"=>$getData['0']->status,
		":message"=>$getData['0']->message,
		":transactionid"=>$getData['0']->transactionid,
		":istest"=>''
	);

	$stmt = $conn->prepare($query);
	$stmt->execute($params);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
	die();  
	//exit;
}
?>