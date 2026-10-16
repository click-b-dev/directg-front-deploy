<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$recommand_name = filter_input(INPUT_POST, 'recommand_name', FILTER_SANITIZE_STRING);
$recommand_start = filter_input(INPUT_POST, 'recommand_start', FILTER_SANITIZE_STRING);
$recommand_end = filter_input(INPUT_POST, 'recommand_end', FILTER_SANITIZE_STRING);
$recommand_banner = filter_input(INPUT_POST, 'recommand_banner', FILTER_SANITIZE_STRING);
$recommand_banner_link = filter_input(INPUT_POST, 'recommand_banner_link', FILTER_SANITIZE_STRING);
$recommand_banner_target = filter_input(INPUT_POST, 'recommand_banner_target', FILTER_SANITIZE_STRING);
$recommand_goods_1 = filter_input(INPUT_POST, 'recommand_goods_1', FILTER_SANITIZE_STRING);
$recommand_goods_2 = filter_input(INPUT_POST, 'recommand_goods_2', FILTER_SANITIZE_STRING);
$recommand_goods_3 = filter_input(INPUT_POST, 'recommand_goods_3', FILTER_SANITIZE_STRING);
$recommand_goods_4 = filter_input(INPUT_POST, 'recommand_goods_4', FILTER_SANITIZE_STRING);
$recommand_sort = filter_input(INPUT_POST, 'recommand_sort', FILTER_SANITIZE_STRING);
$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminGoods= new AdminGoods($conn);
	
	switch($mode){
		case "register":
			$query = "insert into tbl_main_recommand set recommand_name=:recommand_name,recommand_start=:recommand_start,recommand_end=:recommand_end,recommand_banner=:recommand_banner,recommand_banner_link=:recommand_banner_link,recommand_banner_target=:recommand_banner_target,recommand_goods_1=:recommand_goods_1,recommand_goods_2=:recommand_goods_2,recommand_goods_3=:recommand_goods_3,recommand_goods_4=:recommand_goods_4,is_view=:is_view,reg_date=now()";
			$param = array(
				":recommand_name"=>$recommand_name,
				":recommand_start"=>strtotime($recommand_start),
				":recommand_end"=>strtotime($recommand_end),
				":recommand_banner"=>$recommand_banner,
				":recommand_banner_link"=>$recommand_banner_link,
				":recommand_banner_target"=>$recommand_banner_target,
				":recommand_goods_1"=>$recommand_goods_1,
				":recommand_goods_2"=>$recommand_goods_2,
				":recommand_goods_3"=>$recommand_goods_3,
				":recommand_goods_4"=>$recommand_goods_4,
				":is_view"=>$is_view,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("main_recommand.php");
		break;
		case "modify":
			$query = "update tbl_main_recommand set recommand_name=:recommand_name,recommand_start=:recommand_start,recommand_end=:recommand_end,recommand_banner=:recommand_banner,recommand_banner_link=:recommand_banner_link,recommand_banner_target=:recommand_banner_target,recommand_goods_1=:recommand_goods_1,recommand_goods_2=:recommand_goods_2,recommand_goods_3=:recommand_goods_3,recommand_goods_4=:recommand_goods_4,is_view=:is_view where idx=:idx";
			$param = array(
				":recommand_name"=>$recommand_name,
				":recommand_start"=>strtotime($recommand_start),
				":recommand_end"=>strtotime($recommand_end),
				":recommand_banner"=>$recommand_banner,
				":recommand_banner_link"=>$recommand_banner_link,
				":recommand_banner_target"=>$recommand_banner_target,
				":recommand_goods_1"=>$recommand_goods_1,
				":recommand_goods_2"=>$recommand_goods_2,
				":recommand_goods_3"=>$recommand_goods_3,
				":recommand_goods_4"=>$recommand_goods_4,
				":is_view"=>$is_view,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("main_recommand.php");
		break;
		case "delete":
			$query = "update tbl_main_recommand set is_del='Y' where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "recommand_sort_up": //배너정렬 순서 위로
			$query = "update tbl_main_recommand set recommand_sort=recommand_sort-1 where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "recommand_sort_down": //배너정렬 순서 아래로
			$query = "update tbl_main_recommand set recommand_sort=recommand_sort+1 where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>