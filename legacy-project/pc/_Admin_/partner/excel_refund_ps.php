<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

if($_SESSION['admin']['admin_id']==""){
	go("../index.php");
}

$publisher = filter_input(INPUT_POST, 'publisher', FILTER_SANITIZE_STRING);
$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_NUMBER_INT);
$search_year = filter_input(INPUT_POST, 'search_year', FILTER_SANITIZE_NUMBER_INT);
$search_month = filter_input(INPUT_POST, 'search_month', FILTER_SANITIZE_NUMBER_INT);

$search_date = $search_year."-".$search_month;

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$query = "select canceldt,ord_ymd,publisher_code,product_code,product_nm,order_srp,qty from tbl_sales_publisher where status='9' and publisher_code=:publisher_code and date_format(canceldt,'%Y-%m') =:search_date and cdt<>'1970-01-01 09:00:00' ";
	$stmt = $conn->prepare($query);
	$params = array(
		':publisher_code'=>$publisher_code,
		':search_date'=>$search_date,
	);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	die();  
	//exit;
}

header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header('Content-Disposition: attachment;filename='.$_POST['excel_name'].'.xls '); 
?>
<!DOCTYPE html>
<html class="no-js">
<head>
<meta charset="utf-8" />
<style type="text/css">
body{
	width:100%;
	margin:0;
	padding:0;
	font-family:"Calibri";
}

ul{
	list-style:none;
}

.header{
	margin:5px;
	padding:0;
}

.title{
	margin:0;
	padding:0;
	float:left;
}

.title h2{
	margin:0;
	padding:0;
	font-size:36px;
}
.title p{
	font-size:24px;
	font-weight:bold;
}

.summary{
	width:100%;
	display:block;
	float:left;
	margin:0;
	padding:0;
}

.summary ol{
	margin:15px;
	padding:0;
}

.summary ol li{
	font-size:14px;
	font-weight:bold;
}

.address{
	position:absolute;
	float:right;
	margin:0;
	padding:0;
	width:200px;
}

.address ul{
	margin:0;
	padding:0;
}

.address ul li{
	text-align:right;
	font-size:14px;
}

.container{
	font-size:14px;
}

.container table thead tr th{
	border-top:2px solid;
	border-bottom:2px solid;
	height:50px;
}

.container table tfoot tr th{
	border-top:2px solid;
}

.container table tfoot tr td{
	border-top:2px solid;
	height:25px;
}

.container .royalty{
	width:100%;
	float:right;
	background:yellow;
	height:40px;
	padding-left:10px;
	padding-right:10px;
	font-weight:bold;
	text-align:right;
}

.container .royalty span{
	text-align:right;
}

</style>
</head>
<body>
<div class="container">
	<div class="table-responsive statistics-board" id="excelData">
		<table class="table table-rows">
		<colgroup>
			<col width="5%"/>
			<col width="4%"/>
			<col width="10%"/>
			<col width="8%"/>
			<col span="4" width="5%"/>
		</colgroup>
		<thead>
		<tr class="nowrap text-center">
			<th>환불일자</th>
			<th class="bln">퍼블리셔</th>
			<th class="bln">상품코드</th>
			<th class="bln">상품명</th>
			<th class="bln">수량</th>
			<th class="bln">SRP</th>
			<th>주문일자</th>
		</tr>
		</thead>
		<tbody>
		<? $loop_count = 0;
			foreach($data as $key=>$value){
		?>
		
		<tr class="nowrap text-end">
			<td class="font-date bln text-center"><span class="font-date"><?=$value['canceldt']?></span></td>
			<td class="font-date bln text-center"><span class="font-date"><?=$publisher?></span></td>
			<td class="font-date text-center"><span class="font-date"><?=$value['product_code']?></span></td>
			<td class="font-date text-start"><span class="font-date game_nm"><?=$value['product_nm']?></span></td>
			<td class="font-num border-left text-end"><span class="total_count"><?=number_format($value['qty'],0)?></span></td>
			<td class="font-num border-left text-end"><span class="total_count"><?=number_format($value['order_srp'],0)?></span></td>
			<td class="font-num border-left text-center"><span class="font-date"><?=$value['ord_ymd']?></span></td>
			
		</tr>
		<?	$loop_count++;
				$total_price+=$value['order_srp'];
			}
		?>
		</tbody>
		<tfoot>
		<tr class="nowrap text-end">
			<th class="font-num tac total" colspan="3">합계</th>
			<th class="font-num"></th>
			<th class="font-num"><?=number_format($loop_count,0)?></th>
			<th class="font-num"><span id="total_price"><?=number_format($total_price,0)?></span></th>
			<th class="font-num"></th>
		</tr>
		</tfoot>
		</table>
	</div>
</div>
</body>
</html>