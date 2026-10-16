<?
ini_set('display_errors', '1');
header("Content-type: text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$m_pwd = filter_input(INPUT_POST, 'm_pwd', FILTER_SANITIZE_STRING);
$re_pwd = filter_input(INPUT_POST, 're_pwd', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query= "update directgames.tbl_invoice_member set pwd=password(:pwd) where email=:email";
	$params = array(
					':pwd'=>$re_pwd,
					':email'=>$_SESSION['invoice']['m_id']
				);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);

	go("dashboard.html");

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>