<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sub_sidebar_title['option'] = "active";
$sidebar_file="sidebar_goods.php";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);


$goods_item_data = array();
$goods_item_data2 = array();
$dlc_item_data = array();

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$adminGoods= new AdminGoods($conn);

	//대표상품 상세정보
	$query="select * from tbl_goods where title_id=:title_id";
	$stmt = $conn->prepare($query);
	$params = array(
		":title_id"=>$title_id
	);
	$stmt->execute($params);

	$title_data = $stmt->fetch();

	//관련 옵션상품 - 기본게임
	$option_game = $adminGoods->getTitleGameList($title_id);

	//관련 옵션상품 - 에디션
	$option_edition = $adminGoods->getTitleEditionList($title_id);

	//관련 옵션상품 - DLC
	$option_dlc = $adminGoods->getTitleDLCList($title_id);

	//관련 옵션상품 - 번들
	//$option_bundle = $adminGoods->getTitleBundleList($title_id);
	
	//관련 옵션상품 - 기타
	$option_etc = $adminGoods->getTitleEtcList($title_id);

	//관련 옵션상품 - 홀로모델
	$option_holomodels = $adminGoods->getTitleHolomodelsList($title_id);

	//관련 옵션상품 - 홀로모델 DLC
	$option_holomodelsdlc = $adminGoods->getTitleHolomodelsDLCList($title_id);

	//관련 옵션상품 - 홀로모델 에디션
	$option_holomodelsedition = $adminGoods->getTitleHolomodelsEditionList($title_id);

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
									<li class="breadcrumb-item active">관련상품 설정</li>
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
						<div class="card">
							<h5 class="card-header bg-secondary text-white">기본게임 진열설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="40%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션<br/>상품번호</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center" style="width:80px">플랫폼</th>
											<th class="text-center" style="width:90px">출시일</th>
											<th class="text-center">유형</th>
											<th class="text-center">공급처</th>
											<th class="text-center" style="width:140px">옵션상품<br/>가격정보</th>
											<th class="text-center">판매상태</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($option_game as $sub_value){
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=$adminGoods->getPlatformName($sub_value['product_platform'])?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-center"><?=$adminGoods->getGoodsOptionGameType($sub_value['game_type'])?><br/>(<?=$adminGoods->getGoodsOptionDisplayType($sub_value['display_type'])?>)</td>
											<td class="text-center"><?=$adminGoods->getPublisherName($sub_value['supplier_code'])?></td>
											<? if($sub_value['is_free']=="Y"){?>
											<td class="text-end">무료<br/><a href="<?=$sub_value['is_free_url']?>" target="_blank">무료URL 이동</a></td>
											<?}else{?>
											<td class="text-end">
												<div class="d-flex flex-column">
													<div><s class="text-muted font-11"><?=number_format($sub_value['consumer_price'])?> 원</s></div>
													<div>( <span class="text-danger"><span class="mdi mdi-arrow-down-bold"></span><?=$sub_value['discount']?>%</span> ) <span class="text-dark"><?=number_format($sub_value['price'])?> 원</span></div>
												</div>
											</td>
											<?}?>
											<td class="text-center">
											<?	
												switch($sub_value['status']){
													case "0":
														echo "판매중";
													break;
													case "1":
														echo "판매중지";
													break;
													case "2":
														echo "품절";
													break;
													case "9":
														echo "승인대기";
													break;
													case "3":
														echo "판매종료";
													break;
												}
											?>
											</td>
											<td class="text-center">
												<a href="goods_option_modify.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
												<a href="goods_option_sales_register.php?product_code=<?=$sub_value['product_code']?>&mode=modify" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
						<?php
							if(!$product_viewer){
						?>
												<a href="javascript:void(0);" class="action-icon option_game_delete" data-productcode="<?=$sub_value['product_code']?>" data-titleid="<?=$title_data['title_id']?>"> <i class="mdi mdi-delete"></i></a>
						<?php
							}
						?>
											</td>
										</tr>
										<?
											}
										?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-9">
										<input type="text" class="form-control" name="search_value"  id="search_value" placeholder="검색할 옵션상품명을 입력해 주세요" value="<?=$title_data['title_name']?>">
									</div>
									<div class="col-3">
										<button type="button" class="btn btn-dark shadow-none" id="btn_option_find" data-titleid="<?=$title_id?>">옵션상품 검색</button>
									</div>
								</div>
							</div>
						</div>
						
						<div class="card">
							<h5 class="card-header bg-secondary text-white">에디션 진열설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="40%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션<br/>상품번호</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center" style="width:80px">플랫폼</th>
											<th class="text-center" style="width:90px">출시일</th>
											<th class="text-center">유형</th>
											<th class="text-center">공급처</th>
											<th class="text-center" style="width:140px">옵션상품<br/>가격정보</th>
											<th class="text-center">판매상태</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($option_edition as $sub_value){
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=$adminGoods->getPlatformName($sub_value['product_platform'])?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-center"><?=$adminGoods->getGoodsOptionGameType($sub_value['game_type'])?><br/>(<?=$adminGoods->getGoodsOptionDisplayType($sub_value['display_type'])?>)</td>
											<td class="text-center"><?=$adminGoods->getPublisherName($sub_value['supplier_code'])?></td>
											<? if($sub_value['is_free']=="Y"){?>
											<td class="text-end">무료<br/><a href="<?=$sub_value['is_free_url']?>" target="_blank">무료URL 이동</a></td>
											<?}else{?>
											<td class="text-end">
												<div class="d-flex flex-column">
													<div><s class="text-muted font-11"><?=number_format($sub_value['consumer_price'])?> 원</s></div>
													<div>( <span class="text-danger"><span class="mdi mdi-arrow-down-bold"></span><?=$sub_value['discount']?>%</span> ) <span class="text-dark"><?=number_format($sub_value['price'])?> 원</span></div>
												</div>
											</td>
											<?}?>
											<td class="text-center">
											<?	
												switch($sub_value['status']){
													case "0":
														echo "판매중";
													break;
													case "1":
														echo "판매중지";
													break;
													case "2":
														echo "품절";
													break;
													case "9":
														echo "승인대기";
													break;
													case "3":
														echo "판매종료";
													break;
												}
											?>
											</td>
											<td class="text-center">
												<a href="goods_option_modify.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
												<a href="goods_option_sales_register.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
						<?php
							if(!$product_viewer){
						?>
												<a href="javascript:void(0);" class="action-icon option_edition_delete" data-productcode="<?=$sub_value['product_code']?>" data-titleid="<?=$title_data['title_id']?>"> <i class="mdi mdi-delete"></i></a>
						<?php
							}
						?>
											</td>
										</tr>
										<?
											}
										?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-9">
										<input type="text" class="form-control" name="search_value2"  id="search_value2" placeholder="검색할 옵션상품명을 입력해 주세요" value="<?=$title_data['title_name']?>">
									</div>
									<div class="col-3">
										<button type="button" class="btn btn-dark shadow-none" id="btn_option_edition_find" data-titleid="<?=$title_id?>">옵션상품 검색</button>
									</div>
								</div>
							</div>
						</div>
						
						<div class="card">
							<h5 class="card-header bg-secondary text-white">DLC 진열설정</h5>
							<div class="card-body p-0">
								<div class="p-2">
									<div class="row">
										<div class="col-9">
											<input type="text" class="form-control" name="search_value4"  id="search_value4" placeholder="검색할 옵션상품명을 입력해 주세요" value="<?=$title_data['title_name']?>">
										</div>
										<div class="col-3">
											<button type="button" class="btn btn-dark shadow-none" id="btn_option_find2" data-titleid="<?=$title_id?>">옵션상품 검색</button>
										</div>
									</div>
								</div>
								
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="40%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션<br/>상품번호</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center" style="width:80px">플랫폼</th>
											<th class="text-center" style="width:90px">출시일</th>
											<th class="text-center">유형</th>
											<th class="text-center">공급처</th>
											<th class="text-center" style="width:140px">옵션상품<br/>가격정보</th>
											<th class="text-center">판매상태</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
										<? 
										foreach($option_dlc as $key=>$sub_value){
											
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?><br/><?=$sub_value['product_name_en']?></td>
											<td class="text-center">
											<?	
												switch($sub_value['product_platform']){
													case "1":
														echo "Steam";
													break;
													case "34":
														echo "Epic";
													break;
													case "30":
														echo "Ubisoft Connect";
													break;
													case "33":
														echo "Bethesda";
													break;
												}
											?>
											</td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-center"><?=$adminGoods->getGoodsOptionGameType($sub_value['game_type'])?><br/>(<?=$adminGoods->getGoodsOptionDisplayType($sub_value['display_type'])?>)</td>
											<td class="text-center"><?=$adminGoods->getPublisherName($sub_value['supplier_code'])?></td>
											<? if($sub_value['is_free']=="Y"){?>
											<td class="text-end">무료<br/><a href="<?=$sub_value['is_free_url']?>" target="_blank">무료URL 이동</a></td>
											<?}else{?>
											<td class="text-end">
												<div class="d-flex flex-column">
													<div><s class="text-muted"><?=number_format($sub_value['consumer_price'])?> 원</s></div>
													<div>( <span class="text-danger"><span class="mdi mdi-arrow-down-bold"></span><?=$sub_value['discount']?>%</span> ) <span class="text-dark"><?=number_format($sub_value['price'])?> 원</span></div>
												</div>
											</td>
											<?}?>
											<td class="text-center">
											<?	
												switch($sub_value['status']){
													case "0":
														echo "판매중";
													break;
													case "1":
														echo "판매중지";
													break;
													case "2":
														echo "품절";
													break;
													case "9":
														echo "승인대기";
													break;
													case "3":
														echo "판매종료";
													break;
												}
											?></td>
											<td class="text-center">
												<a href="goods_option_modify.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
												<a href="goods_option_sales_register.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
						<?php
							if(!$product_viewer){
						?>
												<a href="javascript:void(0);" class="action-icon option_dlc_delete" data-productcode="<?=$sub_value['product_code']?>" data-titleid="<?=$title_data['title_id']?>"> <i class="mdi mdi-delete"></i></a>
						<?php
							}
						?>
											</td>
											
										</tr>
										<?	
											}
										?>
									</tbody>
								</table>
							</div>
						</div>
						
						<div class="card">
							<h5 class="card-header bg-secondary text-white">실물상품 진열설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="40%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션<br/>상품번호</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center" style="width:80px">플랫폼</th>
											<th class="text-center" style="width:90px">출시일</th>
											<th class="text-center">유형</th>
											<th class="text-center">공급처</th>
											<th class="text-center" style="width:140px">옵션상품<br/>가격정보</th>
											<th class="text-center">판매상태</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
										<? 
										foreach($option_etc as $key=>$sub_value){
											
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?><br/><?=$sub_value['product_name_en']?></td>
											<td class="text-center">
											<?	
												switch($sub_value['product_platform']){
													case "1":
														echo "Steam";
													break;
													case "34":
														echo "Epic";
													break;
													case "30":
														echo "Ubisoft Connect";
													break;
													case "33":
														echo "Bethesda";
													break;
												}
											?>
											</td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-center"><?=$adminGoods->getGoodsOptionGameType($sub_value['game_type'])?><br/>(<?=$adminGoods->getGoodsOptionDisplayType($sub_value['display_type'])?>)</td>
											<td class="text-center"><?=$adminGoods->getPublisherName($sub_value['supplier_code'])?></td>
											<? if($sub_value['is_free']=="Y"){?>
											<td class="text-end">무료<br/><a href="<?=$sub_value['is_free_url']?>" target="_blank">무료URL 이동</a></td>
											<?}else{?>
											<td class="text-end">
												<div class="d-flex flex-column">
													<div><s class="text-muted"><?=number_format($sub_value['consumer_price'])?> 원</s></div>
													<div>( <span class="text-danger"><span class="mdi mdi-arrow-down-bold"></span><?=$sub_value['discount']?>%</span> ) <span class="text-dark"><?=number_format($sub_value['price'])?> 원</span></div>
												</div>
											</td>
											<?}?>
											<td class="text-center">
											<?	
												switch($sub_value['status']){
													case "0":
														echo "판매중";
													break;
													case "1":
														echo "판매중지";
													break;
													case "2":
														echo "품절";
													break;
													case "9":
														echo "승인대기";
													break;
													case "3":
														echo "판매종료";
													break;
												}
											?></td>
											<td class="text-center">
												<a href="goods_option_modify.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
												<a href="goods_option_sales_register.php?product_code=<?=$sub_value['product_code']?>&mode=modify" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
						<?php
							if(!$product_viewer){
						?>
												<a href="javascript:void(0);" class="action-icon option_dlc_delete" data-productcode="<?=$sub_value['product_code']?>" data-titleid="<?=$title_data['title_id']?>"> <i class="mdi mdi-delete"></i></a>
						<?php
							}
						?>
											</td>
											
										</tr>
										<?	
											}
										?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-9">
										<input type="text" class="form-control" name="search_value5"  id="search_value5" placeholder="검색할 옵션상품명을 입력해 주세요" value="<?=$title_data['title_name']?>">
									</div>
									<div class="col-3">
										<button type="button" class="btn btn-dark shadow-none" id="btn_option_find4" data-titleid="<?=$title_id?>">옵션상품 검색</button>
									</div>
								</div>
							</div>
						</div>



						<div class="card">
							<h5 class="card-header bg-secondary text-white">홀로모델 진열설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="40%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션<br/>상품번호</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center" style="width:80px">플랫폼</th>
											<th class="text-center" style="width:90px">출시일</th>
											<th class="text-center">유형</th>
											<th class="text-center">공급처</th>
											<th class="text-center" style="width:140px">옵션상품<br/>가격정보</th>
											<th class="text-center">판매상태</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($option_holomodels as $sub_value){
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=$adminGoods->getPlatformName($sub_value['product_platform'])?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-center"><?=$adminGoods->getGoodsOptionGameType($sub_value['game_type'])?><br/>(<?=$adminGoods->getGoodsOptionDisplayType($sub_value['display_type'])?>)</td>
											<td class="text-center"><?=$adminGoods->getPublisherName($sub_value['supplier_code'])?></td>
											<? if($sub_value['is_free']=="Y"){?>
											<td class="text-end">무료<br/><a href="<?=$sub_value['is_free_url']?>" target="_blank">무료URL 이동</a></td>
											<?}else{?>
											<td class="text-end">
												<div class="d-flex flex-column">
													<div><s class="text-muted font-11"><?=number_format($sub_value['consumer_price'])?> 원</s></div>
													<div>( <span class="text-danger"><span class="mdi mdi-arrow-down-bold"></span><?=$sub_value['discount']?>%</span> ) <span class="text-dark"><?=number_format($sub_value['price'])?> 원</span></div>
												</div>
											</td>
											<?}?>
											<td class="text-center">
											<?	
												switch($sub_value['status']){
													case "0":
														echo "판매중";
													break;
													case "1":
														echo "판매중지";
													break;
													case "2":
														echo "품절";
													break;
													case "9":
														echo "승인대기";
													break;
													case "3":
														echo "판매종료";
													break;
												}
											?>
											</td>
											<td class="text-center">
												<a href="goods_option_modify.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
												<a href="goods_option_sales_register.php?product_code=<?=$sub_value['product_code']?>&mode=modify" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
						<?php
							if(!$product_viewer){
						?>
												<a href="javascript:void(0);" class="action-icon option_holomodels_delete" data-productcode="<?=$sub_value['product_code']?>" data-titleid="<?=$title_data['title_id']?>"> <i class="mdi mdi-delete"></i></a>
						<?php
							}
						?>
											</td>
										</tr>
										<?
											}
										?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-9">
										<input type="text" class="form-control" name="search_holomodels_value"  id="search_holomodels_value" placeholder="검색할 옵션상품명을 입력해 주세요" value="<?=$title_data['title_name']?>">
									</div>
									<div class="col-3">
										<button type="button" class="btn btn-dark shadow-none" id="btn_holomodels_find" data-titleid="<?=$title_id?>">옵션상품 검색</button>
									</div>
								</div>
							</div>
						</div>



						<div class="card">
							<h5 class="card-header bg-secondary text-white">홀로모델 DLC 진열설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="40%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션<br/>상품번호</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center" style="width:80px">플랫폼</th>
											<th class="text-center" style="width:90px">출시일</th>
											<th class="text-center">유형</th>
											<th class="text-center">공급처</th>
											<th class="text-center" style="width:140px">옵션상품<br/>가격정보</th>
											<th class="text-center">판매상태</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($option_holomodelsdlc as $sub_value){
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=$adminGoods->getPlatformName($sub_value['product_platform'])?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-center"><?=$adminGoods->getGoodsOptionGameType($sub_value['game_type'])?><br/>(<?=$adminGoods->getGoodsOptionDisplayType($sub_value['display_type'])?>)</td>
											<td class="text-center"><?=$adminGoods->getPublisherName($sub_value['supplier_code'])?></td>
											<? if($sub_value['is_free']=="Y"){?>
											<td class="text-end">무료<br/><a href="<?=$sub_value['is_free_url']?>" target="_blank">무료URL 이동</a></td>
											<?}else{?>
											<td class="text-end">
												<div class="d-flex flex-column">
													<div><s class="text-muted font-11"><?=number_format($sub_value['consumer_price'])?> 원</s></div>
													<div>( <span class="text-danger"><span class="mdi mdi-arrow-down-bold"></span><?=$sub_value['discount']?>%</span> ) <span class="text-dark"><?=number_format($sub_value['price'])?> 원</span></div>
												</div>
											</td>
											<?}?>
											<td class="text-center">
											<?	
												switch($sub_value['status']){
													case "0":
														echo "판매중";
													break;
													case "1":
														echo "판매중지";
													break;
													case "2":
														echo "품절";
													break;
													case "9":
														echo "승인대기";
													break;
													case "3":
														echo "판매종료";
													break;
												}
											?>
											</td>
											<td class="text-center">
												<a href="goods_option_modify.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
												<a href="goods_option_sales_register.php?product_code=<?=$sub_value['product_code']?>&mode=modify" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
						<?php
							if(!$product_viewer){
						?>
												<a href="javascript:void(0);" class="action-icon option_holomodelsdlc_delete" data-productcode="<?=$sub_value['product_code']?>" data-titleid="<?=$title_data['title_id']?>"> <i class="mdi mdi-delete"></i></a>
						<?php
							}
						?>
											</td>
										</tr>
										<?
											}
										?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-9">
										<input type="text" class="form-control" name="search_holomodelsdlc_value"  id="search_holomodelsdlc_value" placeholder="검색할 옵션상품명을 입력해 주세요" value="<?=$title_data['title_name']?>">
									</div>
									<div class="col-3">
										<button type="button" class="btn btn-dark shadow-none" id="btn_holomodelsdlc_find" data-titleid="<?=$title_id?>">옵션상품 검색</button>
									</div>
								</div>
							</div>
						</div>
						
						

						<div class="card">
							<h5 class="card-header bg-secondary text-white">홀로모델 에디션 진열설정</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="40%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">옵션<br/>상품번호</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center" style="width:80px">플랫폼</th>
											<th class="text-center" style="width:90px">출시일</th>
											<th class="text-center">유형</th>
											<th class="text-center">공급처</th>
											<th class="text-center" style="width:140px">옵션상품<br/>가격정보</th>
											<th class="text-center">판매상태</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12">
									<?
										foreach($option_holomodelsedition as $sub_value){
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=$adminGoods->getPlatformName($sub_value['product_platform'])?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-center"><?=$adminGoods->getGoodsOptionGameType($sub_value['game_type'])?><br/>(<?=$adminGoods->getGoodsOptionDisplayType($sub_value['display_type'])?>)</td>
											<td class="text-center"><?=$adminGoods->getPublisherName($sub_value['supplier_code'])?></td>
											<? if($sub_value['is_free']=="Y"){?>
											<td class="text-end">무료<br/><a href="<?=$sub_value['is_free_url']?>" target="_blank">무료URL 이동</a></td>
											<?}else{?>
											<td class="text-end">
												<div class="d-flex flex-column">
													<div><s class="text-muted font-11"><?=number_format($sub_value['consumer_price'])?> 원</s></div>
													<div>( <span class="text-danger"><span class="mdi mdi-arrow-down-bold"></span><?=$sub_value['discount']?>%</span> ) <span class="text-dark"><?=number_format($sub_value['price'])?> 원</span></div>
												</div>
											</td>
											<?}?>
											<td class="text-center">
											<?	
												switch($sub_value['status']){
													case "0":
														echo "판매중";
													break;
													case "1":
														echo "판매중지";
													break;
													case "2":
														echo "품절";
													break;
													case "9":
														echo "승인대기";
													break;
													case "3":
														echo "판매종료";
													break;
												}
											?>
											</td>
											<td class="text-center">
												<a href="goods_option_modify.php?product_code=<?=$sub_value['product_code']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
												<a href="goods_option_sales_register.php?product_code=<?=$sub_value['product_code']?>&mode=modify" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
						<?php
							if(!$product_viewer){
						?>
												<a href="javascript:void(0);" class="action-icon option_holomodelsedition_delete" data-productcode="<?=$sub_value['product_code']?>" data-titleid="<?=$title_data['title_id']?>"> <i class="mdi mdi-delete"></i></a>
						<?php
							}
						?>
											</td>
										</tr>
										<?
											}
										?>
									</tbody>
								</table>
							</div>
							<div class="card-footer">
								<div class="row">
									<div class="col-9">
										<input type="text" class="form-control" name="search_holomodelsedition_value"  id="search_holomodelsedition_value" placeholder="검색할 옵션상품명을 입력해 주세요" value="<?=$title_data['title_name']?>">
									</div>
									<div class="col-3">
										<button type="button" class="btn btn-dark shadow-none" id="btn_holomodelsedition_find" data-titleid="<?=$title_id?>">옵션상품 검색</button>
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

		<!--옵션상품 검색 팝업-->
		<div id="option-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="option-modalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" style="max-width:1100px">
				<div class="modal-content">
					<div class="modal-header modal-colored-header bg-primary">
						<h4 class="modal-title" id="option-modalLabel">옵션상품 검색결과</h4>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
					</div>
					<div class="modal-body p-0">
						<form class="form-horizontal">
							<input type="hidden" name="title_id" id="title_id">
							<table class="table table-border mb-0 table-sm" id="option_info">
							<thead class="table-dark font-14">
							<tr>
								<th class="text-center" style="width:80px">옵션상품<br/>번호</th>
								<th class="text-center" style="width:350px">옵션상품명<br/>(영문명)</th>
								<th class="text-center" style="width:100px">플랫폼</th>
								<th class="text-center" style="width:150px">퍼블리셔</th>
								<th class="text-center" style="width:150px">게임옵션<br/>(번들옵션)</th>
								<th class="text-center" style="width:100px">판매상태</th>
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

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	//옵션상품  game 검색
	$("#btn_option_find").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_value").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_game_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련 옵션상품 - 에디션 검색
	$("#btn_option_edition_find").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_value2").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_edition_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});


	//옵션상품 Bundle 검색
	$("#btn_option_find3").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_value3").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_bundle_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//옵션상품 dlc 검색
	$("#btn_option_find2").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_value4").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_dlc_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//옵션상품 기타 검색
	$("#btn_option_find4").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_value5").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_etc_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$("#btn_holomodels_find").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_holomodels_value").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodels_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$("#btn_holomodelsdlc_find").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_holomodelsdlc_value").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodelsdlc_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$("#btn_holomodelsedition_find").bind("click",function(){
		var title_id = $(this).attr("data-titleid");
		var search_value = $("#search_holomodelsedition_value").val();

		if(search_value==""){
			alert("검색할 옵션상품명을 입력해주세요.");
			return;
		}

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodelsedition_search",search_value:search_value,title_id:title_id},
			 success: function (data, status) {
				$("#option-modal input[name='title_id']").val(title_id);
				$("#option-modal #option_info tbody").html(data);
				$("#option-modal").modal('show');
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//기본게임 삭제
	$(".option_game_delete").bind("click",function(){
		var index = $(".option_game_delete").index(this);
		var title_id = $(".option_game_delete").eq(index).attr("data-titleid");
		var product_code = $(".option_game_delete").eq(index).attr("data-productcode");

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_game_delete",title_id:title_id,product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//에디션 삭제
	$(".option_edition_delete").bind("click",function(){
		var index = $(".option_edition_delete").index(this);
		var title_id = $(".option_edition_delete").eq(index).attr("data-titleid");
		var product_code = $(".option_edition_delete").eq(index).attr("data-productcode");

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_edition_delete",title_id:title_id,product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련 번들삭제
	$(".option_bundle_delete").bind("click",function(){
		var index = $(".option_bundle_delete").index(this);
		var title_id = $(".option_bundle_delete").eq(index).attr("data-titleid");
		var product_code = $(".option_bundle_delete").eq(index).attr("data-productcode");

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_bundle_delete",title_id:title_id,product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련 DLC 삭제
	$(".option_dlc_delete").bind("click",function(){
		var index = $(".option_dlc_delete").index(this);
		var title_id = $(".option_dlc_delete").eq(index).attr("data-titleid");
		var product_code = $(".option_dlc_delete").eq(index).attr("data-productcode");

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_dlc_delete",title_id:title_id,product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});


	//기본홀로모델 삭제
	$(".option_holomodels_delete").bind("click",function(){
		var index = $(".option_holomodels_delete").index(this);
		var title_id = $(".option_holomodels_delete").eq(index).attr("data-titleid");
		var product_code = $(".option_holomodels_delete").eq(index).attr("data-productcode");

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodels_delete",title_id:title_id,product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련 홀로모델 DLC 삭제
	$(".option_holomodelsdlc_delete").bind("click",function(){
		var index = $(".option_holomodelsdlc_delete").index(this);
		var title_id = $(".option_holomodelsdlc_delete").eq(index).attr("data-titleid");
		var product_code = $(".option_holomodelsdlc_delete").eq(index).attr("data-productcode");

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodelsdlc_delete",title_id:title_id,product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련 홀로모델 에디션 삭제
	$(".option_holomodelsedition_delete").bind("click",function(){
		var index = $(".option_holomodelsedition_delete").index(this);
		var title_id = $(".option_holomodelsedition_delete").eq(index).attr("data-titleid");
		var product_code = $(".option_holomodelsedition_delete").eq(index).attr("data-productcode");

		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodelsedition_delete",title_id:title_id,product_code:product_code},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});


	//관련상품 기본게임 설정
	$(document).on('click', '#option-modal .btn_option_add', function(e){
		e.preventDefault();
		var index = $('.btn_option_add').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_game_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련상품 에디션 설정
	$(document).on('click', '#option-modal .btn_option_edtion_add', function(e){
		e.preventDefault();
		var index = $('.btn_option_edtion_add').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_edition_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련상품 관련번들 설정
	$(document).on('click', '#option-modal .btn_option_add3', function(e){
		e.preventDefault();
		var index = $('.btn_option_add3').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_bundle_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련상품 DLC 설정
	$(document).on('click', '#option-modal .btn_option_add2', function(e){
		e.preventDefault();
		var index = $('.btn_option_add2').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_dlc_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//관련상품 Etc 설정
	$(document).on('click', '#option-modal .btn_option_add4', function(e){
		e.preventDefault();
		var index = $('.btn_option_add4').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_etc_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});


	//관련상품 홀로모델 설정
	$(document).on('click', '#option-modal .btn_holomodels_add', function(e){
		e.preventDefault();
		var index = $('.btn_holomodels_add').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodels_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련상품 홀로모델 DLC 설정
	$(document).on('click', '#option-modal .btn_holomodelsdlc_add', function(e){
		e.preventDefault();
		var index = $('.btn_holomodelsdlc_add').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodelsdlc_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
				//$("#package-modal").removeData('bs.modal').find(".modal-content").html('');
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//관련상품 홀로모델 에디션 설정
	$(document).on('click', '#option-modal .btn_holomodelsedition_add', function(e){
		e.preventDefault();
		var index = $('.btn_holomodelsedition_add').index(this);
		var title_id =  $("#option-modal #title_id").val();
		var product_code = $("#option-modal input[name='product_code[]']").eq(index).val();
		$.ajax({
			 type: "POST",
			 url: "title_ps.php",
			 data: {mode:"option_holomodelsedition_add",product_code:product_code,title_id:title_id},
			 success: function (data, status) {
				//alert(data);
				$("#option-modal").modal('hide');
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
