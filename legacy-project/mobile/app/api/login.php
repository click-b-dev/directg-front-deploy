<?
	//ini_set( "display_errors", 1 );
	header('Content-Type: application/json');
	require '../../../vendor/autoload.php';
	use Firebase\JWT\JWT;
	use Firebase\JWT\Key;
	use Firebase\JWT\ExpiredException;
	use Firebase\JWT\SignatureInvalidException;
	
	// 1. 환경 설정 (실제 운영 시 별도 환경변수 파일 .env에 저장 권장)
	$secret_key = "dgkrshop_api"; // 서버만 알고 있는 비밀키
	$issuer = "https://m.directg.net";        // 토큰 발행자
	$audience = "https://api.directg.net";      // 토큰 대상자
	$issued_at = time();
	$expire_at = $issued_at + 3600;            // 유효기간 1시간 (3600초)
	
	// 2. 입력 데이터 수신
	$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_STRING);
	$m_pwd = filter_input(INPUT_POST, 'm_pwd', FILTER_SANITIZE_STRING);
	
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	$ip = get_client_ip_env();
	
	// 3. DB 사용자 검증
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn_dgkr);
	
	$result = $member->memberLogin($m_id,$m_pwd,$ip);
	
	if($result['status']=='5'){
		http_response_code(401);
		echo json_encode(["error" => "회원가입시 인증이 완료되지 않는 회원입니다."]);
	}
	
	if($result['m_id']){
		// 4. Access Token 생성 (유효기간 15분 - 보안 강화)
		$access_payload = [
			"iat" => time(),
			"exp" => time() + (15 * 60), 
			"m_no" => $result['m_no']
		];
		$access_token = JWT::encode($access_payload, $secret_key, 'HS256');
	
		 // 5. Refresh Token 생성 (유효기간 14일 - 로그인 유지)
		$refresh_token = bin2hex(random_bytes(32)); // 랜덤 문자열 생성
		$expires_at = date('Y-m-d H:i:s', strtotime('+14 days'));
		//$token_hash = hash('sha256', $refresh_token);
		
		// 6. DB에 Refresh Token 저장 (기존 토큰 삭제 후 저장하는 순환 방식 권장)
		$query = "INSERT INTO refresh_tokens set m_no=:m_no,token_hash=:token_hash,expires_at=:expires_at ON DUPLICATE KEY UPDATE token_hash = :token_hash, expires_at =:expires_at, created_at = NOW()";
		$stmt = $conn->prepare($query);
		$params = array(
			':m_no'=>$result['m_no'],
			':token_hash'=>$refresh_token,
			':expires_at'=>$expires_at,
		);
		$stmt->execute($params);
		
		// 7 웹 로그인 처리
		$_SESSION['member']=array(
			"m_no"=>$result['m_no'],
			"m_id"=>$result['m_id'],
			"name"=>$result['name'],
			"hp"=>$result['hp'],
			"nickname"=>$result['nickname'],
			"mem_level"=>$result['mem_level'],
			"visitorId"=>$result['visitorId'],
		);
		
		echo json_encode([
			"status" => "success",
			"access_token" => $access_token,
			"refresh_token" => $refresh_token,
			"expires_in" => 900 // 15분
		]);
	}else{
		http_response_code(401);
		echo json_encode(["error" => "로그인 정보가 올바르지 않습니다."]);
	}

}catch (PDOException $e){
	http_response_code(500);
    echo json_encode(["error" => "서버 오류: " . $e->getMessage()]);
	die();
}

?>