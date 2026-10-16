<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['repay'] = "active";
$page_title="포인트 설정";

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

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);

	if($product_code){
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_option_data = $stmt->fetch();

		$checked['status'][$goods_option_data['status']]="checked";
		$checked['is_repay'][$goods_option_data['is_repay']]="checked";
		$checked['purchase_limit_yn'][$goods_option_data['purchase_limit_yn']]="checked";

		$checked['soldout'][$goods_option_data['soldout']]="checked";

		$selected['supplier_code'][$goods_option_data['supplier_code']]="selected";
		$checked['is_view'][$goods_option_data['is_view']]="checked";
		$selected['bonus_no'][$goods_bonus_data['bonus_no']]="selected";
		
		//추가 적립금 진행이력
		$add_repay_history = $adminGoods->getAddRepayHistory($product_code);
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<!-- Begin page -->
<div class="wrapper">
	<!-- ========== Left Sidebar Start ========== -->
	<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sidebar_goods.php');?>
	<!-- Left Sidebar End -->

	<!-- Start Page Content here -->
	<!-- ============================================================== -->
	<div class="content-page">
		<div class="content">
			<!-- Topbar Start -->
			<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/topbar.php');?>
			<!-- end Topbar -->

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
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$goods_option_data['product_name']?>(<?=$goods_option_data['product_name_en']?>)</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_option.php');?>
					</div>
					<div class="col-10">
						<!-- 옵션상품 적립금 설정 -->
						<form id="repay_frm" name="repay_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="repay_config">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<div class="card">
								<div class="card-header bg-secondary text-white fw-bold font-15">기본 포인트 설정</div>
								<div class="card-body">
									<div class="mb-2 row">
										<label for="is_repay" class="col-sm-2 col-form-label bg-light">* 포인트 지급여부</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="is_repay_y" name="is_repay" class="form-check-input" value="Y" <?=$checked['is_repay']['Y']?>>
												<label class="form-check-label" for="is_repay_y">지급</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="is_repay_n" name="is_repay" class="form-check-input" value="N" <?=$checked['is_repay']['N']?>>
												<label class="form-check-label" for="is_repay_n">미지급</label>
											</div>
										</div>
									</div>
									
									<div class="mb-2 row">
										<label for="repay_type" class="col-sm-2 col-form-label bg-light"> 포인트 지급방법</label>
										<div class="col-9">
											<input type="text" readonly="" class="form-control-plaintext" id="repay_type" value="회원등급별 차등 지급">
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
<?php
	if(!$product_viewer){
?>
										<button type="submit" class="btn btn-primary shadow-none">포인트 설정저장</button>
<?php
	}
?>
									</div>
								</div>
							</div>
						</form>
						
						<!-- 옵션상품 추가 적립금 설정 -->
						<form id="add_repay_frm" name="add_repay_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="add_repay_config">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<div class="card">
								<div class="card-header bg-secondary text-white fw-bold font-15">추가 포인트 설정</div>
								<div class="card-body">
									<div class="mb-2 row">
										<label for="add_repay" class="col-sm-2 col-form-label bg-light"> 추가 포인트</label>
										<div class="col-10">
											<div class="input-group">
												<label class="input-group-text" for="add_emoney_text1">주문금액의</label>
												<div class="col-2"><input class="form-control" id="add_repay" type="number" name="add_repay" required ></div>
												<div class="col-1">
													<select name="repay_type" id="repay_type" class="form-select" required>
														<option value="%">%</option>
														<option value="원">원</option>
													 </select>
												 </div>
											</div>
										</div>
									</div>
									<div class="mb-2 row">
										<label for="add_emoney" class="col-sm-2 col-form-label bg-light"> 추가 포인트 지급기간</label>
										<div class="col-6">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="start_dt" name="start_dt" placeholder="추가 포인트 지급 시작일" value="<?=$start_dt?>" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="end_dt" name="end_dt" placeholder="추가 포인트 지급 종료일" value="<?=$end_dt?>" data-toggle="input-mask" data-mask-format="0000-00-00 00:00:00" required>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
<?php
	if(!$product_viewer){
?>
										<button type="submit" class="btn btn-primary shadow-none">추가 포인트 설정</button>
<?php
	}
?>
									</div>
								</div>
							</div>
						</form>
						
						<div class="card">
							<div class="card-header bg-secondary text-white fw-bold font-15">추가 포인트 진행이력</div>
							<div class="card-body">
								<table class="table table-centered table-sm table-bordered mb-0">
									<colgroup>
										<col width="10%"/>
										<col width="*"/>
										<col width="15%"/>
										<col width="5%"/>
									</colgroup>
									<thead class="bg-light font-13">
									<tr>
										<th class="text-center">추가 포인트</th>
										<th class="text-center">추가 포인트 지급기간</th>
										<th class="text-center">추가 포인트 지급여부</th>
										<th class="text-center">비고</th>
									</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($add_repay_history as $value){
									?>
									<tr>
										<td class="text-center">
										<?
											if($value['repay_type']=="%"){
										?>
											주문금액의 <?=$value['repay_point']?> <?=$value['repay_type']?>
										<?
											}else{
										?>
											<?=number_format($value['repay_point'])?> <?=$value['repay_type']?>
										<?
											}
										?>
										
										</td>
										<td class="text-center"><?=$value['start_dt']?> ~ <?=$value['end_dt']?></td>
										<td class="text-center"><?=$value['repay_flag']?></td>
										<td class="text-center"></td>
									</tr>
									<?
										}
									?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<!-- end row -->
				
			</div>
			<!-- container -->

		</div> 
		<!-- content -->

		<!-- Footer Start -->
		<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/footer.php');?>
		<!-- end Footer -->
	</div>
	<!-- ============================================================== -->
	<!-- End Page content -->


</div>
<!-- END wrapper -->

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>
//var simplemde = new SimpleMDE({ element: document.getElementById("description") });

$(document).ready(function(){
	$("#frm").submit(function( event ) {
	});
});

</script>

</body>
</html>
