<?
class Ztorm{
	protected $store_id;
	protected $api_key;
	protected $server;

	public function __construct(){
		$this->store_id = "291";
		$this->api_key = "7qd0O2v8BDDx";
		$this->server = "https://api.exertisztorm.net/api/2.0/";
	}
	
	//연결확인
	public function runPing(){
		try{
			$params = "";
			$result = $this->curlPost("Ping",$params);
			
			if($result->ErrorCode=="0"){//성공
				echo "연결성공";
			}else{
				print_r($result);
			}
		}catch(Exception $e){
			echo $e->getMessage();
		}
	}
	
	//퍼블리셔 목록
	public function runGetPublishers($page){
		try{
			$params = array(
				"Offset"=>($page-1)*200,
				"Length"=>"200",
			);
			
			$result = $this->curlPost("GetPublishers",$params);

			if($result->ErrorCode=="0"){	//성공
				//$this->successLog($result,"GetPublishers");
				return $result;
			}else{
				echo $result->ErrorMsg;
				//$this->errorLog($params,"GetPublishers",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			//$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			//$ymd = date('Ymd');
			//error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}
	
	//상품목록
	public function runGetProducts($params){
		try{
			$result = $this->curlPost("GetProducts",$params);

			if($result->ErrorCode=="0"){	//성공
				//$this->successLog($result,"GetProducts");
				return $result;
			}else{
				echo $result->ErrorMsg;
				//$this->errorLog($params,"GetProducts",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			//$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			//error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	//회원가입
	public function runCreateCustomer($params){
		try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>CreateCustomer</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$customer_reponse = simplexml_load_string($result);

			if($customer_reponse->ErrorCode=="0"){	//성공
				//$this->successLog($result,"CreateCustomer");
				return $customer_reponse;
			}else{
				$this->errorLog($params,"CreateCustomer",$customer_reponse->ErrorMsg);
			}

			return $customer_reponse;

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	//회원정보수정()
	public function runUpdateCustomer($params){
		try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>UpdateCustomer</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$api_reponse = simplexml_load_string($result);

			if($api_reponse->ErrorCode=="0"){	//성공
				echo "ok";
				$this->successLog($result,"UpdateCustomer");
			}else{
				echo $api_reponse->ErrorMsg;
				$this->errorLog($params,"UpdateCustomer",$api_reponse->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	//장바구니 생성
	public function runCreateBasket($params){
	 try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>CreateBasket</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$api_reponse = simplexml_load_string($result);

			if($api_reponse->ErrorCode=="0"){	//성공
				$basket_id = $api_reponse->Value;
				
				//$this->successLog($result,"CreateBasket");
				return $basket_id;
			}else{
				echo $api_reponse->ErrorMsg;
				$this->errorLog($params,"CreateBasket",$api_reponse->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	//장바구니 생성확인
	public function runGetBasket($params){
		try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>GetBasket</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$api_reponse = simplexml_load_string($result);

			if($api_reponse->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetBasket");
				return $api_reponse;
			}else{
				echo $api_reponse->ErrorMsg;
				$this->errorLog($params,"GetBasket",$api_reponse->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	//장바구니 상품추가
	public function runAddProductToBasket($params){
	 try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>AddProductToBasket</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$api_reponse = simplexml_load_string($result);
			if($api_reponse->ErrorCode=="0"){	//성공
				//$this->successLog($result,"AddProductToBasket");
				return $api_reponse->ErrorCode;
			}else{
				echo $api_reponse->ErrorMsg;
				$this->errorLog($params,"AddProductToBasket",$api_reponse->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	//장바구니 구매 
	public function runPurchaseBasket($params){
	 try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>PurchaseBasket</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$api_reponse = simplexml_load_string($result);

			if($api_reponse->ErrorCode=="0"){	//성공
				$this->successLog($result,"PurchaseBasket");
				return $api_reponse->ErrorCode;
			}else{
				echo $api_reponse->ErrorMsg;
				$this->errorLog($params,"PurchaseBasket",$api_reponse->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}
	//장바구니 예약
	public function runBookBasket($params){
		try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>BookBasket</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$api_reponse = simplexml_load_string($result);

			if($api_reponse->ErrorCode=="0"){	//성공
				$this->successLog($result,"BookBasket");
				return $api_reponse->ErrorCode;
			}else{
				echo $api_reponse->ErrorMsg;
				$this->errorLog($params,"BookBasket",$api_reponse->ErrorMsg);
			}
		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	//ztorm 단일주문
	public function runZtormOrder($m_id,$ip,$ordno,$zt_item_id,$price,$settlekind,$publisher_code){
		$params = array(
			"RetailerCustomerID"=>$m_id,
			"CustomerIP"=>$ip
		);
		//장바구니 생성
		$basket_id = $this->runCreateBasket($params);
		//금액산출
		$ztorm_price = $this->getZtormOrderPrice($price,$settlekind,$publisher_code);

		//장바구니 상품추가
		$params = array(
			"BasketID"=>$basket_id,
			"ProductID"=>$zt_item_id,
			"ProductPriceExVAT"=>round($ztorm_price/1.1,0),
			"ProductPriceIncVAT"=>round($ztorm_price,0),
			"Currency"=>"KRW",
			"VATPercent"=>"10.000"
		);
		
		$this->runAddProductToBasket($params);
		
		//장바구니 주문
		$params = array(
			"BasketID"=>$basket_id,
			"RetailerOrderID"=>$ordno,
		);
		
		$purchase_response = $this->runPurchaseBasket($params);

		$params = array(
				"RetailerOrderID"=>$ordno,
		);

		$order_reponse = $this->runGetOrder($params);

		//주문확인
		$zt_ord_no = $order_reponse->Value->Order->Contents->OrderContent->CustomerProducts->CustomerProductID;

		return $zt_ord_no;
	}

	//ztorm 번들주문
	public function runZtormBundleOrder($m_id,$ip,$ordno,$item,$settlekind){
		$params = array(
			"RetailerCustomerID"=>$m_id,
			"CustomerIP"=>$ip
		);
		//장바구니 생성
		$basket_id = $this->runCreateBasket($params);

		foreach($item as $value){
				//번들상품구매
			$ztorm_price = $this->getZtormOrderPrice($value['price'],$settlekind,$value['pub_nm']);

			$params = array(
				"BasketID"=>$basket_id,
				"ProductID"=>$value['zt_item_id'],
				"ProductPriceExVAT"=>round($ztorm_price/1.1,0),
				"ProductPriceIncVAT"=>round($ztorm_price,0),
				"Currency"=>"KRW",
				"VATPercent"=>"10.000"
			);

			//장바구니 상품추가
			$this->runAddProductToBasket($params);
		}

		$params = array(
			"BasketID"=>$basket_id,
			"RetailerOrderID"=>$ordno,
		);

		//장바구니 주문
		$purchase_response = $this->runPurchaseBasket($params);

		return $purchase_response;
	}
	
	public function runGetOrder($params){
	 try{
			$result = $this->curlPost("GetOrder",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetOrder");
				//print_r($api_reponse);
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetOrder",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetInstallKeys($params){
	 try{
			$method = "POST";
			$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
			$xml_string.="<Method>GetInstallKeys</Method>";
			$xml_string.="<Params>";
			foreach($params as $key=>$value){
				$xml_string.= "<".$key.">".$value."</".$key.">";
			}
			$xml_string.="</Params>";
			$xml_string.="</Request>";

			$ch = curl_init($this->server."?xml=".urlencode($xml_string));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_SSLVERSION, '6');
			$result = curl_exec($ch);
			$error = curl_errno($ch);
			if ($error !== 0 ) {
				trigger_error(curl_error($ch), E_USER_ERROR);
			}
			$cinfo = curl_getinfo($ch);
			curl_close($ch);

			$api_reponse = simplexml_load_string($result);

			if($api_reponse->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetInstallKeys");
				//print_r($api_reponse);
				return $api_reponse;
			}else{
				echo $api_reponse->ErrorMsg;
				$this->errorLog($params,"GetInstallKeys",$api_reponse->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runCanCustomerProductBeRefunded($params){
	 try{
			$result = $this->curlPost("CanCustomerProductBeRefunded",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"CanCustomerProductBeRefunded");
				return $result->ErrorCode;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"CanCustomerProductBeRefunded",$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}
	
	public function runRefundCustomerProduct($params){
	 try{
			$result = $this->curlPost("RefundCustomerProduct",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"RefundCustomerProduct");
				return $result->ErrorCode;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"RefundCustomerProduct",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetRecommendedRetailPrice($params){
	 try{
			$result = $this->curlPost("GetRecommendedRetailPrice",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetRecommendedRetailPrice");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetRecommendedRetailPrice",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetProductCostEstimates($params){
	 try{
			$result = $this->curlPost("GetProductCostEstimates",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetProductCostEstimates");
				return $result->Value;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetProductCostEstimates",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetProductCostEstimate($params){
	 try{
			$result = $this->curlPost("GetProductCostEstimate",$params);

			if($result->ErrorCode=="0"){	//성공
				//$this->successLog($result,"GetProductCostEstimate");
				return $result->Value;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetProductCostEstimate",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetProduct($params){
		try{
			$result = $this->curlPost("GetProduct",$params);

			if($result->ErrorCode=="0"){	//성공
				//$this->successLog($result,"GetProduct");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetProduct",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			//error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetRecommendedRetailPrices($params){
		try{
			$result = $this->curlPost("GetRecommendedRetailPrices",$params);

			if($result->ErrorCode=="0"){	//성공
				//$this->successLog($result,"GetRecommendedRetailPrices");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetRecommendedRetailPrices",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}
	
	public function runGetDiscounts($params){
		try{
			$result = $this->curlPost("GetDiscounts",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetDiscounts");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetDiscounts",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetCustomerProducts($params){
		try{
			$result = $this->curlPost("GetCustomerProducts",$params);

			if($result->ErrorCode=="0"){	//성공
				//$this->successLog($result,"GetCustomerProducts");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetCustomerProducts",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetCustomerProduct($params){
		try{
			$result = $this->curlPost("GetCustomerProduct",$params);

			if($result->ErrorCode=="0"){	//성공
				//$this->successLog($result,"GetCustomerProduct");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetCustomerProduct",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	
	public function runGetProviderAccountLinkRequest($params){
		try{
			$result = $this->curlPost("GetProviderAccountLinkRequest",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetProviderAccountLinkRequest");
				
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetProviderAccountLinkRequest",$result->ErrorCode."/".$result->ErrorMsg);
			}

			return $result;

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetProviderAccount($params){
		try{
			$result = $this->curlPost("GetProviderAccount",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetProviderAccount");
				
			}else{
				//echo $result->ErrorMsg;
				$this->errorLog($params,"GetProviderAccount",$result->ErrorCode."/".$result->ErrorMsg);
			}

			return $result;

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetRemoteAccount($params){
		try{
			$result = $this->curlPost("GetRemoteAccount",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetRemoteAccount");
				return $result;
			}else{
				$this->errorLog($params,"GetRemoteAccount",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runGetRemoteAccountLinkRequest($params){
		try{
			$result = $this->curlPost("GetRemoteAccountLinkRequest",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"GetRemoteAccountLinkRequest");
				
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"GetRemoteAccountLinkRequest",$result->ErrorCode."/".$result->ErrorMsg);
			}

			return $result;

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runFulfillRemotePurchase($params){
		try{
			$result = $this->curlPost("FulfillRemotePurchase",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"FulfillRemotePurchase");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"FulfillRemotePurchase",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runFulfillProviderOrder($params){
		try{
			$result = $this->curlPost("FulfillProviderOrder",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"FulfillProviderOrder");
				
			}else{
				//echo $result->ErrorMsg;
				$this->errorLog($params,"FulfillProviderOrder",$result->ErrorCode."/".$result->ErrorMsg);
			}

			return $result;

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runCanCustomerPurchaseProduct($params){
		try{
			$result = $this->curlPost("CanCustomerPurchaseProduct",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"CanCustomerPurchaseProduct");
				return $result;
			}else{
				echo $result->ErrorMsg;
				$this->errorLog($params,"CanCustomerPurchaseProduct",$result->ErrorCode."/".$result->ErrorMsg);
			}

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function runTransferCustomerProduct($params){
		try{
			$result = $this->curlPost("TransferCustomerProduct",$params);

			if($result->ErrorCode=="0"){	//성공
				$this->successLog($result,"TransferCustomerProduct");
				
			}else{
				//echo $result->ErrorMsg;
				$this->errorLog($params,"TransferCustomerProduct",$result->ErrorCode."/".$result->ErrorMsg);
			}

			return $result;

		}catch(Exception $e){
			$API_ERROR_LOG = "/home/directgames/ztorm/log/ztormapi_v2_error";
			echo $e->getMessage();
			$ymd = date('Ymd');
			error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
		}
	}

	public function getZtormOrderPrice($price,$settlekind,$publisher){
		$ztPr = 0;
		if($publisher == 12 || $publisher == 14 || $publisher == "Rockstar Games" || $publisher == "2K") {	//2k, rockstar
			// 카드: (1-0.0374)
			 // 실시간계좌: (1-0.022)
			 // 휴대폰: (1-0.05)
			 // 가상계좌: (1-0.022)
			if($settlekind == "SC0010") {
					$ztPrc = (int)($price * (1-0.0374));
			}elseif($settlekind == "SC0040" || $settlekind == "SC0030" || $settlekind == "toss_bank") {
					$ztPrc = (int)($price * (1-0.022));
			}elseif($settlekind == "SC0060") {
					$ztPrc = (int)($price * (1-0.05));
			}else {
					$ztPrc = (int)($price * 0.95);
			}
		 }else{
			$ztPrc = (int)($price * 0.95);
		 }
		 return $ztPrc;
	}

	public function curlPost($method,$params){
		$xml_string ="<Request><Identify><StoreID>".$this->store_id."</StoreID><Password>".$this->api_key."</Password></Identify>";
		$xml_string.="<Method>".$method."</Method>";
		$xml_string.="<Params>";
		foreach($params as $key=>$value){
			$xml_string.= "<".$key.">".$value."</".$key.">";
		}
		$xml_string.="</Params>";
		$xml_string.="</Request>";

		$ch = curl_init($this->server."?xml=".urlencode($xml_string));
		curl_setopt($ch, CURLOPT_URL, $this->server);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_POST,true);
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 10);
		curl_setopt($ch,CURLOPT_TIMEOUT , 60);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
		curl_setopt($ch, CURLOPT_SSL_CIPHER_LIST,'ECDHE-ECDSA-AES128-SHA256,ECDHE-RSA-AES128-SHA256,ECDHE-ECDSA-AES256-SHA384');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $xml_string);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			 'Content-Type: application/xml',
			 'charset=UTF-8') 
		);
		$result = curl_exec($ch);
		$error = curl_errno($ch);
		if ($error !== 0 ) {
			trigger_error(curl_error($ch), E_USER_ERROR);
		}
		$cinfo = curl_getinfo($ch);
		curl_close($ch);

		$api_reponse = simplexml_load_string($result);
		$ch = null;
		
		$this->successLog($api_reponse,$method);
		return $api_reponse;
	}

	public function errorLog($params,$method,$error_msg){
		$API_ERROR_LOG = "/home/dgkrshop/www/log/ztorm/ztormapi_v2_error_".$method;
		$ymd = date('Ymd');
		
		$param_value = "\n {\n";
		foreach($params as $key=>$value){
			$param_value.= "	[".$key."]=>".$value."\n";
		}
		$param_value .= "\n}\n";

		error_log("[".date('Y.m.d H:i:s')."] Request ZTORM_API_ERROR [".$method."] ".$param_value.$error_msg."\n", 3, $API_ERROR_LOG.'_'.$ymd);
	}

	public function successLog($xml_result,$method){
		$API_ERROR_LOG = "/home/dgkrshop/www/log/ztorm/ztormapi_v2_success_".$method;
		$ymd = date('Ymd');

		$result_value = json_encode($xml_result);

		error_log("[".date('Y.m.d H:i:s')."] Request ZTORM_API_SUCCESS [".$method."] \n".$result_value."\n", 3, $API_ERROR_LOG.'_'.$ymd);
	}
}
?>