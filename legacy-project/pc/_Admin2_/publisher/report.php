<?
session_start();
$admin_dir = "/_Admin2_";
include_once("../../conf/config.php");
include_once("../../lib/common_func.php");
include_once("../../lib/lib.func.php");
include_once("../../../_engine/dbconn.php");
if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

if($_SESSION['publisher']['admin_level']<>"99"){
	go("./main.php");
}

$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$start_dt = filter_input(INPUT_GET, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_GET, 'end_dt', FILTER_SANITIZE_STRING);

if(!$search_publisher){
	$search_publisher = $_SESSION['publisher']['publisher'];
}

$royalty = "0.0009";

if(!$start_dt || !$end_dt){
	$start_dt = date('Y-m')."-01";
	$end_dt = date('Y-m-d');
}

$selected['search_publisher'][$search_publisher] = "selected";

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//퍼블리셔 목록
	if($_SESSION['publisher']['admin_level']=="99"){
		$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' order by publisher asc";
	}else{
		if($_SESSION['publisher']['publisher']=="12" || $_SESSION['publisher']['publisher']=="14" || $_SESSION['publisher']['publisher']=="321"){
			$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' and idx in ('12','14','321') order by publisher asc";
		}else{
			$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' and idx='$search_publisher' order by publisher asc";
		}
	}

	$stmt = $conn->prepare($publisher_query);
	$stmt->execute();
	$publisher_data = $stmt->fetchAll();

	$query = "
	select t1.*,t2.goods_nm_en,t2.revenue,t2.goods_srp,t2.price,count(t1.qty)as order_count from (
		select b.product_code,b.product_nm,
		case when a.settlekind='SC0010' then 'Credit'
			when settlekind='SC0030' then 'Account'
			when settlekind='SC0040' then 'Account'
			when settlekind='SC0060' then 'Mobile'
			when settlekind='DG0000' then 'Account'
			when settlekind='SC0000' then 'Account'
			when settlekind='000000' then 'Account'
			when settlekind='PAYCO' then 'PAY'
			end as settlekind,

		b.tot_pay,b.qty,b.publisher_code,b.order_srp,b.order_ppr from tbl_order a 
		inner join tbl_order_item b on a.id=b.order_id 
		where a.step='2' and b.status='2' and b.publisher_code='".$search_publisher."'
		and a.ord_ymd between '".$start_dt."' and '".$end_dt."' and b.supp_cd in ('1','2','4','5','6') and b.product_code not in ('10001410','10001130','10001410','10000011') $add_where
		) as t1 inner join tbl_goods t2 on t1.product_code=t2.goods_code

		group by t1.product_code,t1.settlekind,t1.order_srp
		order by t1.product_code asc,t1.settlekind asc,t1.order_srp asc
	";
		$params = array(
		":publisher_code"=>$search_publisher,
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
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>AdminLTE 2 | Invoice</title>
  <!-- Tell the browser to be responsive to screen width -->
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
  <!-- Bootstrap 3.3.7 -->
  <link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css">
  <!-- Ionicons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
  <!-- Theme style -->
  <link rel="stylesheet" href="dist/css/AdminLTE.min.css">
  <!-- AdminLTE Skins. Choose a skin from the css/skins
       folder instead of downloading all of them to reduce the load. -->
  <link rel="stylesheet" href="dist/css/skins/_all-skins.min.css">
  <link rel="stylesheet" href="plugins/datepicker/datepicker3.css">

  <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
  <![endif]-->

  <!-- Google Font -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic">
</head>
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">
  <? include "inc/top.php"?>
  <!-- Left side column. contains the logo and sidebar -->
  <? include "inc/left.php"?>
  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        Report
        <small></small>
      </h1>
      <ol class="breadcrumb">
        <li><a href="#"><i class="fa fa-dashboard"></i> Home</a></li>
        <li><a href="#">Report</a></li>
        <li class="active">Invoice</li>
      </ol>
    </section>

    <div class="pad margin no-print">
      <div class="callout callout-info" style="margin-bottom: 0!important;">
        <h4><i class="fa fa-info"></i> Note:</h4>
        This page has been enhanced for printing. Click the print button at the bottom of the invoice to test.
      </div>
    </div>

	 <form name="searchFrm" method="get" action="<?=$PHP_SELF?>">
	 <div class="row">
		<div class="col-sm-offset-4 col-sm-2">
			<div class="form-group">
				<select class="form-control" name="search_publisher" id="search_publisher">
				  <?foreach($publisher_data as $value){?>
					<option value="<?=$value['idx']?>" <?=$selected['search_publisher'][$value['idx']]?>><?=$value['publisher']?></option>
					<?}?>
				</select>
			</div>
		</div>
		<div class="col-sm-4">
			<div class="form-inline">
				<div class="input-group js-datepicker">
					<input type="text" name="start_dt" id="start_dt" value="<?=$start_dt?>" class="form-control">
					<span class="input-group-addon">
						<i class="fa fa-calendar"></i>
					</span>
				</div>
				  ~
				<div class="input-group js-datepicker">
					<input type="text" name="end_dt" id="end_dt" value="<?=$end_dt?>" class="form-control" />
					<span class="input-group-addon">
						<i class="fa fa-calendar"></i>
					</span>
				</div>
			</div>
		</div>
		<div class="col-sm-1">
			<div class="form-group">
			<button type="submit" class="btn btn-primary">Search</button>
			</div>
		</div>
	</div>
	</form>

    <!-- Main content -->
    <section class="invoice">
      <!-- title row -->
      <div class="row">
        <div class="col-xs-12">
          <h2 class="page-header">
            <i class="fa fa-globe"></i> Invoice
            <small class="pull-right">Date: <?=date('Y-m-d')?></small>
          </h2>
        </div>
        <!-- /.col -->
      </div>
      <!-- info row -->
      <div class="row invoice-info">
        <div class="col-sm-4 invoice-col">
          From
          <address>
            <strong>H2 Interactive Co., Ltd .</strong><br>
            A 605 Gangseo Hangang XI Tower<br>
            401, Yangcheon-ro Gangseo-gu<br>
            Seoul, Korea 157-200<br>
          </address>
        </div>
        <!-- /.col -->
        <div class="col-sm-4 invoice-col">
          To
          <address>
            <strong id="publisher_name"></strong><br>
          </address>
        </div>
        <!-- /.col -->
        <div class="col-sm-4 invoice-col">
			<b>1. Period : </b><?=$start_dt?> ~ <?=$end_dt?><br>
			<b>2. Royalty : </b>KRW 1 -> USD 0.0009 ()<br>
			<b>3. Default currenty : </b>KRW<br>
			<b>4. Payment Gateway Fee</b><br>
			Account - 2.2%, Credit Card - 3.75%, Mobile PayMent - 7.7% , Pay - 7.7%

        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->

      <!-- Table row -->
      <div class="row">
        <div class="col-xs-12 table-responsive">
          <table class="table table-striped">
            <thead>
            <tr>
					<th class="text-center">ITEM_ID</th>
					<th>Product</th>
					<th class="text-center">Rate</th>
					<th class="text-center">Payment Gateway</th>
					<th class="text-center">SRP<br/>(KRW)</th>
					<th class="text-center">Sales Price<br/>(KRW)</th>
					<th class="text-center">Gross Units Sold</th>
					<th class="text-center">Gross Sales<br/>(in VAT)</th>
					<th class="text-center">Gross Sales<br/>(ex VAT)</th>
					<th class="text-center">Payment Gateway <br/>FEE</th>
					<th class="text-center">Net Sales<br/>(KRW)</th>
					<th class="text-center">Revenue Share<br/>(KRW)</th>
            </tr>
            </thead>
            <tbody>
				<?
					foreach($data as $value){
						switch($value['settlekind']){
							case "Account":
								$fee = "0.022";
							break;
							case "Credit":
								$fee = "0.0375";
							break;
							case "Mobile":
								$fee = "0.077";
							break;
							case "PAY":
								$fee = "0.077";
							break;
						}

						$gross_sales_in_vat = $value['order_srp']*$value['order_count'];
						$gross_sales_ex_vat = $gross_sales_in_vat /1.1;
					
						$payment_fee = round(($gross_sales_ex_vat* $fee),0);
						$net_sales = $gross_sales_ex_vat-$payment_fee;
						$revenue_share = round($net_sales*($value['revenue']/100),0);
				?>
            <tr>
              <td><?=$value['product_code']?></td>
              <td><?=$value['goods_nm_en']?></td>
              <td class="text-center"><?=$value['revenue']?></td>
              <td class="text-center"><?=$value['settlekind']?></td>
              <td class="text-right"><?=number_format($value['order_srp'])?></td>
				  <td class="text-right"><?=number_format($value['price'])?></td>
				  <td class="text-right"><?=$value['order_count']?></td>
				  <td class="text-right"><?=number_format($gross_sales_in_vat)?></td>
				  <td class="text-right"><?=number_format($gross_sales_ex_vat)?></td>
				  <td class="text-right"><?=number_format($payment_fee)?></td>
				  <td class="text-right"><?=number_format($net_sales)?></td>
				  <td class="text-right"><?=number_format($revenue_share)?></td>
            </tr>
				<?		$sum_cc += $value['order_count'];
						$sum_gross_sales_in_vat +=$gross_sales_in_vat;
						$sum_gross_sales_ex_vat +=$gross_sales_ex_vat;
						$sum_payment_fee+=$payment_fee;
						$sum_net_sales+=$net_sales;
						$sum_revenue_share+=$revenue_share;
					}
				?>
            </tbody>
				<tfoot>
				<tr>
					<th colspan="2">Total</th>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td class="text-right"><?=number_format($sum_cc)?></td>
					<td class="text-right"><?=number_format($sum_gross_sales_in_vat)?></td>
					<td class="text-right"><?=number_format($sum_gross_sales_ex_vat)?></td>
					<td class="text-right"><?=number_format($sum_payment_fee)?></td>
					<td class="text-right"><?=number_format($sum_net_sales)?></td>
					<td class="text-right"><?=number_format($sum_revenue_share)?></td>
				</tr>
				</tfoot>
          </table>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->

      <div class="row">
        <!-- accepted payments column -->
        <div class="col-xs-6">

          <!--<p class="text-muted well well-sm no-shadow" style="margin-top: 10px;">
          
          </p>-->
        </div>
        <!-- /.col -->
        <div class="col-xs-6">
          <p class="lead">Amount Due <?=date('Y-m-d')?></p>

          <div class="table-responsive">
            <table class="table">
              <tr>
                <th style="width:50%">Total Revenue_Share (USD)</th>
                <td class="text-right">$<?=number_format($sum_gross_sales_in_vat*$royalty,2)?></td>
              </tr>
				  <tr>
                <th style="width:50%">VAT. (10%)</th>
                <td class="text-right"> $<?=number_format(($sum_gross_sales_in_vat-$sum_gross_sales_ex_vat)*$royalty,2)?></td>
              </tr>
              <tr>
                <th>Payment Gateway FEE (USD)</th>
                <td class="text-right"> $<?=number_format($sum_payment_fee*$royalty,2)?></td>
              </tr>
              <tr>
                <th>Royalty payable (USD)</th>
                <td class="text-right">$<?=number_format($sum_revenue_share*$royalty,2)?></td>
              </tr>
            </table>
          </div>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->

      <!-- this row will not appear when printing -->
      <div class="row no-print">
        <div class="col-xs-12">
          <a href="invoice-print.html" target="_blank" class="btn btn-default"><i class="fa fa-print"></i> Print</a>
          <button type="button" class="btn btn-success pull-right"><i class="fa fa-credit-card"></i> Submit Payment
          </button>
          <button type="button" class="btn btn-primary pull-right" style="margin-right: 5px;">
            <i class="fa fa-download"></i> Generate PDF
          </button>
        </div>
      </div>
    </section>
    <!-- /.content -->
    <div class="clearfix"></div>
  </div>
  <!-- /.content-wrapper -->
  <footer class="main-footer">
    <div class="pull-right hidden-xs">
    </div>
    <strong>Copyright &copy; 2017 <a href="http://h2interactive.co.kr">H2 INTERACTIVE Co., Ltd</a>.</strong> All rights
    reserved.
  </footer>

  <!-- Control Sidebar -->

  <!-- /.control-sidebar -->
  <!-- Add the sidebar's background. This div must be placed
       immediately after the control sidebar -->
  <div class="control-sidebar-bg"></div>
</div>
<!-- ./wrapper -->

<!-- jQuery 3.1.1 -->
<script src="plugins/jQuery/jquery-3.1.1.min.js"></script>
<!-- Bootstrap 3.3.7 -->
<script src="bootstrap/js/bootstrap.min.js"></script>
<!-- FastClick -->
<script src="plugins/fastclick/fastclick.js"></script>
<!-- AdminLTE App -->
<script src="dist/js/adminlte.min.js"></script>
<!-- AdminLTE for demo purposes -->
<script src="dist/js/demo.js"></script>
<script src="plugins/datepicker/bootstrap-datepicker.js?2"></script>
<script>
$(document).ready(function(){
	$('#start_dt').datepicker({
		autoclose: true
	});
	$('#end_dt').datepicker({
		autoclose: true
	});
	$("#publisher_name").text($("#search_publisher option:selected").text());
});
</script>
</body>
</html>
