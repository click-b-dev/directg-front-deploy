<?
$page_title="대표상품 심의정보 설정확인";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_title_id = filter_input(INPUT_GET, 'search_title_id', FILTER_SANITIZE_STRING);
$search_title_name = filter_input(INPUT_GET, 'search_title_name', FILTER_SANITIZE_STRING);
$search_title_name_en = filter_input(INPUT_GET, 'search_title_name_en', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_sale_status = filter_input(INPUT_GET, 'search_sale_status', FILTER_SANITIZE_STRING);
$search_publisher_code = filter_input(INPUT_GET, 'search_publisher_code', FILTER_SANITIZE_STRING);
$search_interface_korean = filter_input(INPUT_GET, 'search_interface_korean', FILTER_SANITIZE_STRING);
$search_spoken_korean = filter_input(INPUT_GET, 'search_spoken_korean', FILTER_SANITIZE_STRING);
$search_exclusive_korean = filter_input(INPUT_GET, 'search_exclusive_korean', FILTER_SANITIZE_STRING);

$search_age_limit = filter_input(INPUT_GET, 'search_age_limit', FILTER_SANITIZE_STRING);
$search_rateno = filter_input(INPUT_GET, 'search_rateno', FILTER_SANITIZE_STRING);
$search_orgname = filter_input(INPUT_GET, 'search_orgname', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[]=" age_limit is null";

if(isset($search_title_id) && $search_title_id<>""){
	$where[] = " title_id ='".$search_title_id."'";
}

if(isset($search_title_name) && $search_title_name<>""){
	$where[] = " title_name like '%".$search_title_name."%'";
}

if(isset($search_title_name_en) && $search_title_name_en<>""){
	$where[] = " title_name_en like '%".$search_title_name_en."%'";
}

if(isset($search_sale_status) && $search_sale_status<>""){
	$where[] = "search_sale_status ='".$search_sale_status."'";
}


if(isset($search_is_view) && $search_is_view<>""){
	$where[] = "is_view ='".$search_is_view."'";
}else{
	$where[] = "is_view ='Y'";
	$search_is_view = "Y";
}

if(isset($search_publisher_code) && $search_publisher_code<>""){
	$where[] = "publisher_code ='".$search_publisher_code."'";
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

$selected['search_publisher_code'][$search_publisher_code] = "selected";

$checked['search_is_view'][$search_is_view] = "checked";
$checked['search_orgname'][$search_orgname] = "checked";
$checked['search_age_limit'][$search_age_limit]="checked";
$checked['search_spoken_korean'][$search_spoken_korean]="checked";
$checked['search_interface_korean'][$search_interface_korean]="checked";

$where[] = " age_limit is null";

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

	$orderby = "release_date desc";

	$admin= new Admin($conn); 

	$goods_list = $admin->getGoodsList($page,$add_where,$orderby,$param);

	$publisher_data= $admin->getPublisherAllList('all');

	//대표장르목록
	$primary_genre = $admin->getGoodsPrimaryGenreList();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_app_type'][$search_app_type] = "checked";
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
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-6 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-2 col-form-labe col-form-label-sm bg-light border">결정등급</label>
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
													<input type="radio" id="search_age_limit_18" name="search_age_limit" class="form-check-input" value="18" <?=$checked['search_age_limit']['18']?>>
													<label class="form-check-label" for="search_age_limit_18"><span class='badge bg-danger font-13 fw-normal'>청소년이용불가</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_0" name="search_age_limit" class="form-check-input" value="0" <?=$checked['search_age_limit']['0']?>>
													<label class="form-check-label" for="search_age_limit_0"><span class='badge bg-secondary font-13 fw-normal'>미등록</span></label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-2 mb-2">
										<div class="row">
											<div class="col-lg-12">
												<div class="float-end">
													<button type="submit" class="btn btn-primary shadow-none">대표상품 검색</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="mb-3"><? echo number_format($goods_list->total_results)?> 개</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered nowrap table-sm table-bordered" id="">
										<thead class="table-dark font-13">
											<tr>
												<th class="text-center">대표상품<br/>코드</th>
												<th class="text-center">대표상품명</th>
												<th class="text-center">출시일</th>
												<th class="text-center">등급분류번호</th>
												<th class="text-center">등급분류기관</th>
												<th class="text-center">신청업체명</th>
												<th class="text-center">결정등급</th>
												<th class="text-center">등급분류일자</th>
												<th class="text-center">비고</th>
											</tr>
										</thead>
										<tbody class="font-13">
									<?
										if($goods_list->success == true){
											$result = $goods_list->resultset->fetchAll();

											foreach($result as $value){
												$grac_data = array();
												if($value['rateno']){
													$grac_data = $admin->getGameGrac($value['rateno']);
												}
									?>
											<tr>
												<td class="text-center"><?=$value['title_id']?></td>
												<td><?=$value['title_name']?><br/><small><?=$value['title_name_en']?></small></td>
												<td class="text-center"><?=$value['release_date']?></td>
												<td class="text-center"><?=$value['rateno']?></td>
												<td class="text-center"><?=$grac_data['orgname']?></td>
												<td class="text-center"><?=$grac_data['entname']?></td>
												<td class="text-center"><?=$grac_data['rateddate']?></td>
												<td class="text-center"><?=$grac_data['givenrate']?></td>
												<td class="text-center"><a href="<?=$document_root?>/goods/title_grac_register.php?title_id=<?=$value['title_id']?>" class="btn btn-light">심의정보 설정</a></td>
											</tr>
										<?
												}
											}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
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
