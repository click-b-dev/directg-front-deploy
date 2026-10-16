<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$platform = filter_input(INPUT_POST, 'platform', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$goods_nm = filter_input(INPUT_POST, 'goods_nm', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$qty = filter_input(INPUT_POST, 'qty', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$price = filter_input(INPUT_POST, 'price', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$order_num = filter_input(INPUT_POST, 'order_num', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$goods_code = filter_input(INPUT_POST, 'goods_code', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
$settle_price = filter_input(INPUT_POST, 'settle_price', FILTER_SANITIZE_NUMBER_INT);
$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$ord_ymd = filter_input(INPUT_POST, 'ord_ymd', FILTER_SANITIZE_NUMBER_INT);
$email = filter_input(INPUT_POST, 'orderEmail', FILTER_SANITIZE_EMAIL);
$orderName = filter_input(INPUT_POST, 'orderName', FILTER_SANITIZE_STRING);
$settlekind = filter_input(INPUT_POST, 'settlekind', FILTER_SANITIZE_STRING);
$step = filter_input(INPUT_POST, 'step', FILTER_SANITIZE_STRING);
$settle_count = filter_input(INPUT_POST, 'settle_count', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "invoice_delete":
			
			$query = "delete from directgames.tbl_invoice_order where settle_no=:settle_no";
			$params = array(
				":settle_no"=>$settle_no,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			
			$query = "delete from directgames.tbl_invoice_order_item where settle_no=:settle_no";
			$params = array(
				":settle_no"=>$settle_no,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
		break;
		
		case "delete":
			$query = "delete from directgames.tbl_invoice_goods where idx=:idx";
			$params = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
		break;

		case "order_item_delete":
			foreach($idx as $key=>$value){
				$query = "delete from directgames.tbl_invoice_order_item where idx=:idx";
				$params = array(
					":idx"=>$value,
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}
			
		break;

		case "modify":
			$query = "update directgames.tbl_invoice_order set settle_price=:settle_price,email=:email,ord_ymd=:ord_ymd,name=:name,settle_count=:settle_count where settle_no=:settle_no";
			
			$params = array(
				":settle_price"=>$settle_price,
				":email"=>$email,
				":ord_ymd"=>$ord_ymd,
				":name"=>$orderName,
				":settle_count"=>$settle_count,
				":settle_no"=>$settle_no,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);

			/*$query = "delete from tbl_invoice_order_item where settle_no=:settle_no";
			$params = array(
				":settle_no"=>$settle_no,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);*/

			//초기화
			foreach($goods_code as $key=>$value){
				$query = "insert into directgames.tbl_invoice_order_item set ordno=:ordno,order_num=:order_num,platform=:platform,product_code=:product_code,product_nm=:product_nm,qty=:qty,price=:price,reg_date=now(),settle_no=:settle_no ON DUPLICATE KEY UPDATE product_code=:product_code,product_nm=:product_nm,platform=:platform,qty=:qty,price=:price";
				$params2 = array(
					 "ordno"=> $settle_no."_".($key+1),
					":order_num"=>($key+1),
					":platform"=>$platform[$key],
					":product_code"=>$value,
					":product_nm"=>$goods_nm[$key],
					":qty"=>$ea[$key],
					":price"=>$price[$key],
					":settle_no"=>$settle_no
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params2);
				//print_r($params2);
				//print_R($params2);
				
			}
		break;

		case "register":
			$query = "insert into directgames.tbl_invoice_order set settle_no=:settle_no,settle_price=:settle_price,email=:email,ord_ymd=:ord_ymd,name=:name,settlekind=:settlekind,settle_count=:settle_count,orddt=now()";
			$params = array(
				":settle_no"=>$settle_no,
				":settle_price"=>$settle_price,
				":email"=>$email,
				":ord_ymd"=>$ord_ymd,
				":name"=>$orderName,
				":settlekind"=>$settlekind,
				":settle_count"=>$settle_count
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			print_r($params);

			foreach($goods_nm as $key=>$value){
				$query = "insert into directgames.tbl_invoice_order_item set order_num=:order_num,platform=:platform,product_code=:product_code,product_nm=:product_nm,qty=:qty,price=:price,reg_date=now(),settle_no=:settle_no";
				$params2 = array(
					":order_num"=>($key+1),
					":platform"=>$platform[$key],
					":product_code"=>$value,
					":product_nm"=>$goods_nm[$key],
					":qty"=>$qty[$key],
					":price"=>$price[$key],
					":settle_no"=>$settle_no
				);
				$stmt = $conn->prepare($query);
				$stmt->execute($params2);
				print_r($params2);
			}
			
		//	exit;
		break;
	}

	if($mode="modify"){
		go("invoice_register.php?mode=modify&settle_no=".$settle_no);
	}else{
		go("invoice_request.php");
	}
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>