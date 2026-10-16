<?
####################################################################
/*
*/
####################################################################
header('Content-Type: application/json');

$headers = getallheaders();
$refresh_token = $headers['X-Refresh-Token'] ?? '';

if (!$refresh_token) {
    http_response_code(400);
    echo (json_encode(["error" => "Refresh token required"]));
	exit;
}

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	// 로그아웃 시
	$query="DELETE FROM refresh_tokens WHERE token_hash=:token_hash";
	$stmt = $conn->prepare($query);
	$params = array(
		':token_hash'=>$refresh_token,
	);
	$stmt->execute($params);
	
	echo json_encode([
			"status" => "OK",
		]);
	
}catch (PDOException $e){
	http_response_code(500);
    echo json_encode(["error" => "서버 오류: " . $e->getMessage()]);
	die();
}
?>
