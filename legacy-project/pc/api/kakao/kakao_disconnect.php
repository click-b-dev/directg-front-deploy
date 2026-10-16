<?
ini_set("display_errors", 0);
header("Content-Type: text/html; charset=UTF-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kakao.xml');
$logger = Logger::getLogger("pc");

$m_no = $_SESSION['member']['m_no'];
$sns_type = filter_input(INPUT_POST, 'sns_type', FILTER_SANITIZE_STRING);

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$kakao = new Kakao("pc");
	
	$kakao -> call_accesstoken();
	$access_token = $_SESSION['KAKAO_SESSION_NAME']['access_token'];

	$result = $kakao ->user_unlink($access_token);

	$logger->info($result);

	$d_query = "delete from sns_info where sns_type=:sns_type and m_no=:m_no";
	$d_params = array(
				':sns_type'=>'KAKAO',
				':m_no'=>$m_no
			);
	$stmt = $conn_dgkr->prepare($d_query);
	$stmt->execute($d_params);

	$error_code = "0";
	$error_msg = "KAKAO 계정연결이 해제되었습니다.";
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$json_array = array(
	'code'=>$error_code,
	'msg'=>$error_msg
);
$json = json_encode($json_array);
echo $json;

$logger->info($json_array);
?>