<?
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

session_destroy();

go("/index.php");
?>