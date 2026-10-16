<?
$page_title= "대표상품 상세보기";

ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar['title'] = "active";
$sub_sidebar_title['view'] = "active";
$sidebar_file="sidebar_goods.php";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);

$goods_item_data = array();
$goods_item_data2 = array();
$dlc_item_data = array();

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);
	$parsedown= new Parsedown();

	//대표상품 상세정보
	$query="select * from tbl_goods where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);

	$title_data = $stmt->fetch();

	//동영상정보
	$media_list = $admin->getGoodsMediaList($title_id);

	//대표상품 게임정보
	$goods_description = $admin->getGoodsDescription($title_id);

	//스크린샷
	$screenshot_data = $admin->getTitleScreenshotList($title_id);
	
	$grac_data = array();
	if($title_data['rateno']){
		$grac_data = $admin->getGameGrac($title_data['rateno']);
	}
	
	//스팀정보
	$steam_data =  $admin->getSteamAppInfo($title_data['steam_appid']);
	$review_data = $admin->getSteamReviewInfo($title_data['steam_appid']);

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
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$title_data['title_name']?> <small>(<?=$title_data['title_name_en']?>)</small></h4>
						</div>
					</div>
				</div>     
				<!-- end page title -->
				
				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_title.php');?>
					</div>
					<div class="col-10">
						<div class="row">
							<div class="col-8">
								<!--기본정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 기본정보</h5>
									<div class="card-body p-2">
										<table class="table table-sm table-bordered border-secondary table-centered mb-0">
											<colgroup>
												<col width="20%">
												<col width="*">
											</colgroup>
											<tbody class="font-13">
												<tr>
													<th class="bg-light">대표상품코드</th>
													<td><?=$title_data['title_id']?></td>
												</tr>
												<tr>
													<th class="bg-light">대표상품SKU</th>
													<td><?=$title_data['sku']?></td>
												</tr>
												<tr>
													<th class="bg-light">대표상품명(국문)</th>
													<td><?=$title_data['title_name']?></td>
												</tr>
												<tr>
													<th class="bg-light">대표상품명(영문)</th>
													<td><?=$title_data['title_name_en']?></td>
												</tr>
												<tr>
													<th class="bg-light">퍼블리셔</th>
													<td><?=$title_data['publisher']?></td>
												</tr>
												<tr>
													<th class="bg-light">개발사</th>
													<td><?=$title_data['developer']?></td>
												</tr>
												<?if($title_data['title_code']=="33"){?>
												<tr>
													<th class="bg-light">한국어지원</th>
													<td>
														<?
															if($title_data['interface_korean']=="Y"){
																echo "<span class='badge bg-secondary text-light font-12 fw-normal'>인터페이스/자막</span> ";
															}
														?>

														<?
															if($title_data['spoken_korean']=="Y"){
																echo "<span class='badge bg-secondary text-light font-12 fw-normal'>음성</span> ";
															}
														?>

														<?
															if($title_data['exclusive_korean']=="Y"){
																echo "<span class='badge bg-info text-light font-12 fw-normal'>독점 한국어</span> ";
															}
														?>
													</td>
												</tr>
												<?}?>
												<tr>
													<th class="bg-light">게임 상세페이지 노출</th>
													<td><?=$title_data['is_view']?></td>
												</tr>
												<tr>
													<th class="bg-light">옵션상품 판매상태</th>
													<td><?=$title_data['sales_status']?></td>
												</tr>
												<tr>
													<th class="bg-light">출시여부</th>
													<td><?=$title_data['coming_soon']?></td>
												</tr>
												<tr>
													<th class="bg-light">출시일</th>
													<td><?=$title_data['release_date']?></td>
												</tr>
												<tr>
													<th class="bg-light">출시예정일</th>
													<td><?=$title_data['coming_soon_date']?></td>
												</tr>
												<tr>
													<th class="bg-light">제 3자 DRM</th>
													<td><?=$title_data['drm_notice']?></td>
												</tr>
												<tr>
													<th class="bg-light">타사계정</th>
													<td><?=$title_data['ext_user_account_notice']?></td>
												</tr>
											</tbody>
										</table>
									</div>
									<div class="card-footer">
										<div class="float-end">
											<a href="title_modify.php?title_id=<?=$title_data['title_id']?>" class="btn btn-sm btn-secondary shadow-none">기본정보 설정</a>
										</div>
									</div>
								</div>
								<!--동영상정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 동영상정보</h5>
									<div class="card-body p-2">
										<div class="ratio ratio-16x9">
											<iframe id="media_player" class="embed-responsive-item" src="<?=$media_list[0]['media_url']?>" frameborder="0" allowfullscreen></iframe>
										</div>
										<div class="container">
											<div class="row">
											<?
												foreach($media_list as $value){
											?>
											<div class="col-2">
												<div class="d-block mb-2 text-center">
													<span class="font-12"><?=$value['youtube_media_id']?></span>
												</div>
												<div class="position-relative" style="cursor:pointer">
													<img src="https://img.youtube.com/vi/<?=$value['youtube_media_id']?>/<?=$value['media_thumb']?>" class="img-fluid img-thumbnail youtube_thumbnail" alt="Product-img" data-mediaid="<?=$value['youtube_media_id']?>">
													<div class="position-absolute top-50 start-50 translate-middle">
														<div class="text-danger">
															<i class="mdi mdi-48px mdi-youtube"></i>
														</div>
													</div>
												</div>
												<div class="d-block mt-2 text-center">
						<?php
							if(!$product_viewer){
						?>
													<button class="btn btn-danger btn-sm btn_youtube_delete" data-mediaid="<?=$value['youtube_media_id']?>">영상삭제</button>
						<?php
							}
						?>
												</div>
											</div>
											<?
												}
											?>
											</div>
										</div>
									</div>
									<div class="card-footer">
										<div class="float-end">
											<a href="title_media_register.php?title_id=<?=$title_data['title_id']?>" class="btn btn-sm btn-secondary shadow-none">동영상 설정</a>
										</div>
									</div>
								</div>
								
								<!--스크린샷정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 스크린샷정보</h5>
									<div class="card-body p-2">
									</div>
									<div class="card-footer">
										<div class="float-end">
											<a href="title_screenshot_register.php?title_id=<?=$title_data['title_id']?>" class="btn btn-sm btn-secondary shadow-none">스크린샷 설정</a>
										</div>
									</div>
								</div>
								<!--상세설명-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 상세설명</h5>
									<div class="card-body p-2">
										<table class="table table-sm table-bordered border-secondary table-centered mb-0">
											<colgroup>
												<col width="15%">
												<col width="*">
											</colgroup>
											<tbody class="font-14">
												<tr>
													<th class="bg-light">게임정보</th>
													<td>
														<div class="description">
														<?
															$dgkr_description = str_replace("##","\r\n\r\n##",$goods_description['dgkr_description']);
															echo $parsedown->text($dgkr_description);
														?>
														</div>
														<div class="description">
														<?
															$about_the_game = str_replace("##","\r\n\r\n##",$goods_description['about_the_game']);
															echo $parsedown->text(htmlspecialchars_decode($about_the_game));
														?>
														</div>
													</td>
												</tr>
												<tr>
													<th class="bg-light">시스템 요구사항</th>
													<td>
														<div class="description">
														<?=$parsedown->text($goods_description['requirements'])?>
														</div>
													</td>
												</tr>
												<tr>
													<th class="bg-light">권리표기</th>
													<td>
														<?=$parsedown->text($goods_description['legal_text'])?>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div class="card-footer">
										<div class="float-end">
											<a href="title_description_register.php?title_id=<?=$title_data['title_id']?>" class="btn btn-secondary shadow-none">상세설명 설정</a>
										</div>
									</div>
								</div>
							</div>
							<div class="col-4">
								<!--이미지정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 이미지정보</h5>
									<div class="card-body p-2">
										<img src="/upload/title/<?=$title_data['title_id']?>/header/<?=$title_data['title_id']?>.jpg?=<?=time()?>" class="img-fluid mx-auto d-block">
									</div>
									<div class="card-footer"><?=$goods_description['short_description']?></div>
								</div>
								<!--심의정보-->
								<?if($title_data['title_id']=="33"){?>
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 심의정보</h5>
									<div class="card-body p-2">
										<table class="table table-sm table-bordered border-secondary table-centered mb-0">
											<colgroup>
												<col width="25%">
												<col width="*">
											</colgroup>
											<tbody class="font-13">
												<tr>
													<th class="bg-light">등급분류번호</th>
													<td><?=$title_data['rateno']?></td>
												</tr>
												<tr>
													<th class="bg-light">등급분류기관</th>
													<td><?=$grac_data['orgname']?></td>
												</tr>
												<tr>
													<th class="bg-light">신청업체명</th>
													<td><?=$grac_data['entname']?></td>
												</tr>
												<tr>
													<th class="bg-light">등급분류일자</th>
													<td><?=$grac_data['rateddate']?></td>
												</tr>
												<tr>
													<th class="bg-light">결정등급</th>
													<td><?=$grac_data['givenrate']?></td>
												</tr>
													<tr>
													<th class="bg-light">내용정보표시</th>
													<td><?=$grac_data['descriptors']?></td>
												</tr>
											</tbody>
										</table>
									</div>
									<div class="card-footer">
										<div class="float-end">
											<a href="title_modify.php?title_id=<?=$title_data['title_id']?>" class="btn btn-sm btn-secondary shadow-none">심의정보 설정</a>
										</div>
									</div>
								</div>
								<?}?>
								
								<!--태그정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 태그정보</h5>
									<div class="card-body p-2">
										<table class="table table-sm table-bordered border-secondary table-centered mb-0">
										<colgroup>
											<col width="20%">
											<col width="*">
										</colgroup>
										<tbody class="font-13">
											<tr>
												<th class="bg-light">장르</th>
												<td>
													<?
														$title_genre = explode(",",$title_data['genre']);
														foreach($title_genre as $genre){
															echo "<span class='badge bg-primary font-13 fw-normal me-2 mb-1'>".$admin->getTagName($genre)."</span>";
														}
													?>
												</td>
											</tr>
											<tr>
												<th class="bg-light">카테고리</th>
												<td>
													<?
													$title_category = explode(",",$title_data['category']);
													foreach($title_category as $category){
														echo "<span class='badge bg-info font-13 fw-normal me-2 mb-1'>".$admin->getTagName($category)."</span>";
													}
													?>
												</td>
											</tr>
											<tr>
												<th class="bg-light">태그</th>
												<td>
												<?
													$title_tag_list = explode(",",$title_data['tags']);
													foreach($title_tag_list as $tag){
														switch(substr($tag,0,1)){
															case "G": //장르
																$tag_style="bg-primary text-light";
															break;
															case "M"://분위기, 배경
																$tag_style="bg-success text-light";
															break;
															case "T"://테마
																$tag_style="bg-info text-light";
															break;
															case "V"://시점
																$tag_style="bg-warning text-light";
															break;
															case "A"://평가
																$tag_style="bg-secondary text-light";
															break;
															case "F"://기능
																$tag_style="bg-dark text-light";
															break;
															default:
																$tag_style="bg-secondary text-light";
															break;
														}
														
														echo "<span class='badge ".$tag_style." font-13 fw-normal me-1 mb-1'>".$admin->getTagName($tag)."</span>";
													}
												?>
												</td>
											</tr>
										</tbody>
										</table>
									</div>
									<div class="card-footer">
										<div class="float-end">
											<a href="title_tag_register.php?title_id=<?=$title_data['title_id']?>" class="btn btn-sm btn-secondary shadow-none">태그 설정</a>
										</div>
									</div>
								</div>
								<!--Steam 부가정보-->
								<?if($title_data['title_code']=="33"){?>
								<div class="card">
									<h5 class="card-header bg-secondary text-white">Steam 부가정보</h5>
									<div class="card-body p-2">
										<table class="table table-sm table-bordered border-secondary table-centered mb-0">
											<colgroup>
												<col width="25%">
												<col width="*">
											</colgroup>
											<tbody class="font-13">
												<tr>
													<th class="bg-light">Appid</th>
													<td><?=$steam_data['steam_appid']?></td>
												</tr>
												<tr>
													<th class="bg-light">name</th>
													<td><?=$steam_data['name']?></td>
												</tr>
												<tr>
													<th class="bg-light">제 3자 DRM</th>
													<td><?=$steam_data['drm_notice']?></td>
												</tr>
												<tr>
													<th class="bg-light">타사 계정</th>
													<td><?=$steam_data['ext_user_account_notice']?></td>
												</tr>
												<tr>
													<th class="bg-light">추천수</th>
													<td><?=number_format($steam_data['recommendations'])?></td>
												</tr>
												<tr>
													<th class="bg-light">리뷰 평가</th>
													<td><?=$review_data['review_score']?> (<?=$review_data['review_score_desc']?>)</td>
												</tr>
												<tr>
													<th class="bg-light">긍정 리뷰수</th>
													<td><?=number_format($review_data['total_positive'],0)?> 
													<?if($review_data['total_reviews']>0){?>
													(<?=round($review_data['total_positive']*100/$review_data['total_reviews'],2)?>%)
													<?}?>
													</td>
												</tr>
												<tr>
													<td colspan="2">
														<h6>Pakcage 현황</h6>
														<ol class="list-group list-group-numbered mb-2">
														<?
															$package_data = $admin->getSteamPackage($title_data['steam_appid']);
															foreach($package_data as $package){
																echo "<li class='list-group-item'>".$package['package_name']." [".$package['packageid']."]</li>";
															}
														?>
														</ol>
														
														<h6>DLC 현황</h6>
														<ul class='list-group'>
														<?
															$dlc_data = $admin->getSteamDLCList($title_data['steam_appid']);
															foreach($dlc_data as $dlc){
																echo "<li class='list-group-item'>".$dlc['name']." [".$dlc['steam_appid']."]</li>";
															}
														?>
														</ul>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div class="card-footer">
										<div class="float-end">
											<a href="../steam/steam_app_meta.php?appid=<?=$steam_data['steam_appid']?>" class="btn btn-sm btn-info shadow-none">Steam 정보 자세히보기</a>
										</div>
									</div>
								</div>
								<?}?>
								<?
									if (strpos($goods_description['description'],'게임 정보')) { 
								?>
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 특전 및 구성안내</h5>
									<div class="card-body p-1">
										<div id="etc" class="font-12">
											<?
												$description = explode("게임 정보",$goods_description['description']);
												echo $parsedown->text($description['0']);
											?>
										</div>
									</div>
								</div>
								<?
									}
								?>
								
							</div>
						</div>

					</div>
				</div>
			</div> <!-- container -->

		</div> <!-- content -->

	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>

$(document).ready(function(){

	$(".btn_option_register").bind("click",function(){
		var index = $(".btn_option_register").index(this);
		var product_code = $(".btn_option_register").eq(index).attr("data-productcode");
		var title_id = $(".btn_option_register").eq(index).attr("data-titleid");
		//var goods_item = '["product_code":"'+product_code+'"]';
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"addOption",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(".btn_option_delete").bind("click",function(){
		var index = $(".btn_option_delete").index(this);
		var product_code = $(".btn_option_delete").eq(index).attr("data-productcode");
		var title_id = $(".btn_option_delete").eq(index).attr("data-titleid");
		//var goods_item = '["product_code":"'+product_code+'"]';
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"deleteOption",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(".btn_dlc_delete").bind("click",function(){
		var index = $(".btn_dlc_delete").index(this);
		var product_code = $(".btn_dlc_delete").eq(index).attr("data-productcode");
		var title_id = $(".btn_dlc_delete").eq(index).attr("data-titleid");

		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"deleteDLC",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(".btn_dlc_register").bind("click",function(){
		var index = $(".btn_dlc_register").index(this);
		var product_code = $(".btn_dlc_register").eq(index).attr("data-productcode");
		var title_id = $(".btn_dlc_register").eq(index).attr("data-titleid");
		//var goods_item = '["product_code":"'+product_code+'"]';
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"addDLC",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//유튜브 재상영상 변경
	$(".youtube_thumbnail").bind("click",function(){
		var index = $(".youtube_thumbnail").index(this);
		var youtube_media_id = $(".youtube_thumbnail").eq(index).attr("data-mediaid");
		var media_url="https://www.youtube.com/embed/"+youtube_media_id;
		$("#media_player").attr('src',media_url);
	});
	

	//유튜브 동영상 주소 등록
	$("#btn_youtube_register").bind("click",function(){
		var title_id = $("#btn_youtube_register").attr("data-titleid");
		var youtube_media_id = $('input[name="youtube_media_id"]').val();
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"add_youtube",title_id:title_id,youtube_media_id:youtube_media_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//유튜브 동영상 주소삭제
	$(".btn_youtube_delete").bind("click",function(){
		var index = $(".btn_youtube_delete").index(this);
		var youtube_media_id = $(".btn_youtube_delete").eq(index).attr("data-mediaid");
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"delete_youtube",youtube_media_id:youtube_media_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//대표상품 짧은설명 저장
	$("#btn_short_description_save").bind("click",function(){
		var title_id = $("#btn_short_description_save").attr("data-titleid");
		var short_description = $("#short_description").val();
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"short_description_save",title_id:title_id,short_description:short_description},
			 success: function (data, status) {
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//대표상품 상세설명 저장
	$("#btn_description_save2").bind("click",function(){
		var title_id = $("#btn_description_save2").attr("data-titleid");
		var description = simplemde1.value();
		alert(description);
		return false;
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"description_save2",title_id:title_id,description:description},
			 success: function (data, status) {
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//시스템 요구사항 최소 저장
	$("#btn_requirements_save").bind("click",function(){
		var title_id = $("#btn_requirements_save").attr("data-titleid");
		var requirements = simplemde3.value();
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"requirements_save",title_id:title_id,requirements:requirements},
			 success: function (data, status) {
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//시스템 요구수항 권리표기 저장
	$("#btn_legal_text_save").bind("click",function(){
		var title_id = $("#btn_legal_text_save").attr("data-titleid");
		var legal_text = simplemde4.value();
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"legal_text_save",title_id:title_id,legal_text:legal_text},
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
