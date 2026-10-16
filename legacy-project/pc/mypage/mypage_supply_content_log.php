<?
ini_set("display_errors", 0);
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/login_check.php');

$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$patch_name = filter_input(INPUT_POST, 'patch_name', FILTER_SANITIZE_STRING);
$m_id = $_SESSION['member']["m_id"];
$ip = get_client_ip_env();


$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query = "insert into directgames.tbl_patch_download_log set ordno=:ordno,m_id=:m_id,ip=:ip,patch_name=:patch_name,reg_date=now(),count='1' ON DUPLICATE KEY UPDATE  count=count+1,last_download=now(),ip=:ip";
	$params = array(
		":ordno" => $ordno,
		":m_id" => $m_id,
		":ip" => $ip,
		":patch_name" => $patch_name
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	//print_r($params);
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>