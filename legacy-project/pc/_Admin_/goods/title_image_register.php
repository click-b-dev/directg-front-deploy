<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sub_sidebar_title['image'] = "active";
$sidebar_file="sidebar_goods.php";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);

$goods_item_data = array();
$goods_item_data2 = array();
$dlc_item_data = array();

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	//대표상품 상세정보
	$query="select * from tbl_goods where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);

	$title_data = $stmt->fetch();
	
	if(date('Y-m-d',strtotime($title_data['release_date']))>date('Y-m-d') || $title_data['release_date']==""){
		$json_path =  "/home/dgkrshop/www/upload/apps/apps_".$title_data['steam_appid']."_coming.json";
	}else{
		$json_path =  "/home/dgkrshop/www/upload/apps/apps_".$title_data['steam_appid'].".json";
	}
	
	
	if(file_exists($json_path)){
		$json_string = file_get_contents($json_path);
		$json_data = json_decode($json_string, true);
		
		$header_image = $json_data[$title_data['steam_appid']]['data']['header_image'];
		$capsule_image = $json_data[$title_data['steam_appid']]['data']['capsule_image'];
		$capsule_imagev5 = $json_data[$title_data['steam_appid']]['data']['capsule_imagev5'];
		//echo $header_image;
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">대표상품 관리</a></li>
									<li class="breadcrumb-item active">이미지 설정</li>
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
							<div class="col-6">
								<form id="frm" name="frm" method="post" action="goods_option_ps.php" class="form-horizontal" enctype="multipart/form-data">
									<input type="hidden" name="mode" value="image_upload">
									<div class="card border">
										<div class="card-header bg-secondary text-white fw-bold font-15">대표상품 이미지 설정 - [웹서버]</div>
										<div class="card-body p-2">
											<div class="card border">
												<div class="card-header bg-light fw-bold">Header  460 x 215 px</div>
												<div class="card-body p-0">
													<?
														$header_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_data['title_id']."/header/".$title_data['title_id'].".jpg";
														
														if($title_data['steam_appid']>0){
															$header_url = $header_image;
														}else{
															$header_url = "";
														}
													?>
													<?if(file_exists($header_path)){?>
														<img src="/upload/title/<?=$title_data['title_id']?>/header/<?=$title_data['title_id']?>.jpg?=<?=time()?>" class="img-fluid mx-auto d-block">
													<?}else{?>
														<div class="d-block py-2 text-center text-danger">header 이미지를 업로드해주세요</div>
													<?}?>
												</div>
												<div class="card-footer text-end">
													<?//if($admin->remoteFileExist($header_url)=="200"){?>
												
													<?//}else{?>
													<div class="mb-2">
														<span><?=$header_url?></span>
						<?php
							if(!$product_viewer){
						?>
														<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_upload_header" data-titleid="<?=$title_data['title_id']?>" data-type="header_460x215" data-url="<?=$header_url?>" data-appid="<?=$title_data['steam_appid']?>">header 이미지 업로드</button>
						<?php
							}
						?>
													</div>
														
													<div class="d-flex flex-row">
														
													
														<div class="input-group">
															<input type="file" name="header_img" id="header_img" class="form-control" required>
						<?php
							if(!$product_viewer){
						?>
															<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_header_img_upload" data-titleid="<?=$title_data['title_id']?>" data-type="header_460x215" data-appid="<?=$title_data['steam_appid']?>">header 이미지 저장</button>
						<?php
							}
						?>
														</div>
													</div>
													<?//}?>
												</div>
											</div>

											<div class="card border">
												<div class="card-header bg-light fw-bold">Small capsule: 231 x 87 px (현재는 사용되는 곳 없음)</div>
												<div class="card-body p-0">
													<?
														$capsule_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_data['title_id'].'/capsule/capsule_231x87.jpg';
														$capsule_url = $capsule_image;
														if(file_exists($capsule_path)){
													?>
														<img src="/upload/title/<?=$title_data['title_id']?>/capsule/capsule_231x87.jpg?=<?=time()?>" class="img-fluid mx-auto d-block">
													<?}else{?>
														<div class="d-block py-2 text-center text-danger">capsule 이미지를 업로드해주세요</div>
													<?}?>
												</div>
												<div class="card-footer text-end">
													<?if($admin->remoteFileExist($capsule_url)=="200"){?>
						<?php
							if(!$product_viewer){
						?>
														<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_upload_capsule" data-titleid="<?=$title_data['title_id']?>" data-type="capsule_231x87" data-url="<?=$capsule_url?>" data-appid="<?=$title_data['steam_appid']?>">capsule(231x87) 이미지 업로드</button>
						<?php
							}
						?>
													<?}else{?>
													<div class="d-flex flex-row">
														<div class="input-group">
															<input type="file" name="capsule_231_img" id="capsule_231_img" class="form-control" required>
															<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_capsule_img_upload" data-titleid="<?=$title_data['title_id']?>" data-type="capsule_231x87" data-appid="<?=$title_data['steam_appid']?>">capsule(231x87) 이미지 저장</button>
														</div>
													</div>
													<?}?>
												</div>
											</div>

											<div class="card border">
												<div class="card-header bg-light fw-bold">Library capsule: 600 x 900 px</div>
												<div class="card-body p-0">
													<?
														$library_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_data['title_id'].'/library/library_600x900.jpg';
														$library_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$title_data['steam_appid']."/library_600x900.jpg";
														
														if(file_exists($library_path)){
													?>
														<img src="/upload/title/<?=$title_data['title_id']?>/library/library_600x900.jpg?=<?=time()?>" class="img-fluid mx-auto d-block" style="max-width:300px">
													<?}else{?>
														<div class="d-block py-2 text-center text-danger">library 이미지를 업로드해주세요</div>
													<?}?>
												</div>
												<div class="card-footer text-end">
													<div class="d-flex flex-row">
														<div class="input-group">
															<input type="file" name="library_img" id="library_img" class="form-control" required>
						<?php
							if(!$product_viewer){
						?>
															<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_library_img_upload" data-titleid="<?=$title_data['title_id']?>" data-type="library_600x900" data-appid="<?=$title_data['steam_appid']?>">library 이미지 저장</button>
						<?php
							}
						?>
														</div>
													</div>
												</div>
											</div>

											<div class="card border">
												<div class="card-header bg-light fw-bold">Vertical capsule: 374x448 px</div>
												<div class="card-body p-0">
													<?
														$hero_capsule_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_data['title_id'].'/hero/hero_capsule.jpg';
														$hero_capsule_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$title_data['steam_appid']."/hero_capsule.jpg";
														if(file_exists($hero_capsule_path)){
													?>
														<img src="/upload/title/<?=$title_data['title_id']?>/hero/hero_capsule.jpg?=<?=time()?>" class="img-fluid mx-auto d-block">
													<?}else{?>
														<div class="d-block py-2 text-center text-danger">hero_capsule 이미지를 업로드해주세요</div>
													<?}?>
												</div>
												<div class="card-footer text-end">
													<div class="d-flex flex-row">
														<div class="input-group">
															<input type="file" name="hero_capsule_img" id="hero_capsule_img" class="form-control" required>
						<?php
							if(!$product_viewer){
						?>
															<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_hero_capsule_img_upload" data-titleid="<?=$title_data['title_id']?>" data-type="hero_374x448" data-appid="<?=$title_data['steam_appid']?>">hero_capsule 이미지 저장</button>
						<?php
							}
						?>
														</div>
													</div>
													
													<?if($admin->remoteFileExist($hero_capsule_url)=="200"){?>
														<div class="mt-3">
						<?php
							if(!$product_viewer){
						?>
														<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_upload_hero_capsule" data-titleid="<?=$title_data['title_id']?>" data-type="hero_374x448" data-url="<?=$hero_capsule_url?>" data-appid="<?=$title_data['steam_appid']?>">Vertical capsule(374x448) 이미지 업로드</button>
						<?php
							}
						?>
														</div>
													<?}?>
												</div>
											</div>
											
											<!--
											<div class="card border">
												<div class="card-header bg-light fw-bold">Main capsule: 616x353 px</div>
												<div class="card-body p-0">
													<?
														$capsule_616_path = $_SERVER['DOCUMENT_ROOT'].'/upload/title/'.$title_data['title_id'].'/capsule/capsule_616x353.jpg';
														$capsule_616_url = "https://cdn.cloudflare.steamstatic.com/steam/apps/".$title_data['steam_appid']."/capsule_616x353.jpg";
														if(file_exists($capsule_616_path)){
													?>
														<img src="/upload/title/<?=$title_data['title_id']?>/capsule/capsule_616x353.jpg?=<?=time()?>" class="img-fluid mx-auto d-block">
													<?}else{?>
														<div class="d-block py-2 text-center text-danger">capsule 이미지를 업로드해주세요</div>
													<?}?>
												</div>
												<div class="card-footer text-end">
													<div class="d-flex flex-row">
														<div class="input-group">
															<input type="file" name="capsule_616_img" id="capsule_616_img" class="form-control" required>
															<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_capsule_616_img_upload" data-titleid="<?=$title_data['title_id']?>" data-type="capsule_616x353" data-appid="<?=$title_data['steam_appid']?>">capsule(616x353) 이미지 저장</button>
														</div>
													</div>
												</div>
											</div>
											-->
										</div>
									</div>
								</form>
							</div>

							<div class="col-6">
								<div class="card">
									<h5 class="card-header bg-secondary text-white">대표상품 이미지설정 - [디스크엔]</h5>
									<div class="card-body p-2">

										<div class="card border">
											<div class="card-header bg-light fw-bold">header 이미지 (460x215)</div>
											<div class="card-body p-0">
												<?
													$header_url = "https://image.directg.net/upload/title/".$title_data['title_id']."/header/".$title_data['title_id'].".jpg";
												?>
												<?if($admin->remoteFileExist($header_url)=="200" || $admin->remoteFileExist($header_url)=="302"){?>
													<img src="<?=$header_url?>?=<?=time()?>" class="img-fluid mx-auto d-block">
												<?}else{?>
													<div class="d-block py-2 text-center text-danger">http code:<?=$admin->remoteFileExist($header_url)?><br/> header 이미지를 업로드해주세요</div>
												<?}?>
											</div>
											<div class="card-footer bg-light">파일경로: /upload/title/<?=$title_data['title_id']?>/header/<?=$title_data['title_id']?>.jpg</div>
										</div>

										<div class="card border">
											<div class="card-header bg-light fw-bold">capsule 이미지 (231x87)</div>
											<div class="card-body p-0">
												<?
													$capsule_231_url = "https://image.directg.net/upload/title/".$title_data['title_id']."/capsule/capsule_231x87.jpg";
												?>
												<?if($admin->remoteFileExist($capsule_231_url)=="200" || $admin->remoteFileExist($capsule_231_url)=="302"){?>
													<img src="<?=$capsule_231_url?>?=<?=time()?>" class="img-fluid mx-auto d-block">
												<?}else{?>
													<div class="d-block py-2 text-center text-danger">capsule(231x87) 이미지를 업로드해주세요</div>
												<?}?>
											</div>
											<div class="card-footer bg-light">파일경로: /upload/title/<?=$title_data['title_id']?>/capsule/capsule_231x87.jpg</div>
										</div>

										<div class="card border">
											<div class="card-header bg-light fw-bold">library(600x900)</div>
											<div class="card-body p-0">
												<?
													$library_url = "https://image.directg.net/upload/title/".$title_data['title_id']."/library/library_600x900.jpg";
												?>
												<?if($admin->remoteFileExist($library_url)=="200" || $admin->remoteFileExist($library_url)=="302"){?>
													<img src="<?=$library_url?>?=<?=time()?>" class="img-fluid mx-auto d-block" style="max-width:300px">
												<?}else{?>
													<div class="d-block py-2 text-center text-danger">library(600x900) 이미지를 업로드해주세요</div>
												<?}?>
											</div>
											<div class="card-footer bg-light">파일경로: /upload/title/<?=$title_data['title_id']?>/library/library_600x900.jpg</div>
										</div>

										<div class="card border">
											<div class="card-header bg-light fw-bold">Vertical capsule: 374x448 px</div>
											<div class="card-body p-0">
												<?
													$hero_capsule_url = "https://image.directg.net/upload/title/".$title_data['title_id']."/hero/hero_capsule.jpg";
												?>
												<?if($admin->remoteFileExist($hero_capsule_url)=="200" || $admin->remoteFileExist($hero_capsule_url)=="302"){?>
													<img src="<?=$hero_capsule_url?>?=<?=time()?>" class="img-fluid mx-auto d-block">
												<?}else{?>
													<div class="d-block py-2 text-center text-danger">hero_capsule(374x448) 이미지를 업로드해주세요</div>
												<?}?>
											</div>
											<div class="card-footer bg-light">파일경로: /upload/title/<?=$title_data['title_id']?>/hero/hero_capsule.jpg</div>
										</div>
										
										<!--
										<div class="card border">
											<div class="card-header bg-light fw-bold">capsule(616x353)</div>
											<div class="card-body p-0">
												<?
													$capsule_616_url = "https://image.directg.net/upload/title/".$title_data['title_id']."/capsule/capsule_616x353.jpg";
												?>
												<?if($admin->remoteFileExist($capsule_616_url)=="200" || $admin->remoteFileExist($capsule_616_url)=="302"){?>
													<img src="<?=$capsule_616_url?>?=<?=time()?>" class="img-fluid mx-auto d-block">
												<?}else{?>
													<div class="d-block py-2 text-center text-danger">capsule(616x353) 이미지를 업로드해주세요</div>
												<?}?>
											</div>
											<div class="card-footer bg-light">파일경로: /upload/title/<?=$title_data['title_id']?>/capsule/capsule_616x353.jpg</div>
										</div>
										-->
									</div>
								</div>
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

$(document).ready(function(){
	//header 이미지 업로드
	$("#btn_upload_header").bind("click",function(e){
		var title_id =$("#btn_upload_header").attr("data-titleid");
		var appid =$("#btn_upload_header").attr("data-appid");
		var image_url= $("#btn_upload_header").attr("data-url");
		var image_type=$("#btn_upload_header").attr("data-type");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download.php",
			 data: {title_id:title_id,image_type:image_type,image_url:image_url,appid:appid},
			 success: function (data, status) {
				alert(data);
				 location.reload();
				 //alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//capsule 이미지 (231x87)
	$("#btn_upload_capsule").bind("click",function(e){
		var title_id =$("#btn_upload_capsule").attr("data-titleid");
		var appid =$("#btn_upload_capsule").attr("data-appid");
		var image_url= $("#btn_upload_capsule").attr("data-url");
		var image_type=$("#btn_upload_capsule").attr("data-type");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download.php",
			 data: {title_id:title_id,image_type:image_type,image_url:image_url,appid:appid},
			 success: function (data, status) {
				alert(data);
				 location.reload();
				 //alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//library 이미지 (600x900)
	$("#btn_upload_library").bind("click",function(e){
		var title_id =$("#btn_upload_library").attr("data-titleid");
		var appid =$("#btn_upload_library").attr("data-appid");
		var image_url= $("#btn_upload_library").attr("data-url");
		var image_type=$("#btn_upload_library").attr("data-type");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download.php",
			 data: {title_id:title_id,image_type:image_type,image_url:image_url,appid:appid},
			 success: function (data, status) {
				alert(data);
				 location.reload();
				 //alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//hero_capsule 이미지 (374x448)
	$("#btn_upload_hero_capsule").bind("click",function(e){
		var title_id =$("#btn_upload_hero_capsule").attr("data-titleid");
		var appid =$("#btn_upload_hero_capsule").attr("data-appid");
		var image_url= $("#btn_upload_hero_capsule").attr("data-url");
		var image_type=$("#btn_upload_hero_capsule").attr("data-type");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download.php",
			 data: {title_id:title_id,image_type:image_type,image_url:image_url,appid:appid},
			 success: function (data, status) {
				alert(data);
				 location.reload();
				 //alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//capsule 이미지 (616x353)
	$("#btn_upload_capsule_616").bind("click",function(e){
		var title_id =$("#btn_upload_capsule_616").attr("data-titleid");
		var appid =$("#btn_upload_capsule_616").attr("data-appid");
		var image_url= $("#btn_upload_capsule_616").attr("data-url");
		var image_type=$("#btn_upload_capsule_616").attr("data-type");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download.php",
			 data: {title_id:title_id,image_type:image_type,image_url:image_url,appid:appid},
			 success: function (data, status) {
				alert(data);
				 location.reload();
				 //alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//header 이미지 직접업로드
	$("#btn_header_img_upload").bind("click",function(e){
		var title_id =$("#btn_header_img_upload").attr("data-titleid");
		var appid =$("#btn_header_img_upload").attr("data-appid");
		var form = new FormData();
		var inputFile = $("input[name='header_img']");
		var files = inputFile[0].files;
		e.preventDefault();
		form.append( "title_id", title_id);
		form.append( "mode", "header_upload");
		form.append( "appid", appid);

		for(var i =0;i<files.length;i++){
			
			form.append("header_img", files[i]);
		}

		$.ajax({
			type: "POST",
			processData : false,
			contentType : false,
			url: "title_ps.php",
			data: form,
			 success: function (data, status) {
				alert(data);
				 //location.reload();
				//alert(data);
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Library capsule 직접업로드
	$("#btn_library_img_upload").bind("click",function(e){
		var title_id =$("#btn_library_img_upload").attr("data-titleid");
		var appid =$("#btn_library_img_upload").attr("data-appid");
		var form = new FormData();
		var inputFile = $("input[name='library_img']");
		var files = inputFile[0].files;
		e.preventDefault();
		form.append( "title_id", title_id);
		form.append( "mode", "library_upload");
		form.append( "appid", appid);

		for(var i =0;i<files.length;i++){
			
			form.append("library_img", files[i]);
		}

		$.ajax({
			type: "POST",
			processData : false,
			contentType : false,
			url: "title_ps.php",
			data: form,
			 success: function (data, status) {
				alert(data);
				 location.reload();
				//alert(data);
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	// Vertical capsule 직접업로드
	$("#btn_hero_capsule_img_upload").bind("click",function(e){
		var title_id =$("#btn_hero_capsule_img_upload").attr("data-titleid");
		var appid =$("#btn_hero_capsule_img_upload").attr("data-appid");
		var form = new FormData();
		var inputFile = $("input[name='hero_capsule_img']");
		var files = inputFile[0].files;
		e.preventDefault();
		form.append( "title_id", title_id);
		form.append( "mode", "hero_capsule_upload");
		form.append( "appid", appid);

		for(var i =0;i<files.length;i++){
			
			form.append("hero_capsule_img", files[i]);
		}

		$.ajax({
			type: "POST",
			processData : false,
			contentType : false,
			url: "title_ps.php",
			data: form,
			 success: function (data, status) {
				alert(data);
				 location.reload();
				//alert(data);
				
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
