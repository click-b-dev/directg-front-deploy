<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_asset.xml');
$logger = Logger::getLogger("admin");


$appender = new LoggerAppenderMailEvent();
$appender->setSmtpHost('localhost');
$appender->setPort('25');
$appender->setFrom('admin@directg.net');
$appender->setTo('kch1012@h2int.com');
$appender->setSubject("test");
$logger->addAppender($appender);

 
?>