<?php
class Naver{
	protected $client_id;
	protected $client_secret;
	protected $redirectURI;
	protected $state;
	protected $code;
	protected $access_token;
	private $userInfo;
	
	public function __construct($device,$mode=''){
		$this->client_id = "ksxTRJykXU2TBdq9RvKC";
		$this->client_secret = "Ax2Z8CwLK_";
		
		if($device=="pc"){
			if($mode=="naver_connect"){
				$this->redirectURI =urlencode("https://directg.net/api/naver/connect_callback.php");
			}else{
				$this->redirectURI =urlencode("https://directg.net/api/naver/login_callback.php");
			}
			
		}else{
			if($mode=="naver_connect"){
				$this->redirectURI = urlencode("https://m.directg.net/api/naver/connect_callback.php");
			}else{
				$this->redirectURI = urlencode("https://m.directg.net/api/naver/login_callback.php");
			}
		}
	}
	
	public function getApiURL(){
		$this-> set_state();
		$apiURL = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=".$this->client_id."&redirect_uri=".$this->redirectURI."&state=".$this->state;
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
	
	//Token 요청
	public function getAccessToken(){
		$this -> get_code();
		$this -> get_state();
		$redirectURI = urlencode($this->redirectURI);
		$url = "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=".$this->client_id."&client_secret=".$this->client_secret."&redirect_uri=".$redirectURI."&code=".$this->code."&state=".$this->state;

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
	
	public function getUserProfile(){
		 $header = "Bearer ".$this->access_token;
		$headers = array();
		$headers[] = "Authorization: ".$header;
		$url = "https://openapi.naver.com/v1/nid/me";
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url );
		curl_setopt($ch, CURLOPT_POST, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
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
			$this -> userInfo = array(
				'userID' => (string)$data['response']['id'],
				'enc_id' => (string)$data['response']['enc_id'],
				'profile_image' => (string)$data['response']['profile_image'],
				'age' => (string)$data['response']['age'],
				'gender' => (string)$data['response']['gender'],
				'nickname' => (string)$data['response']['nickname'],
				'email' => (string)$data['response']['email'],
				'mobile' => (string)$data['response']['mobile'],
				'name' => (string)$data['response']['name'],
				'birthyear' => (string)$data['response']['birthyear'],
			);
			
			//print_r($this -> userInfo);
			return $this -> userInfo;
		} else {
			//echo "Error 내용:".$response;
		}
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
				$_SESSION['NAVER'][$k] = $v;
			}
		}
	}
	
	public function logout($access_token){
		$this -> get_code();
		$this -> get_state();
		$url = 'https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id='.$this -> client_id.'&client_secret='.$this -> client_secret.'&code='.$this -> code.'&state='.$this -> state.'&access_token='.urlencode($access_token).'&service_provider=NAVER';
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url );
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_COOKIE, '' );
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		return $data;
	}

}
?>