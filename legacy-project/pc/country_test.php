<?
//exit;
ini_set( "display_errors", 1);
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
require_once $_SERVER["DOCUMENT_ROOT"].'/../geoip2/geoip2.phar';
try{
	$conn = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn);
	
	$ip = "143.105.187.85";
	
	try {
		$country = $member->getCountry($ip);
		
		echo $country;
	
	} catch (Exception $e) {
        //echo $e->getMessage();
		$country ="";
    }
	
	
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>