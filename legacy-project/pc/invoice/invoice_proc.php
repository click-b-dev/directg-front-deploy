<?
ini_set('display_errors', '1');
header("Content-type: text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_invoice.xml');
$logger = Logger::getLogger("address");

$logger->info($_POST);
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$logger->info($user_agent);
$logger->info($_SESSION);

if(!$_SESSION['invoice']['m_id']){
	//msg("로그인을 하셔야 이용이 가능합니다.");
	//go("/invoice/index.html");
	//exit;
}

$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$name = filter_input(INPUT_POST, 'name', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$address = filter_input(INPUT_POST, 'address', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$tel = filter_input(INPUT_POST, 'tel', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  

	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//배송주소록 저장
	foreach($name as $key=>$value){
		$query= "insert into directgames.tbl_invoice_address set settle_no=:settle_no,name=:name,zipcode=:zipcode,address=:address,tel=:tel,email=:email";
		$params = array(
						':settle_no'=>$settle_no,
						':name'=>$name[$key],
						':zipcode'=>$zipcode[$key],
						':address'=>$address[$key],
						':tel'=>$tel[$key],
						':email'=>$_SESSION['invoice']['m_id']
					);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);

		$logger->info($params);
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>