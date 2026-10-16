<?
// 1. 헤더 정보 추출
$headers = getallheaders();
// 헤더명은 대소문자를 구분하지 않거나 원본 그대로 들어옴
$deviceId = $headers['HTTP_X_DEVICE_ID'] ?? $headers['http-x-device-id'] ?? 'default_id';

require '../../../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;


$secret_key = "directgames";

$payload = [
    "iss" => "https://m.directg.net",
    "iat" => time(),
    "exp" => time() + 3600,
    "did" => hash('sha256', $deviceId), // 기기 ID를 직접 노출하지 않고 해시화
];

$jwt = JWT::encode($payload, $secret_key, 'HS256');


echo $jwt;

?>