<?
	include_once($_SERVER["DOCUMENT_ROOT"]."/../mobile/lib/api_func.php");
	
	$token = getBearerToken();
	
	$json_data = array();
	$platform_data = array();
	
	if ($token=="8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU="){
		$is_auth= "Y";
	} else {
		$is_auth= "N";
		$error_message="접근권한이 없습니다.";
	}
	
	
	$platform_data['platform']['0'] = array("platform_code"=>"1","platform_name"=>"Steam");
	
	$platform_data['platform']['1'] = array("platform_code"=>"34","platform_name"=>"Epic Games");
	
	$platform_data['platform']['2'] = array("platform_code"=>"35","platform_name"=>"Rockstar Games");
	
	$platform_data['platform']['3'] = array("platform_code"=>"32","platform_name"=>"기타");

	if($is_auth=="N"){
		$json_data = array(
			"status"=>"error",
			"code"=>"Access Denied",
			"message"=>$error_message,
		);
		
		echo json_encode($json_data);
	}else{
		$json_data = array(
				"status"=>"success",
				"data"=>$platform_data,
			);
			
			echo json_encode($json_data);
	}
?>