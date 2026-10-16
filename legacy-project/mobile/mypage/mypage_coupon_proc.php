<?php
header('Content-Type: application/json');

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$coupon_number = filter_input(INPUT_POST, 'coupon_number', FILTER_SANITIZE_STRING);
$ip = get_client_ip_env();
try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage($conn_dgkr);
	$result = $mypage->setPaperCouponMember($coupon_number,$_SESSION['member']['m_no'],$_SESSION['member']['m_id']);
	echo json_encode($result);
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

?>