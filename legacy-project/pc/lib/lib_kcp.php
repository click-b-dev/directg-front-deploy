<?
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
//session_start();
ini_set('include_path', '/');
$document_root = "/";

//if($_SERVER['REMOTE_ADDR']<>"112.216.231.146" &&$_SERVER['REMOTE_ADDR']<>"125.180.83.232"){
//	header( "HTTP/1.1 301 Moved Permanently" );
//	header( 'Location: https://directg.net/system_check.html' );
//	exit;
//}

$isMobile = "";

$arrMobileAgent = array('iPhone','Mobile','UP.Browser','Android','BlackBerry','Windows CE','Nokia','webOS','Opera Mini','SonyEricsson','opera mobi','Windows Phone','IEMobile','POLARIS','lgtelecom','NATEBrowser','AppleWebKit');
$arrExAgent = array('Macintosh','OpenBSD','SunOS','X11','QNX','BeOS', 'OS\/2','Windows NT');
if(preg_match('/('.implode('|',$arrMobileAgent).')/i', $_SERVER['HTTP_USER_AGENT']) && !preg_match('/('.implode('|',$arrExAgent).')/i', $_SERVER['HTTP_USER_AGENT'])){
	$isMobile = true;
	if(preg_match('/(AppleWebKit)/i',$_SERVER['HTTP_USER_AGENT']) && preg_match('/(Windows;)/i',$_SERVER['HTTP_USER_AGENT'])) $isMobile = false;
	if(preg_match('/(Windows CE)/i',$_SERVER['HTTP_USER_AGENT']) && !preg_match('/(compatible;)/i',$_SERVER['HTTP_USER_AGENT']) && !preg_match('/(IEMobile)/i',$_SERVER['HTTP_USER_AGENT'])) $isMobile = false;
	if(preg_match('/(AppleWebKit)/i',$_SERVER['HTTP_USER_AGENT']) && preg_match('/(Linux;)/i',$_SERVER['HTTP_USER_AGENT']) && !strpos($_SERVER['HTTP_USER_AGENT'], 'Mobile')) $isMobile = false;
}

if(preg_match('/(iPhone|iPod|iPad|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mni|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson|LG|SAMSUNG|Samsung)/i',$_SERVER['HTTP_USER_AGENT'])){
	$isMobile = true;
// echo "모바일 웹 브라우저 입니다.";
}else{
// echo "웹 브라우저 입니다.";
	$isMobile = false;
}

if($isMobile){
	//header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // 과거 아무 때나 잡으면 됨.
	//header("Cache-Control: no-cache, must-revalidate");
	//header("Pragma: no-cache");
	//echo $_SERVER['REQUEST_URI'];
	//header("HTTP/1.1 301 Moved Permanently");
	//echo $_SERVER['REQUEST_URI'];
	//header("location:https://m.directg.net/mgate.php?refer=".$_SERVER['REQUEST_URI']);
	//exit;
}

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