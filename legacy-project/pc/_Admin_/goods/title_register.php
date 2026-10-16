<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file="sidebar_goods.php";

$page_title = "대표상품 등록";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$title_mode = filter_input(INPUT_GET, 'title_mode', FILTER_SANITIZE_STRING);
$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_title_name = filter_input(INPUT_GET, 'search_title_name', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);
$search_age_limit = filter_input(INPUT_GET, 'search_age_limit', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);


	$mode= "register";
	$title_id = $admin->setGoodsTitleId();
	$sku = $admin->uuidgen4();
	
	if($product_code){
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);

		$goods_option_data = $stmt->fetch();
		$title_name = $goods_option_data['product_name'];
		$title_name_en = $goods_option_data['product_name_en'];
		$steam_appid = $goods_option_data['steam_appid'];
		$release_date = date("Y-m-d",strtotime($goods_option_data['release_date']));

		//개발사정보
		$developer_data = $admin->getSteamDeveloper($goods_option_data['steam_appid']);
		$developer = $developer_data['developer'];

		//퍼블리셔정보
		$publisher_data = $admin->getSteamPublisher($goods_option_data['steam_appid']);
		$publisher = $publisher_data['publisher'];
	}

	$checked['is_view']['N']="checked";
	$checked['sales_status']['C']="checked";
	$checked['coming_soon']['Y']="checked";
	$checked['title_code']['33']="checked";

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">대표상품 관리</a></li>
									<li class="breadcrumb-item active">대표상품 등록</li>
								</ol>
							</div>
							<h4 class="page-title">대표상품 등록</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<form id="frm" name="frm" method="post" action="title_ps.php" class="form-horizontal" enctype="multipart/form-data">
					<input type="hidden" name="mode" value="<?=$mode?>">
					<input type="hidden" name="title_mode" value="<?=$title_mode?>">
					<input type="hidden" name="page" value="<?=$page?>">
					<input type="hidden" name="search_title_name" value="<?=$search_title_name?>">
					<input type="hidden" name="search_is_view" value="<?=$search_is_view?>">
					<input type="hidden" name="search_publisher_code" value="<?=$search_publisher_code?>">
					<input type="hidden" name="search_platform" value="<?=$search_platform?>">
					<input type="hidden" name="search_age_limit" value="<?=$search_age_limit?>">
					
					<input type="hidden" id="game_rate_text" name="game_rate_text" value="">

					<div class="row mb-2">
						<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
							<button type="submit" class="btn btn-primary shadow-none"><i class="mdi mdi-content-save font-16"></i> 대표상품 등록</button>
						<?php
							}
						?>
						</div>
					</div>
					
					<div class="row">
						<div class="col-8">
							<div class="card">
								<h5 class="card-header bg-secondary text-white"><span class="text-danger">(필수)</span> 대표상품 기본정보</h5>
								<div class="card-body">
									<div class="row mb-2">
										<label for="title_id" class="col-3 col-form-label bg-light border">* 대표상품코드</label>
										<div class="col-9">
											<input type="text" class="form-control-plaintext" id="title_id" name="title_id" value="<?=$title_id?>" placeholder="" readonly>
										</div>
									</div>
									<div class="row mb-2">
										<label for="sku" class="col-3 col-form-label bg-light border">* 대표상품SKU</label>
										<div class="col-9">
											<input type="text" class="form-control-plaintext" id="sku" name="sku" value="<?=$sku?>" placeholder="" readonly>
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name" class="col-3 col-form-label bg-light border">* 대표상품명(국문)</label>
										<div class="col-9">
											<input type="text" class="form-control" id="title_name" name="title_name" value="<?=$title_name?>" placeholder="" required>
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name_en" class="col-3 col-form-label bg-light border">* 대표상품명(영문)</label>
										<div class="col-9">
											<input type="text" class="form-control" id="title_name_en" name="title_name_en" value="<?=$title_name_en?>" placeholder="" required>
										</div>
									</div>
									<div class="row mb-2">
										<label for="coming_soon" class="col-3 col-form-label bg-light border">* 출시여부</label>
										<div class="col-9 border-bottom border-end border-top py-1">
											<div class="row g-3  align-items-center">
												<div class="col-auto">
													<div class="form-check">
														<input type="radio" id="coming_soon_c" name="coming_soon" class="form-check-input" value="Y" <?=$checked['coming_soon']['Y']?>>
														<label class="form-check-label" for="coming_soon_c">출시예정</label>
													</div>
												</div>
												<div class="col-auto">
													<input type="text" class="form-control" id="coming_soon_date" name="coming_soon_date" value="" placeholder="출시일 미정시 입력" >
												</div>
												<div class="col-auto">
													<div class="form-check">
														<input type="radio" id="coming_soon_n" name="coming_soon" class="form-check-input" value="N" <?=$checked['coming_soon']['N']?>>
														<label class="form-check-label" for="coming_soon_n">출시확정</label>
													</div>
												</div>
												<div class="col-auto">
													<div class="position-relative" id="datepicker1">
														<input type="text" class="form-control" id="release_date" name="release_date" value="" data-provide="datepicker" data-date-container="#datepicker1" data-date-format="yyyy-mm-dd" autocomplete="off" placeholder="출시일">
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_code" class="col-3 col-form-label bg-light border">* 상품정보 제공고시 품목 구분</label>
										<div class="col-9 border-bottom border-end border-top">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="title_code_33" name="title_code" class="form-check-input" value="33" <?=$checked['title_code']['33']?>>
												<label class="form-check-label" for="title_code_33">(33) 디지털 콘텐츠(게임)</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="title_code_12" name="title_code" class="form-check-input" value="12" <?=$checked['title_code']['12']?>>
												<label class="form-check-label" for="title_code_12">(12) 소형전자</label>
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="title_name" class="col-3 col-form-label bg-light border">* 대표상품 페이지 노출</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="is_view_1" name="is_view" class="form-check-input" value="Y" <?=$checked['is_view']['Y']?>>
												<label class="form-check-label" for="is_view_1">진열함</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="is_view_2" name="is_view" class="form-check-input" value="N" <?=$checked['is_view']['N']?>>
												<label class="form-check-label" for="is_view_2">진열안함</label>
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="title_name" class="col-3 col-form-label bg-light border">* 대표상품 판매상태</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="sales_status_c" name="sales_status" class="form-check-input" value="C" <?=$checked['sales_status']['C']?>>
												<label class="form-check-label" for="sales_status_c">판매예정</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="sales_status_s" name="sales_status" class="form-check-input" value="S" <?=$checked['sales_status']['S']?>>
												<label class="form-check-label" for="sales_status_s">판매중</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="sales_status_e" name="sales_status" class="form-check-input" value="E" <?=$checked['sales_status']['E']?>>
												<label class="form-check-label" for="sales_status_e">판매종료</label>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="card">
								<h5 class="card-header bg-secondary text-white">대표상품 부가정보</h5>
								<div class="card-body">
									
									<div class="row mb-2">
										<label for="publisher" class="col-3 col-form-label bg-light border">퍼블리셔</label>
										<div class="col-9">
											<input type="text" class="form-control" id="publisher" name="publisher" placeholder="표기용 퍼블리셔" value="<?=$publisher?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name_en" class="col-3 col-form-label bg-light border">개발사/제조사</label>
										<div class="col-9">
											<input type="text" class="form-control" id="developer" name="developer" placeholder="개발사/제조사" value="<?=$developer?>">
										</div>
									</div>

									<div class="row mb-2">
										<label for="steam_appid" class="col-3 col-form-label bg-light border">Steam AppID</label>
										<div class="col-3">
											<input type="text" class="form-control" id="steam_appid" name="steam_appid" value="<?=$steam_appid?>" placeholder="">
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</form>

				<!-- end row -->   
				
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>

$(document).ready(function(){
	 $("form").submit(function(event) {
		 var dec = 0;
		$('input[name="game_rate[]"]').each(function(index, item){
			if($(this).prop('checked')){
				dec +=parseInt($(this).val());
			}
		});
		console.log(dec.toString(2));
		$("#game_rate_text").val(dec.toString(2));
		//return false;
	});
});

</script>

</body>
</html>
