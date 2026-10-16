<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);


//IP 주소당 초당 10개 요청으로 제한
//IP 주소당 분당 150개 요청으로 제한
//API 키당 분당 300개의 요청으로 제한

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

//last_appid = 1905020

	//$appids = "3390";
	$last_appid = filter_input(INPUT_GET, 'last_appid', FILTER_SANITIZE_STRING);

	if(!$last_appid){
		$last_appid="1";
	}

	$ch = curl_init();
	$url = "https://api.steampowered.com/IStoreService/GetAppList/v1/?key=DDC7E0591C3333330DB6E70B74C18C11&last_appid=".$last_appid."&max_results=1000&include_games=true&include_dlc=false";
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
	print_r($data);
	//exit;

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	foreach($data->response->apps as $value){
		$query = "insert into steam_app_list set appid=:appid,name=:name,app_type='game',last_modified=:last_modified,price_change_number=:price_change_number,reg_date=now() ON DUPLICATE KEY UPDATE app_type='game'";
		$stmt = $conn->prepare($query);
		$params2 = array(
			":appid"=>$value->appid,
			":name"=>$value->name,
			":last_modified"=>$value->last_modified,
			":price_change_number"=>$value->price_change_number,
		);
		$stmt->execute($params2);

		print_r($params2);
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>