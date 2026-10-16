<?php
header('Content-Type: application/json');
//header("Content-Type:text/html; charset=utf-8"); 
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$file_url = filter_input(INPUT_POST, 'file_url', FILTER_SANITIZE_SPECIAL_CHARS);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);

$m_id=$_SESSION['member']['m_id'];
$m_no=$_SESSION['member']['m_no'];

if($m_id==""){
	$json_data = array(
		"status"=>"error",
		"error_msg"=>"로그인 이후에 이용가능합니다."
	);
	echo json_encode($json_data);
	exit;
}else{
	$json_data = array(
		"m_id"=>$m_id,
		"status"=>"success",
		"file_url"=>$file_url
	);
	echo json_encode($json_data);
	
	try{
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
		$dataroom = new Dataroom($conn);
		
		$dataroom->setDataroomLog($m_no,$m_id,$idx);
	}catch (PDOException $e){
		echo 'Error!: '.$e->getMessage();
		die();
	}
}
?>