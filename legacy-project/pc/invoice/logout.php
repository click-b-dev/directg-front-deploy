<?
ini_set('display_errors', '1');
header("Content-type: text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
session_destroy();
go("/invoice/index.html");
?>