<?
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);

header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER["DOCUMENT_ROOT"].'/../lib/lib.php');

$_SESSION = array();

session_destroy();

header( 'Location: https://directg.net/_Admin_/' );
?>