<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx_array = filter_input(INPUT_POST, 'chk', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);

$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$pwd = filter_input(INPUT_POST, 'pwd', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "delete": //중국결제자 삭제
			foreach($idx_array as $value){
				$query = "delete from directgames.tbl_invoice_member where idx=:idx";
				$params = array(
					":idx"=>$value,
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}
		break;
		case "pwd_reset": //중국결제자 비밀번호 초기화
			$query = "update directgames.tbl_invoice_member set pwd=password(:pwd) where idx=:idx";
			$params = array(
				":pwd"=>date('Ymd'),
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);

			//print_r($params);
		break;
		case "register": //중국결제자 추가
			$query = "insert into directgames.tbl_invoice_member set email=:email,name=:name,pwd=password(:pwd)";
			$params = array(
				":email"=>$email,
				":name"=>$name,
				":pwd"=>$pwd,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			go("invoice_member.php");
		break;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>