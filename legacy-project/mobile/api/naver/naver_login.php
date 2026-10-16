<?
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	$naver = new Naver('mobile');
	
	$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
	
	if($mode==""){
		$mode="login";
	}
	
	$naver = new Naver('mobile',$mode);
	
	echo $naver->getApiURL();
?>