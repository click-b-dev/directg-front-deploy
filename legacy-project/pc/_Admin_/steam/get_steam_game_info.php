<?
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	ini_set("display_errors", 1);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	use HTMLToMarkdown\HtmlConverter;
	$converter = new HtmlConverter();

	header("Content-Type:text/html; charset=utf-8");

	//$appids = "3390";
	$appids = filter_input(INPUT_GET, 'appids', FILTER_SANITIZE_STRING);
	$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
	$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);
	$language = filter_input(INPUT_GET, 'language', FILTER_SANITIZE_STRING);
	$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$admin = new Admin($conn);
	$steam = new Steam($conn);
	
	$result = $steam->getSteamAppInfo($appids,$language);
	
	//print_r($result);
	echo $result["name"];
	
	if($result["appid"]>0){
		$query = "insert into steam_game set steam_appid=:steam_appid,app_type=:app_type,name=:name,is_free=:is_free,supported_languages=:supported_languages,short_description=:short_description,detailed_description=:detailed_description,about_the_game=:about_the_game,header_image=:header_image,capsule_image=:capsule_image,capsule_imagev5=:capsule_imagev5,pc_requirements_minimum=:pc_requirements_minimum,pc_requirements_recommended=:pc_requirements_recommended,legal_notice=:legal_notice,release_date=:release_date,consumer_price=:consumer_price,price=:price,discount_percent=:discount_percent,metacritic_score=:metacritic_score,metacritic_url=:metacritic_url,drm_notice=:drm_notice,ext_user_account_notice=:ext_user_account_notice,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,recommendations=:recommendations,genre=:genre,category=:category,publisher=:publisher,developer=:developer,batch_date=:batch_date ON DUPLICATE KEY UPDATE name=:name,header_image=:header_image,capsule_image=:capsule_image,capsule_imagev5=:capsule_imagev5,supported_languages=:supported_languages,short_description=:short_description,about_the_game=:about_the_game,pc_requirements_minimum=:pc_requirements_minimum,pc_requirements_recommended=:pc_requirements_recommended,legal_notice=:legal_notice,metacritic_score=:metacritic_score,metacritic_url=:metacritic_url,price=:price,consumer_price=:consumer_price,release_date=:release_date,drm_notice=:drm_notice,ext_user_account_notice=:ext_user_account_notice,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,recommendations=:recommendations,genre=:genre,category=:category,batch_date=:batch_date,about_the_game=:about_the_game";
		$stmt = $conn->prepare($query);
		$params2 = array(
			":steam_appid"=>$result["appid"],
			":app_type"=>$result["type"],
			":name"=>$result["name"],
			":is_free"=>$result["is_free"],
			":supported_languages"=>$result["supported_languages"],
			":short_description"=>$converter->convert($result["short_description"]),
			":detailed_description"=>$converter->convert($result["detailed_description"]),
			":about_the_game"=>$converter->convert($result["about_the_game"]),
			":header_image"=>$result["header_image"],
			":capsule_image"=>$result["capsule_image"],
			":capsule_imagev5"=>$result["capsule_imagev5"],
			":pc_requirements_minimum"=>$result['minimum'],
			":pc_requirements_recommended"=>$result['recommended'],
			":legal_notice"=>$converter->convert($result["legal_notice"]),
			":release_date"=>date("Y-m-d",strtotime('+1 day',strtotime($result['release_date']))),
			":consumer_price"=>$result["consumer_price"],
			":price"=>$result["price"],
			":discount_percent"=>$result["discount_percent"],
			":metacritic_score"=>$result["metacritic_score"],
			":metacritic_url"=>$result["metacritic_url"],
			":drm_notice"=>$result["drm_notice"],
			":ext_user_account_notice"=>$result["ext_user_account_notice"],
			":coming_soon"=>$result["coming_soon"],
			":coming_soon_date"=>date("Y-m-d",strtotime('+1 day',strtotime($result['release_date']))),
			":recommendations"=>$result["recommendations"],
			":genre"=>$result['genre'],
			":category"=> $result['category'],
			":publisher"=> $result['publisher'],
			":developer"=>$result['developer'],
			":batch_date"=>date('Y-m-d H:i:s'),
		);
		
		$stmt->execute($params2);
	
		
		//스팀게임 스크린샷정보 저장
		foreach($params["screenshots"] as $sub_key=>$sub_value){
			$query = "insert into steam_game_screenshot set appid=:appid,screenshot_id=:screenshot_id,screenshot_thumbnail=:screenshot_thumbnail,screenshot_full=:screenshot_full ON DUPLICATE KEY UPDATE screenshot_thumbnail=:screenshot_thumbnail,screenshot_full=:screenshot_full";
			$stmt = $conn->prepare($query);
			$screenshot_params = array(
				":appid"=>$result["appid"],
				":screenshot_id"=>$sub_value->id,
				":screenshot_thumbnail"=>$sub_value->path_thumbnail,
				":screenshot_full"=>$sub_value->path_full
			);
			$stmt->execute($screenshot_params);
			//print_r($screenshot_params);
		}
		
		//스팀 app정보 백업
		$url = "https://store.steampowered.com/api/appdetails?l=koreana&appids=".$result["appid"];
		
		if($result["coming_soon"]=="1"){
			$upload_path = '/home/dgkrshop/www/upload/apps/apps_'.$result["appid"].'_coming.json';
		}else{
			$upload_path = '/home/dgkrshop/www/upload/apps/apps_'.$result["appid"].'.json';
		}

		if( file_exists($upload_path) ) {
			// 파일이 존재할 때
			//echo "이미 존재함";
			unlink('/home/dgkrshop/www/upload/apps/apps_'.$result["appid"].'.json');
			unlink('/home/dgkrshop/www/upload/apps/apps_'.$result["appid"].'_coming.json');
			copy($url, $upload_path);
		}else{
			// 파일이 없을때
			copy($url, $upload_path);
			//echo "저장완료";
		}
		
		//대표상품 퍼블리셔, 개발사,출시일 정보 업데이트, 
		
		if($result['publisher']){
			$title_query="update tbl_goods set publisher=:publisher,developer=:developer,interface_korean=:interface_korean,spoken_korean=:spoken_korean,drm_notice=:drm_notice where steam_appid=:steam_appid";
			$stmt = $conn->prepare($title_query);
			$title_params = array(
				":publisher"=> $result['publisher'],
				":developer"=>$result['developer'],
				":interface_korean"=>$result['interface_korean'],
				":spoken_korean"=>$result['spoken_korean'],
				":drm_notice"=>$result["drm_notice"],
				":steam_appid"=>$result["appid"],
			);
			$stmt->execute($title_params);
				

			
			$goods_query="update tbl_goods_item set interface_korean=:interface_korean,spoken_korean=:spoken_korean where steam_appid=:steam_appid";
			$stmt = $conn->prepare($goods_query);
			$goods_params = array(
				":interface_korean"=>$result['interface_korean'],
				":spoken_korean"=>$result['spoken_korean'],
				":steam_appid"=>$result["appid"],
			);
			$stmt->execute($goods_params);
			//print_r($goods_params);
		}else{
			$title_query="update tbl_goods set developer=:developer,interface_korean=:interface_korean,spoken_korean=:spoken_korean,drm_notice=:drm_notice where steam_appid=:steam_appid";
			$stmt = $conn->prepare($title_query);
			$title_params = array(
				":developer"=>$result['developer'],
				":interface_korean"=>$result['interface_korean'],
				":spoken_korean"=>$result['spoken_korean'],
				":drm_notice"=>$result["drm_notice"],
				":steam_appid"=>$result["appid"],
			);
			$stmt->execute($title_params);
			
			$goods_query="update tbl_goods_item set interface_korean=:interface_korean,spoken_korean=:spoken_korean where steam_appid=:steam_appid";
			$stmt = $conn->prepare($goods_query);
			$goods_params = array(
				":interface_korean"=>$result['interface_korean'],
				":spoken_korean"=>$result['spoken_korean'],
				":steam_appid"=>$result["appid"],
			);
			$stmt->execute($goods_params);
			//print_r($goods_params);
		}
		
		if($title_id){
			$query = "update steam_game set title_id=:title_id,batch_date=:batch_date where steam_appid=:steam_appid";
			$stmt = $conn->prepare($query);
			$param5 = array(
				":title_id"=>$title_id,
				":batch_date"=>date('Y-m-d H:i:s'),
				":steam_appid"=>$result["appid"],
			);
			$stmt->execute($param5);
		}
		
		
		if($result["coming_soon"]=="1"){
			$query = "update tbl_goods_item set release_date=:release_date where steam_appid=:appid";
			$stmt = $conn->prepare($query);
			$option_params = array(
				":release_date"=>date("Y-m-d",strtotime('+1 day',strtotime($result['release_date']))),
				":appid"=>$result["appid"]
			);
			$stmt->execute($option_params);
		}else{
			$query = "update tbl_goods_item set release_date=:release_date where steam_appid=:appid";
			$stmt = $conn->prepare($query);
			$option_params = array(
				":release_date"=>date("Y-m-d",strtotime('+1 day',strtotime($result['release_date']))),
				":appid"=>$result["appid"]
			);
			$stmt->execute($option_params);
		}
		
		switch($mode){
			case "steam_sync":
				if($title_id){
					$query="insert into tbl_goods_description set short_description=:short_description,description=:description,about_the_game=:about_the_game,requirements=:requirements,legal_text=:legal_text,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description,about_the_game=:about_the_game,requirements=:requirements,legal_text=:legal_text";
					$params3 = array(
						":short_description"=>$converter->convert($result["short_description"]),
						":description"=>$result["detailed_description"],
						":about_the_game"=>str_replace("##","\r\n###",$converter->convert(strip_tags($result["about_the_game"],"<source>,<video>,<ol>,<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<br>"))),
						":requirements"=>$converter->convert($result["minimum"]."<br/>".$result["recommended"]),
						":legal_text"=>$converter->convert(strip_tags($result["legal_notice"],"<strong>,<br>")),
						":title_id"=>$title_id
					);
					//$stmt = $conn->prepare($query);
					//$stmt->execute($params3);
				}
			break;
			case "description_sync":
				if($title_id){
					$query="insert into tbl_goods_description set short_description=:short_description,description=:description,about_the_game=:about_the_game,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,about_the_game=:about_the_game,description=:description";
					$params3 = array(
						":short_description"=>$converter->convert($result["short_description"]),
						":description"=>strip_tags($converter->convert($result["detailed_description"],"<source>,<video>,<ol>,<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<strong>,<br>")),
						":about_the_game"=>strip_tags($converter->convert($result["about_the_game"],"<source>,<video>,<ol>,<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<strong>,<br>")),
						":title_id"=>$title_id
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($params3);
				}
			break;
			case "description_sync_v2":
				if($title_id){
					$query="insert into tbl_goods_description set short_description=:short_description,description2=:description2,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,description2=:description2";
					$params3 = array(
						":short_description"=>$converter->convert($result["short_description"]),
						":description2"=>$result["detailed_description"],
						":title_id"=>$title_id
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($params3);
				}
			break;
			case "about_the_game_sync":
				if($title_id){
					$query="insert into tbl_goods_description set short_description=:short_description,description=:description,description2=:description2,about_the_game=:about_the_game,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,description2=:description2,about_the_game=:about_the_game";
					$params3 = array(
						":short_description"=>$converter->convert($result["short_description"]),
						":description"=>strip_tags($converter->convert($result["detailed_description"],"<source>,<video>,<ol>,<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<strong>,<br>")),
						":description2"=>$result["detailed_description"],
						":about_the_game"=>strip_tags($converter->convert($result["about_the_game"],"<source>,<video>,<ol>,<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<strong>,<br>")),
						":title_id"=>$title_id
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($params3);
				}
			break;
			case "steam_sync_desc":
				if($title_id){
					$query="insert into tbl_goods_description set short_description=:short_description,description=:description,about_the_game=:about_the_game,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description,about_the_game=:about_the_game";
					$params3 = array(
						":short_description"=>$converter->convert($result["short_description"]),
						":description"=>str_replace("##","##\r\n",$converter->convert(strip_tags($result["detailed_description"],"<source>,<video>,<ol>,<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<br>,<strong>"))),
						":about_the_game"=>str_replace("##","##\r\n",$converter->convert(strip_tags($result["about_the_game"],"<source>,<video>,<ol>,<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<br>,<strong>"))),
						":title_id"=>$title_id
					);
					$stmt = $conn->prepare($query);
					$stmt->execute($params3);
				}

				if($product_code){
					if($result["type"]=="game"){
						$u_query="insert into tbl_goods_item_description set short_description=:short_description,description=:description,description_v2=:description_v2,about_the_game=:about_the_game,steam_appid=:steam_appid, product_code=:product_code,reg_date=now() ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description,description_v2=:description_v2,about_the_game=:about_the_game,reg_date=now()";
						$params = array(
							":short_description"=>$converter->convert($result["short_description"]),
							":description"=>str_replace("##","\r\n\r\n##",$converter->convert(strip_tags($result["detailed_description"],"<video>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<p>,<span>,<b>,<ul>,<li>,<img>,<strong>,<br>,<p>"))),
							":description_v2"=>$result["detailed_description"],
							":about_the_game"=>$result["about_the_game"],
							":steam_appid"=>$result["appid"],
							":product_code"=>$product_code
						);
						$stmt = $conn->prepare($u_query);
						$stmt->execute($params);
					}else{
						$u_query="insert into tbl_goods_item_description set short_description=:short_description,description=:description,description_v2=:description_v2,about_the_game=:about_the_game,steam_appid=:steam_appid, product_code=:product_code,reg_date=now() ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description,description_v2=:description_v2,about_the_game=:about_the_game,reg_date=now()";
						$params = array(
							":short_description"=>$converter->convert($result["short_description"]),
							":description"=>str_replace("##","\r\n\r\n##",$converter->convert(strip_tags($result["detailed_description"],"<video>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<p>,<span>,<b>,<ul>,<li>,<img>,<strong>,<br>,<p>"))),
							":description_v2"=>$result["detailed_description"],
							":about_the_game"=>$result["about_the_game"],
							":steam_appid"=>$result["appid"],
							":product_code"=>$product_code
						);
					$stmt = $conn->prepare($u_query);
					$stmt->execute($params);
					}
					
					
					//print_r($params);
				}

			break;
			case "steam_sync_system":
				if($title_id){
					$query="insert into tbl_goods_description set requirements=:requirements,legal_text=:legal_text,title_id=:title_id ON DUPLICATE KEY UPDATE requirements=:requirements,legal_text=:legal_text";
					$params4 = array(
						":requirements"=>$converter->convert($result["minimum"]."<br/>".$result["recommended"]),
						":legal_text"=>mb_convert_encoding($converter->convert(strip_tags($result["legal_notice"],"<strong>,<br>")),'UTF-8', 'UTF-8'),
						":title_id"=>$title_id
					);
				//	print_r($params4);
					$stmt = $conn->prepare($query);
					$stmt->execute($params4);
				}

				if($product_code){
					$u_query="insert into tbl_goods_item_description set requirements=:requirements,legal_text=:legal_text,steam_appid=:steam_appid, product_code=:product_code,reg_date=now() ON DUPLICATE KEY UPDATE requirements=:requirements,legal_text=:legal_text,reg_date=now()";
					$params = array(
						":requirements"=>$converter->convert($result["minimum"]."<br/>".$result["recommended"]),
						":legal_text"=>mb_convert_encoding($converter->convert(strip_tags($result["legal_notice"],"<strong>,<br>")),'UTF-8', 'UTF-8'),
						":steam_appid"=>$result["appid"],
						":product_code"=>$product_code
					);
					$stmt = $conn->prepare($u_query);
					$stmt->execute($params);
					print_r($params);
				}
			break;
		}

		//스팀 이미지 존재여부 체크
		$header_url = $result["header_image"];
		$capsule_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$result["appid"]."/capsule_231x87.jpg";
		$capsule_url2 = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$result["appid"]."/capsule_616x353.jpg";
		$library_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$result["appid"]."/library_600x900.jpg";

		$s_query = "insert into steam_image_chk set appid=:appid,is_header=:is_header,is_capsule_231=:is_capsule_231,is_capsule_616=:is_capsule_616,is_library=:is_library,reg_date=date_format(now(),'%Y-%m-%d %H:%i:%s') ON DUPLICATE KEY UPDATE update_date=date_format(now(),'%Y-%m-%d %H:%i:%s'),is_header=:is_header,is_capsule_231=:is_capsule_231,is_capsule_616=:is_capsule_616,is_library=:is_library";
		$stmt = $conn->prepare($s_query);
		$s_params = array(
			":appid"=>$result["appid"],
			":is_header"=>$admin->remoteFileExist($header_url),
			":is_capsule_231"=>$admin->remoteFileExist($capsule_url),
			":is_capsule_616"=>$admin->remoteFileExist($capsule_url2),
			":is_library"=>$admin->remoteFileExist($library_url),
		);
		
		//$stmt->execute($s_params);
		
	}else{
		$query = "delete from steam_game where steam_appid=:steam_appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":steam_appid"=>$appids
			);
		//print_r($params);
		$stmt->execute($params3);
		
		$query = "delete from steam_package where appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		//print_r($params);
		$stmt->execute($params3);

		$query = "delete from steam_game_publisher where appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		$stmt->execute($params3);
		
		$query = "delete from steam_game_developer where appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		$stmt->execute($params3);
		
		$query = "delete from steam_game_genre where appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		$stmt->execute($params3);
		
		$query = "delete from steam_game_category where appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		$stmt->execute($params3);
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>