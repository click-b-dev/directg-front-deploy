<?php
ini_set( "display_errors", 1);
//header("Content-Type:text/html; charset=utf-8"); 
header('Content-Type: application/json');


include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
require_once $_SERVER["DOCUMENT_ROOT"].'/../geoip2/geoip2.phar';
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');

$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_STRING);
$m_pwd = filter_input(INPUT_POST, 'm_pwd', FILTER_SANITIZE_STRING);
$return_url = filter_input(INPUT_POST, 'return_url', FILTER_VALIDATE_URL);
$token = filter_input(INPUT_POST, 'h-captcha-response', FILTER_VALIDATE_URL);
$ip = get_client_ip_env();

	$ch = curl_init(); //파라미터:url -선택사항
	$url="https://hcaptcha.com/siteverify";
	$data="response=".$_POST['h-captcha-response']."&secret=ES_59af7c449c6d400e836d53d41ef642f8";
	$method="POST";
	curl_setopt($ch,CURLOPT_URL,$url); //여기선 url을 변수로
	curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch,CURLOPT_HEADER, 1);
	curl_setopt($ch,CURLOPT_SSLVERSION, '6');
	curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 300);
	curl_setopt($ch,CURLOPT_TIMEOUT , 300);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/x-www-form-urlencoded'
		)
	);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
	curl_setopt($ch, CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	$result = curl_exec($ch);
	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
	$response = curl_getinfo($ch);

	$body = substr($result, $headerSize);
	$resObj = json_decode($body);
	curl_close($ch);
	
	if($httpCode=="200"){	//성공
		
		if($resObj->success){//22-11-28(월) 15:22 [이종석] 성공
			$json_data = array(
				'error_code' => "3",
				'error_msg' => "ERROR33"
			);
			$json = json_encode($json_data);
			echo $json;
		} else {
			$json_data = array(
				'error_code' => "2",
				'error_msg' => "ERROR22"
			);
			$json = json_encode($json_data);
			echo $json;
		}
	} else {
			$json_data = array(
				'error_code' => "1",
				'error_msg' => "ERROR1"
			);
			$json = json_encode($json_data);
			echo $json;
	}

?>