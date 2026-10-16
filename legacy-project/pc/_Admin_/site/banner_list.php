<?
$sidebar_file = "sidebar_site.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['site'] = "active";
$page_title="메인배너 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_banner_title = filter_input(INPUT_GET, 'search_banner_title', FILTER_SANITIZE_STRING);
$search_flag = filter_input(INPUT_GET, 'search_flag', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[] = " is_del='N'";

if($search_banner_title){
	$where[]=" banner_title like '%".$search_banner_title."%'";
}

if($search_flag){
	$where[]=" flag='".$search_flag."'";
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$adminSite= new AdminSite($conn);
	
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
	
	$orderby = "banner_sort asc";

	$main_banner_list = $adminSite->getMainbannerList($page,$add_where,$orderby,$param);

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
												<label for="search_banner_title" class="col-sm-3 col-form-label bg-light border">배너 제목</label>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_banner_title" name="search_banner_title" placeholder="배너 제목 검색" value="<?=$search_banner_title?>">
												</div>
											</div>
										</div>
										<div class="col-lg-4">
											<div class="row">
												<label for="search_flag" class="col-sm-3 col-form-label bg-light border">노출 여부</label>
												<div class="col-sm-9">
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_flag_y" name="search_flag" class="form-check-input" value="Y" <?=$checked['search_flag']['Y']?>>
														<label class="form-check-label" for="search_flag_y">예</label>
													</div>
													<div class="form-check form-check-inline">
														<input type="radio" id="search_flag_n" name="search_flag" class="form-check-input" value="N" <?=$checked['search_flag']['N']?>>
														<label class="form-check-label" for="search_flag_n">아니오</label>
													</div>
												</div>
											</div>
										</div>
										<div class="col-lg-2">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">메인배너 검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					
					<div class="d-flex flex-row justify-content-between mb-2">
						<div class="float-start"><? echo number_format($main_banner_list->total_results)?> 개</div>
						<div class="float-end"><div class="float-end"><a href="<?=$document_root?>/site/banner_register.php" class="btn btn-danger shadow-none">메인배너 등록</a></div></div>
					</div>

					<div class="row">
						<div class="col-12">
							<div class="table-responsive">
								<table class="table table-centered w-100  nowrap table-sm table-bordered border-light">
									<colgroup>
										<col width="6%"/>
										<col width="16%"/>
										<col width="*"/>
										<col width="15%"/>
										<col width="17%"/>
										<col width="6%"/>
										<col width="6%"/>
										<col width="8%"/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">순서</th>
											<th class="text-center">배너 이미지</th>
											<th class="text-center">배너 제목</th>
											<th class="text-center">배너 퍼블리셔</th>
											<th class="text-center">기간</th>
											<th class="text-center">상태</th>
											<th class="text-center">노출여부</th>
											<th class="text-center">관리</th>
										</tr>
									</thead>
									<tbody class="bg-white font-12">
									<?
										if($main_banner_list->success == true){
											$result = $main_banner_list->resultset->fetchAll();
											
											$sort=1;
											foreach($result as $value){
									?>
										<tr>
											<td class="text-center">
												<div class="d-flex flex-row align-items-center justify-content-center">
													<div class="me-2"><?=$value['banner_sort']?></div>
													<div class="d-flex flex-column">
														<button class="btn btn-sm p-0 btn_sort_up" data-idx="<?=$value['idx']?>" data-sort="<?=($sort-1)?>"><i class='mdi mdi-chevron-up-box mdi-24px'></i></button>
														<button class="btn btn-sm p-0 btn_sort_down" data-idx="<?=$value['idx']?>" data-sort="<?=($sort+1)?>"><i class='mdi mdi-chevron-down-box mdi-24px'></i></button>
													</div>
												</div>
											</td>
											<td class="p-1"><a href="<?=$value['banner_link']?>" target="_blank"><img src="<?=$value['banner_pc']?>" alt="<?=$value['banner_title']?> 배너 이미지" class="img-fluid" ></a></td>
											<td>
												<?=$value['banner_title']?>(<?=$value['product_code']?>)<br/>
												pc 배너 url: <?=$value['banner_pc']?><br/>
												모바일 배너 url: <?=$value['banner_mobile']?><br/>
											</td>
											<td class="text-center"><?=$value['banner_publisher']?></td>
											<td class="text-center px-1">
												<?if($value['bannerPeriodOutputFl']=="N"){?>
												<span class="badge bg-secondary font-12">상시노출</span>
												<?}else{?>
												<span class="badge bg-secondary font-12 mb-2">기간노출</span><br/>
												<?=date('Y-m-d H:i:s',$value['banner_start'])?> ~ <?=date('Y-m-d H:i:s',$value['banner_end'])?>
												<?}?>
											</td>
											<td class="text-center">
												<?
													if($value['bannerPeriodOutputFl']=="N"){
														if($value['flag']=="Y"){
												?>
													<span class="badge bg-success font-12">게시중</span>
												<?
														}else{
												?>
													<span class="badge bg-secondary font-12">게시종료</span>
												<?
														}
													}else{
												?>
													<?if(($value['banner_start']-time())>0 && $value['bannerPeriodOutputFl']=="Y"){?>
													게시예정
													<?}?>
													<?if(($value['banner_start']<time() && $value['banner_end']>time()) && $value['bannerPeriodOutputFl']=="Y"){?>
														<span class="badge bg-success font-12">게시중</span>
													<?}?>
													<?if(($value['banner_end']<time()) && $value['bannerPeriodOutputFl']=="Y"){?>
														<span class="badge bg-secondary font-12">게시종료</span>
													<?}?>
												<?}?>
											</td>
											<td class="text-center"><?=$value['flag']?></td>
											<td class="text-center">
												<a href="banner_modify.php?idx=<?=$value['idx']?>" class="btn btn-info btn-sm shadow-none">수정</a>
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
							
							<div class="text-center mt-3"><?echo $main_banner_list->links_html;?></div>
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
			 url: "banner_proc.php",
			 data: {mode:"banner_sort_up",idx:idx},
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
			 url: "banner_proc.php",
			 data: {mode:"banner_sort_down",idx:idx},
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
		
		if(confirm("해당 배너를 삭제하시겠습니까?")){
			$.ajax({
				 type: "POST",
				 url: "banner_proc.php",
				 data: {mode:"banner_delete",idx:idx},
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
