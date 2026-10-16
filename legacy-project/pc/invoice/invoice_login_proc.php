<?
ini_set('display_errors', '1');
header("Content-type: text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_invoice.xml');
$logger = Logger::getLogger("pc");

$logger->info($_POST);

$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_EMAIL);
$m_pwd = filter_input(INPUT_POST, 'm_pwd', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query= "select email,name,pwd from directgames.tbl_invoice_member where email=:email and pwd=password(:pwd)";
	$params = array(
					':email'=>$m_id,
					':pwd'=>$m_pwd
				);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetch();
	
	if(empty($data)){
		msg('电子邮件或密码有错误',-1);
		exit;
	}else{
		$_SESSION['invoice']=array(
			'm_id'=>$data['email'],
			'name'=>$data['name']
		);

		$ip = get_client_ip_env();

		$query= "update directgames.tbl_invoice_member set login_date=now(),ip=:ip where email=:email";
		$params = array(
						':ip'=>$ip,
						':email'=>$m_id,
						
					);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);

		$logger->info($_SESSION);

		go("dashboard.html");
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>