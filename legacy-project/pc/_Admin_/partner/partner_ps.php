<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_STRING);
$publisher_name = filter_input(INPUT_POST, 'publisher_name', FILTER_SANITIZE_STRING);
$report_term = filter_input(INPUT_POST, 'report_term', FILTER_SANITIZE_STRING);
$is_system = filter_input(INPUT_POST, 'is_system', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	switch($mode){
		//파트너 등록
		case "partner_add":
			$query = "insert into tbl_partner set publisher_code=:publisher_code,publisher_name=:publisher_name,report_term=:report_term,flag='Y'";
			$params = array(
				":publisher_code"=>$publisher_code,
				":publisher_name"=>$publisher_name,
				":report_term"=>$report_term
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			echo "등록되었습니다.";
		break;
		case "partner_config":
			$query = "update tbl_partner set is_system=:is_system where publisher_code=:publisher_code";
			$params = array(
				":is_system"=>$is_system,
				":publisher_code"=>$publisher_code
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			echo "수정되었습니다.";
		break;
		case "partner_report_config":
			$query = "update tbl_partner set report_term=:report_term where publisher_code=:publisher_code";
			$params = array(
				":report_term"=>$report_term,
				":publisher_code"=>$publisher_code
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			echo "수정되었습니다.";
		break;
	}
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>