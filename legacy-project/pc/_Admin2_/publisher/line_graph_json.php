<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$search_publisher = filter_input(INPUT_POST, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$start_dt = filter_input(INPUT_POST, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_POST, 'end_dt', FILTER_SANITIZE_STRING);


if($_SESSION['publisher']['start_date']){
	$view_start_date = date("Y-m-d", strtotime($_SESSION['publisher']['start_date']));
	if($view_start_date > $start_dt){
		$start_dt = $view_start_date;
	}
}

if($_SESSION['publisher']['end_date']){
	$view_end_date = date("Y-m-d", strtotime($_SESSION['publisher']['end_date']));
	if($view_end_date < $end_dt){
		$end_dt = $view_end_date;
	}
}


$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		//그래프 데이터 
	$graph_query="
					select t.ord_ymd,t.order_srp,count(t.qty)as order_count,sum(t.qty*t.order_srp)as gross_sales from (
						select ord_ymd,product_code,qty,order_srp
						from tbl_sales_publisher where publisher_code=:publisher_code 
						and ord_ymd between :start_dt and :end_dt and cdt<>'1970-01-01 09:00:00' and ord_ymd>='2017-04-01'
						) as t
					group by t.ord_ymd
					order by t.ord_ymd asc
					";
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt,
		":end_dt"=>$end_dt
	);
	$stmt = $conn->prepare($graph_query);
	$stmt->execute($params);
	$graph_data = $stmt->fetchAll();


	$graph_query2="
				select t.cancel_dt,sum(t.qty*t.order_srp)as total_price from (
						select date_format(canceldt,'%Y-%m-%d')as cancel_dt,product_code,order_srp,qty from directgames.tbl_sales_publisher  where status='9' and publisher_code=:publisher_code and canceldt between :start_dt and :end_dt and cdt<>'1970-01-01 09:00:00' and product_code not in ('10001410','10001130','10001410','10000011') 
						)as t
						group by t.cancel_dt
						order by t.cancel_dt asc
				";
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt." 00:00:00",
		":end_dt"=>$end_dt." 23:59:59"
	);
	$stmt = $conn->prepare($graph_query2);
	$stmt->execute($params);
	$graph_data2 = $stmt->fetchAll();


	$graph = array();
	$graph_list = array();
	$graph_list2 = array();
	$tmp = array();
	$tmp_list = array();

	for($i=1;$i<=date("t", strtotime($end_dt));$i++){
		$tmp_date = date('Y',strtotime($end_dt))."-".date('m',strtotime($end_dt))."-".$i;
		$tmp_date = date("Y-m-d", strtotime($tmp_date));
		$graph_list[$tmp_date]['gross_sales']=0;
		$graph_list[$tmp_date]['refund_sales']=0;
	}

	foreach($graph_data as $key=>$value){
		$graph_list[$value['ord_ymd']]['gross_sales'] = $value['gross_sales'];
	}

	foreach($graph_data2 as $key=>$value){
		$graph_list[$value['cancel_dt']]['refund_sales'] = $value['gross_sales'];
	}

	foreach($graph_list as $key=>$value){
		$graph_list2['month'] = $key;
		$graph_list2['gross_sales'] = $value['gross_sales'];

		if($value['refund_sales']){
			$graph_list2['refund_sales'] = $value['refund_sales'];
		}else{
			$graph_list2['refund_sales'] = 0;
		}
		
		array_push($tmp,$graph_list2);
	}

	foreach($tmp as $key=>$value){
		$tmp_list['month'] = $value['month'];
		$tmp_list['gross_sales'] = $value['gross_sales']-$value['refund_sales'];
		array_push($graph,$tmp_list);
	}
	
	$graph_json = json_encode($graph);

	echo $graph_json;
	exit;
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>