<?
ini_set("display_errors", 1);
header("Content-Type:text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payco.xml');
$logger = Logger::getLogger("pc");

$m_no = $_SESSION['member']['m_no'];
$sns_type = filter_input(INPUT_POST, 'sns_type', FILTER_SANITIZE_STRING);

$sns_type = "PAYCO";

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query = "select b.access_token from tbl_member a inner join sns_info b on a.m_no=b.m_no where b.sns_type=:sns_type and a.m_no=:m_no";
	$params = array(
				':sns_type'=>$sns_type,
				':m_no'=>$m_no
			);
	$stmt = $conn_dgkr->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetch();

	$access_token = $data['access_token'];

	$payco = new Payco('pc');
	
	$res =  $payco->paycoLogout($access_token);

	$res_Data = json_decode($res, true);
	//print_r($res_Data);
	$logger->info($res_Data);

//	if($res_Data['header']['resultCode']=="0"){
		$d_query = "delete from sns_info where m_no=:m_no and sns_type='PAYCO'";
		$d_params = array(
					':m_no'=>$m_no
				);
		$stmt = $conn_dgkr->prepare($d_query);
		$stmt->execute($d_params);

		$res_Data['header']['resultCode']="0";

		echo $res_Data['header']['resultCode'];
//	}else{
//		echo $res_Data['message'];
//	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>