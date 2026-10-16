<?
$sidebar_file = "sidebar_site.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['site'] = "active";
$page_title="추천 및 특집 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_recommand_name = filter_input(INPUT_GET, 'search_banner_title', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[] = " is_del='N'";

if($search_recommand_name){
	$where[]=" recommand_name like '%".$search_recommand_name."%'";
}


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$adminSite= new AdminSite($conn);
	$adminGoods= new AdminGoods($conn);
	
	$add_where = "";

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
	
	$orderby = "recommand_sort asc";

	$main_recommand_list = $adminSite->getMainRecommandList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_flag'][$search_flag] = "checked";
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">사이트</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">배너 관리</a></li>
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
									<div class="row mb-2">
										<div class="col-lg-6">
											<div class="row">
												<label for="search_recommand_name" class="col-sm-3 col-form-label bg-light border">추천 및 특집 제목</label>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_banner_title" name="search_recommand_name" placeholder="추천 및 특집 제목" value="<?=$search_recommand_name?>">
												</div>
											</div>
										</div>
										<div class="col-lg-4">
										</div>
										<div class="col-lg-2">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">추천 및 특집 검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					
					<div class="d-flex flex-row justify-content-between mb-2">
						<div class="float-start"><? echo number_format($main_recommand_list->total_results)?> 개</div>
						<div class="float-end"><div class="float-end"><a href="<?=$document_root?>/site/main_recommand_register.php" class="btn btn-danger shadow-none">추천 및 특집 등록</a></div></div>
					</div>

					<div class="row">
						<div class="col-12">
							<div class="table-responsive">
								<table class="table table-centered w-100  nowrap table-sm table-bordered border-light">
									<colgroup>
										<col width="5%"/>
										<col width="15%"/>
										<col width="*"/>
										<col width="30%"/>
										<col width="16%"/>
										<col width="6%"/>
										<col width="6%"/>
										<col width="8%"/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">순서</th>
											<th class="text-center">추천 및 특집 배너</th>
											<th class="text-center">추천 및 특집 제목</th>
											<th class="text-center">추천 및 특집 상품</th>
											<th class="text-center">기간</th>
											<th class="text-center">상태</th>
											<th class="text-center">노출여부</th>
											<th class="text-center">관리</th>
										</tr>
									</thead>
									<tbody class="bg-white font-12">
									<?
										if($main_recommand_list->success == true){
											$result = $main_recommand_list->resultset->fetchAll();
											
											$sort=1;
											foreach($result as $value){
												$goods_option_info1 = $adminGoods->getGoodsOptionSearch($value['recommand_goods_1']);
												$goods_option_info2 = $adminGoods->getGoodsOptionSearch($value['recommand_goods_2']);
												$goods_option_info3 = $adminGoods->getGoodsOptionSearch($value['recommand_goods_3']);
												$goods_option_info4 = $adminGoods->getGoodsOptionSearch($value['recommand_goods_4']);
									?>
										<tr>
											<td class="text-center">
												<div class="d-flex flex-row align-items-center justify-content-center">
													<div class="me-2"><?=$value['recommand_sort']?></div>
													<div class="d-flex flex-column">
														<button class="btn btn-sm p-0 btn_sort_up" data-idx="<?=$value['idx']?>" data-sort="<?=($sort-1)?>"><i class='mdi mdi-chevron-up-box mdi-24px'></i></button>
														<button class="btn btn-sm p-0 btn_sort_down" data-idx="<?=$value['idx']?>" data-sort="<?=($sort+1)?>"><i class='mdi mdi-chevron-down-box mdi-24px'></i></button>
													</div>
												</div>
											</td>
											<td class="p-1"><a href="<?=$value['recommand_banner_link']?>" target="_blank"><img src="<?=$value['recommand_banner']?>" alt="<?=$value['recommand_title']?> 배너 이미지" class="img-fluid" ></a></td>
											<td><?=$value['recommand_name']?></td>
											<td class="text-start px-1">
												<ul class="list-group list-group-numbered">
													<li class='list-group-item text-start'><?=$goods_option_info1['product_code']?> / <?=$goods_option_info1['product_name']?> / <?=$goods_option_info1['game_type']?></li>
													<li class='list-group-item text-start'><?=$goods_option_info2['product_code']?> / <?=$goods_option_info2['product_name']?> / <?=$goods_option_info2['game_type']?></li>
													<li class='list-group-item text-start'><?=$goods_option_info3['product_code']?> / <?=$goods_option_info3['product_name']?> / <?=$goods_option_info3['game_type']?></li>
													<li class='list-group-item text-start'><?=$goods_option_info4['product_code']?> / <?=$goods_option_info4['product_name']?> / <?=$goods_option_info4['game_type']?></li>
												</ul>
											</td>
											<td class="text-center px-1">
												<?=date('Y-m-d H:i:s',$value['recommand_start'])?> ~ <?=date('Y-m-d H:i:s',$value['recommand_end'])?>
											</td>
											<td class="text-center px-1">
													<?if(($value['recommand_start']-time())>0 && $value['is_view']=="Y"){?>
													게시예정
													<?}?>
													<?if(($value['recommand_start']<time() && $value['recommand_end']>time()) && $value['is_view']=="Y"){?>
														<span class="badge bg-success font-12">게시중</span>
													<?}?>
													<?if(($value['recommand_end']<time()) && $value['is_view']=="Y"){?>
														<span class="badge bg-secondary font-12">게시종료</span>
													<?}?>
											</td>
											<td class="text-center px-1"><?=$value['is_view']?></td>
											<td class="text-center">
												<a href="main_recommand_modify.php?idx=<?=$value['idx']?>" class="btn btn-info btn-sm shadow-none">수정</a>
												<button class="btn btn-danger btn-sm shadow-none btn_delete" data-idx="<?=$value['idx']?>">삭제</button>
											</td>
										</tr>
									<?
												$sort++;
											}
										}
									?>
									</tbody>
								</table>
							</div>
							
							<div class="text-center mt-3"><?echo $main_recommand_list->links_html;?></div>
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	//정렬순서 위로증가
	$(".btn_sort_up").bind("click",function(){
		var index = $(".btn_sort_up").index(this);
		var idx =  $(".btn_sort_up").eq(index).attr("data-idx");
		$.ajax({
			 type: "POST",
			 url: "main_recommand_ps.php",
			 data: {mode:"recommand_sort_up",idx:idx},
			 success: function (data, status) {
				location.reload();
				//alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//정렬순서 아래로 감소
	$(".btn_sort_down").bind("click",function(){
		var index = $(".btn_sort_down").index(this);
		var idx =  $(".btn_sort_down").eq(index).attr("data-idx");
		
		$.ajax({
			 type: "POST",
			 url: "main_recommand_ps.php",
			 data: {mode:"recommand_sort_down",idx:idx},
			 success: function (data, status) {
				location.reload();
				//alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//배너삭제
	$(".btn_delete").bind("click",function(){
		var index = $(".btn_delete").index(this);
		var idx =  $(".btn_delete").eq(index).attr("data-idx");
		
		if(confirm("해당 추천 및 특집을 삭제하시겠습니까?")){
			$.ajax({
				 type: "POST",
				 url: "main_recommand_ps.php",
				 data: {mode:"delete",idx:idx},
				 success: function (data, status) {
					location.reload();
					//alert(data);
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}
	});
});
</script>
</body>
</html>
