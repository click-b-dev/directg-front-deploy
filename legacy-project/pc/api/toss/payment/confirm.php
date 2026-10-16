<?php

// 클라이언트에서 받은 JSON 요청 바디입니다.
$jsonStr = file_get_contents('php://input');
$jsonObj = json_decode($jsonStr, true);
$data = [
    'paymentKey' => $jsonObj['paymentKey'] ?? '',
    'orderId' => $jsonObj['orderId'] ?? '',
    'amount' => $jsonObj['amount'] ?? ''
];

// 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
// 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
$widgetSecretKey = 'test_gsk_Poxy1XQL8R2XOw0JpA2587nO5Wml';
$credential = base64_encode($widgetSecretKey . ':');

// 결제를 승인하면 결제수단에서 금액이 차감돼요.
$url = 'https://api.tosspayments.com/v1/payments/confirm';
$curlHandle = curl_init($url);
curl_setopt_array($curlHandle, [
    CURLOPT_POST => TRUE,
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_HTTPHEADER => [
        'Authorization: Basic ' . $credential,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($curlHandle);
$httpCode = curl_getinfo($curlHandle, CURLINFO_HTTP_CODE);

if ($httpCode == 200) {
    // 결제 성공 비즈니스 로직을 구현하세요.
    error_log($response);
} else {
    // 결제 실패 비즈니스 로직을 구현하세요.
    error_log($response);
}

http_response_code($httpCode);
echo $response;

?>