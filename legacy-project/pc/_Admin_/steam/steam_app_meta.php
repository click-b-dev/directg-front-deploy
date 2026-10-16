<?
$sidebar_file = "sidebar_goods.php";
$page_title = "스팀 Apps 검색";
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	header('Content-Type: text/html; charset=UTF-8');

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$topmenu['goods'] = "active";

	$appid = filter_input(INPUT_GET, 'appid', FILTER_SANITIZE_STRING);
	
	$json = file_get_contents("/home/dgkrshop/www/upload/apps/apps_".$appid.".json"); //test.json 파일 읽어옴
	$data = json_decode($json, true); // JSON을 PHP 배열로 변환
	
	//print_r($data[$appid]);
	
	$key_text =array(
		"type"=>"app 유형",
		"name"=>"app 이름",
		"steam_appid"=>"app id",
		"required_age"=>"연령확인필요",
		"is_free"=>"무료여부",
		"controller_support"=>"컨트롤러 지원",
		"detailed_description"=>"상세설명",
		"about_the_game"=>"게임소개",
		"short_description"=>"짧은설명",
		"supported_languages"=>"언어지원",
		"header_image"=>"header 이미지",
		"capsule_image"=>"capsule 이미지1",
		"capsule_imagev5"=>"capsule 이미지 2",
		"website"=>"웹사이트주소",
		"pc_requirements"=>"PC 시스템 요구사항",
		"minimum"=>"최소",
		"recommended"=>"권장",
		"mac_requirements"=>"mac 시스템 요구사항",
		"linux_requirements"=>"linux 시스템 요구사항",
		"legal_notice"=>"권리표기",
		"ext_user_account_notice"=>"타사 계정",
		"drm_notice"=>"제 3자 DRM",
		"price_overview"=>"가격정보",
		"developers"=>"개발사",
		"publishers"=>"퍼블리셔",
		"package_groups"=>"구매 옵션",
		"platforms"=>"플랫폼",
		"categories"=>"카테고리",
		"genres"=>"장르",
		"screenshots"=>"스크린샷 Url",
		"movies"=>"동영상 Url",
		"release_date"=>"출시일정보",
		"support_info"=>"고객지원",
		"background"=>"배경화면",
		"background_raw"=>"배경화면2",
		"content_descriptors"=>"게임설명",
		"ratings"=>"심의정보",
		"path_thumbnail "=>"썸네일 주소",
		"path_full "=>"원본 주소",
		"rating "=>"심의등급",
		"descriptors "=>"심의내용표기",
		"description "=>"내용",
	);
	
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Steam 관리</a></li>
									<li class="breadcrumb-item active">Steam App 정보보기</li>
								</ol>
							</div>
							<h4 class="page-title">Steam App 정보보기</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 
				
				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<table class="table table-sm table-bordered border-secondary table-centered mb-0">
									<colgroup>
										<col width="10%">
										<col width="*">
									</colgroup>
									<tbody class="font-13">
										<?
											foreach($data[$appid]['data'] as $key=>$value){
										?>
										<tr>
											<th class="bg-light"><?=$key_text[$key]?></th>
											<td>
												<div class="row g-2">
												<?
													if(is_array($value)){
														foreach($value as $sub_key=>$sub_value){
															echo "<div class='col-3'>";
															echo "<div class='card shadow-none border mb-0'>";
															echo "<div class='card-header'>".$key_text[$sub_key]." [".$sub_key."]</div>";
															echo "<div class='card-body p-1'>";
															if(is_array($sub_value)){
																echo "<ul class='list-group list-group-flush'>";
																foreach($sub_value as $sub_key2=>$sub_value2){
																	if(is_array($sub_value2)){
																		foreach($sub_value2 as $sub_key3=>$sub_value3){
																			echo "<li class='list-group-item'>".print_r($sub_value3)."</li>";
																		}
																	}else{
																		echo "<li class='list-group-item'>".$sub_key2." / ".$sub_value2."</li>";
																	}
																}
																echo "</ul>";
															}else{
																echo $sub_value;
															}
															echo "</div>";
															echo "</div>";
															echo "</div>";
														}
													}else{
														echo "<div class='col-12'>";
														echo $value;
														echo "</div>";
													}
												?>
												</div>
											</td>
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
			</div>
		</div> <!-- content -->
</div>
</div>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>