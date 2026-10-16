<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_POST, 'search_month', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn); 
	
	$start_date = $search_year."-".$search_month."-01";
	$last_day = date("t", mktime(0, 0, 1, $search_month, 1, $search_year));
	$end_date = $search_year."-".$search_month."-".$last_day;

	$sales_title = $admin->getGoodsSalesCount($start_date,$end_date);

	$title_list = array();
	foreach($sales_title as $value){
		switch($value['product_type']){
			case "game":
				$title_info = $admin->getGameTitleSearch($value['product_code']);
				$title_list[$title_info['title_id']]['title_id'] =$title_info['title_id'] ;
				$title_list[$title_info['title_id']]['title_name'] =$title_info['title_name'] ;
				$title_list[$title_info['title_id']]['total_count']+=$value['total_count'] ;
				$title_list[$title_info['title_id']]['total_price']+=$value['total_price'] ;
			break;
			case "dlc":case "music":
				$title_info = $admin->getDLCTitleSearch($value['product_code']);
				$title_list[$title_info['title_id']]['title_id'] =$title_info['title_id'] ;
				$title_list[$title_info['title_id']]['title_name'] =$title_info['title_name'] ;
				$title_list[$title_info['title_id']]['dlc_count']+=$value['total_count'] ;
				$title_list[$title_info['title_id']]['dlc_price']+=$value['total_price'] ;
			break;
			case "edition":
				$title_info = $admin->getEditionTitleSearch($value['product_code']);
				$title_list[$title_info['title_id']]['title_id'] =$title_info['title_id'] ;
				$title_list[$title_info['title_id']]['title_name'] =$title_info['title_name'] ;
				$title_list[$title_info['title_id']]['total_count']+=$value['total_count'] ;
				$title_list[$title_info['title_id']]['total_price']+=$value['total_price'] ;
			break;
		}
	}

	foreach($title_list as $value){
		if($value['title_id']){
			$query = "insert into tbl_sales_ranking set sales_year=:sales_year,sales_month=:sales_month,title_id=:title_id,title_name=:title_name,total_count=:total_count,total_price=:total_price,dlc_count=:dlc_count,dlc_price=:dlc_price ON DUPLICATE KEY UPDATE total_count=:total_count,total_price=:total_price,dlc_count=:dlc_count,dlc_price=:dlc_price";
			$params = array(
				":sales_year"=>$search_year,
				":sales_month"=>$search_month,
				":title_id"=>$value['title_id'],
				":title_name"=>$value['title_name'],
				":total_count"=>$value['total_count'],
				":total_price"=>$value['total_price'],
				":dlc_count"=>$value['dlc_count'],
				":dlc_price"=>$value['dlc_price'],
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
		}

		//print_r($params);
	}
	
	$config_query = "insert into tbl_best_title_config set sales_date=:sales_date,batch_date=now() ON DUPLICATE KEY UPDATE batch_date=now()";
	$params = array(
		":sales_date"=>$search_year.$search_month,
	);
	$stmt = $conn->prepare($config_query);
	$stmt->execute($params);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>