<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_NUMBER_INT);

$search_publisher = $_SESSION['publisher']['publisher'];

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$query = "select a.publisher_code,a.currency_converter,a.account_fee,a.card_fee,a.mobile_fee,a.report_year,a.report_month,a.royalty,a.royalty_info,b.publisher,a.reg_date,a.update_date,a.status,a.approval_date from directgames.tbl_report_config a inner join directgames.tbl_publisher b on a.publisher_code=b.idx where a.idx='$idx'";
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$report_config = $stmt->fetch();

	//리포트 통계
	$report_query= "SELECT b.short_item_code,c.platform,a.product_code,a.product_nm_en,a.publisher_srp,a.rate,a.publisher_price,sum(a.gross_units_sold)as gross_units_sold,sum(a.gross_sales_ex_vat)as gross_sales_ex_vat,
								sum(a.payment_gateway_fee)as payment_gateway_fee,sum(a.net_sales)as net_sales,sum(a.revenue_share)as revenue_share
								FROM directgames.tbl_report a inner join directgames.tbl_platform c on a.platform_code=c.idx left join directgames.tbl_report_t2code b on a.product_code=b.product_code
								WHERE a.parent_idx=:idx
								group by a.product_code 
								order by c.platform asc,a.product_nm_en asc,a.rate asc";
	$params = array(
				":idx" => $idx,
			);

	//echo $report_query;

	$stmt = $conn->prepare($report_query);
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
  <title>Directgames Partners - Report</title>
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
  <!-- Morris chart -->
  <link rel="stylesheet" href="plugins/morris/morris.css">
  <!-- jvectormap -->
  <link rel="stylesheet" href="plugins/jvectormap/jquery-jvectormap-1.2.2.css">
  <!-- Date Picker -->
  <link rel="stylesheet" href="plugins/datepicker/datepicker3.css">
  <!-- Daterange picker -->
  <link rel="stylesheet" href="plugins/daterangepicker/daterangepicker.css">
  <!-- bootstrap wysihtml5 - text editor -->
  <link rel="stylesheet" href="plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.min.css">

  <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
  <![endif]-->

  <!-- Google Font -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700,300italic,400italic,600italic">
<style type="text/css">
.navbar-nav>.user-menu>.dropdown-menu>li.user-header{
	height:60px;
}

.skin-blue .main-header .navbar .nav>li>a:hover, .skin-blue .main-header .navbar .nav>li>a:active{
background:#3c8dbc;
}

.user-panel {
	padding:0;
}
</style>
</head>
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">
<? include "inc/top_new.php"?>
	<? include "inc/left_new.php"?>

  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
		<div class="row">
			<div class="col-lg-12">
				<span style="font-size:20px">
				  ROYALTY REPORT
				  <small style="padding-left:10px"></small>
				</span>
			</div>
	</div>
    </section>

    <!-- Main content -->
    <section class="content">
      <!-- Main row -->
      <div class="row">
        <!-- right col (We are only adding the ID to make the widgets sortable)-->
        <section class="col-lg-12 connectedSortable">

			<div class="box">
				<div class="box-header with-border">
					<h3 class="box-title">Product Statistics - <?=$report_config['publisher']?></h3>
				</div>
				<!-- /.box-header -->
				<div class="box-body">
					<div class="pull-left">
						<ol>
							<li>Period : <?=$report_config['report_year']?>.<?=$report_config['report_month']?>.01 ~ <?=$report_config['report_month']?>.<?=date('t', strtotime($start_date))?> </li>
							<li>Royalty KRW 1 -> <?=$report_config['currency_converter']?> <?=$report_config['royalty']?> (<?=$report_config['royalty_info']?>)</li>
							<li>Default currency = KRW </li>
							<li>Payment Gateway Fee : Bank Transfer - <?=$report_config['account_fee']?> %, Credit Card - <?=$report_config['card_fee']?> %, Mobile Payment - <?=$report_config['mobile_fee']?> % </li>
						</ol>
					</div>
					
					<div class="pull-right">
						<button class="btn btn-lg btn-info" id="btn_download" data-idx="<?=$idx?>">Download Excel</button>
					</div>

              <table class="table table-bordered" id="excel_data">
                <tbody>
					 <tr>
						<th style="text-align:center">SHORT ITEM <br/>CODE</th>
						<th style="text-align:center">Platform</th>
						<th style="text-align:center">Product</th>
						<th style="text-align:center">Units Sold</th>
						<th style="text-align:center">Net Sales(excl. VAT & PG)<br/>(KRW)</th>
						<th style="text-align:center">Revenue Share<br/>(KRW)</th>
						
                </tr>
					<? 
							foreach($data as $value){
								if($value['gross_units_sold']<>0){
					?>
                <tr>
					<td class="text-center"><?=$value['short_item_code']?></td>
					<td class="text-center"><?=$value['platform']?></td>
					<td><?=$value['product_nm_en']?></td>
					<td style="text-align:right"><?=number_format($value['gross_units_sold'])?></td>
					<td style="text-align:right"><?=number_format($value['net_sales'])?></td>
					<td style="text-align:right"><?=number_format($value['revenue_share'])?></td>
                </tr>
				<?			$sum_gross_units_sold+=$value['gross_units_sold'];
								$sum_net_sales+=$value['net_sales'];
								$sum_payment_gateway_fee+=$value['payment_gateway_fee'];
								$sum_revenue_share+=$value['revenue_share'];
							}
						}
				?>
              </tbody>
				<tfoot>
				<tr class="active">
					<td></td>
					<td></td>
					<td></td>
					<th style="text-align:right"><?=number_format($sum_gross_units_sold)?></th>
					<th style="text-align:right"><?=number_format($sum_net_sales)?></th>
					<th style="text-align:right"><?=number_format($sum_revenue_share)?></th>
				</tr>
				<tr>
					<th colspan="4"></th>
					<th class="text-center">Royalty Payable</th>
					<th class="text-right"><?=$report_config['currency_converter']?> <?=number_format($sum_revenue_share*$report_config['royalty'],2)?></th>
				</tr>
				</tfoot>
				</table>
            </div>
            <!-- /.box-body -->
          </div>
			<div class="pull-right">
				<? if($report_config['status']=="notice"){ ?>
				<button class="btn btn-lg btn-success" id="btn_approval" data-idx="<?=$idx?>">Approval</button>
				<?	}else{	?>
				<span>Approval_date : <?=$report_config['approval_date']?></span>
				<?	}?>
			</div>
			
        </section>
        <!-- right col -->
		  
      </div>
      <!-- /.row (main row) -->

    </section>
    <!-- /.content -->
	 <form id="excelFrm" name="excelFrm" method="post" action="sales_list_excel.php">
		<input type="hidden" name="search_publisher" value="<?=$search_publisher?>">
		<input type="hidden" name="publisher" id="publisher" value="">
		<input type="hidden" name="start_dt" value="<?=$start_dt?>">
		<input type="hidden" name="end_dt" value="<?=$end_dt?>">
	 </form>
  </div>
  <!-- /.content-wrapper -->
  <footer class="main-footer">
    <div class="pull-right hidden-xs">
    </div>
    <strong>Copyright &copy; 2017 <a href="http://h2interactive.co.kr">H2 INTERACTIVE Co., Ltd</a>.</strong> All rights
    reserved.
  </footer>

  <!-- Add the sidebar's background. This div must be placed
       immediately after the control sidebar -->
  <div class="control-sidebar-bg"></div>
</div>
<!-- ./wrapper -->

<!-- jQuery 3.1.1 -->
<script src="plugins/jQuery/jquery-3.1.1.min.js"></script>
<!-- jQuery UI 1.11.4 -->
<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
  $.widget.bridge('uibutton', $.ui.button);
</script>
<!-- Bootstrap 3.3.7 -->
<script src="bootstrap/js/bootstrap.min.js"></script>
<!-- Morris.js charts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
<script src="plugins/morris/morris.min.js"></script>
<!-- Sparkline -->
<script src="plugins/sparkline/jquery.sparkline.min.js"></script>
<!-- jvectormap -->
<script src="plugins/jvectormap/jquery-jvectormap-1.2.2.min.js"></script>
<script src="plugins/jvectormap/jquery-jvectormap-world-mill-en.js"></script>
<!-- jQuery Knob Chart -->
<script src="plugins/knob/jquery.knob.js"></script>
<!-- daterangepicker -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js"></script>
<script src="plugins/daterangepicker/daterangepicker.js?2"></script>
<!-- datepicker -->
<script src="plugins/datepicker/bootstrap-datepicker.js"></script>
<!-- Bootstrap WYSIHTML5 -->
<script src="plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js"></script>
<!-- Slimscroll -->
<script src="plugins/slimScroll/jquery.slimscroll.min.js"></script>
<!-- FastClick -->
<script src="plugins/fastclick/fastclick.js"></script>
<!-- AdminLTE App -->
<script src="dist/js/adminlte.min.js"></script>
<!-- AdminLTE for demo purposes -->
<script src="dist/js/demo.js"></script>
<script type="text/javascript">
$(document).ready(function(){
	var start_dt = $("#start_dt").val();
	var end_dt = $("#end_dt").val();
	$('#daterange-btn span').html(start_dt+"~"+end_dt);

	$('#daterange-btn').daterangepicker({
	 ranges: {
		'Today': [moment(), moment()],
		'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
		'Last 7 Days': [moment().subtract(6, 'days'), moment()],
		'Last 30 Days': [moment().subtract(29, 'days'), moment()],
		'This Month': [moment().startOf('month'), moment().endOf('month')],
		'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
	 },
	 startDate: moment().subtract(29, 'days'),
	 endDate: moment(),
	 minDate: '2017-04-01',
	 maxDate: moment(),
	 //minDate: '2017-01-01',
	},
	function (start, end) {
		$('#daterange-btn span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
		$('#start_dt').val(start.format('YYYY-MM-DD'));
		$('#end_dt').val(end.format('YYYY-MM-DD'));

	});


	$("#btn_excel_download").bind("click",function(){
		/*
		var search_publisher = "<?=$search_publisher?>";
		var start_dt = "<?=$start_dt?>";
		var end_dt = "<?=$end_dt?>";
		 $.ajax({
			url: "sales_list_excel.php",
			type: 'POST',
			data: {search_publisher:search_publisher,start_dt:start_dt,end_dt:end_dt},
			success: function(response) {
				
			}
		 });*/
		 $("#publisher").val($("#search_publisher option:selected").text());
		 $("#excelFrm").submit();
	});

	$("#btn_approval").bind("click",function(){
		var idx = $('#btn_approval').attr("data-idx");
		 $.ajax({
			url: "report_ps.php",
			type: 'POST',
			data: {mode:"approval",idx:idx},
			success: function(response) {
				location.reload();
			}
		 });
	});

	$("#btn_download").bind("click",function(){
		var idx = $('#btn_download').attr("data-idx");

		var $form = $('<form></form>');
		$form.attr('action', 'report_excel_t2.php');
		$form.attr('method', 'post');
		$form.appendTo('body');
		var idx = $('<input type="hidden" name="idx" value="'+idx+'">');
		$form.append(idx);
		$form.submit();
	});
});
</script>
</body>
</html>
