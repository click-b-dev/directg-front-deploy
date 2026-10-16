<?
	ini_set("display_errors", 1);
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
	use HTMLToMarkdown\HtmlConverter;
	$converter = new HtmlConverter();
	
	$appids = filter_input(INPUT_GET, 'appids', FILTER_SANITIZE_STRING);
	$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
	$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);
	$language = filter_input(INPUT_GET, 'language', FILTER_SANITIZE_STRING);
	
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$steam = new Steam($conn);
	
	$result = $steam->getSteamAppInfo($appids,$language);
	
	
	$query = "insert into steam_game set steam_appid=:steam_appid,app_type=:app_type,name=:name,is_free=:is_free,supported_languages=:supported_languages,short_description=:short_description,detailed_description=:detailed_description,about_the_game=:about_the_game,header_image=:header_image,pc_requirements_minimum=:pc_requirements_minimum,pc_requirements_recommended=:pc_requirements_recommended,legal_notice=:legal_notice,release_date=:release_date,consumer_price=:consumer_price,price=:price,discount_percent=:discount_percent,metacritic_score=:metacritic_score,metacritic_url=:metacritic_url,drm_notice=:drm_notice,ext_user_account_notice=:ext_user_account_notice,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,recommendations=:recommendations,genre=:genre,category=:category,publisher=:publisher,developer=:developer,batch_date=:batch_date ON DUPLICATE KEY UPDATE name=:name,supported_languages=:supported_languages,short_description=:short_description,about_the_game=:about_the_game,pc_requirements_minimum=:pc_requirements_minimum,pc_requirements_recommended=:pc_requirements_recommended,legal_notice=:legal_notice,metacritic_score=:metacritic_score,metacritic_url=:metacritic_url,price=:price,consumer_price=:consumer_price,release_date=:release_date,drm_notice=:drm_notice,ext_user_account_notice=:ext_user_account_notice,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,recommendations=:recommendations,genre=:genre,category=:category,batch_date=:batch_date,about_the_game=:about_the_game";
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
		":pc_requirements_minimum"=>$result['minimum'],
		":pc_requirements_recommended"=>$result['recommended'],
		":legal_notice"=>$converter->convert($result["legal_notice"]),
		":release_date"=>$result["release_date"],
		":consumer_price"=>$result["consumer_price"],
		":price"=>$result["price"],
		":discount_percent"=>$result["discount_percent"],
		":metacritic_score"=>$result["metacritic_score"],
		":metacritic_url"=>$result["metacritic_url"],
		":drm_notice"=>$result["drm_notice"],
		":ext_user_account_notice"=>$result["ext_user_account_notice"],
		":coming_soon"=>$result["coming_soon"],
		":coming_soon_date"=>$result["coming_soon_date"],
		":recommendations"=>$result["recommendations"],
		":genre"=>$result['genre'],
		":category"=> $result['category'],
		":publisher"=> $result['publisher'],
		":developer"=>$result['developer'],
		":batch_date"=>date('Y-m-d H:i:s'),
	);
	
	print_r($params2);
	//$stmt->execute($params2);
	
	if($title_id){
		$title_query="update tbl_goods set publisher=:publisher,developer=:developer,interface_korean=:interface_korean,spoken_korean=:spoken_korean,drm_notice=:drm_notice,ext_user_account_notice=:ext_user_account_notice,release_date=:release_date where steam_appid=:steam_appid";
		$stmt = $conn->prepare($title_query);
		$title_params = array(
			":publisher"=>$result['publisher'],
			":developer"=>$result['developer'],
			":interface_korean"=>$result['interface_korean'],
			":spoken_korean"=>$result['spoken_korean'],
			":drm_notice"=>$result["drm_notice"],
			":ext_user_account_notice"=>$result["ext_user_account_notice"],
			":release_date"=>$result["release_date"],
			":steam_appid"=>$result["appid"],
		);
		$stmt->execute($title_params);

		$query = "update steam_game set title_id=:title_id,batch_date=:batch_date where steam_appid=:steam_appid";
		$stmt = $conn->prepare($query);
		$param5 = array(
			":title_id"=>$title_id,
			":batch_date"=>date('Y-m-d H:i:s'),
			":steam_appid"=>$result["appid"],
		);
		$stmt->execute($param5);
	}
	
	$query = "update tbl_goods_item set release_date=:release_date where steam_appid=:appid";
	$stmt = $conn->prepare($query);
	$option_params = array(
		":release_date"=>$result["release_date"],
		":appid"=>$result["appid"]
	);
	$stmt->execute($option_params);
	
	switch($mode){
	case "steam_sync":
		if($title_id){
			$query="insert into tbl_goods_description set short_description=:short_description,description=:description,about_the_game=:about_the_game,requirements=:requirements,legal_text=:legal_text,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description,about_the_game=:about_the_game,requirements=:requirements,legal_text=:legal_text";
			$params3 = array(
				":short_description"=>$converter->convert($result["short_description"]),
				":description"=>$result["detailed_description"],
				":about_the_game"=>str_replace("##","\r\n\r\n ###",$converter->convert(strip_tags($result["about_the_game"],"<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>"))),
				":requirements"=>$converter->convert($result["minimum"]."<br/>".$result["recommended"]),
				":legal_text"=>$converter->convert(strip_tags($result["legal_notice"],"<strong>,<br>")),
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params3);
		}
	break;
	case "description_sync":
		if($title_id){
			$query="insert into tbl_goods_description set short_description=:short_description,description=:description,about_the_game=:about_the_game,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description,about_the_game=:about_the_game";
			$params3 = array(
				":short_description"=>$converter->convert($result["short_description"]),
				":description"=>$result["detailed_description"],
				":about_the_game"=>strip_tags($converter->convert($result["about_the_game"],"<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<strong>")),
				":title_id"=>$title_id
			);
			print_r($params3);
			$stmt = $conn->prepare($query);
			$stmt->execute($params3);
		}
	break;
	case "steam_sync_desc":
		if($title_id){
			$query="insert into tbl_goods_description set short_description=:short_description,description=:description,about_the_game=:about_the_game,title_id=:title_id ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description,about_the_game=:about_the_game";
			$params3 = array(
				":short_description"=>$converter->convert($result["short_description"]),
				":description"=>$result["detailed_description"],
				":about_the_game"=>str_replace("##","\r\n\r\n ###",$converter->convert(strip_tags($result["about_the_game"],"<ul>,<li>,<img>,<p>,<span>,<b>,<s>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>"))),
				":title_id"=>$title_id
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params3);
		}

		if($product_code){
		$u_query="insert into tbl_goods_item_description set short_description=:short_description,description=:description,steam_appid=:steam_appid, product_code=:product_code ON DUPLICATE KEY UPDATE short_description=:short_description,description=:description";
		$params = array(
			":short_description"=>$converter->convert($params["short_description"]),
			":description"=>$converter->convert($params["detailed_description"]),
			":steam_appid"=>$appids,
			":product_code"=>$product_code
		);
		$stmt = $conn->prepare($u_query);
		$stmt->execute($params);
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
			//print_r($params4);
			$stmt = $conn->prepare($query);
			$stmt->execute($params4);
		}

		if($product_code){
			$u_query="insert into tbl_goods_item_description set requirements=:requirements,legal_text=:legal_text,steam_appid=:steam_appid, product_code=:product_code ON DUPLICATE KEY UPDATE requirements=:requirements,legal_text=:legal_text";
			$params = array(
				":requirements"=>$converter->convert($result["minimum"]."<br/>".$result["recommended"]),
				":legal_text"=>mb_convert_encoding($converter->convert(strip_tags($result["legal_notice"],"<strong>,<br>")),'UTF-8', 'UTF-8'),
				":steam_appid"=>$appids,
				":product_code"=>$product_code
			);
			$stmt = $conn->prepare($u_query);
			$stmt->execute($params);
		}
	break;
}
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>