<?php
	define( 'KAKAO_OAUTH_AUTHORIZE_URL', 'https://kauth.kakao.com/oauth/authorize' );
	define( 'KAKAO_OAUTH_TOKEN_URL', 'https://kauth.kakao.com/oauth/token' );
	define( 'KAKAO_TOKEN_INFO_URL', 'https://kapi.kakao.com/v1/user/access_token_info');
	define( 'KAKAO_LOGOUT_URL', 'https://kapi.kakao.com/v1/user/logout');
	define( 'KAKAO_USERINFO_URL', 'https://kapi.kakao.com/v2/user/me');
	define( 'KAKAO_UNLINK_URL', 'https://kapi.kakao.com/v1/user/unlink');
	class Kakao{
		private $client_id;
		private $redirect_uri;
		private $state;
		private $session;

		private $authorize_url = KAKAO_OAUTH_AUTHORIZE_URL;
		private $accesstoken_url = KAKAO_OAUTH_TOKEN_URL;
		private $logout_url = KAKAO_LOGOUT_URL;
		private $accesstokeninfo_url = KAKAO_TOKEN_INFO_URL;
		private $userinfo_url = KAKAO_USERINFO_URL;
		private $unlink_url = KAKAO_UNLINK_URL;
		
		private $code;
		private $tokenArr; 
		private $userInfo;
		private $access_token;

		public function __construct($device,$mode='') {
			$this -> client_id = "0f1b67c59df8fbd5feac83e7be161d06";
			$this -> client_secret = "3FriWcNydCgIPvvwCAzN7eM8OTDGAbdM";
			
			if($device=="pc"){
				if($mode=="kakao_connect"){
					$this -> redirect_uri = "https://directg.net/api/kakao/kakao_connect_callback.php";
				}else{
					$this -> redirect_uri = "https://directg.net/api/kakao/kakao_login_callback.php";
				}
				
			}else{
				if($mode=="kakao_connect"){
					$this -> redirect_uri = "https://m.directg.net/api/kakao/kakao_connect_callback.php";
				}else{
					$this -> redirect_uri = "https://m.directg.net/api/kakao/kakao_login_callback.php";
				}
			}
			
			if(!isset($_SESSION)) {
				session_start();
			}
		}
		
		public function getApiURL(){
			$this-> set_state();
			$apiURL = $this->get_request_url();
			return$apiURL;
		}
	
		private function generate_state(){
			$mt = microtime();
			$rand = mt_rand();
			$this -> state = md5( $mt . $rand );
		}
		public function set_state(){
			$this -> generate_state();
			$_SESSION['KAKAO']['state'] = $this -> state;
		}

		private function get_state(){
			$this -> state = $_SESSION['state'];
			return $this -> state;
		}

		private function get_code(){
			$this -> code = $_GET['code'];
		}

		public function request_auth(){
			header('Location: '. $this -> get_request_url() );
		}
		public function get_request_url(){
			return $this -> authorize_url . '?response_type=code&client_id=' . $this -> client_id . '&state=' . $this -> state . '&redirect_uri=' . urlencode($this -> redirect_uri); 
		}
		public function get_accesstoken_url(){
			return $this -> accesstoken_url . '?grant_type=authorization_code&client_id=' . $this -> client_id . '&client_secret=' . $this -> client_secret . '&code=' . $this -> code. '&redirect_uri=' . urlencode($this -> redirect_uri);
		}
		public function call_accesstoken(){
			$this -> get_code();
			$this -> get_state();

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $this -> get_accesstoken_url() );
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
			curl_setopt($ch, CURLOPT_COOKIE, '' );
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
			$g = curl_exec($ch);
			curl_close($ch);
			$data = json_decode($g, true);
			$this -> tokenArr = array(
				 'Authorization: '.$data['token_type'].' '.$data['access_token']
			);

			if(isset($data['access_token'])){
				$this->access_token			= $data['access_token'];
				$this->access_token_type	= $data['token_type'];
				$this->refresh_token		= $data['refresh_token'];
				//$this->access_token_expire	= $NHNreturns->expires_in;
				$this->saveSession();
			}
		}
		public function get_access_token_info(){
			$header_type = "Bearer";

			$this -> tokenArr = array(
				 'Authorization: '.$header_type.' '.$_SESSION['KAKAO_SESSION_NAME']['access_token']
			);

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $this->accesstokeninfo_url);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $this -> tokenArr );
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
			curl_setopt($ch, CURLOPT_COOKIE, '' );
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
			$g = curl_exec($ch);
			curl_close($ch);

			return $g;
		}

		// 사용자 정보 요청
		public function get_user_info($data_string){
			$header_type = "Bearer";

			$this -> tokenArr = array(
				 'Authorization: '.$header_type.' '.$_SESSION['KAKAO_SESSION_NAME']['access_token']
			);

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $this->userinfo_url);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $this -> tokenArr );
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
			curl_setopt($ch,CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
			curl_setopt($ch, CURLOPT_COOKIE, '' );
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
			$g = curl_exec($ch);
			curl_close($ch);

			return  json_decode($g, true);
		}

		public function saveSession(){
			if(isset($_SESSION) && is_array($_SESSION)){
				$_saveSession = array();
				$_saveSession['access_token']		=	$this->access_token;
				$_saveSession['access_token_type']	=	$this->access_token_type;
				$_saveSession['refresh_token']		=	$this->refresh_token;
				//$_saveSession['access_token_expire']	=	$this->access_token_expire;
				$this->tokenDatas = $_saveSession;
				foreach($_saveSession as $k=>$v){
					$_SESSION['KAKAO_SESSION_NAME'][$k] = $v;
				}
			}
		}

		public function logout($access_token){
			$header_type = "Bearer";
			$ch = curl_init();
			$this -> tokenArr = array(
				 'Authorization: '.$header_type.' '.$access_token
			);
			curl_setopt($ch, CURLOPT_URL, $this->logout_url );
			curl_setopt($ch, CURLOPT_HTTPHEADER, $this -> tokenArr );
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
			curl_setopt($ch, CURLOPT_COOKIE, '' );
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
			$g = curl_exec($ch);
			curl_close($ch);
			$data = json_decode($g, true);
			return $data;

			$this->deleteSession();
		}

		public function user_unlink($access_token){
			$header_type = "Bearer";
			$ch = curl_init();
			$this -> tokenArr = array(
				 'Authorization: '.$header_type.' '.$access_token
			);
			curl_setopt($ch, CURLOPT_URL, $this->unlink_url );
			curl_setopt($ch, CURLOPT_HTTPHEADER, $this -> tokenArr );
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
			curl_setopt($ch, CURLOPT_COOKIE, '' );
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
			$g = curl_exec($ch);
			curl_close($ch);
			$data = json_decode($g, true);
			return $data;
		}

		public function user_unlink2($access_token){
			$header_type = "KakaoAK";
			$APP_ADMIN_KEY ="855f08fff0dfb33a483bd00920fbe5ab";
			$ch = curl_init();
			$this -> tokenArr = array(
				 'Authorization: '.$header_type.' '.$APP_ADMIN_KEY
			);
			curl_setopt($ch, CURLOPT_URL, $this->unlink_url );
			curl_setopt($ch, CURLOPT_HTTPHEADER, $this -> tokenArr );
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
			curl_setopt($ch, CURLOPT_COOKIE, '' );
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 300);
			$g = curl_exec($ch);
			curl_close($ch);
			$data = json_decode($g, true);
			return $data;
		}


		public function deleteSession(){
			if(isset($_SESSION) && is_array($_SESSION) && $_SESSION['KAKAO_SESSION_NAME']){
				$_loadSession = array();
				$this->tokenDatas = $_loadSession;
				unset($_SESSION['KAKAO_SESSION_NAME']);
				
				$this->access_token			= '';
				$this->access_token_type	= '';
				$this->refresh_token		= '';
				$this->access_token_expire	= '';
				//$this->updateConnectState(false);
			}
		}
	}
?>