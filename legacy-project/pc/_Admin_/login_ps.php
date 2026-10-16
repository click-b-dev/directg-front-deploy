<?
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);

header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER["DOCUMENT_ROOT"].'/../lib/lib.php');

$admin_id = filter_input(INPUT_POST, 'admin_id', FILTER_SANITIZE_STRING);
$admin_pwd = filter_input(INPUT_POST, 'admin_pwd', FILTER_SANITIZE_STRING);

try{  
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new AdminMember($conn_dgkr);
	$result = $member->adminLogin($admin_id,$admin_pwd,$ip);
	
	
	if($result['error_code']=="OK"){
		$_SESSION['admin']=array(
			"admin_id"=>$result['data']['admin_id'],
			"admin_name"=>$result['data']['admin_name'],
			"admin_level"=>$result['data']['admin_level'],
		);

		if($_SESSION['admin']['admin_level']=="1"){
			$product_viewer=true;
			header( 'Location: https://directg.net/_Admin_/goods/title_list.php' );
		} else {
			$product_viewer=false;
			header( 'Location: https://directg.net/_Admin_/main.php' );
		}

	}else{
		echo $result['error_code'];
		exit;
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>