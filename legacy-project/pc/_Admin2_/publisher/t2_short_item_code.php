<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

if($_SESSION['publisher']['admin_id']==""){
	go("./index.php");
}

header("Content-Type: text/html; charset=UTF-8"); 

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_NUMBER_INT);
$search_game = filter_input(INPUT_GET, 'search_game', FILTER_SANITIZE_STRING);
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

if($search_game){
	$add_where = " where t.product_nm_en like '%".$search_game."%' ";
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

if(!$page){
	$page = 1;
}

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try  {  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query = "select t.product_code,t.product_nm_en,t.platform_code,b.short_item_code,t.publisher_code,
	CASE WHEN b.short_item_code IS NULL THEN '0'
	ELSE '1'
	END as is_t2_code
			from (select product_code,product_nm_en,platform_code,publisher_code from directgames.tbl_report where publisher_code in ('12','14','321') group by product_code)as t left join directgames.tbl_report_t2code b on t.product_code=b.product_code ".$add_where."
			order by is_t2_code asc,t.platform_code asc,t.product_nm_en asc
		";

	$options = array(
		'results_per_page' =>'50',
		'url'        => $_SERVER['PHP_SELF'].'?page=*VAR*',  
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
  <title>Directgames Partners - T2 Short item code</title>
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
					T2 Short item code
				</span>
			</div>
			<div class="col-lg-5 pull-right">
				<form name="searchFrm" method="get" action="<?=$_SERVER['PHP_SELF']?>" class="form-inline">
					<div class="form-group">
						<label for="search_game" class="control-label">Product Name : </label>
						<input type="text" class="form-control" name="search_game" value="<?=$search_game?>" style="width:450px">
						<button type="submit" class="btn btn-primary">Submit</button>
					</div>
				</form>
			</div>
		</div>
    </section>

    <!-- Main content -->
    <section class="content">
	 	<div class="row">
			<!--<div class="col-lg-2">
				<div class="pull-right">
					<button type="button" class="btn btn-info" data-toggle="modal" data-target="#shortItemModal"><i class="fa fa-plus"></i> Add Short Item Code</button>
				</div>
			</div>-->
		</div>
      <!-- Main row -->
      <div class="row">
        <!-- right col (We are only adding the ID to make the widgets sortable)-->
        <section class="col-lg-12 connectedSortable">

			<div class="box">
            <div class="box-header with-border">
              <h3 class="box-title">T2 Short item code list</h3>
            </div>
            <!-- /.box-header -->
            <div class="box-body">
              <table class="table table-bordered" id="excel_data">
                <tbody>
					 <tr>
						<th style="text-align:center;width:100px;">Publisher</th>
						<th style="text-align:center;width:150px;">Platform</th>
						<th style="text-align:center;width:50%;">Product Name</th>
						<th style="text-align:center;width:180px;">SHORT ITEM CODE</th>
						<th style="text-align:center;width:100px;">Save</th>
						<th style="text-align:center;width:100px;">Delete</th>
                </tr>
					 <? 
						if($pagination->success == true){
							$result = $pagination->resultset->fetchAll();

							foreach($result as $data){
					?>
				<tr>
					<td style="text-align:center">
					<?
						switch($data['publisher_code']){
							case "12":
								echo "2K";
							break;
							case "14":
								echo "Rockstar Games";
							break;
							case "321":
								echo "Gearbox Publishing";
							break;
						}
					?>
					</td>
					<td style="text-align:center">
						<?
							switch($data['platform_code']){
								case "1":
									echo "Steam";
								break;
								case "34":
									echo "Epic";
								break;
								case "27":
									echo "Rockstar Warehouse";
								break;
								case "35":
									echo "Rockstar Games Launcher";
								break;
							}
						?>
					</td>
					<td ><?=$data['product_nm_en']?></td>
					<td style="text-align:center"><input type="text" name="short_item_code[]" class="form-control" value="<?=$data['short_item_code']?>"></td>
					<td style="text-align:center"><button type="button" class="btn btn-default btn_save" data-goodscode="<?=$data['product_code']?>"><i class="fa fa-file" style="font-size:16px"></i> Save</button></td>
					<td style="text-align:center"><button type="button" class="btn btn-default btn_delete" data-goodscode="<?=$data['product_code']?>"><i class="fa fa-trash" style="font-size:18px"></i> Delete</button></td>
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
	 <form id="excelFrm" name="excelFrm" method="post" action="title_sales_excel.php">

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

<!-- Modal -->
<div class="modal" id="shortItemModal" tabindex="-1" aria-labelledby="shortItemModallLabel">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="myModalLabel">T2 Short Item Code</h4>
			</div>
			<div class="modal-body">
			
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				<button type="button" class="btn btn-primary">Save changes</button>
			</div>
		</div>
	</div>
</div>

<!-- jQuery 3.1.1 -->
<script src="plugins/jQuery/jquery-3.1.1.min.js"></script>
<!-- jQuery UI 1.11.4 -->
<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<!-- Bootstrap 3.3.7 -->
<script src="bootstrap/js/bootstrap.min.js"></script>
<!-- daterangepicker -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js"></script>
<!-- Slimscroll -->
<script src="plugins/slimScroll/jquery.slimscroll.min.js"></script>
<!-- FastClick -->
<script src="plugins/fastclick/fastclick.js"></script>
<!-- AdminLTE App -->
<script src="dist/js/adminlte.min.js"></script>
<!-- AdminLTE for demo purposes -->

<script type="text/javascript">
$(document).ready(function(){
	$("#btn_excel_download").bind("click",function(){
		 $("#excelFrm").submit();
	});

	$(".btn_save").bind("click",function(){
		var index = $(".btn_save").index(this);
		var goods_code =  $(".btn_save").eq(index).attr("data-goodscode");
		var short_item_code = $("input[name='short_item_code[]']").eq(index).val();

		 $.ajax({
			 type: "POST",
			 url: "t2_short_item_code_ps.php",
			 data: {mode:'save',goods_code:goods_code,short_item_code:short_item_code},
			 success: function (data, status) {
				  //alert(data);
				  location.reload();
				  //console.log(data);
			 }
		});
	});

	$(".btn_delete").bind("click",function(){
		var index = $(".btn_delete").index(this);
		var goods_code =  $(".btn_delete").eq(index).attr("data-goodscode");

		 $.ajax({
			 type: "POST",
			 url: "t2_short_item_code_ps.php",
			 data: {mode:'delete',goods_code:goods_code},
			 success: function (data, status) {
				 // alert(data);
				  location.reload();
				  //console.log(data);
			 }
		});
	});

});

</script>
</body>
</html>
