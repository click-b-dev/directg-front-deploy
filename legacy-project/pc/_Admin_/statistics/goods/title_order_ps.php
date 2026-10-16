<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_POST, 'search_month', FILTER_SANITIZE_STRING);

if(!$search_year||!$search_month){
	exit;
}


$where = [];

if(isset($search_year) && $search_year<>""){
	$where[] = "a.sales_year='".$search_year."'";
}

if(isset($search_month) && $search_month<>""){
	$where[] = "a.sales_month='".$search_month."'";
}

$page=1;

$add_where = "";
foreach($where as $value){
	$add_where.= " and ".$value;
}


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn); 
	
	$orderby = " (sum(a.total_price)+sum(a.dlc_price)) desc";

	$best_ranking = $admin->getTitleRanking($page,$add_where,$orderby,$param);

	if($best_ranking->success == true){
		$result = $best_ranking->resultset->fetchAll();
		$ranking = 1;
		foreach($result as $value){
			if($ranking > 12){
				break;
			}
			$query = "INSERT INTO tbl_title_best SET sales_year=:sales_year, sales_month=:sales_month, title_id=:title_id, title_name=:title_name, ranking=:ranking, is_view=:is_view";
			$params = array(
				":sales_year"=>$search_year,
				":sales_month"=>$search_month,
				":title_id"=>$value['title_id'],
				":title_name"=>$value['title_name'],
				":ranking"=>$ranking,
				":is_view"=>"N"
			);
			$stmt = $conn->prepare($query);
			$stmt->execute($params);
			$ranking++;
		}
		$del_query = "DELETE FROM tbl_title_best WHERE sales_year<>:sales_year OR sales_month<>:sales_month";
		$del_params = array(
			":sales_year"=>$search_year,
			":sales_month"=>$search_month
		);
		$stmt = $conn->prepare($del_query);
		$stmt->execute($del_params);
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>