<?
header('Content-Type: application/json; charset=utf-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] . '/log4php/log4j_genba_webhook.xml');
$logger = Logger::getLogger("avaliability");

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
$dsn_jp = 'mysql:host='.DB_HOST_JP.';dbname='.DB_JP.';port=3306;charset=utf8';

$rawBody = file_get_contents("php://input"); // 본문을 불러옴
$getData = array(json_decode($rawBody)); // 데이터를 변수에 넣고

$logger->info($getData);

//$is_mode= "TEST";

//$genba = new Genba($is_mode);

$transactionid = $getData['0']->transactionid;
$orderid = $getData['0']->order;
//$response = $genba->runGenbaGetOrderAsync($orderid);

//$logger->info($getData);

$response2 = array(
	"success"=>true,
	"timestamp"=>date('Y-m-d H:i:s'),
	"transactionid"=>$transactionid
);

echo json_encode($response2);

/*
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "insert into genba_webhook_log set webhook_type=:webhook_type,orderid=:orderid,status=:status,message=:message,transactionid=:transactionid,istest=:istest,sku=:sku,reg_date=now()";
	$params = array(
		":webhook_type"=>"avaliability",
		":orderid"=>$getData['0']->order,
		":status"=>$getData['0']->status,
		":message"=>$getData['0']->message,
		":transactionid"=>$getData['0']->transactionid,
		":istest"=>$getData['0']->istest,
		":sku"=>$getData['0']->sku
	);

	$stmt = $conn->prepare($query);
	$stmt->execute($params);

	//24-08-20(화) 9:58 [이종석] 품절일 경우 판매중인 DG 상품 일시중지
	if($getData['0']->status=="2001"){
		$query2 = "UPDATE tbl_goods SET flag=4,soldOutFl='y' WHERE product_id=:sku AND flag=0";
		$params2 = array(
			":sku"=>$getData['0']->sku
		);
		$stmt2 = $conn->prepare($query2);
		$stmt2->execute($params2);
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
	die();  
	//exit;
}

//24-06-24(월) 11:40 [이종석] 품절일 경우 판매중인 일본 상품 일시중지
if($getData['0']->status=="2001"){
	try{
		$conn_jp = new PDO($dsn_jp,DB_USER_JP,DB_PASSWORD_JP);

		$query = "UPDATE tbl_goods SET flag=4,soldOutFl='y' WHERE product_id=:sku AND flag=0";
		$params = array(
			":sku"=>$getData['0']->sku
		);
		$stmt = $conn_jp->prepare($query);
		$stmt->execute($params);
	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();
		$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
		die();  
		//exit;
	}
}

*/
?>