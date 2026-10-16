<?
//사용X
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "입고 처리";

$asset_id = filter_input(INPUT_GET, 'asset_id', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	$query = "select asset_id,asset_name,date_format(regDt,'%Y-%m-%d')as dd,regDt,count(*)as cc from tbl_asset_item where asset_id=:asset_id group by date_format(regDt,'%Y-%m-%d')";
	$stmt = $conn->prepare($query);
	$params = array(
		':asset_id'=>$asset_id
	);
	$stmt->execute($params);
	$data = $stmt->fetchAll();

	//Asset 개별정보조회
	$asset_data= $admin->getAssetInfo($asset_id);

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
					<div class="col-12">
						<div class="">
							<form class=" ">
								<div class="pt-0">
									총 <strong id="total" class="text-danger"><? echo number_format($asset_stock_in_list->total_results)?> </strong> 개
								</div>
								<div class="row mt-2">
									<div class="col-12">
										<div class="card">
											<table class="table table-sm table-centered table-bordered mb-0">
											<thead class="table-dark">
												<tr>
													<th class="text-center" style="width:130px">날짜</th>
													<th class="text-center" style="width:90px">DGKR<br/>Asset ID</th>
													<th class="text-center">Asset 이름</th>
													<th class="text-center" style="width:90px">발주수량</th>
													<th class="text-center" style="width:120px">매입단가</th>
													<th class="text-center" style="width:100px">매입합계</th>
													<th class="text-center" style="width:110px">비고</th>
												</tr>
											</thead>
											<tbody>
											<?
												foreach($data as $value){
													//발주서 등록체크
											?>
												<input type="hidden" name="reg_date[]" value="<?=$value['regDt']?>" readonly>
												<tr>
													<td><input type="text" class="form-control" name="warehousing_date[]" value="<?=$value['dd']?>" readonly></td>
													<td><input type="text" class="form-control" name="asset_id[]" value="<?=$value['asset_id']?>" readonly></td>
													<td><input type="text" class="form-control" name="asset_name[]" value="<?=$value['asset_name']?>" readonly></td>
													<td>
														<input type="text" class="form-control" name="qty[]" value="<?=$value['cc']?>" readonly>
													</td>
													<td>
														<input type="text" class="form-control" name="unit_price[]" value="<?=$asset_data['asset_ppr']?>" data-toggle="input-mask" data-mask-format="000,000,000,000,000" data-reverse="true">
													</td>
													<td class="text-end"><?=number_format($value['cc']*$asset_data['asset_ppr'])?></td>
													<td class="text-center">
														<button type="button" class="btn btn-outline-dark btn_confirm">입고처리</button>
													</td>
												</tr>
											<?
													$total_qty+=$value['cc'];
													$total_ppr+=$value['cc']*$asset_data['asset_ppr'];
												}
											?>
											</tbody>
											<tfoot class="table-light">
												<tr>
													<th class="text-center" colspan="2">합계</th>
													<th></th>
													<th class="text-end"><?=number_format($total_qty)?></th>
													<th class="text-end"><?=number_format($total_ppr)?></th>
													<th></th>
													<th></th>
												</tr>
											</tfoot>
											</table>
										</div>
										<!-- end card-->
									</div>
									<!-- end col -->
								</div>
							</form>
							<!-- end .mt-4 -->
						</div>
					</div>
					<!-- Right Sidebar -->
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
	$(".btn_confirm").bind("click",function(){
		var index = $(".btn_confirm").index(this);
		var asset_id=$('input[name="asset_id[]"]').eq(index).val();
		var asset_name=$('input[name="asset_name[]"]').eq(index).val();
		var qty=$('input[name="qty[]"]').eq(index).val();
		var unit_price=$('input[name="unit_price[]"]').eq(index).val();
		var warehousing_date=$('input[name="warehousing_date[]"]').eq(index).val();
		var reg_date=$('input[name="reg_date[]"]').eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "asset_stock_ps.php",
			 data: {mode:"stock_in_confirm",asset_id:asset_id,asset_name:asset_name,qty:qty,unit_price:unit_price,warehousing_date:warehousing_date,reg_date:reg_date},
			 success: function (data, status) {
				alert(data);
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
