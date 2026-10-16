<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$search_sales_status = filter_input(INPUT_GET, 'search_sales_status', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_domain = filter_input(INPUT_GET, 'search_domain', FILTER_SANITIZE_STRING);

$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[]=" title_code<>'12'";


if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " (title_name like '%".$search_value."%' or title_name_en like '%".$search_value."%')";
		break;
		case "search_title_id":
			$where[] = " title_id ='".$search_value."'";
		break;
		case "search_publisher":
			$where[] = " publisher like '%".$search_value."%'";
		break;
		case "search_developer":
			$where[] = " developer like '%".$search_value."%'";
		break;
	}
}

if(isset($search_is_view) && $search_is_view<>""){
	$where[] = "is_view ='".$search_is_view."'";
}

if(isset($search_sales_status) && $search_sales_status<>""){
	$where[] = "sales_status ='".$search_sales_status."'";
}

if(isset($search_domain) && $search_domain<>""){
	$where[] = "domain ='".$search_domain."'";
}

$checked['search_is_view'][$search_is_view] = "checked";
$checked['search_sales_status'][$search_sales_status] = "checked";
$checked['search_domain'][$search_domain] = "checked";

$where[] = " sales_status<>'E'";

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

	$orderby = "title_id desc";

	$admin= new Admin($conn); 

	$goods_list = $admin->getGoodsList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_key'][$search_key] = "selected";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">대표상품 관리</a></li>
									<li class="breadcrumb-item active">대표상품 스크린샷설정</li>
								</ol>
							</div>
							<h4 class="page-title">대표상품 이미지 관리</h4>
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
									<div class="col-lg-4">
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

				<div class="row">
					<div class="col-12">
						<div><? echo number_format($goods_list->total_results)?> 개</div>
						<div class="table-responsive">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center" style="width: 7%;">대표상품코드<br/><span class="eng">(Steam AppID)</span></th>
										<th class="text-center" style="width: 20%;">대표상품 sku</th>
										<th class="text-center" style="width: *;">대표상품명</th>
										<th class="text-center" style="width: 7%;">대표상품 출시일</th>
										<th class="text-center" style="width: 10%">페이지 보기</th>
									</tr>
								</thead>
								<tbody class="font-12">
								<?
								if($goods_list->success == true){
									$result = $goods_list->resultset->fetchAll();

									foreach($result as $value){
								?>
									<tr>
										<td class="text-center">
											<span class="eng"><?=$value['title_id']?></span><br/>
											<span class="num">(<?=$value['steam_appid']?>)</span><br/>
											<?	
												switch($value['sales_status']){
													case "S":
														echo "판매중";
													break;
													case "C":
														echo "판매예정";
													break;
													case "E":
														echo "판매종료";
													break;
												}
											?>
										</td>
										<td><?=$value['sku']?></td>
										<td><?=$value['title_name']?><br/><small class="eng"><?=$value['title_name_en']?></small></td>
										<td class="text-center"><span class="num font-13"><?=$value['release_date']?></span></td>
										<td class="text-center">
											<a href="/game/game_view.html?product_id=<?=$value['sku']?>" target="_blank" class="btn btn-sm btn-dark shadow-none">페이지 이동</a>
										</td>
									</tr>
									<tr>
										<td colspan="5">
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
													<td><?=$value['domain']?></td>
													<th class="text-center bg-light">웹서버</th>
													<td><img src="/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg" class="w-50"></td>
													<th class="text-center bg-light">디스크엔</th>
													<td><img src="https://image.directg.net/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg" class="w-50"></td>
												</tr>
												</tbody>
											</table>
										</td>
									</tr>
									<?}?>
								<?}?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div> <!-- container -->

		</div> <!-- content -->
	</div>

	<!-- ============================================================== -->
	<!-- End Page content -->
	<!-- ============================================================== -->


</div>
<!-- END wrapper -->



	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>
$(document).ready(function(){
	
});
</script>
</body>
</html>
