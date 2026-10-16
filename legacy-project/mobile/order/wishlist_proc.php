<?
ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_wishlist.xml');
$logger = Logger::getLogger("mobile");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_SANITIZE_STRING);

if($_SESSION['member']['m_id']==""){
	$response =array(
		"error_code"=>"99",
		"error_msg"=>"로그인 이후에 이용이 가능합니다."
	);
	echo json_encode($response);
	exit;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$goods = new Goods($conn);
	$order = new Order($conn);

	switch($mode){
		case "add_wishlist":
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
			$logger->info("============위시리스트 추가 상품추가==========");
			$ip = get_client_ip_env();
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"product_name"=>$goods_item_info['product_name'],
			);
			$logger->info($request_params);

			$result = $order->addWishList($request_params);
			if($result=="success"){
				$response =array(
					"error_code"=>"0",
					"error_msg"=>"성공"
				);
				echo json_encode($response);
				exit;
			}else{
				$response =array(
					"error_code"=>"1",
					"error_msg"=>"이미 위시리스트에 해당 상품이 존재합니다."
				);
				echo json_encode($response);
				exit;
			}
		break;
		case "cart_item_select":
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
		
			if($goods_item_info['promotion']['sale_price']>0){
				$price = $goods_item_info['promotion']['sale_price'];
			}else{
				$price = $goods_item_info['price'];
			}
		
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"price"=>$price
			);
			$order->setCartItemSelect($request_params);
		break;
		case "cart_item_deselect":
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
		
			if($goods_item_info['promotion']['sale_price']>0){
				$price = $goods_item_info['promotion']['sale_price'];
			}else{
				$price = $goods_item_info['price'];
			}
		
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"price"=>$price
			);
			$order->setCartItemDeselect($request_params);
		break;
	}

}catch(Exception $e){
	//echo 'Error!: '.$e->getMessage();
	die();
}
?>