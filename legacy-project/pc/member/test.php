<?php
ini_set( "display_errors", 1);
header("Content-Type:text/html; charset=utf-8"); 
//header('Content-Type: application/json');

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
require_once $_SERVER["DOCUMENT_ROOT"].'/../geoip2/geoip2.phar';

$ip = get_client_ip_env();

try{
	$conn = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn);
	
	//memberChk
//	$result = $member->memberLogin($m_id,$m_pwd,$ip);
		$country = $member->getCountry($ip);
//		$member->setMemberLogin($m_id,$ip,$country);
	
	debug($country);

	/*
	if($result['status']=='5'){
		$json_data = array(
			'error_code' => "1",
			'error_msg' => "회원가입 승인 인증되지 않는 회원입니다."
		);
		$json = json_encode($json_data);

		echo $json;
		exit;
	}

	if($result['m_id']){
		$country = $member->getCountry($ip);
		$member->setMemberLogin($m_id,$ip,$country);

		$_SESSION['member']=array(
			"m_id"=>$result['data']['m_id'],
			"name"=>$result['data']['name'],
			"name"=>$result['data']['hp'],
			"nickname"=>$result['data']['nickname'],
			"mem_level"=>$result['data']['mem_level'],
			"visitorId"=>$result['data']['visitorId'],
		);

		$json_data = array(
			'error_code' => "0",
			'error_msg' => "OK"
		);
		$json = json_encode($json_data);

		echo $json;
		exit;
	} else {
		$json_data = array(
			'error_code' => "1",
			'error_msg' => "아이디 또는 비밀번호 오류입니다."
		);
		$json = json_encode($json_data);

		echo $json;
		exit;
	}
	*/
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>