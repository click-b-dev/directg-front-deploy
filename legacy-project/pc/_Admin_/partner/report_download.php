<?php
//error_reporting(E_ALL ^ E_NOTICE);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

if($_SESSION['admin']['admin_id']==""){
	go("../index.php");
}

$idx = filter_input(INPUT_POST,'idx',FILTER_SANITIZE_NUMBER_INT);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$adminPartner= new AdminPartner($conn);

	//리포트 설정 정보
	$report_config = $adminPartner->getPartnerReportInfo($idx);

	//리포트 통계 정보
	$report_data = $adminPartner->getPartnerReportData($idx);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$start_date = $report_config['report_year']."-".$report_config['report_month']."-01";

$re_publisher=preg_replace("/[#\&\+\-%@=\/\\\:;,\.'\"\^`~\_|\!\?\*$#<>()\[\]\{\}]/i", "", $report_config['publisher']);

if($report_config['report_term']=="T"){ //분기
	$file_name = "report_DGKR_".$re_publisher."_".$report_config['report_year']."-Q".$report_config['report_month'];
}else{ //월
	$file_name = "report_DGKR_".$re_publisher."_".$report_config['report_year']."-".$report_config['report_month'];
}
//$file_name=str_replace(',','',$file_name);
//print_r($_POST);
header("Content-Type:application/vnd.ms-excel;charset=utf-8");
header('Content-Disposition: attachment;filename=\"'.$file_name.'\".xls'); 
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
	text-align:right;
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
<div class="header">
	<div class="title">
		<h2>ROYALTY REPORT</h2>
		<p>Product Statistics - <?=$report_config['publisher']?></p>
	</div>

	<div class="address">
	<ul>
		<li><b>H2 Interactive Co., Ltd .</b></li>
		<li>H2 INT Bldg., 35, Gangseo-ro 56ga-gil</li>
		<li>Gangseo-gu, Seoul, Korea</li>
		<li>Seoul, Korea 07583</li>
	</ul>
	</div>

	<div class="summary">
	<ol>
		<li>Period : <?=$report_config['report_year']?>.<?=$report_config['report_month']?>.01 ~ <?=date('t', strtotime($start_date))?></li>
		<li>Royalty : KRW 1 -> <?=$report_config['currency_converter']?> <?=$report_config['royalty']?> (<?=$report_config['royalty_info']?>)</li>
		<li>Default currenty : KRW</li>
		<li>Payment Gateway Fee <br/>
			Account - <?=$report_config['account_fee']?>%, Credit Card - <?=$report_config['card_fee']?>%, Mobile PayMent - <?=$report_config['mobile_fee']?>%
		</li>
	</ol>
	</div>
</div>

<div class="container">
	<table class="table table-rows">
	<thead>
	<tr>
		<th class="text-center">Platform</th>
		<th class="text-center">Product</th>
		<th class="text-center">SRP<br/>(KRW)</th>
		<th class="text-center">Rate</th>
		<th class="text-center">Price<br/>(KRW)</th>
		<th class="text-center">PG</th>
		<th class="text-center">Units Sold</th>
		<th class="text-center">Gross Sales<br/>(excl. VAT)</th>
		<th class="text-center">PG Fee</th>
		<th class="text-center">Net Sales<br/>(KRW)</th>
		<th class="text-center">Revenue Share<br/>(KRW)</th>
	</tr>
	</thead>
	<tbody>
	<?
		foreach($report_data as $value){
			if($value['gross_units_sold']<>0){
	?>
	<tr>
		<td class="text-center"><?=$value['platform']?></td>
		<td><?=$value['product_nm_en']?></td>
		<td  class="text-right"><?=number_format($value['publisher_srp'])?></td>
		<td class="text-right"><?=$value['rate']?> %</td>
		<td  class="text-right"><?=number_format($value['publisher_price'])?></td>
		<td class="text-center"><?=$value['payment_gateway']?></td>
		<td  class="text-right"><?=number_format($value['gross_units_sold'])?></td>
		<td  class="text-right"><?=number_format($value['gross_sales_ex_vat'])?></td>
		<td  class="text-right"><?=number_format($value['payment_gateway_fee'])?></td>
		<td  class="text-right"><?=number_format($value['net_sales'])?></td>
		<td  class="text-right"><?=number_format($value['revenue_share'])?></td>
	</tr>
		<?		$sum_gross_units_sold +=$value['gross_units_sold'];
					$sum_gross_sales_ex_vat +=$value['gross_sales_ex_vat'];
					$sum_payment_gateway_fee+=$value['payment_gateway_fee'];
					$sum_net_sales+=$value['net_sales'];
					$sum_revenue_share+=$value['revenue_share'];
				}
			}
	?>
	</tbody>
	<tfoot>
	<tr>
		<th colspan="6">Total</th>
		<th class="text-right"><?=number_format($sum_gross_units_sold)?></th>
		<th class="text-right"><?=number_format($sum_gross_sales_ex_vat)?></th>
		<th class="text-right"><?=number_format($sum_payment_gateway_fee)?></th>
		<th class="text-right"><?=number_format($sum_net_sales)?></th>
		<th class="text-right"><?=number_format($sum_revenue_share)?></th>
	</tr>
	<tr>
		<td colspan="7"></td>
		<th colspan="2" class="text-center font-num">Royalty Payable</th>
		<th colspan="2" class="text-right"><?=$report_config['currency_converter']?> <?=number_format($sum_revenue_share*$report_config['royalty'],2)?></th>
	</tr>
	</tfoot>
	</table>
</div>
</body>
</html>