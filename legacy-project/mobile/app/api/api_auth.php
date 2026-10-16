<?php
ini_set( "display_errors", 1 );
// DB 등에서 관리되는 해당 API Key의 Secret
$storedSecret = '8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU='; 

$headers = getallheaders();
$receivedSignature = $headers['X-SIGNATURE'] ?? '';
$receivedTimestamp = $headers['X-TIMESTAMP'] ?? 0;
$receivedNonce = $headers['X-NONCE'] ?? '';
//$requestBody = file_get_contents('php://input');

// 1. 유효 기간 검증 (예: 5분 이내 요청만 허용)
if (abs(time() - $receivedTimestamp) > 3600) {
    http_response_code(401);
    die("Request expired.");
}

// 2. 서버에서 동일한 서명 재생성
$serverSignatureRaw = $_SERVER['REQUEST_METHOD'] . $receivedTimestamp . $receivedNonce ;
$expectedSignature = hash_hmac('sha256', $serverSignatureRaw, $storedSecret);

// 3. 서명 일치 여부 확인 (타이밍 공격 방지를 위해 hash_equals 사용)
if (hash_equals($expectedSignature, $receivedSignature)) {
    // 성공: API 로직 실행
    echo json_encode(["status" => "success", "data" => "Verified"]);
} else {
    // 실패: 변조되었거나 잘못된 접근
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Invalid Signature"]);
}

############################################################
# Secret Key 비노출: 실제 비밀키(apiSecret)는 네트워크로 전송되지 않습니다.
# 데이터 변조 방지: 중간에 요청 본문(payload)이 수정되면 서버에서 생성한 서명과 일치하지 않게 됩니다.
# 재전송 공격 방어: 타임스탬프를 검사하므로, 공격자가 요청을 가로채 5분 뒤에 다시 보내더라도 서버에서 거부됩니다.
# 타이밍 공격 방지: hash_equals() 함수를 사용하여 문자열 비교 시 발생하는 미세한 시간 차이를 이용한 해킹을 방어합니다.
############################################################
?>