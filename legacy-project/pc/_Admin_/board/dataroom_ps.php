<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

use HTMLToMarkdown\HtmlConverter;

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$file_type = filter_input(INPUT_POST, 'file_type', FILTER_SANITIZE_STRING);
$file_name = filter_input(INPUT_POST, 'file_name', FILTER_SANITIZE_STRING);
$file_url = filter_input(INPUT_POST, 'file_url', FILTER_SANITIZE_SPECIAL_CHARS);
$simplemde = filter_input(INPUT_POST, 'simplemde', FILTER_SANITIZE_SPECIAL_CHARS);
$file_url = filter_input(INPUT_POST, 'file_url', FILTER_SANITIZE_SPECIAL_CHARS);
$is_encode = filter_input(INPUT_POST, 'is_encode', FILTER_SANITIZE_STRING);
$encode_type = filter_input(INPUT_POST, 'encode_type', FILTER_SANITIZE_STRING);
$deploy_date = filter_input(INPUT_POST, 'deploy_date', FILTER_SANITIZE_STRING);
$is_free = filter_input(INPUT_POST, 'is_free', FILTER_SANITIZE_STRING);
$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);

if($_FILES['thumbnail']['size']>0){
	$path = $_SERVER['DOCUMENT_ROOT'].'/upload/dataroom/';
	if(!file_exists($path)){
		mkdir($path, '0777',true);
	}

	$img_name = $_FILES['thumbnail']['name'];
	$thumbnail = microtime(true).".jpg";

	$img_path = $path."/".$thumbnail;

	if($img_path){
		move_uploaded_file($_FILES['thumbnail']['tmp_name'], $img_path);
	}
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$converter = new HtmlConverter();
	$dataroom = new AdminDataroom($conn);

	//$contents = $converter->convert(htmlspecialchars_decode($simplemde));
	$contents = $simplemde;

	switch($mode){
		case "register": //자료실 파일 등록
			$dataroom->setDataroom($file_type,$file_name,$file_url,$thumbnail,$contents,$is_encode,$encode_type,$deploy_date,$is_free,$is_view);
			go("dataroom_file.php");
		break;
		case "modify":// 자료실 파일 수정
			$dataroom->updateDataroom($idx,$file_type,$file_name,$file_url,$contents,$is_encode,$encode_type,$deploy_date,$is_free,$is_view);
			if($thumbnail){
				$dataroom->updateDataroomImg($idx,$thumbnail);
			}
			go("dataroom_view.php?idx=".$idx);
		break;
		case "product_search": // 자료실 제공상품 검색

		break;
		case "product_add": // 제공상품 설정

		break;
	}


}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>