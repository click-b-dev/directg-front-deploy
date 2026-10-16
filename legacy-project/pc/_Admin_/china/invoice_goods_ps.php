<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);
$platform = filter_input(INPUT_POST, 'platform', FILTER_SANITIZE_STRING);
$goods_nm = filter_input(INPUT_POST, 'goods_nm', FILTER_SANITIZE_STRING);
$price = filter_input(INPUT_POST, 'price', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	switch($mode){
		case "delete":
			$query = "delete from directgames.tbl_invoice_goods where idx=:idx";
			$params = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			echo "삭제되었습니다.";
		break;

		case "modify":
			$query = "update directgames.tbl_invoice_goods set platform=:platform,goods_nm=:goods_nm,price=:price where idx=:idx";
			
			$params = array(
				":platform"=>$platform,
				":goods_nm"=>$goods_nm,
				":price"=>$price,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			echo "수정되었습니다.";
		break;

		case "register":
			$query = "insert into directgames.tbl_invoice_goods set platform=:platform,goods_nm=:goods_nm,price=:price";
			$params = array(
				":platform"=>$platform,
				":goods_nm"=>$goods_nm,
				":price"=>$price
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			echo "등록되었습니다.";
		break;
		case "invoice_goods_search":
			$search_value = filter_input(INPUT_POST, 'search_value', FILTER_SANITIZE_STRING);
			$search_platform = filter_input(INPUT_POST, 'search_platform', FILTER_SANITIZE_STRING);
		
			$keyword = "%$search_value%"; 
		
			$query = "select platform,goods_nm,price from directgames.tbl_invoice_goods where platform=:platform and goods_nm like :keyword order by platform asc,goods_nm asc,price asc";
			$params = array(
				":platform"=>$search_platform,
				":keyword"=>$keyword
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			$goods_data = $stmt->fetchAll();
			
			
			foreach($goods_data as $goods){
				echo "<tr>";
				echo "<td><input type='text' name='platform[]' class='form-control' value='".$goods['platform']."' readonly></td>";
				echo "<td><input type='text' class='form-control' name='goods_nm[]' value='".$goods['goods_nm']."' readonly /></td>";
				echo "<td><input type='text' class='form-control' name='qty[]' value=''/></td>";
				echo "<td><input type='text' class='form-control text-end' name='price[]' value='".$goods['price']."' readonly/></td>";
				echo "<td><button class='btn btn-outline-secondary btn-sm btn_goods_add' type='button'>상품 추가</button></td>";
				echo "</tr>";
			}
			
		break;
	}

	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>