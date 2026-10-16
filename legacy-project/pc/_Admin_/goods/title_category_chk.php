<?
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="대표상품 카테고리 관리";

ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$search_title_id = filter_input(INPUT_GET, 'search_title_id', FILTER_SANITIZE_STRING);
$search_title_name = filter_input(INPUT_GET, 'search_title_name', FILTER_SANITIZE_STRING);
$search_title_name_en = filter_input(INPUT_GET, 'search_title_name_en', FILTER_SANITIZE_STRING);
$search_category = filter_input(INPUT_GET, 'search_category', FILTER_SANITIZE_STRING);


if(!$page){
	$page=1;
}

$where = [];

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$add_where = "";
	$param = "";
	$admin= new Admin($conn); 
	
	if(isset($search_category) && $search_category<>""){
		$search_cateogorys = explode(',',$search_category);
		if(is_array($search_cateogorys)){
			$tag_filter = "";
			foreach($search_cateogorys as $category_code){
				if($category_code){
					$tag_filter .= "+".$category_code." ";
					$checked['category_code'][$category_code] = "checked";
				}
			}

			if(isset($tag_filter) && $tag_filter<>""){
				$where[] = " match(category) AGAINST('".$tag_filter."'  IN BOOLEAN MODE)";
			}
		}else{
			$where[] = " match(category) AGAINST('+".$search_category."'  IN BOOLEAN MODE)";
			$checked['category_code'][$search_category] = "checked";
		}
	}
	
	//print_r($where);

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

	$goods_list = $admin->getGoodsList($page,$add_where,$orderby,$param);
	
	$tag_data = $admin->getTagList();
	
	$steam_category_result = $admin->getSteamGamesCategory($steam_appid);

	//스팀 카테고리정보 조회
	if($steam_category_result){
		$category_data = explode(",",$steam_category_result['category']);
		foreach($category_data as $category){
			$steam_category_data[]['category_name']=$category;
		}
	}else{
		$category_data = explode(",",$title_info['category']);
		foreach($category_data as $category){
			$steam_category_data[]['category_name']=$category;
		}
	}

	foreach($tag_data as $key=>$value){
		if($value['tag_code']){
			$tag_list[$value['tag_group_code']][$key]['tag_code']=$value['tag_code'];
			$tag_list[$value['tag_group_code']][$key]['tag_name']=trim($value['tag_name']);

			foreach($steam_tag_data as $steam_tag){
				if($tag_list[$value['tag_group_code']][$key]['tag_name']==$steam_tag['tag_name']){
					$tag_list[$value['tag_group_code']][$key]['tag_checked']="checked";
				}
			}

			if(is_array($steam_category_data)){
				foreach($steam_category_data as $steam_category){
					if($tag_list[$value['tag_group_code']][$key]['tag_name']==$steam_category['category_name']){
						//echo $steam_tag['tag_name']."<br/>";
						$tag_list[$value['tag_group_code']][$key]['tag_checked']="checked";
					}
				}
			}
		}
	}

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
						<div class="card-body p-1">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<input type="hidden" name="search_category" id="search_category">
								<div class="row">
									<div class="col-12 mb-2">
										<?
											foreach($tag_list as $key=>$value){
												$tag_group_info = $admin->getTagGroupInfo($key);
												if(substr($tag_group_info['tags_group_code'],0,1)=='P'){
										?>
										<div class="row g-2 align-items-stretch m-0">
											<label for="search_publisher_code" class="col-sm-2 col-form-label bg-light mt-0 mb-2 border-top border-start border-bottom fw-bold"><?=$tag_group_info['tags_group_name']?></label>
											<div class="col-sm-10 align-self-stretch border-top border-bottom border-end mt-0 mb-2 p-1">
												<?
													foreach($value as $sub_key=>$sub_value){
												?>
												<div class="form-check form-check-inline">
													<input type="checkbox" id="category<?=$sub_value['tag_code']?>" name="category_code" class="form-check-input" value="<?=$sub_value['tag_code']?>" <?=$checked['category_code'][$sub_value['tag_code']]?>>
													<label class="form-check-label fw-normal" for="category<?=$sub_value['tag_code']?>"><?=$sub_value['tag_name']?></label>
												</div>
												<?
													}
												?>
											</div>
										</div>
										<?	
											}
										}
										?>
									</div>
									<div class="col-12 mb-2">
										<div class="row">
											<div class="col-lg-12">
												<div class="float-end">
													<button type="button" class="btn btn-primary shadow-none" id="btn_search">대표상품 검색</button>
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
												<th class="text-center">카테고리</th>
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
												<td class="text-center" style="width:100px"><?=$value['title_id']?><br/>(<?=$value['steam_appid']?>)</td>
												<td style="width:400px"><?=$value['title_name']?><br/><small><?=$value['title_name_en']?></small></td>
												<td class="text-center" style="width:100px"><?=$value['release_date']?></td>
												<td class="text-center" style="width:70px"><?=$value['is_view']?></td>
												<td class="text-center">
													<div class="d-flex flex-row flex-wrap" style="max-width:700px">
													<?
													$title_category_list = explode(",",$value['category']);
													foreach($title_category_list as $title_category){
														echo "<div><span class='badge bg-info text-light font-13 fw-normal me-1 mb-1'>".$admin->getTagName($title_category)."</span></div>";
													}
												?>
													</div>
												</td>
												<td class="text-center" style="width:120px"><a href="<?=$document_root?>/goods/title_modify.php?title_id=<?=$value['title_id']?>&referer=title_category_chk.php&page=<?=$page?>" class="btn btn-sm btn-light">장르 설정</a></td>
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
	$("#btn_search").bind("click",function(){
		var search_category = [];
		$("input[name=category_code]:checked").each(function(){
			var chk_category = $(this).val();
			search_category.push(chk_category);
		});
		
		var new_form = $('<form></form>');
		new_form.attr("name", "test_form");
		new_form.attr("method", "get");
		new_form.attr("action", "title_category_chk.php");
		new_form.append($('<input/>', {type: 'hidden', name: 'search_category', value: search_category}));
		new_form.appendTo('body');
		new_form.submit();
	});
});
</script>
</body>
</html>
