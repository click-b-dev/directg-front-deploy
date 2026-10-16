<?php
header('Content-Type: application/json; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT']."../../_engine/dbconn.php");
include_once($_SERVER['DOCUMENT_ROOT']."/lib/genba.class.php");
require_once $_SERVER["DOCUMENT_ROOT"]."/log4php/src/main/php/Logger.php";
Logger::configure($_SERVER["DOCUMENT_ROOT"] . '/log4php/log4j_genba_webhook_invoice.xml');
$logger = Logger::getLogger("srp_change");

$rawBody = file_get_contents("php://input"); // 본문을 불러옴
$getData = array(json_decode($rawBody)); // 데이터를 변수에 넣고

$logger->info($getData);

$transactionid = $getData['0']->transactionid;

$response2 = array(
	"success"=>true,
	"timestamp"=>date('Y-m-d H:i:s'),
	"transactionid"=>$transactionid
);

echo json_encode($response2);
?>