<?
require __DIR__ . "/../../vendor/autoload.php";
use Firebase\JWT\JWT;
class Vaultn{
	public $certificateLocation;
	public $certificatePassword;
	public $vaultnGUID;
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
	public $payLoad,$kid;
	

	//클래스 생성자
	public function __construct(){
		$this->certificateLocation = "/home/dgkrshop/www/certificate/vaultn/vaultn.pfx";
		$this->certificatePassword = "!#h2inter$%";

		$this->vaultnGUID = "0b170df7-6b09-4001-b904-7a79cfdca45c";
		$this->identifierUrl = "https://identity.vaultn.com/".$this->vaultnGUID;

		$this->tenantID = "identity.vaultn.com";
	}

	//인증서 읽기
	public function ReadCertificate(){
		//$certs = [];
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

	//	echo $thumbprint."<br/>";
		$fingerprint = null;
		$output = null;

		$result = openssl_x509_export($resource, $output);

		if($result !== false) {
			$output = str_replace('-----BEGIN CERTIFICATE-----', '', $output);
			$output = str_replace('-----END CERTIFICATE-----', '', $output);
			
			$output = base64_decode($output);

			$fingerprint = sha1($output);
		}

		//echo $validFrom."<br/>";
		//echo $validTo."<br/>";
		//echo $fingerprint."<br/>";
		//echo $pkey."<br/>";

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
		$pfxFile = $this->certificateLocation;
		$password = $this->certificatePassword;
		$certs = [];

		if (openssl_pkcs12_read(file_get_contents($pfxFile), $certs, $password)) {
			// PFX file loaded successfully
			$privateKey = $certs["pkey"];
			$certificate = $certs["cert"];
		} else {
			// Failed to load PFX file
			echo "Failed to load PFX file.";
		}

		$certificateHash = openssl_x509_fingerprint($certificate, "sha1", true);
		$base64urlHash = base64_encode($certificateHash);
		$x5t = str_replace(["+", "/", "="], ["", "", ""], $base64urlHash);;

		if (openssl_pkcs12_read(file_get_contents($pfxFile), $certs, $password)) {
			// PFX file loaded successfully
			$privateKey = $certs["pkey"];
			$certificate = $certs["cert"];
		} else {
			// Failed to load PFX file
			echo "Failed to load PFX file.";
		}

		$this->kid = strtoupper(openssl_x509_fingerprint($certificate, "sha1", false));

		$header = array(
			"typ" => "JWT",
			"alg" => "RS256",
			"x5t" =>$x5t
		);

		//echo $x5t."<br/>";

		$this->payLoad = array(
			"iss" => "Self",
			"aud" => "identity.vaultn.com",
			"sub" => $this->vaultnGUID,
			"iat" => $validFrom,
			"exp" => $validTo,
		);

		$jwt = JWT::encode($this->payLoad, $privateKey, "RS256", $this->kid, $header);

		//echo $jwt."<br/>";
		return $jwt;
	}


	//Test connectivity
	public function runVaultnPingGet(){
		$url = "https://api.vaultn.com/api/v1/ping";
		
		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			
			$_SESSION['vaultn']['accessToken'] = $jwt;
	//	}


		$result = $this->get($url,"Test connectivity","60","Ping");
		$resObj = json_decode($result);

		return $resObj;
	}

	public function runVaultnPingPost(){
		$url = "https://api.vaultn.com/api/v1/ping";
		
	//	if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
	//	}
		//echo $_SESSION['vaultn']['accessToken'];

		$result = $this->post($url,"","POST","Test connectivity","60","Ping");
		
		print_r($result);
		
		$resObj = json_decode($result);

		return $resObj;
	}

	//Retrieve all agreements
	public function runAllAgreementsRetrieve($pageIndex="0",$pageSize="10"){
		$path = "https://api.vaultn.com/api/v1/agreement";

		$params = "";
		$data_string = array(
			"pageIndex"=>"0",
			"pageSize"=>"20",
			"onlyActive"=>"true"
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve all agreements","60","Agreements");

		$resObj = json_decode($result);

		return $resObj;

	}

	public function runAgreementRetrieve($guid){
		$path = "https://api.vaultn.com/api/v1/agreement/".$guid;

		$url = $path;

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve an agreement","60","Agreements");

		$resObj = json_decode($result);

		return $resObj;
	}

	public function runProduct($page){
		$path = "https://api.vaultn.com/api/v3/product";

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data_string = array(
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve all products","60","Product");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}

	public function runProductAll($page){
		$path = "https://api.vaultn.com/api/v3/product/allocations";

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data_string = array(
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve all products","60","Product");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}

	public function runConnectionProduct($connectionGuid,$page){
		$path = "https://api.vaultn.com/api/v3/connection/".$connectionGuid."/product";

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data_string = array(
			"pageIndex"=>$pageIndex,
			"pageSize"=>"20",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve all products","60","ConnectionProduct");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}
	
	public function runConnectionProductV2($connectionGuid,$page){
		$path = "https://api.vaultn.com/api/v2/connection/".$connectionGuid."/product";

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data_string = array(
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve all products","60","ConnectionProduct");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}
	
	public function runConnectionProductV1($connectionGuid,$page){
		$path = "https://api.vaultn.com/api/v1/connection/".$connectionGuid."/product";

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data_string = array(
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve all products","60","ConnectionProduct");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}

	public function runConnectionProductRetrieve($connectionGuid,$productGUID){
		$path = "https://api.vaultn.com/api/v2/connection/".$connectionGuid."/product/".$productGUID;

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data_string = array(
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve all products","60","ConnectionProduct");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}

	public function runProductRetrieve($productGUID){
		$path = "https://api.vaultn.com/api/v2/product/".$productGUID;

		$url = $path;

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve a product","60","Product");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}
	
	public function runProductRetrieveAll($productGUID,$page){
		$path = "https://api.vaultn.com/api/v4/product/";
		$method = "POST";
		
		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data = array(
			"productGuid"=>$productGUID,
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$data_string=json_encode($data);

		$result = $this->post($url, $data_string,$method,"ProductRetrieve","60","Product");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;

	}

	//Returns a collection of connections (프로모션 목록)
	public function runConnections(){
		$url = "https://api.vaultn.com/api/v2/connection";

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
	//	}

		$result = $this->get($url,"Returns a collection of connections","60","Connection");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;
	}

	//Returns a collection of price lists for the provided connection.
	public function runConnectionPriceList($connectionGuid){
		$url = "https://api.vaultn.com/api/v2/connection/".$connectionGuid."/pricelist";

	//	if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Returns a collection of price lists for the provided connection","60","ConnectionPriceList");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;
	}

	//Returns a single price list for the provided connection.
	public function runConnectionPriceListRetrieve($connectionGuid,$priceListGuid){
		$url = "https://api.vaultn.com/api/v2/connection/".$connectionGuid."/pricelist/".$priceListGuid;

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
	//	}

		$result = $this->get($url,"Returns a collection of price lists for the provided connection","60","ConnectionPriceList");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;
	}

	public function runConnectionPriceListPriceRetrieve($connectionGuid,$priceListGuid,$page){
		$path = "https://api.vaultn.com/api/v3/connection/".$connectionGuid."/pricelist/".$priceListGuid."/price";

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$params = "";
		$data_string = array(
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}

		$url = $path."?".substr($params,0,strlen($params)-1);

	//	if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Returns a collection of the prices in a price list for the provided connection.","60","ConnectionPriceList");

		//print_r($result);

		$resObj = json_decode($result);

		return $resObj;
	}


	//Retrieve all price lists (가격 리스트)
	public function runPricesList(){
		$url = "https://api.vaultn.com/api/v1/pricelist";

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
	//	}

		$result = $this->get($url,"Retrieve a price list","60","Connection");

		$resObj = json_decode($result);

		return $resObj;

	}

	//Retrieve a price list (개별 가격리스트 정보)
	public function runPriceList($priceListGuid){
		$url = "https://api.vaultn.com/api/v1/pricelist/".$priceListGuid;

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve a price list","60","Connection");

		$resObj = json_decode($result);

		return $resObj;

	}

	//Retrieve prices (개별 가격 리스트 가격정보)
	public function runPricesRetrieve($priceListGuid){
		$path = "https://api.vaultn.com/api/v1/pricelist/".$priceListGuid."/price";

		$params = "";
		$data_string = array(
			"pageIndex"=>"0",
			"pageSize"=>"10",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve prices","60","Connection");

		$resObj = json_decode($result);

		return $resObj;

	}

	//Apply promotions to price list (승인된 프로모션 가격정보)
	public function runPricelistPromotionRetrieve($priceListGuid){
		$path = "https://api.vaultn.com/api/v1/pricelist/".$priceListGuid."/promotion";

		$params = "";
		$data_string = array(
			"pageIndex"=>"0",
			"pageSize"=>"20",
		);

		foreach($data_string as $key=>$value){
			if(!$value==""){
				$params.= $key."=".$value."&";
			}
		}
		
		$url = $path."?".substr($params,0,strlen($params)-1);

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}

		$result = $this->get($url,"Retrieve prices","60","Connection");

		$resObj = json_decode($result);

		return $resObj;

	}

	//Retrieve all promotions (프로모션 목록)
	public function runPromotion(){
		$url = "https://api.vaultn.com/api/v1/promotion";

		if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		}

		$result = $this->get($url,"Retrieve all promotions","60","Promotion");

		$resObj = json_decode($result);

		return $resObj;
	}

	public function runConnectionPromotion($connectionGuid){
		$url = "https://api.vaultn.com/api/v1/connection/".$connectionGuid."/promotion";

		if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		}

		$result = $this->get($url,"Retrieve all promotions","60","Promotion");

		$resObj = json_decode($result);

		return $resObj;
	}

	public function runConnectionPromotionRetrieve($connectionGuid,$promotionGuid){
		$url = "https://api.vaultn.com/api/v1/connection/".$connectionGuid."/promotion/".$promotionGuid;

		if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		}

		$result = $this->get($url,"Retrieve all promotions","60","Promotion");

		$resObj = json_decode($result);

		return $resObj;
	}

	//Retrieve a promotion (프로모션 상세보기)
	public function runPromotionRetrieve($promotionGuid){
		$promotionGuid = "";
		$url = "https://api.vaultn.com/api/v1/promotion/".$promotionGuid;

		if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		}

		$result = $this->get($url,"Retrieve a promotion","60","Promotion");

		$resObj = json_decode($result);
		return $resObj;
	}

	//Set a price

	//Retrieve stock levels

	//Retrieve all product types

	//Create a promotion

	//Update a promotion

	//Delete a promotion

	//Update discount on promotion

	//Delete a SKU on promotion

	//Retrieve all regions

	//Generate a SKU

	//주문생성
	public function runOrderCreate($params){
		$url = "https://api.vaultn.com/api/v4/Order/Create";
		$method = "post";

		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		//}
		
		

		$data = array(
			"sku"=>$params['sku'],
			"ipAddress"=>$params['ipAddress'],
			"currencyCode"=>"KRW",
			"salesPriceGross"=>$params['salesPriceGross'],
			"clientOrderReference"=>$params['clientOrderReference'],
			"clientCustomerReference"=>$params['clientCustomerReference'],
			"immediateFulfilment"=>true,
			"mustFulfil"=>false,
			"salesCountryCode"=>"KR",
			"orderType"=>1,
		);
		
		$data_string=json_encode($data);

		$result = $this->post($url, $data_string,$method,"OrderCreate","60","Order");

		$resObj = json_decode($result);
		
		//print_r($result);

		return $resObj;

	}
	
	public function runOrderComplete($orderGuid){
		$url = "https://api.vaultn.com/api/v4/Order/Complete/".$orderGuid;
		
	//	if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();
			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
	//	}

		$data=array(
			"orderGuid"=>$orderGuid
		);

		$data_string=json_encode($data);
		
		$result = $this->post($url,$data,"Complete","60","Order");
		$resObj = json_decode($result);
		
		//print_r($resObj);
		
		return $resObj;
	}

	public function runCancelOrder($orderGuid){
		$url = "https://api.vaultn.com/api/v4/Order/Cancel/".$orderGuid;
		if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();
			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		}

		$data=array(
			"orderGuid"=>$orderGuid
		);

		$data_string=json_encode($data);
		
		$result = $this->post($url,$data_string,"POST","CancelOrder","60","Order");
		$resObj = json_decode($result);
		return $resObj;
	}

	//재고확인
	public function runVaultnStock($page){
		$certificateResult = $this->ReadCertificate();

		$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);

		if($page==""){
			$pageIndex = "0";
		}else{
			$pageIndex = $page-1;
		}

		$data_string = array(
			"onlyChanges"=>false,
			"pageIndex"=>$pageIndex,
			"pageSize"=>"50"
		);

		$curl = curl_init();

		curl_setopt_array($curl, array(
		  CURLOPT_URL => 'https://api.vaultn.com/api/v4/product/stocklevels',
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_SSLVERSION => '6',
		  CURLOPT_SSL_VERIFYPEER => false,
		  CURLOPT_CUSTOMREQUEST => 'POST',
		  CURLOPT_SSL_CIPHER_LIST => 'ECDHE-ECDSA-AES128-SHA256,ECDHE-RSA-AES128-SHA256,ECDHE-ECDSA-AES256-SHA384',
		  CURLOPT_POSTFIELDS =>json_encode($data_string),
		  CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Bearer '.$jwt
		  ),
		));

		$result = curl_exec($curl);

		curl_close($curl);

		$resObj = json_decode($result);

		return $resObj;
	}

	//재고확인(전체) — recordCount 기준 모든 페이지를 순회해 stockLevelInformation 병합 (인증서/JWT 1회 재사용)
	public function runVaultnStockAll($pageSize=1000, $maxPages=100){
		$certificateResult = $this->ReadCertificate();
		$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);

		$all = array();
		$recordCount = 0;
		$pageIndex = 0;
		$totalPages = 1;

		while($pageIndex < $totalPages && $pageIndex < $maxPages){
			$data_string = array(
				"onlyChanges"=>false,
				"pageIndex"=>$pageIndex,
				"pageSize"=>(string)$pageSize
			);

			$curl = curl_init();
			curl_setopt_array($curl, array(
			  CURLOPT_URL => 'https://api.vaultn.com/api/v4/product/stocklevels',
			  CURLOPT_RETURNTRANSFER => true,
			  CURLOPT_MAXREDIRS => 10,
			  CURLOPT_TIMEOUT => 0,
			  CURLOPT_SSLVERSION => '6',
			  CURLOPT_SSL_VERIFYPEER => false,
			  CURLOPT_CUSTOMREQUEST => 'POST',
			  CURLOPT_SSL_CIPHER_LIST => 'ECDHE-ECDSA-AES128-SHA256,ECDHE-RSA-AES128-SHA256,ECDHE-ECDSA-AES256-SHA384',
			  CURLOPT_POSTFIELDS =>json_encode($data_string),
			  CURLOPT_HTTPHEADER => array(
				'Content-Type: application/json',
				'Authorization: Bearer '.$jwt
			  ),
			));

			$result = curl_exec($curl);
			curl_close($curl);

			$resObj = json_decode($result);
			if(empty($resObj)){ break; }

			if(isset($resObj->recordCount)){ $recordCount = (int)$resObj->recordCount; }
			$rows = (isset($resObj->stockLevelInformation) && is_array($resObj->stockLevelInformation)) ? $resObj->stockLevelInformation : array();
			foreach($rows as $r){ $all[] = $r; }

			//응답의 실제 pageSize로 총 페이지 재계산 (서버가 pageSize를 제한할 수 있음)
			$effPageSize = (isset($resObj->pageSize) && (int)$resObj->pageSize > 0) ? (int)$resObj->pageSize : $pageSize;
			if($effPageSize <= 0){ $effPageSize = 50; }
			$totalPages = ($recordCount > 0) ? (int)ceil($recordCount / $effPageSize) : 1;

			//마지막 페이지(응답 건수가 pageSize 미만)면서 전체 수집 완료면 종료
			if(count($rows) < $effPageSize && count($all) >= $recordCount){ break; }

			$pageIndex++;
		}

		$ret = new stdClass();
		$ret->recordCount = $recordCount;
		$ret->loadedCount = count($all);
		$ret->stockLevelInformation = $all;
		return $ret;
	}

	public function runRetrieveOrder($orderId){
		$url = "https://api.vaultn.com/api/v4/Order/Get/".$orderId;
		//if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();
			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
	//	}
		$result = $this->get($url,"Retrieve","60","Order");
		$resObj = json_decode($result);
		return $resObj;
	}

	public function runVaultnProductStock($productGuid){
		$url = "https://api.vaultn.com/api/v3/product/getstock/".$productGuid;

		if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		}

		$result = $this->get($url,"Retrieve a product stock","60","product");

		$resObj = json_decode($result);
		return $resObj;
	}

	public function runVaultnhasstock($sku){
		$url = "https://api.vaultn.com/api/v2/product/hasstock/?sku=".$sku."&countryCode=KR";

		if($_SESSION['vaultn']['accessToken']==""){
			$certificateResult = $this->ReadCertificate();

			$jwt = $this->CreateJwt($certificateResult['validFrom'], $certificateResult['validTo'], $certificateResult['pkey']);
			$_SESSION['vaultn']['accessToken'] = $jwt;
		}

		$result = $this->get($url,"Retrieve a product stock","60","product");

		$resObj = json_decode($result);
		return $resObj;
	}

	public function get($url,$action,$timeout=60,$group){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
		curl_setopt($ch, CURLOPT_SSL_CIPHER_LIST,'ECDHE-ECDSA-AES128-SHA256,ECDHE-RSA-AES128-SHA256,ECDHE-ECDSA-AES256-SHA384');
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Authorization: Bearer '.$_SESSION['vaultn']['accessToken']
			)                                                                       
		); 

		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$body = substr($result, $headerSize);
		curl_close($ch);

		if($httpCode=="200"){	//성공
			//echo "OK";
			//echo $result;
			$this->successLog($result,$action,$group);
			
		}else{ //실패
			$this->errorLog($result,$action,$group);
			//echo "NG";
		}
		
		return $body;
	}

	public function post( $url, $data_string,$method,$action,$timeout=60,$group){
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
			'Content-Type: application/json',
			'Authorization: Bearer '.$_SESSION['vaultn']['accessToken']
			)                                                                       
		); 
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch,CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$response = curl_getinfo($ch);

		$body = substr($result, $headerSize);
		curl_close($ch);
                                                                                                                                                                                                                                                                                                  
		if($httpCode=="200"){	//성공
			//echo "OK";
			$this->successLog($body,$action,$group);
		}else{ //실패
			$this->errorLog($body,$action,$group);
			//echo "NG";
		}

		return $body;
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
		$API_ERROR_LOG = "/home/dgkrshop/www/log/vaultn/vaultnApi_error_".$action;
		$ymd = date('Ymd');
		
		//$param_value = "\n {\n";
		//foreach($params as $key=>$value){
		//	$param_value.= "	[".$key."]=>".$value."\n";
		//}
		//$param_value .= "\n}\n";
		//$param_value = json_decode($result);

		error_log("\r\n[".date('Y.m.d H:i:s')."] Request VAULTN_API_ERROR [".$action."] ".$result."\n", 3, $API_ERROR_LOG.'_'.$ymd);
	}

	public function successLog($result,$action,$group){
		$API_ERROR_LOG = "/home/dgkrshop/www/log/vaultn/vaultnApi_success_".$action;
		$ymd = date('Ymd');
			
		//$param_value = json_decode($result);
		//$result_array = json_decode($result);
		error_log("\r\n[".date('Y.m.d H:i:s')."] Request VAULTN_API_SUCCESS [".$action."] \n".$result."\n", 3, $API_ERROR_LOG.'_'.$ymd);
	}

	//클래스 소멸자
	public function __destruct() {
		
	}
}
?>