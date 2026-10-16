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

	$admin= new Admin($conn);
	$parsedown= new Parsedown();

	if($product_code){
		$mode= "sales_config";
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_option_data = $stmt->fetch();

		//판매시작일
		if($goods_option_data['start_date']=="" || $goods_option_data['start_date']==0){
			$start_date = date('Y-m-d H:i');
		}else{
			$start_date = date('Y-m-d H:i',$goods_option_data['start_date']);
		}

		//판매종료일 (기본값: 2999-12-31 23:59:59)
		if($goods_option_data['end_date']=="" || $goods_option_data['end_date']==0){
			$end_date = "2050-12-31 23:59:59";
		}else{
			$end_date = date('Y-m-d H:i',$goods_option_data['end_date']);
		}

		$delivery_date = date('Y-m-d H:i',$goods_option_data['delivery_date']);

		//예약구매시작일 (기본값 =판매시작일)
		if($goods_option_data['preorder_start']=="" || $goods_option_data['preorder_start']==0){ 
			$preorder_start = date('Y-m-d H:i',$goods_option_data['start_date']);
		}else{
			$preorder_start = date('Y-m-d H:i',$goods_option_data['preorder_start']);
		}

		//예약구매 종료일 (기본값 = 출시일)
		if($goods_option_data['preorder_end']=="" || $goods_option_data['preorder_end']==0){ 
			$preorder_end= substr($goods_option_data['release_date'],0,16) ;
		}else{
			$preorder_end= date('Y-m-d H:i',$goods_option_data['preorder_end']);
		}

		//특전제공정보
		$goods_bonus_data = $admin->getGoodsItemBonus($product_code);

		//특전제공시작일
		if($goods_bonus_data['bonus_start_date']=="" || $goods_bonus_data['bonus_start_date']==0){ 
			$bonus_start_date = substr($preorder_start,0,16);
		}else{
			$bonus_start_date = date('Y-m-d H:i',$goods_bonus_data['bonus_start_date']);
		}

		//특전제공종료일
		if($goods_bonus_data['bonus_end_date']=="" || $goods_bonus_data['bonus_end_date']==0){ 
			$bonus_end_date = substr($goods_option_data['release_date'],0,16);
		}else{
			$bonus_end_date = date('Y-m-d H:i',$goods_bonus_data['bonus_end_date']);
		}

		$checked['status'][$goods_option_data['status']]="checked";
		$checked['purchase_limit_yn'][$goods_option_data['purchase_limit_yn']]="checked";

		$checked['soldout'][$goods_option_data['soldout']]="checked";

		$selected['supplier_code'][$goods_option_data['supplier_code']]="selected";
		$checked['is_view'][$goods_option_data['is_view']]="checked";
		$selected['bonus_no'][$goods_bonus_data['bonus_no']]="selected";
	}

	$publisher_data= $admin->getPublisherAllList('all');
	//특전제공 목록
	$bonus_list= $admin->getBonusList();

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
									<li class="breadcrumb-item active">일반판매 / 가격 설정</li>
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
							<a class="nav-link active rounded-0" id="v-pills-profile-tab" href="goods_option_price_register.php?product_code=<?=$product_code?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">가격 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="goods_option_bonus_register.php?product_code=<?=$product_code?>" >
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
					<div class="col-10">
						<!-- 옵션상품 가격설정 -->
						<form id="price_frm" name="price_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="price_save">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							
							<div class="card border">
								<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 가격설정</div>
								<div class="card-body">
									<div class="row">
										<div class="col-12">
											<div class="row mb-2">
												<label for="consumer_price" class="col-sm-2 col-form-label bg-light">* 소비자가</label>
												<div class="col-3">
													<div class="input-group">
														<div class="input-group-text" style="font-family:dotum">&#92;</div>
														<input type="text" class="form-control" id="consumer_price" name="consumer_price" placeholder="" value="<?=$goods_option_data['consumer_price']?>">
													</div>
												</div>
											</div>
											<div class="row mb-2">
												<label for="price" class="col-sm-2 col-form-label bg-light">* DGKR 판매가</label>
												<div class="col-3">
													<div class="input-group">
														<div class="input-group-text" style="font-family:dotum">&#92;</div>
														<input type="text" class="form-control" id="price" name="price" placeholder="" value="<?=$goods_option_data['price']?>">
													</div>
												</div>
											</div>
											<div class="row mb-2">
												<label for="discount" class="col-sm-2 col-form-label bg-light">할인률</label>
												<div class="col-2">
													<div class="input-group">
														<input type="text" class="form-control" id="discount" name="discount" placeholder="" value="<?=$goods_option_data['discount']?>" maxlength="2">
														<div class="input-group-text" style="font-family:dotum">%</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary shadow-none">가격 설정 저장</button>
									</div>
								</div>
							</div>
						</form>
						
						<!-- 옵션상품 공급처설정 -->
						<form id="supplier_frm" name="supplier_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="supplier_save">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<div class="card border">
								<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 공급처 설정</div>
								<div class="card-body">
									<div class="mb-2 row">
										<label for="supplier_code" class="col-sm-2 col-form-label bg-light">* 공급처</label>
										<div class="col-sm-6">
											<select id="supplier_code" name="supplier_code" class="form-select" required>
												<option value="">:::선택:::</option>
												<?
													foreach($publisher_data as $value){
												?>
												<option value="<?=$value['publisher_code']?>" <?=$selected['supplier_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
												<?
													}
												?>
											</select>
										</div>
									</div>
									<div class="row mb-2">
										<label for="product_srp" class="col-sm-2 col-form-label bg-light">* 공급처 SRP</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="product_srp" name="product_srp" placeholder="" value="<?=$goods_option_data['product_srp']?>">
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="product_ppr" class="col-sm-2 col-form-label bg-light">공급처 PPR</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="product_ppr" name="product_ppr" placeholder="" value="<?=$goods_option_data['product_ppr']?>">
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="product_rs" class="col-sm-2 col-form-label bg-light">공급처 RS</label>
										<div class="col-2">
											<div class="input-group">
												<input type="text" class="form-control" id="product_rs" name="product_rs" placeholder="" value="<?=$goods_option_data['product_rs']?>" maxlength="2">
												<div class="input-group-text" style="font-family:dotum">%</div>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary shadow-none">공급처 설정 저장</button>
									</div>
								</div>
							</div>
						</form>
						
						<!-- 옵션상품 예약판매설정 -->
						<form id="preorder_frm" name="preorder_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="preorder_config">
							<input type="hidden" name="game_type" value="<?=$goods_option_data['game_type']?>">
							<input type="hidden" name="is_view" value="<?=$goods_option_data['is_view']?>">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<div class="card border">
								<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 예약판매설정</div>
								<div class="card-body">
									<div class="row mb-2">
										<label for="preorder_date" class="col-sm-3 col-form-label bg-light">* 예약구매기간</label>
										<div class="col-6 mt-1">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="preorder_start_date" name="preorder_start_date" placeholder="예약구매시작일" value="<?=$preorder_start?>" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="preorder_end_date" name="preorder_end_date" placeholder="예약구매종료일" value="<?=$preorder_end?>" required>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary shadow-none">예약판매설정 저장</button>
									</div>
								</div>
							</div>
						</form>
						
						<!-- 옵션상품 특전제공설정 -->
						<form id="bonus_frm" name="bonus_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="bonus_config">
							<input type="hidden" name="game_type" value="<?=$goods_option_data['game_type']?>">
							<input type="hidden" name="is_view" value="<?=$goods_option_data['is_view']?>">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<input type="hidden" name="goods_sku" value="<?=$goods_option_data['goods_sku']?>">
							<div class="card border border-1">
								<div class="card-header bg-secondary text-white fw-bold font-15">특전제공 설정</div>
								<div class="card-body">
									<div class="mb-2 row">
										<label for="bonus_no" class="col-sm-2 col-form-label bg-light">* 특전</label>
										<div class="col-9 mt-1">
											<select class="form-control select2" name="bonus_no" data-toggle="select2" required>
												<option value="">특전선택</option>
												<?
													foreach($bonus_list as $bonus){
												?>
												<option value="<?=$bonus['bonus_no']?>" <?=$selected['bonus_no'][$bonus['bonus_no']]?>><?=$bonus['bonus_name']?></option>
												<?
													}
												?>
											</select>
										</div>
									</div>
									<div class="mb-2 row">
										<label for="is_special" class="col-sm-2 col-form-label bg-light">* 특전 제공기간</label>
										<div class="col-6 mt-1">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="bonus_start_date" name="bonus_start_date" placeholder="특전제공시작일" value="<?=$bonus_start_date?>" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="bonus_end_date" name="bonus_end_date" placeholder="특전제공종료일" value="<?=$bonus_end_date?>" required>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="pre_delivery" class="col-2 col-form-label bg-light">사전제공 여부</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="pre_delivery_y" name="pre_delivery" class="form-check-input" value="Y" <?=$checked['pre_delivery']['Y']?>>
												<label class="form-check-label" for="pre_delivery_y">예</label>
											</div>
											<div class="form-check form-check-inline mt-2">
												<input type="radio" id="pre_delivery_n" name="pre_delivery" class="form-check-input" value="N" <?=$checked['pre_delivery']['N']?>>
												<label class="form-check-label" for="pre_delivery_n">아니오</label>
											</div>
										</div>
									</div>

									<div class="row mb-2 d-none" id="pre_delivery_config">
										<label for="pre_delivery_date" class="col-2 col-form-label bg-light"> 사전제공일자</label>
										<div class="col-3">
											<div class="input-group">
												<input type="text" class="form-control" id="pre_delivery_date" name="pre_delivery_date" placeholder="사전제공 시작일자" value="<?=$pre_delivery_date?>">
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary shadow-none">특전제공 설정저장</button>
									</div>
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
