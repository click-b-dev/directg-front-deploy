<?php
ini_set('display_errors', '0');
header("Cache-Control: no-cache");
session_cache_limiter('private_no_expire');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_tosspay_mobile.xml');
$logger = Logger::getLogger("mobile");

$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$goods_name = filter_input(INPUT_POST, 'goods_name', FILTER_SANITIZE_STRING);
$mode="";

$goods_name = urldecode($goods_name);

$logger->info($settle_no);
$logger->info($goods_name);

// DB에서 예약된 결제 정보 조회
try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$tosspay = new Tosspay($mode);
	$order = new Order($conn);
	$order_info = $order->getOrder($settle_no);
	
	$params["settle_no"]=$settle_no;
	$params["amount"]=$order_info['total_price'];
	$params["product_name"]=$goods_name;
	$params["retUrl"]="https://m.directg.net/order/order_end.html?settle_no=".$settle_no."&wait=1";
	$params["retCancelUrl"]="https://m.directg.net/order/order_fail.html?msg=결제취소";
	
	$result = $tosspay->payment($params);
	echo json_encode($result);
	
	if(!$order_info){
		throw new Exception("주문 정보를 찾을 수 없습니다.");
	}
} catch (Exception $e){
	exit;
}