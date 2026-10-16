<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$page_title = "옵션상품 등록";
$sidebar_file = "sidebar_goods.php";

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
		$mode= "modify";
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$product_code = $data['product_code'];
		$product_name = $data['product_name'];

		if($data['goods_sku']){
			$goods_sku = $data['goods_sku'];
		}else{
			$goods_sku = $admin->uuidgen4();
		}
		
		$checked['is_view'][$data['is_view']]="checked";

		$checked['interface_korean'][$data['interface_korean']]="checked";
		$checked['spoken_korean'][$data['spoken_korean']]="checked";
		$checked['exclusive_korean'][$data['exclusive_korean']]="checked";
		$checked['subtitle_korean'][$data['subtitle_korean']]="checked";

		if($data['is_free']==""){
			$is_free = "N";
		}else{
			$is_free = $data['is_free'];
		}

		$checked['is_free'][$is_free]="checked";

		$selected['game_type'][$data['game_type']]="selected";
		$selected['display_type'][$data['display_type']]="selected";
		
		$selected['product_platform'][$data['product_platform']]="selected";
	}else{
		$mode= "register";
		
		$product_code = $admin->setGoodsItemCode();
		$goods_sku = $admin->uuidgen4();
	}

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
									<li class="breadcrumb-item active">옵션상품 등록</li>
								</ol>
							</div>
							<h4 class="page-title">옵션상품 등록</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<form id="frm" name="frm" method="post" action="goods_option_ps.php" class="form-horizontal" enctype="multipart/form-data">
				<input type="hidden" name="mode" value="<?=$mode?>">
				<input type="hidden" name="page" value="<?=$page?>">
				<input type="hidden" name="search_product_name" value="<?=$search_product_name?>">
				<input type="hidden" name="search_product_name_en" value="<?=$search_product_name_en?>">
				<input type="hidden" name="search_product_type" value="<?=$search_product_type?>">
				<input type="hidden" name="search_status" value="<?=$search_status?>">
				<input type="hidden" name="search_product_platform" value="<?=$search_product_platform?>">
				<input type="hidden" name="search_order_system" value="<?=$search_order_system?>">

				<div class="row">
					<div class="col-7">
						<div class="card border border-1">
							<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 기본정보</div>
							<div class="card-body">
								<div class="mb-2 row">
									<label for="product_code" class="col-sm-3 col-form-label bg-light">* 옵션상품번호</label>
									<div class="col-sm-9">
										<input type="text" id="product_code" name="product_code" class="form-control"  value="<?=$product_code?>" required>
									</div>
								</div>
								<div class="mb-2 row">
									<label for="goods_sku" class="col-sm-3 col-form-label bg-light">* 옵션상품 sku</label>
									<div class="col-sm-9">
										<input type="text" class="form-control" id="goods_sku" name="goods_sku" readonly="" value="<?=$goods_sku?>">
									</div>
								</div>

								<div class="mb-2 row">
									<label for="product_name" class="col-sm-3 col-form-label bg-light">* 옵션상품명(국문)</label>
									<div class="col-sm-9">
										<input type="text" class="form-control" id="product_name" name="product_name" placeholder="" value="<?=$product_name?>">
									</div>
								</div>
								<div class="mb-2 row">
									<label for="product_name_en" class="col-sm-3 col-form-label bg-light">* 옵션상품명(영문)</label>
									<div class="col-sm-9">
										<input type="text" class="form-control" id="product_name_en" name="product_name_en" value="<?=$data['product_name_en']?>">
									</div>
								</div>
								<div class="mb-2 row">
									<label for="product_platform" class="col-sm-3 col-form-label bg-light">* 게임플랫폼</label>
									<div class="col-sm-6">
										<select id="product_platform" name="product_platform" class="form-select" required>
											<option value="">:::선택:::</option>
											<option value="1" <?=$selected['product_platform']['1']?>>Steam</option>
											<option value="34" <?=$selected['product_platform']['34']?>>Epic</option>
											<option value="30" <?=$selected['product_platform']['30']?>>Ubisoft Connect</option>
											<option value="35" <?=$selected['product_platform']['35']?>>Rockstar Games Launcher</option>
											<option value="33" <?=$selected['product_platform']['33']?>>Bethesda</option>
											<option value="3" <?=$selected['product_platform']['3']?>>Origin</option>
											<option value="51" <?=$selected['product_platform']['51']?>>홀로모델</option>
											<option value="32" <?=$selected['product_platform']['32']?>>기타</option>
										</select>
									</div>
								</div>
								
								<div class="row mb-2">
									<label for="option_type" class="col-sm-3 col-form-label bg-light">* 옵션상품 유형</label>
									<div class="col-4">
										<select id="option_type" name="option_type" class="form-select" required>
											<option value="">:::선택:::</option>
											<option value="digital" <?=$selected['option_type']['digital']?>>디지털상품</option>
											<option value="retail" <?=$selected['option_type']['retail']?>>실물상품</option>
										</select>
									</div>
								</div>

								<div class="row mb-2">
									<label for="game_type" class="col-sm-3 col-form-label bg-light">* 옵션상품 구분</label>
									<div class="col-4">
										<select id="game_type" name="game_type" class="form-select" required>
											<option value="">:::선택:::</option>
											<option value="game" <?=$selected['game_type']['game']?>>게임</option>
											<option value="dlc" <?=$selected['game_type']['dlc']?>>DLC</option>
											<option value="music" <?=$selected['game_type']['music']?>>사운드트랙</option>
											<option value="bundle" <?=$selected['game_type']['bundle']?>>번들</option>
											<option value="randombox" <?=$selected['game_type']['randombox']?>>랜덤박스</option>
											<option value="timedeal" <?=$selected['game_type']['timedeal']?>>타임딜</option>
											<option value="accessories" <?=$selected['game_type']['accessories']?>>악세사리</option>
											<option value="holomodels" <?=$selected['game_type']['holomodels']?>>홀로모델</option>
										</select>
									</div>
								</div>

								<div class="row mb-2">
									<label for="display_type" class="col-sm-3 col-form-label bg-light">* 진열그룹</label>
									<div class="col-4">
										<select id="display_type" name="display_type" class="form-select">
											<option value="">:::선택:::</option>
											<option value="basic" <?=$selected['display_type']['basic']?>>기본게임</option>
											<option value="edition" <?=$selected['display_type']['edition']?>>에디션</option>
											<option value="multi" <?=$selected['display_type']['multi']?>>멀티팩</option>
											<option value="dlc" <?=$selected['display_type']['dlc']?>>DLC</option>
											<option value="game_bundle" <?=$selected['display_type']['game_bundle']?>>기본게임번들</option>
											<option value="dlc_bundle" <?=$selected['display_type']['dlc_bundle']?>>DLC번들</option>
											<option value="etc_bundle" <?=$selected['display_type']['etc_bundle']?>>기타번들</option>
											<option value="timedeal" <?=$selected['display_type']['timedeal']?>>타임딜</option>
											<option value="holomodels" <?=$selected['display_type']['holomodels']?>>홀로모델</option>
											<option value="holomodelsdlc" <?=$selected['display_type']['holomodelsdlc']?>>홀로모델 DLC</option>
											<option value="holomodelsedition" <?=$selected['display_type']['holomodelsedition']?>>홀로모델 에디션</option>
										</select>
									</div>
								</div>
							</div> 
							<!-- end card-body-->
						</div>
					</div>

					<div class="col-5">

						<div class="card border">
							<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 부가정보</div>
							<div class="card-body">
								<div class="row mb-2">
									<label for="release_date" class="col-3 col-form-label bg-light"> 음성 한국어</label>
									<div class="col-4">
										<div class="mt-1">
										<input type="checkbox" id="spoken_korean" name="spoken_korean" value="Y" data-switch="success" <?=$checked['spoken_korean']['Y']?>>
										<label for="spoken_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<label for="release_date" class="col-3 col-form-label bg-light"> 인터페이스 한국어</label>
									<div class="col-4">
										<div class="mt-1">
										<input type="checkbox" id="interface_korean" name="interface_korean" value="Y" data-switch="success" <?=$checked['interface_korean']['Y']?>>
										<label for="interface_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
										</div>
									</div>
								</div>
								
								<div class="row mb-2">
									<label for="subtitle_korean" class="col-sm-3 col-form-label bg-light"> 자막 한국어</label>
									<div class="col-4">
										<div class="mt-1">
										<input type="checkbox" id="subtitle_korean" name="subtitle_korean" value="Y" data-switch="success" <?=$checked['subtitle_korean']['Y']?>>
										<label for="subtitle_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<label for="release_date" class="col-3 col-form-label bg-light"> 독점 한국어</label>
									<div class="col-4">
										<div class="mt-1">
										<input type="checkbox" id="exclusive_korean" name="exclusive_korean" value="Y" data-switch="success" <?=$checked['exclusive_korean']['Y']?>>
										<label for="exclusive_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<label for="steam_appid" class="col-sm-3 col-form-label bg-light">Steam App ID</label>
									<div class="col-3">
										<input type="text" class="form-control" id="steam_appid" name="steam_appid" placeholder="Steam App ID" value="<?=$data['steam_appid']?>">
									</div>
								</div>
								<div class="row mb-2">
									<label for="packageid" class="col-sm-3 col-form-label bg-light">Steam Package ID</label>
									<div class="col-3">
										<input type="text" class="form-control" id="packageid" name="packageid" placeholder="Steam Package ID" value="<?=$data['packageid']?>">
									</div>
								</div>
								<div class="row mb-2">
									<label for="bundleid" class="col-sm-3 col-form-label bg-light">Steam Bundle ID</label>
									<div class="col-3">
										<input type="text" class="form-control" id="bundleid" name="bundleid" placeholder="Steam Bundle ID" value="<?=$data['bundleid']?>">
									</div>
								</div>
							</div>
						</div>

					</div>
				</div>

				<div class="row mb-2">
					<div class="text-end">
<?php
	if(!$product_viewer){
?>
						<button type="submit" class="btn btn-primary shadow-none">옵션상품 저장</button>
<?php
	}
?>
					</div>
				</div>

				</form>

				<!-- end row -->   
				
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->

		<!-- Footer Start -->
		<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/footer.php');?>
		<!-- end Footer -->
	</div>
	<!-- ============================================================== -->
	<!-- End Page content -->

</div>
<!-- END wrapper -->

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script src="<?=$document_root?>/assets/js/vendor/jquery.datetimepicker.full.min.js"></script>
<script>
$(function() {
//  $.datepicker.setDefaults($.datepicker.regional['ko']); //datepicker 한국어로 사용하기 위한 언어설정
  //$('#release_date').datepicker();
  $.datetimepicker.setLocale('ko');
  var default_date = new Date();
	default_date.setDate(default_date.getDate());
$('#datetimepicker').datetimepicker({
	formatTime:'H:i',
	formatDate:'Y-m-d',
	format:'Y-m-d H:i:s',
	dayOfWeekStart : 0,
	lang:'ko',
	defaultDate:default_date.getDate(),
	startDate:new Date()
	});
	$('#datetimepicker').datetimepicker({ step:30});
});
</script>

<script>
//var simplemde = new SimpleMDE({ element: document.getElementById("description") });

$(document).ready(function(){
	$("#frm").submit(function( event ) {
	});
});

</script>

</body>
</html>
