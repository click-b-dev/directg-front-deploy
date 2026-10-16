<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$ord_ymd = filter_input(INPUT_POST, 'ord_ymd', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_STRING);


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	switch($mode){
		case "batch_day":
			switch($search_year){
				case "2013":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2013 a inner join tbl_order_item_2013 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2013 = $stmt->fetchAll();

					$is_2013 = true;
				break;
				case "2014":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2014 a inner join tbl_order_item_2014 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2014 = $stmt->fetchAll();

					$is_2014 = true;
				break;
				case "2015":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2015 a inner join tbl_order_item_2015 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2015 = $stmt->fetchAll();

					$is_2015 = true;
				break;
				case "2016":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2016 a inner join tbl_order_item_2016 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2016 = $stmt->fetchAll();

					$is_2016 = true;
				break;
				case "2017":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2017 a inner join tbl_order_item_2017 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2017 = $stmt->fetchAll();

					$is_2017 = true;
				break;
				case "2018":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2018 a inner join tbl_order_item_2018 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2018 = $stmt->fetchAll();

					$is_2018 = true;
				break;
				case "2019":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2019 a inner join tbl_order_item_2019 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2019 = $stmt->fetchAll();

					$is_2019 = true;
				break;
				case "2020":
					$query = "select a.ord_ymd,b.product_code,b.product_nm,count(*)as sales_count,b.tot_pay from tbl_order_2020 a inner join tbl_order_item_2020 b on a.id=b.order_id where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.tot_pay order by b.product_code asc,b.tot_pay asc";
					$params = array(
						":ord_ymd"=>$ord_ymd,
					);
					$stmt = $conn_dgkr->prepare($query);
					$stmt->execute($params);
					$sales_data_2020 = $stmt->fetchAll();

					$is_2020 = true;
				break;
			}
		break;
	}
	
	$d_query = "delete from tbl_sales where ord_ymd=:ord_ymd";
	$stmt = $conn->prepare($d_query);
	$params = array(
		":ord_ymd"=>$ord_ymd
	);
	$stmt->execute($params);

	$query = "select a.ord_ymd,b.product_code,b.product_name,count(*)as sales_count,b.price,b.is_promotion from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.step='2' and b.status='2' and a.ord_ymd=:ord_ymd group by b.product_code,b.price order by b.product_code asc,b.price asc";
	$params = array(
		":ord_ymd"=>$ord_ymd,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$sales_data = $stmt->fetchAll();

	foreach($sales_data as $value){
		$query="insert into tbl_sales set product_code=:product_code,product_name=:product_name,unit_price=:unit_price,sales_count=:sales_count,ord_ymd=:ord_ymd,is_promotion=:is_promotion ON DUPLICATE KEY UPDATE sales_count=:sales_count,is_promotion=:is_promotion";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$value['product_code'],
			":product_name"=>$value['product_name'],
			":unit_price"=>$value['price'],
			":sales_count"=>$value['sales_count'],
			":ord_ymd"=>$value['ord_ymd'],
			":is_promotion"=>$value['is_promotion'],
		);
		
		$stmt->execute($params);
		$order_price+= ($value['price']*$value['sales_count']);
	}
	
	//주문집계 로그기록
	$query="insert into tbl_sales_log set ord_ymd=:ord_ymd,batch_date=now() ON DUPLICATE KEY UPDATE batch_date=now()";
	$stmt = $conn->prepare($query);
	$params = array(
		":ord_ymd"=>$value['ord_ymd'],
	);
	
	$stmt->execute($params);
	
	//매출집계
	$query2 = "select ord_ymd,count(*)as total_count,sum(total_price)as total_price,sum(use_emoney)as total_emoney from tbl_order where ord_ymd=:ord_ymd and step='2' group by ord_ymd";
	$params2 = array(
		":ord_ymd"=>$ord_ymd,
	);
	$stmt = $conn->prepare($query2);
	$stmt->execute($params2);
	$checkout_data = $stmt->fetch();
	
	if($checkout_data['ord_ymd']){
		$query="insert into tbl_sales_day set order_day=:order_day,order_price=:order_price,checkout_price=:checkout_price,checkout_count=:checkout_count,emoney=:emoney,batch_date=now() ON DUPLICATE KEY UPDATE order_price=:order_price,checkout_price=:checkout_price,checkout_count=:checkout_count,emoney=:emoney,batch_date=now()";
		$stmt = $conn->prepare($query);
		$params = array(
			":order_day"=>$checkout_data['ord_ymd'],
			":order_price"=>$order_price,
			":checkout_price"=>$checkout_data['total_price'],
			":checkout_count"=>$checkout_data['total_count'],
			":emoney"=>$checkout_data['total_emoney'],
		);
		
		$stmt->execute($params);
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>