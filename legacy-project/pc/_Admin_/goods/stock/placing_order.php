<?
//사용x
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "발주현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

if(!$search_month){
	$search_month = date('Y-m');
}

$search_start=$search_month."-01";
$search_end=$search_month."-".date('t', strtotime($search_start));

$where = [];

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "reg_date desc";

	$admin= new Admin($conn);

	//발주요청현황 리스트
	$asset_stock_in_list = $admin->getAssetPlacingOrder($page,$add_where,$orderby,$param);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.page-aside-left{
	width:340px;
}

.page-aside-right{
	margin-left:350px;
}

#asset_item{
	font-family:arial;
	font-size:12px;
	letter-spacing:-1px;
}
</style>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">구매관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<!-- Right Sidebar -->
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<form class="d-flex justify-content-between">
									<div class="pt-2">
										총 <strong id="total" class="text-danger"><? echo number_format($asset_stock_in_list->total_results)?> </strong> 개
									</div>
								</form>

								<div class="row mt-3">
									<div class="col-12">
										<div class="card">
											<table class="table table-sm table-centered table-bordered mb-0">
											<thead class="table-dark">
												<tr>
													<th class="text-center">발주요청일자</th>
													<th class="text-center">공급처</th>
													<th class="text-center">발주요청 상품수</th>
													<th class="text-center">수량합계</th>
													<th class="text-center">금액합계</th>
													<th class="text-center">발주상태</th>
													<th class="text-center">발주서 상세보기</th>
												</tr>
											</thead>
											<tbody>
											<?
												if($asset_stock_in_list->success == true){
													$result = $asset_stock_in_list->resultset->fetchAll();

													foreach($result as $value){
											?>
												<tr>
													<td class="text-center"><?=$value['asset_id']?></td>
													<td class="text-center"><?=$value['warehousing_date']?></td>
													<td class="text-center"></td>
													<td><?=$value['asset_name']?></td>
													<td class="text-end"><?=number_format($value['qty'])?></td>
													<td class="text-end"><?=number_format($value['unit_price'])?></td>
													<td class="text-end"><?=number_format($value['qty']*$value['unit_price'])?></td>
													<td class="text-center">발주요청</td>
													<td class="text-center"></td>
												</tr>
											<?
													}
												}
											?>
											</tbody>
											</table>
										</div>
										<div class="text-center mt-3"><?echo $asset_stock_in_list->links_html;?></div>
										<!-- end card-->
									</div>
									<!-- end col -->
								</div>
								<!-- end .mt-4 -->

							</div>
							<!-- end card-body -->
							<div class="clearfix"></div>
						</div> <!-- end card-box -->

					</div> <!-- end Col -->
				</div>
				<!-- end row -->
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function () {
	$("select[name='publisherCd']").bind("change",function(){
		var publisher = $("select[name='publisherCd'] option:selected").text();
		$.ajax({
			 type: "POST",
			 url: "asset_stock_ps.php",
			 data: {mode:"search_asset",publisher:publisher},
			 success: function (data, status) {
				$("#asset_item").append(data);
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
