<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$sub_sidebar_option['view'] = "active";

$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);

$goods_special_item = array();

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

	$goods_option_data = $stmt->fetch();

	//옵션상품 상세설명정보
	$query="select * from tbl_goods_item_description where product_code=:product_code";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$description_data = $stmt->fetch();

	//스크린샷
	$screenshot_data = $adminGoods->getProductScreenshotList($product_code);

	//옵션상품 번들구성 현황
	//if($goods_option_data['is_package']=="Y"){
		$special_query="select * from tbl_goods_item_package where product_code=:product_code order by item_type asc,appid asc";
		$stmt = $conn->prepare($special_query);
		$params = array(
			":product_code"=>$goods_option_data['product_code']
		);
		$stmt->execute($params);

		$goods_package_item = $stmt->fetchAll();

		if($goods_option_data['packageid']>0){
			$package_item_list = $admin->getSteamPackageItem_v2($goods_option_data['packageid']);
			//print_r($package_item_list);
		//	exit;

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

	//옵션상품 번들구성 목록
	$goods_item_package = $admin->getSteamPackageItem($goods_option_data['packageid']);

	//옵션상품 번들구성 목록
	$goods_item_bundle = $admin->getGoodsItemBundle($product_code);
	
	//Asset 설정
	$goods_delivery_list = $admin->getGoodsItemDeliveryList($product_code);


	//특전제공 정보
	$goods_bonus_info = $admin->getGoodsBonusInfo($product_code);
	
	if(date('Y-m-d',strtotime($goods_option_data['release_date']))>=date('Y-m-d')){
		$json_path =  "/home/dgkrshop/www/upload/apps/apps_".$goods_option_data['steam_appid']."_coming.json";
	}else{
		$json_path =  "/home/dgkrshop/www/upload/apps/apps_".$goods_option_data['steam_appid'].".json";
	}

	if(file_exists($json_path)){
		$json_string = file_get_contents($json_path);
		$json_data = json_decode($json_string, true);
		
		$publisher = $json_data[$goods_option_data['steam_appid']]['data']['publishers'];
		$developer = $json_data[$goods_option_data['steam_appid']]['data']['developers'];
		$genre = $json_data[$goods_option_data['steam_appid']]['data']['genres'];
		$category = $json_data[$goods_option_data['steam_appid']]['data']['categories'];
		$controller_support = $json_data[$goods_option_data['steam_appid']]['data']['controller_support'];
		//echo $header_image;
		//print_r($genre);
	}

	//옵션상품 대표상품 정보
	$title_info = $adminGoods->getTitleInfo($product_code);

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
									<li class="breadcrumb-item active">옵션상품 상세보기</li>
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
							<div class="col-12">
								<div class="row g-1">
									<div class="col-8">
										<!--기본정보-->
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 기본정보</h5>
											<div class="card-body p-2">
												<table class="table table-sm table-bordered border-secondary table-centered mb-0">
													<colgroup>
														<col width="20%">
														<col width="*">
													</colgroup>
													<tbody class="font-13">
														<tr>
															<th class="bg-light">옵션상품 코드</th>
															<td><?=$goods_option_data['product_code']?></td>
														</tr>
														<tr>
															<th class="bg-light">옵션상품 SKU</th>
															<td><?=$goods_option_data['goods_sku']?></td>
														</tr>
														<tr>
															<th class="bg-light">옵션상품명(국문)</th>
															<td><?=$goods_option_data['product_name']?></td>
														</tr>
														<tr>
															<th class="bg-light">옵션상품명(영문)</th>
															<td><?=$goods_option_data['product_name_en']?></td>
														</tr>
														<tr>
															<th class="bg-light">실물상품 모델코드</th>
															<td><?=$goods_option_data['model_code']?></td>
														</tr>
														<tr>
															<th class="bg-light">실물상품 모델명</th>
															<td><?=$goods_option_data['model_name']?></td>
														</tr>
														<tr>
															<th class="bg-light">옵션상품 플랫폼</th>
															<td>
																<span class='badge bg-dark font-12 fw-normal'>
																<?	
																	switch($goods_option_data['product_platform']){
																		case "1":
																			echo "Steam";
																		break;
																		case "3":
																			echo "Origin";
																		break;
																		case "34":
																			echo "Epic";
																		break;
																		case "30":
																			echo "Ubisoft Connect";
																		break;
																		case "33":
																			echo "Bethesda ";
																		break;
																		case "35":
																			echo "Rockstar Games Launcher ";
																		break;
																		case "32":
																			echo "기타";
																		break;
																	}
																?>
																	</span>
															</td>
														</tr>
														<?
															if($goods_option_data['genre']){
																$genre_data = explode(",",$goods_option_data['genre']);
														?>
														<tr>
															<th class="bg-light">옵션상품 장르</th>
															<td>
																<?
																	foreach($genre_data as $value){
																		echo "<span class='badge badge-dark-lighten font-12 me-2'>".$admin->getTagName($value)."</span>";
																	}
																?>
															</td>
														</tr>
														<?}?>
														<?
															if($goods_option_data['category']){
																$category_data = explode(",",$goods_option_data['category']);
														?>
														<tr>
															<th class="bg-light">옵션상품 카테고리</th>
															<td>
																<?
																	foreach($category_data as $value){
																		echo "<span class='badge badge-dark-lighten font-12 me-2'>".$admin->getTagName($value)."</span>";
																	}
																?>
															</td>
														</tr>
														<?}?>
														<tr>
															<th class="bg-light">옵션상품 출시일</th>
															<td><?=$goods_option_data['release_date']?></td>
														</tr>
														<tr>
															<th class="bg-light">옵션상품 유형</th>
															<td><?=$goods_option_data['option_type']?></td>
														</tr>
														<tr>
															<th class="bg-light">옵션상품 구분</th>
															<td><?=$goods_option_data['game_type']?></td>
														</tr>
														<tr>
															<th class="bg-light">배송방법</th>
															<td>
																<span class="badge badge-success-lighten font-12">
																<?
																	switch($goods_option_data['delivery_type']){
																		case "1":
																			echo "코드발송";
																		break;
																		case "2":
																			echo "택배발송";
																		break;
																		case "3":
																			echo "코드 + 택배발송";
																		break;
																	}
																	
																?>
																</span>
															</td>
														</tr>
														<?
														if($goods_option_data['option_type']<>"retail"){
														?>
														<tr>
															<th class="bg-light">진열그룹</th>
															<td><?=$goods_option_data['display_type']?></td>
														</tr>
														<?
																}
														?>
														<tr>
															<th class="bg-light">한국어지원</th>
															<td>
																<?=($goods_option_data['spoken_korean']=="Y")?"<span class='badge bg-secondary font-11 fw-normal'>음성 한국어</span>":""?> 
																<?=($goods_option_data['interface_korean']=="Y")?"<span class='badge bg-secondary font-11 fw-normal'>인터페이스/자막 한글</span>":""?> 
																<?=($goods_option_data['exclusive_korean']=="Y")?"<span class='badge bg-secondary font-11 fw-normal'>독점 한국어</span>":""?>
															</td>
														</tr>
														<tr>
															<th class="bg-light">진열상태</th>
															<td><?=$goods_option_data['is_view']?></td>
														</tr>
													</tbody>
												</table>
											</div>
											<div class="card-footer">
												<div class="float-end">
													<a href="goods_option_modify.php?product_code=<?=$product_code?>" class="btn btn-sm btn-primary shadow-none">기본정보 설정</a>
												</div>
											</div>
										</div>
										
										<!--대표상품정보-->
										<div class="card">
											<h5 class="card-header bg-secondary text-white">대표상품 정보</h5>
											<div class="card-body p-2">
												<div class="card mb-2">
													<div class="row g-0 align-items-center">
														<div class="col-md-4">
															<img src="/upload/title/<?=$title_info['title_id']?>/header/<?=$title_info['title_id']?>.jpg" class="img-fluid" alt="...">
														</div>
														<div class="col-md-8">
															<div class="card-body p-0 ps-2">
																<h5 class="card-title font-14 mb-2"><?=$title_info['title_name']?></h5>
																<p class="card-text mb-1"><small class="text-muted"><?=$title_info['title_name_en']?></small></p>
																<p class="card-text">
																	<span class='badge bg-info text-white font-11 fw-normal'><?=$title_info['publisher']?></span>
																	<span class='badge bg-dark font-11 fw-normal'><?=$title_info['release_date']?></span>
																</p>
															</div> <!-- end card-body-->
														</div> <!-- end col -->
													</div> <!-- end row-->
												</div>
											</div>
										</div>
										
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 스크린샷</h5>
											<div class="card-body p-2">
												<?if($screenshot_data['0']['url']){?>
												<div class="d-block mb-3 text-center"><img src="<?=$screenshot_data['0']['url']?>?t=1" class="img-fluid" style="max-width: 812px;" alt="스크린샷" id="screenshot"></div>
												<?}?>
												<div id="screenshot_thumbnail" >
													<div class="d-flex flex-row justify-content-start flex-nowrap mb-2">
														<? 
															$num="1";
															foreach($screenshot_data as $screenshot){
														?>
														<div class="text-center me-2">
															<div class="d-flex flex-column">
																<a href="javascript: void(0);">
																	<img src="<?=$screenshot['thumbnail']?>" class="img-fluid img-thumbnail p-0 thumbnail_list" style="max-width: 120px;" alt="스크린샷 썸네일" data-url="<?=$screenshot['url']?>">
																</a>
															</div>
														</div>
														<?
																$num++;
															}
														?>
													</div>
												</div>
											</div>
										</div>
										
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 설명</h5>
											<div class="card-body font-13">
												<div class="description">
													<?
													if($goods_option_data['is_package_view']=="Y"){
														//옵션상품 구성정보
														$query="select * from tbl_goods_option_bundle where product_code=:product_code order by unit_type asc,unit_name asc";
														$stmt = $conn->prepare($query);
														$params = array(
															":product_code"=>$product_code
														);
														$stmt->execute($params);

														$goods_item_package_info= $stmt->fetchAll();
														
														foreach($goods_item_package_info as $package_info){
															echo "<h4>".$package_info['unit_name']." 상세설명</h4>";
															if($package_info['unit_code']>'0'){
																$query="select description from tbl_goods_item_description where product_code=:product_code";
																$stmt = $conn->prepare($query);
																$params = array(
																	":product_code"=>$package_info['unit_code']
																);
																$stmt->execute($params);

																$goods_item_description = $stmt->fetch();
																echo $parsedown->text($goods_item_description['description']);
																echo "<hr/>";
															}
														}
													}else{
														echo $parsedown->text($description_data['description']);
													}
													?>
												</div>
											</div>
										</div>
										
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 시스템 요구사항</h5>
											<div class="card-body font-13">
												<?=$parsedown->text($description_data['requirements'])?>
											</div>
										</div>
										
									</div>
									<div class="col-4">
										<!--이미지정보-->
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 이미지정보</h5>
											<div class="card-body p-2">
												<?if($goods_option_data['game_type']<>'bundle' && $goods_option_data['bundle_type']<>'4'){?>
												<table class="table table-sm table-bordered border-secondary table-centered mb-0">
													<colgroup>
														<col width="30%">
														<col width="*">
													</colgroup>
													<tbody class="font-13">
														<tr>
															<th class="bg-light">이미지도메인</th>
															<td><?=$goods_option_data['domain']?></td>
														</tr>
														<tr>
															<td colspan="2" class="text-center p-0">
																<img src="/upload/product/<?=$goods_option_data['product_code']?>/header/header.jpg" class="img-fluid">
															</td>
														</tr>
														<tr>
															<td colspan="2" class="text-start">
																<?=$description_data['short_description']?>
															</td>
														</tr>
													</tbody>
												</table>
												<?}?>
											</div>
										</div>
										
										<!--판매정보-->
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 판매정보</h5>
											<div class="card-body p-2">
												<table class="table table-sm table-bordered border-secondary table-centered mb-0">
													<colgroup>
														<col width="30%">
														<col width="*">
													</colgroup>
													<tbody class="font-13">
														<tr>
															<th class="bg-light">판매상태</th>
															<td><?=$admin->getProductStatus($goods_option_data['status'])?></td>
														</tr>
														<tr>
															<th class="bg-light">구매제한여부</th>
															<td><?=$goods_option_data['purchase_limit_yn']?></td>
														</tr>
														<tr>
															<th class="bg-light">구매제한수량</th>
															<td>계정당 최대 <?=$goods_option_data['purchase_limit']?>개</td>
														</tr>
														<!--
														<tr>
															<th class="bg-light">판매기간</th>
															<td><?=date("Y-m-d H:i",$goods_option_data['start_date'])?> ~ <?=date("Y-m-d H:i",$goods_option_data['end_date'])?></td>
														</tr>
														-->
														<tr>
															<th class="bg-light">품절여부</th>
															<td><?=$goods_option_data['is_stock']?></td>
														</tr>
														<tr>
															<th class="bg-light">판매가능수량</th>
															<td><?=$goods_option_data['item_stock']?></td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
										
										<!--가격정보-->
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 가격정보</h5>
											<div class="card-body p-1">
												<table class="table table-sm table-bordered border-secondary table-centered mb-0">
													<colgroup>
														<col width="30%">
														<col width="*">
													</colgroup>
													<tbody class="font-13">
														<tr>
															<th class="bg-light">DGKR 소비자가</th>
															<td><?=number_format($goods_option_data['consumer_price'])?> 원</td>
														</tr>
														<tr>
															<th class="bg-light">DGKR 판매가</th>
															<td><?=number_format($goods_option_data['price'])?> 원</td>
														</tr>
														<tr>
															<th class="bg-light">DGKR 할인률</th>
															<td><span class="text-danger mdi mdi-arrow-down-bold"></span> <span class="text-danger"><?=number_format($goods_option_data['discount'])?> %</span></td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
										
										<!--공급처 정보-->
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 공급처정보</h5>
											<div class="card-body p-1">
												<table class="table table-sm table-bordered border-secondary table-centered mb-0">
													<colgroup>
														<col width="30%">
														<col width="*">
													</colgroup>
													<tbody class="font-13">
														<tr>
															<th class="bg-light">공급처</th>
															<td><?=$adminGoods->getPublisherName($goods_option_data['supplier_code'])?></td>
														</tr>
														<tr>
															<th class="bg-light">공급처 SRP</th>
															<td><?=number_format($goods_option_data['product_srp'])?> 원</td>
														</tr>
														<tr>
															<th class="bg-light">공급처 PPR</th>
															<td><?=number_format($goods_option_data['product_ppr'])?> 원</td>
														</tr>
														<tr>
															<th class="bg-light">공급처 RS</th>
															<td><?=$goods_option_data['product_rs']?> %</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
										
										<!--Steam 정보-->
										<div class="card">
											<h5 class="card-header bg-secondary text-white">옵션상품 Steam 정보</h5>
											<div class="card-body p-1">
												<table class="table table-sm table-bordered border-secondary table-centered mb-0">
													<colgroup>
														<col width="30%">
														<col width="*">
													</colgroup>
													<tbody class="font-13">
														<tr>
															<th class="bg-light">Steam APP ID</th>
															<td><?=$goods_option_data['steam_appid']?></td>
														</tr>
														<tr>
															<th class="bg-light">Steam Package ID</th>
															<td><?=$goods_option_data['packageid']?></td>
														</tr>
														<tr>
															<th class="bg-light">Steam Bundle ID</th>
															<td><?=$goods_option_data['bundleid']?></td>
														</tr>
														<tr>
															<th class="bg-light">Steam 퍼블리셔</th>
															<td></td>
														</tr>
														<tr>
															<th class="bg-light">Steam 개발사</th>
															<td></td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="col-12">
								<div class="row">
									<div class="col-4">
										
									</div>
									<div class="col-4">
										
									</div>
									<div class="col-4">

									</div>
								</div>
							</div>
							
							<div class="col-12">
								<!--배송아이템 정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">옵션상품 배송아이템</h5>
									<div class="card-body p-2">
										<table class="table table-bordered table-centered mb-0 table-sm caption-top">
											<caption class="py-1">배송아이템 세부정보</caption>
											<colgroup>
												<col style="width:80px"/>
												<col style="width:60px" />
												<col style="width:90px"/>
												<col style="width:280px"/>
												<col />
												<col style="width:70px"/>
												<col style="width:60px"/>
											</colgroup>
											<thead class="table-light font-13">
												<tr>
													<th class="text-center">연동시스템</th>
													<th class="text-center">플랫폼</th>
													<th class="text-center">아이템 유형</th>
													<th class="text-center">아이템 ID</th>
													<th class="text-center">아이템 이름</th>
													<th class="text-center">배송상태</th>
													<th class="text-center">비고</th>
												</tr>
											</thead>
											<tbody class="font-13">
											<?
												foreach($goods_delivery_list as $delivery_list){
													switch($delivery_list['order_system']){
														case "1"://Asset
															$delivery_item_platform = $delivery_list['item_platform'];
															$delivery_item_id =$delivery_list['item_id'];
															$delivery_item_type=$delivery_list['item_type'];
															$delivery_item_name =$delivery_list['item_name'];
														break;
														case "2"://Ztorm
															$delivery_item_platform = $delivery_list['item_platform'];
															$delivery_item_id =$delivery_list['item_id'];
															$delivery_item_name =$delivery_list['item_name'];
															$delivery_item_type=$delivery_list['item_type'];
														break;
														case "9": //Genba
															$delivery_item_id =$delivery_list['item_id'];
															$delivery_item_name =$delivery_list['item_name'];
															$delivery_item_platform = $delivery_list['item_platform'];
															$delivery_item_type=$delivery_list['item_type'];
														break;
														case "8": //Valutn
															$delivery_item_id =$delivery_list['item_id'];
															$delivery_item_name =$delivery_list['item_name'];
															$delivery_item_platform = $delivery_list['item_platform'];
															$delivery_item_type=$delivery_list['item_type'];
														break;
														case "10": //PointNexus
															$delivery_item_id =$delivery_list['item_id'];
															$delivery_item_name =$delivery_list['item_name'];
															$delivery_item_platform = $delivery_list['item_platform'];
															$delivery_item_type=$delivery_list['item_type'];
														break;
													}
											?>
											<tr>
												<td class="text-center"><?=$admin->getOrderSystem($delivery_list['order_system'])?></td>
												<td class="text-center"><?=$delivery_item_platform?></td>
												<td class="text-center"><?=$delivery_item_type?></td>
												<td class="text-center"><?=$delivery_item_id?></td>
												<td><?=$delivery_item_name?></td>
												<td class="text-center"><?=($delivery_list['flag']=="Y")?"배송중":"종료"?></td>
												<td class="text-center">
												<?if($delivery_list['flag']=="Y"){?>
												<button class="btn btn_link btn_delivery_delete" type="button" data-itemid="<?=$delivery_item_id?>" data-ordersystem="<?=$delivery_list['order_system']?>" data-productcode="<?=$goods_option_data['product_code']?>"><i class="mdi mdi-18px mdi-delete email-action-icons-item"></i></button>
												<?}?>
												</td>
											</tr>
											<?
												}
											?>
											</tbody>
										</table>
									</div>
								</div>
								
								<!--구성정보 정보-->
								<div class="card">
									<h5 class="card-header bg-secondary text-white">옵션상품 구성정보</h5>
									<div class="card-body p-2 font-13">
										<div class="d-flex justify-content-between align-self-baseline">
											<div class="px-2 py-1">
											<?
												if($goods_option_data['packageid']>0){
													$package_type="package";
													echo "Steam Package ID : ". $goods_option_data['packageid'];
													$package_item_sync = "Y";
													$bundle_item_sync = "N";
												}else{
													$package_item_sync = "N";
												}
											?>
											<?
												if($goods_option_data['bundleid']>0){
													$package_type="bundle";
													echo "Steam Bundle ID : ".$goods_option_data['bundleid'];
													$bundle_item_sync = "Y";
													$package_item_sync = "N";
												}else{
													$bundle_item_sync = "N";
												}
											?>
											</div>
											<div class="px-2 py-1">
												<?if($bundle_item_sync == "Y"){?>
												<button type="button" id="bundle_item_sync" class="btn btn-info btn-sm shadow-none" data-type="bundle" data-bundleid="<?=$goods_option_data['bundleid']?>">구성 동기화</button>
												<?}?>
												<?if($package_item_sync =="Y"){?>
												<button type="button" id="package_item_sync" class="btn btn-info btn-sm shadow-none" data-type="package" data-packageid="<?=$goods_option_data['packageid']?>">구성 동기화</button>
												<?}?>
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
														<th class="text-center" style="width:50px;">비고</th>
													</tr>
												</thead>
												<tbody>
												<? 
													$num = 1;
													$item_type = "";
													foreach($goods_package_item as $package){
												?>
												<tr>
													<td class="text-center"><?=$num++?></td>
													<td class="text-center">
													<?
														switch($package['item_type']){
															case "1":
																echo $package['appid'];
																$item_type ="Game";
															break;
															case "2":
																echo $package['appid'];
																$item_type ="DLC";
															break;
															case "3":
																echo $package['item_code'];
																$item_type ="패키지";
															break;
														}
													?>
													</td>
													<td class="text-center"><?=$item_type?></td>
													<td><?=$package['item_name']?></td>
													<td class="text-end">
														<?
																$steam_app_price = $steam->getSteamAppPrice($package['appid']);
																$initial = $steam_app_price['consumer_price']/100;
																echo number_format($initial);
														?>
													</td>
													<td class="text-center"><button type="button" class="btn btn-link action-icon btn_package_delete" data-no="<?=$package['package_srl']?>"> <i class="mdi mdi-delete"></i></button></td>
												</tr>
												<?
														$total_initial+=$initial;
													}
												?>
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
													<td class="text-center"><?=$sub_value['appid']?><input type='hidden' name='appid[]' value='<?=$sub_value['appid']?>'></td>
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
														<input type='hidden' name='item_type[]' value='<?=$item_type?>'>
													</td>
													<td class="text-start"><div class='form-floating mb-3 text-dark'><input type='text' class='form-control' name='item_name[]' placeholder='패키지 구성명(국문)을 입력해주세요' value="<?=$sub_value['app_name']?>"/><label for='floatingInput'><?=$sub_value['app_name']?></label></div></td>
													<td class="text-center">
														<button type="button" class="btn action-icon btn_package_save" data-productcode="<?=$goods_option_data['product_code']?>"><i class="mdi mdi-square-edit-outline"></i></button>
													</td>
												</tr>
												<?		}
														}
													}
												?>
												<?
													//print_r($package_item);
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
													<td class="text-center"><?=$sub_value['appid']?><input type='hidden' name='appid[]' value='<?=$sub_value['appid']?>'></td>
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
														<input type='hidden' name='item_type[]' value='<?=$item_type?>'>
													</td>
													<td class="text-start"><div class='form-floating mb-3 text-dark'><input type='text' class='form-control' name='item_name[]' value="<?=urldecode($sub_value['app_name'])?>" placeholder='번들 구성명(국문)을 입력해주세요' /><label for='floatingInput'><?=$sub_value['app_name']?></label></div></td>
													<td class="text-center">
														<button type="button" class="btn action-icon btn_package_save" data-productcode="<?=$goods_option_data['product_code']?>"><i class="mdi mdi-square-edit-outline"></i></button>
													</td>
												</tr>
												<?
															}
														}
														
														
													}
												?>
												<tr>
													<td colspan="4" class="text-center">합계</td>
													<td class="text-end"><?=number_format($total_initial)?></td>
													<td class=""></td>
												</tr>
												</tbody>
											</table>
										</div>
									</div>

									<div class="card-footer">
										<div class="row mb-0">
											<div class="col-2">
												<input type="text" class="form-control" id="add_appid" name="add_appid"  placeholder="appid">
											</div>
											<div class="col-2">
												<select id="add_item_type" name="add_item_type" class="form-select form-select-sm">
													<option value="">App Type</option>
													<option value="1">Game</option>
													<option value="2">DLC</option>
													<option value="3">Music</option>
												</select>
											</div>
												<div class="col-6">
												<input type="text" class="form-control form-control-sm" id="add_item_name" name="add_item_name"  placeholder="app_name">
											</div>
											<div class="col-2">
												<button type="button" class="btn btn-dark btn-sm shadow-none" id="btn_package_add" data-productcode="<?=$goods_option_data['product_code']?>" >구성추가</button>
											</div>
										</div>
									</div>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div> <!-- container -->
		</div> <!-- content -->
		
		<!--타이틀 검색 팝업-->
		<div id="title-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="title-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="max-width:900px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="bundle-modalLabel">대표상품 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" id="product_code">
							<table class="table table-striped table-border mb-0 table-sm" id="title_info">
							<thead class="table-dark">
							<tr>
								<th class="text-center" style="width:80px">대표상품<br/>코드</th>
								<th class="text-center" style="width:350px">대표상품명<br/>(영문)</th>
								<th class="text-center" style="width:150px">퍼블리셔</th>
								<th class="text-center" style="width:100px">비고</th>
							</tr>
							</thead>
							<tbody>
							</tbody>
							</table>
						</form>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->

		<!--Asset 배송아이템 팝업-->
		<div id="asset-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="asset-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="max-width:1000px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="asset-modalLabel">Asset 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0 font-13">
						<form class="form-horizontal">
							<input type="hidden" name="product_code">
							<table class="table table-striped mb-0" id="asset_info">
							<thead class="table-dark font-14">
							<tr>
								<th class="text-center" style="width:80px">Asset Platform</th>
								<th class="text-center" style="width:80px">Asset Type</th>
								<th class="text-center" style="width:80px">Asset ID</th>
								<th class="text-center" style="width:300px">Asset name</th>
								<th class="text-center" style="width:90px">비고</th>
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

		<!--패키지 구성정보-->
		<div id="package-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="package-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="package-modalLabel">패키지 구성 정보</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" id="product_code">
							<input type="hidden" name="steam_appid" id="steam_appid">
							<div id="package_info"></div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" id="btn_package_add">패키지 구성추가</button>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->

		<!--패키지 구성 추가 팝업-->
		<div class="modal fade" id="package-second-modal" aria-hidden="true" aria-labelledby="package-second-modal-label" tabindex="-1" role="dialog">
			<div class="modal-dialog modal-lg modal-dialog-centered" style="max-width:1000px">
				<div class="modal-content modal-filled bg-light">
					<div class="modal-header modal-colored-header bg-primary">
						<h5 class="modal-title" id="package-second-modal-label">패키지 구성추가</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body pb-0">
						<form class="form-horizontal">
							<input type="hidden" name="product_code" id="product_code">
							<div id="package_item_list"></div>
						</form>
					</div>
					<div class="modal-footer pt-0">
						<div class="text-end">
							<button class='btn btn-primary btn-sm' type='button' id="btn_package_item_all">전체추가</button>
						</div>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->

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
<script>

$(document).ready(function(){
	$(".thumbnail_list").bind("click",function(){
		var index = $(".thumbnail_list").index(this);
		var url = $(".thumbnail_list").eq(index).attr("data-url");
		$("#screenshot").attr("src",url);
	});
	
	//배송아이템 삭제 (Asset/Ztorm/Genba/Vaultn/PointNexus 공통)
	$(".btn_delivery_delete").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var item_id = $(this).attr("data-itemid");
		var order_system = $(this).attr("data-ordersystem");
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
		var providers_channel = $("#ztorm-modal input[name='providers_channel[]']").eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"ztorm_add",product_code:product_code,item_platform:item_platform,item_type:item_type,item_id:item_id,item_name:item_name,providers_channel:providers_channel,order_system:"2"},
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

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"asset_add",product_code:product_code,asset_id:asset_id,asset_name:asset_name,asset_type:asset_type,asset_platform:asset_platform,order_system:"1"},
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

	//구매특전 삭제
	$("#btn_bonus_delete").bind("click",function(){
		var product_code = $("#btn_bonus_delete").attr("data-productcode");
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"bonus_delete",product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//번들구성 삭제 
	$(".btn_bundle_delete").bind("click",function(){
		var index = $(".btn_bundle_delete").index(this);
		var bndl_no = $(".btn_bundle_delete").eq(index).attr("data-no");
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"bundle_delete",bndl_no:bndl_no},
			 success: function (data, status) {
				 location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//패키지 구성 삭제
	$(".btn_package_delete").bind("click",function(){
		var index = $(".btn_package_delete").index(this);
		var package_no = $(".btn_package_delete").eq(index).attr("data-no");
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"package_delete",package_no:package_no},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//패키지 구성 검색
	$("#btn_package_search").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var steam_appid = $(this).attr("data-appid");
		var package_type = $("#package_type option:selected").val();
		var search_package = $("#search_package").val();
		$("#package-second-modal input[name='product_code']").val(product_code);
		switch (package_type) {
			case "1":
				$.ajax({
					 type: "POST",
					 url: "goods_ps.php",
					 data: {mode:"package_item_search",product_code:product_code,steam_appid:steam_appid,package_type:package_type,search_package:search_package},
					 success: function (data, status) {
						$("#package_item_list").html(data);
						$("#package-second-modal").modal('show');
					 },
					error: function(data){
						 alert(data);
					 }
				});
			break;
			case "2":
				$.ajax({
					 type: "POST",
					 url: "goods_ps.php",
					 data: {mode:"package_item_search",product_code:product_code,steam_appid:steam_appid,package_type:package_type,search_package:search_package},
					 success: function (data, status) {
						$("#package_item_list").html(data);
						$("#package-second-modal").modal('show');
					 },
					error: function(data){
						 alert(data);
					 }
				});
			break;
			case "3":
				$.ajax({
					 type: "POST",
					 url: "goods_ps.php",
					 data: {mode:"package_item_search",product_code:product_code,steam_appid:steam_appid,package_type:package_type,search_package:search_package},
					 success: function (data, status) {
						$("#package_item_list").html(data);
						$("#package-second-modal").modal('show');
					 },
					error: function(data){
						 alert(data);
					 }
				});
			break;
			case "4":
				$.ajax({
					 type: "POST",
					 url: "goods_ps.php",
					 data: {mode:"package_item_search",product_code:product_code,steam_appid:steam_appid,package_type:package_type,search_package:search_package},
					 success: function (data, status) {
						$("#package_item_list").html(data);
						$("#package-second-modal").modal('show');
					 },
					error: function(data){
						 alert(data);
					 }
				});
			break;
		}
	});

	//패키지 구성저장
	$(".btn_package_save").bind("click",function(){
		var index = $('.btn_package_save').index(this);
		var product_code =  $(".btn_package_save").eq(index).attr("data-productcode");
		var item_type = $("input[name='item_type[]']").eq(index).val();
		var item_name = $("input[name='item_name[]']").eq(index).val();
		var appid = $("input[name='appid[]']").eq(index).val();
		var item_code = $("input[name='item_code[]']").eq(index).val();
		if(item_name==""){
			alert("패키지명(국문)을 입력하세요.");
			return;
		}
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"package_add",product_code:product_code,item_type:item_type,item_name:item_name,appid:appid,item_code:item_code},
			 success: function (data, status) {
				//alert(data);
				$("#package-second-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//번들 구성추가
	$("#btn_package_add").bind("click",function(){
		var product_code =  $("#btn_package_add").attr("data-productcode");
		var item_type = $("select[name='add_item_type'] option:selected").val();
		var item_name = $("input[name='add_item_name']").val();
		var appid = $("input[name='add_appid']").val();
		if(item_name==""){
			alert("패키지명(국문)을 입력하세요.");
			return;
		}
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"package_add",product_code:product_code,item_type:item_type,item_name:item_name,appid:appid},
			 success: function (data, status) {
				//alert(data);
				$("#package-second-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(document).on('click', '#package-second-modal .btn_package_item_add', function(e){
		e.preventDefault();
		var index = $('.btn_package_item_add').index(this);
		var product_code =  $("#package-second-modal #product_code").val();
		var item_type = $("#package-second-modal select[name='item_type[]']").eq(index).val();
		var item_name = $("#package-second-modal input[name='item_name[]']").eq(index).val();
		var appid = $("#package-second-modal input[name='appid[]']").eq(index).val();
		var item_code = $("#package-second-modal input[name='item_code[]']").eq(index).val();

		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"package_add",product_code:product_code,item_type:item_type,item_name:item_name,appid:appid,item_code:item_code},
			 success: function (data, status) {
				//alert(data);
				$("#package-second-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(document).on('click', '#package-second-modal #btn_package_item_all', function(e){
		e.preventDefault();
		var product_code =  $("#package-second-modal #product_code").val();
		var item_type,item_name,appid,item_code;

		$('#package-second-modal #package_item_list .row').each(function (index, item) {
			item_type = $("#package-second-modal select[name='item_type[]']").eq(index).val();
			item_name = $("#package-second-modal input[name='item_name[]']").eq(index).val();
			appid = $("#package-second-modal input[name='appid[]']").eq(index).val();
			item_code = $("#package-second-modal input[name='item_code[]']").eq(index).val();
			package_item_add(product_code,item_type,item_name,appid,item_code);
		});

		$("#package-second-modal").modal('hide');
		location.reload();
	});

	function package_item_add(product_code,item_type,item_name,appid,item_code){
		$.ajax({
			 type: "POST",
			 url: "goods_ps.php",
			 data: {mode:"package_add",product_code:product_code,item_type:item_type,item_name:item_name,appid:appid,item_code:item_code},
			 success: function (data, status) {
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	}

	//번들구성 스팀 동기화
	$("#bundle_item_sync").bind("click",function(){
		var bundleid =  $("#bundle_item_sync").attr("data-bundleid");
		if(bundleid<0){
			alert("Steam Bundle ID를 설정해 주세요");
			return;
		}
		$.ajax({
			 type: "POST",
			 url: "../steam/python/steam_bundle.py",
			 data: {bundleid:bundleid},
			 success: function (data, status) {
				 alert(data);
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//패키지구성 스팀 동기화
	$("#package_item_sync").bind("click",function(){
		var packageid =  $("#package_item_sync").attr("data-packageid");
		if(packageid<0){
			alert("Steam Package ID를 설정해 주세요");
			return;
		}
		$.ajax({
			 type: "POST",
			 url: "../steam/python/steam_package.py",
			 data: {packageid:packageid},
			 success: function (data, status) {
				//location.reload();
				alert(data);
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//대표상품 검색
	$("#btn_title_find").bind("click",function(){
		var product_code = $(this).attr("data-productcode");
		var search_value = $("#search_value2").val();
		if(search_value==""){
			alert("검색할 대표상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"title_search",search_value:search_value},
			 success: function (data, status) {
				$("#title-modal input[name='product_code']").val(product_code);
				$("#title-modal #title_info tbody").html(data);
				$("#title-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//대표상품 설정
	$(document).on('click', '#title-modal .btn_title_add', function(e){
		e.preventDefault();
		var index = $('.btn_title_add').index(this);
		var product_code =  $("#title-modal #product_code").val();
		var game_type="<?=$goods_option_data['game_type']?>";
		var bundle_type="<?=$goods_option_data['bundle_type']?>";
		var title_id = $("#title-modal input[name='title_id[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"title_add",product_code:product_code,title_id:title_id,game_type:game_type,bundle_type:bundle_type},
			 success: function (data, status) {
				//alert(data);
				$("#title-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
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
