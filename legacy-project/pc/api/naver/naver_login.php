<?
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
	
	if($mode==""){
		$mode="naver_login";
	}
	
	$naver = new Naver('pc',$mode);
	
	echo $naver->getApiURL();
?>