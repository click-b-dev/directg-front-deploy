<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="Asset 일별 주문현황";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);
$search_day = filter_input(INPUT_GET, 'search_day', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}


if(!$search_year){
	$search_year = date('Y');
}

if(!$search_month){
	$search_month = date('m');
}

if(!$search_day){
	$search_day = date('d');
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";
$selected['search_day'][$search_day] = "selected";

if($search_day){
	$search_date = date('Y-m-d', strtotime($search_year."-".$search_month."-".$search_day));
}else {
	$search_date = date('Y-m-d');
}

$add_where = "";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$admin= new Admin($conn); 
	
	$add_where = "and b.ord_ymd='".$search_date."'";
	
	$asset_order_count = $admin->getOrderAssetDayCount($page,$add_where,$orderby,$param,'30');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>

<div class="content-page">
		<div class="content">
<!-- Start Content-->
			<div class="container-fluid">
				
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">Asset 주문 분석</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<form class="row row-cols-lg-auto g-3 align-items-center mb-3" action="<?=$_SERVER["PHP_SELF"]?>" method="get">
									<div class="col-12">
										<div class="d-flex align-items-center">
											<label for="status-select" class="col-4 col-form-label me-2">주문날짜</label>
											<div class="col-8">
												<select class="form-select" id="search_year" name="search_year">
													<option value="">:::년도:::</option>
													<?
														for($i=2013;$i<=date('Y');$i++){
													?>
													<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-12">
										<select class="form-select" id="search_month" name="search_month">
											<option value="">:::월:::</option>
											<?
												for($i=1;$i<=12;$i++){
											?>
											<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_month'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>월</option>
											<?
												}
											?>
										</select>
									</div>
									<div class="col-12">
										<select class="form-select" id="search_day" name="search_day">
											<option value="">:::일:::</option>
											<?
												
												$day_count = date('t', strtotime($search_year."-".$search_month."-01"));
												//echo $day_count;
												for($i=1;$i<=$day_count;$i++){
											?>
											<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_day'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>일</option>
											<?
												}
											?>
										</select>
									</div>
									<div class="col-3">
										<div class="col-auto">
											<button class="input-group-text btn-primary shadow-none" type="submit">검색</button>
										</div>
									</div>
								</form>
							</div> 
						</div> 
						
						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">Asset ID</th>
										<th class="text-center">Asset Name</th>
										<th class="text-center">Asset Publisher</th>
										<th class="text-center">Product Type</th>
										<th class="text-center">Asset Type</th>
										<th class="text-center">Asset Platform</th>
										<th class="text-center">주문수량</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?
									if($asset_order_count->success == true){
										$result = $asset_order_count->resultset->fetchAll();
										foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$value['asset_id']?></td>
										<td><?=$value['asset_name']?></td>
										<td class="text-center"><?=$value['publisher']?></td>
										<td class="text-center"><?=$value['productType']?></td>
										<td class="text-center"><?=$value['assetType']?></td>
										<td class="text-center"><?=$value['platform']?></td>
										<td class="text-end"><?=number_format($value['total_count'])?></td>
									</tr>
								<?
										$total_count+=$value['total_count'];
										}
									}
								?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="3" class="text-center">합계</th>
										<th class="text-end"></td>
										<th class="text-end"></td>
										<th class="text-end"></td>
										<th class="text-end"><?=number_format($total_count)?></th>
									</tr>
								</tfoot>
							</table>
						</div>
						<div class="text-center mt-3"><?echo $asset_order_count->links_html;?></div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_order_batch").bind("click",function(){
		var index = $(".btn_order_batch").index(this);
		var ord_ymd = $(".btn_order_batch").eq(index).attr("data-date");
		var search_year = $(".btn_order_batch").eq(index).attr("data-year");
		$.ajax({
			 type: "POST",
			 url: "order_count_batch.php",
			 data: {mode:"batch_day",search_year:search_year,ord_ymd:ord_ymd},
			 success: function (data, status) {
				location.reload();
				//alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
});
</script>
</body>
</html>
