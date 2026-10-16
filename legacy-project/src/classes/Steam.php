<?
class Steam{
		
	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}
	
	public function getSteamAppInfo($appid,$language){
		if($language){
			$l = $language;
		}else{
			$l = "koreana";
		}

		$ch = curl_init();
		$url = "https://store.steampowered.com/api/appdetails?l=".$l ."&appids=".$appid;
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
		
		$params = array();
		
		foreach($data as $key=>$value){
			foreach($value as $sub_key=>$sub_value){
				if($sub_key=="data"){
					$params["appid"] = $sub_value->steam_appid;
					$params["name"] = $sub_value->name;
					$params["type"] = $sub_value->type;
					$params["is_free"] = $sub_value->is_free;
					$params["controller_support"] = $sub_value->controller_support;
					$params['fullgame'] = $sub_value->fullgame->appid;
					$params["header_image"] = $sub_value->header_image;
					$params["capsule_image"] = $sub_value->capsule_image;
					$params["capsule_imagev5"] = $sub_value->capsule_imagev5;
					$params["website"] = $sub_value->website;
					$params["about_the_game"] = $sub_value->about_the_game;
					$params["supported_languages"] = $sub_value->supported_languages;
					$params["minimum"] = $sub_value->pc_requirements->minimum;
					$params["recommended"] = $sub_value->pc_requirements->recommended;
					$params["short_description"] = $sub_value->short_description;
					$params["detailed_description"] = $sub_value->detailed_description;
					if($sub_value->legal_notice){
						$params["legal_notice"] = $sub_value->legal_notice;
					}else{
						$params["legal_notice"] ="";
					}
					
					$params["consumer_price"] = $sub_value->price_overview->initial;
					$params["price"] = $sub_value->price_overview->final;
					$params["discount_percent"] = $sub_value->price_overview->discount_percent;

					$params["drm_notice"] = $sub_value->drm_notice;
					$params["ext_user_account_notice"] = $sub_value->ext_user_account_notice;
					$params["metacritic_score"] = $sub_value->metacritic->score;
					$params["metacritic_url"] = $sub_value->metacritic->url;
					
					if($sub_value->recommendations->total==""){
						$params["recommendations"] = '0';
					}else{
						$params["recommendations"] = $sub_value->recommendations->total;
					}
					
					$params["supported_languages"] = $sub_value->supported_languages;
					$params["supported_languages"] = str_replace("*음성이 지원되는 언어",'',strip_tags($params["supported_languages"]));
					$steam_support_language = explode(",",$params["supported_languages"]);

					foreach($steam_support_language as $language){
						//echo $language."<br/>";
						if(strpos($language, "한국어")!== false){
							//echo "인터페이스/자막";
							$params['spoken_korean'] ="N";
							$params['interface_korean'] = "Y";
						}

						if(strpos($language, "한국어*")!== false){
							//echo "인터페이스/자막 , 음성";
							$params['spoken_korean'] ="Y";
							$params['interface_korean'] = "Y";
						}
					}
					
					$params['category'] = $this->getCategory($sub_value->steam_appid,$sub_value->categories);
					$params['developer'] = $this->getDevelopers($sub_value->steam_appid,$sub_value->developers);
					$params['publisher'] = $this->getPublishers($sub_value->publishers);
					$params['genre'] = $this->getGenre($sub_value->steam_appid,$sub_value->genres);
					
					$params["coming_soon"] = $sub_value->release_date->coming_soon;
					$params["release_date"] = $this->getReleasedate($sub_value->release_date);
					
					if($sub_value->type=="game"){
						$this->setDLCList($sub_value->steam_appid,$sub_value->dlc);
					}
					
					$this->setPackageList($sub_value->steam_appid,$sub_value->package_groups['0']);
				}
			}
		}
		
		return $params;
	}
	
	public function setDLCList($appid,$dlc_list){
		foreach($dlc_list as $sub_key=>$sub_value){
			$query = "insert into steam_dlc set game_appid=:game_appid,dlc_appid=:dlc_appid ON DUPLICATE KEY UPDATE dlc_appid=:dlc_appid";
			$stmt = $this->_db->prepare($query);
			$dlc_params = array(
				":game_appid"=>$appid,
				":dlc_appid"=>$sub_value,
			);
			$stmt->execute($dlc_params);
		//	print_r($dlc_params);
		}
	}
	
	public function setPackageList($appid,$package_list){
		foreach($package_list->subs as $sub_key=>$sub_value){
			$query = "insert into steam_package set appid=:appid,packageid=:packageid ON DUPLICATE KEY UPDATE packageid=:packageid";
			$stmt = $this->_db->prepare($query);
			$package_params = array(
				":appid"=>$appid,
				":packageid"=>$sub_value->packageid,
			);
			$stmt->execute($package_params);
			//print_r($package_params);
		}
	}
	
	public function getDevelopers($appid,$developers){
		if(is_array($developers)){
			$params["developer"]=implode(", ",$developers);
		}else{
			if(is_array($developers)){
				$params["developer"] = $developers['0'];
			}else{
				$params["developer"] = "";
			}
		}
		
		foreach($developers as $sub_key=>$sub_value){
			$query = "insert into steam_game_developer set appid=:appid,developer_id=:developer_id,developer_name=:developer_name ON DUPLICATE KEY UPDATE developer_name=:developer_name";
			$stmt =  $this->_db->prepare($query);
			$developers_params = array(
				":appid"=>$appid,
				":developer_id"=>$sub_key,
				":developer_name"=>$sub_value
			);
			$stmt->execute($developers_params);
		}

		
		return $params["developer"];
	}
	
	public function getPublishers($publishers){
		if(is_array($publishers)){
			$params["publisher"]=implode(", ",$publishers);
		}else{
			if($publishers['0']==""){
				$params["publisher"] = "";
			}else{
				$params["publisher"] = $publishers['0'];
			}
			
		}
		
		return $params["publisher"];
	}
	
	public function getCategory($appid,$categories){
		$tmp = array();
		foreach($categories as $category){
			$tmp[]=$category->description;
			$query = "insert into steam_game_category set appid=:appid,category_id=:category_id,category_name=:category_name ON DUPLICATE KEY UPDATE category_name=:category_name";
			$stmt = $this->_db->prepare($query);
			$params = array(
				":appid"=>$appid,
				":category_id"=>$category->id,
				":category_name"=>$category->description
			);
			$stmt->execute($params);
		}
		
		if(count($tmp)>1){
			$params["category"]=implode(", ",$tmp);
		}else{
			$params["category"] = $tmp['0'];
		}
		
		return $params["category"];
	}
	
	public function getGenre($appid,$genres){
		$tmp = array();
		foreach($genres as $genre){
			$tmp[]=$genre->description;
			$query = "insert into steam_game_genre set appid=:appid,genres_id=:genres_id,genres_name=:genres_name ON DUPLICATE KEY UPDATE genres_name=:genres_name";
			$stmt =$this->_db->prepare($query);
			$params = array(
				":appid"=>$appid,
				":genres_id"=>$genre->id,
				":genres_name"=>$genre->description,
			);
			$stmt->execute($params);
		}
		
		if(count($tmp)>1){
			$params["genre"]=implode(", ",$tmp);
		}else{
			$params["genre"] = $tmp['0'];
		}
		
		return $params["genre"];
	}
	
	public function getReleasedate($release_date){
		if($release_date->coming_soon=="1"){
			if(strpos($release_date->date,"분기")){
				$tmp =str_replace(" ","0",str_replace("년","-", str_replace("분기","",$release_date->date)));
				$tmp_month = date('n',strtotime($tmp));
				switch($tmp_month){
					case "1":
						$params["release_date"] = substr($tmp,0,4)."-03-31";
					break;
					case "2":
						$params["release_date"] = substr($tmp,0,4)."-06-30";
					break;
					case "3":
						$params["release_date"] = substr($tmp,0,4)."-09-30";
					break;
					case "4":
						$params["release_date"] = substr($tmp,0,4)."-12-31";
					break;
				}
			}else{
				switch($release_date->date){
					case "발표 예정":case "발표-예정":
						$params["release_date"]="";
					break;
					case "출시 예정 게임":case "출시-예정-게임":case "출시 예정":
						$params["release_date"]="";
					break;
					default:
						$tmp = str_replace(" ","",str_replace("년","-",str_replace("월","-",str_replace("일","",$release_date->date))));
						
						if(strlen($tmp)=="5"){
							$params["release_date"] = substr($tmp,0,4)."-12-31";
						}elseif(strlen($tmp)=="7"){
							$params["release_date"] = date("Y-m-d",strtotime(substr($tmp,0,7)."31"));
						}else{
							if($release_date->date<>"1970-01-01"){
								$params["release_date"] = date("Y-m-d",strtotime("+0days", strtotime($tmp)));
							}else{
								$params["release_date"] ="";
							}
						}
					break;
				}
			}
		}else{
			if($release_date->date<>"1970-01-01"){
				$tmp = str_replace(" ","",str_replace("년","-",str_replace("월","-",str_replace("일","",$release_date->date))));
				$params["release_date"] =date("Y-m-d",strtotime("+0days", strtotime($tmp)));
			}else{
				$params["release_date"] ="";
			}
		}
		
		return $params["release_date"];
	}
	
	//스팀 app 기본가격
	public function getSteamAppPrice($appid){
		$query = "select * from steam_game where steam_appid=:steam_appid";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':steam_appid'=>$appid
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		return $data;
	}
	
	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
	}
}
?>