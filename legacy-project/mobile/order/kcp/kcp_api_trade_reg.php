<?php
	ini_set('display_errors', '0');
	//error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
    header("Content-type: application/json; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcp_mobile.xml');
	$logger = Logger::getLogger("mobile");
	
	$kcp = new Kcp("");
    /*
     ==========================================================================
          거래등록 API URL
     --------------------------------------------------------------------------
     */
    $ordr_idxx          = $_POST[ "ordr_idxx" ]; // 주문번호
    $good_mny           = $_POST[ "good_mny" ]; // 결제 금액
    $good_name          = $_POST[ "good_name" ]; // 상품명
    $pay_method         = $_POST[ "pay_method" ]; // 결제수단
    $Ret_URL            = $_POST[ "Ret_URL" ]; // 리턴 URL
    /* ============================================================================== */
    $actionResult       = $_POST[ "ActionResult" ]; // pay_method에 매칭되는 값 (인증창 호출 시 필요)
    $van_code           = $_POST[ "van_code" ]; // (포인트,상품권 인증창 호출 시 필요)
	
	$escw_used = filter_input(INPUT_POST, 'escw_used', FILTER_SANITIZE_STRING);
	$deli_term = filter_input(INPUT_POST, 'deli_term', FILTER_SANITIZE_STRING);
	
	$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
	$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
	$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
	$address2 = filter_input(INPUT_POST, 'address2', FILTER_SANITIZE_STRING);
	$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);
	$buyr_tel2 = filter_input(INPUT_POST, 'buyr_tel2', FILTER_SANITIZE_STRING);
	$msg = filter_input(INPUT_POST, 'msg', FILTER_SANITIZE_STRING);
	$user_agent = filter_input(INPUT_POST, 'user_agent', FILTER_SANITIZE_STRING);
	
	if($_SESSION['member']["m_id"]==""){
		$arr_data=array(
			"Code"=>99,
			"Message"=>"세션만료"
		);
		$json_data = json_encode($arr_data);
		echo $json_data;
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
		$order_repo = new OrderRepository($conn, $logger);

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
				$arr_data=array(
					"Code"=>"NG_POINT",
					"Message"=>"보유한 포인트보다 많은 포인트는 사용하실 수 없습니다."
				);
				$json_data = json_encode($arr_data);
				echo $json_data;
				exit;
			}
		}

		$params = array(
			"site_cd"        => $site_cd,
			"kcp_cert_info"  => $kcp_cert_info,
			"ordr_idxx"      => $ordr_idxx,
			"good_mny"       => $totalPaymentAmt,
			"good_name"      => $good_name,
			"pay_method"     => $pay_method,
			"Ret_URL"        => $Ret_URL,
			"escw_used"      => $escw_used,
			"deli_term"      => $deli_term,
			"user_agent"     => $user_agent
		);
		
		$logger->info($params);
		
		if($pay_method=="VCNT"){
			$res_cd = "0000";
			$json_data = array(
				"code"=>"1",
				"message"=>"가상계좌",
				"res_cd"=>"0000",
				"use_pay_method"=>"001000000000",
				"res_msg"=>"정상처리",
				"pay_method"=>"VCNT"
			);
			$res_data = json_encode($json_data, true);
		} else {
			//거래등록 API
			$res_data = $kcp->tradeReg($params);
			/* 
			==========================================================================
			거래등록 응답정보                                                               
			--------------------------------------------------------------------------
			*/
			$res_cd      = ""; // 응답코드
			$res_msg     = ""; // 응답메세지
			$approvalKey = ""; // 거래등록키
			$traceNo     = ""; // 추적번호
			$PayUrl      = ""; // 거래등록 PAY URL
			
			// RES JSON DATA Parsing
			$json_res = json_decode($res_data, true);
			$logger->info("\n####거래등록 응답정보API#########\n");
			$logger->info($json_res);
			
			$res_cd      = $json_res["Code"];
			$res_msg     = $json_res["Message"];
			$approvalKey = $json_res["approvalKey"];
			$traceNo     = $json_res["traceNo"];
			$PayUrl      = $json_res["PayUrl"];
		}
		
		switch($pay_method){
			case "VCNT": //가상계좌
				$settlekind = "SC0040";
			break;
			case "CARD": //신용카드
				$settlekind = "SC0010";
			break;
			case "BANK": //계좌이체
				$settlekind = "SC0030";
			break;
			case "MOBX": //휴대폰
				$settlekind = "SC0060";
			break;
		}
		
		if($res_cd=="0000"){ //거래등록 성공시
		//거래등록 응답 저장
			$ip = get_client_ip_env();
		
			$logger->info("\n####주문서 저장#########\n");
			$order_repo->insertOrder(array(
				'settle_no'      => $ordr_idxx,
				'm_no'           => $_SESSION['member']['m_no'],
				'm_id'           => $_SESSION['member']['m_id'],
				'ord_ymd'        => date('Y-m-d'),
				'ip'             => $ip,
				'use_emoney'     => $use_emoney,
				'total_price'    => $totalPaymentAmt,
				'payment_method' => $settlekind,
				'pg_provider'    => 'kcp',
				'step'           => '1',
				'is_mobile'      => 'Y',
				'version'        => '3',
			));
		
			/*######################################################################
			배송지 정보 저장
			*/######################################################################
			if($zipcode){
				$logger->info("\n####배송지 저장#########\n");
				$order_repo->insertAddress(array(
					'settle_no'      => $ordr_idxx,
					'm_id'           => $_SESSION['member']['m_id'],
					'name'           => $buyr_name,
					'zipcode'        => $zipcode,
					'address'        => $address,
					'address_detail' => $address2,
					'tel'            => $buyr_tel2,
					'msg'            => $msg,
				));
			}
		
			$cart_item_list = $order->getCartItemList($_SESSION['member']['m_no']);
			
			$item_count = 1;
			
			$logger->info("\n####주문서 상세저장#########\n");
			foreach($cart_item_list as $key=>$value){
				$ordno = $ordr_idxx."_".$item_count;
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
					'settle_no'      => $ordr_idxx,
					'ordno'          => $ordno,
					'product_code'   => $value['product_code'],
					'product_name'   => $value['product_name'],
					'delivery_type'  => $value['delivery_type'],
					'goods_price'    => $value['consumer_price'],
					'price'          => $price,
					'order_srp'      => $order_srp,
					'order_ppr'      => $value['product_ppr'],
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
			
			echo $res_data;
		}else{//거래등록 실패시
			echo $res_data;
		}
	}catch(Exception $e){
		echo 'Error!: '.$e->getMessage();
		die();
	}
?>