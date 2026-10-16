<?php
ini_set("display_errors",1);
header('Content-Type: application/json');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/login_check.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_mypage_account.xml');
$logger = Logger::getLogger("pc");

$current_password = filter_input(INPUT_POST, 'current_password', FILTER_SANITIZE_STRING);
$new_password = filter_input(INPUT_POST, 'new_password', FILTER_SANITIZE_STRING);
$new_password_re = filter_input(INPUT_POST, 'new_password_re', FILTER_SANITIZE_STRING);
$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$mailling = filter_input(INPUT_POST, 'mailling', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_STRING);

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage($conn_dgkr);

	switch($mode){
		case "change_password":
			if($new_password!=$new_password_re){
				$json_data = array(
					"error_code"=>"NG",
					"error_msg"=>"새 비밀번호와 새 비밀번호 확인이 다릅니다.",
				);
				echo json_encode($json_data);
				$logger->info($m_id);
				$logger->info($json_data);
				exit;
			}
			
			/* //25-08-04(월) 19:13 [이종석] 현재 비밀번호 입력하지 않아도 변경가능
			$memberChk = $mypage->memberChk($m_id,$current_password);
			
			if($memberChk['error_code']=="OK"){
				$mypage->updatePassword($m_id,$current_password,$new_password);
				$json_data = array(
					"error_code"=>"OK",
					"error_msg"=>"비밀번호 변경이 완료되었습니다.",
				);
			} else {
				$json_data = array(
					"error_code"=>"NG",
					"error_msg"=>$memberChk['error_msg'],
				);
			}
			*/

			$mypage->updateNewPassword($m_id,$new_password);
			$json_data = array(
				"error_code"=>"OK",
				"error_msg"=>"비밀번호 변경이 완료되었습니다.",
			);
			$logger->info($m_id);
			$logger->info($json_data);
			echo json_encode($json_data);
		break;
		case "leave":
			if($m_id){
				$mypage->updateMemberStatus($m_id,"1");
				$json_data = array(
					"error_code"=>"OK",
					"error_msg"=>"탈퇴처리완료"
				);
			} else {
				$json_data = array(
					"error_code"=>"NG",
					"error_msg"=>"세션이 만료되었습니다."
				);
			}
			
			$logger->info($m_id);
			$logger->info($json_data);
			echo json_encode($json_data);
			session_destroy();
		break;
		case "mailling_change":
			if($m_id){
				$mypage->updateMemberMailling($m_id,$mailling);
				if($mailling=="Y"){
					$json_data = array(
						"error_code"=>"OK",
						"error_msg"=>"수신동의 하였습니다."
					);
				} else {
					$json_data = array(
						"error_code"=>"OK",
						"error_msg"=>"수신거부 하였습니다."
					);
				}
			} else {
				$json_data = array(
					"error_code"=>"NG",
					"error_msg"=>"세션이 만료되었습니다."
				);
			}
			
			$logger->info($m_id);
			$logger->info($json_data);
			echo json_encode($json_data);
		break;
		case "email_change":
			if($m_id && $email){
				$mypage->updateMemberEmail($m_id,$email);
				$json_data = array(
					"error_code"=>"OK",
					"error_msg"=>"수신메일주소를 변경하였습니다."
				);
			} else {
				$json_data = array(
					"error_code"=>"NG",
					"error_msg"=>"세션이 만료되었습니다."
				);
			}
			echo json_encode($json_data);
			
			$logger->info($m_id);
			$logger->info($json_data);
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

?>