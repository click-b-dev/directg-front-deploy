<?
header("Content-Type:text/html; charset=utf-8");

include_once($_SERVER['DOCUMENT_ROOT'].'/backend/conf/conf.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/backend/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "cart":
			$cart_msg = filter_input(INPUT_POST, 'cart_msg', FILTER_DEFAULT);
			if(file_exists($_SERVER['DOCUMENT_ROOT']."/frontend/conf/cart.txt")){
				unlink($_SERVER['DOCUMENT_ROOT']."/frontend/conf/cart.txt");
			}

			$fp = fopen($_SERVER['DOCUMENT_ROOT']."/frontend/conf/cart.txt", 'a');
			$str = preg_replace("/\t+/", "", $cart_msg);
			fwrite($fp, $str);               // list.txt 파일에 $str 변수를 저장함.
			fclose($fp);                     // list.txt 파일 닫음.
			go("base_guide_info.php");
		break;
		case "order":
			$order_msg = filter_input(INPUT_POST, 'order_msg', FILTER_DEFAULT);
		break;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>