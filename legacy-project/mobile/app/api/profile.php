<?php
ini_set( "display_errors", 0 );
header('Content-Type: application/json');
require '../../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

// 1. Authorization 헤더에서 토큰 추출
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["error" => "No authentication token","message"=>"인증 토큰이 없습니다."]);
    exit;
}

$jwt = $matches[1];
$secret_key = "dgkrshop_api"; // 로그인 시 사용한 키와 동일해야 함

try {
    // 2. 토큰 해독 및 검증 (유효기간 체크 자동 포함)
    $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
    $m_no = $decoded->m_no; // 토큰 생성 시 넣었던 데이터
	
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	try{
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		// 3. DB에서 최신 사용자 정보 조회 (보안상 필요한 필드만 선택)
		$query="select m_no,m_id,name,nickname,birth_day,hp,is_auth,mailling,email,mem_level from directgames.tbl_member where m_no=:m_no";
		$stmt = $conn->prepare($query);
		$params = array(
		':m_no'=>$m_no,
		);
		$stmt->execute($params);
		$member_info = $stmt->fetch();

		if ($member_info) {
			echo json_encode([
				"status" => "success",
				"data" => [
					"m_no" => $member_info['m_no'],
					"m_id" => $member_info['m_id'],
					"name" => $member_info['name'],
					"nickname" => $member_info['nickname'],
					"birth_day" => $member_info['birth_day'],
					"hp" => $member_info['hp'],
					"is_auth" => $member_info['is_auth'],
					"mailling" => $member_info['mailling'],
					"email" => $member_info['email'],
					"mem_level" => $member_info['mem_level'],
				]
			]);
		} else {
			http_response_code(404);
			echo json_encode(["error" => "no_member","message"=>"회원정보를 찾을 수 없습니다."]);
		}
	}catch (PDOException $e){
		http_response_code(500);
		echo json_encode(["error" => "server_error","message"=>"서버 오류: " . $e->getMessage()]);
		die();
	}
} catch (Firebase\JWT\ExpiredException $e) {
    // 토큰 만료 시 클라이언트에 명확한 상태 전달 (Refresh Token 로직 트리거용)
    http_response_code(401);
    echo json_encode(["error" => "token_expired", "message" => "토큰이 만료되었습니다."]);
} catch (Exception $e) {
    http_response_code(402);
    echo json_encode(["error" => "invalid_token", "message" => "유효하지 않은 토큰입니다."]);
}