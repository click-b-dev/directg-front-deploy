<?
/*
filter: all, recent , updated
purchase_type: all,non_steam_purchase , steam
review_type: all ,positive,negative 
*/
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
ini_set("display_errors", 1);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
header("Content-Type:text/html; charset=utf-8");

$appids = filter_input(INPUT_GET, 'appids', FILTER_SANITIZE_STRING);
$language = filter_input(INPUT_GET, 'language', FILTER_SANITIZE_STRING);
$purchase_type = filter_input(INPUT_GET, 'purchase_type', FILTER_SANITIZE_STRING);
$steam_data = array();

$steam_data["appid"] = $appids;
$steam_data["purchase_type"] = $purchase_type;
if($language=="koreana"){
	switch($purchase_type){
		case "steam":
			$url = "https://store.steampowered.com/appreviews/".$appids."?json=1&language=koreana&l=koreana&filter=updated&num_per_page=10&purchase_type=steam&review_type=all";
		break;
		case "non_steam_purchase":
			$url = "https://store.steampowered.com/appreviews/".$appids."?json=1&language=koreana&l=koreana&filter=updated&num_per_page=10&purchase_type=non_steam_purchase&review_type=all";
		break;
		case "all":
			$url = "https://store.steampowered.com/appreviews/".$appids."?json=1&language=koreana&l=koreana&filter=updated&num_per_page=10&purchase_type=all&review_type=all";
		break;
	}
	$steam_data["language"] = "koreana";
}else{
	switch($purchase_type){
		case "steam":
			$url = "https://store.steampowered.com/appreviews/".$appids."?json=1&l=koreana&language=all&filter=updated&num_per_page=10&purchase_type=steam&review_type=all";
		break;
		case "non_steam_purchase":
			$url = "https://store.steampowered.com/appreviews/".$appids."?json=1&l=koreana&language=all&filter=updated&num_per_page=10&purchase_type=non_steam_purchase&review_type=all";
		break;
		case "all":
			$url = "https://store.steampowered.com/appreviews/".$appids."?json=1&l=koreana&language=all&filter=updated&num_per_page=10&purchase_type=all&review_type=all";
		break;
	}
	$steam_data["language"] = "all";
}
$ch = curl_init();
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
//print_r($data);
foreach($data->query_summary as $key=>$value){
	if($key=="review_score"){
		$steam_data["review_score"] = $value;
	}
	if($key=="total_positive"){
		$steam_data["total_positive"] = $value;
	}
	if($key=="total_negative"){
		$steam_data["total_negative"] = $value;
	}
	if($key=="total_reviews"){
		$steam_data["total_reviews"] = $value;
	}
	
	if($key=="review_score_desc"){
		$steam_data["review_score_desc"] = $value;
	}
}
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//$admin= new Admin($conn);
	$query = "insert into steam_review set appid=:appid,purchase_type=:purchase_type,language=:language,review_score=:review_score,review_score_desc=:review_score_desc,total_positive=:total_positive,total_negative=:total_negative,total_reviews=:total_reviews,batch_date=now() ON DUPLICATE KEY UPDATE review_score=:review_score,review_score_desc=:review_score_desc,total_positive=:total_positive,total_negative=:total_negative,total_reviews=:total_reviews,batch_date=now()";
	$stmt = $conn->prepare($query);
	$params = array(
		":appid"=>$steam_data["appid"],
		":purchase_type"=>$steam_data["purchase_type"],
		":language"=>$steam_data["language"],
		":review_score"=>$steam_data["review_score"],
		":review_score_desc"=>$steam_data["review_score_desc"],
		":total_positive"=>$steam_data["total_positive"],
		":total_negative"=>$steam_data["total_negative"],
		":total_reviews"=>$steam_data["total_reviews"],
	);
	$stmt->execute($params);
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>