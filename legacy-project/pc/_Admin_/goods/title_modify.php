<?
$page_title="대표상품 기본정보 설정";
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar['title'] = "active";
$sub_sidebar_title['modify'] = "active";
$sidebar_file="sidebar_goods.php";

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
	$title_code = $data['title_code'];
	$model_name = $data['model_name'];

	$checked['is_view'][$data['is_view']]="checked";
	$checked['sales_status'][$data['sales_status']]="checked";
	$checked['interface_korean'][$data['interface_korean']]="checked";
	$checked['spoken_korean'][$data['spoken_korean']]="checked";
	$checked['exclusive_korean'][$data['exclusive_korean']]="checked";
	$checked['subtitle_korean'][$data['subtitle_korean']]="checked";
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
									<li class="breadcrumb-item active">기본정보 설정</li>
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
						<form id="frm" name="frm" method="post" action="title_ps.php" class="form-horizontal" enctype="multipart/form-data">
							<input type="hidden" name="mode" id="mode" value="<?=$mode?>">
							<input type="hidden" name="title_mode" value="<?=$title_mode?>">
							<input type="hidden" name="page" value="<?=$page?>">
							<input type="hidden" name="search_title_name" value="<?=$search_title_name?>">
							<input type="hidden" name="search_is_view" value="<?=$search_is_view?>">
							<input type="hidden" name="search_publisher_code" value="<?=$search_publisher_code?>">
							<input type="hidden" name="search_platform" value="<?=$search_platform?>">
							<input type="hidden" name="search_age_limit" value="<?=$search_age_limit?>">
							<input type="hidden" name="referer" value="<?=$referer?>">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">대표상품 기본정보</h5>
								<div class="card-body py-2 font-14">
									<div class="row mb-2">
										<label for="title_id" class="col-2 col-form-label bg-light border">* 대표상품코드</label>
										<div class="col-10 border-bottom border-end border-top">
											<input type="text" class="form-control-plaintext" id="title_id" name="title_id" value="<?=$title_id?>" placeholder="" readonly>
										</div>
									</div>
									<div class="row mb-2">
										<label for="sku" class="col-2 col-form-label bg-light border">* 대표상품 SKU</label>
										<div class="col-10 border-bottom border-end border-top">
											<input type="text" class="form-control-plaintext" id="sku" name="sku" value="<?=$sku?>" placeholder="" readonly>
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name" class="col-2 col-form-label bg-light border">* 대표상품명(국문)</label>
										<div class="col-10 pe-0">
											<input type="text" class="form-control" id="title_name" name="title_name" value="<?=$title_name?>" placeholder="">
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_name_en" class="col-2 col-form-label bg-light border">* 대표상품명(영문)</label>
										<div class="col-10 pe-0">
											<input type="text" class="form-control" id="title_name_en" name="title_name_en" value="<?=$title_name_en?>" placeholder="">
										</div>
									</div>
									<div class="row mb-2">
										<label for="publisher" class="col-2 col-form-label bg-light border">* 퍼블리셔</label>
										<div class="col-10 pe-0">
											<input type="text" class="form-control" id="publisher" name="publisher" placeholder="표기용 퍼블리셔" value="<?=$publisher?>">
										</div>
									</div>

									<div class="row mb-2">
										<label for="developer" class="col-2 col-form-label bg-light border">* 개발사/제조사</label>
										<div class="col-10 pe-0">
											<input type="text" class="form-control" id="developer" name="developer" placeholder="개발사" value="<?=$developer?>">
										</div>
									</div>
									<?if($title_code=="33"){?>
									<div class="row mb-2">
										<label for="spoken_korean" class="col-2 col-form-label bg-light border">* 음성 한국어 지원</label>
										<div class="col-4">
											<div class="mt-1">
											<input type="checkbox" id="spoken_korean" name="spoken_korean" value="Y" data-switch="success" <?=$checked['spoken_korean']['Y']?>>
											<label for="spoken_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="interface_korean" class="col-2 col-form-label bg-light border">* 인터페이스 한국어 지원</label>
										<div class="col-4">
											<div class="mt-1">
											<input type="checkbox" id="interface_korean" name="interface_korean" value="Y" data-switch="success" <?=$checked['interface_korean']['Y']?>>
											<label for="interface_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="subtitle_korean" class="col-2 col-form-label bg-light border">* 자막 한국어 지원</label>
										<div class="col-4">
											<div class="mt-1">
											<input type="checkbox" id="subtitle_korean" name="subtitle_korean" value="Y" data-switch="success" <?=$checked['subtitle_korean']['Y']?>>
											<label for="subtitle_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="exclusive_korean" class="col-2 col-form-label bg-light border">* 독점 한국어 지원</label>
										<div class="col-4">
											<div class="mt-1">
												<input type="checkbox" id="exclusive_korean" name="exclusive_korean" value="Y" data-switch="success" <?=$checked['exclusive_korean']['Y']?>>
												<label for="exclusive_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
											</div>
										</div>
									</div>
									<?
									}
									?>

									<div class="row mb-2">
										<label for="is_view" class="col-2 col-form-label bg-light border">* 대표상품 페이지 노출</label>
										<div class="col-10 border-bottom border-end border-top">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="is_view_1" name="is_view" class="form-check-input" value="Y" <?=$checked['is_view']['Y']?>>
												<label class="form-check-label" for="is_view_1">노출함</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="is_view_2" name="is_view" class="form-check-input" value="N" <?=$checked['is_view']['N']?>>
												<label class="form-check-label" for="is_view_2">노출안함</label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="sales_status" class="col-2 col-form-label bg-light border">* 대표상품 판매상태</label>
										<div class="col-10 border-bottom border-end border-top">
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
									
									<div class="row mb-2">
										<label for="coming_soon" class="col-2 col-form-label bg-light border">* 출시여부</label>
										<div class="col-10 mt-1">
											<div class="row gy-0 gx-2 align-items-center">
												<div class="col-auto">
													<div class="form-check">
														<input type="radio" id="coming_soon_c" name="coming_soon" class="form-check-input" value="Y" <?=$checked['coming_soon']['Y']?>>
														<label class="form-check-label" for="coming_soon_c">출시예정</label>
													</div>
												</div>
												<div class="col-auto">
													<input type="text" class="form-control" id="coming_soon_date" name="coming_soon_date" value="<?=$coming_soon_date?>" placeholder="출시일 미정시 입력" >
												</div>
												<div class="col-auto">
													<div class="form-check">
														<input type="radio" id="coming_soon_n" name="coming_soon" class="form-check-input" value="N" <?=$checked['coming_soon']['N']?>>
														<label class="form-check-label" for="coming_soon_n">출시확정</label>
													</div>
												</div>
												<div class="col-auto">
													<div class="position-relative" id="datepicker1">
														<input type="text" class="form-control" id="release_date" name="release_date" value="<?=$release_date?>" data-provide="datepicker" data-date-container="#datepicker1" data-date-format="yyyy-mm-dd" autocomplete="off" placeholder="출시일">
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="title_code" class="col-2 col-form-label bg-light border">* 상품정보 제공고시 품목 구분</label>
										<div class="col-10 border-bottom border-end border-top">
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
									<?if($title_code=="33"){?>
									<div class="row mb-2">
										<label for="steam_appid" class="col-2 col-form-label bg-light border">Steam AppID</label>
										<div class="col-3">
											<input type="text" class="form-control" id="steam_appid" name="steam_appid" value="<?=$steam_appid?>" placeholder="">
										</div>
									</div>
									<?}?>
								</div>
								<div class="card-footer p-1">
									<div class="text-end">
						<?php
							if(!$product_viewer){
						?>

										<button type="submit" class="btn btn-primary btn-sm shadow-none"><i class="mdi mdi-content-save font-16"></i> 대표상품 기본정보 저장</button>
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
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>

$(document).ready(function(){
	//대표상품 기본정보 저장
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
