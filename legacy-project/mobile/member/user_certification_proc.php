<?
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_EMAIL);
$authType = filter_input(INPUT_POST, 'authType', FILTER_SANITIZE_STRING);

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$auth_code = filter_input(INPUT_POST, 'auth_code', FILTER_SANITIZE_STRING);
$token = filter_input(INPUT_POST, 'token', FILTER_SANITIZE_STRING);

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$member = new Member($conn_dgkr);
	
	switch($mode){
		case "authConfirm":	//인증번호 확인
			$data = $member->chkAuthConfirm($m_id,$auth_code);

			if($data['token']==$token && $data['otp']==$auth_code){
				$member->authComplete($m_id);

				$msg = "인증 성공";
				$code = "ok";
			}else{
				$msg = "잘못된 인증번호 입니다. 다시 입력해 주세요.";
				$code = "error";
			}

			$json_data = array(
				'token1' => $data['token'],
				'token2' => $token,
				'code' => $code,
				'message' => $msg,
			);

			$json = json_encode($json_data);
			echo $json;
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>