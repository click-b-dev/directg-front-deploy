<?
	
	ini_set("display_errors", 1);
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	use HTMLToMarkdown\HtmlConverter;
	$converter = new HtmlConverter();

	header("Content-Type:text/html; charset=utf-8");

	//$appids = "3390";
	$appids = filter_input(INPUT_GET, 'appids', FILTER_SANITIZE_STRING);
	$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);

function getSteamInfo($appids){
	$ch = curl_init();
	$url = "https://store.steampowered.com/api/appdetails?l=koreana&appids=".$appids;
	curl_setopt($ch,CURLOPT_URL, $url);
	curl_setopt($ch,CURLOPT_POST, false);
	curl_setopt($ch, CURLOPT_SSLVERSION, '6');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, "5");
		$agents = array(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
		'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)',
		'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; da-dk) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
		'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
	 
	);
	curl_setopt($ch,CURLOPT_USERAGENT,$agents[array_rand($agents)]);
	$response = curl_exec($ch);
	$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close ($ch);

	//echo "\n\n\n\n\n\n";
	$data  = json_decode($response);
	//print_r($data);
	//echo $data[$appids]->data->steam_appid;
	$params = array();
	foreach($data as $key=>$value){
		foreach($value as $sub_key=>$sub_value){
			if($sub_key=="data"){
				//echo "appid : ".$sub_value->steam_appid."<br/>";
				$params["appid"] = $sub_value->steam_appid;
				//echo "name : ".$sub_value->name."<br/>";
				$params["name"] = $sub_value->name;
				//echo "type : ".$sub_value->type."<br/>";
				$params["type"] = $sub_value->type;
				//echo "is_free : ".$sub_value->is_free."<br/>";
				$params["is_free"] = $sub_value->is_free;
				$params["controller_support"] = $sub_value->controller_support;
				//echo $sub_value->dlc."<br/>";
				//if(is_array($sub_value->dlc)){
					//echo "==dlc목록===<br/>";
					$dlc_array = $sub_value->dlc;
					$params['dlc'] = $sub_value->dlc;
			//	}
				//echo $sub_value->header_image."<br/>";
				$params["header_image"] = $sub_value->header_image;
				$params["about_the_game"] = $sub_value->about_the_game;
				//echo $sub_value->pc_requirements->minimum."<br/>";
				$params["supported_languages"] = $sub_value->supported_languages;
				$params["minimum"] = $sub_value->pc_requirements->minimum;
				$params["recommended"] = $sub_value->pc_requirements->recommended;

				$params["short_description"] = $sub_value->short_description;
				$params["detailed_description"] = $sub_value->detailed_description;
				
				//echo $sub_value->pc_requirements->recommended."<br/>";
				//echo $sub_value->legal_notice."<br/>";
				if($sub_value->legal_notice){
					$params["legal_notice"] = $sub_value->legal_notice;
				}else{
					$params["legal_notice"] ="";
				}

				if(is_array($sub_value->developers)){
					$developers_array = $sub_value->developers;
					$params['developers'] = $sub_value->developers;
					foreach($developers_array as $developers){
						//echo $developers."<br/>";
						$developers_array[]=ltrim($developers,' ');
					}
				}

				if(is_array($sub_value->publishers)){
					$publishers_array = $sub_value->publishers;
					$params['publishers'] = $sub_value->publishers;
					foreach($publishers_array as $publishers){
						//echo $publishers."<br/>";
						$publisher_array[]=ltrim($publishers,' ');
					}
				}
				
				$params["consumer_price"] = $sub_value->price_overview->initial;
				$params["price"] = $sub_value->price_overview->final;
				$params["discount_percent"] = $sub_value->price_overview->discount_percent;

				$params["drm_notice"] = $sub_value->drm_notice;
				$params["ext_user_account_notice"] = $sub_value->ext_user_account_notice;

				//echo $sub_value->metacritic->score."<br/>";
				//echo $sub_value->metacritic->url."<br/>";
				$params["metacritic_score"] = $sub_value->metacritic->score;
				$params["metacritic_url"] = $sub_value->metacritic->url;
				$params["recommendations"] = $sub_value->recommendations->total;

				if($params["recommendations"]==""){
					$params["recommendations"] = '0';
				}

				//echo "==카테고리목록===<br/>";
				if(is_array($sub_value->categories)){
					$categories_array = $sub_value->categories;
					$params['category'] = $sub_value->categories;
					foreach($categories_array as $categories){
						//echo $categories->id."/".$categories->description."<br/>";
					}
				}

				if(is_array($sub_value->genres)){
					$genres_array = $sub_value->genres;
					$params["genres"]=$sub_value->genres;
				}

				//연관상품목록
			//	if(is_array($sub_value->package_groups)){
					$package_groups = $sub_value->package_groups;
					$params['package_groups'] = $sub_value->package_groups['0'];
					foreach($package_groups as $package){
						//echo $categories->id."/".$categories->description."<br/>";
					}
			//	}
				
				//echo $sub_value->release_date->coming_soon."<br/>";
				$params["coming_soon"] = $sub_value->release_date->coming_soon;
				$release_date = $sub_value->release_date->date;

				if($params["coming_soon"]=="1"){
					if(strpos($release_date,"분기")){
						$release_date =str_replace(" ","0",str_replace("년","-", str_replace("분기","",$release_date)));
						$tmp_month = date('n',strtotime($release_date));

						switch($tmp_month){
							case "1":
								$release_date = substr($release_date,0,4)."-03-31";
							break;
							case "2":
								$release_date = substr($release_date,0,4)."-06-30";
							break;
							case "3":
								$release_date = substr($release_date,0,4)."-09-30";
							break;
							case "4":
								$release_date = substr($release_date,0,4)."-12-31";
							break;
						}
						
						$params["release_date"]=$release_date;
						$params["coming_soon_date"]=$release_date;
					}else{
						switch($release_date){
							case "발표 예정":case "발표-예정":
								$params["release_date"]="";
								$params["coming_soon_date"]=$release_date;
							break;
							case "출시 예정 게임":case "출시-예정-게임":case "출시 예정":
								$params["release_date"]="";
								$params["coming_soon_date"]=$release_date;
							break;
							default:
								if($release_date){
									$coming_soon_date = str_replace(" ","-",str_replace("년","",str_replace("월","",str_replace("일","",$release_date))));
									$release_date = str_replace(" ","-",str_replace("년","",str_replace("월","",str_replace("일","",$release_date))));
									
									if(strlen($coming_soon_date)==4){
										$params["coming_soon_date"] =  $coming_soon_date."-12-31";
										$params["release_date"] =  $params["coming_soon_date"];
									}elseif(strlen($coming_soon_date)==6){
										$params["coming_soon_date"] =  date('Y-m-d',strtotime($coming_soon_date."-30"));
										$params["release_date"] =  $params["coming_soon_date"];
									}elseif(strlen($coming_soon_date)==7){
										$params["coming_soon_date"] =  date('Y-m-d',strtotime($coming_soon_date."-30"));
										$params["release_date"] =  $params["coming_soon_date"];
									}else{
										$params["coming_soon_date"] =   date('Y-m-d',strtotime($coming_soon_date));
										$params["release_date"]= date('Y-m-d',strtotime($release_date));
									}
								}
							break;
						}
					}
				}else{
					$release_date = str_replace(" ","",str_replace("년","-",str_replace("월","-",str_replace("일","",$release_date))));
					$params["release_date"] = date('Y-m-d',strtotime($release_date));
					$params["coming_soon_date"] = date('Y-m-d',strtotime($release_date));
				}
			}
		}
	}

	return $params;
}

$start_time = time();

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn);

	//$query="select appid from steam_app_list where app_type='game' and publisher is null order by appid desc limit 20";
	//$query = "select appid from steam_app_list where coming_soon<>'1' and date_format(release_date,'%Y')='2022' and batch_date<'2024-07-01 00:00:00' order by recommendations desc limit 10";
	//$query = " select * from steam_app_list where coming_soon='1' and batch_date<'2024-10-01 00:00:00' order by appid asc limit 10";
	//$query = "select a.steam_appid as appid from steam_game a left join steam_app_list b on a.steam_appid=b.appid where b.appid is null and a.app_type='game' limit 10";
	$query = "select appid from steam_app_list where app_type='game' and coming_soon='1' order by batch_date asc limit 30";
	//$query = "select b.appid from steam_game a inner join steam_app_list b on a.steam_appid=b.appid where a.publisher is null and a.app_type='game' order by  b.appid desc limit 10";
	//$query="select b.appid,a.name,a.app_type,a.release_date,a.recommendations,a.coming_soon,a.supported_languages,a.batch_date from steam_game_publisher b left join steam_app_list a  on b.appid=a.appid where a.batch_date is null and name is null order by b.appid asc limit 10";
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$data2 = $stmt->fetchAll();

	foreach($data2 as $value){
		$filename2 = "header.jpg";
		$header_path2 = $_SERVER['DOCUMENT_ROOT'].'/upload/apps/header/'.$value['appid'];
		//if(!file_exists($header_path2)){
		//	mkdir($header_path2, '0777',true);
		//}
		//copy($params["header_image"], $header_path2."/".$filename2);

		$params = getSteamInfo($value['appid']);
		
		if($params['recommendations']>0){
		echo "<br/>".$value['appid']."/".$params['name']."/".$params['release_date']."/".$params['recommendations']."/".$params['type'];
		}
		
		if($params['publishers']){
			$publishers = implode(", ",$params['publishers']);
		}else{
			$publishers = "";
		}
		
		if($params['developers']){
			$developers = implode(", ",$params['developers']);
		}else{
			$developers = "";
		}

		
		/*
		echo "<br/>".$value['appid']." / ".$params["type"]." / ".implode(", ",$params['publishers'])." / ".implode(", ",$params['developers'])." / ".$params["release_date"]." / 
		".$params["recommendations"]." / ".$params["coming_soon"]." / ".number_format(($params["consumer_price"]/100))."<br/>";
		echo str_replace("*음성이 지원되는 언어",'',strip_tags($params["supported_languages"]))."<br/>";
		*/
		//print_r($params['publishers']);
		if($params["appid"]>0 ){
			//스팀게임정보 저장
		$query = "INSERT INTO steam_app_list set appid=:appid,app_type=:app_type,name=:name,publisher=:publisher,is_free=:is_free,release_date=:release_date,consumer_price=:consumer_price,price=:price,metacritic_score=:metacritic_score,metacritic_url=:metacritic_url,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,supported_languages=:supported_languages,recommendations=:recommendations,developer=:developer,batch_date=now() ON DUPLICATE KEY UPDATE app_type=:app_type,name=:name,publisher=:publisher,is_free=:is_free,release_date=:release_date,consumer_price=:consumer_price,price=:price,metacritic_score=:metacritic_score,metacritic_url=:metacritic_url,coming_soon=:coming_soon,coming_soon_date=:coming_soon_date,supported_languages=:supported_languages,recommendations=:recommendations,developer=:developer,batch_date=now()";
		$stmt = $conn->prepare($query);
		$params2 = array(
			":appid"=>$params["appid"],
			":app_type"=>$params["type"],
			":name"=>$params["name"],
			":publisher"=>$publishers,
			":is_free"=>$params["is_free"],
			":release_date"=>$params["release_date"],
			":consumer_price"=>$params["consumer_price"],
			":price"=>$params["price"],
			":metacritic_score"=>$params["metacritic_score"],
			":metacritic_url"=>$params["metacritic_url"],
			":coming_soon"=>$params["coming_soon"],
			":coming_soon_date"=>$params["coming_soon_date"],
			":supported_languages"=>str_replace("*음성이 지원되는 언어",'',strip_tags($params["supported_languages"])),
			":recommendations"=>$params["recommendations"],
			":developer"=>$developers,

		);
		$stmt->execute($params2);

			//스팀게임 DLC정보 저장
			if($params["type"]=="game"){
				if(is_array($params['dlc'])){
					foreach($params['dlc'] as $sub_key=>$sub_value){
						if($sub_value){
						$query = "insert into steam_dlc_all set game_appid=:game_appid,dlc_appid=:dlc_appid ON DUPLICATE KEY UPDATE dlc_appid=:dlc_appid";
						$stmt = $conn->prepare($query);
						$dlc_params = array(
							":game_appid"=>$value['appid'],
							":dlc_appid"=>$sub_value,
						);
						$stmt->execute($dlc_params);
						//print_r($dlc_params);
						$query = "update steam_app_list set app_type='dlc'where appid=:appid";
						$stmt = $conn->prepare($query);
						$app_params = array(
							":appid"=>$sub_value,
						);
						$stmt->execute($app_params);
						}
					}
				}
			}

			//스팀게임 패키지 정보 저장
			if(is_array($params['package_groups'])){
				foreach($params['package_groups']->subs as $sub_key=>$sub_value){
					$query = "insert into steam_package_all set appid=:appid,packageid=:packageid,reg_date=now() DUPLICATE KEY UPDATE packageid=:packageid";
					$stmt = $conn->prepare($query);
					$package_params = array(
						":appid"=>$value['appid'],
						":packageid"=>$sub_value->packageid
					);
					//$stmt->execute($package_params);
					//print_r($package_params);
				}
			}

			  //스팀게임 개발사 정보 저장
			  foreach($params['developers'] as $sub_key=>$sub_value){
				$query = "insert into steam_game_developer set appid=:appid,developer_id=:developer_id,developer_name=:developer_name ON DUPLICATE KEY UPDATE developer_name=:developer_name";
				$stmt = $conn->prepare($query);
				$category_params = array(
					":appid"=>$value['appid'],
					":developer_id"=>$sub_key,
					":developer_name"=>$sub_value
				);
				$stmt->execute($category_params);
				//print_r($category_params);
			  }

			   if(is_array($params['genres'])){
				 /*태그자동추가*/
					$t_query = "delete from steam_game_genre where appid=:appid";
					$stmt = $conn->prepare($t_query);
					$t_params = array(
						":appid"=>$value['appid'],
					);
					$stmt->execute($t_params);
					foreach($params['genres'] as $sub_key=>$sub_value){
						if($sub_value->id<>"29"){
							$query = "insert into steam_game_genre set appid=:appid,genres_id=:genres_id,genres_name=:genres_name ON DUPLICATE KEY UPDATE genres_name=:genres_name";
							$stmt = $conn->prepare($query);
							$genre_params = array(
								":appid"=>$value['appid'],
								":genres_id"=>$sub_value->id,
								":genres_name"=>$sub_value->description,
							);
							$stmt->execute($genre_params);
						}

						//$tag_array[]=$sub_value->description;
						//print_r($genre_params);
					}
			   }

			  //스팀게임 퍼블리셔 정보 저장
			  foreach($params['publishers'] as $sub_key=>$sub_value){
				// if($sub_key=="0"){
				$query = "insert into steam_game_publisher set appid=:appid,publisher_id=:publisher_id,publisher_name=:publisher_name ON DUPLICATE KEY UPDATE publisher_name=:publisher_name";
				$stmt = $conn->prepare($query);
				$publisher_params = array(
					":appid"=>$value['appid'],
					":publisher_id"=>$sub_key,
					":publisher_name"=>str_replace(',','',ltrim($sub_value,' '))
				);
				$stmt->execute($publisher_params);
				//  }
				//print_r($category_params);
			  }


		}else{
			$query = "delete from steam_app_list where appid=:appid";
			$stmt = $conn->prepare($query);
			$params3 = array(
					":appid"=>$value['appid']
				);
			//print_r($params);
			$stmt->execute($params3);

			$query = "delete from steam_game_publisher where appid=:appid";
			$stmt = $conn->prepare($query);
			$params3 = array(
					":appid"=>$value['appid']
				);
			//print_r($params);
			$stmt->execute($params3);

			$query = "delete from steam_game_genre where appid=:appid";
			$stmt = $conn->prepare($query);
			$params = array(
					":appid"=>$value['appid']
				);
			$stmt->execute($params);

			$query = "delete from steam_game_developer where appid=:appid";
			$stmt = $conn->prepare($query);
			$params = array(
					":appid"=>$value['appid']
				);
			$stmt->execute($params);
			
			$query = "delete from steam_game_category where appid=:appid";
			$stmt = $conn->prepare($query);
			$params = array(
					":appid"=>$value['appid']
				);
			$stmt->execute($params);
		}
	}

	$end_time = time();
	echo "<br/>".($end_time-$start_time)."초";

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>