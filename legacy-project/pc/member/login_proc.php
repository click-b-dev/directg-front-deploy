<?php
ini_set( "display_errors", 0);
//header("Content-Type:text/html; charset=utf-8"); 
header('Content-Type: application/json');

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
require_once $_SERVER["DOCUMENT_ROOT"].'/../geoip2/geoip2.phar';

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/src/main/php/Logger.php');
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_login.xml');
$logger = Logger::getLogger('login');
$logger->info($_POST['m_id']);
$logger->info($_POST['return_url']);

$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_STRING);
$m_pwd = filter_input(INPUT_POST, 'm_pwd', FILTER_SANITIZE_STRING);
$return_url = filter_input(INPUT_POST, 'return_url', FILTER_VALIDATE_URL);

$ip = get_client_ip_env();

// ===== hCaptcha 검증 =====
$captcha_response = $_POST['h-captcha-response'] ?? '';

if (empty($captcha_response)) {
	$logger->info("캡챠 응답 없음");
	echo json_encode(array('error_code' => "1", 'error_msg' => "캡챠 인증이 필요합니다."));
	exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://hcaptcha.com/siteverify");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array(
	'secret'   => $hcaptcha_secret, //conf/config.php 에서 설정
	'response' => $captcha_response,
	'remoteip' => $ip
)));
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$captcha_result = curl_exec($ch);
$captcha_http   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$captcha_obj = json_decode($captcha_result);

if ($captcha_http != 200 || empty($captcha_obj->success)) {
	$logger->info("hCaptcha 검증 실패: " . $captcha_result);
	echo json_encode(array('error_code' => "1", 'error_msg' => "캡챠 인증에 실패했습니다. 다시 시도해주세요."));
	exit;
}
// ===== hCaptcha 검증 끝 =====

try{
	$conn = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn);
	
	//memberChk
	$result = $member->memberLogin($m_id,$m_pwd,$ip);
	
	if($result['status']=='5'){
		$json_data = array(
			'error_code' => "1",
			'error_msg' => "회원가입 승인 인증되지 않는 회원입니다."
		);
		$json = json_encode($json_data);
		$logger->info("회원가입 승인 인증되지 않는 회원입니다.");

		echo $json;
		exit;
	}
	
	if($result['status']=='1'){
		$json_data = array(
			'error_code' => "1",
			'error_msg' => "이미 탈퇴한 회원입니다."
		);
		$json = json_encode($json_data);
		$logger->info("이미 탈퇴한 회원입니다.");

		echo $json;
		exit;
	}

	if($result['m_id']){
		$logger->info($ip);
		//$country = $member->getCountry($ip);
		//$logger->info($country);
		try {
			$country = $member->getCountry($ip);
			$logger->info($country);
		} catch (Exception $e) {
			//echo $e->getMessage();
			$logger->info($e->getMessage());
			$country ="";
		}
		
		if($country=="RU" || $country=="RO" || $country=="BR" || $country=="FR" || $country=="VN" || $country=="DE" || $country=="PH" || $country=="AT" || $country=="NZ"  || $country=="NL" || $country=="PL" || $country=="GB" || $country=="AE" || $country=="IT" || $country=="MO" || $country=="IN"  || $country=="EC"  || $country=="CO" || $country=="DK" || $country=="CH" || $country=="TH" || $country=="CN" || $country=="TW" || $country=="HK" || $country=="EG" || $country=="AU" || $country=="BG"  || $country=="HU"){
			$logger->info('해외에서는 해당서비스를 이용할수 없습니다.');
			//msg('해외에서는 해당서비스를 이용할수 없습니다.',-1);
			$json_data = array(
				'error_code' => "1",
				'error_msg' => "해외에서는 해당서비스를 이용할수 없습니다."
			);
			$json = json_encode($json_data);
			echo $json;
			exit;
		}
	
		$member->setMemberLogin($m_id,$ip,$country);

		$_SESSION['member']=array(
			"m_no"=>$result['m_no'],
			"m_id"=>$result['m_id'],
			"name"=>$result['name'],
			"hp"=>$result['hp'],
			"nickname"=>$result['nickname'],
			"mem_level"=>$result['mem_level'],
			"visitorId"=>$result['visitorId'],
			"mem_type"=>$result['mem_type']
		);

		$json_data = array(
			'error_code' => "0",
			'error_msg' => "OK"
		);
		$json = json_encode($json_data);
		$logger->info($json_data);
		echo $json;
		exit;
	} else {
		$json_data = array(
			'error_code' => "1",
			'error_msg' => "아이디 또는 비밀번호 오류입니다."
		);
		$json = json_encode($json_data);
		$logger->info($json_data);
		echo $json;
		exit;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>