<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="옵션상품 타임딜 설정";

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

	$adminGoods= new AdminGoods($conn);

	if($product_code){
		
		//옵션상품 정보
		
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_option_data = $stmt->fetch();
		
		//타임딜 진행이력
		$timedeal_history = $adminGoods->getTimedealHistory($product_code);
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
									<li class="breadcrumb-item active">타임딜 설정</li>
								</ol>
							</div>
							<h4 class="page-title"><?=$goods_option_data['product_name']?>(<?=$goods_option_data['product_name_en']?>)</h4>
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
							<?if($goods_option_data['game_type']=="timedeal"){?>
							<a class="nav-link rounded-0 active" id="v-pills-profile-tab" href="timedeal_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">타임딜 설정</span>
							</a>
							<?}?>
							
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_bonus_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">특전제공 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_repay_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">적립금 설정</span>
							</a>
						</div>
					</div>
					<div class="col-10">
						<!-- 옵션상품 타임딜설정 -->
						<form id="timedeal_frm" name="timedeal_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="timedeal_config">
							<input type="hidden" name="game_type" value="<?=$goods_option_data['game_type']?>">
							<input type="hidden" name="is_view" value="<?=$goods_option_data['is_view']?>">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<input type="hidden" name="goods_sku" value="<?=$goods_option_data['goods_sku']?>">
							<div class="card border border-1">
								<div class="card-header bg-secondary text-white fw-bold font-15">타임딜 설정</div>
								<div class="card-body">
									<div class="mb-2 row">
										<label for="timedeal_date" class="col-sm-2 col-form-label bg-light">* 타일딜 진행기간</label>
										<div class="col-6 mt-1">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="timedeal_start_date" name="timedeal_start_date" placeholder="타임딜 시작일자" value="<?=$bonus_start_date?>" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="timedeal_end_date" name="timedeal_end_date" placeholder="타임딜 종료일자" value="<?=$bonus_end_date?>" required>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="product_srp" class="col-2 col-form-label bg-light">퍼블리셔 SRP</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="product_srp" name="product_srp" placeholder="" value="<?=$goods_option_data['product_srp']?>">
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="product_ppr" class="col-2 col-form-label bg-light">퍼블리셔 공급가격</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="product_ppr" name="product_ppr" placeholder="" value="<?=$goods_option_data['product_ppr']?>">
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="timedeal_price" class="col-2 col-form-label bg-light">타임딜 판매가</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="timedeal_price" name="timedeal_price" placeholder="" value="<?=$goods_option_data['timedeal_price']?>">
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="timedeal_stock" class="col-2 col-form-label bg-light">타임딜 진행수량</label>
										<div class="col-3">
											<input type="text" class="form-control" id="timedeal_stock" name="timedeal_stock" placeholder="" value="<?=$goods_option_data['timedeal_stock']?>">
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="timedeal_confirm" class="col-2 col-form-label bg-light">타임딜 승인여부</label>
										<div class="col-10 mt-1">
											<div class="form-check form-radio-dark form-check-inline">
												<input type="radio" id="timedeal_confirm_y" name="timedeal_confirm" class="form-check-input" value="Y" <?=$checked['timedeal_confirm']['Y']?>>
												<label class="form-check-label" for="timedeal_confirm_y">Y</label>
											</div>
											<div class="form-check form-radio-dark form-check-inline">
												<input type="radio" id="timedeal_confirm_n" name="timedeal_confirm" class="form-check-input" value="N" <?=$checked['timedeal_confirm']['N']?>>
												<label class="form-check-label" for="timedeal_confirm_n">N</label>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary shadow-none">타임딜 설정저장</button>
									</div>
								</div>
							</div>
							
							<div class="card">
								<div class="card-header bg-secondary text-white fw-bold font-15">타임딜 진행이력</div>
								<div class="card-body p-0">
									<table class="table table-bordered table-centered mb-0 table-sm">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">타임딜 회차</th>
												<th class="text-center">타임딜 진행기간</th>
												<th class="text-center">타임딜 진행수량</th>
												<th class="text-center">퍼블리셔 SRP</th>
												<th class="text-center">퍼블리셔 PRR</th>
												<th class="text-center">타임딜 판매가</th>
												<th class="text-center">타임딜 판매수량</th>
												<th class="text-center">타임딜 진행상태</th>
											</tr>
										</thead>
										<tbody>
										<?
											$num=1;
											foreach($timedeal_history as $timedeal){
										?>
											<tr>
												<td class="text-center"><?=$num++?></td>
												<td class="text-center"><?=date('Y-m-d H:i:s',$timedeal['timedeal_start'])?> ~ <?=date('Y-m-d H:i:s',$timedeal['timedeal_end'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_stock'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_srp'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_ppr'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_price'])?></td>
												<td class="text-end"></td>
												<td class="text-center"><?=$timedeal['timedeal_status']?></td>
											</tr>
										<?
											}
										?>
										</tbody>
									</table>
								</div>
							</div>
						</form>
					</div>
				</div>

				<!-- end row -->   
				
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->

<script>
//var simplemde = new SimpleMDE({ element: document.getElementById("description") });

$(document).ready(function(){
	$("#frm").submit(function( event ) {
	});
});

</script>

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
