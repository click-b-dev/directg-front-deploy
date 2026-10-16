<?
	ini_set( "display_errors", 1 );
	header("Content-Type:text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payco.xml');
	$logger = Logger::getLogger("pc");
	
	if($_SESSION['member']["m_id"]==""){
		echo "잘못된 접근입니다.";
		header( 'Location: /index.html' );
		exit;
	}
//print_r($_POST);
//exit;

//$customerOrderNumber ="P".time();

$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
$address2 = filter_input(INPUT_POST, 'address2', FILTER_SANITIZE_STRING);
$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);
$buyr_tel2 = filter_input(INPUT_POST, 'buyr_tel2', FILTER_SANITIZE_STRING);
$msg = filter_input(INPUT_POST, 'msg', FILTER_SANITIZE_STRING);

$m_no = $_SESSION['member']['m_no'];
$m_id = $_SESSION['member']['m_id'];

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$order = new Order($conn);
	$paycoPG = new PaycoPG("test");
	$order_repo = new OrderRepository($conn, $logger);
	
	$customerOrderNumber ="P".$order->getSettleNo();
	
	$cart_item_list = $order->getCartItemList($_SESSION['member']['m_no']);
	
	$ProductsList = array();
	$orderProducts = array();
	
	$num=1;
	foreach($cart_item_list as $key=>$value){
		if(is_array($value['promotion'])){
			$price = $value['promotion']['sale_price'];
		}else{
			$price = $value['price'];
		}

		$totalPaymentAmt+=$price;
		if($key=="0"){
			$orderTitle = $value['product_name'];
			$productName = $value['product_name'];
			$sellerOrderProductReferenceKey = $value['product_code'];
		}
	}
	
	if(count($_POST['goods_sku'])>1){
		$orderTitle.=" 외 ".(count($_POST['goods_sku'])-1)."개";
	}
	
	if($use_emoney>0){
		$totalPaymentAmt=  $totalPaymentAmt - $use_emoney;
	}
	
	$params = array(
		"sellerOrderReferenceKey"=>$customerOrderNumber,
		"totalPaymentAmt"=>$totalPaymentAmt,
		"orderTitle"=>$orderTitle,
		"orderChannel"=>"PC",
		"m_no"=>$_SESSION['member']["m_no"],
		"m_id"=>$_SESSION['member']["m_id"],
		"emoney"=>$use_emoney,
		"returnUrl"=>"https://directg.net/order/payco/yjs_payco_return.php",
		"nonBankbookDepositInformUrl"=>"https://directg.net/order/payco/payco_without_bankbook.php",
		"use_emoney"=>$use_emoney,
	);
	
	$logger->info($params);
	
	//페이코 거래등록
	$response =$paycoPG->paycoReserve($params);
	$logger->info($response);
	
	$response_json = json_decode($response,true);
	
	if($response_json['result']['reserveOrderNo']){
		$ip = get_client_ip_env();
		
		//주문서 저장
		$order_repo->insertOrder(array(
			'settle_no'      => $customerOrderNumber,
			'm_no'           => $_SESSION['member']['m_no'],
			'm_id'           => $_SESSION['member']['m_id'],
			'ord_ymd'        => date('Y-m-d'),
			'ip'             => $ip,
			'use_emoney'     => $use_emoney,
			'total_price'    => $totalPaymentAmt,
			'payment_method' => 'PAYCO',
			'pg_provider'    => 'payco',
			'step'           => '1',
			'version'        => '3',
		));
		
		//배송지 저장
		if($zipcode){
			$order_repo->insertAddress(array(
				'settle_no'      => $customerOrderNumber,
				'm_id'           => $_SESSION['member']['m_id'],
				'name'           => $buyr_name,
				'zipcode'        => $zipcode,
				'address'        => $address,
				'address_detail' => $address2,
				'tel'            => $buyr_tel2,
				'msg'            => $msg,
			));
		}
		
		//주문상세내역 저장
		$item_count = 1;
		$repay_point = 0;
		
		foreach($cart_item_list as $key=>$value){
			$ordno = $customerOrderNumber."_".$item_count;
			if($value['promotion']['sale_price']>0){
				$price = $value['promotion']['sale_price'];
				$is_promotion = "Y";
				$order_srp = $value['promotion']['promotion_srp'];
			}else{
				$price = $value['price'];
				$is_promotion = "N";
				$order_srp = $value['product_srp'];
			}
			
			if($value['is_repay']=="Y"){
				$repay_point = $order->getOrderRepay($_SESSION['member']['m_id'],$price,$value['product_code']);
			}else{
				$repay_point = "0";
			}
			
			$order_repo->insertOrderItem(array(
				'settle_no'      => $customerOrderNumber,
				'ordno'          => $ordno,
				'product_code'   => $value['product_code'],
				'product_name'   => $value['product_name'],
				'delivery_type'  => $value['delivery_type'],
				'goods_price'    => $value['consumer_price'],
				'price'          => $price,
				'order_srp'      => $order_srp,
				'order_ppr'      => $value['product_ppr'],
				'publisher'      => $value['publisher'],
				'publisher_code' => $value['publisher_code'],
				'order_system'   => $value['order_system'],
				'm_no'           => $_SESSION['member']['m_no'],
				'm_id'           => $_SESSION['member']['m_id'],
				'ip'             => $ip,
				'is_preorder'    => $value['is_preorder'],
				'is_promotion'   => $is_promotion,
				'repay'          => $repay_point,
			));
			$item_count++;
		}

	}
	
	echo $response;

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>