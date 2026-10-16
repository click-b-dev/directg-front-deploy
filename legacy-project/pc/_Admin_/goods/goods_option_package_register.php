<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$page_title = "옵션상품 구성정보 설정";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['package'] = "active";

$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);



try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn); 
	$steam = new Steam($conn);
	$parsedown= new Parsedown();

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

	//옵션상품 구성상세
	$query="select * from tbl_goods_option_bundle where product_code=:product_code order by unit_type asc,unit_name asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$goods_item_detail= $stmt->fetchAll();
	
	if($data['packageid']>0){
		$package_item_list = $admin->getSteamPackageItem_v2($data['packageid']);

		if(is_array($package_item_list)){
			$package_item = $package_item_list;
		}

		$steam_dlc_list = $admin->getSteamDLCList_v2($data['packageid']);
		//print_r($package_item_list);
	}
	
	//스팀 번들json경로
	if($data['bundleid']>0){
		$bundle_item = $admin->getSteamBundleItem($data['bundleid']);
		if(is_array($goods_package_item)&& is_array($bundle_item)){
			foreach($bundle_item as $k => $v){
				foreach($goods_package_item as $v2){
					if($v['appid'] == $v2['appid']){
						unset($bundle_item[$k]);
					}
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

	$checked['is_package_view'][$data['is_package_view']] = "checked";
	$checked['is_bonus'][$data['is_bonus']]="checked";
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
									<li class="breadcrumb-item active">구성정보 설정</li>
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
								<!--구성정보 정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">구성정보 설정</h5>
									<div class="card-body p-2 font-13">
										<div class="d-flex mb-2">
											<div class="form-check form-check-inline">
												<input class="form-check-input" type="radio" name="is_package_view" id="is_package_view_y" value="Y" <?=$checked['is_package_view']['Y']?>>
												<label class="form-check-label" for="is_package_view_y">구성정보 사용</label>
											</div>
											<div class="form-check form-check-inline">
												<input class="form-check-input" type="radio" name="is_package_view" id="is_package_view_n" value="N" <?=$checked['is_package_view']['N']?>>
												<label class="form-check-label" for="is_package_view_n">구성정보 미사용</label>
											</div>
										</div>
										<table class="table table-bordered table-centered mb-0 table-sm">
											<colgroup>
												<col width="6%"/>
												<col width="13%"/>
												<col width="*"/>
												<col width="10%"/>
											</colgroup>
											<thead class="table-light">
												<tr>
													<th class="text-center">번호</th>
													<th class="text-center">옵션상품코드</th>
													<th class="text-center">구성명</th>
													<th class="text-center">비고</th>
												</tr>
											</thead>
											<tbody class="font-12">
											<?
												$num = 1;
												foreach($goods_item_detail as $item_detail){
											?>
											<tr>
												<td class="text-center"><?=$num++?></td>
												<td class="text-center"><?=$item_detail['unit_code']?></td>
												<td>
													<div class="d-flex flex-column">
													<?
														switch($item_detail['unit_type']){
															case "1":
																echo "<div><span class='badge bg-secondary font-11'>Game</span></div>";
															break;
															case "2":
																echo "<div><span class='badge bg-secondary font-11'>DLC</span></div>";
															break;
															case "3":
																echo "<div><span class='badge bg-secondary font-11'>Music</span></div>";
															break;
														}
													?>
													<?=$item_detail['unit_name']?>
													</div>
												</td>
												<td class="text-center">
													<!--<i class="mdi mdi-lock"></i>
													<i class="mdi mdi-lock-open-variant"></i>
													-->
<?php
	if(!$product_viewer){
?>
													<a href="javascript:void(0);" class="action-icon btn_unit_delete" data-idx="<?=$item_detail['idx']?>" title="구성삭제"> <i class="mdi mdi-delete"></i></a>
<?php
	}
?>
												</td>
											</tr>
											<?
												}
											?>
											</tbody>
											<tfoot>
											<tr>
												<td colspan="4">
													<div class="row mb-0">
														<div class="col-2">
															<select id="unit_type" name="unit_type" class="form-select form-select-sm">
																<option value="">유형</option>
																<option value="1">기본게임</option>
																<option value="2">DLC</option>
																<option value="3">Music</option>
																<option value="4">특전</option>
																<option value="5">기타</option>
															</select>
														</div>
														<div class="col-8">
															<input type="text" class="form-control form-control-sm" id="unit_name" name="unit_name" placeholder="추가할 구성명을 입력해 주세요.">
														</div>
														<div class="col-2 px-0">
<?php
	if(!$product_viewer){
?>
															<button type="button" class="btn btn-dark btn-sm shadow-none" id="btn_unit_add" data-productcode="<?=$product_code?>">구성추가</button>
<?php
	}
?>
														</div>
													</div>
												</td>
											</tr>
											<tr>
												<td colspan="4">
													<div class="row mb-0">
														<div class="col-10">
															<input type="text" class="form-control form-control-sm" id="search_option_code" name="search_option_code" placeholder="검색할 옵션상품코드를 입력해 주세요">
														</div>
														<div class="col-2 px-0">
															<button type="button" class="btn btn-light btn-sm shadow-none border" id="btn_option_search" data-productcode="<?=$product_code?>" >옵션상품검색</button>
														</div>
													</div>
												</td>
											</tr>
											<!--
											<tr>
												<td colspan="2">
													<button class="btn btn-secondary btn-sm shadow-none" id="btn_package_item_sync" data-productcode="<?=$product_code?>">동기화</button>
												</td>
											</tr>
											-->
											</tfoot>
										</table>
									</div>
								</div>
								<?
									//$bonus_description = preg_replace("/[a-zA-Z\-]*font-\-family\:[^\;]+\;/i", '', str_replace("&quot;","",$description_data['bonus_description']));
								//	$pattern = '/font-family\s*:\s*[^;"]*["\']?[^;"]*["\']?\s*;/i';
								//	$cleaned_html = preg_replace($pattern, '', str_replace("&quot;","",$description_data['bonus_description']));
								//	$cleaned_html = preg_replace('/style\s*=\s*["\']\s*["\']/i', '', $cleaned_html);
								//	echo $cleaned_html;
									
									//$bonus_description = preg_replace('/background-color:/', '', $bonus_description);
									//strip_tags(htmlspecialchars_decode($description_data['bonus_description']),"<video>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<p>,<span>,<b>,<ul>,<li>,<img>,<strong>,<br>,<p>"));
									//echo $bonus_description;
									
									//echo strip_tags($bonus_description,"<video>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<p>,<span>,<b>,<ul>,<li>,<img>,<strong>,<br>,<p>");
									
									$bonus_description = $description_data['bonus_description'];
									$bonus_description = preg_replace('/font-family\\s*:\\s*([\'"])(.*?)\\1/', 'font-family: $2', htmlspecialchars_decode($bonus_description));
									$bonus_description = preg_replace('/style\s*=\s*["\']\s*["\']/i', '', $bonus_description);
									echo $bonus_description;

								?>

								<div class="card">
									<h5 class="card-header bg-secondary text-white">구매특전 설정</h5>
									<div class="card-body p-2">
										<div class="row g-0 mb-2 border">
											<label for="is_bonus" class="col-sm-3 col-form-label bg-light font-13">* 구매특전 제공여부</label>
											<div class="col-3 mt-1 ms-1">
												<div class="form-check form-radio-dark form-check-inline">
													<input type="radio" id="is_bonus_y" name="is_bonus" class="form-check-input" value="Y" <?=$checked['is_bonus']['Y']?>>
													<label class="form-check-label font-12" for="is_bonus_y">예</label>
												</div>
												<div class="form-check form-radio-dark form-check-inline">
													<input type="radio" id="is_bonus_n" name="is_bonus" class="form-check-input" value="N" <?=$checked['is_bonus']['N']?>>
													<label class="form-check-label font-12" for="is_bonus_n">아니오</label>
												</div>
											</div>
										</div>
										
										<textarea id="bonus_description" name="bonus_description" class="form-control font-12" cols="100" rowspan="10" style="width:100%;height:800px"><?=strip_tags($bonus_description,"<video>,<h1>,<h2>,<h3>,<h4>,<h5>,<h6>,<p>,<span>,<b>,<ul>,<li>,<img>,<strong>,<br>,<p>")?></textarea>
									</div>
									<div class="card-footer">
										<div class="float-end">
<?php
	if(!$product_viewer){
?>
										<button class="btn btn-sm btn-primary shadow-none" id="btn_bonus_description_save" data-productcode="<?=$product_code?>">특전설명 저장</button>
<?php
	}
?>
										</div>
									</div>
								</div>
							</div>
							
							<div class="col-4">
								<div class="card">
									<h5 class="card-header bg-secondary text-white">Steam 구성정보 (참고용)</h5>
									<div class="card-body p-2 font-12">
										<div class="d-flex justify-content-between align-self-baseline">
											<div class="px-2 py-1">
											<?
												if($data['packageid']>0){
													$package_type="package";
													echo "Steam Package ID : ". $data['packageid'];
													$package_item_sync = "Y";
													$bundle_item_sync = "N";
												}else{
													$package_item_sync = "N";
												}
											?>
											<?
												if($data['bundleid']>0){
													$package_type="bundle";
													echo "Steam Bundle ID : ".$data['bundleid'];
													$bundle_item_sync = "Y";
													$package_item_sync = "N";
												}else{
													$bundle_item_sync = "N";
												}
											?>
											</div>
											<div class="px-2 py-1">
<?php
	if(!$product_viewer){
?>
												<?if($bundle_item_sync == "Y"){?>
												<button type="button" id="bundle_item_sync" class="btn btn-info btn-sm shadow-none" data-type="bundle" data-bundleid="<?=$data['bundleid']?>">구성 동기화</button>
												<?}?>
												<?if($package_item_sync =="Y"){?>
												<button type="button" id="package_item_sync" class="btn btn-info btn-sm shadow-none" data-type="package" data-packageid="<?=$data['packageid']?>">구성 동기화</button>
												<?}?>
<?php
	}
?>
											</div>
										</div>
										<div class="table-responsive">
											<table class="table table-bordered table-centered mb-0 table-sm">
												<thead class="table-light">
													<tr>
														<th class="text-center" style="width:50px;">번호</th>
														<th class="text-center" style="width:60px;">appid</th>
														<th class="text-center" style="width:60px;">app_type</th>
														<th class="text-center">app_name</th>
														<th class="text-center">app_price</th>
													</tr>
												</thead>
												<tbody>
												<?
													if(is_array($bundle_item)){
														foreach($bundle_item as $sub_key=>$sub_value){
															if($sub_value['appid']>0){
												?>
												<tr>
													<td class="text-center">
														<?
															if($sub_value['app_name']==""){
														?>
														<button type="button" class="btn action-icon btn_steam_sync" data-productcode="<?=$goods_option_data['product_code']?>" data-appid="<?=$sub_value['appid']?>"><i class="mdi mdi-refresh"></i></button>
														<?
															}else{
																echo "미등록";
															}
														?>
													</td>
													<td class="text-center"><?=$sub_value['appid']?></td>
													<td class="text-center">
														<?=$sub_value['app_type']?>
														<?
															switch($sub_value['app_type']){
																case "game":
																	$item_type="1";
																break;
																case "dlc":
																	$item_type="2";
																break;
																case "music":
																	$item_type="2";
																break;
															}
														?>
													</td>
													<td class="text-start"><?=$sub_value['app_name']?></td>
													<td class="text-end">
														<?
																$steam_app_price = $steam->getSteamAppPrice($sub_value['appid']);
																$initial = $steam_app_price['consumer_price']/100;
																echo number_format($initial);
														?>
													</td>
												</tr>
												<?		}
														
															$total_initial+=$initial;
														}
													}
												?>
												<?
													if(is_array($package_item)){
														foreach($package_item as $sub_key=>$sub_value){
															if($sub_value['appid']<>""){
												?>
												<tr>
													<td class="text-center">
														<?
															if($sub_value['app_name']==""){
														?>
														<button type="button" class="btn action-icon btn_steam_sync" data-productcode="<?=$goods_option_data['product_code']?>" data-appid="<?=$sub_value['appid']?>"><i class="mdi mdi-refresh"></i></button>
														<?
															}else{
																echo "미등록";
															}
														?>
													</td>
													<td class="text-center"><?=$sub_value['appid']?></td>
													<td class="text-center">
														<?=$sub_value['app_type']?>
														<?
															switch($sub_value['app_type']){
																case "game":
																	$item_type="1";
																break;
																case "dlc":
																	$item_type="2";
																break;
																case "music":
																	$item_type="2";
																break;
															}
														?>
													</td>
													<td class="text-start"><?=$sub_value['app_name']?></td>
													<td class="text-end">
														<?
																$steam_app_price = $steam->getSteamAppPrice($sub_value['appid']);
																$initial = $steam_app_price['consumer_price']/100;
																echo number_format($initial);
														?>
													</td>
												</tr>
												<?
															}
														
															$total_initial+=$initial;
														}
													}
												?>
												<tr class="bg-light">
													<th colspan="4" class="text-center">합계</th>
													<th class="text-end"><?=number_format($total_initial)?></th>
												</tr>
												</tbody>
											</table>
										</div>
									</div>
								</div>

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
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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

		<!-- Footer Start -->
		<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/footer.php');?>
		<!-- end Footer -->
	</div>
	<!-- ============================================================== -->
	<!-- End Page content -->
	<!-- ============================================================== -->
</div>
<!-- END wrapper -->

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js" integrity="sha384-nvAa0+6Qg9clwYCGGPpDQLVpLNn0fRaROjHqs13t4Ggj3Ez50XnGQqc/r8MhnRDZ" crossorigin="anonymous"></script>

<script type="text/javascript" src="<?=$document_root?>/smarteditor2/js/service/HuskyEZCreator.js" charset="utf-8"></script>
<script type="text/javascript">
var oEditors = [];

var sLang = "ko_KR";	// 언어 (ko_KR/ en_US/ ja_JP/ zh_CN/ zh_TW), default = ko_KR

// 추가 글꼴 목록
//var aAdditionalFontSet = [["MS UI Gothic", "MS UI Gothic"], ["Comic Sans MS", "Comic Sans MS"],["TEST","TEST"]];

nhn.husky.EZCreator.createInIFrame({
	oAppRef: oEditors,
	elPlaceHolder: "bonus_description",
	sSkinURI: "/_Admin_/smarteditor2/SmartEditor2Skin.html",	
	htParams : {
		bUseToolbar : true,				// 툴바 사용 여부 (true:사용/ false:사용하지 않음)
		bUseVerticalResizer : true,		// 입력창 크기 조절바 사용 여부 (true:사용/ false:사용하지 않음)
		bUseModeChanger : true,			// 모드 탭(Editor | HTML | TEXT) 사용 여부 (true:사용/ false:사용하지 않음)
		bSkipXssFilter : true,		// client-side xss filter 무시 여부 (true:사용하지 않음 / 그외:사용)
		//aAdditionalFontList : aAdditionalFontSet,		// 추가 글꼴 목록
		fOnBeforeUnload : function(){
			//alert("완료!");
		},
		I18N_LOCALE : sLang
	}, //boolean
	fOnAppLoad : function(){
		//예제 코드
		//oEditors.getById["ir1"].exec("PASTE_HTML", ["로딩이 완료된 후에 본문에 삽입되는 text입니다."]);
	},
	fCreator: "createSEditor2"
});

</script>

<script>
$(document).ready(function(){
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
	$("input[name='is_package_view']").bind("click",function(){
		var is_package_view = $("input[name='is_package_view']:checked").val();
		var product_code = "<?=$product_code?>";
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"package_view_config",product_code:product_code,is_package_view:is_package_view},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품 구성정보 특전설명 설정
	$("#btn_bonus_description_save").bind("click",function(){
		var product_code = $("#btn_bonus_description_save").attr("data-productcode");
		oEditors.getById["bonus_description"].exec("UPDATE_CONTENTS_FIELD", []);
		var bonus_description = oEditors.getById["bonus_description"].getIR();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"bonus_description_save",product_code:product_code,bonus_description:bonus_description},
			 success: function (data, status) {
				location.reload();
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
