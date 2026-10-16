<?
class AssetJP{
	private $api_server;

	public function __construct(){
		$this->getUrl();
	}

	public function getUrl(){
		$this->api_server = "http://211.110.44.14:20080/api";

		return $this->api_server;
	}

	//Asset 등록
	public function runAssetRegister($title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd,$admin_id){
		$data = array(
			"title" => $title, 
			"productTypeCd" => $productTypeCd,
			"assetTypeCd" => $assetTypeCd,
			"platformCd" => $platformCd,
			"publisherCd" => $publisherCd
		);
		$data_string = json_encode($data);

		$asset_user = "x-asset-user: A/".$admin_id;
		$url = $this->api_server."/assets";
		$method = "POST";
		
		$result = $this->post($url,$data_string,$asset_user,$method);

		$asset_data = json_decode($result);

		return $result;
	}

	//Asset 수정
	public function runAssetModify($assetId,$title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd,$admin_id){
		$data = array(
			"title" => $title,
			"productTypeCd" => $productTypeCd,
			"assetTypeCd" => $assetTypeCd,
			"platformCd" => $platformCd,
			"publisherCd" => $publisherCd
		);
		$data_string = json_encode($data);

		$url = $this->api_server."/assets/$assetId"; 
		$asset_user = "x-asset-user: A/".$admin_id;
		$method = "PUT";
		
		$result = $this->post($url,$data_string,$asset_user,$method);
		return $result;
	}

	//Asset 삭제
	public function runAssetDelete($asset_id,$admin_id){
		$url = $this->api_server."/assets/".$asset_id;
		$asset_user = "x-asset-user: A/".$admin_id;
		$method = "DELETE";

		$result = $this->post($url,$data_string,$asset_user,$method);

		return $result;
	}

	//Asset 목록조회
	public function runAssetList($page,$size,$title,$productTypeCd,$assetTypeCd,$platformCd,$publisherCd){
		$params = array();
		if($title){
			$params[] = "&title=".$title;
		}

		if($productTypeCd){
			$params[] = "&productTypeCd=".$productTypeCd;
		}

		if($assetTypeCd){
			$params[] = "&assetTypeCd=".$assetTypeCd;
		}

		if($platformCd){
			$params[] = "&platformCd=".$platformCd;
		}

		if($publisherCd){
			$params[] = "&publisherCd=".$publisherCd;
		}

		$add_params = "";

		foreach($params as $value){
			$add_params.=$value;
		}

		$url = $this->api_server."/assets?page=$page&size=$size".$add_params;

		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);

		return $result;
	}

	//1.5. Asset 상세조회
	public function runAssetDetail($asset_id){
		$url = $this->api_server."/assets/".$asset_id;
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);
		return $result;
	}

	//Asset item 등록
	public function runAssetItemRegister($assetId,$key_data){
		$key_array = explode("\n",$key_data);

		$data = array();
		$list = array();

		foreach($key_array as $key=>$value){
			$list = preg_replace('/\r\n|\r|\n/','',$value);
			array_push($data,$list);
		}
		
		$content['content'] = $data;

		$data_string = json_encode($content);

		$url = $this->api_server."/assets/$assetId/items";        //호출대상 URL
		$asset_user = "x-asset-user: A/h2inter";
		$method = "POST";

		$result = $this->post($url,$data_string,$asset_user,$method);
		return $result;
	}

	//Assetitem 수정
	public function runAssetItemModify($item_id,$key){
		$data = array("key" => $key);
		$data_string = json_encode($data);  

		$url = $this->api_server."/items/$item_id";
		$asset_user = "x-asset-user: A/h2inter";
		$method = "PUT";

		$result = $this->post($url,$data_string,$asset_user,$method);
		return $result;
	}

	//Asset item 삭제
	public function runAssetItemDelete($item_id){
		$url = $this->api_server."/items/".$item_id;
		$asset_user = "x-asset-user: A/h2inter";
		$method = "DELETE";

		$result = $this->post($url,$data_string,$asset_user,$method);
		return $result;
	}

	//Asset에 포함된 item목록 조회
	public function runAssetItemListFilter($assetId,$page,$size){
		$url = $this->api_server."/assets/$assetId/items?page=$page&size=$size";
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);
		return $result;
	}

	public function runAssetItemListFilter2($assetId,$page,$size){
		$url = $this->api_server."/assets/$assetId/items?page=$page&size=$size";
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);
		return $result;
	}

	//Assetitem 목록조회
	public function runAssetItemList($itemId){
		$url = $this->api_server."/items/$itemId";
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);
		return $result;
	}

	//Assetitem 재고조회
	public function runAssetItemStock($assetId){
		$url = $this->api_server."/assets/$assetId/checkStock";
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);

		$asset_data = json_decode($result);

		//개별재고 업데이트

		//번들재고 업데이트
		return $asset_data->stockCount;
	}

	public function runAssetItemStockBundle($assetId){
		$url = $this->api_server."/assets/$assetId/checkStock";
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);

		$asset_data = json_decode($result);

		//개별재고 업데이트

		//번들재고 업데이트

		//print $result;
		return $result;
	}

	//Asset item dummy 등록
	public function runAssetItemDummyRegister($assetId){
		$url = $this->api_server."/assets/$assetId/items?dummy";
		$asset_user = "x-asset-user: A/h2inter";
		$method = "POST";

		$result = $this->post($url,$data_string,$asset_user,$method);
		return $result;
	}

	//reserve 등록
	public function runReserveRegister($m_id,$ordno,$asset_id){
		$url = $this->api_server."/reserves";
		$asset_user = "x-asset-user: M/$m_id";

		$data2 = array();
		$list2 = array();
		
		$po_array = array($ordno);
		foreach($po_array as $key=>$value){
			$list2['assetId'] = $asset_id;
			$list2['po'] = $value;
			array_push($data2,$list2);
		}
		
		$content['content'] = $data2;
		$data_string = json_encode($content);
		$method = "POST";

		$result = $this->post($url,$data_string,$asset_user,$method);

		$asset_data = json_decode($result);

		//키할당 처리
		return $asset_data;
	}
	
	//관리자 키발송시 사용
	public function runReserveRegisterAdmin($ordno,$assetId,$m_id){
		$url = $this->api_server."/reserves";
		$asset_user = "x-asset-user: M/$m_id";

		$data2 = array();
		$list2 = array();

		$po_array = array($ordno);
		foreach($po_array as $key=>$value){
			$list2['assetId'] = $assetId;
			$list2['po'] = $value;
			array_push($data2,$list2);
		}

		$content['content'] = $data2;
		$data_string = json_encode($content);
		$method = "POST";

		//echo $data_string;

		$result = $this->post($url,$data_string,$asset_user,$method);

		return $result;
	}

	public function runReserveGift($ordno,$assetId,$m_id){
		$url = $this->api_server."/reserves";
		$asset_user = "x-asset-user: M/$m_id";

		$data2 = array();
		$list2 = array();

		$po_array = array($ordno);
		foreach($po_array as $key=>$value){
			$list2['assetId'] = $assetId;
			$list2['po'] = $value;
			array_push($data2,$list2);
		}

		$content['content'] = $data2;
		$data_string = json_encode($content);
		$method = "POST";

		//echo $data_string;

		$result = $this->post($url,$data_string,$asset_user,$method);

		return $result;
	}

	//reserve 목록조회
	public function runReserveList($page,$size,$po,$owner,$cancelled){
		$url = $this->api_server."/reserves?page=$page&size=$size&po=$po&owner=$owner&cancelled=$cancelled";
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);
		return $result;
	}

	//reserve 취소
	public function runReserveCancel($reserve_id){
		$url = $this->api_server."/reserves/".$reserve_id."/cancel";
		$asset_user = "x-asset-user: A/h2inter";
		$method = "PUT";

		$result = $this->post($url,$data_string,$asset_user,$method);
		//print $result;

		return $result;
	}

	//reserve 조회(키활성화) - 최초1회 실행은 키활성화
	public function runReserve($reserve_id,$m_id){
		$url = $this->api_server."/reserves/$reserve_id";
		$asset_user = "x-asset-user: M/$m_id";
		$method = "GET";

		$result =  $this->get($url,$asset_user,$method);

		$asset_data = json_decode($result);

		return $asset_data;
	}

	//관리자 대행 강제귀속
	public function runReserveAdminMember($reserve_id,$m_id){
		$url = $this->api_server."/reserves/$reserve_id";
		$asset_user = "x-asset-user: M/$m_id";
		$method = "GET";

		$result =  $this->get($url,$asset_user,$method);

		$asset_data = json_decode($result);

		return $asset_data;
	}
	//reserve 조회 - 관리자
	public function runReserveAdmin($reserve_id){
		$url = $this->api_server."/reserves/$reserve_id";
		$asset_user = "x-asset-user: A/h2inter";
		$method = "GET";

		$result = $this->get($url,$asset_user,$method);

		$asset_data = json_decode($result);

		//print $result;
		return $asset_data;
	}

	//품절임박 상품 조회
	public function runAssetSoldOut($thr){
		$url = $this->api_server."/assets?stock&thr=$thr";
		$asset_user = "x-asset-user: A/h2inter";
		$method = "GET";

		$result = $this->get($url,$asset_user,$method);

		$asset_data = json_decode($result);
	
		return $asset_data;
	}

	//일정재고 수량 이하 asset_id 조회
	public function runAssetSoldOutBatch($thr){
		$url = $this->api_server."/assets?stock&thr=$thr";
		$asset_user = "x-asset-user: A/h2inter";
		$method = "GET";

		$result = $this->get($url,$asset_user,$method);

		$asset_data = json_decode($result);
		return $asset_data;
	}

	//재고확인
	public function runAssetStock($assetId){
		$url = $this->api_server."/assets/".$assetId."/checkStock";
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);

		$asset_data = json_decode($result);
		//print $result;
		(int)$stock = $asset_data->stockCount;

		return $stock;
	}

	//4.4. Code 목록 조회
	public function runAssetCodeList($groupid){
		$url = $this->api_server."/codes?groupId=".$groupid;
		$asset_user = "x-asset-user: A/h2inter";
		$result = $this->get($url,$asset_user);

		return $result;
	}

	//4.1. Code 등록
	public function runAssetCodeRegister($groupId,$name){
		$data = array("groupId" => $groupId, "name" => $name);                                                                    
		$data_string = json_encode($data);

		$url = $this->api_server."/codes";
		$asset_user = "x-asset-user: A/h2inter";
		$method = "POST";
		$result = $this->post($url,$data_string,$asset_user,$method);

		//$asset_data = json_decode($result);

		return $result;
	}

	//4.2. Code 수정
	public function runAssetCodeModify($codeid,$name){
		$data = array("name" => $name);                                                                    
		$data_string = json_encode($data);

		$url = $this->api_server."/codes/".$codeid;
		$asset_user = "x-asset-user: A/h2inter";
		$method = "PUT";
		$result = $this->post($url,$data_string,$asset_user,$method);

		//$asset_data = json_decode($result);

		return $result;
	}

	//4.3. Code 삭제
	public function runAssetCodeDelete($codeid){
		$data_string="";

		$url = $this->api_server."/codes/".$codeid;
		$asset_user = "x-asset-user: A/h2inter";
		$method = "DELETE";
		$result = $this->post($url,$data_string,$asset_user,$method);

		//$asset_data = json_decode($result);

		return $result;
	}

	public function get($url,$asset_user){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 10);
		curl_setopt($ch, CURLOPT_TIMEOUT, 60);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			 'charset=UTF-8',
			 $asset_user
			)                                                                       
		); 

		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$body = substr($result, $headerSize);
		$resObj = json_decode($body);

		curl_close($ch);

		if($httpCode=="200"){	//성공
			return $result;
			//echo $resObj->totalPages."<br/>";
			//echo $resObj->totalElements."<br/>";
			//error_log("[".date('Y.m.d H:i:s')."] ".$result."\n", 3, "/home/directgames/log/assets/assets_log_".date('Y-m-d'));
		}else{ //실패
			//print $result;
			//$error_data = $httpCode." | ".$x_asset_uuid." | ".$resObj->code." | ".$resObj->message." | ".$resObj->path ;
			//error_log("[".date('Y.m.d H:i:s')."] ".$result."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
		}
		//return $this->data;
	}

	public function post( $url, $data_string,$asset_user,$method){
		$ch = curl_init(); //파라미터:url -선택사항

		curl_setopt($ch,CURLOPT_URL,$url); //여기선 url을 변수로
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 10);
		curl_setopt($ch,CURLOPT_TIMEOUT , 60);
		curl_setopt($ch,CURLOPT_HTTPHEADER, array(
			 'Content-Type: application/json',
			 'charset=UTF-8',
			 $asset_user)
		);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		curl_setopt($ch,CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$header = substr($result, 0, $headerSize);
		$headerList = explode("\r\n", $header);

		foreach($headerList as $key=>$h) {
			if(preg_match("/^x-asset-uuid: (\\d+)/", $h, $matches)) {
				 $x_asset_uuid = $h;
				 break;
			}
		}
		$body = substr($result, $headerSize);
		$resObj = json_decode($body);

		curl_close($ch);
		
		if($httpCode=="200"){	//성공
			//error_log("[".date('Y.m.d H:i:s')."] ".$result."\n", 3, "/home/dgkrshop/www/log/asset/assetLog_".date('Y-m-d'));
		}else{ //실패
			//print $body;
			//error_log("\n[".date('Y.m.d H:i:s')."] request | ". $_SESSION['user']['m_id']."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
			//error_log("\n[".date('Y.m.d H:i:s')."] request | ". $data_string."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
			//error_log("\n[".date('Y.m.d H:i:s')."] response | ". $result."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
			error_log("\n[".date('Y.m.d H:i:s')."] url | ". $url."\n", 3, "/home/dgkrshop/www/log/asset/assets_error_log_".date('Y-m-d'));
			error_log("\n[".date('Y.m.d H:i:s')."] request | ". $data_string."\n", 3, "/home/dgkrshop/www/log/asset/assets_error_log_".date('Y-m-d'));
			error_log("\n[".date('Y.m.d H:i:s')."] response | ". $result."\n", 3, "/home/dgkrshop/www/log/asset/assets_error_log_".date('Y-m-d'));
			error_log("\n[".date('Y.m.d H:i:s')."] httpCode | ". $httpCode."\n", 3, "/home/dgkrshop/www/log/asset/assets_error_log_".date('Y-m-d'));
		}

		return $body;
	}
}
?>