<?php
class Payco{
	protected $client_id;
	protected $client_secret;
	protected $callback_url;
	protected $redirectURI;
	protected $state;
	protected $code;
	protected $access_token;
	private $userInfo;
	public function __construct($device,$mode=''){
		$this->client_id = "3RDPR5uJXPXLFe8FiRjo";
		$this->client_secret = "E6GhUnzLJ_smzs7Zzjm_6nXF";
		
		
		if($device=="pc"){
			if($mode=="payco_connect"){
				$this->callback_url = "https://directg.net/api/payco/connect_callback.php";
			}else{
				$this->callback_url = "https://directg.net/api/payco/login_callback.php";
			}
			
		}else{
			if($mode=="payco_connect"){
				$this->callback_url = "https://m.directg.net/api/payco/connect_callback.php";
			}else{
				$this->callback_url = "https://m.directg.net/api/payco/login_callback.php";
			}
		}
	}
	
	public function getApiURL(){
		$this-> set_state();
		$this->redirectURI = urlencode($this->callback_url);
		$apiURL = "https://id.payco.com/oauth2.0/authorize?response_type=code&client_id=".$this->client_id."&serviceProviderCode=FRIENDS&redirect_uri=".$this->redirectURI."&state=".$this->state."&userLocale=ko_KR";
		return$apiURL;
	}
	
	private function generate_state(){
		$mt = microtime();
		$rand = mt_rand();
		$this -> state = md5( $mt . $rand );
	}
	
	public function set_state(){
		$this -> generate_state();
		$_SESSION['state'] = $this -> state;
	}
	
	private function get_code(){
		$this -> code = $_GET['code'];
	}
	private function get_state(){
		$this -> state = $_SESSION['state'];
		return $this -> state;
	}
	
	//Access Token 발급
	public function getAccessToken(){
		$this -> get_code();
		$this -> get_state();
		$redirectURI = urlencode($this->callback_url);
		$url = "https://id.payco.com/oauth2.0/token?grant_type=authorization_code&client_id=".$this->client_id."&client_secret=".$this->client_secret."&redirect_uri=".$redirectURI."&code=".$this->code."&state=".$this->state;

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POST, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_COOKIE, '' );
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		
		if($status_code == 200) {
			$this->access_token = $data['access_token'];
			$this->saveSession();
		} else {
			//echo "Error 코드:".$data['resultcode'];
			//echo "Error 내용:".$data['message'];
			print_r($data);
		}
	}
	
	//Access Token 삭제
	public function delAccessToken($token){
		$access_token = urlencode($token);
		
		$url = "https://id.payco.com/oauth2.0/logout?client_id=".$this->client_id."&client_secret=".$this->client_secret."&token=".$access_token;

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POST, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_COOKIE, '' );
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		
		if($status_code == 200) {
			$this->access_token = $data['access_token'];
			$this->saveSession();
		} else {
			//echo "Error 코드:".$data['resultcode'];
			//echo "Error 내용:".$data['message'];
			print_r($data);
		}
	}
	
	//회원 정보 조회
	public function getUserProfile(){
		$ch = curl_init(); //파라미터:url -선택사항

		curl_setopt($ch,CURLOPT_URL,'https://apis-paycoid.krp.toastoven.net/payco/friends/find_member_v2.json'); //여기선 url을 변수로
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'client_id: '.$this->client_id,
			'access_token: '.stripslashes($this->access_token),
			'content_type: application/json'
			)                                        
		);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		curl_setopt($ch,CURLOPT_POST, 1); //Method를 POST로 지정.. 이 라인이 아예 없으면 GET
		$result = curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$response = curl_getinfo($ch);

		$body = substr($result, $headerSize);
		$resObj = json_decode($body);
		curl_close($ch);
		
		return $resObj;
	}
	
	public function saveSession(){
		if(isset($_SESSION) && is_array($_SESSION)){
			$_saveSession = array();
			$_saveSession['access_token']		=	$this->access_token;
			//$_saveSession['access_token_type']	=	$this->access_token_type;
			$_saveSession['refresh_token']		=	$this->refresh_token;
			//$_saveSession['access_token_expire']	=	$this->access_token_expire;
			$this->tokenDatas = $_saveSession;
			foreach($_saveSession as $k=>$v){
				$_SESSION['PAYCO'][$k] = $v;
			}
		}
	}
	
	public function paycoLogout($access_token){
		$url = "https://apis3.krp.toastoven.net/payco/friends/removeServiceOfferByIdNoAndConsumerKeyAndServiceProviderCode.json";
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_HEADER, 1);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'client_id: '.$this->client_id,
			'access_token: '.stripslashes($access_token),
			'content_type: application/json'
			)                                        
		);
		curl_setopt($ch, CURLOPT_POST, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_COOKIE, '' );
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		
		if($status_code == 200) {
			return $response;
		} else {
			//echo "Error 코드:".$data['resultcode'];
			//echo "Error 내용:".$data['message'];
			print_r($data);
		}
	}
}