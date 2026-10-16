<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['image'] = "active";

$page_title="이미지 설정";

$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_GET, 'search_product_name', FILTER_SANITIZE_STRING);
$search_product_name_en = filter_input(INPUT_GET, 'search_product_name_en', FILTER_SANITIZE_STRING);
$search_product_type = filter_input(INPUT_GET, 'search_product_type', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_GET, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_order_system = filter_input(INPUT_GET, 'search_order_system', FILTER_SANITIZE_STRING);

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	if($product_code){
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_option_data = $stmt->fetch();
		
		//print_r($goods_option_data);
		
		$json_path_2 =  "/home/dgkrshop/www/upload/apps/apps_".$goods_option_data['steam_appid']."_coming.json";

		$json_path =  "/home/dgkrshop/www/upload/apps/apps_".$goods_option_data['steam_appid'].".json";

		
		
		if(file_exists($json_path)){
			$json_string = file_get_contents($json_path);
			$json_data = json_decode($json_string, true);
			
			$header_image = $json_data[$goods_option_data['steam_appid']]['data']['header_image'];
			$capsule_image = $json_data[$goods_option_data['steam_appid']]['data']['capsule_image'];
			$capsule_imagev5 = $json_data[$goods_option_data['steam_appid']]['data']['capsule_imagev5'];
		}
		
		if(file_exists($json_path_2)){
			$json_string2 = file_get_contents($json_path_2);
			$json_data2 = json_decode($json_string2, true);
			
			//print_r($json_data2);
			
			$header_image = $json_data2[$goods_option_data['steam_appid']]['data']['header_image'];
			$capsule_image = $json_data2[$goods_option_data['steam_appid']]['data']['capsule_image'];
			$capsule_imagev5 = $json_data2[$goods_option_data['steam_appid']]['data']['capsule_imagev5'];
		}
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
						<div class="row">
							<div class="col-6">
								<form id="frm" name="frm" method="post" action="goods_option_ps.php" class="form-horizontal" enctype="multipart/form-data">
									<input type="hidden" name="mode" value="image_upload">
									<div class="card border">
										<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 이미지 설정</div>
										<div class="card-body p-2">
											<div class="card border">
												<div class="card-header bg-light fw-bold">웹서버 header 이미지 (460x215)</div>
												<div class="card-body p-0">
													<?
														$header_path = $_SERVER['DOCUMENT_ROOT'].'/upload/product/'.$goods_option_data['product_code']."/header/header.jpg";
														if($goods_option_data['steam_appid']>0){
															if($header_image){
																$header_url = $header_image;
															}else{
																$header_url = "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/".$goods_option_data['steam_appid']."/header.jpg";
															}
															
														}else{
															$header_url = "";
														}
													?>
													<?if(file_exists($header_path)){?>
														<img src="/upload/product/<?=$goods_option_data['product_code']?>/header/header.jpg?=<?=time()?>" class="img-fluid mx-auto d-block">
													<?}else{?>
														<div class="d-block py-2 text-center text-danger">header 이미지를 업로드해주세요</div>
													<?}?>
												</div>
												<div class="card-footer text-end">
													<?//if($admin->remoteFileExist($header_url)=="200"){
														//echo $goods_option_data['display_type'];
														
														?>
													<?if( ($goods_option_data['display_type']=='basic' || $goods_option_data['display_type']=='dlc')){?>
													<div class="mb-2">
														<span><?=$header_image?></span>
<?php
	if(!$product_viewer){
?>
														<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_upload_header" data-productcode="<?=$goods_option_data['product_code']?>" data-type="header_460x215" data-url="<?=$header_url?>" data-appid="<?=$goods_option_data['steam_appid']?>">header 이미지 업로드</button>
<?php
	}
?>
													</div>
													<?}?>
													
													<?//}else{?>
													<div class="d-flex flex-row">
														<div class="input-group">
															<input type="file" name="header_img" id="header_img" class="form-control" required>
<?php
	if(!$product_viewer){
?>
															<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_header_img_upload" data-productcode="<?=$goods_option_data['product_code']?>" data-type="header_460x215" data-url="" data-packageid="<?=$goods_option_data['packageid']?>">header 이미지 저장</button>
<?php
	}
?>
														</div>
													</div>
													<?//}?>
												</div>
											</div>
										</div>
									</div>
								</form>
							</div>
							<div class="col-6">
								<div class="card border">
									<div class="card-header bg-secondary text-white fw-bold font-15">디스크엔 (https://www.diskn.com/)</div>
									<div class="card-body">
										<?
											$header_url = "https://image.directg.net/upload/product/".$product_code."/header/header.jpg";
											if($admin->remoteFileExist($header_url)=="200"){
										?>
										<img src="https://image.directg.net/upload/product/<?=$product_code?>/header/header.jpg?t=20250901">
										<?}else{?>
											<div  class="text-center"><span class="text-danger">디스크엔에 이미지를 업로드해주세요.</span></div>
										<?}?>
									</div>
									<div class="card-footer">
										이미지 전체경로: \upload\product\<?=$product_code?>\header\header.jpg
									</div>
								</div>
							</div>
						</div>
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
//var simplemde = new SimpleMDE({ element: document.getElementById("description") });

$(document).ready(function(){
	//package 이미지 업로드
	$("#btn_upload_package").bind("click",function(e){
		var product_code =$("#btn_upload_package").attr("data-productcode");
		var packageid =$("#btn_upload_package").attr("data-packageid");
		var appid =$("#btn_upload_package").attr("data-appid");
		var image_url= $("#btn_upload_package").attr("data-url");
		var image_type=$("#btn_upload_package").attr("data-type");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download2.php",
			 data: {product_code:product_code,image_type:image_type,image_url:image_url,packageid:packageid,appid:appid},
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

	//header 이미지 업로드
	$("#btn_upload_header").bind("click",function(e){
		var product_code =$("#btn_upload_header").attr("data-productcode");
		var packageid =$("#btn_upload_header").attr("data-packageid");
		var appid =$("#btn_upload_header").attr("data-appid");
		var image_url= $("#btn_upload_header").attr("data-url");
		var image_type=$("#btn_upload_header").attr("data-type");
		$.ajax({
			 type: "POST",
			 url: "../steam/steam_image_download2.php",
			 data: {product_code:product_code,image_type:image_type,image_url:image_url,packageid:packageid,appid:appid},
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
		var product_code =$("#btn_header_img_upload").attr("data-productcode");
		var appid =$("#btn_header_img_upload").attr("data-appid");
		var packageid =$("#btn_header_img_upload").attr("data-packageid");
		var form = new FormData();
		var inputFile = $("input[name='header_img']");
		var files = inputFile[0].files;
		e.preventDefault();
		form.append( "product_code", product_code);
		form.append( "mode", "header_upload");
		form.append( "appid", appid);
		form.append( "packageid", packageid);

		for(var i =0;i<files.length;i++){
			
			form.append("header_img", files[i]);
		}

		$.ajax({
			type: "POST",
			processData : false,
			contentType : false,
			url: "goods_option_ps.php",
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

	//capsule 이미지 직접업로드
	$("#btn_capsule_img_upload").bind("click",function(e){
		var product_code =$("#btn_capsule_img_upload").attr("data-productcode");
		var appid =$("#btn_capsule_img_upload").attr("data-appid");
		var packageid =$("#btn_capsule_img_upload").attr("data-packageid");
		var form = new FormData();
		var inputFile = $("input[name='capsule_231_img']");
		var files = inputFile[0].files;
		e.preventDefault();
		form.append( "product_code", product_code);
		form.append( "mode", "capsule_upload");
		form.append( "appid", appid);
		form.append( "packageid", packageid);

		for(var i =0;i<files.length;i++){
			
			form.append("capsule_img", files[i]);
		}

		$.ajax({
			type: "POST",
			processData : false,
			contentType : false,
			url: "goods_option_ps.php",
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
