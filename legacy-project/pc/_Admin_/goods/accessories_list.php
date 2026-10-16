<?
$page_title="실물상품 목록";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);

$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_sales_status = filter_input(INPUT_GET, 'search_sales_status', FILTER_SANITIZE_STRING);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);
$search_interface_korean = filter_input(INPUT_GET, 'search_interface_korean', FILTER_SANITIZE_STRING);
$search_spoken_korean = filter_input(INPUT_GET, 'search_spoken_korean', FILTER_SANITIZE_STRING);
$search_exclusive_korean = filter_input(INPUT_GET, 'search_exclusive_korean', FILTER_SANITIZE_STRING);

$search_age_limit = filter_input(INPUT_GET, 'search_age_limit', FILTER_SANITIZE_STRING);
$search_rateno = filter_input(INPUT_GET, 'search_rateno', FILTER_SANITIZE_STRING);
$search_orgname = filter_input(INPUT_GET, 'search_orgname', FILTER_SANITIZE_STRING);

$search_developer = filter_input(INPUT_GET, 'search_developer', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];
$param = "";

$where[]=" sales_status<>'E' and title_code='12'";

if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " (title_name like '%".$search_value."%' or title_name_en like '%".$search_value."%')";
		break;
		case "search_title_id":
			$where[] = " title_id ='".$search_value."'";
		break;
		case "search_title_sku":
			$where[] = " sku ='".$search_value."'";
		break;
		case "search_publisher":
			$where[] = " publisher like '%".$search_value."%'";
		break;
		case "search_developer":
			$where[] = " developer like '%".$search_value."%'";
		break;
	}
}

if(isset($search_sales_status) && $search_sales_status<>""){
	$where[] = "sales_status ='".$search_sales_status."'";
}


if(isset($search_is_view) && $search_is_view<>""){
	if($search_is_view<>"all"){
		$where[] = "is_view ='".$search_is_view."'";
	}
}else{
//	$where[] = "is_view ='Y'";
	$search_is_view = "all";
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

if(isset($search_rateno) && $search_rateno<>""){
	$where[] = "rateno ='".$search_rateno."'";
}

if(isset($search_orgname) && $search_orgname<>""){
	$where[] = "orgname ='".$search_orgname."'";
}

if(isset($search_age_limit) && $search_age_limit<>""){
	$where[] = " age_limit='".$search_age_limit."'";
}

//배열 변수 초기화
$checked['search_is_view'] = array ('all' => null, 'Y' => null,'N'=>null);
$checked['search_age_limit'] = array ('10' => null, '12' => null,'15'=>null,'18'=>null);
$checked['search_sales_status'] = array ('C' => null, 'S' => null,'E'=>null);
$checked['search_spoken_korean'] = array ('Y' => null, 'N' => null);
$checked['search_interface_korean'] = array ('Y' => null, 'N' => null);
$checked['search_exclusive_korean'] = array ('Y' => null, 'N' => null);


$checked['search_is_view'][$search_is_view] = "checked";
$checked['search_sales_status'][$search_sales_status] = "checked";
$checked['search_orgname'][$search_orgname] = "checked";
$checked['search_age_limit'][$search_age_limit]="checked";
$checked['search_spoken_korean'][$search_spoken_korean]="checked";
$checked['search_interface_korean'][$search_interface_korean]="checked";
$checked['search_exclusive_korean'][$search_exclusive_korean]="checked";

//$where[] = " game_rate is null";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$add_where = "";


	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = " title_id desc";

	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 

	$goods_list = $admin->getGoodsAccessoriesList($page,$add_where,$orderby,$param);

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
						<h5 class="card-header bg-secondary text-white">대표상품 검색필터</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_name" <?=$selected['search_key']['search_name']?>>대표상품명</option>
												<option value="search_title_id" <?=$selected['search_key']['search_title_id']?>>대표상품명코드</option>
												<option value="search_publisher" <?=$selected['search_key']['search_publisher']?>>퍼블리셔</option>
												<option value="search_developer" <?=$selected['search_key']['search_developer']?>>개발사</option>
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="row">
											<h6 class="col-sm-2 col-form-label col-form-label-sm bg-light border">심의등급</h6>
											<div class="col-sm-10 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_10" name="search_age_limit" class="form-check-input" value="10" <?=$checked['search_age_limit']['10']?>>
													<label class="form-check-label" for="search_age_limit_10"><span class='badge bg-success font-13 fw-normal'>전체이용가</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_12" name="search_age_limit" class="form-check-input" value="12" <?=$checked['search_age_limit']['12']?>>
													<label class="form-check-label" for="search_age_limit_12"><span class='badge bg-primary font-13 fw-normal'>12세이용가</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_15" name="search_age_limit" class="form-check-input" value="15" <?=$checked['search_age_limit']['15']?>>
													<label class="form-check-label" for="search_age_limit_15"><span class='badge bg-warning font-13 fw-normal'>15세이용가</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_19" name="search_age_limit" class="form-check-input" value="19" <?=$checked['search_age_limit']['19']?>>
													<label class="form-check-label" for="search_age_limit_19"><span class='badge bg-danger font-13 fw-normal'>청소년이용불가</span></label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="search_is_view" class="col-sm-4 col-form-label col-form-label-sm bg-light border">게임 페이지 노출</label>
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
											<label for="search_sales_status" class="col-sm-4 col-form-label col-form-label-sm bg-light border">판매상태</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_sales_status_c" name="search_sales_status" class="form-check-input" value="C" <?=$checked['search_sales_status']['C']?>>
													<label class="form-check-label" for="search_sales_status_c">판매예정</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_sales_status_s" name="search_sales_status" class="form-check-input" value="S" <?=$checked['search_sales_status']['S']?>>
													<label class="form-check-label" for="search_sales_status_s">판매중</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_sales_status_e" name="search_sales_status" class="form-check-input" value="E" <?=$checked['search_sales_status']['E']?>>
													<label class="form-check-label" for="search_sales_status_e">판매종료</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">대표상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($goods_list->total_results)?> 개</div>
						
						<div class="float-end"><a href="<?=$document_root?>/goods/title_register.php" class="btn btn-danger shadow-none">대표상품 등록</a></div>
					</div>
				</div>
				
				<?
					if($goods_list->success == true){
						$result = $goods_list->resultset->fetchAll();

						foreach($result as $value){
				?>
				<div class="card">
					<div class="card-header p-2">
						<div class="dropdown card-widgets">
							<a href="#" class="dropdown-toggle arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
								<i class="dripicons-dots-3"></i>
							</a>
							<div class="dropdown-menu dropdown-menu-end" style="">
								<a href="<?=$document_root?>/goods/title_view.php?title_id=<?=$value['title_id']?>" class="dropdown-item"><i class="mdi mdi-18px mdi-eye me-1"></i>자세히보기</a>
								<a href="<?=$document_root?>/goods/title_modify.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>기본정보 설정</a>
								<a href="<?=$document_root?>/goods/title_attribute_set_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>상품정보 제공고시 설정</a>
								<a href="<?=$document_root?>/goods/title_tag_register.php?title_id=<?=$value['title_id']?>&title_code=12&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-tag me-1"></i>태그정보 설정</a>
								<a href="<?=$document_root?>/goods/title_media_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>동영상 설정</a>
								<a href="<?=$document_root?>/goods/title_screenshot_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>스크린샷 설정</a>
								<a href="<?=$document_root?>/goods/title_image_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-image me-1"></i>이미지 설정</a>
								<a href="<?=$document_root?>/goods/title_description_register_v2.php?mode=modify&title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-alert-box me-1"></i>상세설명 설정</a>
								<a href="<?=$document_root?>/goods/title_option_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>관련상품 설정</a>
								
							</div>
						</div>
						<div class="d-flex align-items-start">
							<div class="w-100 overflow-hidden">
								<h5 class="card-title"><?=$value['title_name']?> <small  class="card-subtitle text-muted fw-normal">(<?=$value['title_name_en']?>)</small> <span class="text-muted">[<?=$value['sku']?>]</span></h5>
							</div>
						</div>
					</div>
					<div class="card-body p-0">
						<div class="title-container">
							<div class="title-a">
								<!--<img src="/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg?t=<?=time()?>" class="">-->
								<div class="p-2">
									<table class="table table-centered table-sm table-bordered border caption-top mb-1">
										<caption class="py-1">대표상품 기본정보</caption>
										<tbody class="font-12">
										<tr>
											<th class="table-light font-13" style="width:100px">대표상품번호</th>
											<td><?=$value['title_id']?></td>
										</tr>
										<tr>
											<th class="table-light font-13" style="width:80px">퍼블리셔</th>
											<td><?=$value['publisher']?></td>
										</tr>
										<tr>
											<th class="table-light font-13" style="width:80px">제조사</th>
											<td><?=$value['developer']?></td>
										</tr>
										</tbody>
									</table>
							
									<table class="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
										<caption class="py-1">대표상품 진열정보</caption>
										<tbody class="font-13">
										<tr>
											<th class="table-light" style="width:100px">진열상태</th>
											<td><?=$value['is_view']?></td>
										</tr>
										<tr>
											<th class="table-light">판매상태</th>
											<td>
												<?

													switch($value['sales_status']){
														case "C":
															echo "[판매예정]";
														break;
														case "S":
															echo "[판매중]";
														break;
														case "E":
															echo "[판매종료]";
														break;
													}
												?>
											</td>
										</tr>
										</tbody>
									</table>
									
									<table class="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
										<caption class="py-1">대표상품 태그정보</caption>
										<tbody class="font-13">
											<tr>
												<th class="table-light" style="width:100px">카테고리</th>
												<td>
													<?
													$title_category = explode(",",$value['category']);
													foreach($title_category as $category){
														echo "<span class='badge bg-info font-12 fw-normal me-2 mb-1'>".$admin->getTagName($category)."</span>";
													}
													?>
												</td>
											</tr>
										</tbody>
									</table>
									
									<table class="table table-centered w-100 nowrap table-sm table-bordered border caption-top mb-1">
										<caption class="py-1">관련옵션상품</caption>
										<thead class="table-secondary font-13">
										<tr>
											<th class="text-center" style="width:100px">옵션구분</th>
											<th class="text-center">판매예정</th>
											<th class="text-center">판매중</th>
											<th class="text-center">판매종료</th>
										</tr>
										</thead>
										<tbody class="font-12">
											<tr>
												<th class="bg-light">택배발송</th>
												<td class="text-center"><?=number_format($adminGoods->getGoodsAccessoriesCount($value['title_id'],'9','2'))?></td>
												<td class="text-center"><?=number_format($adminGoods->getGoodsAccessoriesCount($value['title_id'],'0','2'))?></td>
												<td class="text-center"><?=number_format($adminGoods->getGoodsAccessoriesCount($value['title_id'],'3','2'))?></td>
											</tr>
											<tr>
												<th class="bg-light">코드+택배발송</th>
												<td class="text-center"><?=number_format($adminGoods->getGoodsAccessoriesCount($value['title_id'],'9','3'))?></td>
												<td class="text-center"><?=number_format($adminGoods->getGoodsAccessoriesCount($value['title_id'],'0','3'))?></td>
												<td class="text-center"><?=number_format($adminGoods->getGoodsAccessoriesCount($value['title_id'],'3','3'))?></td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div class="title-b">
								<div class="p-2">
									<?
										//품목별 재화 등에 관한 정보 (상품 정보 제공 고시)
										$query="select * from tbl_title_attribute_set where title_id=:title_id";
										$stmt = $conn->prepare($query);
										$params = array(
											":title_id"=>$value['title_id']
										);
										$stmt->execute($params);
										$attribute_data = $stmt->fetch();
									?>
									<table class="table table-centered w-100 nowrap table-sm table-bordered border caption-top mb-1">
										<caption class="py-1">상품정보제공고시</caption>
										<colgroup>
											<col width="20%"/>
											<col width="*"/>
										</colgroup>
										<tbody class="font-12">
											<tr>
												<th class="bg-light">모델명</th>
												<td><?=$attribute_data['model_name']?></td>
											</tr>
											<tr>
												<th class="bg-light">품명</th>
												<td><?=$attribute_data['product_name']?></td>
											</tr>
											<tr>
												<th class="bg-light">KC 인증정보</th>
												<td><?=$attribute_data['kc_safety_infomartion']?> <a href="https://www.rra.go.kr/ko/license/A_b_popup_keyno.do?key_no=<?=$attribute_data['kc_safety_infomartion']?>" target="_blank" class="btn btn-sm btn-light font-12 shadow-none border">인증정보 확인</a></td>
											</tr>
											<tr>
												<th class="bg-light">정격전압</th>
												<td><?=$attribute_data['rated_voltage']?></td>
											</tr>
											<tr>
												<th class="bg-light">소비전력</th>
												<td><?=$attribute_data['power']?></td>
											</tr>
											<tr>
												<th class="bg-light">크기(mm)</th>
												<td><?=$attribute_data['size']?></td>
											</tr>
											<tr>
												<th class="bg-light">무게(kg)</th>
												<td><?=$attribute_data['weight']?></td>
											</tr>
											<tr>
												<th class="bg-light">동일모델의 출시년월</th>
												<td><?=$attribute_data['manufacturing_date']?></td>
											</tr>
											<tr>
												<th class="bg-light"> 제조자/수입자</th>
												<td><?=$attribute_data['manufacturer']?></td>
											</tr>
											<tr>
												<th class="bg-light">제조국</th>
												<td><?=$attribute_data['manufacture_country']?></td>
											</tr>
											<tr>
												<th class="bg-light">주요사양</th>
												<td><?=$attribute_data['main_requirements']?></td>
											</tr>
											<tr>
												<th class="bg-light">품질보증기준</th>
												<td><?=$attribute_data['warranty_service']?></td>
											</tr>
											<tr>
												<th class="bg-light">A/S 책임자(전화번호)</th>
												<td><?=$attribute_data['as_information']?></td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
				<?
						}
					}
				?>

				<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>
				
			</div> <!-- container -->

		</div> <!-- content -->

	</div><!-- /content-page -->
</div><!-- /wrapper -->

<!-- third party js -->
<script src="<?=$document_root?>/assets/js/vendor/jquery.dataTables.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.bootstrap5.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.responsive.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/responsive.bootstrap5.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.checkboxes.min.js"></script>
<!-- third party js ends -->

<script>
$(document).ready(function(){
	$(".btn_steam_sync").bind("click",function(){
		var index = $(".btn_steam_sync").index(this);
		var appids = $(".btn_steam_sync").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "../steam/get_steam_game_info.php",
			 data: {mode:"steam_sync",appids:appids,title_id:title_id},
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
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
