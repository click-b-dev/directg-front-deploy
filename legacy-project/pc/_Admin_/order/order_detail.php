<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");

$reserveOrderNo = filter_input(INPUT_POST, 'reserveOrderNo', FILTER_SANITIZE_STRING);
$sellerOrderReferenceKey = filter_input(INPUT_POST, 'sellerOrderReferenceKey', FILTER_SANITIZE_STRING);

try{
	$paycoPG = new PaycoPG("");

	$params = array(
		"reserveOrderNo"=>$reserveOrderNo,
		"sellerOrderReferenceKey"=>$sellerOrderReferenceKey
	);
	
	$result = $paycoPG->paycoGetDetailForVerify($params);
	
	debug(json_decode($result));
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>