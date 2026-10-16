<?
	header("Content-Type:text/html; charset=utf-8"); 

	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
	
	if($mode==""){
		$mode="payco_login";
	}
	
	$payco = new Payco('pc',$mode);
	
	echo $payco->getApiURL();
?>