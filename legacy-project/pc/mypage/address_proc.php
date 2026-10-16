<?php
ini_set("display_errors",1);
header('Content-Type: application/json');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/login_check.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_mypage_account.xml');
$logger = Logger::getLogger("pc");

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
$address_detail = filter_input(INPUT_POST, 'address_detail', FILTER_SANITIZE_STRING);
$phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage($conn);

	switch($mode){
		case "setaddress":
			if($_SESSION['member']['m_no']){
				$query = "INSERT INTO tbl_member_address SET name=:name,zipcode=:zipcode,address=:address,address_detail=:address_detail,phone=:phone,message=:message,reg_date=NOW(),m_no=:m_no,m_id=:m_id ON DUPLICATE KEY UPDATE name=:name,zipcode=:zipcode,address=:address,address_detail=:address_detail,phone=:phone,message=:message,reg_date=NOW()";
				$params = array(
					":name" => $name,
					":zipcode" => $zipcode,
					":address" => $address,
					":address_detail" => $address_detail,
					":phone" => $phone,
					":message" => $message,
					":m_no" => $_SESSION['member']['m_no'],
					":m_id" => $_SESSION['member']['m_id']
				);
				
				$stmt = $conn->prepare($query);
				$stmt->execute($params);

				$json_data = array(
					"error_code"=>"OK",
					"error_msg"=>"주소를 수정했습니다."
				);
			} else {
				$json_data = array(
					"error_code"=>"NG",
					"error_msg"=>"세션이 만료되었습니다."
				);
			}
			echo json_encode($json_data);
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

?>