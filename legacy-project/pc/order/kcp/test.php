<?php
	ini_set('display_errors', '0');
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
    header("Content-type: text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	echo "AA";
	header( "HTTP/1.1 301 Moved Permanently" );
	header( 'Location: https://directg.net/order/order_fail.html?msg=결제금액오류');
?>