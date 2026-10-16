<?php
header('Content-Type: application/json');
//header("Content-Type:text/html; charset=utf-8"); 
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/login_check.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);

try {
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage2($conn);

	switch($mode) {
		case "requestReturn" :
			$response = $mypage->withdrawCancelRequest($ordno, $_SESSION['member']['m_no'], $settle_no);
			echo json_encode($response);
			break;
	}
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();
	die();
}
?>