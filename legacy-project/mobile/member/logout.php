<?
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

session_destroy();

	if(strpos($_SERVER['HTTP_REFERER'],"https://m.directg.net")!==false){
		$return_url = $_SERVER['HTTP_REFERER'];
	} else{
		$return_url = "/";
	}

go($return_url);
?>