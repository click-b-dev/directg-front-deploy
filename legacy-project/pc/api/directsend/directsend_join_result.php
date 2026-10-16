<?
//session_start();

header("Content-Type:application/json; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/src/main/php/Logger.php');
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_directsend.xml');
$logger = Logger::getLogger($_GET['gubun']);

$logger->info($_GET);
if (isset($_SERVER["CONTENT_TYPE"]) && strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false) {
	$_POST = array_merge($_POST, (array) json_decode(trim(file_get_contents('php://input')), true));
}

$logger->info($_POST);
$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$query = "insert into directgames.tbl_email_api set ID=:ID,result=:result,success=:success,failed=:failed,IsNeedResend=:IsNeedResend,email=:email,state=:state,SmtpCode=:SmtpCode,SmtpMsg=:SmtpMsg,gubun='{$_GET['gubun']}',reg_date=now()";
	$stmt = $conn->prepare($query);
	$params = array(
		':ID'=>$_POST['ID'],
		':result'=>$_POST['Result'],
		':success'=>$_POST['Success'],
		':failed'=>$_POST['Failed'],
		':IsNeedResend'=>$_POST['IsNeedResend'],
		':email'=>$_POST['Recipients'][0]['Email'],
		':state'=>$_POST['Recipients'][0]['State'],
		':SmtpCode'=>$_POST['Recipients'][0]['SmtpCode'],
		':SmtpMsg'=>$_POST['Recipients'][0]['SmtpMsg']
	);
	$stmt->execute($params);

	$logger->info($params);
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>