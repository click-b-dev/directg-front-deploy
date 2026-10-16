<?
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$new_pwd = filter_input(INPUT_POST, 'new_pwd', FILTER_SANITIZE_STRING);
$new_pwd_re = filter_input(INPUT_POST, 'new_pwd_re', FILTER_SANITIZE_STRING);
$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_EMAIL);
$token = filter_input(INPUT_POST, 'token', FILTER_SANITIZE_STRING);

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$member = new Member($conn_dgkr);
	
	//비밀번호 재설정완료
	$member ->memberPwdReset($m_id,$new_pwd);
	
	$json_data = array(
		'code' => "ok",
		'message' => "비밀번호 재설정이 완료되었습니다.",
	);

	$json = json_encode($json_data);
	echo $json;

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>