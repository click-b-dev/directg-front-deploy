<?php
ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8");

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$m_no = filter_input(INPUT_GET, 'm_no', FILTER_SANITIZE_STRING);
$m_id = filter_input(INPUT_GET, 'm_id', FILTER_SANITIZE_EMAIL);
$auth_key = filter_input(INPUT_GET, 'auth_key', FILTER_SANITIZE_STRING);

$ip = get_client_ip_env();

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn_dgkr);
	$data = $member->chkMemberAuth($auth_key);
	if(!$data['m_id']){
		echo "잘못된 페이지 접근입니다.";
		exit;
	} else {
		if(md5(trim($data['m_id']).$data['m_no'])==$auth_key){
			$member->approvalMember($m_no);
			echo "가입승인이 완료되었습니다.";
			header ("Location:/member/login.html");
			exit;
		} else {
			echo "잘못된 페이지 접근입니다.";
			exit;
		}
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>