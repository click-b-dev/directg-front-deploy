<?php
ini_set('display_errors', '0');
header("Cache-Control: no-cache");
session_cache_limiter('private_no_expire');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss.xml');
$logger = Logger::getLogger("mobile");

$settle_no = filter_input(INPUT_GET, 'settle_no', FILTER_SANITIZE_STRING);
$goods_name = filter_input(INPUT_GET, 'goods_name', FILTER_SANITIZE_STRING);
$mode="";

if($mode=="test"){
	$clientKey = "test_gck_AQ92ymxN34Z1Gqlgp0PKrajRKXvd";
} else {
	$clientKey = "live_gck_QbgMGZzorznL1Pz5oOxDrl5E1em4";
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
	throw new Exception($e);
	exit;
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>토스페이먼츠 결제</title>
	<style>
		body {
			margin: 0;
			padding: 20px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			background: #f8f9fa;
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			background: white;
			padding: 20px;
			border-radius: 8px;
		}
		#payment-widget {
			margin: 20px 0;
		}
		#payment-button {
			width: 100%;
			padding: 16px;
			background: #3182f6;
			color: white;
			border: none;
			border-radius: 8px;
			font-size: 16px;
			font-weight: bold;
			cursor: pointer;
			margin-top: 20px;
		}
		#payment-button:hover {
			background: #1b64da;
		}
		#payment-button:disabled {
			background: #94a3b8;
			cursor: not-allowed;
		}
		.order-info {
			margin-bottom: 20px;
			padding: 15px;
			background: #f1f5f9;
			border-radius: 6px;
		}
		.order-info h3 {
			margin-top: 0;
			font-size: 18px;
		}
		.order-info p {
			margin: 8px 0;
			font-size: 14px;
		}
	</style>
	<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
</head>
<body>
	<div class="container">
		<div class="order-info">
			<h3>주문 정보</h3>
			<p><strong>주문번호:</strong> <?=$settle_no?></p>
			<p><strong>상품명:</strong> <?=$goods_name?></p>
			<p><strong>결제금액:</strong> <?=number_format($order_info['total_price'])?>원</p>
		</div>
		
		<!-- 결제 UI -->
		<div id="payment-widget"></div>
		
		<!-- 이용약관 UI -->
		<div id="agreement"></div>
		
		<!-- 결제하기 버튼 -->
		<button id="payment-button" disabled>결제하기</button>
	</div>

	<script src="https://js.tosspayments.com/v2/standard"></script>
	<script>
		const clientKey = "<?=$clientKey?>";
		const customerKey = "<?=$_SESSION['member']['m_no']?>"; // 고객 고유 ID
		
		const tossPayments = TossPayments(clientKey);
		const widgets = tossPayments.widgets({ customerKey });

		let paymentMethodWidget = null;
		let agreementWidget = null;

		async function renderPaymentWidgets() {
			try {
				// 결제위젯 렌더링
				await widgets.setAmount({
					currency: "KRW",
					value: <?=$order_info['total_price']?>
				});

				paymentMethodWidget = await widgets.renderPaymentMethods({
					selector: "#payment-widget",
					variantKey: "tosspay"
				});
				
				// 약관 UI 렌더링
				agreementWidget = await widgets.renderAgreement({
					selector: "#agreement",
					variantKey: "AGREEMENT"
				});

				// 렌더링 완료 후 버튼 활성화
				document.getElementById("payment-button").disabled = false;
				
			} catch (error) {
				console.error("결제위젯 렌더링 실패:", error);
				alert("결제 화면을 불러오는데 실패했습니다.");
				window.close();
			}
		}

		// 결제하기 버튼 이벤트
		document.getElementById("payment-button").addEventListener("click", async function() {
			try {
				// 현재 선택된 결제수단 확인
				const selectedPaymentMethod = await paymentMethodWidget.getSelectedPaymentMethod();
				
				// 토스페이 직연동인 경우 - 현재 창을 토스페이 결제위젯으로 이동
				if (selectedPaymentMethod.code === 'TOSSPAY') {
					
					const agreementCheckboxes = document.querySelectorAll('#agreement input[type="checkbox"]');
					let allAgreed = true;

					agreementCheckboxes.forEach(checkbox => {
						if (checkbox.hasAttribute('required') && !checkbox.checked) {
							allAgreed = false;
						}
					});
					
					if (!allAgreed) {
						alert('필수 약관에 동의해주세요.');
						return;
					}

					$.ajax({
						type: "POST",
						url: "/order/tosspay/tosspay_widget.php",
						dataType: 'json',
						data: {settle_no:"<?=$settle_no?>",goods_name:"<?=urlencode($goods_name)?>"},
						success:function(data){
							if(data.code==0){
								document.location.href = data.checkoutPage;
							} else {
								console.log(data);
								alert(data.msg);
							}
						}
					});

					return;
				}
				
				// 그 외 결제수단은 결제위젯으로 처리
				await widgets.requestPayment({
					orderId: "<?=$settle_no?>",
					orderName: "<?=addslashes($goods_name)?>",
					successUrl: window.location.origin + "/order/tosspayment/yjs_toss_success.php",
					failUrl: window.location.origin + "/order/order_fail.html",
					customerEmail: "<?=$order_info['m_id']?>",
					customerName: "<?=$customer_name?>"
				});
				
			} catch (error) {
				console.error("결제 요청 실패:", error);
				alert("결제 요청 중 오류가 발생했습니다.");
			}
		});

		// 페이지 로드 시 위젯 렌더링
		renderPaymentWidgets();
	</script>
</body>
</html>