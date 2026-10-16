<?php
ini_set('display_errors', '1');
session_start();
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss.xml');
$logger = Logger::getLogger("mobile");

// 토스페이먼츠에서 리다이렉트로 전달한 파라미터
$paymentKey = filter_input(INPUT_GET, 'paymentKey', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_GET, 'orderId', FILTER_SANITIZE_STRING);
$amount = filter_input(INPUT_GET, 'amount', FILTER_SANITIZE_NUMBER_INT);

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
	$pointnexus = new PointNexus(); //mode 미지정 → PointNexus::DEFAULT_MODE (운영 전환은 PointNexus.php 한 줄)
	$member = new Member($conn_dgkr);

	$toss = new Toss("");
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

	if($_SESSION['member']["m_no"]!=$order_info['m_no']){
		$logger->info($_SESSION['member']["m_no"]);
		$logger->info($order_info);
		header( "HTTP/1.1 301 Moved Permanently" );
		header( 'Location: https://m.directg.net/order/order_fail.html?msg=세션이 만료되었습니다.' );
	}

	if (!$order_info) {
		throw new Exception("주문 정보를 찾을 수 없습니다.");
	}

	// 이미 결제된 내역일 경우
	if($order_info["step"]=="2"){
		header('Location: /order/order_end.html?settle_no='.$settle_no);
		exit;
	}

	// 2. 금액 검증
	if ($order_info['total_price'] != $amount) {
		throw new Exception("결제 금액이 일치하지 않습니다. (주문금액: {$order_info['total_price']}, 결제금액: {$amount})");
	}

	$data = array(
		"paymentKey" => $paymentKey,
		"orderId" => $settle_no,
		"amount" => $amount
	);

	$result = $toss->confirmPayment($data);
	$logger->info($result);
	if ($result['status'] != 'DONE') {
		throw new Exception('결제가 완료되지 않았습니다. 상태: ' . $result['status']);
	}

	// 5. ⭐ toss_log 테이블에 전체 결제 정보 저장
	$query = "INSERT INTO toss_log (mid, payment_key, order_id, order_name, status, type, method, last_transaction_key, currency, total_amount, balance_amount, supplied_amount, vat, tax_free_amount, tax_exemption_amount, customer_email, requested_at, approved_at, use_escrow, culture_expense, country, is_partial_cancelable, receipt_url, checkout_url, easy_pay, secret, card_info, virtual_account_info, transfer_info, mobile_phone_info, gift_certificate_info, cash_receipt_info, cash_receipts_info, discount_info, cancels_info, receipt_info, checkout_info, failure_info, metadata, reg_date)
	VALUES
	(:mid, :payment_key, :order_id, :order_name, :status, :type, :method, :last_transaction_key, :currency, :total_amount, :balance_amount, :supplied_amount, :vat, :tax_free_amount, :tax_exemption_amount, :customer_email, :requested_at, :approved_at, :use_escrow, :culture_expense, :country, :is_partial_cancelable, :receipt_url, :checkout_url, :easy_pay, :secret, :card_info, :virtual_account_info, :transfer_info, :mobile_phone_info, :gift_certificate_info, :cash_receipt_info, :cash_receipts_info, :discount_info, :cancels_info, :receipt_info, :checkout_info, :failure_info, :metadata, NOW())";

	$params = array(
		':mid' => $result['mId'] ?? null,
		':payment_key' => $result['paymentKey'],
		':order_id' => $result['orderId'],
		':order_name' => $result['orderName'] ?? null,
		':status' => $result['status'],
		':type' => $result['type'] ?? null,
		':method' => $result['method'] ?? null,
		':last_transaction_key' => $result['lastTransactionKey'] ?? null,
		':currency' => $result['currency'] ?? 'KRW',
		':total_amount' => $result['totalAmount'] ?? 0,
		':balance_amount' => $result['balanceAmount'] ?? null,
		':supplied_amount' => $result['suppliedAmount'] ?? null,
		':vat' => $result['vat'] ?? null,
		':tax_free_amount' => $result['taxFreeAmount'] ?? null,
		':tax_exemption_amount' => $result['taxExemptionAmount'] ?? null,
		':customer_email' => $order_info['m_id'] ?? null,
		':requested_at' => $result['requestedAt'] ?? null,
		':approved_at' => $result['approvedAt'] ?? null,
		':use_escrow' => ($result['useEscrow'] ?? false) ? 'Y' : 'N',
		':culture_expense' => ($result['cultureExpense'] ?? false) ? 'Y' : 'N',
		':country' => $result['country'] ?? null,
		':is_partial_cancelable' => ($result['isPartialCancelable'] ?? true) ? 'Y' : 'N',
		':receipt_url' => $result['receipt']['url'] ?? null,
		':checkout_url' => $result['checkout']['url'] ?? null,
		':easy_pay' => $result['easyPay'] ?? null,
		':secret' => $result['secret'] ?? null,
		':card_info' => isset($result['card']) ? json_encode($result['card'], JSON_UNESCAPED_UNICODE) : null,
		':virtual_account_info' => isset($result['virtualAccount']) ? json_encode($result['virtualAccount'], JSON_UNESCAPED_UNICODE) : null,
		':transfer_info' => isset($result['transfer']) ? json_encode($result['transfer'], JSON_UNESCAPED_UNICODE) : null,
		':mobile_phone_info' => isset($result['mobilePhone']) ? json_encode($result['mobilePhone'], JSON_UNESCAPED_UNICODE) : null,
		':gift_certificate_info' => isset($result['giftCertificate']) ? json_encode($result['giftCertificate'], JSON_UNESCAPED_UNICODE) : null,
		':cash_receipt_info' => isset($result['cashReceipt']) ? json_encode($result['cashReceipt'], JSON_UNESCAPED_UNICODE) : null,
		':cash_receipts_info' => isset($result['cashReceipts']) ? json_encode($result['cashReceipts'], JSON_UNESCAPED_UNICODE) : null,
		':discount_info' => isset($result['discount']) ? json_encode($result['discount'], JSON_UNESCAPED_UNICODE) : null,
		':cancels_info' => isset($result['cancels']) ? json_encode($result['cancels'], JSON_UNESCAPED_UNICODE) : null,
		':receipt_info' => isset($result['receipt']) ? json_encode($result['receipt'], JSON_UNESCAPED_UNICODE) : null,
		':checkout_info' => isset($result['checkout']) ? json_encode($result['checkout'], JSON_UNESCAPED_UNICODE) : null,
		':failure_info' => isset($result['failure']) ? json_encode($result['failure'], JSON_UNESCAPED_UNICODE) : null,
		':metadata' => isset($result['metadata']) ? json_encode($result['metadata'], JSON_UNESCAPED_UNICODE) : null
	);
	$logger->info($params);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	switch($result['method']){
		case "카드":
			$payment_method = "SC0010";
		break;
		case "가상계좌":
			$payment_method = "SC0040";
		break;
		case "계좌이체":
			$payment_method = "SC0030";
		break;
		case "휴대폰":
			$payment_method = "SC0060";
		break;
		case "상품권":
			$payment_method = "상품권";
		break;
		case "해외간편결제":
			$payment_method = "해외";
		break;
	}

	//주결제수단 및 결제완료 업데이트
	$u_query="UPDATE tbl_order SET step='2',payment_method=:payment_method, payment_date=now() WHERE settle_no=:settle_no";
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

				//토스는 가상계좌도 즉시 완료 처리하므로 pay_type을 빈 값으로 (VCNT 분기 회피)
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

	//##############################################################
	//사용 적립금 차감
	//##############################################################
	$use_emoney = $order->getOrderUsePoint($settle_no);
	if($use_emoney>0){
		$member->setMemberEmoney($order_info['m_no'],$use_emoney,'주문결제시 할인',$settle_no);
	}

	header( "HTTP/1.1 301 Moved Permanently" );
	header( 'Location: https://m.directg.net/order/order_end.html?settle_no='.$settle_no );
?>

	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title></title>
	</head>
	<body>
		<script>
		function closeWindow() {
			// 팝업이 아닌 경우 (직접 접근 등)
			location.href = '/order/order_end.html?settle_no=<?=$settle_no?>';
		}

		// 페이지 로드 후 자동으로 실행
		closeWindow();

		// 또는 버튼 클릭 시 실행
		// setTimeout(closeWindow, 2000); // 2초 후 자동 실행
		</script>
	</body>
	</html>

<?php
} catch (Exception $e) {
	header( "HTTP/1.1 301 Moved Permanently" );
	header( 'Location: https://m.directg.net/order/order_fail.html?msg='.$e->getMessage() );
	exit;
}
?>
