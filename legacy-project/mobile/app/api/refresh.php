<?
####################################################################
####################################################################
header('Content-Type: application/json');
require '../../../vendor/autoload.php';

use Firebase\JWT\JWT;

$secret_key = "dgkrshop_api"; // 서버만 알고 있는 비밀키

$headers = getallheaders();
$refresh_token = $headers['X-Refresh-Token'] ?? '';

if (!$refresh_token) {
    http_response_code(400);
    exit(json_encode(["error" => "Refresh token required"]));
}
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	// 1. DB에서 해당 토큰 존재 및 만료 여부 확인
	$query="SELECT m_no FROM refresh_tokens WHERE token_hash =:token_hash AND expires_at > NOW()";
	$stmt = $conn->prepare($query);
	$params = array(
		':token_hash'=>$refresh_token,
	);
	$stmt->execute($params);
	$data = $stmt->fetch();
	
	if ($data) {
		// 2. 새로운 Access Token 발급
		$access_payload = [
			"iat" => time(),
			"exp" => time() + (15 * 60),
			"m_no" => $data['m_no']
		];
		$new_access_token = JWT::encode($access_payload, $secret_key, 'HS256');
		$expires_at = date('Y-m-d H:i:s', strtotime('+14 days'));
		
		// 3 토큰 만료시간 연장
		$query="update refresh_tokens set expires_at =:expires_at, created_at = NOW() where m_no=:m_no";
		$stmt = $conn->prepare($query);
		$params = array(
			':expires_at'=>$expires,
			':m_no'=>$result['m_no'],
		);
		$stmt->execute($params);

		echo json_encode([
			"status" => "success",
			"access_token" => $new_access_token
		]);
	} else {
		http_response_code(401);
		echo json_encode(["error" => "세션이 만료되었습니다. 다시 로그인해주세요."]);
	}
	
}catch (PDOException $e){
	http_response_code(500);
    echo json_encode(["error" => "서버 오류: " . $e->getMessage()]);
	die();
}


?>