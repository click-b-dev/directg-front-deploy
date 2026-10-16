<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['sales'] = "active";

$page_title="옵션상품 판매 설정";

$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_GET, 'search_product_name', FILTER_SANITIZE_STRING);
$search_product_name_en = filter_input(INPUT_GET, 'search_product_name_en', FILTER_SANITIZE_STRING);
$search_product_type = filter_input(INPUT_GET, 'search_product_type', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_GET, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_order_system = filter_input(INPUT_GET, 'search_order_system', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_is_bonus = filter_input(INPUT_GET, 'search_is_bonus', FILTER_SANITIZE_STRING);

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);
	$parsedown= new Parsedown();

	if($product_code){
		$mode= "sales_config";
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);
		$goods_option_data = $stmt->fetch();

		//판매시작일
		if($goods_option_data['start_date']=="" || $goods_option_data['start_date']==0){
			$start_date = date('Y-m-d H:i');
		}else{
			$start_date = date('Y-m-d H:i',$goods_option_data['start_date']);
		}

		//판매종료일 (기본값: 2999-12-31 23:59:59)
		if($goods_option_data['end_date']=="" || $goods_option_data['end_date']==0){
			$end_date = "2050-12-31 23:59:59";
		}else{
			$end_date = date('Y-m-d H:i',$goods_option_data['end_date']);
		}
		
		//출시일자
		if($goods_option_data['release_date']==""){
			$release_date = "";
		}else{
			$release_date = date('Y-m-d H:i',strtotime($goods_option_data['release_date']));
		}
		
		//수령가능일자
		if($goods_option_data['delivery_date']=="0" || $goods_option_data['delivery_date']==""){
			$delivery_date = "";
		}else{
			$delivery_date = date('Y-m-d H:i',$goods_option_data['delivery_date']);
		}
		
		
		$publisher_data= $admin->getPublisherAllList('all');
		
		//옵션상품 배송아이템 설정
		$goods_delivery_list = $admin->getGoodsItemDeliveryList($product_code);

		$checked['status'][$goods_option_data['status']]="checked";
		$checked['purchase_limit_yn'][$goods_option_data['purchase_limit_yn']]="checked";

		$checked['soldout'][$goods_option_data['soldout']]="checked";

		$checked['is_auth'][$goods_option_data['is_auth']]="checked";

		$selected['supplier_code'][$goods_option_data['supplier_code']]="selected";
		$checked['is_view'][$goods_option_data['is_view']]="checked";
		$checked['delivery_type'][$goods_option_data['delivery_type']]="checked";
		$checked['is_bonus'][$goods_option_data['is_bonus']]="checked";
		$checked['is_preorder'][$goods_option_data['is_preorder']]="checked";
		$selected['bonus_no'][$goods_bonus_data['bonus_no']]="selected";
		$checked['is_naverpay_coupon'][$goods_option_data['is_naverpay_coupon']]="checked";
		
		switch($goods_option_data['game_type']){
			case "game":
				$referer = "goods_option_list.php";
			break;
			case "dlc":
				$referer = "goods_option_list.php";
			break;
			case "music":
				$referer = "goods_option_list.php";
			break;
			case "bundle":
				$referer = "goods_option_list.php";
			break;
			case "randombox":
				$referer = "goods_randombox_list.php";
			break;
			case "accessories":
				$referer = "goods_etc_list.php";
			break;
		}
		
		//타임딜 진행이력
		$timedeal_history = $adminGoods->getTimedealHistory($product_code);
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
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$goods_option_data['product_name']?> <span class="badge bg-dark"><?=$adminGoods->getPlatformName($goods_option_data['product_platform'])?></span> <span class="badge bg-dark"><?=$goods_option_data['game_type']?></span> <span class="badge bg-dark"><?=$goods_option_data['display_type']?></span></h4>
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
								<!-- 옵션상품 일반판매설정 -->
									<form id="frm" name="frm" method="post" action="goods_option_ps.php" class="form-horizontal" enctype="multipart/form-data">
										<input type="hidden" name="mode" value="sales_config">
										<input type="hidden" name="search_is_view" value="<?=$search_is_view?>">
										<input type="hidden" name="search_status" value="<?=$search_status?>">
										<input type="hidden" name="game_type" value="<?=$goods_option_data['game_type']?>">
										<input type="hidden" name="is_view" value="<?=$goods_option_data['is_view']?>">
										<input type="hidden" name="product_code" value="<?=$product_code?>">
										<input type="hidden" name="search_supplier_code" value="<?=$search_supplier_code?>">
										<input type="hidden" name="search_is_bonus" value="<?=$search_is_bonus?>">
										<input type="hidden" name="search_product_name" value="<?=$search_product_name?>">
										<input type="hidden" name="page" value="<?=$page?>">
										<input type="hidden" name="referer" value="<?=$referer?>">
										<div class="card border">
											<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 판매 설정</div>
											<div class="card-body">
												<div class="row mb-2 border">
													<label for="colFormLabelSm" class="col-sm-3 col-form-label bg-light">* 진열상태</label>
													<div class="col-9 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_view1" name="is_view" class="form-check-input" value="Y" <?=$checked['is_view']['Y']?>>
															<label class="form-check-label" for="is_view1">진열함</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_view2" name="is_view" class="form-check-input" value="N" <?=$checked['is_view']['N']?>>
															<label class="form-check-label" for="is_view2">진열안함</label>
														</div>
													</div>
												</div>
												<div class="row border mb-2">
													<label for="status" class="col-sm-3 col-form-label bg-light">* 판매상태</label>
													<div class="col-9 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="status_9" name="status" class="form-check-input" value="9" <?=$checked['status']['9']?>>
															<label class="form-check-label" for="status_9">승인대기</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="status_0" name="status" class="form-check-input" value="0" <?=$checked['status']['0']?>>
															<label class="form-check-label" for="status_0">판매중</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="status_1" name="status" class="form-check-input" value="1" <?=$checked['status']['1']?>>
															<label class="form-check-label" for="status_1">판매중지</label>
														</div>
														
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="status_3" name="status" class="form-check-input" value="3" <?=$checked['status']['3']?>>
															<label class="form-check-label" for="status_3">판매종료</label>
														</div>
													</div>
												</div>

												<div class="row mb-2 border">
													<label for="purchase_limit_yn" class="col-sm-3 col-form-label bg-light">* 구매수량 제한여부</label>
													<div class="col-3 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="purchase_limit_y" name="purchase_limit_yn" class="form-check-input" value="Y" <?=$checked['purchase_limit_yn']['Y']?>>
															<label class="form-check-label" for="purchase_limit_y">예</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="purchase_limit_n" name="purchase_limit_yn" class="form-check-input" value="N" <?=$checked['purchase_limit_yn']['N']?>>
															<label class="form-check-label" for="purchase_limit_n">아니오</label>
														</div>
													</div>
												</div>

												<div class="row mb-2 ">
													<label for="purchase_limit" class="col-sm-3 col-form-label bg-light">* 구매수량제한</label>
													<div class="col-1 mt-1">
														<input type="text" class="form-control form-control-sm" id="purchase_limit" name="purchase_limit" placeholder="구매가능수량" value="<?=$goods_option_data['purchase_limit']?>">
													</div>
												</div>
												
												<!--
												<div class="row mb-2">
													<label for="colFormLabelSm" class="col-sm-3 col-form-label bg-light">* 판매기간</label>
													<div class="col-6 mt-1">
														<div class="input-group">
															<input type="text" class="form-control form-control-sm" id="start_date" name="start_date" placeholder="판매시작일" value="<?=$start_date?>">
															<span class="input-group-text">~</span>
															<input type="text" class="form-control form-control-sm" id="end_date" name="end_date" placeholder="판매종료일" value="<?=$end_date?>">
														</div>
													</div>
												</div>
												-->
												
												<div class="row mb-2">
													<label for="release_date" class="col-sm-3 col-form-label bg-light">* 출시일</label>
													<div class="col-3">
														<div class=" position-relative" id="datepicker2">
															<input type="text" class="form-control form-control-sm" id="datetimepicker" name="release_date" value="<?=$release_date?>" data-toggle="input-mask" data-mask-format="0000-00-00 00:00">
														</div>
													</div>
												</div>

												<div class="row mb-2">
													<label for="delivery_date" class="col-sm-3 col-form-label bg-light">* 수령가능일자</label>
													<div class="col-3 mt-1">
														<input type="text" class="form-control form-control-sm" id="delivery_date" name="delivery_date" placeholder="수령가능일자" value="<?=$delivery_date?>" required data-toggle="input-mask" data-mask-format="0000-00-00 00:00">
													</div>
												</div>
												
												<div class="row mb-2 border">
													<label for="is_preorder" class="col-sm-3 col-form-label bg-light">* 예약판매여부</label>
													<div class="col-3 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_preorder_y" name="is_preorder" class="form-check-input" value="Y" <?=$checked['is_preorder']['Y']?>>
															<label class="form-check-label" for="is_preorder_y">예</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_preorder_n" name="is_preorder" class="form-check-input" value="N" <?=$checked['is_preorder']['N']?>>
															<label class="form-check-label" for="is_preorder_n">아니오</label>
														</div>
													</div>
												</div>

												<div class="row mb-2 border">
													<label for="soldout" class="col-sm-3 col-form-label bg-light">* 품절여부</label>
													<div class="col-3 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="soldout_y" name="soldout" class="form-check-input" value="Y" <?=$checked['soldout']['Y']?>>
															<label class="form-check-label" for="soldout_y">예</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="soldout_n" name="soldout" class="form-check-input" value="N" <?=$checked['soldout']['N']?>>
															<label class="form-check-label" for="soldout_n">아니오</label>
														</div>
													</div>
												</div>
												
												<div class="row mb-2 border">
													<label for="is_auth" class="col-sm-3 col-form-label bg-light">* 본인인증 필수</label>
													<div class="col-3 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_auth_y" name="is_auth" class="form-check-input" value="Y" <?=$checked['is_auth']['Y']?>>
															<label class="form-check-label" for="is_auth_y">예</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_auth_n" name="is_auth" class="form-check-input" value="N" <?=$checked['is_auth']['N']?>>
															<label class="form-check-label" for="is_auth_n">아니오</label>
														</div>
													</div>
												</div>
												
												<div class="row mb-2 border">
													<label for="is_bonus" class="col-sm-3 col-form-label bg-light">* 구매특전 제공여부</label>
													<div class="col-3 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_bonus_y" name="is_bonus" class="form-check-input" value="Y" <?=$checked['is_bonus']['Y']?>>
															<label class="form-check-label" for="is_bonus_y">예</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_bonus_n" name="is_bonus" class="form-check-input" value="N" <?=$checked['is_bonus']['N']?>>
															<label class="form-check-label" for="is_bonus_n">아니오</label>
														</div>
													</div>
												</div>
												<div class="row mb-2 border">
													<label for="is_naverpay_coupon" class="col-sm-3 col-form-label bg-light">* 네이버페이 포인트 쿠폰 제공</label>
													<div class="col-3 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_naverpay_coupon_y" name="is_naverpay_coupon" class="form-check-input" value="Y" <?=$checked['is_naverpay_coupon']['Y']?>>
															<label class="form-check-label" for="is_naverpay_coupon_y">예</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="is_naverpay_coupon_n" name="is_naverpay_coupon" class="form-check-input" value="N" <?=$checked['is_naverpay_coupon']['N']?>>
															<label class="form-check-label" for="is_naverpay_coupon_n">아니오</label>
														</div>
													</div>
												</div>
												
												<div class="row mb-2 border">
													<label for="delivery_type" class="col-sm-3 col-form-label bg-light">* 배송유형</label>
													<div class="col-6 mt-1">
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="delivery_type_1" name="delivery_type" class="form-check-input" value="1" <?=$checked['delivery_type']['1']?>>
															<label class="form-check-label" for="is_delivery_y">코드발송</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="delivery_type_2" name="delivery_type" class="form-check-input" value="2" <?=$checked['delivery_type']['2']?>>
															<label class="form-check-label" for="delivery_type_2">실물배송</label>
														</div>
														<div class="form-check form-radio-dark form-check-inline">
															<input type="radio" id="delivery_type_3" name="delivery_type" class="form-check-input" value="3" <?=$checked['delivery_type']['3']?>>
															<label class="form-check-label" for="delivery_type_3">코드발송 + 실물배송</label>
														</div>
													</div>
												</div>
											</div>

											<div class="card-footer">
												<div class="text-end">
<?php
	if(!$product_viewer){
?>
													<button type="submit" class="btn btn-primary shadow-none">판매설정 저장</button>
<?php
	}
?>
												</div>
											</div>
										</div>
									</form>
							</div>
							<div class="col-4">
								<!-- 옵션상품 가격설정 -->
								<form id="price_frm" name="price_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
									<input type="hidden" name="mode" value="price_save">
									<input type="hidden" name="product_code" value="<?=$product_code?>">
									
									<div class="card border">
										<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 가격설정</div>
										<div class="card-body">
											<div class="row">
												<div class="col-12">
													<div class="row mb-2">
														<label for="consumer_price" class="col-sm-4 col-form-label bg-light">* 소비자가</label>
														<div class="col-8">
															<div class="input-group">
																<div class="input-group-text" style="font-family:dotum">&#92;</div>
																<input type="text" class="form-control" id="consumer_price" name="consumer_price" placeholder="" value="<?=$goods_option_data['consumer_price']?>">
															</div>
														</div>
													</div>
													<div class="row mb-2">
														<label for="price" class="col-sm-4 col-form-label bg-light">* DGKR 판매가</label>
														<div class="col-8">
															<div class="input-group">
																<div class="input-group-text" style="font-family:dotum">&#92;</div>
																<input type="text" class="form-control" id="price" name="price" placeholder="" value="<?=$goods_option_data['price']?>">
															</div>
														</div>
													</div>
													<div class="row mb-2">
														<label for="discount" class="col-sm-4 col-form-label bg-light">할인률</label>
														<div class="col-8">
															<div class="input-group">
																<input type="text" class="form-control" id="discount" name="discount" placeholder="" value="<?=$goods_option_data['discount']?>" maxlength="2">
																<div class="input-group-text" style="font-family:dotum">%</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="card-footer">
											<div class="text-end">
<?php
	if(!$product_viewer){
?>
												<button type="submit" class="btn btn-primary shadow-none">가격 설정 저장</button>
<?php
	}
?>
											</div>
										</div>
									</div>
								</form>
								<!-- 옵션상품 공급처설정 -->
								<form id="supplier_frm" name="supplier_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
									<input type="hidden" name="mode" value="supplier_save">
									<input type="hidden" name="product_code" value="<?=$product_code?>">
									<div class="card border">
										<div class="card-header bg-secondary text-white fw-bold font-15">옵션상품 공급처 설정</div>
										<div class="card-body">
											<div class="mb-2 row">
												<label for="supplier_code" class="col-sm-4 col-form-label bg-light">* 공급처</label>
												<div class="col-sm-8">
													<select id="supplier_code" name="supplier_code" class="form-select select2" data-toggle="select2" required>
														<option value="">:::선택:::</option>
														<?
															foreach($publisher_data as $value){
														?>
														<option value="<?=$value['publisher_code']?>" <?=$selected['supplier_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
														<?
															}
														?>
													</select>
												</div>
											</div>
											<div class="row mb-2">
												<label for="product_srp" class="col-sm-4 col-form-label bg-light">* 공급처 SRP</label>
												<div class="col-8">
													<div class="input-group">
														<div class="input-group-text" style="font-family:dotum">&#92;</div>
														<input type="text" class="form-control" id="product_srp" name="product_srp" placeholder="" value="<?=$goods_option_data['product_srp']?>">
													</div>
												</div>
											</div>
											<div class="row mb-2">
												<label for="product_ppr" class="col-sm-4 col-form-label bg-light">공급처 PPR</label>
												<div class="col-8">
													<div class="input-group">
														<div class="input-group-text" style="font-family:dotum">&#92;</div>
														<input type="text" class="form-control" id="product_ppr" name="product_ppr" placeholder="" value="<?=$goods_option_data['product_ppr']?>">
													</div>
												</div>
											</div>
											<div class="row mb-2">
												<label for="product_rs" class="col-sm-4 col-form-label bg-light">공급처 RS</label>
												<div class="col-8">
													<div class="input-group">
														<input type="text" class="form-control" id="product_rs" name="product_rs" placeholder="" value="<?=$goods_option_data['product_rs']?>" maxlength="2">
														<div class="input-group-text" style="font-family:dotum">%</div>
													</div>
												</div>
											</div>
										</div>
										<div class="card-footer">
											<div class="text-end">
<?php
	if(!$product_viewer){
?>
												<button type="submit" class="btn btn-primary shadow-none">공급처 설정 저장</button>
<?php
	}
?>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
						<!-- 옵션상품 배송상품설정 -->
						<div class="card">
							<h5 class="card-header bg-secondary text-white">옵션상품 배송아이템 설정</h5>
							<div class="card-body p-2">
								<table class="table table-bordered table-centered mb-0 table-sm caption-top">
									<caption class="py-1">배송아이템 세부정보</caption>
									<colgroup>
										<col style="width:80px"/>
										<col style="width:100px" />
										<col style="width:90px"/>
										<col/>
										<col style="width:170px" />
										<col style="width:70px"/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">연동시스템</th>
											<th class="text-center">플랫폼</th>
											<th class="text-center">아이템 유형</th>
											<th class="text-center">아이템 정보</th>
											<th class="text-center">공급처</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($goods_delivery_list as $delivery_list){
									?>
									<tr>
										<td class="text-center"><?=$admin->getOrderSystem($delivery_list['order_system'])?></td>
										<td class="text-center"><?=$delivery_list['item_platform']?></td>
										<td class="text-center"><?=$delivery_list['item_type']?></td>
										<td><?=$delivery_list['item_name']?><br/>(<?=$delivery_list['item_id']?>)</td>
										<td class="text-center"><?=$delivery_list['item_publisher']?></td>
										<td class="text-center">
<?php
	if(!$product_viewer){
?>
										<button class="btn btn_link btn_delivery_item_delete" type="button" data-itemid="<?=$delivery_list['item_id']?>" data-productcode="<?=$goods_option_data['product_code']?>" data-system="<?=$delivery_list['order_system']?>"><i class="mdi mdi-18px mdi-delete email-action-icons-item"></i></button>
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
										<td colspan="9" class="p-3">
											<div class="row mb-2">
												<label for="order_system" class="col-sm-3 col-form-label col-form-label-sm bg-light border">* 연동시스템</label>
												<div class="col-sm-9 border">
													<div class="form-check form-check-inline form-radio-dark mt-1">
														<input type="radio" id="order_system_1" name="order_system" class="form-check-input" value="1" <?=$checked['order_system']['1']?>>
														<label class="form-check-label" for="order_system_1">Asset</label>
													</div>
													<div class="form-check form-check-inline form-radio-dark">
														<input type="radio" id="order_system_2" name="order_system" class="form-check-input" value="2" <?=$checked['order_system']['2']?>>
														<label class="form-check-label" for="order_system_2">Ztorm</label>
													</div>
													<div class="form-check form-check-inline form-radio-dark">
														<input type="radio" id="order_system_9" name="order_system" class="form-check-input" value="9" <?=$checked['order_system']['9']?>>
														<label class="form-check-label" for="order_system_9">Genba</label>
													</div>
													<div class="form-check form-check-inline form-radio-dark">
														<input type="radio" id="order_system_8" name="order_system" class="form-check-input" value="8" <?=$checked['order_system']['8']?>>
														<label class="form-check-label" for="order_system_8">Vaultn</label>
													</div>
													<div class="form-check form-check-inline form-radio-dark">
														<input type="radio" id="order_system_10" name="order_system" class="form-check-input" value="10" <?=$checked['order_system']['10']?>>
														<label class="form-check-label" for="order_system_10">PointNexus</label>
													</div>
												</div>
											</div>
											<div class="row mb-2" id="asset_find">
												<label for="order_system" class="col-sm-3 col-form-label col-form-label-sm bg-light border">* Asset 검색</label>
												<div class="col-6">
													<div class="input-group">
														<input type="text" class="form-control form-control-sm" id="search_value" name="search_value"  placeholder="Asset ID를 입력해 주세요">
														<button type="button" class="btn btn-sm btn-dark shadow-none" id="btn_asset_find" data-productcode="<?=$goods_option_data['product_code']?>">Asset 검색</button>
													</div>
												</div>
											</div>
											<div class="row mb-2" id="ztorm_find">
												<label for="order_system" class="col-sm-3 col-form-label col-form-label-sm bg-light border">* Ztorm 검색</label>
												<div class="col-6">
													<div class="input-group">
														<input type="text" class="form-control form-control-sm" id="search_value2" name="search_value2"  placeholder="연동시스템의 고유번호를 입력해 주세요">
														<button type="button" class="btn btn-sm btn-dark shadow-none" id="btn_ztorm_find" data-productcode="<?=$goods_option_data['product_code']?>">Ztorm 검색</button>
													</div>
												</div>
											</div>
											<div class="row mb-2" id="genba_find">
												<label for="search_genba" class="col-sm-3 col-form-label col-form-label-sm  bg-light border">* Genba 검색</label>
												<div class="col-6">
													<div class="input-group">
														<input type="text" class="form-control form-control-sm" id="search_genba" name="search_genba"  placeholder="연동시스템의 고유번호를 입력해 주세요">
														<button type="button" class="btn btn-sm btn-dark shadow-none" id="btn_genba_find" data-productcode="<?=$goods_option_data['product_code']?>">Genba 검색</button>
													</div>
												</div>
											</div>
											<div class="row mb-2" id="vaultn_find">
												<label for="search_vaultn" class="col-sm-3 col-form-label col-form-label-sm  bg-light border">* Vaultn 검색</label>
												<div class="col-6">
													<div class="input-group">
														<input type="text" class="form-control form-control-sm" id="search_vaultn" name="search_vaultn"  placeholder="연동시스템의 고유번호를 입력해 주세요">
														<button type="button" class="btn btn-sm btn-dark shadow-none" id="btn_vaultn_find" data-productcode="<?=$goods_option_data['product_code']?>">Vaultn 검색</button>
													</div>
												</div>
											</div>
											<div class="row mb-2" id="pointnexus_find">
												<label for="search_pointnexus" class="col-sm-3 col-form-label col-form-label-sm  bg-light border">* PointNexus 검색</label>
												<div class="col-6">
													<div class="input-group">
														<select class="form-control form-control-sm" id="pointnexus_mode" name="pointnexus_mode" style="max-width:90px;">
															<option value="test">test</option>
															<option value="prod">prod</option>
														</select>
														<input type="text" class="form-control form-control-sm" id="search_pointnexus" name="search_pointnexus" placeholder="PointNexus productID를 입력해 주세요">
														<button type="button" class="btn btn-sm btn-dark shadow-none" id="btn_pointnexus_find" data-productcode="<?=$goods_option_data['product_code']?>">PointNexus 검색</button>
													</div>
												</div>
											</div>
										</td>
									</tr>
									</tfoot>
								</table>
							</div>
						</div>
						
						<?if($goods_option_data['display_type']=="timedeal"){?>
						<form id="timedeal_frm" name="timedeal_frm" method="post" action="goods_option_ps.php" class="form-horizontal">
							<input type="hidden" name="mode" value="timedeal_config">
							<input type="hidden" name="game_type" value="<?=$goods_option_data['game_type']?>">
							<input type="hidden" name="is_view" value="<?=$goods_option_data['is_view']?>">
							<input type="hidden" name="product_code" value="<?=$product_code?>">
							<input type="hidden" name="goods_sku" value="<?=$goods_option_data['goods_sku']?>">
							
							<!-- 옵션상품 타임딜 설정 -->
							<div class="card border border-1">
								<div class="card-header bg-secondary text-white fw-bold font-15">타임딜 설정</div>
								<div class="card-body">
									<div class="mb-2 row">
										<label for="timedeal_date" class="col-sm-2 col-form-label bg-light">* 타일딜 진행기간</label>
										<div class="col-6 mt-1">
											<div class="input-group">
												<input type="text" class="form-control form-control-sm" id="timedeal_start_date" name="timedeal_start_date" placeholder="타임딜 시작일자" value="<?=$bonus_start_date?>" required>
												<span class="input-group-text">~</span>
												<input type="text" class="form-control form-control-sm" id="timedeal_end_date" name="timedeal_end_date" placeholder="타임딜 종료일자" value="<?=$bonus_end_date?>" required>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<label for="product_srp" class="col-2 col-form-label bg-light">퍼블리셔 SRP</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="product_srp" name="product_srp" placeholder="" value="<?=$goods_option_data['product_srp']?>">
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="product_ppr" class="col-2 col-form-label bg-light">퍼블리셔 PPR</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="product_ppr" name="product_ppr" placeholder="" value="<?=$goods_option_data['product_ppr']?>">
											</div>
										</div>
									</div>

									<div class="row mb-2">
										<label for="timedeal_price" class="col-2 col-form-label bg-light">타임딜 판매가</label>
										<div class="col-3">
											<div class="input-group">
												<div class="input-group-text" style="font-family:dotum">&#92;</div>
												<input type="text" class="form-control" id="timedeal_price" name="timedeal_price" placeholder="" value="<?=$goods_option_data['timedeal_price']?>">
											</div>
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="timedeal_stock" class="col-2 col-form-label bg-light">타임딜 진행수량</label>
										<div class="col-3">
											<input type="text" class="form-control" id="timedeal_stock" name="timedeal_stock" placeholder="" value="<?=$goods_option_data['timedeal_stock']?>">
										</div>
									</div>
									
									<div class="row mb-2">
										<label for="timedeal_confirm" class="col-2 col-form-label bg-light">타임딜 승인여부</label>
										<div class="col-10 mt-1">
											<div class="form-check form-radio-dark form-check-inline">
												<input type="radio" id="timedeal_confirm_y" name="timedeal_confirm" class="form-check-input" value="Y" <?=$checked['timedeal_confirm']['Y']?>>
												<label class="form-check-label" for="timedeal_confirm_y">Y</label>
											</div>
											<div class="form-check form-radio-dark form-check-inline">
												<input type="radio" id="timedeal_confirm_n" name="timedeal_confirm" class="form-check-input" value="N" <?=$checked['timedeal_confirm']['N']?>>
												<label class="form-check-label" for="timedeal_confirm_n">N</label>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer">
									<div class="text-end">
										<button type="submit" class="btn btn-primary shadow-none">타임딜 설정 저장</button>
									</div>
								</div>
							</div>
							
							<!-- 옵션상품 타임딜 진행이력 -->
							<div class="card">
								<div class="card-header bg-secondary text-white fw-bold font-15">타임딜 진행이력</div>
								<div class="card-body p-0">
									<table class="table table-bordered table-centered mb-0 table-sm">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">타임딜 회차</th>
												<th class="text-center">타임딜 진행기간</th>
												<th class="text-center">타임딜 진행수량</th>
												<th class="text-center">퍼블리셔 SRP</th>
												<th class="text-center">퍼블리셔 PRR</th>
												<th class="text-center">타임딜 판매가</th>
												<th class="text-center">타임딜 판매수량</th>
												<th class="text-center">타임딜 진행상태</th>
											</tr>
										</thead>
										<tbody>
										<?
											$num=1;
											foreach($timedeal_history as $timedeal){
												//실제 타임딜 판매수량
										?>
											<tr>
												<td class="text-center"><?=$num++?></td>
												<td class="text-center"><?=date('Y-m-d H:i:s',$timedeal['timedeal_start'])?> ~ <?=date('Y-m-d H:i:s',$timedeal['timedeal_end'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_stock'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_srp'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_ppr'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_price'])?></td>
												<td class="text-end"><?=number_format($timedeal['timedeal_order'])?></td>
												<td class="text-center"><?=$timedeal['timedeal_status']?></td>
											</tr>
										<?
											}
										?>
										</tbody>
									</table>
								</div>
							</div>
						</form>
						<?}?>
					</div>
				</div>

				<!-- end row -->   
				
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->
		
		<!--Asset 배송아이템 팝업-->
		<div id="asset-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="asset-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="max-width:1100px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="asset-modalLabel">Asset 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0 font-13">
						<form class="form-horizontal">
							<input type="hidden" name="product_code">
							<table class="table table-striped mb-0" id="asset_info">
							<thead class="table-dark font-12">
							<tr>
								<th class="text-center" style="width:80px">Asset Platform</th>
								<th class="text-center" style="width:80px">Asset Type</th>
								<th class="text-center" style="width:80px">Asset ID</th>
								<th class="text-center" style="width:300px">Asset name</th>
								<th class="text-center" style="width:150px">Asset Publisher</th>
								<th class="text-center" style="width:90px">비고</th>
							</tr>
							</thead>
							<tbody class="font-12">
							</tbody>
							</table>
						</form>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->
		
		<!--Ztorm 배송아이템 팝업-->
		<div id="ztorm-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="ztorm-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="width:1000px;max-width:1100px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="ztormmodalLabel">Ztorm 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0 font-13">
						<form class="form-horizontal">
							<input type="hidden" name="product_code">
							<table class="table table-striped mb-0" id="ztorm_info">
							<thead class="table-dark font-13">
							<tr>
								<th class="text-center" style="width:80px">플랫폼</th>
								<th class="text-center" style="width:80px">아이템 유형</th>
								<th class="text-center" style="width:80px">아이템 ID</th>
								<th class="text-center" style="width:300px">아이템 이름</th>
								<th class="text-center" style="width:100px">channel</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody class="font-13">
							</tbody>
							</table>
						</form>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->
		
		<!--Genba 배송아이템 팝업-->
		<div id="genba-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="genba-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="width:1200px;max-width:1200px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="genbamodalLabel">Genba 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0 font-13">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" value="">
							<table class="table table-striped mb-0 table-border" id="genba_info">
							<thead class="table-dark font-13">
							<tr>
								<th class="text-center" style="width:100px">플랫폼</th>
								<th class="text-center" style="width:250px">아이템 ID</th>
								<th class="text-center" style="width:300px">아이템 이름</th>
								<th class="text-center" style="width:100px">공급처</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody class="font-12">
							</tbody>
							</table>
						</form>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->
		
		<!--Vaultn 배송아이템 팝업-->
		<div id="vaultn-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="vaultn-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="width:1200px;max-width:1200px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="vaultnmodalLabel">Vaultn 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0 font-13">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" value="">
							<table class="table table-striped mb-0 table-border" id="vaultn_info">
							<thead class="table-dark font-13">
							<tr>
								<th class="text-center" style="width:100px">플랫폼</th>
								<th class="text-center" style="width:250px">아이템 ID</th>
								<th class="text-center" style="width:300px">아이템 이름</th>
								<th class="text-center" style="width:100px">공급처</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody class="font-12">
							</tbody>
							</table>
						</form>
					</div>
				</div>
			</div>
		</div>

		<!--PointNexus 배송아이템 팝업-->
		<div id="pointnexus-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="pointnexus-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="width:1200px;max-width:1200px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="pointnexusmodalLabel">PointNexus 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0 font-13">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" value="">
							<input type="hidden" name="mode" value="">
							<table class="table table-striped mb-0 table-border" id="pointnexus_info">
							<thead class="table-dark font-13">
							<tr>
								<th class="text-center" style="width:100px">플랫폼</th>
								<th class="text-center" style="width:250px">아이템 ID</th>
								<th class="text-center" style="width:300px">아이템 이름</th>
								<th class="text-center" style="width:100px">공급처</th>
								<th class="text-center" style="width:80px">type</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody class="font-12">
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

</div>
<!-- END wrapper -->

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>
//var simplemde = new SimpleMDE({ element: document.getElementById("description") });

$(document).ready(function(){
	$("#frm").submit(function( event ) {
	});
	
	//Asset 삭제
	$(".btn_delivery_item_delete").bind("click",function(){
		var index = $('.btn_delivery_item_delete').index(this);
		var product_code = $('.btn_delivery_item_delete').eq(index).attr("data-productcode");
		var item_id = $('.btn_delivery_item_delete').eq(index).attr("data-itemid");
		var order_system = $('.btn_delivery_item_delete').eq(index).attr("data-system");
		if(confirm("삭제하시겠습니까?")){
			$.ajax({
				 type: "POST",
				 url: "goods_option_ps.php",
				 data: {mode:"delivery_item_delete",product_code:product_code,item_id:item_id,order_system:order_system},
				 success: function (data, status) {
					location.reload();
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}
	});
	
	//Asset 검색
	$("#btn_asset_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var order_system = $("input[name='order_system']:checked").val();
		var search_value = $("#search_value").val();

		if(order_system=="" || order_system== null){
			alert("연동시스템을 선택해 주세요.");
			return;
		}

		if(search_value==""){
			alert("Asset ID를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"asset_search",order_system:order_system,search_value:search_value},
			 success: function (data, status) {
				$("#asset-modal input[name='product_code']").val(product_code);
				$("#asset-modal #asset_info tbody").html(data);
				$("#asset-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Asset 검색결과(Asset 구성추가)
	$(document).on('click', '#asset-modal .btn_asset_add', function(e){
		e.preventDefault();
		var index = $('.btn_asset_add').index(this);
		var product_code =  $("#asset-modal input[name='product_code']").val();
		var asset_id = $("#asset-modal input[name='asset_id[]']").eq(index).val();
		var asset_name = $("#asset-modal input[name='asset_name[]']").eq(index).val();
		var asset_type = $("#asset-modal input[name='asset_type[]']").eq(index).val();
		var asset_platform = $("#asset-modal input[name='asset_platform[]']").eq(index).val();
		var asset_publisher = $("#asset-modal input[name='asset_publisher[]']").eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"asset_add",product_code:product_code,asset_id:asset_id,asset_name:asset_name,asset_type:asset_type,asset_platform:asset_platform,order_system:"1",asset_publisher:asset_publisher},
			 success: function (data, status) {
				alert(data);
				$("#asset-modal").modal('hide');
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Ztorm 검색
	$("#btn_ztorm_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var order_system = $("input[name='order_system']:checked").val();
		var search_value = $("#search_value2").val();

		if(order_system=="" || order_system== null){
			alert("연동시스템을 선택해 주세요.");
			return;
		}

		if(search_value==""){
			alert("Ztorm ID를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"ztorm_search",order_system:order_system,search_value:search_value},
			 success: function (data, status) {
				$("#ztorm-modal input[name='product_code']").val(product_code);
				$("#ztorm-modal #ztorm_info tbody").html(data);
				$("#ztorm-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Ztorm 검색결과(Ztorm 구성추가)
	$(document).on('click', '#ztorm-modal .btn_ztorm_add', function(e){
		e.preventDefault();
		var index = $('.btn_ztorm_add').index(this);
		var product_code =  $("#ztorm-modal input[name='product_code']").val();
		var item_platform = $("#ztorm-modal input[name='item_platform[]']").eq(index).val();
		var item_type = $("#ztorm-modal input[name='item_type[]']").eq(index).val();
		var item_id = $("#ztorm-modal input[name='item_id[]']").eq(index).val();
		var item_name = $("#ztorm-modal input[name='item_name[]']").eq(index).val();
		var item_publisher = $("#ztorm-modal input[name='item_publisher[]']").eq(index).val();
		var providers_channel = $("#ztorm-modal input[name='providers_channel[]']").eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"ztorm_add",product_code:product_code,item_platform:item_platform,item_type:item_type,item_id:item_id,item_name:item_name,item_publisher:item_publisher,order_system:"2"},
			 success: function (data, status) {
				alert(data);
				$("#ztorm-modal").modal('hide');
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Genba 검색
	$("#btn_genba_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var order_system = $("input[name='order_system']:checked").val();
		var sku = $("#search_genba").val();

		if(order_system=="" || order_system== null){
			alert("연동시스템을 선택해 주세요.");
			return;
		}

		if(sku==""){
			alert("Genba SKU를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"genba_search",order_system:order_system,sku:sku},
			 success: function (data, status) {
				$("#genba-modal input[name='product_code']").val(product_code);
				$("#genba-modal #genba_info tbody").html(data);
				$("#genba-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Genba 검색결과(배송아이템 추가)
	$(document).on('click', '#genba-modal .btn_genba_add', function(e){
		e.preventDefault();
		var index = $('.btn_genba_add').index(this);
		var product_code =  $("#genba-modal input[name='product_code']").val();
		var item_id = $("#genba-modal input[name='item_id[]']").eq(index).val();
		var item_name = $("#genba-modal input[name='item_name[]']").eq(index).val();
		var item_platform = $("#genba-modal input[name='item_platform[]']").eq(index).val();
		var item_publisher = $("#genba-modal input[name='item_publisher[]']").eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"genba_add",product_code:product_code,item_id:item_id,item_name:item_name,item_platform:item_platform,item_publisher:item_publisher,order_system:"9"},
			 success: function (data, status) {
				alert(data);
				$("#genba-modal").modal('hide');
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Vaultn 검색
	$("#btn_vaultn_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var order_system = $("input[name='order_system']:checked").val();
		var sku = $("#search_vaultn").val();

		if(order_system=="" || order_system== null){
			alert("연동시스템을 선택해 주세요.");
			return;
		}

		if(sku==""){
			alert("Vaultn SKU를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"vaultn_search",order_system:order_system,sku:sku},
			 success: function (data, status) {
				$("#vaultn-modal input[name='product_code']").val(product_code);
				$("#vaultn-modal #vaultn_info tbody").html(data);
				$("#vaultn-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	$(document).on('click', '#vaultn-modal .btn_vaultn_add', function(e){
		e.preventDefault();
		var index = $('.btn_vaultn_add').index(this);
		var product_code =  $("#vaultn-modal input[name='product_code']").val();
		var item_id = $("#vaultn-modal input[name='item_id[]']").eq(index).val();
		var item_name = $("#vaultn-modal input[name='item_name[]']").eq(index).val();
		var item_platform = $("#vaultn-modal input[name='item_platform[]']").eq(index).val();
		var item_publisher = $("#vaultn-modal input[name='item_publisher[]']").eq(index).val();
		var item_type = $("#vaultn-modal input[name='item_type[]']").eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"vaultn_add",product_code:product_code,item_id:item_id,item_name:item_name,item_platform:item_platform,item_publisher:item_publisher,item_type:item_type,order_system:"8"},
			 success: function (data, status) {
				alert(data);
				$("#vaultn-modal").modal('hide');
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//PointNexus 검색
	$("#btn_pointnexus_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var order_system = $("input[name='order_system']:checked").val();
		var pn_mode = $("#pointnexus_mode").val();
		var productID = $("#search_pointnexus").val();

		if(order_system=="" || order_system== null){
			alert("연동시스템을 선택해 주세요.");
			return;
		}

		if(productID==""){
			alert("PointNexus productID를 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"pointnexus_search",order_system:order_system,pn_mode:pn_mode,productID:productID},
			 success: function (data, status) {
				$("#pointnexus-modal input[name='product_code']").val(product_code);
				$("#pointnexus-modal input[name='mode']").val(pn_mode);
				$("#pointnexus-modal #pointnexus_info tbody").html(data);
				$("#pointnexus-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//PointNexus 검색결과(배송아이템 추가)
	$(document).on('click', '#pointnexus-modal .btn_pointnexus_add', function(e){
		e.preventDefault();
		var index = $('.btn_pointnexus_add').index(this);
		var product_code =  $("#pointnexus-modal input[name='product_code']").val();
		var item_id = $("#pointnexus-modal input[name='item_id[]']").eq(index).val();
		var item_name = $("#pointnexus-modal input[name='item_name[]']").eq(index).val();
		var item_platform = $("#pointnexus-modal input[name='item_platform[]']").eq(index).val();
		var item_publisher = $("#pointnexus-modal input[name='item_publisher[]']").eq(index).val();
		var item_type = $("#pointnexus-modal input[name='item_type[]']").eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"pointnexus_add",product_code:product_code,item_id:item_id,item_name:item_name,item_platform:item_platform,item_publisher:item_publisher,item_type:item_type,order_system:"10"},
			 success: function (data, status) {
				alert(data);
				$("#pointnexus-modal").modal('hide');
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
