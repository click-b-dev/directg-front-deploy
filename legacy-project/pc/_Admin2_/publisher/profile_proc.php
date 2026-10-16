<?
	include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

	header("Content-Type: text/html; charset=UTF-8"); 

	$admin_pwd = filter_input(INPUT_POST, 'admin_pwd', FILTER_SANITIZE_STRING);

	$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

	$ip = get_client_ip_env();

	try{  
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		$query = "update directgames.tbl_admin_publisher set pwd = password(:pwd),ip=:ip,re_pwd_date=now() where id=:id";
		$params = array(
					':pwd'=>$admin_pwd,
					':ip'=>$ip,
					':id'=>$_SESSION['publisher']['admin_id']
				);
		$stmt = $conn->prepare($query);
		$stmt->execute($params);

	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();  
		die();  
	}

	go("main.php");
?>