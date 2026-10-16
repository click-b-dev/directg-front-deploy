<?php
ini_set( "display_errors", 1 );
require '../../../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthServer {
	private $_db;
    private $secret_key = "directgames"; // .env 파일에서 관리 권장
	
	public function __construct(PDO $db){
		$this->_db = $db;
	}

    public function generateTokens($device_id) {
        $issuedAt = time();
        
        // 1. Access Token (수명 30분)
        $payload = [
            'iat'  => $issuedAt,
            'exp'  => $issuedAt + (60 * 30),
            'did'  => hash('sha256',$device_id),
            'iss'  => 'https://m.directg.net',
        ];
        $jwt = JWT::encode($payload, $this->secret_key, 'HS256');

        // 2. Refresh Token 생성 (난수 생성 후 DB 저장)
        $refresh_token = bin2hex(random_bytes(32));
        $this->saveRefreshToken($refresh_token, $device_id);

        return [
            'access_token' => $jwt,
            'refresh_token' => $refresh_token
        ];
    }

    private function saveRefreshToken($token, $device_id) {
        // DB 연결 (PDO 권장)
        $expires = date('Y-m-d H:i:s', strtotime('+14 days'));
        $token_hash = hash('sha256', $token); // 토큰 원본 대신 해시 저장
		
        $query = "INSERT INTO refresh_tokens set token_hash=:token_hash,device_id=:device_id,expires_at=:expires_at ON DUPLICATE KEY UPDATE token_hash = :token_hash, expires_at =:expires_at, created_at = NOW()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':token_hash'=>$token_hash,
			':device_id'=>$device_id,
			':expires_at'=>$expires,
		);
		$stmt->execute($params);
        //$stmt = $this->db->prepare("INSERT INTO refresh_tokens (token_hash, device_id, expires_at) VALUES (?, ?, ?, ?)");
        //$stmt->execute([$token_hash, $device_id, $expires]);
    }
	
	function validateApiRequest($jwt, $currentDeviceId) {
		try {
			// 1. JWT 복호화 및 기본 검증 (만료일, 서명 등)
			// 2026년 기준 알고리즘(HS256) 명시 필수
			$decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));

			// 2. 디바이스 식별자(did) 일치 여부 확인 (핵심 보안 로직)
			// 요청에서 넘어온 Device ID를 발급 시와 동일한 방식으로 해싱
			$hashedCurrentDid = hash('sha256', $currentDeviceId);

			if ($decoded->did !== $hashedCurrentDid) {
				// 토큰은 유효하지만 발급된 기기와 다른 기기에서 접근한 경우
				throw new Exception("디바이스 정보가 일치하지 않습니다. 다시 로그인해주세요.");
			}

			// 3. 검증 성공 - 사용자 정보 반환
			return [
				"success" => true,
				"user_id" => $decoded->sub,
				"device_id" => $decoded->device_id
			];

		} catch (ExpiredException $e) {
			// 토큰 만료
			return ["success" => false, "message" => "토큰이 만료되었습니다."];
		} catch (SignatureInvalidException $e) {
			// 토큰 위변조 발생
			return ["success" => false, "message" => "유효하지 않은 서명입니다."];
		} catch (Exception $e) {
			// 기타 오류 (디바이스 불일치 등)
			return ["success" => false, "message" => $e->getMessage()];
		}
	}
}
include_once($_SERVER["DOCUMENT_ROOT"]."/../mobile/lib/api_func.php");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

// 1. 헤더 정보 추출
$headers = getallheaders();
// 헤더명은 대소문자를 구분하지 않거나 원본 그대로 들어옴
$deviceId = $headers['HTTP_X_DEVICE_ID'] ?? $headers['http-x-device-id'] ?? 'default_id';

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$auth = new AuthServer($conn);

	$access_token = $auth->generateTokens($deviceId);
	
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
//print_r($access_token);
?>