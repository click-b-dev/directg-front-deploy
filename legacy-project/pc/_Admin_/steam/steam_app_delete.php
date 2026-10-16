<?
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

header("Content-Type:text/html; charset=utf-8");

//$appids = "3390";
$appids = filter_input(INPUT_GET, 'appids', FILTER_SANITIZE_STRING);


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "delete from steam_app_list where appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);
	
	$query = "delete from steam_game where steam_appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);
	
	$query = "delete from steam_dlc where dlc_appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);

	$query = "delete from steam_dlc_all where game_appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);
	
	$query = "delete from steam_package_all where appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);

	$query = "delete from steam_game_publisher where appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);

	$query = "delete from steam_game_genre where appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);

	$query = "delete from steam_game_developer where appid=:appid";
	$stmt = $conn->prepare($query);
	$params = array(
			":appid"=>$appids
		);
	$stmt->execute($params);
	
	unlink('/home/dgkrshop/www/upload/apps/apps_'.$appids.'.json');
	unlink('/home/dgkrshop/www/upload/apps/header/'.$appids.'/header.jpg');
	//rmdir('/home/dgkrshop/www/upload/apps/header/'.$appids);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>