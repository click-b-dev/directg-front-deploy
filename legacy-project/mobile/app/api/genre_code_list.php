<?
	include_once($_SERVER["DOCUMENT_ROOT"]."/../mobile/lib/api_func.php");
	
	$token = getBearerToken();
	
	$json_data = array();
	$genre_data = array();
	
	if ($token=="8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU="){
		$is_auth= "Y";
	} else {
		$is_auth= "N";
		$error_message="접근권한이 없습니다.";
	}
	
	$genre_data['genre']['0'] = array("genre_code"=>"G0001","genre_name"=>"액션");
	$genre_data['genre']['1'] = array("genre_code"=>"G0002","genre_name"=>"어드벤처");
	$genre_data['genre']['2'] = array("genre_code"=>"G0003","genre_name"=>"RPG");
	$genre_data['genre']['3'] = array("genre_code"=>"G0004","genre_name"=>"전략");
	$genre_data['genre']['4'] = array("genre_code"=>"G0005","genre_name"=>"시뮬레이션");
	$genre_data['genre']['5'] = array("genre_code"=>"G0006","genre_name"=>"스포츠");
	$genre_data['genre']['6'] = array("genre_code"=>"G0010","genre_name"=>"레이싱");
	$genre_data['genre']['7'] = array("genre_code"=>"G0007","genre_name"=>"캐주얼");
	$genre_data['genre']['8'] = array("genre_code"=>"G0008","genre_name"=>"인디");
	$genre_data['genre']['9'] = array("genre_code"=>"G0009","genre_name"=>"앞서 해보기");

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
				"data"=>$genre_data,
			);
			
			echo json_encode($json_data);
	}
?>