<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$promotion_week_name = filter_input(INPUT_POST, 'promotion_week_name', FILTER_SANITIZE_STRING);
$promotion_week_start = filter_input(INPUT_POST, 'promotion_week_start', FILTER_SANITIZE_STRING);
$promotion_week_end = filter_input(INPUT_POST, 'promotion_week_end', FILTER_SANITIZE_STRING);

$promotion_week_banner_pc = filter_input(INPUT_POST, 'promotion_week_banner_pc', FILTER_SANITIZE_STRING);
$promotion_week_banner_mobile = filter_input(INPUT_POST, 'promotion_week_banner_mobile', FILTER_SANITIZE_STRING);
$promotion_week_banner_link = filter_input(INPUT_POST, 'promotion_week_banner_link', FILTER_SANITIZE_STRING);

$promotion_week_recommand_1 = filter_input(INPUT_POST, 'promotion_week_recommand_1', FILTER_SANITIZE_STRING);
$promotion_week_recommand_2 = filter_input(INPUT_POST, 'promotion_week_recommand_2', FILTER_SANITIZE_STRING);
$promotion_week_recommand_3 = filter_input(INPUT_POST, 'promotion_week_recommand_3', FILTER_SANITIZE_STRING);
$promotion_week_recommand_4 = filter_input(INPUT_POST, 'promotion_week_recommand_4', FILTER_SANITIZE_STRING);

$promotion_week_best_1 = filter_input(INPUT_POST, 'promotion_week_best_1', FILTER_SANITIZE_STRING);
$promotion_week_best_2 = filter_input(INPUT_POST, 'promotion_week_best_2', FILTER_SANITIZE_STRING);
$promotion_week_best_3 = filter_input(INPUT_POST, 'promotion_week_best_3', FILTER_SANITIZE_STRING);
$promotion_week_best_4 = filter_input(INPUT_POST, 'promotion_week_best_4', FILTER_SANITIZE_STRING);
$promotion_week_best_5 = filter_input(INPUT_POST, 'promotion_week_best_5', FILTER_SANITIZE_STRING);
$promotion_week_best_6 = filter_input(INPUT_POST, 'promotion_week_best_6', FILTER_SANITIZE_STRING);
$promotion_week_best_7 = filter_input(INPUT_POST, 'promotion_week_best_7', FILTER_SANITIZE_STRING);
$promotion_week_best_8 = filter_input(INPUT_POST, 'promotion_week_best_8', FILTER_SANITIZE_STRING);
$promotion_week_best_9 = filter_input(INPUT_POST, 'promotion_week_best_9', FILTER_SANITIZE_STRING);
$promotion_week_best_10 = filter_input(INPUT_POST, 'promotion_week_best_10', FILTER_SANITIZE_STRING);

$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);

$promotion_week_recommand = $promotion_week_recommand_1."|".$promotion_week_recommand_2."|".$promotion_week_recommand_3."|".$promotion_week_recommand_4;
$promotion_week_best = $promotion_week_best_1."|".$promotion_week_best_2."|".$promotion_week_best_3."|".$promotion_week_best_4."|".$promotion_week_best_5."|".$promotion_week_best_6."|".$promotion_week_best_7."|".$promotion_week_best_8."|".$promotion_week_best_9."|".$promotion_week_best_10;

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	switch($mode){
		case "register":
			$query = "insert into tbl_promotion_weekend set promotion_week_name=:promotion_week_name,promotion_week_start=:promotion_week_start,promotion_week_end=:promotion_week_end,promotion_week_banner_link=:promotion_week_banner_link,promotion_week_recommand=:promotion_week_recommand,promotion_week_best=:promotion_week_best,is_view=:is_view,reg_date=now()";
			$param = array(
				":promotion_week_name"=>$promotion_week_name,
				":promotion_week_start"=>strtotime($promotion_week_start),
				":promotion_week_end"=>strtotime($promotion_week_end),
				":promotion_week_banner_link"=>$promotion_week_banner_link,
				":promotion_week_recommand"=>$promotion_week_recommand,
				":promotion_week_best"=>$promotion_week_best,
				":is_view"=>$is_view,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("promotion_weekend.php");
		break;
		case "modify":
			$query = "update tbl_promotion_weekend set promotion_week_name=:promotion_week_name,promotion_week_start=:promotion_week_start,promotion_week_end=:promotion_week_end,promotion_week_banner_link=:promotion_week_banner_link,promotion_week_recommand=:promotion_week_recommand,promotion_week_best=:promotion_week_best,is_view=:is_view where idx=:idx";
			$param = array(
				":promotion_week_name"=>$promotion_week_name,
				":promotion_week_start"=>strtotime($promotion_week_start),
				":promotion_week_end"=>strtotime($promotion_week_end),
				":promotion_week_banner_link"=>$promotion_week_banner_link,
				":promotion_week_recommand"=>$promotion_week_recommand,
				":promotion_week_best"=>$promotion_week_best,
				":is_view"=>$is_view,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("promotion_weekend.php");
		break;
		case "delete":
			
			
		break;
	}
	
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>