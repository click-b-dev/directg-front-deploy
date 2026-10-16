<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

include_once("../../../_engine/dbconn_jp.php");

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

header("Content-Type: text/html; charset=UTF-8"); 

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$search_game = filter_input(INPUT_GET, 'search_game', FILTER_SANITIZE_NUMBER_INT);
$start_dt = filter_input(INPUT_GET, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_GET, 'end_dt', FILTER_SANITIZE_STRING);

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

if(!$start_dt || !$end_dt){
	//$start_dt = date('Y-m')."-01";
	//$end_dt = date('Y-m-d');

	$d = mktime(0,0,0, date("m"), 1, date("Y")); //이번달 1일
	$prev_month = strtotime("-1 month", $d); //한달전
	$start_dt = date("Y-m-01", $prev_month );
	$end_dt = date("Y-m-t", $prev_month );
}

if($_SESSION['publisher']['start_date_jp']){
	$view_start_date = date("Y-m-d", strtotime($_SESSION['publisher']['start_date_jp']));
} else {
	$view_start_date = "2017-04-01";
}
if($_SESSION['publisher']['end_date_jp']){
	$view_end_date = date("Y-m-d", strtotime($_SESSION['publisher']['end_date_jp']));
} else {
	$view_end_date = DATE("Y-m-d");
}

if($_SESSION['publisher']['start_date_jp']){
	if($view_start_date > $start_dt){
		$start_dt = $view_start_date;
	}
}

if($_SESSION['publisher']['end_date_jp']){
	if($view_end_date < $end_dt){
		$end_dt = $view_end_date;
	}
}

if($start_dt>$end_dt){
	$start_dt=$end_dt;
}

$selected['search_publisher'][$search_publisher] = "selected";
$selected['search_game'][$search_game] = "selected";

if(!$page){
	$page = 1;
}

$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
try  {  
	$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
	$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	if($search_game){
		$query = "select a.ord_ymd,a.product_code,a.product_nm,b.goods_nm_en,c.platform,a.order_srp,sum(a.qty)as order_count from tbl_sales_publisher a inner join tbl_goods b on a.product_code=b.goods_code 
			inner join tbl_platform c on b.platform_code=c.idx
			where 
			a.publisher_code='$search_publisher' and a.ord_ymd between '$start_dt' and '$end_dt'
			and a.ord_ymd>='2021-05-01' and a.cdt<>'1970-01-01 09:00:00' and a.product_code='$search_game'
			group by a.ord_ymd,a.product_code,a.order_srp
			order by a.ord_ymd asc,a.product_code asc,a.order_srp asc
		";

		$options = array(
			'results_per_page' =>'50',
			'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*&search_publisher='.$search_publisher."&search_game=".$search_game."&start_dt=".$start_dt."&end_dt=".$end_dt,  
			'db_handle'  => $conn_dgjp  
		);

		$pagination = new Pagination($page,$query, $options);
	}

	if($_SESSION['publisher']['admin_level']=="99"){
		$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' order by publisher asc";
	}else{
		if($_SESSION['publisher']['publisher']=="12" || $_SESSION['publisher']['publisher']=="14" || $_SESSION['publisher']['publisher']=="317"){
				$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' and idx in ('12','14','317') order by publisher asc";
		}else{
			$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' and idx='$search_publisher' order by publisher asc";
		}
	}
	$stmt = $conn_dgjp->prepare($publisher_query);
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
  <title>Directgames Partners - Title Sales List</title>
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
				  Title Sales list  (DG JP)
				  <small style="padding-left:10px"><?=$start_dt?> ~ <?=$end_dt?></small>
				</span>
			</div>
		</div>
    </section>

    <!-- Main content -->
    <section class="content">
	 	<div class="row">
			<div class="col-lg-12 pull-right">
			  <form name="searchFrm" method="get" action="<?=$PHP_SELF?>">
				<div class="row">
					<div class="col-sm-3">
						<div class="form-group">
							<select class="form-control" name="search_publisher" id="search_publisher">
							  <?foreach($publisher_data as $value){?>
								<option value="<?=$value['idx']?>" <?=$selected['search_publisher'][$value['idx']]?>><?=$value['publisher']?></option>
								<?}?>
							</select>
						</div>
					</div>
					<div class="col-sm-5">
						<div class="form-group">
							<select class="form-control" name="search_game" id="search_game">
							</select>
						</div>
					</div>
					<div class="col-sm-2">
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
					<div class="col-sm-1">
						<div class="form-group">
						<button type="submit" class="btn btn-primary">Submit</button>
						</div>
					</div>
				</div>
				</form>
			</div>
		</div>
      <!-- Main row -->
      <div class="row">
        <!-- right col (We are only adding the ID to make the widgets sortable)-->
        <section class="col-lg-12 connectedSortable">

			<div class="box">
            <div class="box-header with-border">
              <h3 class="box-title">Title Sales list</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              <table class="table table-bordered" id="excel_data">
                <tbody>
					 <tr>
                  <th style="text-align:center;width:100px;">Date</th>
						<th style="text-align:center">Title</th>
						<th style="text-align:center;width:180px;">SRP</th>
						<th style="text-align:center;width:150px;">Sales Unit</th>
						<th style="text-align:center;width:180px;">Gross Sales</th>
                </tr>
					 <? 
						if($pagination->success == true){
							$result = $pagination->resultset->fetchAll();

							foreach($result as $data){
					?>
                <tr>
					<td><?=$data['ord_ymd']?></td>
					<td>[<?=$data['platform']?>] <?=$data['goods_nm_en']?></td>
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
	 <form id="excelFrm" name="excelFrm" method="post" action="title_sales_excel_jp.php">
		<input type="hidden" name="search_publisher" value="<?=$search_publisher?>">
		<input type="hidden" name="goods_code" id="goods_code" >
		<input type="hidden" name="publisher" id="publisher" >
		<input type="hidden" name="game" id="game" >
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
	startDate: moment('<?=date("m/d/Y", strtotime($start_dt))?>'),
	endDate: moment('<?=date("m/d/Y", strtotime($end_dt))?>'),
	minDate: '<?=$view_start_date?>',
	maxDate: '<?=$view_end_date?>',
	alwaysShowCalendars : true,
	 //minDate: '2017-01-01',
	},
	function (start, end) {
		$('#daterange-btn span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
		$('#start_dt').val(start.format('YYYY-MM-DD'));
		$('#end_dt').val(end.format('YYYY-MM-DD'));

	});

	changeGame();

	$("#btn_excel_download").bind("click",function(){
		 $("#publisher").val($("#search_publisher option:selected").text());
		 $("#game").val($("#search_game option:selected").text());
		 $("#goods_code").val($("#search_game option:selected").val());
		 $("#excelFrm").submit();
		 
	});

	$("#search_publisher").bind("change",function(){
		changeGame();
	});
});

var changeGame = function(){
	var search_publisher = $("#search_publisher option:selected").val();
	var search_game = "<?=$search_game?>";

	$.ajax({
		url: "publisher_game_list_ajax_jp.php",
		type: 'POST',
		data: {search_publisher:search_publisher,search_game:search_game},
		success: function(response) {
			$("#search_game").html(response);
		}
	 });
}

</script>
</body>
</html>
