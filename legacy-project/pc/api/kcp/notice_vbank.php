<?
ini_set("display_errors", 0);
header('Content-Type: application/json; charset=utf-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcp_vbank.xml');
$logger = Logger::getLogger("kcp_vbank");

$logger->info($_POST);
?>