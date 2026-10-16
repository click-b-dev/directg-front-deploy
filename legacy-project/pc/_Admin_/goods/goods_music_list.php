<?

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="[Music] 목록";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_GET, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_game_type = filter_input(INPUT_GET, 'search_game_type', FILTER_SANITIZE_STRING);

$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_is_free = filter_input(INPUT_GET, 'search_is_free', FILTER_SANITIZE_STRING);
$search_is_special = filter_input(INPUT_GET, 'search_is_special', FILTER_SANITIZE_STRING);
$search_is_package = filter_input(INPUT_GET, 'search_is_package', FILTER_SANITIZE_STRING);
$search_is_bundle = filter_input(INPUT_GET, 'search_is_bundle', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);

$search_interface_korean = filter_input(INPUT_GET, 'search_interface_korean', FILTER_SANITIZE_STRING);
$search_spoken_korean = filter_input(INPUT_GET, 'search_spoken_korean', FILTER_SANITIZE_STRING);
$search_exclusive_korean = filter_input(INPUT_GET, 'search_exclusive_korean', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[] = "status<>'3' and game_type='music' ";


if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " (product_name like '%".$search_value."%' or product_name_en like '%".$search_value."%')";
		break;
		case "search_product_code":
			$where[] = " product_code ='".$search_value."'";
		break;
	}
}

if(isset($search_status) && $search_status<>""){
	$where[] = " status='".$search_status."'";
}

if(isset($search_supplier_code) && $search_supplier_code<>""){
	$where[] = " supplier_code='".$search_supplier_code."'";
}

if(isset($search_product_platform) && $search_product_platform<>""){
	$where[] = " product_platform='".$search_product_platform."'";
}

if(isset($search_interface_korean) && $search_interface_korean<>""){
	$where[] = "interface_korean ='".$search_interface_korean."'";
}

if(isset($search_spoken_korean) && $search_spoken_korean<>""){
	$where[] = "spoken_korean ='".$search_spoken_korean."'";
}

if(isset($search_exclusive_korean) && $search_exclusive_korean<>""){
	$where[] = "exclusive_korean ='".$search_exclusive_korean."'";
}

if(isset($search_is_view) && $search_is_view<>""){
	$where[] = " is_view='".$search_is_view."'";
}

if(isset($search_is_free) && $search_is_free<>""){
	$where[] = " is_free='".$search_is_free."'";
}

if(isset($search_is_special) && $search_is_special<>""){
	$where[] = " is_special='".$search_is_special."'";
}

if(isset($search_game_type) && $search_game_type<>""){
	$where[] = " game_type='".$search_game_type."'";
}

if(isset($search_order_system) && $search_order_system<>""){
	$where[] = " order_system='".$search_order_system."'";
}

$selected['search_product_platform'][$search_product_platform] = "selected";
$selected['search_supplier_code'][$search_supplier_code] = "selected";
$selected['search_key'][$search_key] = "selected";

$checked['search_status'][$search_status] = "checked";
$checked['search_is_free'][$search_is_free]="checked";
$checked['search_is_view'][$search_is_view]="checked";
$checked['search_game_type'][$search_game_type]="checked";

$checked['search_spoken_korean'][$search_spoken_korean]="checked";
$checked['search_interface_korean'][$search_interface_korean]="checked";
$checked['search_exclusive_korean'][$search_exclusive_korean]="checked";


foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

//$where[] = " find_in_set(status,'0,1,9') ";
	
$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//$orderby = "release_date asc,reg_date asc";
	$orderby = "release_date desc,status desc";
	
	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 
	$goods_option_list = $admin->getGoodsOptionList($page,$add_where,$orderby,$param,'30');

	$checked['search_status'][$search_status] = "checked";

	$publisher_data= $admin->getSupplierList();
	
	$delivery_system = array(
		"1"=>"Asset API",
		"2"=>"Ztorm API",
		"9"=>"Genba API",
		"8"=>"Valutn API",
	);

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
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">옵션상품 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-lg-6 mb-2">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_name" <?=$selected['search_key']['search_name']?>>옵션상품명</option>
												<option value="search_product_code" <?=$selected['search_key']['search_product_code']?>>옵션상품명코드</option>
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="row">
											<h6 class="col-sm-2 col-form-label col-form-label-sm bg-light border">판매상태</h6>
											<div class="col-sm-10 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="status_9" name="search_status" class="form-check-input"  value="9" <?=$checked['search_status']['9']?>>
													<label class="form-check-label" for="status_9"><span class="badge badge-secondary-lighten font-13">승인대기</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="status_0" name="search_status" class="form-check-input" value="0" <?=$checked['search_status']['0']?>>
													<label class="form-check-label" for="status_0"><span class="badge badge-primary-lighten font-13">판매중</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="status_1" name="search_status" class="form-check-input"  value="1" <?=$checked['search_status']['1']?>>
													<label class="form-check-label" for="status_1"><span class="badge badge-warning-lighten font-13">판매중지</span></label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-3 mb-2">
										<div class="row">
											<label for="search_product_platform" class="col-sm-4 col-form-labe col-form-label-sm bg-light border">플랫폼</label>
											<div class="col-sm-8">
												<select id="search_product_platform" name="search_product_platform" class="form-select">
													<option value="">:::선택:::</option>
													<option value="1" <?=$selected['search_product_platform']['1']?>>Steam</option>
													<option value="34" <?=$selected['search_product_platform']['34']?>>Epic</option>
													<option value="30" <?=$selected['search_product_platform']['30']?>>Ubisoft Connect</option>
													<option value="35" <?=$selected['search_product_platform']['35']?>>Rockstar Games Launcher</option>
													<option value="33" <?=$selected['search_product_platform']['33']?>>Bethesda</option>
													<option value="3" <?=$selected['search_product_platform']['3']?>>Orgin</option>
													<option value="32" <?=$selected['search_product_platform']['32']?>>기타</option>
												</select>
											</div>
										</div>
									</div>
									
									<div class="col-lg-3 mb-2">
										<div class="row">
											<label for="search_supplier_code" class="col-sm-4 col-form-labe col-form-label-sm bg-light border">공급처</label>
											<div class="col-sm-8">
												<select id="search_supplier_code" name="search_supplier_code" class="form-select">
													<option value="">:::선택:::</option>
													<?
														foreach($publisher_data as $value){
													?>
													<option value="<?=$value['publisher_code']?>" <?=$selected['search_supplier_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-lg-6 mb-2">
										<div class="row">
											<label for="search_interface_korean" class="col-sm-2 col-form-label col-form-label-sm bg-light border">한국어 지원</label>
											<div class="col-sm-10 mt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_interface_korean_y" name="search_interface_korean" class="form-check-input" value="Y" <?=$checked['search_interface_korean']['Y']?>>
													<label class="form-check-label" for="search_interface_korean_y">인터페이스/자막</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_spoken_korean_y" name="search_spoken_korean" class="form-check-input" value="Y" <?=$checked['search_spoken_korean']['Y']?>>
													<label class="form-check-label" for="search_spoken_korean_y">음성</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_exclusive_korean_y" name="search_exclusive_korean" class="form-check-input" value="Y" <?=$checked['search_exclusive_korean']['Y']?>>
													<label class="form-check-label" for="search_exclusive_korean_y">독점</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-3">
										<div class="row mb-2">
											<label for="search_is_view" class="col-sm-4 col-form-label col-form-label-sm bg-light border">진열상태</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_y" name="search_is_view" class="form-check-input" value="Y" <?=$checked['search_is_view']['Y']?>>
													<label class="form-check-label" for="search_is_view_y">진열함</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_n" name="search_is_view" class="form-check-input" value="N" <?=$checked['search_is_view']['N']?>>
													<label class="form-check-label" for="search_is_view_n">진열안함</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_display_type" class="col-sm-3 col-form-label col-form-label-sm bg-light border">진열그룹</label>
											<div class="col-sm-9 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_display_type_game_bundle" name="search_display_type" class="form-check-input" value="game_bundle" <?=$checked['search_display_type']['game_bundle']?>>
													<label class="form-check-label" for="search_display_type_game_bundle">기본게임번들</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_display_type_dlc_bundle" name="search_display_type" class="form-check-input" value="dlc_bundle" <?=$checked['search_display_type']['dlc_bundle']?>>
													<label class="form-check-label" for="search_display_type_dlc_bundle">DLC번들</label>
												</div>

												<div class="form-check form-check-inline">
													<input type="radio" id="search_display_type_etc_bundle" name="search_display_type" class="form-check-input" value="etc_bundle" <?=$checked['search_display_type']['etc_bundle']?>>
													<label class="form-check-label" for="search_display_type_etc_bundle">기타번들</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_is_bonus" class="col-sm-4 col-form-label col-form-label-sm bg-light border">품절여부</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_soldout_y" name="search_soldout" class="form-check-input" value="Y" <?=$checked['search_soldout']['Y']?>>
													<label class="form-check-label" for="search_soldout_y">예</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-3">
										<div class="row">
											<label for="search_is_bonus" class="col-sm-4 col-form-label col-form-label-sm bg-light border">구매특전</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_bonus_y" name="search_is_bonus" class="form-check-input" value="Y" <?=$checked['search_is_bonus']['Y']?>>
													<label class="form-check-label" for="search_is_bonus_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_bonus_n" name="search_is_bonus" class="form-check-input" value="N" <?=$checked['search_is_bonus']['N']?>>
													<label class="form-check-label" for="search_is_bonus_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_is_preorder" class="col-sm-4 col-form-label col-form-label-sm bg-light border">예약판매</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_preorder_y" name="search_is_preorder" class="form-check-input" value="Y" <?=$checked['search_is_preorder']['Y']?>>
													<label class="form-check-label" for="search_is_preorder_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_preorder_n" name="search_is_preorder" class="form-check-input" value="N" <?=$checked['search_is_preorder']['N']?>>
													<label class="form-check-label" for="search_is_preorder_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<!--<div class="row ">
									<div class="col-lg-12">
										<div class="row">
											<label for="genre_code" class="col-sm-1 col-form-label col-form-label-sm bg-light border">게임장르</label>
											<div class="col-sm-11 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="genre_code" name="genre_code" class="form-check-input" value="G0001001" <?=$checked['genre_code']['G0001001']?>>
													<label class="form-check-label" for="genre_code1">G0001001</label>
												</div>
											</div>
										</div>
									</div>
								</div>-->

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">옵션상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($goods_option_list->total_results)?> 개</div>
					<div class="float-end"><div class="float-end"><a href="<?=$document_root?>/goods/goods_option_register.php" class="btn btn-danger shadow-none">옵션상품 등록</a></div></div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light table-striped" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center" style="width:100px">옵션상품코드</th>
									<th class="text-center" style="width:260px">SKU</th>
									<th class="text-center">옵션상품명</th>
									<th class="text-center" style="width:90px">플랫폼</th>
									<th class="text-center" style="width:90px">출시일</th>
									<th class="text-center" style="width:80px">판매상태</th>
									<th class="text-center" style="width:80px">할인율</th>
									<th class="text-center" style="width:100px">가격</th>
									<th class="text-center" style="width:100px">비고</th>
								</tr>
							</thead>
							<tbody>
							<?
							if($goods_option_list->success == true){
								$result = $goods_option_list->resultset->fetchAll();

								foreach($result as $value){
									$is_promotion = "N";
									
							?>
								<tr class="table-active">
									<td class="text-center"><?=$value['product_code']?></td>
									<td class="text-center"><span class="font-12"><?=$value['goods_sku']?></span></td>
									<td>
											<?=$value['product_name']?> <br/>
											<small>(<?=$value['product_name_en']?>)</small>
									</td>
									<td class="text-center"><?=$adminGoods->getPlatformName($value['product_platform'])?></td>
									<td class="text-center"><?=substr($value['release_date'],0,10)?></td>
									<td class="text-center"><?=$admin->getProductStatus($value['status'])?></td>
									<td class="text-end">
										<?
											if($value['is_free']=="N"){
										?>
										<?=$value['discount']?>%
										<?}?>
									</td>
									<td class="text-end">
									<?
										if($value['is_free']=="Y"){
									?>
									무료
									<?
										}else{
									?>
									<s class="text-muted"><?=number_format($value['consumer_price'])?>원</s><br/><span class="fs-5"><?=number_format($value['price'])?>원</span>
									<?
										}
									?>
									</td>
									<td class="text-center">
										<div class="dropdown card-widgets float-none">
											<a href="#" class="dropdown-toggle arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
												<i class="dripicons-dots-3"></i>
											</a>
											<div class="dropdown-menu dropdown-menu-end" style="">
												<a href="<?=$document_root?>/goods/goods_option_view.php?product_code=<?=$value['product_code']?>" class="dropdown-item"><i class="mdi mdi-eye mdi-18px me-1"></i>상세보기</a>
												<a href="<?=$document_root?>/goods/goods_option_modify.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>기본정보 설정</a>
												<a href="<?=$document_root?>/goods/goods_option_image_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-image me-1"></i>이미지 설정</a>
												<a href="<?=$document_root?>/goods/goods_option_sales_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-store me-1"></i>판매 설정</a>
												<a href="<?=$document_root?>/goods/goods_option_repay_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-sale mdi-18px me-1"></i>적립금 설정</a>
												
											</div>
										</div>
									</td>
								</tr>
								<tr>
									<td colspan="10">
											<div class="row">
											<div class="col-2">
												<figure class="figure">
													<img src="/upload/product/<?=$value['product_code']?>/header/header.jpg?t=<?=time()?>" class="img-fluid">
													<figcaption class="figure-caption"><?=$value['domain']?></figcaption>
												</figure>
											</div>
											<div class="col-10">
												<table class="table table-sm table-bordered">
													<tbody>
													<tr>
														<th class="text-center bg-light border-bottom">배송정보</th>
														<td colspan="9" class="bg-white">
															<table class='table table-centered w-100 table-sm table-bordered'>
																<thead class="font-13 table-light">
																<tr>
																	<th class="text-center">연동시스템</th>
																	<th class="text-center">아이템코드</th>
																	<th class="text-center">아이템명</th>
																	<th class="text-center">아이템 유형</th>
																	<th class="text-center">아이템 플랫폼</th>
																	<th class="text-center">아이템 공급처</th>
																	<th class="text-center">남은재고</th>
																</tr>
																</thead>
																<tbody class="font-12">
															<?
																$goods_delivery_list = $admin->getGoodsItemDeliveryList($value['product_code']);
															
																//print_r($goods_delivery_list);
																foreach($goods_delivery_list as $delivery_item){
																	echo "<tr>";
																	echo "<td class='text-center'>".$delivery_system[$delivery_item['order_system']]."</td>";
																	echo "<td class='text-center'>".$delivery_item['item_id']."</td>";
																	echo "<td>".$delivery_item['item_name']."</td>";
																	echo "<td class='text-center'>".$delivery_item['item_type']."</td>";
																	echo "<td class='text-center'>".$delivery_item['item_platform']."</td>";
																	echo "<td>".$delivery_item['item_publisher']."</td>";
																	if($delivery_item['order_system']=="1"){
																		echo "<td class='text-end'>".number_format($delivery_item['stock'])."</td>";
																	}else{
																		echo "<td class='text-center'>판매가능</td>";
																	}
																	
																	echo "</tr>";
																}
															?>
																<tr>
																	<th class="bg-light text-center">코드수령제한</th>
																	<td colspan="6">
																		<?
																			if($value['delivery_date']>0){
																				echo date("Y-m-d H:i:s",$value['delivery_date'])." 이후부터 수령가능";
																			}else{
																				echo "미설정";
																			}
																			
																		?>
																	</td>
																</tr>
																</tbody>
															</table>
														</td>
													</tr>
													<tr>
														<th class="text-center bg-light border-bottom">부가정보</th>
														<td class="bg-white">
															<?
																$title_info = $adminGoods->getTitleID($value['product_code']);
															?>
															<span class="badge badge-primary-lighten font-13"><?=$title_info['title_id']?></span>
															Steam Appid <span class="badge badge-info-lighten font-13"><?=$value['steam_appid']?></span>
															<?if($value['is_view']=="Y"){?><span class="badge badge-secondary-lighten font-13">진열함</span><?}else{?><span class="badge badge-secondary-lighten">진열안함</span><?}?>

																<?=($value['spoken_korean']=="Y")?"<span class='badge bg-secondary font-11 fw-normal'>음성 한국어</span>":""?> 
																<?=($value['interface_korean']=="Y")?"<span class='badge bg-secondary font-11 fw-normal'>인터페이스/자막 한글</span>":""?> 
																<?=($value['exclusive_korean']=="Y")?"<span class='badge bg-secondary font-11 fw-normal'>독점 한국어</span>":""?> 

															<? if($title_info['title_id']==""){?>
															<a href="title_register.php?title_mode=add_title&product_code=<?=$value['product_code']?>" class="btn btn-warning btn-sm text-white shadow-none">대표상품 등록</a>
															<?}?>
																<span class='badge bg-secondary font-11 fw-normal'><?=$value['option_type']?></span>
																<span class='badge bg-secondary font-11 fw-normal'><?=$value['game_type']?></span>
																<span class='badge bg-secondary font-11 fw-normal'><?=$value['display_type']?></span>
																<?=($value['soldout']=="Y")?"<span class='badge bg-success font-11 fw-normal'>품절</span>":""?> 
														</td>
													</tr>
													</tbody>
												</table>
											</div>
										</div>
									</td>
								</tr>
								<?	
										}
									}
								?>
							</tbody>
						</table>
						<div class="text-center mt-3"><?echo $goods_option_list->links_html;?></div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
			</div> <!-- container -->
		</div> <!-- content -->

	</div>

	<div id="bundle-modal" class="modal" tabindex="-1">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-danger">
					<h5 class="modal-title">번들 구성</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body p-1">
					<table class="table table-striped mb-0" id="bundle_list">
					<thead class="table-dark">
					<tr>
						<th class="text-center" style="width:80px">asset_id</th>
						<th class="text-center" style="width:70px">asset_type</th>
						<th class="text-center" style="width:80px">asset_platform</th>
						<th class="text-center" style="width:300px">asset_name</th>
					</tr>
					</thead>
					<tbody>
					</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	
	<div id="package-modal" class="modal" tabindex="-1">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-info">
					<h5 class="modal-title">패키지 구성</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body p-1">
					<table class="table table-striped mb-0" id="package_list">
					<thead class="table-dark">
					<tr>
						<th class="text-center" style="width:80px">appid</th>
						<th class="text-center" style="width:70px">item_type</th>
						<th class="text-center" style="width:300px">item_name</th>
					</tr>
					</thead>
					<tbody>
					</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	<!-- ============================================================== -->
	<!-- End Page content -->
	<!-- ============================================================== -->
</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script src="<?=$document_root?>/assets/js/vendor/jquery.dataTables.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.bootstrap5.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.responsive.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/responsive.bootstrap5.min.js"></script>

<script>
$(document).ready(function(){
	/*const myPopoverTrigger = document.getElementById('myPopover')
	myPopoverTrigger.addEventListener('show.bs.popover', () => {
	  // do something...
	})*/
	$(".btn_package_info").bind("click",function(){
		var index = $(".btn_package_info").index(this);
		var product_code = $(".btn_package_info").eq(index).attr("data-productcode");
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"package_list",product_code:product_code},
			 success: function (data, status) {
				$("#package-modal #package_list tbody").html(data);
				$("#package-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//번들구성 상세정보
	$(".btn_bundle_info").bind("click",function(){
		var index = $(".btn_bundle_info").index(this);
		var product_code = $(".btn_bundle_info").eq(index).attr("data-productcode");
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"bundle_list",product_code:product_code},
			 success: function (data, status) {
				$("#bundle-modal #bundle_list tbody").html(data);
				$("#bundle-modal").modal('show');
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
