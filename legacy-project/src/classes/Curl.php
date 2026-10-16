<?php
/* cURL helper class
 * Author:  Johan / Asbra.net
 * Created: 2011-02-19
 * Updated: 2011-07-27
 * Updated: 2011-09-10
 * Updated: 2011-10-04
 * Updated: 2012-07-21
 * Updated: 2013-01-15
 * Updated: 2013-02-04
 */
 
class cURL{
  private $useragent; // user agent string
  private $handle;    // handle to the cURL object
  private $cookies;   // boolean value whether to use/store cookies or not
  private $redirs;    // boolean value whether to follow redirects or not
  public $cookiejar;  // filename of the cookie jar
  public $data;       // last data returned from a cURL transfer
  public $code;       // the last HTTP code returned
  public $url;        // URL of the page we are currently at
  public $info;       // information about the last cURL transfer
  private $proxy;     // proxy adress
  private $proxypwd;  // proxy password
  public $xhr;        // boolean value whether to use XHR (XMLHttpRequest) or not
 
  function __construct( $redirs = true, $cookies = true, $useragent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:13.0) Gecko/20100101 Firefox/13.0'){
    $this->useragent = $useragent;
    $this->handle    = null;
    $this->cookies   = $cookies;
    $this->redirs    = $redirs;
    $this->cookiejar = 'cookies.txt';
    $this->proxy     = '';
    $this->proxypwd  = '';
    $this->xhr       = false;
  }
 
  public function set_proxy( $proxy, $auth = '' ){
    $this->proxy    = $proxy;
    $this->proxypwd = $auth;
  }
 
	  private function setopt( $url, $referer, $user)
	  {
		curl_setopt( $this->handle, CURLOPT_URL, $url );
		curl_setopt( $this->handle, CURLOPT_HEADER, 0 );
	 
		if( $this->redirs )
		{
		  curl_setopt( $this->handle, CURLOPT_FOLLOWLOCATION, 1 );
		  curl_setopt( $this->handle, CURLOPT_MAXREDIRS, 10 );
		}
		else
		{
		  curl_setopt( $this->handle, CURLOPT_FOLLOWLOCATION, 0 );
		  curl_setopt( $this->handle, CURLOPT_MAXREDIRS, 0 );
		}
	 
		curl_setopt( $this->handle, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt( $this->handle, CURLOPT_USERAGENT, $this->useragent );
	 
		if( substr( $url, 4, 1 ) == 's' )
		{
		  curl_setopt( $this->handle, CURLOPT_SSL_VERIFYPEER, false );
		  curl_setopt( $this->handle, CURLOPT_SSL_VERIFYHOST, false );
		}
	 
		if( $this->cookies )
		{
		  curl_setopt( $this->handle, CURLOPT_COOKIEJAR, $this->cookiejar );
		  curl_setopt( $this->handle, CURLOPT_COOKIEFILE, $this->cookiejar );
		}
	 
		if( $this->proxy != '' )
		{
		  curl_setopt( $this->handle, CURLOPT_PROXY, $this->proxy );
	 
		  if( $this->proxypwd != '' )
		  {
			curl_setopt( $this->handle, CURLOPT_PROXYUSERPWD, $this->proxypwd );
		  }
		}
	 
		if( $referer != '' )
		{
		  curl_setopt( $this->handle, CURLOPT_REFERER, $referer );
		}
	 
		if( $this->xhr == true )
		{
		  curl_setopt( $this->handle, CURLOPT_HTTPHEADER, array( 
				 'Content-Type: application/json',
				 'charset=UTF-8',
				  $user
				) 
			);
		}
	  }
 
	function post( $url, $data_string,$asset_user,$method){
			$ch = curl_init(); //파라미터:url -선택사항

			curl_setopt($ch,CURLOPT_URL,$url); //여기선 url을 변수로
			curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch,CURLOPT_HEADER, 1);
			curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 10);
			curl_setopt($ch,CURLOPT_TIMEOUT , 60);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
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
				//error_log("[".date('Y.m.d H:i:s')."] ".$result."\n", 3, "/home/directgames/log/assets/assets_log_".date('Y-m-d'));
			}else{ //실패
				//print $body;
				error_log("\n[".date('Y.m.d H:i:s')."] request | ". $_SESSION['user']['m_id']."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
				error_log("\n[".date('Y.m.d H:i:s')."] request | ". $data_string."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
				error_log("\n[".date('Y.m.d H:i:s')."] response | ". $result."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
			}

			return $body;
	  }
 
	  function get($url,$asset_user){
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
				error_log("[".date('Y.m.d H:i:s')."] ".$result."\n", 3, "/home/directgames/log/assets/assets_error_log_".date('Y-m-d'));
			}
			//return $this->data;
	  }
 
	public function cleanup(){
		if( file_exists( $this->cookiejar ) ){
			unlink( $this->cookiejar );
		}
	}
}