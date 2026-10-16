<?
header("Content-Type:application/json; charset=utf-8");

require_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/src/main/php/Logger.php');
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_directsend.xml');
$logger = Logger::getLogger('chk');

if (isset($_SERVER["CONTENT_TYPE"]) && strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false) {
	$_POST = array_merge($_POST, (array) json_decode(trim(file_get_contents('php://input')), true));
}

//$logger->info($_POST);
$logger->info($_GET);
?>