<?php
##############################################################
/*
 1.고정 키 대신 '서명(Signature)' 방식 사용 (가장 권장)
 API Key를 직접 전송하지 않고, HMAC(Hash-based Message Authentication Code)을 사용하여 요청마다 다른 서명을 생성하는 방식입니다.
 2. 타임스탬프 및 Nonce 추가 (재전송 공격 방지)
  탈취된 정상 요청을 그대로 다시 보내는 '재전송 공격(Replay Attack)'을 방어합니다. 
  타임스탬프: 요청 시간에 유효 기간(예: 30초~5분)을 두어 오래된 요청은 거부합니다.
  Nonce: 한 번만 사용되는 임의의 값을 포함하여 동일한 요청이 두 번 처리되지 않도록 합니다.
 3. IP 화이트리스트 및 리퍼러 제한
 특정 서버 간의 통신(Server-to-Server)이라면, API 호출을 허용할 IP 주소를 미리 등록하여 그 외의 접근을 차단합니다. 웹 서비스라면 Referer나 Origin 헤더를 체크하여 지정된 도메인에서만 호출 가능하도록 제한합니다.
  4. 속도 제한(Rate Limiting) 및 할당량(Quota) 설정
  특정 API Key가 비정상적으로 짧은 시간에 많은 요청을 보내는 경우 자동으로 차단합니다. 이는 무차별 대입 공격(Brute-force)이나 서비스 거부 공격(DoS)을 방지하는 필수 조치입니다.
*/
##############################################################
// 보안을 위해 안전한 곳에 보관해야 하는 키
$apiSecret = '8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU='; 

$timestamp = time(); // 현재 시간 (유효기간 검증용)
$nonce = bin2hex(random_bytes(8)); // 중복 요청 방지용 랜덤 값
//$payload = json_encode(['user_id' => 123, 'action' => 'update']);

// 서명 생성: "메서드 + 타임스탬프 + Nonce + 페이로드"를 Secret Key로 해싱
$signatureRaw = "GET" . $timestamp . $nonce;
$signature = hash_hmac('sha256', $signatureRaw, $apiSecret);

// 헤더에 인증 정보 포함
$headers = [
    "X-TIMESTAMP: $timestamp",
    "X-NONCE: $nonce",
    "X-SIGNATURE: $signature",
    "Content-Type: application/json"
];

//print_r($headers);
// CURL 요청 (생략)
?>