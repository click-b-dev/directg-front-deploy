<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$search_publisher = filter_input(INPUT_POST, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$publisher = filter_input(INPUT_POST, 'publisher', FILTER_SANITIZE_STRING);
$start_dt = filter_input(INPUT_POST, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_POST, 'end_dt', FILTER_SANITIZE_STRING);


if($_SESSION['publisher']['admin_level']=="99"){ //전체관리자
	if(!$search_publisher){
		$search_publisher = $_SESSION['publisher']['publisher'];
	}
	
}else{ //퍼블리셔 관리자
	if($_SESSION['publisher']['publisher']=="12"){
		if(!$search_publisher){ //퍼블리셔 변경가능(taketwo)
			$search_publisher = $_SESSION['publisher']['publisher'];
		}else{ 
			if($search_publisher<>'12' && $search_publisher<>'14' && $search_publisher<>'321'){
				$search_publisher = $_SESSION['publisher']['publisher'];
			}
		}
	}else{//일반 퍼블리셔
		$search_publisher = $_SESSION['publisher']['publisher'];
	}
}

$excel_name = "report_".$publisher." ($start_dt~$end_dt)";

header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header('Content-Disposition: attachment;filename='.$excel_name.'.xls ');

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$query = "select a.ord_ymd,a.product_code,b.product_name_en,c.platform,b.product_srp,a.order_srp,sum(a.qty)as order_count,sum(a.qty*a.order_srp)as total_price from tbl_sales_publisher a inner join tbl_goods_item b on a.product_code=b.product_code inner join directgames.tbl_platform c on b.product_platform=c.idx where a.publisher_code=:publisher_code  and a.ord_ymd between :start_dt and :end_dt  and a.ord_ymd>='2017-04-01' and a.cdt<>'1970-01-01 09:00:00' group by a.ord_ymd,a.product_code,a.order_srp order by a.ord_ymd asc ,a.product_code asc,a.order_srp asc
		";
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt,
		":end_dt"=>$end_dt
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();


	//print_r($data);

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
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0">
<thead>
<tr>
	<th style="text-align:center">Date</th>
	<th style="text-align:center">Title</th>
	<?if($search_publisher=="30" || $search_publisher=="322"){?>
	<th style="text-align:center">BASE SRP</th>
	<th style="text-align:center">Rate</th>
	<?}?>
	<th style="text-align:center">SRP</th>
	<th style="text-align:center">Sales Unit</th>
	<th style="text-align:center">Gross Sales</th>
</tr>
</thead>
<tbody>
<? foreach($data as $value){?>
<tr>
	<td><?=$value['ord_ymd']?></td>
	<td>[<?=$value['platform']?>] <?=$value['product_name_en']?></td>
	<?if($search_publisher=="30" || $search_publisher=="322"){?>
	<td style="text-align:right"><?=number_format($value['product_srp'])?></td>
	<td style="text-align:right"><?=round((1-($value['order_srp']/$value['product_srp']))*100)?>%</td>
	<?}?>
	<td style="text-align:right"><?=number_format($value['order_srp'])?></td>
	<td style="text-align:right"><?=number_format($value['order_count'])?></td>
	<td style="text-align:right"><?=number_format($value['order_srp']*$value['order_count'])?></td>
</tr>
<?	}?>
</tbody>
</table>
</body>
</html>
