<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

include_once("../../../_engine/dbconn_jp.php");

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$search_publisher = filter_input(INPUT_POST, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$target = filter_input(INPUT_POST, 'target', FILTER_SANITIZE_STRING);

$start_dt = date("Y-m",strtotime ("-6 month"))."-01";
$end_dt = date("Y-m",strtotime ("-1 month"))."-".date("t", mktime(0, 0, 0, date("m",strtotime ("-1 month")), date('d'), date('Y')));

if($_SESSION['publisher']['start_date_jp']){
	$start_dt = date("Y-m-d", strtotime($_SESSION['publisher']['start_date_jp']));
} else {
	$start_dt = date("Y-m",strtotime ("-6 month"))."-01";
}

if($_SESSION['publisher']['end_date_jp']){
	$end_dt = date("Y-m-t",strtotime("-1 month",strtotime($_SESSION['publisher']['end_date_jp'])));
} else {
	$end_dt = date("Y-m",strtotime ("-1 month"))."-".date("t", mktime(0, 0, 0, date("m",strtotime ("-1 month")), date('d'), date('Y')));
}

$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
try  {  
	$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
	$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
		$graph_query="select date_format(canceldt,'%Y/%m')as order_month,sum(qty),sum(qty*order_srp) as total_gross_sales from (
			select canceldt,ordno,qty,order_srp from tbl_sales_publisher
			where publisher_code=:publisher_code 
			and status='9' and step<>'99' and settlekind<>'PAYCO' and canceldt between :start_dt  and :end_dt

			union all
			select canceldt,ordno,qty,order_srp from tbl_sales_publisher
			where publisher_code=:publisher_code 
			and  settlekind='PAYCO' and status='9' and step in ('2','99') and canceldt between :start_dt and :end_dt and cdt<>'1970-01-01 09:00:00'
			)as t
			group by date_format(canceldt,'%Y/%m')
			order by date_format(canceldt,'%Y/%m') asc
		";

	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt.' 00:00:00',
		":end_dt"=>$end_dt.' 23:59:59',
		
	);

	$stmt = $conn_dgjp->prepare($graph_query);
	$stmt->execute($params);
	$graph_data = $stmt->fetchAll();

	$graph = array();
	$graph_list = array();

	foreach($graph_data as $key=>$value){
		$graph_list['month'] = $value['order_month'];
		if($target=="gross_sales"){
			if($value['total_gross_sales']){
				$graph_list['value'] = $value['total_gross_sales'];
			}else{
				$graph_list['value'] = 0;
			}
			
		}else{
			$graph_list['value'] = $value['total_units'];
		}
		array_push($graph,$graph_list);
	}
	
	$graph_json = json_encode($graph);

	echo $graph_json;
	exit;
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>