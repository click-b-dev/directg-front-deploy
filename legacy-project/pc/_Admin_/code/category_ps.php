<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$category_depth = filter_input(INPUT_POST, 'category_depth', FILTER_SANITIZE_STRING);
$category_code = filter_input(INPUT_POST, 'category_code', FILTER_SANITIZE_STRING);
$category_name = filter_input(INPUT_POST, 'category_name', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	switch($mode){
		case "register":
			$query = "insert into tbl_category set category_depth=:category_depth,category_code=:category_code,category_name=:category_name";
			$stmt = $conn->prepare($query);
			$params = array(
				":category_depth"=>$category_depth,
				":category_code"=>$category_code,
				":category_name"=>$category_name,
			);
			$stmt->execute($params);

			go("category_list.php");
		break;
	}
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>