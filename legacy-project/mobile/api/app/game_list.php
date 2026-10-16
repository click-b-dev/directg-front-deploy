<?
	include_once($_SERVER["DOCUMENT_ROOT"]."/../mobile/lib/api_func.php");
	
	//8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU=
	$token = getBearerToken();
	if ($token=="8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU=") {
		echo "OK";
	} else {
		echo "접근권한이 없습니다..";
	}
?>