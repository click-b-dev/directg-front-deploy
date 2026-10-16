<?
	include_once($_SERVER["DOCUMENT_ROOT"]."/../mobile/lib/api_func.php");
	
	$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

	if(!$page){
		$page=1;
	}

	$where = [];
	
	$token = getBearerToken();
	
	$json_data = array();
	$publisher_data = array();
	
	if ($token=="8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU="){
		$is_auth= "Y";
	} else {
		$is_auth= "N";
		$error_message="접근권한이 없습니다.";
	}
	
	if($is_auth=="N"){
		$json_data = array(
			"status"=>"error",
			"code"=>"Access Denied",
			"message"=>$error_message,
		);
		
		echo json_encode($json_data);
	}else{
		include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
		
		try{
			$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
			
			$admin= new Admin($conn);

			$orderby = "publisher_name asc";
			
			$publisher_list = $admin->getPublisherList($page,$add_where,$orderby,$param);
			$result = $publisher_list->resultset->fetchAll();
			
			foreach($result as $value){
				if($value['publisher_site']){
					$publisher_site = $value['publisher_site'];
				}else{
					$publisher_site = "";
				}
				
				if($value['publisher_image']){
					$publisher_image = $value['publisher_image'];
				}else{
					$publisher_image = "";
				}
				
				$publisher_data['publisher'][] = array("publisher_code"=>$value['publisher_code'],"publisher_name"=>$value['publisher_name'],"publisher_site"=>$publisher_site,"publisher_image"=>$publisher_image);
			}
			
		}catch (PDOException $e){
			echo 'Error!: '.$e->getMessage();
			die();
		}
		
		$json_data = array(
				"status"=>"success",
				"data"=>$publisher_data,
			);
			
			echo json_encode($json_data);
	}
?>