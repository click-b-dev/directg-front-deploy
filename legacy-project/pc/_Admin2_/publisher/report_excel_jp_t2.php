<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

include_once("../../../_engine/dbconn_jp.php");

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);

$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
try  {  
	$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
	$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query = "select a.publisher_code,a.currency_converter,a.linepay_fee,a.card_fee,a.webcvs_fee,a.report_year,a.report_month,a.royalty,a.royalty_info,b.publisher,a.reg_date,a.update_date,a.status,a.idx,a.notice_date,a.approval_date from tbl_report_config a inner join tbl_publisher b on a.publisher_code=b.idx where a.idx=:idx";
	$params = array(
				":idx" => $idx,
			);
	$stmt = $conn_dgjp->prepare($query);
	$stmt->execute($params);
	$report_config = $stmt->fetch();

	//리포트 통계
	$report_query= "SELECT b.short_item_code,c.platform,a.product_code,a.product_nm_en,a.publisher_srp,a.rate,a.publisher_price,sum(a.gross_units_sold)as gross_units_sold,sum(a.gross_sales_ex_vat)as gross_sales_ex_vat,
								sum(a.payment_gateway_fee)as payment_gateway_fee,sum(a.net_sales)as net_sales,sum(a.revenue_share)as revenue_share,a.payment_gateway
								FROM tbl_report a inner join tbl_platform c on a.platform_code=c.idx left join tbl_report_t2code b on a.product_code=b.product_code
								WHERE a.parent_idx=:idx 
								group by a.product_code,a.publisher_price,a.payment_gateway 
								order by c.platform asc,a.product_nm_en asc,a.publisher_price asc,a.payment_gateway asc";
	$params = array(
				":idx" => $idx,
			);

	$stmt = $conn_dgjp->prepare($report_query);
	$stmt->execute($params);

	$report_data = $stmt->fetchAll();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$start_date = $report_config['report_year']."-".$report_config['report_month']."-01";

$excel_name = "Sales Report_".$report_config['publisher']." (".$report_config['report_year']."-".$report_config['report_month'].")";

header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header('Content-Disposition: attachment;filename='.$excel_name.'.xls ');
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
	position:relative;
	width:100%;
	margin:5px;
	padding:0;
	display:block;
}

.header .title{
	position:relative;
	width:100%;
	margin:0;
	padding:0;
	float:left;
	display:block;
}

.header .title h2{
	width:100%;
	margin:0;
	padding:0;
	font-size:36px;
	display:block;
}
.header .title p{
	width:100%;
	font-size:24px;
	font-weight:bold;
	display:block;
}

.header .address{
	position:relative;
	float:right;
	padding:0;
	width:250px;
	display:inline-block;
}

.header .address ul{
	margin:0;
	padding:0;
}

.header .address ul li{
	text-align:right;
	font-size:14px;
}

.header .summary{
	position:relative;
	width:100%;
	float:left;
	margin:0;
	padding:0;
	display:block;
	top:0;
}

.header .summary ol{
	margin:15px;
	padding:0;
}

.header .summary ol li{
	font-size:14px;
	font-weight:bold;
}

.container{
	position:relative;
	width:100%;
	display:block;
	float:left;
	font-size:14px;
}

.container table thead tr th{
	border-top:2px solid;
	border-bottom:1px solid;
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

.text-right{
	text-align:right;
}
.text-center{
	text-align:center;
}

.width50{
	width:500px;
}

</style>
</head>
<body>
<div class="header">
	<table width="100%" border="0" cellspacing="0" cellpadding="0">
	<tbody>
	<tr>
		<td colspan="10">
			<div class="title">
				<h2>ROYALTY REPORT</h2>
				<p>Product Statistics - <?=$report_config['publisher']?></p>
			</div>
		</td>
	</tr>
	<tr>
		<td colspan="7">
			<div class="summary">
			<ol>
				<li>Period : <?=$report_config['report_year']?>.<?=$report_config['report_month']?>.01 ~ <?=$report_config['report_month']?>.<?=date('t', strtotime($start_date))?></li>
				<li>Royalty : JPY 1 -> <?=$report_config["currency_converter"]?> <?=$report_config['royalty']?> (<?=$report_config['royalty_info']?>)</li>
				<li>Default currenty : JPY</li>
				<li>Payment Gateway Fee <br/>
					Line PAY - <?=$report_config['linepay_fee']?>%, Credit Card - <?=$report_config['card_fee']?>%, Web convenience store payment - <?=$report_config['webcvs_fee']?>%
				</li>
			</ol>
			</div>
		</td>
		<td colspan="3">
			<div class="address">
			<ul>
				<li><b>H2 Interactive Co., Ltd .</b></li>
				<li>H2 INT Bldg.</li>
				<li>35, Gangseo-ro 56ga-gil,Gangseo-gu</li>
				<li>Seoul, Korea 07583</li>
			</ul>
			</div>
		</td>
	</tr>
	</tbody>
	</table>
</div>

<div class="container">
<table class="table" style="width:1200px;border-collapse:collapse;table-layout:fixed;" border="0" cellspacing="0" cellpadding="0">
<thead>
<tr style='mso-height-source:userset;height:20pt'>
	<th class="text-center" scope="row">SHORT ITEM CODE</th>
	<th class="text-center" scope="row">Platform</th>
	<th class="text-center" scope="row">Product</th>
	<th class="text-center" scope="row">SRP<br/>(JPY)</th>
	<th class="text-center" scope="row">Rate</th>
	<th class="text-center" scope="row">Price<br/>(JPY)</th>
	<th class="text-center" scope="row">PG</th>
	<th class="text-center" scope="row">Units Sold</th>
	<th class="text-center" scope="row">Gross Sales<br/>(excl. VAT)</th>
	<th class="text-center" scope="row">PG Fee</th>
	<th class="text-center" scope="row">Net Sales<br/>(JPY)</th>
	<th class="text-center" scope="row" width="80">Revenue Share<br/>(JPY)</th>
</tr>
</thead>
<tbody>
<?
	foreach($report_data as $value){
		if($value['gross_units_sold']<>0){
?>
<tr style='mso-height-source:userset;height:30pt'>
	<td class="text-center"><?=$value['short_item_code']?></td>
	<td class="text-center"><?=$value['platform']?></td>
	<td style='mso-number-format:"\@";mso-width-source:userset;mso-width-alt:2872;width:200pt'><?=$value['product_nm_en']?></td>
	<td width="70" class="text-right"><?=number_format($value['publisher_srp'],0)?></td>
	<td width="60" class="text-right"><?=$value['rate']?> %</td>
	<td width="80" class="text-right"><?=number_format($value['publisher_price'],0)?></td>
	<td width="80" class="text-center"><?=$value['payment_gateway']?></td>
	<td width="80" class="text-right"><?=number_format($value['gross_units_sold'],0)?></td>
	<td width="80" class="text-right"><?=number_format($value['gross_sales_ex_vat'],0)?></td>
	<td width="80" class="text-right"><?=number_format($value['payment_gateway_fee'],0)?></td>
	<td width="80" class="text-right"><?=number_format($value['net_sales'],0)?></td>
	<td width="80" class="text-right"><?=number_format($value['revenue_share'],0)?></td>
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
	<th colspan="7"></th>
	<th class="text-right"><?=number_format($sum_gross_units_sold)?></th>
	<th class="text-right"><?=number_format($sum_gross_sales_ex_vat)?></th>
	<th class="text-right"><?=number_format($sum_payment_gateway_fee)?></th>
	<th class="text-right"><?=number_format($sum_net_sales)?></th>
	<th class="text-right"><?=number_format($sum_revenue_share)?></th>
</tr>
<tr>
	<td colspan="8"></td>
	<th colspan="2" class="text-center font-num">Royalty Payable</th>
	<th colspan="2" class="text-right"><?=$report_config['currency_converter']?> <?=number_format($sum_revenue_share*$report_config['royalty'],2)?></th>
</tr>
</tfoot>
</table>
</div>
</body>
</html>
