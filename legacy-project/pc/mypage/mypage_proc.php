<?php
header('Content-Type: application/json');
//header("Content-Type:text/html; charset=utf-8"); 
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/login_check.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
$address_detail = filter_input(INPUT_POST, 'address_detail', FILTER_SANITIZE_STRING);
$tel = filter_input(INPUT_POST, 'tel', FILTER_SANITIZE_STRING);
$msg = filter_input(INPUT_POST, 'msg', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$ip = get_client_ip_env();

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage2($conn);

	switch($mode){
		case "edit_address":
			$mypage->updateOrderAddress($settle_no,$name,$zipcode,$address,$address_detail,$tel,$msg);

			$json_data = array(
				"error_code"=>"OK",
				"error_msg"=>"수정하였습니다.",
			);
			echo json_encode($json_data);
		break;
		case "requestReturn" :
			$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);
			$response = $mypage->withdrawCancelRequest($ordno, $_SESSION['member']['m_no'], $settle_no);
			echo json_encode($response);
			break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

?>