<?
session_start();
header("Content-Type: text/html; charset=UTF-8"); 
include_once("../../conf/config.php");
include_once("../../lib/common_func.php");
include_once("../../lib/lib.func.php");
include_once("../../../_engine/dbconn_jp.php");

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$search_publisher = filter_input(INPUT_POST, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$search_game = filter_input(INPUT_POST, 'goods_code', FILTER_SANITIZE_NUMBER_INT);
$publisher = filter_input(INPUT_POST, 'publisher', FILTER_SANITIZE_STRING);
$game = filter_input(INPUT_POST, 'game', FILTER_SANITIZE_STRING);
$start_dt = filter_input(INPUT_POST, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_POST, 'end_dt', FILTER_SANITIZE_STRING);

if($_SESSION['publisher']['admin_level']=="99"){ //전체관리자
	if(!$search_publisher){
		$search_publisher = $_SESSION['publisher']['publisher_jp'];
	}
}else{ //퍼블리셔 관리자
	if($_SESSION['publisher']['publisher_jp']=="12"){ //2K
		if(!$search_publisher){
			$search_publisher = $_SESSION['publisher']['publisher_jp'];
		}else{ //일반 퍼블리셔
			if($search_publisher<>'12' && $search_publisher<>'14' && $search_publisher<>'317'){
				$search_publisher = $_SESSION['publisher']['publisher_jp'];
			}
		}
	}else{
		$search_publisher = $_SESSION['publisher']['publisher_jp'];
	}
}

$excel_name = "report_".$publisher." ($start_dt~$end_dt)";

header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header('Content-Disposition: attachment;filename='.$excel_name.'.xls ');

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_JP.';port=3306;charset=utf8';
try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	/*
	select t1.*,t2.goods_nm_en,t2.revenue,t2.goods_srp,t2.price,count(t1.qty)as order_count,(t1.order_srp*count(t1.qty)) as total_price from (
						select a.ord_ymd,b.product_code,b.product_nm,

						b.tot_pay,b.qty,b.publisher_code,b.order_srp,b.order_ppr from tbl_order a 
						inner join tbl_order_item b on a.id=b.order_id 
						where a.step='2' and b.status in ('2','8','9') and b.publisher_code='$search_publisher' and b.product_code='$search_game'
						and a.ord_ymd between '$start_dt' and '$end_dt' and b.supp_cd in ('1','2','4','5','6') 
						) as t1 inner join  tbl_goods t2 on t1.product_code=t2.goods_code
						group by t1.ord_ymd,t1.product_code,t1.order_srp
						order by t1.ord_ymd asc,t1.product_code asc,t1.order_srp asc
	*/
	$query = "select a.ord_ymd,a.product_code,a.product_nm,b.goods_nm_en,c.platform,a.order_srp,sum(a.qty)as order_count from tbl_sales_publisher a inner join tbl_goods b on a.product_code=b.goods_code inner join tbl_platform c on b.platform_code=c.idx where 
						a.publisher_code='$search_publisher' and a.ord_ymd between '$start_dt' and '$end_dt'
						and a.ord_ymd>='2021-05-01' and a.cdt<>'1970-01-01 09:00:00' and a.product_code='$search_game'
						group by a.ord_ymd,a.product_code,a.order_srp
						order by a.ord_ymd asc,a.product_code asc,a.order_srp asc
		";
	$params = array(
		":publisher_code"=>$search_publisher,
		":product_code"=>$search_game,
		":start_dt"=>$start_dt,
		":end_dt"=>$end_dt
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>
<!DOCTYPE html>
<head>
<meta charset="utf-8" />
<style type="text/css">
table thead tr th{
	border:1px solid;
	background:#EFEFEF;
}
table tbody tr td{
	border:1px solid;
}

table tfoot tr td{
	border:1px solid;
	background:#EFEFEF;
}
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<thead>
<tr>
	<th style="text-align:center">Date</th>
	<th style="text-align:center">Title</th>
	<th style="text-align:center">SRP</th>
	<th style="text-align:center">Sales Unit</th>
	<th style="text-align:center">Gross Sales</th>
</tr>
</thead>
<tbody>
<? foreach($data as $value){?>
<tr>
	<td><?=$value['ord_ymd']?></td>
	<td>[<?=$value['platform']?>] <?=$value['goods_nm_en']?></td>
	<td style="text-align:right"><?=number_format($value['order_srp'])?></td>
	<td style="text-align:right"><?=number_format($value['order_count'])?></td>
	<td style="text-align:right"><?=number_format($value['order_srp']*$value['order_count'])?></td>
</tr>
<?		$total_sales_unit+=$value['order_count'];
		$total_gross_sales+=$value['order_srp']*$value['order_count'];
	}
?>
</tbody>
<tfoot>
<tr>
	<td style="text-align:center">Total</td>
	<td></td>
	<td></td>
	<td style="text-align:right"><?=number_format($total_sales_unit)?></td>
	<td style="text-align:right"><?=number_format($total_gross_sales)?></td>
</tr>
</tfoot>
</table>
</body>
</html>
