<?php
ini_set("display_errors",1);
header('Content-Type: application/json');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$sno = filter_input(INPUT_POST, 'sno', FILTER_SANITIZE_STRING);
$sno_arr = filter_input(INPUT_POST, 'sno_arr', FILTER_SANITIZE_STRING,FILTER_FORCE_ARRAY);
$goods_code_arr = filter_input(INPUT_POST, 'goods_code', FILTER_SANITIZE_STRING,FILTER_FORCE_ARRAY);
$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);

$message = filter_input(INPUT_POST,'message2',FILTER_SANITIZE_STRING);
$message3 = filter_input(INPUT_POST,'message3',FILTER_SANITIZE_STRING);
$message4 = filter_input(INPUT_POST,'message4',FILTER_SANITIZE_STRING);
$message5 = filter_input(INPUT_POST,'message5',FILTER_SANITIZE_STRING);
if(!$message){
	$message = $message3." / ".$message4." / ".$message5;
}

$m_no=$_SESSION['member']['m_no'];
$m_id=$_SESSION['member']['m_id'];

try{
	$conn = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage($conn);

	switch($mode){
		case "order_cancel":
			$result = $mypage->updateOrderitem($ordno,'8',$message);
			$mypage->setCancelRequest($ordno,$m_no,$m_id);

			if($result=="OK"){
				$json_data = array(
					"error_code"=>"OK",
					"error_msg"=>"취소요청완료"
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