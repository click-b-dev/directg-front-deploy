<?
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="대표상품 태그 설정";

ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

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

$where[]=" title_code<>'12'";

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


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$add_where = "";
	$param = "";


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
									<table class="table table-centered nowrap table-sm table-bordered" id="">
										<thead class="table-dark font-13">
											<tr>
												<th class="text-center">대표상품<br/>코드</th>
												<th class="text-center">대표상품명</th>
												<th class="text-center">출시일</th>
												<th class="text-center">전열여부</th>
												<th class="text-center">게임장르</th>
												<th class="text-center">게임카테고리</th>
												<th class="text-center">비고</th>
											</tr>
										</thead>
										<tbody class="font-13">
									<?
										if($goods_list->success == true){
											$result = $goods_list->resultset->fetchAll();
											foreach($result as $value){
									?>
											<tr>
												<td class="text-center" style="width:100px"><?=$value['title_id']?></td>
												<td style="width:400px"><?=$value['title_name']?><br/><small><?=$value['title_name_en']?></small></td>
												<td class="text-center" style="width:100px"><?=$value['release_date']?></td>
												<td class="text-center" style="width:70px"><?=$value['is_view']?></td>
												<td class="text-center">
													<div class="d-flex flex-row flex-wrap" style="max-width:700px">
													<?
													$title_genre_list = explode(",",$value['genre']);
													foreach($title_genre_list as $genre){
														switch(substr($genre,0,1)){
															case "G": //장르
																$tag_style="bg-primary text-light";
															break;
															case "M"://분위기, 배경
																$tag_style="bg-success text-light";
															break;
															case "T"://테마
																$tag_style="bg-info text-light";
															break;
															case "V"://시점
																$tag_style="bg-warning text-light";
															break;
															case "A"://평가
																$tag_style="bg-secondary text-light";
															break;
															case "F"://기능
																$tag_style="bg-dark text-light";
															break;
															default:
																$tag_style="bg-secondary text-light";
															break;
														}
														echo "<div><span class='badge ".$tag_style." font-13 fw-normal me-1 mb-1'>".$admin->getTagName($genre)."</span></div>";
													}
												?>
													</div>
												</td>
												<td class="text-center">
													<div class="d-flex flex-row flex-wrap" style="max-width:700px">
													<?
													$title_categorye_list = explode(",",$value['category']);
													foreach($title_categorye_list as $category){
														switch(substr($category,0,1)){
															case "G": //장르
																$tag_style="bg-primary text-light";
															break;
															case "M"://분위기, 배경
																$tag_style="bg-success text-light";
															break;
															case "T"://테마
																$tag_style="bg-info text-light";
															break;
															case "V"://시점
																$tag_style="bg-warning text-light";
															break;
															case "A"://평가
																$tag_style="bg-secondary text-light";
															break;
															case "F"://기능
																$tag_style="bg-dark text-light";
															break;
															default:
																$tag_style="bg-secondary text-light";
															break;
														}
														echo "<div><span class='badge ".$tag_style." font-13 fw-normal me-1 mb-1'>".$admin->getTagName($category)."</span></div>";
													}
												?>
													</div>
												</td>
												<td class="text-center" style="width:120px"><a href="<?=$document_root?>/goods/title_tag_register.php?title_id=<?=$value['title_id']?>&referer=title_tag_chk.php&page=<?=$page?>" class="btn btn-sm btn-light">태그 설정</a></td>
											</tr>
										<?
												}
											}
										?>
										</tbody>
									</table>


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
