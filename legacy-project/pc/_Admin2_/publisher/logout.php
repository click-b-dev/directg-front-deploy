<?
	include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

$referer = ($_POST['referer']) ? $_POST['referer'] : $_GET['referer'];

$_SESSION = array();

session_destroy();

go("index.php");
?>