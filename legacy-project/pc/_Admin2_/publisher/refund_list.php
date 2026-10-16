<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$search_game = filter_input(INPUT_GET, 'search_game', FILTER_SANITIZE_NUMBER_INT);
$search_date = filter_input(INPUT_GET, 'search_date', FILTER_SANITIZE_STRING);

$start_dt = filter_input(INPUT_GET, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_GET, 'end_dt', FILTER_SANITIZE_STRING);

if($_SESSION['publisher']['admin_level']=="99"){ //전체관리자
	if(!$search_publisher){
		$search_publisher = $_SESSION['publisher']['publisher'];
	}
}else{ //퍼블리셔 관리자
	if($_SESSION['publisher']['publisher']=="12"){ //2K
		if(!$search_publisher){
			$search_publisher = $_SESSION['publisher']['publisher'];
		}else{ //일반 퍼블리셔
			if($search_publisher<>'12' && $search_publisher<>'14' && $search_publisher<>'321'){
				$search_publisher = $_SESSION['publisher']['publisher'];
			}
		}
	}else{
		$search_publisher = $_SESSION['publisher']['publisher'];
	}
}

if(!$start_dt || !$end_dt){
	//$start_dt = date('Y-m')."-01";
	//$end_dt = date('Y-m-d');

	$d = mktime(0,0,0, date("m"), 1, date("Y")); //이번달 1일
	$prev_month = strtotime("-1 month", $d); //한달전
	$start_dt = date("Y-m-01", $prev_month );
	$end_dt = date("Y-m-t", $prev_month );
}


if($_SESSION['publisher']['start_date']){
	$view_start_date = date("Y-m-d", strtotime($_SESSION['publisher']['start_date']));
} else {
	$view_start_date = "2017-04-01";
}
if($_SESSION['publisher']['end_date']){
	$view_end_date = date("Y-m-d", strtotime($_SESSION['publisher']['end_date']));
} else {
	$view_end_date = DATE("Y-m-d");
}

if($_SESSION['publisher']['start_date']){
	if($view_start_date > $start_dt){
		$start_dt = $view_start_date;
	}
}

if($_SESSION['publisher']['end_date']){
	if($view_end_date < $end_dt){
		$end_dt = $view_end_date;
	}
}

$selected['search_publisher'][$search_publisher] = "selected";
$selected['search_game'][$search_game] = "selected";

if(!$page){
	$page = 1;
}

if($search_game){
	$add_where = " and b.product_code='".$search_game."'";
}

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	/*특이사항( 환불주문 : 페이코 가상계좌 미입금 거래건 제외)*/
	$query = "
		select t.product_code,b.product_name_en,c.platform,t.order_srp,sum(t.qty)as order_count,sum(t.qty*t.order_srp) from (
			select ordno,product_code,order_srp,qty from tbl_sales_publisher  
			where publisher_code='$search_publisher' and canceldt between '$start_dt 00:00:00' and '$end_dt 23:59:59'
			 and ord_ymd>='2017-04-01' and cdt<>'1970-01-01 09:00:00' 
			and step<>'99' and status='9' and settlekind<>'PAYCO'

			union all

			select ordno,product_code,order_srp,qty from tbl_sales_publisher  
			where publisher_code='$search_publisher' and canceldt between '$start_dt 00:00:00' and '$end_dt 23:59:59'
			and ord_ymd>='2017-04-01' and cdt<>'1970-01-01 09:00:00' and status='9'
			and settlekind='PAYCO' and cdt<>'1970-01-01 09:00:00'

			)as t inner join tbl_goods_item b on t.product_code=b.product_code inner join directgames.tbl_platform c on b.product_platform=c.idx
			group by t.product_code,t.order_srp
			order by t.product_code asc,t.order_srp asc
	";

	$options = array(
		'results_per_page' =>'50',
		'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*&search_publisher='.$search_publisher."&start_dt=".$start_dt."&end_dt=".$end_dt,  
		'db_handle'  => $conn  
	);

	$pagination = new Pagination($page,$query, $options);

if($_SESSION['publisher']['admin_level']=="99"){
		$publisher_query = "select idx,publisher from directgames.tbl_publisher where flag='Y' and del='0' order by publisher asc";
	}else{
		if($_SESSION['publisher']['publisher']=="12" || $_SESSION['publisher']['publisher']=="14" || $_SESSION['publisher']['publisher']=="321"){
				$publisher_query = "select idx,publisher from directgames.tbl_publisher where flag='Y' and del='0' and idx in ('12','14','321') order by publisher asc";
		}else{
			$publisher_query = "select idx,publisher from directgames.tbl_publisher where flag='Y' and del='0' and idx='$search_publisher' order by publisher asc";
		}
	}
	$stmt = $conn->prepare($publisher_query);
	$stmt->execute();
	$publisher_data = $stmt->fetchAll();

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
  <title>Directgames Partners |  Refund List</title>
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
			<div class="col-lg-7">
				<span style="font-size:20px">
				  Refund list
				  <small style="padding-left:10px"><?=$start_dt?> ~ <?=$end_dt?></small>
				</span>
			</div>
      <div class="col-lg-5 pull-right">
        <form name="searchFrm" method="get" action="<?=$PHP_SELF?>">
			<div class="row">
				<div class="col-sm-5">
					<div class="form-group">
						<select class="form-control" name="search_publisher" id="search_publisher">
						  <?foreach($publisher_data as $value){?>
							<option value="<?=$value['idx']?>" <?=$selected['search_publisher'][$value['idx']]?>><?=$value['publisher']?></option>
							<?}?>
						</select>
					</div>
				</div>
				<!--<div class="col-sm-4">
					<div class="form-group">
						<select class="form-control" name="search_game">
						  <option value="">All Games</option>
							<?foreach($game_data as $value){?>
							<option value="<?=$value['goods_code']?>" <?=$selected['search_game'][$value['goods_code']]?>><?=$value['goods_nm_en']?></option>
							<?}?>
						</select>
					</div>
				</div>-->
				<div class="col-sm-5">
					 <div class="form-group">
						<div class="input-group">
							<button type="button" class="btn btn-default pull-right" id="daterange-btn">
								<span>
								<i class="fa fa-calendar"></i> &nbsp; Date range &nbsp;&nbsp;&nbsp;
								</span>
								<i class="fa fa-caret-down"></i>
							</button>
							
						</div>
						<input type="hidden" name="start_dt" id="start_dt" value="<?=$start_dt?>">
						<input type="hidden" name="end_dt" id="end_dt" value="<?=$end_dt?>">
					</div>
				</div>
				<div class="col-sm-2">
					<div class="form-group">
					<button type="submit" class="btn btn-primary">Submit</button>
					</div>
				</div>
			</div>
			</form>
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
              <h3 class="box-title">Refund list</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              <table class="table table-bordered" id="excel_data">
                <tbody>
					 <tr>
                  <th style="width: 10px">ITEM_ID</th>
                  <th style="text-align:center">Title</th>
						<th style="text-align:center">SRP</th>
						<th style="text-align:center">Sales Unit</th>
						<th style="text-align:center">Gross Sales</th>
                </tr>
					<? 
						if($pagination->success == true){
							$result = $pagination->resultset->fetchAll();

							foreach($result as $data){

					?>
                <tr>
					<td><?=$data['product_code']?></td>
					<td>[<?=$data['platform']?>] <?=$data['product_name_en']?></td>
					<td style="text-align:right"><?=number_format($data['order_srp'])?></td>
					<td style="text-align:right"><?=number_format($data['order_count'])?></td>
					<td style="text-align:right"><?=number_format($data['order_srp']*$data['order_count'])?></td>
                </tr>
					 <?	}
						}
					?>
					<?	if($pagination->total_results==0){?>
					<tr>
						<td colspan="13" align="center">no data.</td>
					</tr>
					<? }?>
              </tbody>
				  </table>
            </div>
            <!-- /.box-body -->
            <div class="box-footer clearfix">
              <div style="text-align:center"><?echo $pagination->links_html;?></div>
            </div>
          </div>

			<div class="pull-right">
				<button class="btn btn-success" id="btn_excel_download">Excel Download</button>
		  </div>
        </section>
        <!-- right col -->
		  
      </div>
      <!-- /.row (main row) -->

    </section>
    <!-- /.content -->
	 <form id="excelFrm" name="excelFrm" method="post" action="refund_list_excel.php">
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
		'This Month': [moment().startOf('month'), moment().endOf('month')],
		'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
	 },
	 startDate: moment().subtract(29, 'days'),
	 endDate: moment().subtract(1, 'days'),
	 minDate: '<?=$view_start_date?>',
	 maxDate: moment().subtract(1, 'days'),
	 //minDate: '2017-01-01',
	alwaysShowCalendars : true,
	},
	function (start, end) {
		$('#daterange-btn span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
		$('#start_dt').val(start.format('YYYY-MM-DD'));
		$('#end_dt').val(end.format('YYYY-MM-DD'));

	});


	$("#btn_excel_download").bind("click",function(){
		 $("#publisher").val($("#search_publisher option:selected").text());
		 $("#excelFrm").submit();
	});
});


</script>
</body>
</html>
