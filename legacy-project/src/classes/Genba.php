<?
class Genba{
	public $customerAccountNumber;
	public $certificateLocation;
	public $certificatePassword;
	public $resourceID;
	public $identifierUrl;
	public $baseUrl;
	public $pingEndpoint;
	public $tenantID;
	public $authUrl;
	public $audience;
	public $accessToken;
	public $x5t;
	private $mode;
	private $api_version;
	public $ContinuationToken;
	private $api_key;

	//클래스 생성자
	public function __construct($mode){
		$this -> mode = $mode;
		// Can be found in 'My Account' in the onboarding portal
		$this->customerAccountNumber = "71e57b96-4eb7-4ef3-bd0a-f7fcd6e65444";

		// ****************************************************************************************************
		// Sandbox configuration
		// ****************************************************************************************************

		if($this -> mode=="TEST"){
			$this->baseUrl = 'https://sandbox.genbadigital.io';

			// Upload your certificate in the onboarding portal
			$this->certificateLocation = "/home/dgkrshop/www/certificate/genba/genba.pfx";
			$this->certificatePassword = "";

			$this->resourceID = "77f1a141-003b-4b0e-b5e6-198220417ce9";

			$this->x5t = "Xa71ftYAdv50+/OcvMEs8LL9rAg=";

			$this->api_version ="v3-1";

			$this->pingEndpoint = $this->baseUrl . '/api/'.$this->api_version.'/ping';

			
		}else{
			//$this->baseUrl = 'https://api.genbadigital.io';
			$this->baseUrl = 'https://etailer-api.genbadigital.io';

			$this->certificateLocation = "/home/dgkrshop/www/certificate/genba/genba.pfx";
			$this->certificatePassword = "";

			$this->resourceID = "3d9998dc-c049-4108-b664-f6cc883f77e5";

			$this->x5t = "Xa71ftYAdv50+/OcvMEs8LL9rAg=";

			//$this->api_version ="v3-13";
			$this->api_version ="v4-0";

			$this->pingEndpoint = $this->baseUrl . '/api/'.$this->api_version.'/ping';
			
			$this->api_key = "5e73e270b1f34521c146d44f05bfde862b3c7f1145a6aaf4924629fe043c5bbb";
		}

		$this->identifierUrl = "https://aad-snd.genbadigital.io/" . $this->customerAccountNumber;

		// ****************************************************************************************************
		// Production configuration
		// ****************************************************************************************************

		//$resourceID = "77f1a141-003b-4b0e-b5e6-198220417ce9";
		//$identifierUrl = "https://aad.genbadigital.io/" . $customerAccountNumber;
		//$genbaConfig->baseUrl = 'https://api.genbadigital.io';
		//$genbaConfig->pingEndpoint = $genbaConfig->baseUrl . '/api/v3-0/ping';

		// ****************************************************************************************************
		// Universal configuration
		// ****************************************************************************************************

		$this->tenantID = "aad.genbadigital.io";
		$this->authUrl = "https://login.microsoftonline.com/" . $this->tenantID;
		$this->audience = $this->authUrl . "/oauth2/token";
	}

	public static $timestamp = null;

    public static $supported_algs = array(
        'HS256' => array('hash_hmac', 'SHA256'),
        'HS512' => array('hash_hmac', 'SHA512'),
        'HS384' => array('hash_hmac', 'SHA384'),
        'RS256' => array('openssl', 'SHA256'),
        'RS384' => array('openssl', 'SHA384'),
        'RS512' => array('openssl', 'SHA512'),
    );

	//인증서 읽기
	public function ReadCertificate(){
		$data = file_get_contents($this->certificateLocation,true);
		$success = openssl_pkcs12_read($data, $certs, $this->certificatePassword);
		//$error = openssl_error_string();
		//echo $error;
		if ($success == false) {
			throw new Exception('Unable to read certificate');
		}

		$cert = $certs['cert'];
		$pkey = $certs['pkey'];

		$certinfo = openssl_x509_parse($cert);

		$validFrom = $certinfo['validFrom_time_t'];
		$validTo = $certinfo['validTo_time_t'];
		//$thumbprintRaw = openssl_x509_fingerprint($cert, 'sha1', true);
		//$thumbprint = base64_encode($thumbprintRaw);
		$resource = openssl_x509_read($cert);

		$fingerprint = null;
		$output = null;

		$result = openssl_x509_export($resource, $output);

		if($result !== false) {
			$output = str_replace('-----BEGIN CERTIFICATE-----', '', $output);
			$output = str_replace('-----END CERTIFICATE-----', '', $output);
			
			$output = base64_decode($output);

			$fingerprint = sha1($output);
		}

		$return_data = array(
			'validFrom'=>$validFrom,
			'validTo'=>$validTo,
			'thumbprint'=>$fingerprint,
			'pkey'=>$pkey,
		);

		//print_r($return_data);
		return $return_data;
	}

	//jwt 생성
	public function CreateJwt($validFrom, $validTo, $pkey){
		$header = array(
			"alg" => "RS256",
			"typ" => "JWT",
			"x5t" =>$this->x5t
		);

		$payLoad = array(
			"aud" => $this->audience,
			"exp" => $validTo,
			"iss" => $this->identifierUrl,
			"jti" => $this->NewGuid(),
			"nbf" => $validFrom,
			"sub" => $this->identifierUrl
		);

		$jwt = $this->encode($payLoad, $pkey, 'RS256', null, $header);
		return $jwt;
	}

	//jwt 인코딩함수
	/**
     * Converts and signs a PHP object or array into a JWT string.
     *
     * @param object|array  $payload    PHP object or array
     * @param string        $key        The secret key.
     *                                  If the algorithm used is asymmetric, this is the private key
     * @param string        $alg        The signing algorithm.
     *                                  Supported algorithms are 'HS256', 'HS384', 'HS512' and 'RS256'
     * @param mixed         $keyId
     * @param array         $head       An array with header elements to attach
     *
     * @return string A signed JWT
     *
     * @uses jsonEncode
     * @uses urlsafeB64Encode
     */
	 public static function encode($payload, $key, $alg = 'HS256', $keyId = null, $head = null){
		$header = array('typ' => 'JWT', 'alg' => $alg);
		 if ($keyId !== null) {
			$header['kid'] = $keyId;
		}
		if ( isset($head) && is_array($head) ) {
			$header = array_merge($head, $header);
		}

		$segments = array();
		$segments[] = static::urlsafeB64Encode(static::jsonEncode($header));
		$segments[] = static::urlsafeB64Encode(static::jsonEncode($payload));
		$signing_input = implode('.', $segments);
		$signature = static::sign($signing_input, $key, $alg);
		$segments[] = static::urlsafeB64Encode($signature);

		return implode('.', $segments);
	}

	//인증서 서명
	 /**
     * Sign a string with a given key and algorithm.
     *
     * @param string            $msg    The message to sign
     * @param string|resource   $key    The secret key
     * @param string            $alg    The signing algorithm.
     *                                  Supported algorithms are 'HS256', 'HS384', 'HS512' and 'RS256'
     *
     * @return string An encrypted message
     *
     * @throws DomainException Unsupported algorithm was specified
     */
	 public static function sign($msg, $key, $alg = 'HS256'){

        if (empty(static::$supported_algs[$alg])) {
            throw new DomainException('Algorithm not supported');
        }
        list($function, $algorithm) = static::$supported_algs[$alg];

        switch($function) {
            case 'hash_hmac':
                return hash_hmac($algorithm, $msg, $key, true);
            case 'openssl':
                $signature = '';

                $success = openssl_sign($msg, $signature, $key, $algorithm);
                if (!$success) {
                    throw new DomainException("OpenSSL unable to sign data");
                } else {
                    return $signature;
                }
        }
    }

	public function GetToken($jwt) {
		$postdata = "resource=" . $this->resourceID;
		$postdata .= "&client_id=" . $this->identifierUrl;
		$postdata .= '&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer';
		$postdata .= "&grant_type=client_credentials";
		$postdata .= "&client_assertion=" . $jwt;

		$tokenRequest = curl_init();
		curl_setopt($tokenRequest, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($tokenRequest, CURLOPT_URL, $this->audience);
		curl_setopt($tokenRequest, CURLOPT_POSTFIELDS, $postdata);
		curl_setopt($tokenRequest, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($tokenRequest, CURLOPT_SSLVERSION, '6');

		$tokenResponse = curl_exec($tokenRequest);
		//echo $tokenResponse;
		//echo curl_error($tokenRequest);
		curl_close($tokenRequest);
		
		$data = json_decode($tokenResponse);
		$accessToken = $data->access_token;
		$expires_on = $data->expires_on;
		$_SESSION['genba']['accessToken'] = $accessToken;
		$_SESSION['genba']['expires_on'] = $expires_on;
		$_SESSION['genba']['data']=$data;
		//print_r($data);
		return $accessToken;
	}

	public function runGenbaPingAsync(){
		$url = $this->pingEndpoint;
		
		//echo $url;
		
		//if($_SESSION['genba']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['genba']['accessToken'] = $this->GetToken($jwt);
		//}

		$header_type = "Bearer";

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);  
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 10);
		curl_setopt($ch,CURLOPT_TIMEOUT , 60);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
			 'Content-Type: application/json',
			 'x-api-key: '.$this->api_key
			)                                                                       
		);
		$result = curl_exec($ch);
		$error = curl_errno($ch);
		if ($error !== 0 ) {
			trigger_error(curl_error($ch), E_USER_ERROR);
		}
		$cinfo = curl_getinfo($ch);
		curl_close($ch);
		
		print_r($result);

		$_SESSION['genba']['TokenValidFrom'] = $response->TokenValidFrom;
		$_SESSION['genba']['TokenValidTo'] = $response->TokenValidTo;

		return json_decode($result);
	}

	//상품목록조회
	public function runGenbaGetProductsAsync($includeMeta,$productid,$fromDate){
		$path = $this->baseUrl ."/api/".$this->api_version."/products";
		$content_type = "application/json";
		$method = "GET";
		$group="Products";

		if($this -> mode=="TEST"){
			$action="Products_V3_1__GetProductsAsync";
		}else{
			$action="Products_v4_0__GetProductsAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$this->GetToken($jwt);
		//}
		
		//$_SESSION['genba']['ContinuationToken'] = "";
		if($_SESSION['genba']['ContinuationToken_product']){
			$ContinuationToken = $_SESSION['genba']['ContinuationToken_product'];
		}else{
			$ContinuationToken = "";
		}

		$params = "";
		$data_string = array(
			"continuationtoken"=>$ContinuationToken,
			"includeMeta"=>$includeMeta,
			"fromDate"=>$fromDate,
			"deleted"=>"false",
			"countryCode"=>"KR",
			"productid"=>$productid,
			"etailerid"=>''
		);
		

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		$_SESSION['genba']['ContinuationToken_product'] = $response->ContinuationToken;

		return $response;
	}

	//상품개별조회
	public function runGenbaGetProductAsync($sku){
		$path = $this->baseUrl ."/api/".$this->api_version."/products/".$sku;
		$content_type = "application/json";
		$method = "GET";
		$group="Products";

		if($this -> mode=="TEST"){
			$action="Products_V3_1__GetProductAsync";
		}else{
			$action="Products_v4_0__GetProductAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$this->GetToken($jwt);
		//}

		$params = "";
		$data_string = array(
			"etailerid"=>''
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		return $response;
	}

	//가격조회
	public function runGenbaGetPricesAsync($sku,$productid){
		$path = $this->baseUrl."/api/".$this->api_version."/prices";
		$content_type = "application/json";
		$method = "GET";
		$group="Prices";

		if($this -> mode=="TEST"){
			$action="Prices_V3_1__GetPricesAsync";
		}else{
			$action="Prices_v4_0__GetPricesAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			//$certificateResult = $this->ReadCertificate();

			//$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			//$this->GetToken($jwt);
		//}
		
		if($_SESSION['genba']['ContinuationToken_price']){
			$ContinuationToken = $_SESSION['genba']['ContinuationToken_price'];
		}else{
			$ContinuationToken = "";
		}

		$params = "";
		$data_string = array(
			"continuationtoken"=>$ContinuationToken,
			"sku"=>$sku,
			"productid"=>$productid,
			"etailerid"=>''
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		//print_r($response);

		$_SESSION['genba']['ContinuationToken_price'] = $response->ContinuationToken;

		return $response;
	}

	//프로모션조회
	public function runGenbaGetPromotionsAsync($fromDate,$toDate){
		$path = $this->baseUrl ."/api/".$this->api_version."/promotions";
		$content_type = "application/json";
		$method = "GET";
		$group="Promotions";

		if($this -> mode=="TEST"){
			$action="Promotions_V3_1__GetPromotionsAsync";
		}else{
			$action="Promotions_v4_0__GetPromotionsAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			//$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			//$this->GetToken($jwt);
		//}

		if($_SESSION['genba']['ContinuationToken']){
			$ContinuationToken = $_SESSION['genba']['ContinuationToken'];
		}else{
			$ContinuationToken = "";
		}

		$params = "";
		$data_string = array(
			"continuationtoken"=>$ContinuationToken,
			"fromDate"=>$fromDate,
			"toDate"=>$toDate
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		$_SESSION['genba']['ContinuationToken'] = $response->ContinuationToken;

		return $response;
	}

	//주문하기
	public function runGenbaPlaceOrderAsync($ReservationID,$sku,$price,$ppr,$ip){
		$path = $this->baseUrl ."/api/".$this->api_version."/orders";
		$content_type = "application/json";
		$method = "POST";
		$group="Orders";

		if($this -> mode=="TEST"){
			$action="Orders_V3_1__PlaceOrderAsync";
		}else{
			$action="Orders_v4_0__PlaceOrderAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
		$certificateResult = $this->ReadCertificate();

		$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
		$this->GetToken($jwt);
		//}

		if($ReservationID){
			$data = array(
				"ClientTransactionID"=>$this->NewGuid(),
				"ReservationID"=>$ReservationID
			);
		}else{
			$data = array(
				"ClientTransactionID"=>$this->NewGuid(),
				"Properties"=> array(
						"Sku"=>$sku,
						"BuyingPrice"=>array(
							"Amount"=>$this->getTotalWsp($price,$ppr),
							"CurrencyCode"=>"KRW",
						),
						"SellingPrice"=>array(
							"NetAmount"=>$this->getNetAmount($price),
							"GrossAmount"=>$price,
							"CurrencyCode"=>"KRW",
						),
						"ConsumerIP"=>$ip,
						"CountryCode"=>"KR",
						"EtailerID"=> null,
						"SerialGUID"=>null
					)
			);
		}

		$url = $path;
		$data_string = json_encode($data);

		$response = $this->post($url,$data_string,$content_type,$method,$action,$timeout=90,$group);

		return $response;
	}

   //환불하기
	public function runGenbaPerformOrderActionAsync($orderid){
		$path = $this->baseUrl ."/api/".$this->api_version."/orders";
		$content_type = "application/json";
		$method = "POST";
		$group = "Orders";

		if($this -> mode=="TEST"){
			$action="Orders_V3_1__PerformOrderActionAsync";
		}else{
			$action="Orders_v4_0__PerformOrderActionAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$this->GetToken($jwt);
		//}

		/* ReturnReasonCode 값 정의
		1: [PaymentFraud] : Fraudulent activity recorded on the order
		2: [Cancellation] : Order has been cancelled by customer or Etailer
		3: [Operations] : Genba Internal use
		4: [Error] : An error has occurred on an order (주문오류발생)
		5: [Refund] : Refund requested by customer (고객요청으로 환불)
		6: [BackOrderNotWanted] : Customer does not want to wait for a backorder (고객이 Back Order를 기다리기를 원치않음)
		7: [FraudulentKeys] : Keys on the order are subject to fraudulent activity
		*/

		$data = array(
			"Action"=>"Return",
			"Reason"=>"Customer requests cancellation",
			"ReturnReasonCode"=>"5"
		);

		$url = $path."/".$orderid;
		$data_string = json_encode($data);

		$response = $this->post($url,$data_string,$content_type,$method,$action,$timeout=60,$group);

		return $response;
	}

	//주문조회
	public function runGenbaGetOrderAsync($orderid){
		$path = $this->baseUrl ."/api/".$this->api_version."/orders";
		$content_type = "application/json";
		$method = "GET";
		$group = "Orders";

		if($this -> mode=="TEST"){
			$action="Orders_V3_1__GetOrderAsync";
		}else{
			$action="Orders_v4_0__GetOrderAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$this->GetToken($jwt);
		//}

		
		$url = $path."/".$orderid;

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		return $response;
	}

	//특정 CTID 주문조회
	public function runGenbaGetOrderByCtidAsync($ctid){
		$path = $this->baseUrl."/api/".$this->api_version."/orders/ctid";
		$content_type = "application/json";
		$method = "GET";
		$group = "Orders";

		if($this -> mode=="TEST"){
			$action="Orders_V3_1__GetOrderByCtidAsync";
		}else{
			$action="Orders_v4_0__GetOrderByCtidAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['genba']['accessToken'] = $this->GetToken($jwt);
		//}

		
		$url = $path."/".$ctid;

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		return $response;
	}

	//예약
	public function runGenbaPlaceReservationAsync($sku,$price,$ppr,$ip){
		$path = $this->baseUrl ."/api/".$this->api_version."/reservations";
		$content_type = "application/json";
		$method = "POST";
		$group="Reservations";

		if($this -> mode=="TEST"){
			$action="Reservations_V3_1__PlaceReservationAsync";
		}else{
			$action="Reservations_v4_0__PlaceReservationAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['genba']['accessToken'] = $this->GetToken($jwt);
		//}


		$data = array(
			"ClientTransactionID"=>$this->NewGuid(),
			"Properties"=> array(
				"Sku"=>$sku,
				"BuyingPrice"=>array(
					"Amount"=>$this->getTotalWsp($price,$ppr),
					"CurrencyCode"=>"KRW",
				),
				"SellingPrice"=>array(
					"NetAmount"=>$this->getNetAmount($price),
					"GrossAmount"=>$price,
					"CurrencyCode"=>"KRW",
				),
				"ConsumerIP"=>$ip,
				"CountryCode"=>"KR",
				"EtailerID"=>null,
			)
		);
		
		$url = $path;
		$data_string = json_encode($data);

		$response = $this->post($url,$data_string,$content_type,$method,$action,$timeout=90,$group);
		
		//print_r($response);

		return $response;
	}

	//예약조회
	public function runGenbaGetReservation($reservationid){
		$path = $this->baseUrl ."/api/".$this->api_version."/reservations";
		$content_type = "application/json";
		$method = "GET";
		$group="Reservations";

		if($this -> mode=="TEST"){
			$action="Reservations_V3_1__GetReservation";
		}else{
			$action="Reservations_v4_0__GetReservation";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['genba']['accessToken'] = $this->GetToken($jwt);
		//}
		
		$url = $path."/".$reservationid;

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		return $response;
	}

	public function getNetAmount($sales_price){
		$net_amount = round($sales_price/1.1,0);
		return $net_amount;
	}

	public function getTotalWsp($sales_price,$ppr){
		$net_amount = $this->getNetAmount($sales_price);
		//$revenue_share = $net_amount - $ppr;
		//$genba_margin = $revenue_share * 0.23;

		//$total_wsp = $ppr + $genba_margin;
		$total_wsp = $ppr;
		return $total_wsp;
	}

	//재고확인
	public function runGetProductStockStatusAsync($sku){
		$path = $this->baseUrl ."/api/".$this->api_version."/productstock/".$sku;
		$content_type = "application/json";
		$method = "GET";
		$group="Products";

		if($this -> mode=="TEST"){
			$action="Products_v3_7__GetProductStockStatusAsync";
		}else{
			$action="Products_v4_0__GetProductStockStatusAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$this->GetToken($jwt);
		//}

		$params = "";
		$data_string = array(
			"etailerid"=>''
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		return $response;
	}

	//PreLive요청
	public function runSubmitPreliveApprovalRequestAsync($sku,$url){
		$path = $this->baseUrl ."/api/".$this->api_version."/products/submitpreliveapprovalrequest";
		$content_type = "application/json";
		$method = "POST";
		$group="Products";

		if($this -> mode=="TEST"){
			$action="Products_v3_10__SubmitPreliveApprovalRequestAsync";
		}else{
			$action="Products_v4_0__SubmitPreliveApprovalRequestAsync";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$this->GetToken($jwt);
		//}

		$data = array(
			"ClientTransactionID"=>$this->NewGuid(),
			"Sku"=>$sku,
			"Url"=>$url
		);
		
		$url = $path;
		$data_string = json_encode($data);

		$response = $this->post($url,$data_string,$content_type,$method,$action,$timeout=60,$group);

		return $response;
	}


	//Keyless Product Check
	public function runGetCheckPurchasability($sku,$epicAccountId){
		$path = $this->baseUrl ."/api/".$this->api_version."/keyless/check";
		$content_type = "application/json";
		$method = "GET";
		$group="Products";

		if($this -> mode=="TEST"){
			$action="Keyless_v3_4__CheckPurchasability";
		}else{
			$action="Keyless_v4_0__CheckPurchasability";
		}

		//if($_SESSION['genba']['expires_on']-time()<0){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$this->GetToken($jwt);
		//}

		$params = "";
		$data_string = array(
			"skuId"=>$sku,
			"epicAccountId"=>$epicAccountId,
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		$response = $this->get($url,$content_type,$action,$timeout=60,$group);

		return $response;
	}



	public function get($url,$content_type,$action,$timeout=60,$group){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
		curl_setopt($ch, CURLOPT_SSL_CIPHER_LIST,'ECDHE-ECDSA-AES128-SHA256,ECDHE-RSA-AES128-SHA256,ECDHE-ECDSA-AES256-SHA384');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'accept: application/json',
			'x-api-key: '.$this->api_key
			)                                                                       
		); 

		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$body = substr($result, $headerSize);
		$resObj = json_decode($result);
		curl_close($ch);

		if($httpCode=="200"){	//성공
			//echo "OK";
			$this->successLog($result,$action,$group);
		}else{ //실패
			$this->errorLog($result,$action,$group);
			//echo "NG";
		}
		
		//echo $httpCode;
		//print_R($resObj);

		return $resObj;
	}

	public function post( $url, $data_string,$content_type,$method,$action,$timeout=60,$group){
		$ch = curl_init(); //파라미터:url -선택사항

		curl_setopt($ch,CURLOPT_URL,$url); //여기선 url을 변수로
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , $timeout);
		curl_setopt($ch,CURLOPT_TIMEOUT , $timeout);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
		curl_setopt($ch, CURLOPT_SSL_CIPHER_LIST,'ECDHE-ECDSA-AES128-SHA256,ECDHE-RSA-AES128-SHA256,ECDHE-ECDSA-AES256-SHA384');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'x-api-key: '.$this->api_key,
			'Content-Type: application/json',
			)                                        
		);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
		curl_setopt($ch,CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		//$response = curl_getinfo($ch);

		$body = substr($result, $headerSize);
		$resObj = json_decode($body);
		curl_close($ch);
		
		//print_r($body);
		//print_r($resObj);
                                                                                                                                                                                                                                                                                                  
		if($httpCode=="200"){	//성공
			//echo "OK";
			$this->successLog($body,$action,$group);
		}else{ //실패
			$this->errorLog($body,$action,$group);
			//echo "NG";
		}

		return $resObj;
	}

	public static function jsonEncode($input){
        $json = json_encode($input);
        if (function_exists('json_last_error') && $errno = json_last_error()) {
            static::handleJsonError($errno);
        } elseif ($json === 'null' && $input !== null) {
            throw new DomainException('Null result with non-null input');
        }
        return $json;
    }

	 public static function urlsafeB64Encode($input){
        return str_replace('=', '', strtr(base64_encode($input), '+/', '-_'));
    }

	 public static function urlsafeB64Decode($input){
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $input .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }

	public function NewGuid(){
		if (function_exists('com_create_guid') === true){
			return trim(com_create_guid(), '{}');
		}

		return sprintf('%04X%04X-%04X-%04X-%04X-%04X%04X%04X', mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
	}

	public function errorLog($result,$action,$group){
		$API_ERROR_LOG = "/home/dgkrshop/www/log/genba/genbaApi_error_".$action;
		$ymd = date('Ymd');
		
		//$param_value = "\n {\n";
		//foreach($params as $key=>$value){
		//	$param_value.= "	[".$key."]=>".$value."\n";
		//}
		//$param_value .= "\n}\n";
		//$param_value = json_decode($result);
		$result_array = json_decode($result,true);

		//error_log("[".date('Y.m.d H:i:s')."] Request GENBA_API_ERROR [".$action."] ".print_r($result_array,true)."\n", 3, $API_ERROR_LOG.'_'.$ymd);
		error_log("\r\n[".date('Y.m.d H:i:s')."] Request GENBA_API_ERROR [".$action."] ".$result."\n", 3, $API_ERROR_LOG.'_'.$ymd);
	}

	public function successLog($result,$action,$group){
		$API_ERROR_LOG = "/home/dgkrshop/www/log/genba/genbaApi_success_".$action;
		$ymd = date('Ymd');
		
		$result_array = json_decode($result,true);
			
		//error_log("[".date('Y.m.d H:i:s')."] Request GENBA_API_SUCCESS [".$action."] \n".print_r($result_array,true)."\n", 3, $API_ERROR_LOG.'_'.$ymd);
		error_log("\r\n[".date('Y.m.d H:i:s')."] Request GENBA_API_SUCCESS [".$action."] \n".$result."\n", 3, $API_ERROR_LOG.'_'.$ymd);
	}

	//클래스 소멸자
	public function __destruct() {
		
	}
}
?>