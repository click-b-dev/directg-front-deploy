<?
$page_title="대표상품 상품정보 제공고시 설정";
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sidebar['title'] = "active";
$sub_sidebar_title['attribute_set'] = "active";

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
$referer = filter_input(INPUT_GET, 'referer', FILTER_SANITIZE_STRING);

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	$mode= "modify";
	$query="select * from tbl_goods where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);
	$data = $stmt->fetch();

	$title_id = $data['title_id'];
	$sku = $data['sku'];
	
	$title_name = $data['title_name'];
	$title_name_en = $data['title_name_en'];
	$publisher = $data['publisher'];
	$developer = $data['developer'];
	$steam_appid = $data['steam_appid'];
	$release_date = $data['release_date'];
	$coming_soon_date = $data['coming_soon_date'];

	$checked['is_view'][$data['is_view']]="checked";
	$checked['sales_status'][$data['sales_status']]="checked";
	$checked['interface_korean'][$data['interface_korean']]="checked";
	$checked['spoken_korean'][$data['spoken_korean']]="checked";
	$checked['exclusive_korean'][$data['exclusive_korean']]="checked";
	$checked['coming_soon'][$data['coming_soon']]="checked";
	$checked['title_code'][$data['title_code']]="checked";
	
	//품목별 재화 등에 관한 정보 (상품 정보 제공 고시)
	$query="select * from tbl_title_attribute_set where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);
	$attribute_data = $stmt->fetch();

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
									<li class="breadcrumb-item active">상품정보 제공고시 설정</li>
								</ol>
							</div>
							
						</div>
						<h4 class="page-title"><?=$title_name?></h4>
						<small>(<?=$title_name_en?>)</small>
					</div>
				</div>     
				<!-- end page title --> 
				
				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_title.php');?>
					</div>
					<div class="col-10">
						<form id="frm2" name="frm2" method="post" action="title_ps.php" class="form-horizontal" enctype="multipart/form-data">
							<input type="hidden" name="mode" id="mode" value="attribute_set">
							<input type="hidden" name="title_id" value="<?=$title_id?>">
							<input type="hidden" name="referer" value="<?=$referer?>">
							<div class="card">
								<div class="card-header bg-secondary text-white fw-bold font-15">품목별 재화 등에 관한 정보 (상품 정보 제공 고시)</div>
								<div class="card-body">
								<?
									switch($data['title_code']){
										case "33": //디지털 콘텐츠(게임)
								?>
									<div class="row mb-2">
										<label for="manufacturer" class="col-sm-3 col-form-label bg-light">* 제작자/공급자</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="manufacturer" name="manufacturer" value="<?=$attribute_data['manufacturer']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="terms_use" class="col-sm-3 col-form-label bg-light">* 이용조건</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="terms_use" name="terms_use" value="<?=$attribute_data['terms_use']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="applicable_period" class="col-sm-3 col-form-label bg-light">* 이용기간</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="applicable_period" name="applicable_period" value="<?=$attribute_data['applicable_period']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="product_supply_method" class="col-sm-3 col-form-label bg-light">* 상품 제공 방식</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="product_supply_method" name="product_supply_method" value="<?=$attribute_data['product_supply_method']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="main_requirements" class="col-sm-3 col-form-label bg-light">* 최소 시스템 사양, 필수 소프트웨어</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="main_requirements" name="main_requirements" value="<?=$attribute_data['main_requirements']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="cancel_right" class="col-sm-3 col-form-label bg-light">* 청약철회 또는 계약의 해제/해지에 따른 효과</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="cancel_right" name="cancel_right" value="<?=$attribute_data['cancel_right']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="as_information" class="col-sm-3 col-form-label bg-light">* 소비자 상담 관련 전화번호</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="as_information" name="as_information" value="<?=$attribute_data['as_information']?>">
										</div>
									</div>
								<?
										break;
										case "12": //소형전자
								?>
									<div class="mb-2 row">
										<label for="model_name" class="col-sm-3 col-form-label bg-light">* 모델명</label>
										<div class="col-sm-9">
											<input type="text" id="model_name" name="model_name" class="form-control"  value="<?=$attribute_data['model_name']?>" >
										</div>
									</div>
									<div class="mb-2 row">
										<label for="product_name" class="col-sm-3 col-form-label bg-light">*  품명</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="product_name" name="product_name" value="<?=$attribute_data['product_name']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="kc_safety_infomartion" class="col-sm-3 col-form-label bg-light">* KC 인증정보</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="kc_safety_infomartion" name="kc_safety_infomartion"  value="<?=$attribute_data['kc_safety_infomartion']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="rated_voltage" class="col-sm-3 col-form-label bg-light">* 정격전압</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="rated_voltage" name="rated_voltage" value="<?=$attribute_data['rated_voltage']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="power" class="col-sm-3 col-form-label bg-light">* 소비전력</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="power" name="power" value="<?=$attribute_data['power']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="size" class="col-sm-3 col-form-label bg-light">* 크기(mm)</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="size" name="size" value="<?=$attribute_data['size']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="weight" class="col-sm-3 col-form-label bg-light">* 무게(kg)</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="weight" name="weight" value="<?=$attribute_data['weight']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="manufacturing_date" class="col-sm-3 col-form-label bg-light">* 동일모델의 출시년월</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="manufacturing_date" name="manufacturing_date" value="<?=$attribute_data['manufacturing_date']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="manufacturer" class="col-sm-3 col-form-label bg-light">* 제조자/수입자</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="manufacturer" name="manufacturer" value="<?=$attribute_data['manufacturer']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="manufacture_country" class="col-sm-3 col-form-label bg-light">* 제조국</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="manufacture_country" name="manufacture_country" value="<?=$attribute_data['manufacture_country']?>">
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="main_requirements" class="col-sm-3 col-form-label bg-light">* 주요사양</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="main_requirements" name="main_requirements" value="<?=$attribute_data['main_requirements']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="warranty_service" class="col-sm-3 col-form-label bg-light">* 품질보증기준</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="warranty_service" name="warranty_service" value="<?=$attribute_data['warranty_service']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="as_information" class="col-sm-3 col-form-label bg-light">* A/S 책임자(전화번호)</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="as_information" name="as_information" value="<?=$attribute_data['as_information']?>">
										</div>
									</div>
								</div> 
								<?
										break;
									}
								?>
								<div class="card-footer">
									<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
										<button type="submit" class="btn btn-primary shadow-none">상품 정보 제공 고시 저장</button>
						<?php
							}
						?>
									</div>
								</div>
							</div>
						</form>
						<form id="frm3" name="frm3" method="post" action="title_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" id="mode" value="attribute_set2">
							<input type="hidden" name="title_id" value="<?=$title_id?>">
							<div class="card">
								<div class="card-header bg-secondary text-white fw-bold font-15">거래조건에 관한 정보</div>
								<div class="card-body">
									<div class="row mb-2">
										<label for="delivery_method_info" class="col-sm-3 col-form-label bg-light">* 재화 등의 배송방법에 관한 정보</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="delivery_method_info" name="delivery_method_info" value="<?=$attribute_data['delivery_method_info']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="as_information2" class="col-sm-3 col-form-label bg-light">* 재화 등의 A/S 관련 전화번호</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="as_information2" name="as_information2" value="<?=$attribute_data['as_information2']?>">
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
										<button type="submit" class="btn btn-primary shadow-none">거래조건에 관한 정보 저장</button>
						<?php
							}
						?>
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

	</div>

</div>
<!-- END wrapper -->

<script>

$(document).ready(function(){

});

</script>

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
