<?

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$search_product_code = filter_input(INPUT_GET, 'search_product_code', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_GET, 'search_product_name', FILTER_SANITIZE_STRING);
$search_product_name_en = filter_input(INPUT_GET, 'search_product_name_en', FILTER_SANITIZE_STRING);
$search_product_platform = filter_input(INPUT_GET, 'search_product_platform', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);
$search_product_type = filter_input(INPUT_GET, 'search_product_type', FILTER_SANITIZE_STRING);
$search_order_system = filter_input(INPUT_GET, 'search_order_system', FILTER_SANITIZE_STRING);

$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_is_free = filter_input(INPUT_GET, 'search_is_free', FILTER_SANITIZE_STRING);
$search_is_special = filter_input(INPUT_GET, 'search_is_special', FILTER_SANITIZE_STRING);
$search_is_package = filter_input(INPUT_GET, 'search_is_package', FILTER_SANITIZE_STRING);
$search_is_bundle = filter_input(INPUT_GET, 'search_is_bundle', FILTER_SANITIZE_STRING);
$search_age_limit = filter_input(INPUT_GET, 'search_age_limit', FILTER_SANITIZE_STRING);


if(!$page){
	$page=1;
}

$where = [];

if(isset($search_product_code) && $search_product_code<>""){
	$where[] = " goods_code='".$search_product_code."'";
}

if(isset($search_product_name) && $search_product_name<>""){
	$where[] = " goods_nm like '%".$search_product_name."%'";
}

if(isset($search_product_name_en) && $search_product_name_en<>""){
	$where[] = " goods_nm_en like '%".$search_product_name_en."%'";
}

if(isset($search_product_type) && $search_product_type<>""){
	$where[] = " product_type='".$search_product_type."'";
}

if(isset($search_status) && $search_status<>""){
	$where[] = " status='".$search_status."'";
}

if(isset($search_publisher_code) && $search_publisher_code<>""){
	$where[] = " publisher_code='".$search_publisher_code."'";
}

if(isset($search_supplier_code) && $search_supplier_code<>""){
	$where[] = " supplier_code='".$search_supplier_code."'";
}

if(isset($search_product_platform) && $search_product_platform<>""){
	$where[] = " product_platform='".$search_product_platform."'";
}

if(isset($search_is_free) && $search_is_free<>""){
	$where[] = " is_free='".$search_is_free."'";
}

if(isset($search_is_special) && $search_is_special<>""){
	$where[] = " is_special='".$search_is_special."'";
}


if(isset($search_age_limit) && $search_age_limit<>""){
	$where[] = " age_limit='".$search_age_limit."'";
}

if(isset($search_order_system) && $search_order_system<>""){
	$where[] = " order_system='".$search_order_system."'";
}

$selected['search_product_platform'][$search_product_platform] = "selected";
$selected['search_publisher_code'][$search_publisher_code] = "selected";
$selected['search_supplier_code'][$search_supplier_code] = "selected";
$selected['search_order_system'][$search_order_system] = "selected";

$checked['search_product_type'][$search_product_type] = "checked";
$checked['search_status'][$search_status] = "checked";
$checked['search_is_free'][$search_is_free]="checked";
$checked['search_is_special'][$search_is_special]="checked";
$checked['search_is_package'][$search_is_package]="checked";
$checked['search_is_bundle'][$search_is_bundle]="checked";
$checked['search_age_limit'][$search_age_limit]="checked";

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

//$where[] = " find_in_set(status,'0,1,9')";
	
$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}


try{  
	//$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$orderby = "goods_code desc";

	$admin= new AdminGoods($conn_dgkr); 
	$goods_option_list = $admin->getGoodsOptionList($page,$add_where,$orderby,$param);

	$checked['search_status'][$search_status] = "checked";

	//$publisher_data= $admin->getPublisherList();

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품관리</a></li>
									<li class="breadcrumb-item active">옵션상품 리스트</li>
								</ol>
							</div>
							<h4 class="page-title">옵션상품 리스트</h4>
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
									<div class="col-lg-2 mb-2">
										<div class="row">
											<label for="search_product_code" class="col-sm-5 col-form-labe col-form-label-sm bg-light border">옵션상품코드</label>
											<div class="col-sm-7">
												<input type="text" class="form-control form-control-sm" id="search_product_code" name="search_product_code" placeholder="옵션상품코드" value="<?=$search_product_code?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5 mb-2">
										<div class="row">
											<label for="search_product_name" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">상품옵션명(국문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_product_name" name="search_product_name" placeholder="상품옵션명(국문)" value="<?=$search_product_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5 mb-2">
										<div class="row">
											<label for="search_product_name_en" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">상품옵션명(영문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_product_name_en" name="search_product_name_en" placeholder="상품옵션명(영문)" value="<?=$search_product_name_en?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-3 mb-2">
										<div class="row">
											<label for="search_publisher_code" class="col-sm-4 col-form-labe col-form-label-sm bg-light border">퍼블리셔</label>
											<div class="col-sm-8">
												<select id="search_publisher_code" name="search_publisher_code" class="form-select">
													<option value="">:::선택:::</option>
													<?
														foreach($publisher_data as $value){
													?>
													<option value="<?=$value['publisher_code']?>" <?=$selected['search_publisher_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
													<?
														}
													?>
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
									<div class="col-lg-3 mb-2">
										<div class="row">
											<label for="search_order_system" class="col-sm-4 col-form-labe col-form-label-sm bg-light border">연동시스템</label>
											<div class="col-sm-8">
												<select id="search_order_system" name="search_order_system" class="form-select">
													<option value="">:::선택:::</option>
													<option value="1" <?=$selected['search_order_system']['1']?>>Asset - key</option>
													<option value="2" <?=$selected['search_order_system']['2']?>>Ztorm - key</option>
													<option value="3" <?=$selected['search_order_system']['3']?>>Ztorm - IPA</option>
													<option value="9" <?=$selected['search_order_system']['9']?>>Genba - key</option>
												</select>
											</div>
										</div>
									</div>
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
								</div>

								<div class="row">
									<div class="col-lg-7 mb-2">
										<div class="row">
											<label for="search_product_type" class="col-sm-2 col-form-labe col-form-label-sm bg-light border">옵션상품유형</label>
											<div class="col-sm-10 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_product_type1" name="search_product_type" class="form-check-input" value="1" <?=$checked['search_product_type']['1']?>>
													<label class="form-check-label" for="search_product_type1">기본게임</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_product_type2" name="search_product_type" class="form-check-input" value="2" <?=$checked['search_product_type']['2']?>>
													<label class="form-check-label" for="search_product_type2">기본게임+DLC번들</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_product_type8" name="search_product_type" class="form-check-input" value="8" <?=$checked['search_product_type']['8']?>>
													<label class="form-check-label" for="search_product_type8">기본게임 번들</label>
												</div>

												<div class="form-check form-check-inline">
													<input type="radio" id="search_product_type3" name="search_product_type" class="form-check-input" value="3" <?=$checked['search_product_type']['3']?>>
													<label class="form-check-label" for="search_product_type3">DLC</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_product_type4" name="search_product_type" class="form-check-input" value="4" <?=$checked['search_product_type']['4']?>>
													<label class="form-check-label" for="search_product_type4">DLC번들</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_product_type5" name="search_product_type" class="form-check-input" value="5" <?=$checked['search_product_type']['5']?>>
													<label class="form-check-label" for="search_product_type5">멀티팩</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_product_type6" name="search_product_type" class="form-check-input" value="6" <?=$checked['search_product_type']['6']?>>
													<label class="form-check-label" for="search_product_type6">랜덤박스</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<h6 class="col-sm-2 col-form-label col-form-label-sm bg-light border">판매상태</h6>
											<div class="col-sm-8 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="status_0" name="search_status" class="form-check-input" value="0" <?=$checked['search_status']['0']?>>
													<label class="form-check-label" for="status_0"><span class="badge badge-primary-lighten font-13">판매중</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="status_1" name="search_status" class="form-check-input"  value="1" <?=$checked['search_status']['1']?>>
													<label class="form-check-label" for="status_1"><span class="badge badge-warning-lighten font-13">판매중지</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="status_9" name="search_status" class="form-check-input"  value="9" <?=$checked['search_status']['9']?>>
													<label class="form-check-label" for="status_9"><span class="badge badge-secondary-lighten font-13">판매예정</span></label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-3 mb-2">
										<div class="row">
											<h6 class="col-sm-4 col-form-label col-form-label-sm bg-light border">번들구성유무</h6>
											<div class="col-sm-8 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_bundle_y" name="search_is_bundle" class="form-check-input" value="Y" <?=$checked['search_is_bundle']['Y']?>>
													<label class="form-check-label" for="search_is_bundle_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_bundle_n" name="search_is_bundle" class="form-check-input" value="N" <?=$checked['search_is_bundle']['N']?>>
													<label class="form-check-label" for="search_is_bundle_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<h6 class="col-sm-4 col-form-label col-form-label-sm bg-light border">패키지구성유무</h6>
											<div class="col-sm-8 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_package_y" name="search_is_package" class="form-check-input" value="Y" <?=$checked['search_is_package']['Y']?>>
													<label class="form-check-label" for="search_is_package_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_package_n" name="search_is_package" class="form-check-input" value="N" <?=$checked['search_is_package']['N']?>>
													<label class="form-check-label" for="search_is_package_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<h6 class="col-sm-4 col-form-label col-form-label-sm bg-light border">특전제공유무</h6>
											<div class="col-sm-8 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_special_y" name="search_is_special" class="form-check-input" value="Y" <?=$checked['search_is_special']['Y']?>>
													<label class="form-check-label" for="search_is_special_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_special_n" name="search_is_special" class="form-check-input" value="N" <?=$checked['search_is_special']['N']?>>
													<label class="form-check-label" for="search_is_special_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<h6 class="col-sm-4 col-form-label col-form-label-sm bg-light border">무료제공</h6>
											<div class="col-sm-8 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_free_y" name="search_is_free" class="form-check-input" value="Y" <?=$checked['search_is_free']['Y']?>>
													<label class="form-check-label" for="search_is_free_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_free_n" name="search_is_free" class="form-check-input" value="N" <?=$checked['search_is_free']['N']?>>
													<label class="form-check-label" for="search_is_free_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">상품옵션 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="d-flex flex-row justify-content-between mb-2">
							<div class="float-start"><? echo number_format($goods_option_list->total_results)?> 개</div>
						</div>
						<div class="card">
							<h5 class="card-header bg-secondary text-white">상품옵션 리스트</h5>
								<div class="table-responsive">
									<table class="table table-centered w-100 dt-responsive nowrap table-sm" id="">
										<thead class="table-light">
											<tr>
												<th class="all" style="width: 20px;">
													<div class="form-check">
														<input type="checkbox" class="form-check-input" id="customCheck1">
														<label class="form-check-label" for="customCheck1">&nbsp;</label>
													</div>
												</th>
												<th class="text-center" style="width:120px">상품코드</th>
												<th class="text-center">옵션명(국문)</br>옵션명(영문)</th>
												<th class="text-center" style="width:110px">연동시스템</th>
												<th class="text-center" style="width:90px">플랫폼</th>
												<th class="text-center" style="width:90px">출시일</th>
												<th class="text-center" style="width:80px">판매상태</th>
												<th class="text-center" style="width:80px">할인율</th>
												<th class="text-center" style="width:100px">가격</th>
												<th class="text-center" style="width:120px">비고</th>
											</tr>
										</thead>
										<tbody>
										<?
										if($goods_option_list->success == true){
											$result = $goods_option_list->resultset->fetchAll();

											foreach($result as $value){
												$is_promotion = "N";
										?>
											<tr>
												<td class="text-center">
													<div class="form-check">
														<input type="checkbox" class="form-check-input" id="customCheck2">
														<label class="form-check-label" for="customCheck2">&nbsp;</label>
													</div>
												</td>
												<td class="text-center">
													<?=$value['goods_code']?>
												</td>
												<td>
													<blockquote class="blockquote font-14 mb-0">
														<?=$value['goods_nm']?> 
														<small><?=$value['goods_nm_en']?></small><br/>
													</blockquote>
												</td>
												<td class="text-center">
													<span class="eng font-14"></span>
												</td>
												<td class="text-center"><?//=$admin->getProductPlatform($value['product_platform'])?></td>
												<td class="text-center"><?=$value['open_date']?></td>
												<td class="text-center">
													
												</td>
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
												<td class="text-center table-action">
													<button type="button" class="btn btn-outline-primary btn-sm btn_copy" data-goodscode="<?=$value['goods_code']?>">상품동기화</button>
												</td>
											</tr>
											<?	
													}
												}
											?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $goods_option_list->links_html;?></div>
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
			</div> <!-- container -->
		</div> <!-- content -->

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>
$(document).ready(function(){
	$(".btn_copy").bind("click",function(){
		var index = $(".btn_copy").index(this);
		var goods_code = $(".btn_copy").eq(index).attr("data-goodscode");
		$.ajax({
			 type: "POST",
			 url: "goods_sync.php",
			 data: {goods_code:goods_code},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
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
