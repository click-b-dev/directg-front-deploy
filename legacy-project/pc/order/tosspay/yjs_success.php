<?php
ini_set('display_errors', '0');
session_start();
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_tosspay.xml');
$logger = Logger::getLogger("pc");

$mode="";

// 토스페이에서 콜백으로 전달한 파라미터
$status = filter_input(INPUT_POST, 'status', FILTER_SANITIZE_STRING);
$payToken = filter_input(INPUT_POST, 'payToken', FILTER_SANITIZE_STRING);
$orderNo = filter_input(INPUT_POST, 'orderNo', FILTER_SANITIZE_STRING);
$payMethod = filter_input(INPUT_POST, 'payMethod', FILTER_SANITIZE_STRING);
$amount = filter_input(INPUT_POST, 'amount', FILTER_SANITIZE_NUMBER_INT);
$discountedAmount = filter_input(INPUT_POST, 'discountedAmount', FILTER_SANITIZE_NUMBER_INT);
$paidAmount = filter_input(INPUT_POST, 'paidAmount', FILTER_SANITIZE_NUMBER_INT);
$paidTs = filter_input(INPUT_POST, 'paidTs', FILTER_SANITIZE_STRING);
$transactionId = filter_input(INPUT_POST, 'transactionId', FILTER_SANITIZE_STRING);
$cardCompanyCode = filter_input(INPUT_POST, 'cardCompanyCode', FILTER_SANITIZE_STRING);
$cardAuthorizationNo = filter_input(INPUT_POST, 'cardAuthorizationNo', FILTER_SANITIZE_STRING);
$spreadOut = filter_input(INPUT_POST, 'spreadOut', FILTER_SANITIZE_STRING);
$noInterest = filter_input(INPUT_POST, 'noInterest', FILTER_SANITIZE_STRING);
$cardMethodType = filter_input(INPUT_POST, 'cardMethodType', FILTER_SANITIZE_STRING);
$cardNumber = filter_input(INPUT_POST, 'cardNumber', FILTER_SANITIZE_STRING);
$cardUserType = filter_input(INPUT_POST, 'cardUserType', FILTER_SANITIZE_STRING);
$cardBinNumber = filter_input(INPUT_POST, 'cardBinNumber', FILTER_SANITIZE_STRING);
$cardNum4Print = filter_input(INPUT_POST, 'cardNum4Print', FILTER_SANITIZE_STRING);
$salesCheckLinkUrl = filter_input(INPUT_POST, 'salesCheckLinkUrl', FILTER_SANITIZE_STRING);
$accountBankCode = filter_input(INPUT_POST, 'accountBankCode', FILTER_SANITIZE_STRING);
$accountBankName = filter_input(INPUT_POST, 'accountBankName', FILTER_SANITIZE_STRING);
$accountNumber = filter_input(INPUT_POST, 'accountNumber', FILTER_SANITIZE_STRING);
$settle_no = $orderNo;

$logger->info($_REQUEST);

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//기존 DB
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$order = new Order($conn);
	$asset = new Asset();
	$genba = new Genba("Live");
	$ztorm = new Ztorm();
	$vaultn = new Vaultn();
	$pointnexus = new PointNexus("test"); //TODO: 운영 전환 시 "prod"
	$member = new Member($conn_dgkr);

	$tosspay = new Tosspay($mode);
	$order_info = $order->getOrder($settle_no);

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

	if (!$order_info) {
		throw new Exception("주문 정보를 찾을 수 없습니다.");
	}

	// 이미 결제된 내역일 경우
	if($order_info["step"]=="2"){
		header('Location: /order/order_end.html?settle_no=' . $settle_no);
		exit;
	}

	// 2. 금액 검증
	if ($order_info['total_price'] != $amount) {
		throw new Exception("결제 금액이 일치하지 않습니다. (주문금액: {$order_info['total_price']}, 결제금액: {$amount})");
	}

	// 5. ⭐ tosspay_log 테이블에 전체 결제 정보 저장
	$query = "INSERT INTO tosspay_log (settle_no, status, payToken, orderNo, payMethod, amount, discountedAmount, paidAmount, paidTs, transactionId, cardCompanyCode, cardAuthorizationNo, spreadOut, noInterest, cardMethodType, cardNumber, cardUserType, cardBinNumber, cardNum4Print, salesCheckLinkUrl, accountBankCode, accountBankName, accountNumber, reg_date)
	VALUES
	(:settle_no, :status, :payToken, :orderNo, :payMethod, :amount, :discountedAmount, :paidAmount, :paidTs, :transactionId, :cardCompanyCode, :cardAuthorizationNo, :spreadOut, :noInterest, :cardMethodType, :cardNumber, :cardUserType, :cardBinNumber, :cardNum4Print, :salesCheckLinkUrl, :accountBankCode, :accountBankName, :accountNumber, NOW())";

	$params = array(
		':settle_no' => $settle_no,
		':status' => $status,
		':payToken' => $payToken,
		':orderNo' => $orderNo,
		':payMethod' => $payMethod,
		':amount' => $amount,
		':discountedAmount' => $discountedAmount,
		':paidAmount' => $paidAmount,
		':paidTs' => $paidTs,
		':transactionId' => $transactionId,
		':cardCompanyCode' => $cardCompanyCode,
		':cardAuthorizationNo' => $cardAuthorizationNo,
		':spreadOut' => $spreadOut,
		':noInterest' => $noInterest,
		':cardMethodType' => $cardMethodType,
		':cardNumber' => $cardNumber,
		':cardUserType' => $cardUserType,
		':cardBinNumber' => $cardBinNumber,
		':cardNum4Print' => $cardNum4Print,
		':salesCheckLinkUrl' => $salesCheckLinkUrl,
		':accountBankCode' => $accountBankCode,
		':accountBankName' => $accountBankName,
		':accountNumber' => $accountNumber
	);
	$logger->info($params);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	switch($payMethod){
		case "CARD":
			$payment_method = "SC0010";
		break;
		case"TOSS_MONEY":
			$payment_method = "toss_pay";
		break;
	}

	//주결제수단 및 결제완료 업데이트
	$u_query="UPDATE tbl_order SET step='2',pg_provider='toss_pay',payment_method=:payment_method, payment_date=now() WHERE settle_no=:settle_no";
	$params = array(
		":payment_method"=>$payment_method,
		":settle_no"=>$settle_no,
	);
	$logger->info($params);
	$stmt = $conn->prepare($u_query);
	$stmt->execute($params);

	//IP 취득 (원본 코드에서 누락되어 있던 것을 보완)
	$ip = get_client_ip_env();

	//주문상품목록 및 게임코드발송
	$order_item = $order->getOrderItem($settle_no);

	foreach($order_item as $value){
		//게임코드 발송아이템 정보
		$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);

		switch($value['delivery_type']){
			case "1": //디지털상품 주문
				$send_status = "pending";
				$item_order_id = "";

				//Tosspay는 가상계좌가 없어 항상 즉시 완료 처리 (VCNT 분기 회피)
				$payment_info = array(
					'pay_type'       => '',
					'ip'             => $ip,
					'm_no'           => $order_info['m_no'],
					'm_id'           => $order_info['m_id'],
					'name'           => $_SESSION['member']['name'],
					'nickname'       => $_SESSION['member']['nickname'],
					'payment_method' => $payment_method,
				);
				foreach($delivery_item_list as $sub_value){
					$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
					$order_status = $res['order_status'];
					$send_status  = $res['send_status'];
					$order_system = $res['order_system'];
				}
			break;
			case "2": //실물상품 주문
				if($_SESSION['member']['name']){
					$name = $_SESSION['member']['name'];
				}else{
					$name = $_SESSION['member']['nickname'];
				}

				$order_repo->insertShipment($settle_no, $value, $name, '2');
				$order_status="2";
			break;
			case "3": //디지털 + 실물상품 배송
				if($_SESSION['member']['name']){
					$name = $_SESSION['member']['name'];
				}else{
					$name = $_SESSION['member']['nickname'];
				}
				//디지털 상품 주문
				$send_status = "pending";
				$item_order_id = "";

				$payment_info = array(
					'pay_type'       => '',
					'ip'             => $ip,
					'm_no'           => $order_info['m_no'],
					'm_id'           => $order_info['m_id'],
					'name'           => $_SESSION['member']['name'],
					'nickname'       => $_SESSION['member']['nickname'],
					'payment_method' => $payment_method,
				);
				foreach($delivery_item_list as $sub_value){
					$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
					$order_status = $res['order_status'];
					$send_status  = $res['send_status'];
					$order_system = $res['order_system'];
				}

				//실물상품 주문
				$order_repo->insertShipment($settle_no, $value, $name, '2');
				$order_status="2";
			break;
		}

		$order_repo->updateItemStatus($value['ordno'], $order_status, $send_status, $order_system);
	}

	//장바구니 삭제
	$order_repo->clearCart($order_info['m_no']);

	//사용 적립금 차감
	$use_emoney = $order->getOrderUsePoint($settle_no);
	if($use_emoney>0){
		$member->setMemberEmoney($order_info['m_no'],$use_emoney,'주문결제시 할인',$settle_no);
	}
} catch (Exception $e) {
	exit;
}
?>
