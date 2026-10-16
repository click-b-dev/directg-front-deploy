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
	$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);
	$language = filter_input(INPUT_GET, 'language', FILTER_SANITIZE_STRING);

	if($language){
		$l = $language;
	}else{
		$l = "koreana";
	}

	function download_image($url, $save_path) {
		if (empty($url)) return false;

		// 1차: copy() 시도
		if (@copy($url, $save_path)) {
			return true;
		}

		// 2차: copy() 실패 시 curl로 재시도
		$ch = curl_init($url);
		curl_setopt_array($ch, [
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_SSL_VERIFYHOST => 0,
			CURLOPT_SSL_VERIFYPEER => 0,
			CURLOPT_CONNECTTIMEOUT => 5,
			CURLOPT_TIMEOUT        => 10,
			CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			CURLOPT_FOLLOWLOCATION => true,
		]);
		$image_data = curl_exec($ch);
		$http_code  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		if ($http_code !== 200 || empty($image_data)) return false;

		return (file_put_contents($save_path, $image_data) !== false);
	}

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
		'Mozilla/5.0 (X11; U; Linux i686; ko-KR; rv:1.9.1.9) Gecko/20100508 SeaMonkey/2.0.4',
		'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; ko-KR)',
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
	$params = array();
	$screenshot_params = array();
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
					$params['fullgame'] = $sub_value->fullgame->appid;
			//	}
				$params['dlc'] = $sub_value->dlc;
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
					}
				}

				if(is_array($sub_value->publishers)){
					$publishers_array = $sub_value->publishers;
					$params['publishers'] = $sub_value->publishers;
					foreach($publishers_array as $publishers){
						//echo $publishers."<br/>";
						//$publisher_array[]=ltrim($publishers,' ');
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

				//연관상품목록
				//if(is_array($sub_value->package_groups)){
					$package_groups = $sub_value->package_groups;
					$params['package_groups'] = $sub_value->package_groups['0'];
				//}
				
				//echo "==장르목록===<br/>";
				if(is_array($sub_value->genres)){
					$genres_array = $sub_value->genres;
					$params["genres"]=$sub_value->genres;
				}
				
				//echo "==스크린샷목록===<br/>";
				if(is_array($sub_value->screenshots)){
					$screenshots_array = $sub_value->screenshots;
					//print_r($screenshots_array);
					$params["screenshots"]=$screenshots_array;
					foreach($screenshots_array as $screenshots){
						//$screenshot_params[]['id']=$screenshots->id;
						$screenshot_params[$screenshots->id]['path_thumbnail']=$screenshots->path_thumbnail;
						$screenshot_params[$screenshots->id]['path_full']=$screenshots->path_full;
						//echo "<img src='".$screenshots->path_full."' style='width:150px'><br/><br/>";
					}
					//print_r($screenshot_params);
				}

				//동영상목록
				if(is_array($sub_value->movies)){
					$media_array = $sub_value->movies;
					//print_r($screenshots_array);
					$params["movies"]=$media_array;
					foreach($sub_value->movies as $media){
						$media_params[$media->id]['id']=$media->id;
						$media_params[$media->id]['name']=$media->name;
						$media_params[$media->id]['thumbnail']=$media->thumbnail;
						//$media_params[$media->id]['webm_480']=$media->webm->480;
						$media_params[$media->id]['webm_max']=$media->webm->max;
						//$media_params[$media->id]['mp4_480']=$media->mp4->480;
						$media_params[$media->id]['mp4_max']=$media->mp4->max;
						//echo "<img src='".$screenshots->path_full."' style='width:150px'><br/><br/>";
					}
					//print_r($media_params);
				}

				//echo $sub_value->release_date->coming_soon."<br/>";
				$params["coming_soon"] = $sub_value->release_date->coming_soon;
				
				$release_date = $sub_value->release_date->date;
				
				echo $sub_value->steam_appid. " / ".$sub_value->name. " / ".$sub_value->release_date->date;

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

	//print_r($params);
$tag_array = array();

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$admin= new Admin($conn);
	
	//echo $params["release_date"];

	if($params["appid"]>0){
		$filename2 = "header.jpg";
		$header_path2 = '/home/dgkrshop/www/upload/apps/header/'.$params["appid"];
		
		if(!is_dir($header_path2)){
			$oldumask = umask(0);
			mkdir($header_path2, 0777,true);
			//chmod($header_path,0777);
			umask($oldumask);
		}
		
		//echo $params["header_image"] ;
		//copy($params["header_image"], $header_path2."/".$filename2);
		download_image($params["header_image"], $header_path2."/".$filename2);
		
		
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
		//print_r($params2);


		//스팀게임 DLC정보 저장
	//	if(is_array($params['dlc'])){
		if($params['type']=="game"){
			foreach($params['dlc'] as $sub_key=>$sub_value){
				$query = "insert into steam_dlc_all set game_appid=:game_appid,dlc_appid=:dlc_appid ON DUPLICATE KEY UPDATE dlc_appid=:dlc_appid";
				$stmt = $conn->prepare($query);
				$dlc_params = array(
					":game_appid"=>$params["appid"],
					":dlc_appid"=>$sub_value,
				);
				$stmt->execute($dlc_params);
				
				$query = "update steam_app_list set app_type='dlc'where appid=:appid";
				$stmt = $conn->prepare($query);
				$app_params = array(
					":appid"=>$sub_value,
				);
				$stmt->execute($app_params);

			}
		}else{
			$query = "insert into steam_dlc_all set game_appid=:game_appid,dlc_appid=:dlc_appid ON DUPLICATE KEY UPDATE game_appid=:game_appid";
				$stmt = $conn->prepare($query);
			$dlc_params = array(
				":game_appid"=>$params["fullgame"],
				":dlc_appid"=>$params["appid"],
			);
			$stmt->execute($dlc_params);
			//print_r($dlc_params);
			$u_query="update steam_app_list t1, (select a.publisher from steam_app_list a inner join (select game_appid from steam_dlc_all where dlc_appid=:appid)as b on a.appid=b.game_appid)as t2 set t1.publisher = t2.publisher where t1.appid=:appid ";
			$stmt = $conn->prepare($u_query);
			$u_params = array(
				":appid"=>$params["appid"],
			);
			$stmt->execute($u_params);
		}

	//	}

		//스팀게임 패키지 정보 저장
	//	if(is_array($params['package_groups'])){
			
			foreach($params['package_groups']->subs as $sub_key=>$sub_value){
				$query = "insert into steam_package_all set appid=:appid,packageid=:packageid,reg_date=now() ON DUPLICATE KEY UPDATE packageid=:packageid";
				$stmt = $conn->prepare($query);
				$package_params = array(
					":appid"=>$params["appid"],
					":packageid"=>$sub_value->packageid
				);
				$stmt->execute($package_params);

				//$query='delete from steam_package_all where appid=:appid and packageid<>:packageid';
				//$stmt = $conn->prepare($query);
				//$params = array(
				//	":appid"=>$params["appid"],
				//	":packageid"=>$sub_value->packageid
				//);
				//$stmt->execute($params);
			}
	//	}

		  //스팀게임 개발사 정보 저장
		  foreach($params['developers'] as $sub_key=>$sub_value){
			$query = "insert into steam_game_developer set appid=:appid,developer_id=:developer_id,developer_name=:developer_name ON DUPLICATE KEY UPDATE developer_name=:developer_name";
			$stmt = $conn->prepare($query);
			$category_params = array(
				":appid"=>$params["appid"],
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
				":appid"=>$params["appid"],
			);
			$stmt->execute($t_params);
			foreach($params['genres'] as $sub_key=>$sub_value){
				if($sub_value->id<>"29"){
					$query = "insert into steam_game_genre set appid=:appid,genres_id=:genres_id,genres_name=:genres_name ON DUPLICATE KEY UPDATE genres_name=:genres_name";
					$stmt = $conn->prepare($query);
					$genre_params = array(
						":appid"=>$params["appid"],
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
			 //if($sub_key=="0"){
			$query = "insert into steam_game_publisher set appid=:appid,publisher_id=:publisher_id,publisher_name=:publisher_name ON DUPLICATE KEY UPDATE publisher_name=:publisher_name";
			$stmt = $conn->prepare($query);
			$publisher_params = array(
				":appid"=>$params["appid"],
				":publisher_id"=>$sub_key,
				":publisher_name"=>str_replace('  ','',str_replace(',','',ltrim($sub_value,' ')))
			);
			$stmt->execute($publisher_params);
			 //}
			//print_r($publisher_params);
		  }
		  
		$upload_path = '/home/dgkrshop/www/upload/apps/apps_'.$params["appid"].'.json';

		if( file_exists($upload_path) ) {
			// 파일이 존재할 때
			//echo "이미 존재함";
			//copy($url, $upload_path);
		}else{
			// 파일이 없을때
			//copy($url, $upload_path);
			//echo "저장완료";
		}


		//스팀 이미지 존재여부 체크
		$header_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$params["appid"]."/header.jpg";
		$capsule_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$params["appid"]."/capsule_231x87.jpg";
		$capsule_url2 = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$params["appid"]."/capsule_616x353.jpg";
		$library_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$params["appid"]."/library_600x900.jpg";

	}else{
		$query = "delete from steam_app_list where appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		//print_r($params);
		//$stmt->execute($params3);
		
		$query = "delete from steam_package_all where appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		//print_r($params);
		$stmt->execute($params3);

		$query = "delete from steam_dlc_all where dlc_appid=:appid";
		$stmt = $conn->prepare($query);
		$params3 = array(
				":appid"=>$appids
			);
		//print_r($params);
		$stmt->execute($params3);
		
		$query = "delete from steam_game_developer where appid=:appid";
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
		//print_r($params);
		$stmt->execute($params3);
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>