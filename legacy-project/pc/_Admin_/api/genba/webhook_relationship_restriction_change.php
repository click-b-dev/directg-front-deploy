<?php
header('Content-Type: application/json; charset=utf-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_genba_webhook.xml');
$logger = Logger::getLogger("mobile");

$rawBody = file_get_contents("php://input"); // 본문을 불러옴
$getData = array(json_decode($rawBody)); // 데이터를 변수에 넣고

$logger->info($rawBody);
$logger->info($getData);

//$transactionid = "";
//$transactionid = $getData['0']->transactionid;

$response2 = array(
	"success"=>true,
	"timestamp"=>date('Y-m-d H:i:s'),
	"transactionid"=>"11"
);

echo json_encode($response2);
?>