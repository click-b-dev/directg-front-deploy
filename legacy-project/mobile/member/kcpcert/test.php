<?php
	ini_set( "display_errors", 1 );
	Header('Access-Control-Allow-origin', '*');
	header('Set-Cookie: safeCookie1=foo; SameSite=Lax', false);
	header('Set-Cookie: safeCookie2=foo', false);
	header('Set-Cookie: crossCookie=bar; SameSite=None; Secure', false);
	
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib_kcp.php');
	header("Content-type: text/html; charset=utf-8");
    /* ============================================================================== */
    /* =   인증데이터 수신 및 복호화 페이지                                         = */
    /* = -------------------------------------------------------------------------- = */
    /* =   해당 페이지는 반드시 가맹점 서버에 업로드 되어야 하며                    = */ 
    /* =   가급적 수정없이 사용하시기 바랍니다.                                     = */
    /* ============================================================================== */

    /* ============================================================================== */
    /* =   라이브러리 파일 Include                                                  = */
    /* = -------------------------------------------------------------------------- = */

    require $_SERVER["DOCUMENT_ROOT"]."/../pc/member/kcpcert/lib/ct_cli_lib2.php";
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcpcert_mobile.xml');
	$logger = Logger::getLogger("mobile");
	
//	require_once $_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php";
//	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcpcert.xml');
//	$logger = Logger::getLogger("response");
	
	define('KEY','01234567890123456789012345678901');
	define('KEY_128',substr(KEY,0,128/8));
	define('KEY_256',substr(KEY,0,256/8));
	$auth_arr=array();

	$logger->info($_POST);
?>