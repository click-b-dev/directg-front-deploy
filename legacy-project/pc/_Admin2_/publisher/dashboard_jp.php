<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

include_once("../../../_engine/dbconn_jp.php");

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$search_game = filter_input(INPUT_GET, 'search_game', FILTER_SANITIZE_NUMBER_INT);
$search_date = filter_input(INPUT_GET, 'search_date', FILTER_SANITIZE_STRING);

$start_dt = filter_input(INPUT_GET, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt = filter_input(INPUT_GET, 'end_dt', FILTER_SANITIZE_STRING);

if($_SESSION['publisher']['admin_level']=="99"){ //전체관리자
	if(!$search_publisher){
		$search_publisher = $_SESSION['publisher']['publisher_jp'];
		
	}
	
}else{ //퍼블리셔 관리자
	if($_SESSION['publisher']['publisher_jp']=="12"){
		if(!$search_publisher){ //퍼블리셔 변경가능(taketwo)
			$search_publisher = $_SESSION['publisher']['publisher_jp'];
		}else{ 
			if($search_publisher<>'12' && $search_publisher<>'14' && $search_publisher<>'317'){
				$search_publisher = $_SESSION['publisher']['publisher_jp'];
			}
		}
	}else{//일반 퍼블리셔
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

$selected['search_publisher'][$search_publisher] = "selected";
$selected['search_game'][$search_game] = "selected";
$selected['search_date'][$search_date] = "selected";

$dsn_dgjp = 'mysql:host='.DBJP_HOST.';dbname='.DBJP_DB.';port=3306;charset=utf8';
try{
	$conn_dgjp = new PDO($dsn_dgjp,DBJP_USER,DBJP_PASSWORD);
	$conn_dgjp->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	if($_SESSION['publisher']['start_date_jp']){
		$view_start_date = date("Y-m-d", strtotime($_SESSION['publisher']['start_date_jp']));
	} else {
		$view_start_date = "2021-05-01";
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

	$query = "select t.*,count(*)as order_count,sum(t.qty*t.order_srp)as total_price from (
							select a.product_code,b.goods_nm_en,a.qty,a.order_srp,c.platform
							from tbl_sales_publisher a inner join tbl_goods b on a.product_code=b.goods_code inner join tbl_platform c on b.platform_code=c.idx where a.publisher_code=:publisher_code 
							and a.ord_ymd between :start_dt and :end_dt and a.cdt<>'1970-01-01 09:00:00' and a.ord_ymd BETWEEN :view_start_date AND :view_end_date
							) as t
						group by t.product_code,t.order_srp
						order by sum(t.qty*t.order_srp) desc
		";
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt,
		":end_dt"=>$end_dt,
		":view_start_date"=>$view_start_date,
		":view_end_date"=>$view_end_date
	);
	$stmt = $conn_dgjp->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

	
	foreach($data as $value){
		$total_unit+=$value['order_count'];
		$total_unit_price+=$value['total_price'];
	}

	//취소및 환불내역
	$cancel_query = "select t.*,count(*)as order_count,sum(t.qty*t.order_srp)as total_price from (
						select a.ord_ymd,a.publisher_code,a.product_code,a.product_nm,a.order_srp,a.qty,b.goods_nm_en,c.platform from tbl_sales_publisher a inner join tbl_goods b on a.product_code=b.goods_code inner join tbl_platform c on b.platform_code=c.idx where a.status='9' and a.publisher_code=:publisher_code and a.canceldt between :start_dt and :end_dt and a.cdt<>'1970-01-01 09:00:00' 
						)as t
						group by t.product_code,t.order_srp
						order by sum(t.qty*t.order_srp) desc
						";
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt." 00:00:00",
		":end_dt"=>$end_dt." 23:59:59"
	);
	$stmt = $conn_dgjp->prepare($cancel_query);
	$stmt->execute($params);
	$cancel_data = $stmt->fetchAll();

	foreach($cancel_data as $value){
		$cancel_total_unit+=$value['order_count'];
		$cancel_total_price+=$value['total_price'];
	}

	//퍼블리셔 목록
	if($_SESSION['publisher']['admin_level']=="99"){
		$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' order by publisher asc";
	}else{
		if($_SESSION['publisher']['publisher_jp']=="12" || $_SESSION['publisher']['publisher_jp']=="14" || $_SESSION['publisher']['publisher_jp']=="317"){
			$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' and idx in ('12','14','317') order by publisher asc";
		}else{
			$publisher_query = "select idx,publisher from tbl_publisher where flag='Y' and del='0' and idx='$search_publisher' order by publisher asc";
		}
	}

	$stmt = $conn_dgjp->prepare($publisher_query);
	$stmt->execute();
	$publisher_data = $stmt->fetchAll();


	//퍼블리셔 게임목록
	$game_query = "select goods_code,goods_nm_en from tbl_goods where publisher_code=:publisher_code and prod_tp<>'6' and goods_nm_en<>'' order by goods_nm_en asc";
	$params = array(
		":publisher_code"=>$search_publisher,
	);

	$stmt = $conn_dgjp->prepare($game_query);
	$stmt->execute($params);
	$game_data = $stmt->fetchAll();

	//원형그래프 - 결제수단별 판매건수
	$settlekind_query ="select t1.settlekind, count(t1.qty)as order_count from (
										select product_code, product_nm,
										case when settlekind='credit' then 'Credit'
											when settlekind='linepay' then 'LinePay'
											when settlekind='emoney' then 'Credit'
											when settlekind='webcvs' then 'Webcvs'
											end as settlekind,qty,order_srp
										from tbl_sales_publisher where publisher_code=:publisher_code and ord_ymd between :start_dt and :end_dt
										)as t1
										group by t1.settlekind";
	$params = array(
		":publisher_code"=>$search_publisher,
		":start_dt"=>$start_dt,
		":end_dt"=>$end_dt
	);
	$stmt = $conn_dgjp->prepare($settlekind_query);
	$stmt->execute($params);
	$settlekind_data = $stmt->fetchAll();
	//exit;
	$pie_graph = array();
	$pie_graph_list = array();
	foreach($settlekind_data as $key=>$value){
		$pie_graph_list['label'] = $value['settlekind'];
		$pie_graph_list['value'] = $value['order_count'];

		switch($value['settlekind']){
			case "Credit":
				$color="#f56954";
			break;
			case "LinePay":
				$color="#00a65a";
			break;
			case "Webcvs":
				$color="#f39c12";
			break;
		}
		$pie_graph_list['color'] = $color;
		array_push($pie_graph,$pie_graph_list);
	}

	$pie_graph_json = json_encode($pie_graph);

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
  <title>Directgames Partners - Dashboard</title>
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
				  Report  (DG JP)
				  <small style="padding-left:10px"> <?=$start_dt?> ~ <?=$end_dt?></small>
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
      <!-- Small boxes (Stat box) -->
		<div class="row">
        <div class="col-md-3 col-sm-6 col-xs-12">
          <div class="info-box">
            <span class="info-box-icon bg-aqua"><i class="fa fa-sellsy"></i></span>

            <div class="info-box-content">
              <span class="info-box-text">Total Units</span>
              <span class="info-box-number"><?=number_format($total_unit)?><small></small></span>
            </div>
            <!-- /.info-box-content -->
          </div>
          <!-- /.info-box -->
        </div>
        <!-- /.col -->
        <div class="col-md-3 col-sm-6 col-xs-12">
          <div class="info-box">
            <span class="info-box-icon bg-aqua"><i class="fa fa-yen"></i></span>

            <div class="info-box-content">
              <span class="info-box-text">Total Gross Sales</span>
              <span class="info-box-number"><?=number_format($total_unit_price)?> (JPY)</span>
            </div>
            <!-- /.info-box-content -->
          </div>
          <!-- /.info-box -->
        </div>
        <!-- /.col -->

        <!-- fix for small devices only -->
        <div class="clearfix visible-sm-block"></div>

        <div class="col-md-3 col-sm-6 col-xs-12">

          <div class="info-box">
            <span class="info-box-icon bg-red"><i class="fa fa-sellsy"></i></span>

            <div class="info-box-content">
              <span class="info-box-text">Total Refund Unit</span>
              <span class="info-box-number"><?=number_format($cancel_total_unit,0)?></span>
            </div>
            <!-- /.info-box-content -->
          </div>
          <!-- /.info-box -->

        </div>
        <!-- /.col -->
        <div class="col-md-3 col-sm-6 col-xs-12">

          <div class="info-box">
            <span class="info-box-icon bg-red"><i class="fa fa-yen"></i></span>

            <div class="info-box-content">
              <span class="info-box-text">Total Refund</span>
              <span class="info-box-number"><?=number_format($cancel_total_price,0)?> (JPY)</span>
            </div>
            <!-- /.info-box-content -->
          </div>
          <!-- /.info-box -->

        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->

      <!-- Main row -->
      <div class="row">
        <!-- Left col -->
        <section class="col-lg-9 ">
          <!-- Custom tabs (Charts with tabs)-->
          <div class="nav-tabs-custom">
            <!-- Tabs within a box -->
            <ul class="nav nav-tabs pull-right">
              <li class="pull-left header"><i class="fa fa-line-chart"></i> Sales</li>
            </ul>
            <div class="tab-content no-padding">
              <!-- Morris chart - Sales -->
              <div class="chart tab-pane active" id="line-chart" style="position: relative; height: 360px;"></div>
            </div>
          </div>
          <!-- /.nav-tabs-custom -->
        </section>
		  <section class="col-lg-3">
			<div class="box box-default" style="height:340px;min-height:340px;">
            <div class="box-header with-border">
              <h3 class="box-title"><i class="fa fa-pie-chart"></i> Settlekind</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              <div class="row">
                <div class="col-md-8">
                  <div class="chart-responsive">
                    <canvas id="pieChart" height="160"></canvas>
                  </div>
                  <!-- ./chart-responsive -->
                </div>
                <!-- /.col -->
                <div class="col-md-4">
                  <ul class="chart-legend clearfix">
							<? 
								foreach($settlekind_data as $key=>$value){
									switch($value['settlekind']){
										case "Credit":
											$color="text-red";
										break;
										case "LinePay":
											$color="text-green";
										break;
										case "Webcvs":
											$color="text-yellow";
										break;
									}
							?>
                    <li><i class="fa fa-circle-o <?=$color?>"></i> <?=$value['settlekind']?></li>
							<?		$total+=$value['order_count'];
								}
							?>
                  </ul>
                </div>
                <!-- /.col -->
              </div>
              <!-- /.row -->
            </div>
				<div class="box-footer no-padding" style="min-height:160px;">
              <ul class="nav nav-pills nav-stacked">
					<? foreach($settlekind_data as $key=>$value){
							switch($value['settlekind']){
								case "Credit":
									$color="text-red";
								break;
								case "LinePay":
									$color="text-green";
								break;
								case "Webcvs":
									$color="text-yellow";
								break;
							}
					?>
                <li><a href="#"><?=$value['settlekind']?><span class="pull-right <?=$color?>"><?=round($value['order_count']*100/$total,0)?>%</span></a></li>
					<?}?>
              </ul>
            </div>
        </section>
        <!-- /.Left col -->
			<section class="col-lg-6">
				<div class="box box-success">
					<div class="box-header with-border">
					  <h3 class="box-title"> <i class="fa fa-bar-chart"></i> The last six months Total Sales Chart</h3>
					</div>
					<div class="box-body chart-responsive">
					  <div class="chart" id="bar-chart" style="height: 300px;"></div>
					</div>
					<!-- /.box-body -->
				</div>
          <!-- /.box -->
			</section>
			<section class="col-lg-6">
				<div class="box box-success">
					<div class="box-header with-border">
					  <h3 class="box-title"><i class="fa fa-bar-chart"></i> The last six months Total Refund Chart</h3>

					</div>
					<div class="box-body chart-responsive">
					  <div class="chart" id="bar-chart2" style="height: 300px;"></div>
					</div>
					<!-- /.box-body -->
				</div>
			</section>
        <!-- right col (We are only adding the ID to make the widgets sortable)-->
        <section class="col-lg-6">
			<div class="box">
            <div class="box-header with-border">
              <h3 class="box-title"> <i class="fa fa-list-alt"></i> Sales Rank Chart  (JPY)</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              <table class="table table-bordered">
                <tbody>
					 <tr>
                  <th style="width: 10px">#</th>
                  <th style="text-align:center">Title</th>
						<th style="text-align:center">SRP</th>
                  <th style="text-align:center">Units Sales</th>
						<th style="text-align:center">Gross Sales</th>
                </tr>
					<?	$rank = 1;
						foreach($data as $value){
							if($rank<=10){
							switch($value['settlekind']){
								case "LinePay":
									$fee = "0.0605";
								break;
								case "Credit":
									$fee = "0.0341";
								break;
								case "Webcvs":
									$fee = "0.0743";
								break;
							}

							$price = $value['order_srp'];

							$pg_fee = $price*$value['order_count']*$fee;
							$vat = $price*$value['order_count']*0.1;

							if($value['order_ppr']>0){
								$ppr = $value['order_ppr']*$value['order_count'];
							}else{
								$ppr = ($price*$value['order_count']-$pg_fee-$vat)*$value['revenue']/100;
							}
					?>
                <tr>
                  <td><?=$rank?></td>
                  <td>[<?=$value['platform']?>] <?=$value['goods_nm_en']?></td>
						<td style="text-align:right"><?=number_format($value['order_srp'])?></td>
                  <td style="text-align:right"><?=number_format($value['order_count'])?></td>
						<td style="text-align:right"><?=number_format($price*$value['order_count'])?></td>
                </tr>
					 <?	$rank++;
							}
						}
					 ?>
              </tbody>
				  </table>
            </div>
            <!-- /.box-body -->
            <div class="box-footer clearfix">
              <div class="pull-right"><a href="sales_list_jp.php">More Info</a></div>
            </div>
          </div>

        </section>
		  <section class="col-lg-6">
			<div class="box">
            <div class="box-header with-border">
              <h3 class="box-title"> <i class="fa fa-list-alt"></i> Refund Rank Chart (JPY)</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              <table class="table table-bordered">
                <tbody>
					 <tr>
                  <th style="width: 10px">#</th>
                  <th style="text-align:center">Title</th>
						<th style="text-align:center">SRP</th>
                  <th style="text-align:center">Units Sales</th>
						<th style="text-align:center">Gross Sales</th>
                </tr>
					<?	$rank = 1;
						foreach($cancel_data as $value){
							if($rank<=10){

							switch($value['settlekind']){
								case "LinePay":
									$fee = "0.0605";
								break;
								case "Credit":
									$fee = "0.0341";
								break;
								case "Webcvs":
									$fee = "0.0743";
								break;
							}

							$price = $value['order_srp'];

							$pg_fee = $price*$value['order_count']*$fee;
							$vat = $price*$value['order_count']*0.1;

							if($value['order_ppr']>0){
								$ppr = $value['order_ppr']*$value['order_count'];
							}else{
								$ppr = ($price*$value['order_count']-$pg_fee-$vat)*$value['revenue']/100;
							}
					?>
                <tr>
                  <td><?=$rank?></td>
                  <td>[<?=$value['platform']?>] <?=$value['goods_nm_en']?></td>
						<td style="text-align:right"><?=number_format($value['order_srp'])?></td>
                  <td style="text-align:right"><?=number_format($value['order_count'])?></td>
						<td style="text-align:right"><?=number_format($price*$value['order_count'])?></td>
                </tr>
					 <?	$rank++;
							}
						}
					 ?>
              </tbody>
				  </table>
            </div>
            <!-- /.box-body -->
            <div class="box-footer clearfix">
              <div class="pull-right"><a href="refund_list_jp.php">More Info</a></div>
            </div>
          </div>

        </section>
        <!-- right col -->
      </div>
      <!-- /.row (main row) -->

    </section>
    <!-- /.content -->
  </div>
  <!-- /.content-wrapper -->
  <footer class="main-footer">
    <div class="pull-right hidden-xs">
    </div>
    <strong>Copyright &copy; 2017 <a href="http://h2int.com">H2 INTERACTIVE Co., Ltd</a>.</strong> All rights
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
<script src="plugins/daterangepicker/daterangepicker.js?8"></script>
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
<script src="plugins/chartjs/Chart.min.js"></script>
<!-- AdminLTE dashboard demo (This is only for demo purposes) -->
<script src="dist/js/pages/dashboard.js?6"></script>
<!-- AdminLTE for demo purposes -->
<script src="dist/js/demo.js"></script>

<script>
$(document).ready(function(){
	var search_publisher = "<?=$search_publisher?>";
	var start_dt = "<?=$start_dt?>";
	var end_dt = "<?=$end_dt?>";
	var search_date = "<?=$search_date?>";

	//막대그래프 - 월별 판매수량
	$.ajax({
		url: "bar_graph_json_jp.php",
		dataType: 'JSON',
		type: 'POST',
		data: {search_publisher: search_publisher,target:"gross_sales"},
		success: function(response) {
			var bar = new Morris.Bar({
				element: 'bar-chart',
				resize: true,
				data: response,
				barColors: ['#00c0ef'],
				xkey: 'month',
				ykeys: ['value'],
				labels: ['Total Gross Sales'],
				hideHover: 'auto'
			});
		}
    });

	//막대 그래프 - 월별 환불
	 $.ajax({
		url: "bar_graph_json2_jp.php",
		dataType: 'JSON',
		type: 'POST',
		data: {search_publisher: search_publisher,target:"gross_sales"},
		success: function(response) {
			var bar = new Morris.Bar({
				element: 'bar-chart2',
				resize: true,
				data: response,
				barColors: ['#f56954'],
				xkey: 'month',
				ykeys: ['value'],
				labels: ['Total Refund'],
				hideHover: 'auto'
			});
		}
    });

	// 선그래프
	 $.ajax({
        url: "line_graph_json_jp.php",
        dataType: 'JSON',
        type: 'POST',
        data: {search_publisher: search_publisher,start_dt:start_dt,end_dt:end_dt},
        success: function(response) {
				Morris.Line({
				element: 'line-chart',
				data: response,
				resize: true,
				xkey: 'month',
				ykeys: ['gross_sales'],
				labels: ['gross_sales'],
				lineColors:['#00c0ef'],
			});
        }
    });

});

// -------------
// - PIE CHART -
// -------------
// Get context with jQuery - using jQuery's .get() method.
var pieChartCanvas = $('#pieChart').get(0).getContext('2d');
var pieChart       = new Chart(pieChartCanvas);
var PieData        = <?=$pie_graph_json?>;
var pieOptions     = {
 // Boolean - Whether we should show a stroke on each segment
 segmentShowStroke    : true,
 // String - The colour of each segment stroke
 segmentStrokeColor   : '#fff',
 // Number - The width of each segment stroke
 segmentStrokeWidth   : 1,
 // Number - The percentage of the chart that we cut out of the middle
 percentageInnerCutout: 50, // This is 0 for Pie charts
 // Number - Amount of animation steps
 animationSteps       : 100,
 // String - Animation easing effect
 animationEasing      : 'easeOutBounce',
 // Boolean - Whether we animate the rotation of the Doughnut
 animateRotate        : true,
 // Boolean - Whether we animate scaling the Doughnut from the centre
 animateScale         : false,
 // Boolean - whether to make the chart responsive to window resizing
 responsive           : true,
 // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
 maintainAspectRatio  : false,
 // String - A legend template
 legendTemplate       : '<ul class=\'<%=name.toLowerCase()%>-legend\'><% for (var i=0; i<segments.length; i++){%><li><span style=\'background-color:<%=segments[i].fillColor%>\'></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>',
 // String - A tooltip template
 tooltipTemplate      : '<%=value %> <%=label%> users'
};
// Create pie or douhnut chart
// You can switch between pie and douhnut using the method below.
pieChart.Doughnut(PieData, pieOptions);
// -----------------
// - END PIE CHART -
// -----------------
</script>
<script type="text/javascript">
$(document).ready(function(){
	var start_dt = $("#start_dt").val();
	var end_dt = $("#end_dt").val();
console.log('<?=$end_dt?>');

	$('#daterange-btn span').html(start_dt+"~"+end_dt);

	$('#daterange-btn').daterangepicker({
		maxSpan: {
			days: '7'
		},
		 ranges: {
			'This Month': [moment().startOf('month'), moment().endOf('month')],
			'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
		},
				/*
		startDate: moment('<?=$start_dt?>'),
		endDate: moment('<?=$end_dt?>').subtract(1, 'days'),
*/
		startDate: moment('<?=date("m/d/Y", strtotime($start_dt))?>'),
		endDate: moment('<?=date("m/d/Y", strtotime($end_dt))?>'),
		minDate: '<?=$view_start_date?>',
		maxDate: moment().subtract(1, 'days'),
		alwaysShowCalendars : true,
	},
	function (start, end) {
		var end_date = new Date(end.format('YYYY/MM/DD'));
		var start_date = new Date(start.format('YYYY/MM/DD'));
		var diff = (end_date.getTime()-start_date.getTime())/(1000*60*60*24);

		console.log(diff);
		if(diff>90){
			alert("The search period can be up to 90 days.");
			return false;
		}else{
			$('#daterange-btn span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
			$('#start_dt').val(start.format('YYYY-MM-DD'));
			$('#end_dt').val(end.format('YYYY-MM-DD'));
		}
	});
});
</script>
</body>
</html>
