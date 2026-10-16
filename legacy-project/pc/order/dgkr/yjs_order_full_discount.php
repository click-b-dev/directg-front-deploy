<?
	ini_set('display_errors', '1');
	//error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	header("Content-type: text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_order.xml');
	$logger = Logger::getLogger("pc");

	$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
	$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
	$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
	$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
	$address2 = filter_input(INPUT_POST, 'address2', FILTER_SANITIZE_STRING);
	$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);
	$buyr_tel2 = filter_input(INPUT_POST, 'buyr_tel2', FILTER_SANITIZE_STRING);
	$msg = filter_input(INPUT_POST, 'msg', FILTER_SANITIZE_STRING);

	$logger->info($_POST);

	if($_SESSION['member']["m_id"]==""){
		header( "HTTP/1.1 301 Moved Permanently" );
		header( 'Location: https://directg.net/order/order_fail.html');
		exit;
	}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//기존 DB
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$asset = new Asset();
	$genba = new Genba("Live");
	$ztorm = new Ztorm();
	$vaultn = new Vaultn();
	$pointnexus = new PointNexus("test"); //TODO: 운영 전환 시 "prod"

	$order = new Order($conn);
	$member = new Member($conn_dgkr);

	//배송시스템별로 발송로직 분리
	$fulfillment = new OrderFulfillment($conn, array(
		'asset'      => $asset,
		'ztorm'      => $ztorm,
		'vaultn'     => $vaultn,
		'genba'      => $genba,
		'pointnexus' => $pointnexus,
	), $logger);

	//공통 후처리 헬퍼
	$order_repo = new OrderRepository($conn, $logger);

	$cart_item_list = $order->getCartItemList($_SESSION['member']['m_no']);
	foreach($cart_item_list as $key=>$value){
		if(is_array($value['promotion'])){
			$price = $value['promotion']['sale_price'];
		}else{
			$price = $value['price'];
		}

		$totalPaymentAmt+=$price;
	}

	//보유 포인트 유효성 검증
	$member_emoney = $member->getMemberEmoney($_SESSION['member']['m_no']);
	$totalPaymentAmt = $totalPaymentAmt-$use_emoney;

	$logger->info("회원 보유보인트: ".$member_emoney);
	$logger->info("회원 사용보인트: ".$use_emoney);

	$ip = get_client_ip_env();

	if($totalPaymentAmt>0){
		echo "/order/order_fail.html";
		exit;
	}

	if($member_emoney<$use_emoney && $use_emoney>0){
		$msg =  "보유한 포인트보다 많은 포인트는 사용하실 수 없습니다.";
		echo "/order/order_fail.html?msg=".$msg;
		exit;
	}else{
		//주문서 저장 (DGKR 전액할인은 즉시 완료이므로 payment_date=now() 추가)
		$order_repo->insertOrder(array(
			'settle_no'      => $settle_no,
			'm_no'           => $_SESSION['member']['m_no'],
			'm_id'           => $_SESSION['member']['m_id'],
			'ord_ymd'        => date('Y-m-d'),
			'ip'             => $ip,
			'use_emoney'     => $use_emoney,
			'total_price'    => $totalPaymentAmt,
			'payment_method' => 'DG0000',
			'pg_provider'    => 'DGKR',
			'step'           => '2',
			'is_mobile'      => 'N',
			'version'        => '3',
		), true);

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

		$order_item_list = $order->getCartItemList($_SESSION['member']['m_no']);
		$logger->info($order_item_list);

		$model_info = array();

		//주문상세내역 저장
		$item_count = 1;
		$repay_point =0;
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

			$model_info[$ordno]=array(
				"model_code"=>$value['model_code'],
				"model_name"=>$value['model_name'],
			);

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
				'm_no'           => $_SESSION['member']['m_no'],
				'm_id'           => $_SESSION['member']['m_id'],
				'ip'             => $ip,
				'is_preorder'    => $value['is_preorder'],
				'is_promotion'   => $is_promotion,
				'repay'          => $repay_point,
			));
			$item_count++;
		}


		$order_item = $order->getOrderItem($settle_no);
		//$logger->info($order_item);

		foreach($order_item as $value){
			//게임코드 발송아이템 정보
			$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);

			switch($value['delivery_type']){
				case "1": //디지털 상품 주문
					$send_status = "pending";
					$item_order_id = "";

					//DGKR 전액할인은 결제수단 코드 'DG0000' 사용. VCNT 분기 회피
					$payment_info = array(
						'pay_type'       => '',
						'ip'             => $ip,
						'm_no'           => $_SESSION['member']['m_no'],
						'm_id'           => $_SESSION['member']['m_id'],
						'name'           => $_SESSION['member']['name'],
						'nickname'       => $_SESSION['member']['nickname'],
						'payment_method' => 'DG0000',
					);
					foreach($delivery_item_list as $sub_value){
						$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
						$order_status = $res['order_status'];
						$send_status  = $res['send_status'];
						$order_system = $res['order_system'];
					}
				break;
				case "2": //실물상품 주문 [초기값 배송대기]
					$order_repo->insertShipment($settle_no, $value, $buyr_name, '2');

					//주문상품 상태는 주문완료[2]
					$order_status="2";
				break;
				case "3": //디지털 + 실물상품 배송
					//디지털 상품 주문
					$send_status = "pending";
					$item_order_id = "";

					$payment_info = array(
						'pay_type'       => '',
						'ip'             => $ip,
						'm_no'           => $_SESSION['member']['m_no'],
						'm_id'           => $_SESSION['member']['m_id'],
						'name'           => $_SESSION['member']['name'],
						'nickname'       => $_SESSION['member']['nickname'],
						'payment_method' => 'DG0000',
					);
					foreach($delivery_item_list as $sub_value){
						$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
						$order_status = $res['order_status'];
						$send_status  = $res['send_status'];
						$order_system = $res['order_system'];
					}

					//실물상품 주문
					$order_repo->insertShipment($settle_no, $value, $buyr_name, '2');

					//주문상품 상태는 주문완료[2]
					$order_status="2";
				break;
			}

			//DGKR 전액할인은 즉시 완료이므로 order_date도 갱신 (4번째 인자=true)
			$order_repo->updateItemStatus($value['ordno'], $order_status, $send_status, $order_system, true);
		}


		//장바구니 삭제
		$order_repo->clearCart($_SESSION['member']['m_no']);

		//사용 적립금 차감
		if($use_emoney>0){
			$member->setMemberEmoney($_SESSION['member']['m_no'],$use_emoney,'주문결제시 할인',$settle_no);
		}

		echo "/order/order_end.html?settle_no=".$settle_no;
	}
}catch(Exception $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
