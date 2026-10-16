<?
	ini_set( "display_errors", 1 );
	require '../../../vendor/autoload.php';
	use Firebase\JWT\JWT;
	use Firebase\JWT\Key;
	use Firebase\JWT\ExpiredException;
	use Firebase\JWT\SignatureInvalidException;
	
	$jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvbS5kaXJlY3RnLm5ldCIsImlhdCI6MTc2OTQxNzk3NSwiZXhwIjoxNzY5NDIxNTc1LCJkaWQiOiIwM2FjNjc0MjE2ZjNlMTVjNzYxZWUxYTVlMjU1ZjA2Nzk1MzYyM2M4YjM4OGI0NDU5ZTEzZjk3OGQ3Yzg0NmY0In0.FjNQNHFo-o57gFzvWZgvF0a0qWc-3uSvU0OQfZ5oW0c";
	
	$currentDeviceId = "1234";
	
	$secretKey = "directgames";

	//echo $jwt;
	$decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
	
	$hashedCurrentDid = hash('sha256', $currentDeviceId);

try {
	if ($decoded->did !== $hashedCurrentDid) {
		// 토큰은 유효하지만 발급된 기기와 다른 기기에서 접근한 경우
		echo json_encode(array("success" => false, "message" => "디바이스 정보가 일치하지 않습니다."));
		exit;
	}
	
	echo json_encode(array("success" => true,"message" => "OK"));
	
} catch (ExpiredException $e) {
	// 토큰 만료
	echo json_encode(array("success" => false, "message" => "토큰이 만료되었습니다."));
} catch (SignatureInvalidException $e) {
	// 토큰 위변조 발생
	echo json_encode(array("success" => false, "message" => "유효하지 않은 서명입니다."));
} catch (Exception $e) {
	// 기타 오류 (디바이스 불일치 등)
	echo json_encode(array("success" => false, "message" => $e->getMessage()));
}


//Authorization: Bearer {Access_Token}
//X-Device-Identifier: {UUID_또는_SSAID} (기기 식별자)
//2단계: 토큰 무결성 검증 (Server)
/*
서버는 JWT::decode를 통해 다음 사항을 즉시 확인합니다.
서명 검증: 서버의 비밀키로 서명된 정상 토큰인가?
만료 확인: exp 시간이 경과하지 않았는가?
변조 확인: 페이로드 데이터가 수정되지 않았는가?
*/

//3단계: 기기 일치 식별 (Server - 핵심):토큰을 탈취한 공격자가 다른 기기에서 API를 호출하는 것을 차단하는 단계입니다.
/*
추출: 복호화된 토큰 페이로드에서 did (발급 당시 기기 ID 해시)를 추출합니다.
해싱: 현재 API 요청 헤더로 들어온 X-Device-Identifier를 서버 솔트와 함께 해싱합니다.
비교: 토큰 내 did === 현재 요청 해시값이 일치하는지 확인합니다.
불일치 시: 토큰이 탈취된 것으로 간주하고 401 Unauthorized 반환 및 해당 토큰 즉시 폐기.
*/
//4단계: 비정상 호출 탐지 (Server - 보안)
/*
*/
?>