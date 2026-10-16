<?
session_start();
ini_set('include_path', '/');
$document_root= "/_Admin_";
//include_once($_SERVER['DOCUMENT_ROOT'].'/src/lib/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"]."/../_engine/dbconn.php");
include_once($_SERVER["DOCUMENT_ROOT"]."/../_engine/dbconn_dgkr.php");
include_once($_SERVER["DOCUMENT_ROOT"].'/../src/lib/autoload.php');
//include_once(get_include_path().'/log4php/Logger.php');
include_once($_SERVER["DOCUMENT_ROOT"]."/../lib/lib_func.php");
include_once($_SERVER["DOCUMENT_ROOT"]."/_Admin_/lib/lib_func.php");
//include_once(get_include_path().'/pc/conf/config.php');

$ip = get_client_ip_env();

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
$dsn_dgkr = 'mysql:host='.DGKR_HOST.';dbname='.DGKR_DB.';port=3306;charset=utf8';

if($_SESSION['admin']["admin_id"]==""){
	echo "잘못된 접근입니다.";
	header( 'Location: https://'.$_SERVER['HTTP_HOST'].'/_Admin_/' );
	exit;
}

$topmenu = array ('dashboard' => null, 'site' => null,'goods'=>null,'member'=>null,'stock'=>null,'order'=>null,'promotion'=>null,'event'=>null,'board'=>null,'jehu'=>null,'statistics'=>null,'report'=>null,'china'=>null,'partner'=>null);

?>