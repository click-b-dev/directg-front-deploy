<?php
ini_set('display_errors', '1');
header("Cache-Control: no-cache");
session_cache_limiter('private_no_expire');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss.xml');
$logger = Logger::getLogger("pc");
$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);
$goods_name = filter_input(INPUT_GET, 'goods_name', FILTER_SANITIZE_STRING);
$mode="";
// 토스페이 별도 MID
if($mode=="TEST"){
	$clientKey = "test_ck_7DLJOpm5Qrld74AkkDqrPNdxbWnY";
} else {
	$clientKey = "live_ck_YZ1aOwX7K8mBzxEGGRq3yQxzvNPG";
}
if($_SESSION['member']['name']==""){
	$customer_name = $_SESSION['member']['nickname'];
} else {
	$customer_name = $_SESSION['member']['name'];
}
// DB에서 예약된 결제 정보 조회
try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$order = new Order($conn);
	$order_info = $order->getOrder($settle_no);
	
	if(!$order_info){
		throw new Exception("주문 정보를 찾을 수 없습니다.");
	}
	
} catch (Exception $e){
	exit;
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>토스페이 결제</title>
	<!-- SDK 추가 -->
	<script src="https://js.tosspayments.com/v2/standard"></script>
	<style>
		body {
			margin: 0;
			padding: 20px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			background: #f8f9fa;
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 100vh;
		}
		.loading {
			text-align: center;
		}
		.spinner {
			border: 4px solid #f3f3f3;
			border-top: 4px solid #3182f6;
			border-radius: 50%;
			width: 40px;
			height: 40px;
			animation: spin 1s linear infinite;
			margin: 0 auto 20px;
		}
		@keyframes spin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
	</style>
</head>
<body>
	<div class="loading">
		<div class="spinner"></div>
		<p>결제창을 여는 중입니다...</p>
	</div>

	<script>
		// ------  SDK 초기화 ------
		const clientKey = "<?=$clientKey?>";
		const customerKey = "<?=$_SESSION['member']['m_no']?>"; // 고객 고유 ID
		const tossPayments = TossPayments(clientKey);
		const payment = tossPayments.payment({ customerKey });

		// 페이지 로드 시 자동으로 결제창 실행
		window.onload = function() {
			requestPayment();
		};

		async function requestPayment() {
			try {
				// 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
				// 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
				await payment.requestPayment({
					method: "CARD", // 카드 및 간편결제
					amount: {
						currency: "KRW",
						value: <?=$order_info['total_price']?>
					},
					orderId: "<?=$settle_no?>",
					orderName: "<?=addslashes($goods_name)?>",
					successUrl: window.location.origin + "/order/toss_test/tosspay_success.php",
					failUrl: window.location.origin + "/order/order_fail.html",
					customerEmail: "<?=$order_info['m_id']?>",
					customerName: "<?=$customer_name?>",
					// 카드 결제에 필요한 정보
					card: {
						useEscrow: false,
						flowMode: "DIRECT", // 자체창 여는 옵션
						easyPay: "토스페이", // 간편결제 자체창
						useCardPoint: false,
						useAppCardOnly: false
					}
				});
			} catch (error) {
				console.error("결제 요청 실패:", error);
				alert("결제창을 여는 중 오류가 발생했습니다.");
				window.close();
			}
		}
	</script>
</body>
</html>