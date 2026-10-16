<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$promotion_season_name = filter_input(INPUT_POST, 'promotion_season_name', FILTER_SANITIZE_STRING);
$promotion_season_start = filter_input(INPUT_POST, 'promotion_season_start', FILTER_SANITIZE_STRING);
$promotion_season_end = filter_input(INPUT_POST, 'promotion_season_end', FILTER_SANITIZE_STRING);

$promotion_season_banner_pc = filter_input(INPUT_POST, 'promotion_season_banner_pc', FILTER_SANITIZE_STRING);
$promotion_season_banner_mobile = filter_input(INPUT_POST, 'promotion_season_banner_mobile', FILTER_SANITIZE_STRING);
$promotion_season_banner_link = filter_input(INPUT_POST, 'promotion_season_banner_link', FILTER_SANITIZE_STRING);

$promotion_season_recommand_banner = filter_input(INPUT_POST, 'promotion_season_recommand_banner', FILTER_SANITIZE_STRING);
$promotion_season_recommand_1 = filter_input(INPUT_POST, 'promotion_season_recommand_1', FILTER_SANITIZE_STRING);
$promotion_season_recommand_2 = filter_input(INPUT_POST, 'promotion_season_recommand_2', FILTER_SANITIZE_STRING);
$promotion_season_recommand_3 = filter_input(INPUT_POST, 'promotion_season_recommand_3', FILTER_SANITIZE_STRING);
$promotion_season_recommand_4 = filter_input(INPUT_POST, 'promotion_season_recommand_4', FILTER_SANITIZE_STRING);

$promotion_season_best_1 = filter_input(INPUT_POST, 'promotion_season_best_1', FILTER_SANITIZE_STRING);
$promotion_season_best_2 = filter_input(INPUT_POST, 'promotion_season_best_2', FILTER_SANITIZE_STRING);
$promotion_season_best_3 = filter_input(INPUT_POST, 'promotion_season_best_3', FILTER_SANITIZE_STRING);
$promotion_season_best_4 = filter_input(INPUT_POST, 'promotion_season_best_4', FILTER_SANITIZE_STRING);
$promotion_season_best_5 = filter_input(INPUT_POST, 'promotion_season_best_5', FILTER_SANITIZE_STRING);
$promotion_season_best_6 = filter_input(INPUT_POST, 'promotion_season_best_6', FILTER_SANITIZE_STRING);
$promotion_season_best_7 = filter_input(INPUT_POST, 'promotion_season_best_7', FILTER_SANITIZE_STRING);
$promotion_season_best_8 = filter_input(INPUT_POST, 'promotion_season_best_8', FILTER_SANITIZE_STRING);
$promotion_season_best_9 = filter_input(INPUT_POST, 'promotion_season_best_9', FILTER_SANITIZE_STRING);
$promotion_season_best_10 = filter_input(INPUT_POST, 'promotion_season_best_10', FILTER_SANITIZE_STRING);

$promotion_max_discount_1 = filter_input(INPUT_POST, 'promotion_max_discount_1', FILTER_SANITIZE_STRING);
$promotion_max_discount_2 = filter_input(INPUT_POST, 'promotion_max_discount_2', FILTER_SANITIZE_STRING);
$promotion_max_discount_3 = filter_input(INPUT_POST, 'promotion_max_discount_3', FILTER_SANITIZE_STRING);
$promotion_max_discount_link = filter_input(INPUT_POST, 'promotion_max_discount_link', FILTER_SANITIZE_STRING);

$promotion_add_repay_1 = filter_input(INPUT_POST, 'promotion_add_repay_1', FILTER_SANITIZE_STRING);
$promotion_add_repay_2 = filter_input(INPUT_POST, 'promotion_add_repay_2', FILTER_SANITIZE_STRING);
$promotion_add_repay_3 = filter_input(INPUT_POST, 'promotion_add_repay_3', FILTER_SANITIZE_STRING);
$promotion_add_repay_link = filter_input(INPUT_POST, 'promotion_add_repay_link', FILTER_SANITIZE_STRING);

$promotion_price_5000_1 = filter_input(INPUT_POST, 'promotion_price_5000_1', FILTER_SANITIZE_STRING);
$promotion_price_5000_2 = filter_input(INPUT_POST, 'promotion_price_5000_2', FILTER_SANITIZE_STRING);
$promotion_price_5000_3 = filter_input(INPUT_POST, 'promotion_price_5000_3', FILTER_SANITIZE_STRING);
$promotion_price_5000_4 = filter_input(INPUT_POST, 'promotion_price_5000_4', FILTER_SANITIZE_STRING);
$promotion_price_5000_5 = filter_input(INPUT_POST, 'promotion_price_5000_5', FILTER_SANITIZE_STRING);

$promotion_price_10000_1 = filter_input(INPUT_POST, 'promotion_price_10000_1', FILTER_SANITIZE_STRING);
$promotion_price_10000_2 = filter_input(INPUT_POST, 'promotion_price_10000_2', FILTER_SANITIZE_STRING);
$promotion_price_10000_3 = filter_input(INPUT_POST, 'promotion_price_10000_3', FILTER_SANITIZE_STRING);
$promotion_price_10000_4 = filter_input(INPUT_POST, 'promotion_price_10000_4', FILTER_SANITIZE_STRING);
$promotion_price_10000_5 = filter_input(INPUT_POST, 'promotion_price_10000_5', FILTER_SANITIZE_STRING);

$is_view = filter_input(INPUT_POST, 'is_view', FILTER_SANITIZE_STRING);

$notice_title 		= filter_input(INPUT_POST, 'notice_title', FILTER_SANITIZE_STRING);
$notice_btn_title 	= filter_input(INPUT_POST, 'notice_btn_title', FILTER_SANITIZE_STRING);
$notice_btn_url 	= filter_input(INPUT_POST, 'notice_btn_url', FILTER_SANITIZE_STRING);
$notice_view 		= filter_input(INPUT_POST, 'notice_view', FILTER_SANITIZE_STRING);

$promotion_season_recommand = $promotion_season_recommand_1."|".$promotion_season_recommand_2."|".$promotion_season_recommand_3."|".$promotion_season_recommand_4;
$promotion_season_best = $promotion_season_best_1."|".$promotion_season_best_2."|".$promotion_season_best_3."|".$promotion_season_best_4."|".$promotion_season_best_5."|".$promotion_season_best_6."|".$promotion_season_best_7."|".$promotion_season_best_8."|".$promotion_season_best_9."|".$promotion_season_best_10;

$promotion_max_discount =$promotion_max_discount_1."|".$promotion_max_discount_2."|".$promotion_max_discount_3;
$promotion_price_5000 = $promotion_price_5000_1."|".$promotion_price_5000_2."|".$promotion_price_5000_3."|".$promotion_price_5000_4."|".$promotion_price_5000_5;
$promotion_price_10000 = $promotion_price_10000_1."|".$promotion_price_10000_2."|".$promotion_price_10000_3."|".$promotion_price_10000_4."|".$promotion_price_10000_5;

$promotion_add_repay =$promotion_add_repay_1."|".$promotion_add_repay_2."|".$promotion_add_repay_3;
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	switch($mode){
		case "register":
			$query = "insert into tbl_promotion_season set promotion_season_name=:promotion_season_name,promotion_season_start=:promotion_season_start,promotion_season_end=:promotion_season_end,promotion_season_banner_pc=:promotion_season_banner_pc,promotion_season_banner_mobile=:promotion_season_banner_mobile,promotion_season_banner_link=:promotion_season_banner_link,promotion_season_recommand_banner=:promotion_season_recommand_banner,promotion_season_recommand=:promotion_season_recommand,promotion_season_best=:promotion_season_best,promotion_max_discount=:promotion_max_discount,promotion_max_discount_link=:promotion_max_discount_link,promotion_price_5000=:promotion_price_5000,promotion_price_10000=:promotion_price_10000,promotion_add_repay=:promotion_add_repay,promotion_add_repay_link=:promotion_add_repay_link,is_view=:is_view,,notice_title=:notice_title,notice_btn_title=:notice_btn_title,notice_btn_url=:notice_btn_url,notice_view=:notice_view,reg_date=now()";
			$param = array(
				":promotion_season_name"=>$promotion_season_name,
				":promotion_season_start"=>strtotime($promotion_season_start),
				":promotion_season_end"=>strtotime($promotion_season_end),
				":promotion_season_banner_pc"=>$promotion_season_banner_pc,
				":promotion_season_banner_mobile"=>$promotion_season_banner_mobile,
				":promotion_season_banner_link"=>$promotion_season_banner_link,
				":promotion_season_recommand_banner"=>$promotion_season_recommand_banner,
				":promotion_season_recommand"=>$promotion_season_recommand,
				":promotion_season_best"=>$promotion_season_best,
				":promotion_max_discount"=>$promotion_max_discount,
				":promotion_max_discount_link"=>$promotion_max_discount_link,
				":promotion_price_5000"=>$promotion_price_5000,
				":promotion_price_10000"=>$promotion_price_10000,
				":promotion_add_repay"=>$promotion_add_repay,
				":promotion_add_repay_link"=>$promotion_add_repay_link,
				":is_view"=>$is_view,
				":notice_title"=>$notice_title,
				":notice_btn_title"=>$notice_btn_title,
				":notice_btn_url"=>$notice_btn_url,
				":notice_view"=>$notice_view
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("promotion_season.php");
		break;
		case "modify":
			$query = "update tbl_promotion_season set promotion_season_name=:promotion_season_name,promotion_season_start=:promotion_season_start,promotion_season_end=:promotion_season_end,promotion_season_banner_pc=:promotion_season_banner_pc,promotion_season_banner_mobile=:promotion_season_banner_mobile,promotion_season_banner_link=:promotion_season_banner_link,promotion_season_recommand_banner=:promotion_season_recommand_banner,promotion_season_recommand=:promotion_season_recommand,promotion_season_best=:promotion_season_best,promotion_max_discount=:promotion_max_discount,promotion_max_discount_link=:promotion_max_discount_link,promotion_price_5000=:promotion_price_5000,promotion_price_10000=:promotion_price_10000,promotion_add_repay=:promotion_add_repay,promotion_add_repay_link=:promotion_add_repay_link,is_view=:is_view,notice_title=:notice_title,notice_btn_title=:notice_btn_title,notice_btn_url=:notice_btn_url,notice_view=:notice_view where idx=:idx";
			$param = array(
				":promotion_season_name"=>$promotion_season_name,
				":promotion_season_start"=>strtotime($promotion_season_start),
				":promotion_season_end"=>strtotime($promotion_season_end),
				":promotion_season_banner_pc"=>$promotion_season_banner_pc,
				":promotion_season_banner_mobile"=>$promotion_season_banner_mobile,
				":promotion_season_banner_link"=>$promotion_season_banner_link,
				":promotion_season_recommand_banner"=>$promotion_season_recommand_banner,
				":promotion_season_recommand"=>$promotion_season_recommand,
				":promotion_season_best"=>$promotion_season_best,
				":promotion_max_discount"=>$promotion_max_discount,
				":promotion_max_discount_link"=>$promotion_max_discount_link,
				":promotion_price_5000"=>$promotion_price_5000,
				":promotion_price_10000"=>$promotion_price_10000,
				":promotion_add_repay"=>$promotion_add_repay,
				":promotion_add_repay_link"=>$promotion_add_repay_link,
				":is_view"=>$is_view,
				":notice_title"=>$notice_title,
				":notice_btn_title"=>$notice_btn_title,
				":notice_btn_url"=>$notice_btn_url,
				":notice_view"=>$notice_view,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("promotion_season.php");
		break;
		case "delete":
			
			
		break;
	}
	
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>