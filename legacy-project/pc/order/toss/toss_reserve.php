<?
	ini_set('display_errors', '1');
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
    header("Content-type: text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss.xml');
	$logger = Logger::getLogger("pc");
	
	$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
	$settlekind = filter_input(INPUT_POST, 'settlekind', FILTER_SANITIZE_STRING);
	$pg_provider = filter_input(INPUT_POST, 'pg_provider', FILTER_SANITIZE_STRING);
	$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
	$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
	$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
	$address2 = filter_input(INPUT_POST, 'address2', FILTER_SANITIZE_STRING);
	$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);
	$buyr_tel2 = filter_input(INPUT_POST, 'buyr_tel2', FILTER_SANITIZE_STRING);
	$msg = filter_input(INPUT_POST, 'msg', FILTER_SANITIZE_STRING);
	$total_price = filter_input(INPUT_POST, 'total_price', FILTER_SANITIZE_STRING);

	if($_SESSION['member']["m_id"]==""){
		$json_data = array(
			"code"=>"NG",
			"message"=>"세션이 만료되었습니다. 다시 로그인 해 주세요."
		);
		
		echo json_encode($json_data);
		exit;
	}

try{
	//리뉴얼 DB
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	//기존 DB
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$order = new Order($conn);
	$member = new Member($conn_dgkr);
	
	$ip = get_client_ip_env();
	
	$totalPaymentAmt=0;
	$cart_item_list = $order->getCartItemList($_SESSION['member']['m_no']);
	foreach($cart_item_list as $key=>$value){
		if(is_array($value['promotion'])){
			$price = $value['promotion']['sale_price'];
		}else{
			$price = $value['price'];
		}

		$totalPaymentAmt+=$price;
	}

	if($use_emoney>0){
		$member_emoney = $member->getMemberEmoney($_SESSION['member']['m_no']);
		$totalPaymentAmt = $totalPaymentAmt-$use_emoney;

		if($member_emoney<$use_emoney){
			$json_data = array(
				"code"=>"NG_POINT",
				"message"=>"보유한 포인트보다 많은 포인트는 사용하실 수 없습니다."
			);
			
			echo json_encode($json_data);
			exit;
		}
	}

	$logger->info("\n####주문서 저장#########\n");
	$query = "insert into tbl_order set settle_no=:settle_no,m_no=:m_no,m_id=:m_id,ord_ymd=:ord_ymd,ip=:ip,use_emoney=:use_emoney,total_price=:total_price,payment_method=:payment_method,pg_provider='toss',step='1',reg_date=now(),is_mobile='N',version='3'";
	$stmt = $conn->prepare($query);
	$params = array(
		':settle_no'=>$settle_no,
		':m_no'=>$_SESSION['member']['m_no'],
		':m_id'=>$_SESSION['member']['m_id'],
		':ord_ymd'=>date('Y-m-d'),
		':ip'=>$ip,
		':use_emoney'=>$use_emoney,
		':total_price'=>$totalPaymentAmt,
		':payment_method'=>$settlekind,
	);
	$logger->info($params);
	$stmt->execute($params);
	
	/*######################################################################
	배송지 정보 저장
	*/######################################################################
	if($zipcode){
		$logger->info("\n####배송지 저장#########\n");
		$query = "insert into tbl_order_address set settle_no=:settle_no,m_id=:m_id,name=:name,zipcode=:zipcode,address=:address,address_detail=:address_detail,tel=:tel,msg=:msg,reg_date=now()";
		$stmt = $conn->prepare($query);
		$params = array(
			':settle_no'=>$settle_no,
			':m_id'=>$_SESSION['member']['m_id'],
			':name'=>$buyr_name,
			':zipcode'=>$zipcode,
			':address'=>$address,
			':address_detail'=>$address2,
			':tel'=>$buyr_tel2,
			':msg'=>$msg,
		);
		$logger->info($params);
		$stmt->execute($params);
	}
	
	$item_count = 1;
	$repay_point = 0;
	
	$logger->info("\n####주문서 상세저장#########\n");
	foreach($cart_item_list as $key=>$value){
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
		
		$i_query = "insert into tbl_order_item set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,quantity='1',status='1',delivery_type=:delivery_type,goods_price=:goods_price,price=:price,order_srp=:order_srp,order_ppr=:order_ppr,publisher_code=:publisher_code,m_no=:m_no,m_id=:m_id,ip=:ip,is_preorder=:is_preorder,is_promotion=:is_promotion,version='3',repay=:repay,order_date=now()";
		$stmt = $conn->prepare($i_query);
		$i_params = array(
			':settle_no'=>$settle_no,
			':ordno'=>$ordno,
			':product_code'=>$value['product_code'],
			':product_name'=>$value['product_name'],
			':delivery_type'=>$value['delivery_type'],
			':goods_price'=>$value['consumer_price'],
			':price'=>$price,
			':order_srp'=>$order_srp,
			':order_ppr'=>$value['product_ppr'],
			':publisher_code'=>$value['publisher_code'],
			':m_no'=>$_SESSION['member']['m_no'],
			':m_id'=>$_SESSION['member']['m_id'],
			':ip'=>$ip,
			':is_preorder'=>$value['is_preorder'],
			':is_promotion'=>$is_promotion,
			':repay'=>$repay_point,
		);
		$logger->info($i_params);
		$stmt->execute($i_params);
		$item_count++;
	}

	if($settlekind=="SC0040"){
		$json_data = array(
			"code"=>"1",
			"message"=>"가상계좌",
			"res_cd"=>"0000",
			"use_pay_method"=>"001000000000",
			"res_msg"=>"정상처리",
			"pay_method"=>"VCNT"
		);
	} else {
		$json_data = array(
			"code"=>"0",
			"message"=>"정상"
		);
	}
	
	echo json_encode($json_data);
	exit;
}catch(Exception $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>