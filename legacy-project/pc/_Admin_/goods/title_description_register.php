<?

ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sub_sidebar_title['description'] = "active";
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


	//대표상품 설명정보
	$goods_description = $admin->getGoodsDescription($title_id);

	$about_the_game = $goods_description['about_the_game'];

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
									<li class="breadcrumb-item active">상세설명 설정</li>
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
								<!--독점-->
								<!-- <div class="card">
									<h5 class="card-header bg-secondary text-white">독점설명</h5>
									<div class="card-body">
										<textarea id="dgkr_description" name="dgkr_description" class="form-control font-12"><?=$goods_description['dgkr_description']?></textarea>
									</div>
									<div class="card-footer">
	
										<div class="float-end">
						<?php
							if(!$product_viewer){
						?>
										<button class="btn btn-sm btn-primary shadow-none" id="btn_description_save3" data-titleid="<?=$title_data['title_id']?>">독점 설명 저장</button>
						<?php
							}
						?>
										</div>
									</div>
								</div> -->
								
								<!--상세설명-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">상세설명</h5>
									<div class="card-body">
										<textarea id="about_the_game" name="about_the_game" class="form-control font-12"><?=$goods_description['description']?></textarea>
									</div>
									<div class="card-footer">
										<div class="float-start">
						<?php
							if(!$product_viewer){
						?>
										<button type="button" class="btn btn-info shadow-none btn_description_sync" data-appid="<?=$title_data['steam_appid']?>" data-titleid="<?=$title_data['title_id']?>"><i class="uil uil-refresh"></i></button>
						<?php
							}
						?>
										</div>
										<div class="float-end">
						<?php
							if(!$product_viewer){
						?>
										<button class="btn btn-sm btn-primary shadow-none" id="btn_description_save2" data-titleid="<?=$title_data['title_id']?>">상세설명 저장</button>
						<?php
							}
						?>
										</div>
									</div>
								</div>

								<div class="card">
									<h5 class="card-header bg-secondary text-white">Steam 게임 정보</h5>
									<div class="card-body">
										<?=$parsedown->text($goods_description['about_the_game'])?>
									</div>
								</div>
								
								<div class="card">
									<h5 class="card-header bg-secondary text-white">Steam 상세 설명</h5>
									<div class="card-body">
										<div class="description_html">
										<?=$parsedown->text($goods_description['description'])?>
										</div>
									</div>
								</div>
								
								<!--시스템요구사항-->
								<!-- <div class="card">
									<h5 class="card-header bg-secondary text-white">시스템요구사항</h5>
									<div class="card-body">
										<textarea id="requirements" name="requirements" class="form-control"><?=$goods_description['requirements']?></textarea>
									</div> 
									<div class="card-footer">
						<?php
							if(!$product_viewer){
						?>
										<button type="button" class="btn btn-info shadow-none" id="btn_requirements_sync" data-appid="<?=$title_data['steam_appid']?>" data-titleid="<?=$title_data['title_id']?>" ><i class="uil uil-refresh"></i></button>
						<?php
							}
						?>
										
										<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
											<button class="btn btn-sm btn-primary shadow-none" id="btn_requirements_save" data-titleid="<?=$title_data['title_id']?>">시스템요구사항 저장</button>
						<?php
							}
						?>
										</div>
									</div>
								</div> -->
								<!--권리표기-->
								<!-- <div class="card">
									<h5 class="card-header bg-secondary text-white">권리표기</h5>
									<div class="card-body font-14">
										<textarea id="legal_text" name="legal_text" class="form-control"><?=$goods_description['legal_text']?></textarea>
									</div> 
									<div class="card-footer">
										<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
											<button type="button" class="btn btn-sm btn-primary shadow-none" id="btn_legal_text_save" data-titleid="<?=$title_data['title_id']?>">권리표기 저장</button>
						<?php
							}
						?>
										</div>
									</div>
								</div> -->
							</div>
							<div class="col-4">
								<!--짧은설명-->
								<!-- <div class="card">
									<h5 class="card-header bg-secondary text-white">짧은설명</h5>
									<div class="card-body p-2">
										<textarea id="short_description" name="short_description" class="form-control font-12" rows="7"><?=str_replace("<br>","\r\n",$goods_description['short_description'])?></textarea>
									</div>
									<div class="card-footer">
										<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
											<button type="button" class="btn btn-sm btn-primary shadow-none" id="btn_short_description_save" data-titleid="<?=$title_data['title_id']?>">짧은설명 저장</button>
						<?php
							}
						?>
										</div>
									</div>
								</div>
								
								<div class="card">
									<h5 class="card-header bg-secondary text-white">지역제한 안내문구</h5>
									<div class="card-body p-2">
										<textarea id="region_msg" name="region_msg" class="form-control font-14" rows="8"><?=$goods_description['region_msg']?></textarea>
										<div class="row justify-content-between mt-2">
											<div class="col-12">
												<div class="text-end">
						<?php
							if(!$product_viewer){
						?>
													<button class="btn btn-primary shadow-none" id="btn_region_msg_save"  data-titleid="<?=$title_data['title_id']?>">지역제한 안내문구</button>
						<?php
							}
						?>
												</div>
											</div>
										</div>
									</div>
								</div> -->
								<?
									if (strpos($goods_description['description'],'게임 정보')) { 
								?>
								<!--<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 특전 및 구성안내</h5>
									<div class="card-body p-0">
										<div id="etc" class="font-12">
											<?
												$description = explode("게임 정보",$goods_description['description']);
												echo $parsedown->text($description['0']);
											?>
										</div>
									</div>
									<div class="card-footer">
										<div class="text-end">
											<a href="bonus_register.php" class="btn btn-sm btn-primary shadow-none" id="btn_bonus_save" data-titleid="<?=$title_data['title_id']?>">특전정보 등록</a>
										</div>
									</div>
								</div>-->
								<?
									}
								?>
							</div>
						</div>
					</div>
				</div>

			</div> 
			<!-- container -->
		</div>
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
var simplemde1 = new SimpleMDE({ element: document.getElementById("about_the_game") });
var simplemde3 = new SimpleMDE({ element: document.getElementById("requirements") });
var simplemde4 = new SimpleMDE({ element: document.getElementById("legal_text") });
var simplemde5 = new SimpleMDE({ element: document.getElementById("dgkr_description") });

$(document).ready(function(){
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
		var about_the_game = simplemde1.value();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"description_save2",title_id:title_id,about_the_game:about_the_game},
			 success: function (data, status) {
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//대표상품 독점설명 저장
	$("#btn_description_save3").bind("click",function(){
		var title_id = $("#btn_description_save3").attr("data-titleid");
		var dgkr_description = simplemde5.value();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"description_save3",title_id:title_id,dgkr_description:dgkr_description},
			 success: function (data, status) {
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//대표상품 상세설명 동기화
	$(".btn_description_sync").bind("click",function(){
		var index = $(".btn_description_sync").index(this);
		var appids = $(".btn_description_sync").eq(index).attr("data-appid");
		var title_id = $(".btn_description_sync").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "../steam/get_steam_game_info.php",
			 data: {mode:"description_sync",appids:appids,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				alert(data);
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//대표상품 시스템 요구사항 동기화
	$("#btn_requirements_sync").bind("click",function(){
		var appids = $("#btn_requirements_sync").attr("data-appid");
		var title_id = $("#btn_requirements_sync").attr("data-titleid");
		alert(title_id);
		$.ajax({
			 type: "GET",
			 url: "../steam/get_steam_game_info.php",
			 data: {mode:"steam_sync_system",appids:appids,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//alert(data);
				location.reload();
				
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
	
	//대표상품 지역제한 안내문구
	$("#btn_region_msg_save").bind("click",function(){
		var title_id = $("#btn_region_msg_save").attr("data-titleid");
		var region_msg = $("#region_msg").val();
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"region_msg_save",title_id:title_id,region_msg:region_msg},
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
