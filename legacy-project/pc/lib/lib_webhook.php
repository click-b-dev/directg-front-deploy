<?
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
ini_set('include_path', '/');
$document_root = "/";

include_once($_SERVER["DOCUMENT_ROOT"]."/../_engine/dbconn.php");
include_once($_SERVER["DOCUMENT_ROOT"]."/../_engine/dbconn_dgkr.php");
include_once($_SERVER["DOCUMENT_ROOT"].'/../src/lib/autoload.php');
//include_once(get_include_path().'/log4php/Logger.php');
include_once($_SERVER["DOCUMENT_ROOT"]."/lib/lib_func.php");
//include_once(get_include_path().'/pc/conf/config.php');

$ip = get_client_ip_env();

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
$dsn_dgkr = 'mysql:host='.DGKR_HOST.';dbname='.DGKR_DB.';port=3306;charset=utf8';
?>