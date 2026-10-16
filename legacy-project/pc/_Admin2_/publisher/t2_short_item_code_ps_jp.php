<?
	session_start();
	header("Content-Type: text/html; charset=UTF-8");

	include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

	include_once("../../../_engine/dbconn_jp.php");

	if($_SESSION['publisher']['admin_id']==""){
		go("../index.php");
	}

	$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
	$goods_code = filter_input(INPUT_POST, 'goods_code', FILTER_SANITIZE_STRING);
	$short_item_code = filter_input(INPUT_POST, 'short_item_code', FILTER_SANITIZE_STRING);

	$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
	try  {  
		$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
		$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		switch($mode){
			case "save":
				$query = "insert into tbl_report_t2code set short_item_code=:short_item_code,product_code=:product_code ON DUPLICATE KEY UPDATE short_item_code=:short_item_code";
				$params = array(
					":short_item_code" => $short_item_code,
					":product_code" => $goods_code
				);
				$stmt = $conn_dgjp->prepare($query);
				$stmt->execute($params);
			break;
			case "delete":
				$query = "delete from tbl_report_t2code where product_code=:product_code";
				$params = array(
					":product_code" => $goods_code
				);
				$stmt = $conn_dgjp->prepare($query);
				$stmt->execute($params);
			break;
		}

	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();  
		die();  
	}
?>