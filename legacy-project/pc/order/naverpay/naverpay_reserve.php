<?
	ini_set('display_errors', '0');
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
    header("Content-type: text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_naverpay.xml');
	$logger = Logger::getLogger("pc");
	
$settle_kind = filter_input(INPUT_POST, 'settle_kind', FILTER_SANITIZE_STRING);
$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
$address2 = filter_input(INPUT_POST, 'address2', FILTER_SANITIZE_STRING);
$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);
$buyr_tel2 = filter_input(INPUT_POST, 'buyr_tel2', FILTER_SANITIZE_STRING);
$msg = filter_input(INPUT_POST, 'msg', FILTER_SANITIZE_STRING);
	
$m_no = $_SESSION['member']['m_no'];
$name = $_SESSION['member']['name'];

$ip = get_client_ip_env();
	

	if($_SESSION['member']["m_id"]==""){
		$json_data = array(
			"code"=>"NG",
			"message"=>"세션이 만료되었습니다. 다시 로그인 해 주세요."
		);
		
		echo json_encode($json_data);
		exit;
	}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$order = new Order($conn);
	$order_repo = new OrderRepository($conn, $logger);
	$order_item_list = $order->getCartItemList($m_no);
	
	$naverpay = new NaverPay('');
	
	$settle_no = $naverpay->getSettleNo();
	
	$goods_data = array();
	$product_data = array();
	$merchantExtraParameter = "";
		
	/*결제예약용 상품정보 parameters */
	foreach($order_item_list as $key=>$value){
		$goods_data['categoryType'] = "PRODUCT";
		$goods_data['categoryId'] = "DIGITAL_CONTENT";
		$goods_data['uid'] = $value['product_code'];
		$goods_data['name'] = urlencode($value['product_name']);
		$goods_data['payReferrer'] = "PARTNER_DIRECT";
		$goods_data['sellerId'] = "h2interactive";
		$goods_data['count'] = "1";
		$merchantExtraParameter.=$value['product_code']."^".$value['price']."|";
		if($value['promotion']['sale_price']>0){
			$totalPayAmount+=$value['promotion']['sale_price'];
		}else{
			$totalPayAmount+=$value['price'];
		}
		
		$productCount+=$goods_data['count'];
		array_push($product_data, $goods_data);
	}
	
	if($use_emoney>0){
		$totalPayAmount = $totalPayAmount-$use_emoney;
	}

	$ProductsList = array();
	$ProductRows = array();

	$ProductsList["modelVersion"]="2";
	$ProductsList["merchantPayKey"]=$settle_no;
	$ProductsList["merchantUserKey"]=$m_no;
	$ProductsList["productName"]=$order_item_list['0']['product_name'];
	$ProductsList["productCount"]=$productCount;
	$ProductsList["totalPayAmount"]=$totalPayAmount;
	$ProductsList["deliveryFee"]="0";
	$ProductsList["returnUrl"]="https://".$_SERVER['HTTP_HOST']."/order/naverpay/naverpay_apply.php";
	$ProductsList["taxScopeAmount"]=$totalPayAmount;
	$ProductsList["taxExScopeAmount"]="0";
	$ProductsList["purchaserName"]=$name;
	$ProductsList["purchaserBirthday"]="";
	$ProductsList["merchantExtraParameter"]=substr($merchantExtraParameter,0,strlen($merchantExtraParameter)-1);
	$ProductsList["purchaserBirthday"]="";

	/*적립금 사용 유효성 체크*/
	
	//print_r($ProductRows);
	
	$logger->info($_POST);

	/* 네이버페이 주문결제 예약*/
	$response = $naverpay->naverPayReserve($ProductsList);
	
	$logger->info($response);
	
	
	if($response->code=="Success"){
		//주문서 저장
		$order_repo->insertOrder(array(
			'settle_no'   => $settle_no,
			'm_no'        => $_SESSION['member']['m_no'],
			'm_id'        => $_SESSION['member']['m_id'],
			'ord_ymd'     => date('Y-m-d'),
			'ip'          => $ip,
			'use_emoney'  => $use_emoney,
			'total_price' => $totalPayAmount,
			'pg_provider' => 'naverpay',
			'step'        => '1',
			'is_mobile'   => 'N',
			'version'     => '3',
		));
		
		//배송지 저장
		if($zipcode){
			$order_repo->insertAddress(array(
				'settle_no'      => $settle_no,
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
		
		foreach($order_item_list as $key=>$value){
			$ordno = $settle_no."_".$item_count;
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
				'settle_no'      => $settle_no,
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

		$reserveId = $response->body->reserveId;
		
		//네이버페이 결제창 호출
		$payment_url = $naverpay->naverPayPayment($reserveId);
		
		$json_data = array(
			"code"=>$response->code,
			"message"=>$response->message,
			"payment_url"=>$payment_url,
		);
		
		echo json_encode($json_data);
		
	}else{
		$json_data = array(
			"code"=>$response->code,
			"message"=>$response->message,
		);
		
		echo json_encode($json_data);
	}
}catch(Exception $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>