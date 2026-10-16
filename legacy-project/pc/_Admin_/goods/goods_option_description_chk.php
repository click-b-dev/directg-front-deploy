<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title = "옵션상품 상세설명 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_product_code = filter_input(INPUT_GET, 'search_product_code', FILTER_SANITIZE_STRING);
$search_product_name = filter_input(INPUT_GET, 'search_product_name', FILTER_SANITIZE_STRING);
$search_product_name_en = filter_input(INPUT_GET, 'search_product_name_en', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_status = filter_input(INPUT_GET, 'search_status', FILTER_SANITIZE_STRING);

$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_genre_code = filter_input(INPUT_GET, 'search_genre_code', FILTER_SANITIZE_STRING);

$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[] = " (game_type='dlc' and product_platform='1')";

if(isset($search_product_code) && $search_product_code<>""){
	$where[] = " product_code ='".$search_product_code."'";
}

if(isset($search_product_name) && $search_product_name<>""){
	$where[] = " product_name like '%".$search_product_name."%'";
}

if(isset($search_product_name_en) && $search_product_name_en<>""){
	$where[] = " product_name_en like '%".$search_product_name_en."%'";
}

if(isset($search_appid) && $search_appid<>""){
	$where[] = "steam_appid ='".$search_appid."'";
}

if(isset($search_is_view) && $search_is_view<>""){
	$where[] = "is_view ='".$search_is_view."'";
}

if(isset($search_publisher_code) && $search_publisher_code<>""){
	$where[] = "publisher_code ='".$search_publisher_code."'";
}

if(isset($search_supplier_code) && $search_supplier_code<>""){
	$where[] = "supplier_code ='".$search_supplier_code."'";
}

if(isset($search_platform) && $search_platform<>""){
	$where[] = "platform_code ='".$search_platform."'";
}

if(isset($search_status) && $search_status<>""){
	$where[] = " status='".$search_status."'";
}

$checked['search_is_view'][$search_is_view] = "checked";
$selected['search_supplier_code'][$search_supplier_code] = "selected";
$selected['search_platform'][$search_platform] = "selected";
$checked['search_status'][$search_status] = "checked";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	//echo $add_where;

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "release_date desc";

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn); 

	$goods_option_list = $admin->getGoodsOptionList($page,$add_where,$orderby,$param,"50");

	$publisher_data= $admin->getPublisherAllList('all');

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
									<li class="breadcrumb-item active">옵션상품 이미지설정</li>
								</ol>
							</div>
							<h4 class="page-title">옵션상품 이미지설정</h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">옵션상품 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-2">
										<div class="row">
											<label for="search_product_code" class="col-sm-5 col-form-label bg-light border">옵션상품코드</label>
											<div class="col-sm-7">
												<input type="text" class="form-control" id="search_product_code" name="search_product_code" placeholder="옵션상품코드" value="<?=$search_product_code?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_product_name" class="col-sm-3 col-form-label bg-light border">옵션상품명(국문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_product_name" name="search_product_name" placeholder="옵션상품명(국문)" value="<?=$search_product_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_product_name_en" class="col-sm-3 col-form-label bg-light border">옵션상품명(영문)</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_product_name_en" name="search_product_name_en" placeholder="옵션상품명(영문)" value="<?=$search_product_name_en?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="search_publisher_code" class="col-sm-4 col-form-label bg-light border">옵션상품 공급처</label>
											<div class="col-sm-8">
												<select id="search_publisher_code" name="search_publisher_code" class="form-select">
													<option value="">:::선택:::</option>
													<?
														foreach($publisher_data as $value){
													?>
													<option value="<?=$value['publisher_code']?>" <?=$selected['search_publisher_code'][$value['publisher_code']]?>>[<?=$value['publisher_code']?>] <?=$value['publisher_name']?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-lg-3">
										<div class="row">
											<label for="search_appid" class="col-sm-5 col-form-label bg-light border">Steam APP ID</label>
											<div class="col-sm-7">
												<input type="text" class="form-control" id="search_appid" name="search_appid" placeholder="Steam APP ID" value="<?=$search_appid?>">
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_is_view" class="col-sm-4 col-form-label bg-light border">진열상태</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_y" name="search_is_view" class="form-check-input" value="Y" <?=$checked['search_is_view']['Y']?>>
													<label class="form-check-label" for="search_is_view_y">예</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_n" name="search_is_view" class="form-check-input" value="N" <?=$checked['search_is_view']['N']?>>
													<label class="form-check-label" for="search_is_view_n">아니오</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="row">
											<h6 class="col-sm-2 col-form-label col-form-label-sm bg-light border">판매상태</h6>
											<div class="col-sm-8 mt-1">
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
												
												<div class="form-check form-check-inline">
													<input type="radio" id="status_3" name="search_status" class="form-check-input"  value="3" <?=$checked['search_status']['3']?>>
													<label class="form-check-label" for="status_3"><span class="badge badge-danger-lighten font-13">판매종료</span></label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">옵션상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
					
						<? echo number_format($goods_option_list->total_results)?> 개
						
						<div class="table-responsive bg-white">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-light font-14">
									<tr>
										<th class="text-center">옵션상품<br/>코드</th>
										<th class="text-center">옵션상품 Sku</th>
										<th class="text-center">옵션상품명</th>
										<th class="text-center">옵션상품 유형</th>
										<th class="text-center">옵션상품 출시일</th>
										<th class="text-center">판매상태</th>
										<th class="text-center">상세설명 동기화일자</td>
										<th class="text-center">동기화</th>
									</tr>
								</thead>
								<tbody class="font-13">
								<?
								if($goods_option_list->success == true){
									$result = $goods_option_list->resultset->fetchAll();

									foreach($result as $value){
										$description_chk = $adminGoods->getGoodsOptionDescriptionChk($value['product_code']);
								?>
									<tr>
										<td class="text-center"><?=$value['product_code']?></br>
										<?
											echo "(".$value['steam_appid'].")<br/>";
										?>
										</td>
										<td class="text-center"><?=$value['goods_sku']?></td>
										<td><?=$value['product_name']?><br/><span class="eng"><?=$value['product_name_en']?></span></td>
										<td class="text-center"><?=$value['game_type']?></td>
										<td class="text-center"><?=date('Y-m-d',strtotime($value['release_date']))?></td>
										<td class="text-center"><?=$value['status']?></td>
										<td class="text-center"><?=date('Y-m-d H:i:s',strtotime($description_chk['reg_date']))?></td>
										<td class="text-center"><button type="button" class="btn btn-info shadow-none btn_description_sync" data-appid="<?=$value['steam_appid']?>" data-productcode="<?=$value['product_code']?>" data-apptype="<?=$value['game_type']?>"><i class="uil uil-refresh"></i></button></td>
									</tr>
									<?}?>
								<?}?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $goods_option_list->links_html;?></div>
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
/*
const theButton = document.querySelector(".btn_steam_sync");
document.querySelector(".btn_steam_sync").addEventListener("click", () => {
	theButton.classList.add("loading");
});
*/
$(document).ready(function(){
	$(".btn_description_sync").bind("click",function(){
		var index = $(".btn_description_sync").index(this);
		var product_code = $(".btn_description_sync").eq(index).attr("data-productcode");
		var appids = $(".btn_description_sync").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "../steam/get_steam_game_info.php",
			 data: {mode:"steam_sync_desc",appids:appids,product_code:product_code},
			 success: function (data, status) {
				alert(data);
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
