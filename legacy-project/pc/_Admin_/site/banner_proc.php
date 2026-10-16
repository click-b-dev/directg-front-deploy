<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_STRING);
$banner_title = filter_input(INPUT_POST, 'banner_title', FILTER_SANITIZE_STRING);
$banner_pc = filter_input(INPUT_POST, 'banner_pc', FILTER_SANITIZE_STRING);
$banner_mobile = filter_input(INPUT_POST, 'banner_mobile', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_POST, 'product_code', FILTER_SANITIZE_STRING);
$banner_link = filter_input(INPUT_POST, 'banner_link', FILTER_SANITIZE_STRING);
$banner_publisher = filter_input(INPUT_POST, 'banner_publisher', FILTER_SANITIZE_STRING);
$banner_target = filter_input(INPUT_POST, 'banner_target', FILTER_SANITIZE_STRING);
$banner_start = filter_input(INPUT_POST, 'banner_start', FILTER_SANITIZE_STRING);
$banner_end = filter_input(INPUT_POST, 'banner_end', FILTER_SANITIZE_STRING);
$banner_sort = filter_input(INPUT_POST, 'banner_sort', FILTER_SANITIZE_STRING);
$flag = filter_input(INPUT_POST, 'flag', FILTER_SANITIZE_STRING);
$bannerPeriodOutputFl = filter_input(INPUT_POST, 'bannerPeriodOutputFl', FILTER_SANITIZE_STRING);
$show_prod_info = filter_input(INPUT_POST, 'show_prod_info', FILTER_SANITIZE_STRING);
$show_sale_info = filter_input(INPUT_POST, 'show_sale_info', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminGoods= new AdminGoods($conn);
	
	switch($mode){
		case "register":
			$query = "INSERT INTO tbl_main_banner 
                    SET
                        banner_title = :banner_title,
                        banner_pc = :banner_pc,
                        banner_mobile = :banner_mobile,
                        product_code = :product_code,
                        banner_publisher = :banner_publisher,
                        banner_link = :banner_link,
                        banner_target = :banner_target,
                        banner_start = :banner_start,
                        banner_end = :banner_end,
                        banner_sort = :banner_sort,
                        flag = :flag,
                        bannerPeriodOutputFl = :bannerPeriodOutputFl,
                        show_prod_info = :show_prod_info,
                        show_sale_info = :show_sale_info,
                        reg_date = now()";
			$param = array(
				":banner_title"=>$banner_title,
				":banner_pc"=>$banner_pc,
				":banner_mobile"=>$banner_mobile,
				":product_code"=>$product_code,
				":banner_publisher"=>$banner_publisher,
				":banner_link"=>$banner_link,
				":banner_target"=>$banner_target,
				":banner_start"=>strtotime($banner_start),
				":banner_end"=>strtotime($banner_end),
				":banner_sort"=>$banner_sort,
				":flag"=>$flag,
				":bannerPeriodOutputFl"=>$bannerPeriodOutputFl,
                ":show_prod_info" => $show_prod_info,
                ":show_sale_info" => $show_sale_info
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("banner_list.php");
		break;
		case "modify":
			$query = "UPDATE tbl_main_banner 
                    SET 
                        banner_title = :banner_title,
                        banner_pc = :banner_pc,
                        banner_mobile = :banner_mobile,
                        product_code = :product_code,
                        banner_publisher = :banner_publisher,
                        banner_link = :banner_link,
                        banner_target = :banner_target,
                        banner_start = :banner_start,
                        banner_end = :banner_end,
                        banner_sort = :banner_sort,
                        flag = :flag,
                        bannerPeriodOutputFl = :bannerPeriodOutputFl,
                        show_prod_info = :show_prod_info,
                        show_sale_info = :show_sale_info
                    WHERE idx = :idx";
			$param = array(
				":banner_title"=>$banner_title,
				":banner_pc"=>$banner_pc,
				":banner_mobile"=>$banner_mobile,
				":product_code"=>$product_code,
				":banner_publisher"=>$banner_publisher,
				":banner_link"=>$banner_link,
				":banner_target"=>$banner_target,
				":banner_start"=>strtotime($banner_start),
				":banner_end"=>strtotime($banner_end),
				":banner_sort"=>$banner_sort,
				":flag"=>$flag,
				":bannerPeriodOutputFl"=>$bannerPeriodOutputFl,
                ":show_prod_info" => $show_prod_info,
                ":show_sale_info" => $show_sale_info,
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			go("banner_list.php");
		break;
		case "delete":
		break;
		case "banner_link_search":
			$query = "select goods_sku,game_type,product_platform from tbl_goods_item where product_code=:product_code";
			$param = array(
				":product_code"=>$product_code,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
			$data=$stmt->fetch();
			
			switch($data['game_type']){
				case "game":
					$title_info = $adminGoods->getTitleInfo($product_code);
					$main_banner_link = "/game/game_view.html?product_id=".$title_info['sku']."&sku=".$data['goods_sku']."&platform=".$data['product_platform'];
				break;
				case "dlc":
					$main_banner_link = "/game/dlc_view.html?sku=".$data['goods_sku']."&platform=".$data['product_platform'];
				break;
				case "music":
					$main_banner_link = "/game/dlc_view.html?sku=".$data['goods_sku']."&platform=".$data['product_platform'];
				break;
				case "bundle":
					$main_banner_link = "/game/bundle_view.html?sku=".$data['goods_sku']."&platform=".$data['product_platform'];
				break;
				case "accessories":
					$title_info = $adminGoods->getTitleInfo($product_code);
					$main_banner_link = "/game/goods_item_view.html?product_id=".$title_info['sku']."&sku=".$data['goods_sku']."&platform=".$data['product_platform'];
				break;
			}
			
			echo $main_banner_link;
		break;
		case "banner_sort_up": //배너정렬 순서 위로
			$query = "update tbl_main_banner set banner_sort=banner_sort-1 where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "banner_sort_down": //배너정렬 순서 아래로
			$query = "update tbl_main_banner set banner_sort=banner_sort+1 where idx=:idx";
			$param = array(
				":idx"=>$idx,
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($param);
		break;
		case "banner_delete": //배너삭제
			$query = "update tbl_main_banner set is_del='Y' where idx=:idx";
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