<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="옵션상품 가격 설정";

$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_GET, 'search_product_name', FILTER_SANITIZE_STRING);
$search_product_name_en = filter_input(INPUT_GET, 'search_product_name_en', FILTER_SANITIZE_STRING);
$search_product_type = filter_input(INPUT_GET, 'search_product_type', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_GET, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_order_system = filter_input(INPUT_GET, 'search_order_system', FILTER_SANITIZE_STRING);

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin_goods= new AdminGoods($conn);

	if($product_code){
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_option_data = $stmt->fetch();

		//특전제공정보
		$goods_bonus_data = $admin_goods->getGoodsItemBonus($product_code);
	}


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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">옵션상품 관리</a></li>
									<li class="breadcrumb-item active">특전제공 설정</li>
								</ol>
							</div>
							<h4 class="page-title"><?=$goods_option_data['product_name']?>(<?=$goods_option_data['product_name_en']?>) - <small><?=$goods_option_data['goods_sku']?></small></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<div class="nav flex-column nav-pills bg-nav-pills mb-2" id="v-pills-tab"aria-orientation="vertical">
							<a class="nav-link rounded-0 fw-500" id="v-pills-home-tab"  href="goods_option_view.php?product_code=<?=$product_code?>">
								<i class="mdi mdi-home-variant d-md-none d-block"></i>
								<span class="d-none d-md-block">상세보기</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_modify.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">기본정보 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_image_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">이미지 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_tag_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">태그 설정</span>
							</a>
							<a class="nav-link  rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_sales_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">판매 설정</span>
							</a>
							<a class="nav-link active rounded-0" id="v-pills-profile-tab" href="goods_option_bonus_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">특전제공 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="timedeal_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">타임딜 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_repay_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">적립금 설정</span>
							</a>
						</div>
					</div>
					<div class="col-8">
						<!-- 옵션상품 특전제공설정 -->
						<div class="card">
							<h5 class="card-header bg-secondary text-white">특전제공 설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">특전명</th>
											<th class="text-center">특전 제공방식</th>
											<th class="text-center">특전제공 시작일자</th>
											<th class="text-center">특전제공 종료일자</th>
											<th class="text-center">특전재고</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($goods_bonus_data as $sub_value){
									?>
										<tr>
											<td><?=$sub_value['bonus_name']?></td>
											<td class="text-center"><?=$sub_value['bonus_delivery_type']?></td>
											<td class="text-center"><?=date('Y-m-d H:i:s',$sub_value['bonus_start_date'])?></td>
											<td class="text-center"><?=date('Y-m-d H:i:s',$sub_value['bonus_start_date'])?></td>
											<td class="text-center"><?=$sub_value['stock']?></td>
											<td></td>
										</tr>
										<?
											}
										?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-10">
										<input type="text" class="form-control form-control-sm" name="search_value"  id="search_value" placeholder="검색할 특전명 입력해 주세요" value="<?=$goods_option_data['product_name']?>">
									</div>
									<div class="col-2">
										<button type="button" class="btn btn-sm btn-dark shadow-none" id="btn_bonus_find" data-productcode="<?=$product_code?>" data-sku="<?=$goods_option_data['goods_sku']?>">특전 검색</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- end row -->   
			</div> 
			<!-- container -->
		</div> 
		<!-- content -->
		
		<!--특전 검색 팝업-->
		<div id="bonus-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="bonus-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="max-width:1100px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="bonus-modalLabel">특전 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" id="product_code">
							<input type="hidden" name="goods_sku" id="goods_sku">
							<table class="table table-striped table-border mb-0 table-sm" id="bonus_info">
							<thead class="table-dark font-14">
							<tr>
								<th class="text-center" style="width:350px">특전명</th>
								<th class="text-center" style="width:80px">특전 제공방식</th>
								<th class="text-center" style="width:100px">특전 제공여부</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody class="font-13">
							</tbody>
							</table>
						</form>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->
		<!--//특전 검색 팝업-->

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>
$(document).ready(function(){
	//특전정보 검색
	$("#btn_bonus_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var goods_sku = $(this).attr("data-sku");
		var search_value = $("#search_value").val();

		if(search_value==""){
			alert("검색할 특전명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"bonus_search",search_value:search_value,product_code:product_code},
			 success: function (data, status) {
				$("#bonus-modal input[name='product_code']").val(product_code);
				$("#bonus-modal input[name='goods_sku']").val(goods_sku);
				$("#bonus-modal #bonus_info tbody").html(data);
				$("#bonus-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	$(document).on('click', '#bonus-modal .btn_goods_bonus_add', function(e){
		e.preventDefault();
		var index = $('.btn_goods_bonus_add').index(this);
		var product_code =  $("#bonus-modal input[name='product_code']").val();
		var goods_sku =  $("#bonus-modal input[name='goods_sku']").val();
		var bonus_no = $("#bonus-modal input[name='bonus_no[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"bonus_config",product_code:product_code,goods_sku:goods_sku,bonus_no:bonus_no},
			 success: function (data, status) {
				//alert(data);
				$("#title-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
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
