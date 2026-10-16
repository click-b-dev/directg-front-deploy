<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

include_once("../../../_engine/dbconn_jp.php");

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
			if($search_publisher<>'12' && $search_publisher<>'14' && $search_publisher<>'317'){
				$search_publisher = $_SESSION['publisher']['publisher'];
			}
		}
	}else{//일반 퍼블리셔
		$search_publisher = $_SESSION['publisher']['publisher'];
	}
}

$excel_name = "refund_".$publisher." ($start_dt~$end_dt)";

header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header('Content-Disposition: attachment;filename='.$excel_name.'.xls ');

$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
try  {  
	$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
	$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$query = "select date_format(t.canceldt,'%Y-%m-%d')as cancel_dt,t.product_code,b.goods_nm_en,c.platform,b.goods_srp,t.order_srp,t.ord_ymd,t.qty as order_count from (
						select product_code,order_srp,qty,canceldt,ord_ymd from tbl_sales_publisher  
						where publisher_code=:publisher_code and canceldt between :start_dt and :end_dt and step<>'99' and status='9'
						and ord_ymd>='2021-05-01' and cdt<>'1970-01-01 09:00:00' 

					)as t inner join tbl_goods b on t.product_code=b.goods_code inner join tbl_platform c on b.platform_code=c.idx
					order by date_format(t.canceldt,'%Y-%m-%d') asc,t.product_code asc,t.order_srp asc
		";
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt. " 00:00:00",
		":end_dt"=>$end_dt. " 23:59:59"
	);
	$stmt = $conn_dgjp->prepare($query);
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
	<th style="text-align:center">Refund Date</th>
	<th style="text-align:center">Title</th>
	<?if($search_publisher=="30"){?>
	<th style="text-align:center">BASE SRP</th>
	<th style="text-align:center">Rate</th>
	<?}?>
	<th style="text-align:center">SRP</th>
	<th style="text-align:center">Sales Unit</th>
	<th style="text-align:center">Order Date</th>
</tr>
</thead>
<tbody>
<? foreach($data as $value){?>
<tr>
	<td style="text-align:center"><?=$value['cancel_dt']?></td>
	<td>[<?=$value['platform']?>] <?=$value['goods_nm_en']?></td>
	<?if($search_publisher=="30"){?>
	<td style="text-align:right"><?=number_format($value['goods_srp'])?></td>
	<td style="text-align:right"><?=round((1-($value['order_srp']/$value['goods_srp']))*100)?>%</td>
	<?}?>
	<td style="text-align:right"><?=number_format($value['order_srp'])?></td>
	<td style="text-align:right"><?=number_format($value['order_count'])?></td>
	<td style="text-align:center"><?=$value['ord_ymd']?></td>
</tr>
<?	}?>
</tbody>
</table>
</body>
</html>
