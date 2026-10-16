<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['description'] = "active";

$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn); 
	$parsedown= new Parsedown();
	$steam = new Steam($conn);

	//옵션상품정보
	$query="select * from tbl_goods_item where product_code=:product_code";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$data = $stmt->fetch();

	//옵션상품 설명정보

	$query="select * from tbl_goods_item_description where product_code=:product_code";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$description_data = $stmt->fetch();

	$query="select * from tbl_package_description where packageid=:packageid";
	$stmt = $conn->prepare($query);
	$params = array(
		":packageid"=>$data['packageid']
	);
	$stmt->execute($params);

	$steam_data = $stmt->fetch();
	

	if($description_data['description']){
		$about_the_game = $description_data['description'];
	}else{
		$about_the_game = $steam_data['page_content'];
	}

	if($description_data['short_description']<>""){
		$short_description = $description_data['short_description'];
	}else{
		$short_description = $steam_data['short_description'];
	}

	if($description_data['requirements']<>""){
		$requirements = $description_data['requirements'];
	}else{
		$requirements = $steam_data['pc_requirements_minimum']."\r\n\r\n".$steam_data['pc_requirements_recommended'];
	}

	if($description_data['legal_text']<>""){
		$legal_text = $description_data['legal_text'];
	}else{
		$legal_text = $steam_data['legal_notice'];
	}
	
	$region_msg = $description_data['region_msg'];
	
	$special_query="select * from tbl_goods_item_package where product_code=:product_code order by item_type asc,appid asc";
	$stmt = $conn->prepare($special_query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$goods_package_item = $stmt->fetchAll();

	if($goods_option_data['packageid']>0){
		$package_item_list = $admin->getSteamPackageItem_v2($goods_option_data['packageid']);


		if(is_array($package_item_list)){
			$package_item = $package_item_list;
		}

		$steam_dlc_list = $admin->getSteamDLCList_v2($goods_option_data['packageid']);
		//print_r($package_item_list);
	
	}

	
	//스팀 번들json경로
	$bundle_item = $admin->getSteamBundleItem($goods_option_data['bundleid']);

	if(is_array($goods_package_item)&& is_array($bundle_item)){
		foreach($bundle_item as $k => $v){
			foreach($goods_package_item as $v2){
				if($v['appid'] == $v2['appid']){
					unset($bundle_item[$k]);
				}
			}
		}
	}

	if(is_array($goods_package_item) && is_array($package_item)){
		foreach($package_item as $k => $v){
			foreach($goods_package_item as $v2){
				if($v['appid'] == $v2['appid']){
					unset($package_item[$k]);
				}
			}
		}
	}
	
	//옵션상품 구성상세
	$query="select * from tbl_goods_option_bundle where product_code=:product_code order by unit_type asc,unit_name asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$goods_item_detail= $stmt->fetchAll();

	$checked['is_package_view'][$data['is_package_view']] = "checked";
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
									<li class="breadcrumb-item active">상세설명 설정</li>
								</ol>
							</div>
							
							<h4 class=""><?=$data['product_name']?> <span class="badge bg-dark"><?=$adminGoods->getPlatformName($data['product_platform'])?></span> <span class="badge bg-dark"><?=$data['game_type']?></span> <span class="badge bg-dark"><?=$data['display_type']?></span></h4>
							<small>sku: <?=$data['goods_sku']?></small>
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
							<div class="col-8">
								<div class="card">
									<h5 class="card-header bg-secondary text-white">옵션상품 상세설명</h5>
									<div class="card-body p-2">
										<div class="row">
											<div class="col-sm-12">
												<textarea id="description" name="description" class="form-control font-14"><?=$about_the_game?></textarea>
												<div class="row justify-content-between">
													<div class="col-4">
														<?if($data['steam_appid']>0){?>
<?php
	if(!$product_viewer){
?>
														<button type="button" class="btn btn-info shadow-none btn_steam_sync" data-appid="<?=$data['steam_appid']?>" data-productcode="<?=$product_code?>" data-apptype="<?=$data['game_type']?>"><i class="uil uil-refresh"></i></button>
<?php
	}
?>
														<?}?>
													</div>
													<div class="offset-md-4 col-4">
														<div class="text-end">
<?php
	if(!$product_viewer){
?>
															<button class="btn btn-primary shadow-none" id="btn_description_save" data-productcode="<?=$product_code?>">상세설명 저장</button>
<?php
	}
?>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								
								<!--
								<div class="card">
									<h5 class="card-header bg-secondary text-white">옵션상품 게임 정보</h5>
									<div class="card-body p-2">
										<div class="row">
											<div class="col-sm-12">
												<textarea id="about_the_game" name="about_the_game" class="form-control font-14"><?=$about_the_game?></textarea>
												<div class="row justify-content-between">
													<div class="col-4">
														<button type="button" class="btn btn-info shadow-none btn_steam_sync" data-appid="<?=$data['steam_appid']?>" data-productcode="<?=$product_code?>" data-apptype="<?=$data['game_type']?>"><i class="uil uil-refresh"></i></button>
													</div>
													<div class="offset-md-4 col-4">
														<div class="text-end">
															<button class="btn btn-primary shadow-none" id="btn_about_the_game_save" data-productcode="<?=$product_code?>">상세설명 저장</button>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								-->

								<div class="card">
									<h5 class="card-header bg-secondary text-white">Steam 게임 정보</h5>
									<div class="card-body">
										<?=$parsedown->text($steam_data['about_the_game'])?>
									</div>
								</div>
								
								<div class="card">
									<h5 class="card-header bg-secondary text-white">Steam 상세 설명</h5>
									<div class="card-body">
										<div class="description_html">
										<?=$parsedown->text($steam_data['description'])?>
										</div>
									</div>
								</div>
								
								<!-- <div class="card">
									<h5 class="card-header bg-secondary text-white">옵션상품 시스템 요구사항</h5>
									<div class="card-body p-2">
										<div class="row">
											<div class="col-sm-12">
												<textarea id="requirements" name="requirements" class="form-control font-14"><?=$requirements?></textarea>
												<div class="row justify-content-between">
													<div class="col-4">
<?php
	if(!$product_viewer){
?>
														<button type="button" class="btn btn-info shadow-none btn_steam_sync_system" data-appid="<?=$data['steam_appid']?>" data-productcode="<?=$product_code?>" data-apptype="<?=$data['game_type']?>"><i class="uil uil-refresh"></i></button>
<?php
	}
?>
													</div>
													<div class="offset-md-4 col-4">
														<div class="text-end">
<?php
	if(!$product_viewer){
?>
															<button class="btn btn-primary shadow-none" id="btn_requirements_save" data-productcode="<?=$product_code?>">시스템 요구사항 저장</button>
<?php
	}
?>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div> -->

								<!-- <div class="card">
									<h5 class="card-header bg-secondary text-white">권리표기</h5>
									<div class="card-body p-2 font-14">
										<div class="row">
											<div class="col-sm-12">
												<textarea id="legal_text" name="legal_text" class="form-control"><?=$legal_text?></textarea>
												<div class="text-end">
<?php
	if(!$product_viewer){
?>
													<button type="button" class="btn btn-primary mt-2 shadow-none" id="btn_legal_text_save" data-productcode="<?=$product_code?>">권리표기 저장</button>
<?php
	}
?>
												</div>
											</div>
										</div>
									</div> 
								</div> -->
							</div>
							<div class="col-4">
								<!-- <div class="card">
									<h5 class="card-header bg-secondary text-white">옵션상품 짧은설명</h5>
									<div class="card-body p-2">
										<textarea id="short_description" name="short_description" class="form-control font-14" rows="8"><?=$admin->setSteamDescriptionhtml($short_description)?></textarea>
										<div class="row justify-content-between mt-2">
											<div class="col-12">
												<div class="text-end">
<?php
	if(!$product_viewer){
?>
													<button class="btn btn-primary shadow-none" id="btn_short_description_save"  data-productcode="<?=$product_code?>">짧은설명 저장</button>
<?php
	}
?>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="card">
									<h5 class="card-header bg-secondary text-white">지역제한 안내문구</h5>
									<div class="card-body p-2">
										<textarea id="region_msg" name="region_msg" class="form-control font-14" rows="8"><?=$admin->setSteamDescriptionhtml($region_msg)?></textarea>
										<div class="row justify-content-between mt-2">
											<div class="col-12">
												<div class="text-end">
<?php
	if(!$product_viewer){
?>
													<button class="btn btn-primary shadow-none" id="btn_region_msg_save"  data-productcode="<?=$product_code?>">지역제한 안내문구</button>
<?php
	}
?>
												</div>
											</div>
										</div>
									</div>
								</div> -->
							</div>
						</div>
						<!-- end row -->   
					</div>
				</div>
			</div> <!-- container -->
		</div> <!-- content -->
		
		<!--패키지 구성 추가 팝업-->
		<div class="modal fade" id="unit-modal" aria-hidden="true" aria-labelledby="unit-modal-label" tabindex="-1" role="dialog">
			<div class="modal-dialog modal-lg modal-dialog-centered modal-top">
				<div class="modal-content modal-filled bg-light">
					<div class="modal-header modal-colored-header bg-primary">
						<h5 class="modal-title" id="unit-modal-label">구성 상세추가</h5>
<?php
	if(!$product_viewer){
?>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
<?php
	}
?>
					</div>
					<div class="modal-body pb-0">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" id="product_code">
							<table class="table table-sm table-bordered">
								<colgroup>
									<col width="15%"/>
									<col width="10%"/>
									<col width="*"/>
									<col width="13%"/>
								</colgroup>
								<thead class="table-light font-13">
								<tr>
									<th class="text-center">옵션상품코드</th>
									<th class="text-center">유형</th>
									<th class="text-center">옵션상품명</th>
									<th class="text-center">비고</th>
								</tr>
								</thead>
								<tbody id="goods_option_list" class="bg-white font-12">
								</tbody>
							</table>
						</form>
					</div>
				</div>
			</div>
		</div>

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>

<script>
var simplemde = new SimpleMDE({ element: document.getElementById("description") });
var simplemde2 = new SimpleMDE({ element: document.getElementById("requirements") });
var simplemde3 = new SimpleMDE({ element: document.getElementById("legal_text") });

$(document).ready(function(){
	//옵션상품 상세설명 저장
	$("#btn_description_save").bind("click",function(){
		var product_code = $("#btn_description_save").attr("data-productcode");
		var description = simplemde.value();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"description_save",product_code:product_code,description:description},
			 success: function (data, status) {
				window.location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//옵션상품 짧은설명 저장
	$("#btn_short_description_save").bind("click",function(){
		var product_code = $("#btn_short_description_save").attr("data-productcode");
		var short_description = $("#short_description").val();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"short_description_save",product_code:product_code,short_description:short_description},
			 success: function (data, status) {
				window.location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품 지역제한 안내문구
	$("#btn_region_msg_save").bind("click",function(){
		var product_code = $("#btn_region_msg_save").attr("data-productcode");
		var region_msg = $("#region_msg").val();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"region_msg_save",product_code:product_code,region_msg:region_msg},
			 success: function (data, status) {
				window.location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//옵션상품 시스템 요구사항
	$("#btn_requirements_save").bind("click",function(){
		var product_code = $("#btn_requirements_save").attr("data-productcode");
		var requirements = simplemde2.value();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"requirements_save",product_code:product_code,requirements:requirements},
			 success: function (data, status) {
				window.location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//옵션상품 권리표기
	$("#btn_legal_text_save").bind("click",function(){
		var product_code = $("#btn_legal_text_save").attr("data-productcode");
		var legal_text = simplemde3.value();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"legal_text_save",product_code:product_code,legal_text:legal_text},
			 success: function (data, status) {
				window.location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품 구성상세 동기화
	$("#btn_package_item_sync").bind("click",function(){
		var goods_code = $("#btn_package_item_sync").attr("data-productcode");
		$.ajax({
			 type: "POST",
			 url: "goods_package_item_sync.php",
			 data: {goods_code:goods_code},
			 success: function (data, status) {
				window.location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//게임설명 동기화
	$(".btn_steam_sync").bind("click",function(){
		var index = $(".btn_steam_sync").index(this);
		var appids = $(".btn_steam_sync").eq(index).attr("data-appid");
		var product_code = $(".btn_steam_sync").eq(index).attr("data-productcode");
		var app_type = $(".btn_steam_sync").eq(index).attr("data-apptype");
		var url = "";

		url="../steam/get_steam_game_info.php";

		$.ajax({
			 type: "GET",
			 url: url,
			 data: {mode:"steam_sync_desc",appids:appids,product_code:product_code},
			 success: function (data, status) {
				//alert(data);
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(".btn_steam_sync_system").bind("click",function(){
		var index = $(".btn_steam_sync_system").index(this);
		var appids = $(".btn_steam_sync_system").eq(index).attr("data-appid");
		var product_code = $(".btn_steam_sync_system").eq(index).attr("data-productcode");
		var app_type = $(".btn_steam_sync_system").eq(index).attr("data-apptype");
		var url = "";

		url="../steam/get_steam_game_info.php";

		$.ajax({
			 type: "GET",
			 url: url,
			 data: {mode:"steam_sync_system",appids:appids,product_code:product_code},
			 success: function (data, status) {
				alert(data);
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품검색 (구성상세)
	$("#btn_option_search").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var search_option_code = $("#search_option_code").val();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"goods_option_search",product_code:product_code,search_option_code:search_option_code},
			 success: function (data, status) {
				$("#goods_option_list").html(data);
				$("#unit-modal input[name='product_code']").val(product_code);
				$("#unit-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품 구성상세 추가 (직접추가)
	$("#btn_unit_add").bind("click",function(){
		var product_code =  $("#btn_unit_add").attr("data-productcode");
		var unit_type = $("#unit_type").val();
		var unit_name = $("#unit_name").val();
		
		if(unit_type==""){
			alert("유형을 선택해 주세요.");
			return false;
		}
		
		if(unit_name==""){
			alert("구성명을 입력해 주세요.");
			return false;
		}
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"goods_option_unit_add",product_code:product_code,unit_type:unit_type,unit_name:unit_name},
			 success: function (data, status) {
				//alert(data);
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품 구성상세 추가
	$(document).on('click', '#unit-modal .btn_unit_add', function(e){
		e.preventDefault();
		var index = $('.btn_unit_add').index(this);
		var product_code =  $("#unit-modal #product_code").val();
		var unit_type = $("#unit-modal input[name='unit_type']").val();
		var unit_code = $("#unit-modal input[name='unit_code']").val();
		var unit_name = $("#unit-modal input[name='unit_name']").val();

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"goods_option_unit_add",product_code:product_code,unit_type:unit_type,unit_code:unit_code,unit_name:unit_name},
			 success: function (data, status) {
				//alert(data);
				$("#unit-modal").modal('hide');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품 구성상세 삭제
	$(".btn_unit_delete").bind("click",function(){
		var index = $(".btn_unit_delete").index(this);
		var unit_idx = $(".btn_unit_delete").eq(index).attr("data-idx");
		
		if(confirm("선택하신 구성을 삭제하시겠습니까?")){
			$.ajax({
				 type: "POST",
				 url: "goods_option_ps.php",
				 data: {mode:"goods_option_unit_delete",unit_idx:unit_idx},
				 success: function (data, status) {
					//alert(data);

					location.reload();
					
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}
	});
	
	//옵션상품 구성정보 설정여부 변경
});
</script>
</body>
</html>
