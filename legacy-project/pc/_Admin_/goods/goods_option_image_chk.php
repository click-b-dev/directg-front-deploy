<?

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="옵션상품 Header 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);

$search_product_platform = filter_input(INPUT_GET, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_game_type = filter_input(INPUT_GET, 'search_game_type', FILTER_SANITIZE_STRING);

$search_sales_status = filter_input(INPUT_GET, 'search_sales_status', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);

$search_domain = filter_input(INPUT_GET, 'search_domain', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[] = " product_platform<>'3'";


if($search_value){
	switch($search_key){
		case "search_product_name":
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

if(isset($search_domain) && $search_domain<>""){
	if($search_domain=="Null"){
		$where[] = " domain is null";
	}else{
		$where[] = " domain='".$search_domain."'";
	}
	
}

$selected['search_product_platform'][$search_product_platform] = "selected";
$selected['search_key'][$search_key] = "selected";

$checked['search_status'][$search_status] = "checked";
$checked['search_domain'][$search_domain]="checked";
$checked['search_is_view'][$search_is_view]="checked";
$checked['search_sales_status'][$search_sales_status]="checked";


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
	$orderby = "product_code desc";

	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 
	$goods_option_list = $admin->getGoodsOptionList($page,$add_where,$orderby,$param,'20');

	$checked['search_status'][$search_status] = "checked";

	$publisher_data= $admin->getSupplierList();
	
	$delivery_system = array(
		"1"=>"Asset API",
		"2"=>"Ztorm API",
		"3"=>"Genba API",
		"4"=>"Valutn API",
	);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_key'][$search_key] = "selected";

$checked['search_is_view'][$search_is_view] = "checked";
$checked['search_sales_status'][$search_sales_status] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">옵션상품 이미지 관리</a></li>
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
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_product_name" <?=$selected['search_key']['search_product_name']?>>옵션상품명</option>
												<option value="search_product_code" <?=$selected['search_key']['search_product_code']?>>옵션상품코드</option>
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="row">
											<label for="search_domain" class="col-sm-4 col-form-label col-form-label-sm bg-light border">업로드 도메인</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_domain_all" name="search_domain" class="form-check-input" value="all" <?=$checked['search_domain']['all']?>>
													<label class="form-check-label" for="search_domain_all">전체</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_domain_1" name="search_domain" class="form-check-input" value="https://directg.net" <?=$checked['search_domain']['https://directg.net']?>>
													<label class="form-check-label" for="search_domain_1">웹서버</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_domain_2" name="search_domain" class="form-check-input" value="https://image.directg.net" <?=$checked['search_domain']['https://image.directg.net']?>>
													<label class="form-check-label" for="search_domain_2">디스크엔</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_domain_null" name="search_domain" class="form-check-input" value="Null" <?=$checked['search_domain']['Null']?>>
													<label class="form-check-label" for="search_domain_null">이미지 없음</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="search_is_view" class="col-sm-4 col-form-label col-form-label-sm bg-light border">옵션상품 진열</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_all" name="search_is_view" class="form-check-input" value="all" <?=$checked['search_is_view']['all']?>>
													<label class="form-check-label" for="search_is_view_all">전체</label>
												</div>
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
											<label for="search_status" class="col-sm-4 col-form-label col-form-label-sm bg-light border">판매상태</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_status_1" name="search_status" class="form-check-input" value="1" <?=$checked['search_status']['1']?>>
													<label class="form-check-label" for="search_status_1">승인대기</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_status_0" name="search_status" class="form-check-input" value="0" <?=$checked['search_status']['0']?>>
													<label class="form-check-label" for="search_status_0">판매중</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_status_3" name="search_status" class="form-check-input" value="3" <?=$checked['search_status']['3']?>>
													<label class="form-check-label" for="search_status_3">판매종료</label>
												</div>
											</div>
										</div>
									</div>
									
								</div>

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
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light table-striped" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center" style="width:100px">옵션상품코드</th>
									<th class="text-center" style="width:260px">SKU</th>
									<th class="text-center">옵션상품명</th>
									<th class="text-center" style="width:150px">플랫폼</th>
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
									<td class="text-center"><?=$value['product_code']?><br/>(<?=$value['steam_appid']?>)</td>
									<td class="text-center"><span class="font-12"><?=$value['goods_sku']?></span></td>
									<td>
											<?=$value['product_name']?> <span class="badge bg-secondary text-light"><?=$value['game_type']?></span> <span class="badge bg-secondary text-light"><?=$value['display_type']?></span><br/>
											<small>(<?=$value['product_name_en']?>)</small>
									</td>
									<td class="text-centertbl"><?=$adminGoods->getPlatformName($value['product_platform'])?></td>
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
												<a href="<?=$document_root?>/goods/goods_option_tag_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-tag me-1"></i>태그 설정</a>
												<a href="<?=$document_root?>/goods/goods_option_sales_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-store me-1"></i>판매 설정</a>
												<a href="<?=$document_root?>/goods/goods_option_bonus_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-store me-1"></i>특전제공 설정</a>
												<a href="<?=$document_root?>/goods/timedeal_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-sale mdi-18px me-1"></i>타임딜 설정</a>
												<a href="<?=$document_root?>/goods/goods_option_repay_register.php?product_code=<?=$value['product_code']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-sale mdi-18px me-1"></i>적립금 설정</a>
												
											</div>
										</div>
									</td>
								</tr>
								<tr>
									<td colspan="8">
										<table class="table table-sm">
											<colgroup>
												<col width="5%"/>
												<col width="10%"/>
												<col width="5%"/>
												<col width="15%"/>
												<col width="5%"/>
												<col width="15%"/>
											</colgroup>
											<tbody>
											<tr>
												<th class="text-center bg-light">도메인</th>
												<td><?=$value['domain']?>
												<?
													$header_path = $_SERVER['DOCUMENT_ROOT'].'/upload/product/'.$value['product_code'].'/header/header.jpg';
													if(file_exists($header_path)){
														if($value['domain']=="" || $value['domain']=="https://directg.net"){
															echo "<button type='button' class='btn btn-light btn-sm border btn_image_diskn' data-productcode='".$value['product_code']."'>디스크엔 등록</button>";
														}
													}
												?>
												</td>
												<th class="text-center bg-light">웹서버</th>
												<td><img src="/upload/product/<?=$value['product_code']?>/header/header.jpg?t=20251219" class="w-50"></td>
												<th class="text-center bg-light">디스크엔</th>
												<td><img src="https://image.directg.net/upload/product/<?=$value['product_code']?>/header/header.jpg?t=20260122" class="w-50"></td>
											</tr>
											</tbody>
										</table>
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
	
	//디스크엔 업로드 완료
	$(".btn_image_diskn").bind("click",function(){
		var index = $(".btn_image_diskn").index(this);
		var product_code = $(".btn_image_diskn").eq(index).attr("data-productcode");
		//return false;
		$.ajax({
			 type: "POST",
			 url: "goods_option_ps.php",
			 data: {mode:"diskn_upload_chk",product_code:product_code},
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
