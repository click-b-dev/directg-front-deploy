<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['modify'] = "active";

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
	$parsedown= new Parsedown();

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

		$selected['publisher_code'][$data['publisher_code']]="selected";
		$selected['game_type'][$data['game_type']]="selected";
		$selected['bundle_type'][$data['bundle_type']]="selected";
		$selected['option_type'][$data['option_type']]="selected";
		$selected['display_type'][$data['display_type']]="selected";
		
		$selected['product_platform'][$data['product_platform']]="selected";
		
		$game_rate_array = array();
		 for ($i = 0; $i < mb_strlen($data['game_rate'],"UTF-8"); $i++) {
			$char = mb_substr ($data['game_rate'], $i, 1, 'UTF-8');
			if($char=="1"){
				array_push ($game_rate_array, "checked");
			}else{
				array_push ($game_rate_array, "");
			}
		}
		
		$checked['age_limit'][$data['age_limit']]="checked";
	
	}else{
		$mode= "register";
		
		//$product_code = $admin->setGoodsItemCode();
		$goods_sku = $admin->uuidgen4();

		$checked['is_view']['N']="checked";
		$checked['is_bundle']['N']="checked";
		$checked['is_package']['N']="checked";
		$checked['status']['9']="checked";
		$checked['is_tmp']['N']="checked";
		$checked['is_special']['N']="checked";
		$checked['is_free']['N']="checked";
		
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
									<li class="breadcrumb-item active">옵션상품 기본정보 설정</li>
								</ol>
							</div>
							<h4 class="page-title">옵션상품 기본정보 설정</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sub_sidebar_option.php');?>
					</div>
					<div class="col-10">
						<form id="frm" name="frm" method="post" action="goods_option_ps.php" class="form-horizontal" enctype="multipart/form-data">
							<input type="hidden" name="mode" value="<?=$mode?>">
							<input type="hidden" name="page" value="<?=$page?>">
							<input type="hidden" name="referer" value="<?=$_SERVER['HTTP_REFERER']?>">
							<input type="hidden" name="search_product_name" value="<?=$search_product_name?>">
							<input type="hidden" name="search_product_name_en" value="<?=$search_product_name_en?>">
							<input type="hidden" name="search_product_type" value="<?=$search_product_type?>">
							<input type="hidden" name="search_status" value="<?=$search_status?>">
							<input type="hidden" name="search_product_platform" value="<?=$search_product_platform?>">
							<input type="hidden" name="search_order_system" value="<?=$search_order_system?>">
							<input type="hidden" id="game_rate_text" name="game_rate_text" value="">
						
							<div class="card">
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
										<label for="keyword" class="col-sm-3 col-form-label bg-light">* 검색키워드</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="keyword" name="keyword" value="<?=$data['keyword']?>">
										</div>
									</div>
									<!--
									<div class="mb-2 row">
										<label for="publisher" class="col-sm-3 col-form-label bg-light">* 표기용 퍼블리셔</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="publisher" name="publisher" value="<?=$data['publisher']?>">
										</div>
									</div>
									-->
									<?if($data['option_type']=="retail"){?>
									<div class="mb-2 row">
										<label for="model_code" class="col-sm-3 col-form-label bg-light">* 실물상품 모델코드</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="model_code" name="model_code" value="<?=$data['model_code']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="model_name" class="col-sm-3 col-form-label bg-light">* 실물상품 모델명</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="model_name" name="model_name" value="<?=$data['model_name']?>">
										</div>
									</div>
									<?}?>
									<div class="mb-2 row">
										<label for="product_platform" class="col-sm-3 col-form-label bg-light">* 플랫폼</label>
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
												<option value="timedeal" <?=$selected['game_type']['timedeal']?>>타임딜</option>
												<option value="randombox" <?=$selected['game_type']['randombox']?>>랜덤박스</option>
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
									
									<div class="row mb-2">
										<label for="spoken_korean" class="col-sm-3 col-form-label bg-light"> 음성 한국어</label>
										<div class="col-4">
											<div class="mt-1">
											<input type="checkbox" id="spoken_korean" name="spoken_korean" value="Y" data-switch="success" <?=$checked['spoken_korean']['Y']?>>
											<label for="spoken_korean" data-on-label="Y" data-off-label="N" class="mb-0 d-block"></label>
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="interface_korean" class="col-sm-3 col-form-label bg-light"> 인터페이스 한국어</label>
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
										<label for="exclusive_korean" class="col-sm-3 col-form-label bg-light"> 독점 한국어</label>
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
									<!--
									<div class="row mb-2">
										<label for="age_limit" class="col-3 col-form-label bg-light border">* 심의결정등급</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit10" name="age_limit" class="form-check-input" value="10" <?=$checked['age_limit']['10']?>>
												<label class="form-check-label" for="age_limit10">전체 이용가</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit12" name="age_limit" class="form-check-input" value="12" <?=$checked['age_limit']['12']?>>
												<label class="form-check-label" for="age_limit12">12세이용가</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit15" name="age_limit" class="form-check-input" value="15" <?=$checked['age_limit']['15']?>>
												<label class="form-check-label" for="age_limit15">15세이용가</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="age_limit19" name="age_limit" class="form-check-input" value="19" <?=$checked['age_limit']['19']?>>
												<label class="form-check-label" for="age_limit19">청소년이용불가</label>
											</div>
										</div>
									</div>
									
									<div class="row">
										<label for="title_name_en" class="col-3 col-form-label bg-light border"> 내용정보표시</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate64" name="game_rate[]" class="form-check-input" value="64" <?=$game_rate_array['0']?>>
												<label class="form-check-label" for="game_rate64">선정성</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate32" name="game_rate[]" class="form-check-input" value="32" <?=$game_rate_array['1']?>>
												<label class="form-check-label" for="game_rate32">폭력성</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate16" name="game_rate[]" class="form-check-input" value="16" <?=$game_rate_array['2']?>>
												<label class="form-check-label" for="game_rate16">공포</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate8" name="game_rate[]" class="form-check-input" value="8" <?=$game_rate_array['3']?>>
												<label class="form-check-label" for="game_rate8">언어의부적절성</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate4" name="game_rate[]" class="form-check-input" value="4" <?=$game_rate_array['4']?>>
												<label class="form-check-label" for="game_rate4">약물</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate2" name="game_rate[]" class="form-check-input" value="2" <?=$game_rate_array['5']?>>
												<label class="form-check-label" for="game_rate2">범죄</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="game_rate1" name="game_rate[]" class="form-check-input" value="1" <?=$game_rate_array['6']?>>
												<label class="form-check-label" for="game_rate1">사행성</label>
											</div>
										</div>
									</div>
									-->
								</div> 
								<div class="card-footer">
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
							</div>
						</form>
						<!--
						<form id="frm" name="frm" method="post" action="goods_option_ps.php" class="form-horizontal" enctype="multipart/form-data">
							<input type="hidden" name="mode" value="attribute_set">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
						
							<div class="card">
								<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 상품정보고시</div>
								<div class="card-body">
									<div class="mb-2 row">
										<label for="model_number" class="col-sm-3 col-form-label bg-light">* 모델명</label>
										<div class="col-sm-9">
											<input type="text" id="model_number" name="model_number" class="form-control"  value="<?=$model_number?>" >
										</div>
									</div>
									<div class="mb-2 row">
										<label for="product_name" class="col-sm-3 col-form-label bg-light">*  품명</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="product_name" name="product_name" readonly="" value="<?=$product_name?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="kc_safety_infomartion" class="col-sm-3 col-form-label bg-light">* KC 인증정보</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="kc_safety_infomartion" name="kc_safety_infomartion" placeholder="" value="<?=$kc_safety_infomartion?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="rated_voltage" class="col-sm-3 col-form-label bg-light">* 정격전압</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="rated_voltage" name="rated_voltage" value="<?=$data['rated_voltage']?>">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="power" class="col-sm-3 col-form-label bg-light">* 소비전력</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="power" name="power" value="<?=$data['power']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="manufacturing_date" class="col-sm-3 col-form-label bg-light">* 동일모델의 출시년월</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="manufacturing_date" name="manufacturing_date" value="<?=$data['manufacturing_date']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="manufacturer" class="col-sm-3 col-form-label bg-light">* 제조자 및 수입자</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="manufacturer" name="manufacturer" value="<?=$data['manufacturer']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="manufacture_country" class="col-sm-3 col-form-label bg-light">* 제조국</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="manufacture_country" name="manufacture_country" value="<?=$data['manufacture_country']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="size" class="col-sm-3 col-form-label bg-light">* 크기(mm)</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="size" name="size" value="<?=$data['size']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="weight" class="col-sm-3 col-form-label bg-light">* 무게(kg)</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="weight" name="weight" value="<?=$data['weight']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="main_requirements" class="col-sm-3 col-form-label bg-light">* 주요사양</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="main_requirements" name="main_requirements" value="<?=$data['main_requirements']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="warranty_service" class="col-sm-3 col-form-label bg-light">* 품질보증기준</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="warranty_service" name="warranty_service" value="<?=$data['warranty_service']?>">
										</div>
									</div>
									<div class="row mb-2">
										<label for="as_information" class="col-sm-3 col-form-label bg-light">* A/S 책임자(전화번호)</label>
										<div class="col-sm-9">
											<input type="text" class="form-control" id="as_information" name="as_information" value="<?=$data['as_information']?>">
										</div>
									</div>
								</div> 
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary shadow-none">상품정보고시 저장</button>
									</div>
								</div>
							</div>
						</form>
						-->
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
	$("form").submit(function( event ) {
		 var dec = 0;
		$('input[name="game_rate[]"]').each(function(index, item){
			if($(this).prop('checked')){
				dec +=parseInt($(this).val());
			}
		});
		console.log(dec.toString(2));
		$("#game_rate_text").val(dec.toString(2));
	});
});

</script>

</body>
</html>
