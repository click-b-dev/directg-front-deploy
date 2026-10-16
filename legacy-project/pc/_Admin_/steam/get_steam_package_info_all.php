<?
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	ini_set("display_errors", 1);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	header("Content-Type:text/html; charset=utf-8");

	//$appids = "3390";
	$packageids = filter_input(INPUT_GET, 'packageids', FILTER_SANITIZE_STRING);
	$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
	$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);
	$appid = filter_input(INPUT_GET, 'appid', FILTER_SANITIZE_STRING);
	$language = filter_input(INPUT_GET, 'language', FILTER_SANITIZE_STRING);

	$ch = curl_init();
	$url = "https://store.steampowered.com/api/packagedetails?l=koreana&packageids=".$packageids;
	curl_setopt($ch,CURLOPT_URL, $url);
	curl_setopt($ch,CURLOPT_POST, false);
	curl_setopt($ch, CURLOPT_SSLVERSION, '6');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, "5");
		$agents = array(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
		'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.9) Gecko/20100508 SeaMonkey/2.0.4',
		'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)',
		'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; da-dk) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
	 
	);
	curl_setopt($ch,CURLOPT_USERAGENT,$agents[array_rand($agents)]);
	$response = curl_exec($ch);
	$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close ($ch);

	//echo "\n\n\n\n\n\n";
	$data  = json_decode($response);
	//print_r($data);
	//exit;
	//echo $data[$appids]->data->steam_appid;

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$params = array();
		foreach($data as $key=>$value){
			$params["packageid"] = $key;
			foreach($value as $sub_key=>$sub_value){
				if($sub_key=="data"){
					//echo "appid : ".$sub_value->steam_appid."<br/>";
					//echo "name : ".$sub_value->name."<br/>";
					$params["package_name"] = $sub_value->name;
					if($sub_value->page_content){
						$params["page_content"] = $sub_value->page_content;
					}else{
						$params["page_content"]="";
					}
					$params["page_image"] = $sub_value->page_image;

					//$params["header_image"] = $sub_value->header_image;

					$params["package_small_img"] = $sub_value->small_logo;
					//echo "type : ".$sub_value->type."<br/>";
					//echo $sub_value->dlc."<br/>";
					if(is_array($sub_value->apps)){
						//echo "==dlc목록===<br/>";
						$apps_array = $sub_value->apps;
						//$params['apps'] = $sub_value->apps;
						foreach($apps_array as $apps){
							$sub['m_rgItems'][] = array(
								"m_rgIncludedAppIDs"=>$apps->id,
								"m_rgIncludedAppNames"=>$apps->name,
							);

							$p_query = "insert into steam_package_item set packageid=:packageid,appid=:appid,app_name=:app_name";
							$stmt = $conn->prepare($p_query);
							$p_param =array(
								':packageid'=>$key,
								':appid'=>$apps->id,
								':app_name'=>$apps->name
							);
							//print_r($p_param);
							//$stmt->execute($p_param);
							//$sub['m_rgIncludedAppIDs'][] = $apps->id;
							//$sub['m_rgIncludedAppNames'][] = $apps->name;
						}
					}
					//echo $sub_value->header_image."<br/>";
					$params['package_data']=$sub;
					$params["small_logo"] = $sub_value->small_logo;
					$params["price_initial"] = $sub_value->price->initial;
					$params["price_final"] = $sub_value->price->final;
					$params["price_currency"] = $sub_value->price->currency;
					$params["discount_percent"] = $sub_value->price->discount_percent;
					$params["price_individual"] = $sub_value->price->individual;
					$params["coming_soon"] = $sub_value->release_date->coming_soon;

					$release_date = $sub_value->release_date->date;
					//echo date('Y-m-d',strtotime(str_replace(",","",$release_date)));
					$release_date = str_replace(" ","-",str_replace("일","",str_replace("월","",str_replace("년","",$release_date))));
					$params["package_release"] = date('Y-m-d',strtotime(str_replace(",","",$release_date)));
				}
			}
		}

	//print_r($params);
	//exit;

	$package_header = "header.jpg";
	$package_thumb = "capsule_231x87.jpg";
	$header_path2 = '/home/dgkrshop/www/upload/package/'.$params["packageid"];
	if(!file_exists($header_path2)){
		mkdir($header_path2, '0777',true);
	}

	if(!file_exists($params["page_image"])){
		//copy($params["page_image"], $header_path2."/".$package_header);
	}

	if(!file_exists($params["package_small_img"])){
		//copy($params["package_small_img"], $header_path2."/".$package_thumb);
	}

	//print_r($params);
	if($params["package_name"]){
		//스팀게임정보 저장
		$query = "update steam_package_all set package_name=:package_name,package_image=:package_image,package_small_img=:package_small_img,price_currency=:price_currency,price_initial=:price_initial,price_final=:price_final,discount_percent=:discount_percent,package_coming_soon=:package_coming_soon,package_release=:package_release,price_individual=:price_individual,batch_date=UNIX_TIMESTAMP(now()) where packageid=:packageid";

		$stmt = $conn->prepare($query);
		$params2 = array(
			":package_name"=>$params["package_name"],
			":package_image"=>$params["page_image"],
			":package_small_img"=>$params["package_small_img"],
			":price_currency"=>$params["price_currency"],
			":price_initial"=>$params["price_initial"],
			":price_final"=>$params["price_final"],
			":discount_percent"=>$params["discount_percent"],
			":package_coming_soon"=>$params["coming_soon"],
			":package_release"=>$params["package_release"],
			":price_individual"=>$params["price_individual"],
			":packageid"=>$params["packageid"],
		);
		$stmt->execute($params2);
		print_r($params2);

		if($params["page_content"]){
			$query = "insert into tbl_package_description set description=:description,package_name=:package_name,page_image=:page_image,small_logo=:small_logo,packageid=:packageid ON DUPLICATE KEY UPDATE description=:description,package_name=:package_name,page_image=:page_image,small_logo=:small_logo";
			$stmt = $conn->prepare($query);
			$params2 = array(
				":description"=>$params["page_content"],
				":package_name"=>$params["package_name"],
				":page_image"=>$params["page_image"],
				":small_logo"=>$params["small_logo"],
				":packageid"=>$params["packageid"],
			);
			//$stmt->execute($params2);
		}else{
			$query = "insert into tbl_package_description set 
			package_name=:package_name,page_image=:page_image,small_logo=:small_logo,packageid=:packageid ON DUPLICATE KEY UPDATE package_name=:package_name,page_image=:page_image,small_logo=:small_logo";
			$stmt = $conn->prepare($query);
			$params2 = array(
				":package_name"=>$params["package_name"],
				":page_image"=>$params["page_image"],
				":small_logo"=>$params["small_logo"],
				":packageid"=>$params["packageid"],
			);
			//$stmt->execute($params2);

			print_r($params2);
		}

		//foreach($params['package_data']['m_rgItems'] as $package_item){
			
	//	}
	}else{
		$query = "delete from steam_package_all where packageid=:packageid";
		$stmt = $conn->prepare($query);
		$params2 = array(
			":packageid"=>$params["packageid"],
		);
		$stmt->execute($params2);
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>