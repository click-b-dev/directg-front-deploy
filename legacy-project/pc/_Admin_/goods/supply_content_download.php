<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "제공컨텐츠 다운로드 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_EMAIL);

if(!$page){
	$page=1;
}

$where = [];
$param = "";

if($search_value){
	switch($search_key){
		case "search_m_id":
			$where[]=" m_id='".$search_value."'";
		break;
	}
}


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$add_where = "";


	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page"){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}
	
	$orderby = "idx desc";

	$admin_goods= new AdminGoods($conn); 
	$patch_download_log = $admin_goods->getKoreanPatchDownloadLog($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}


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
									<li class="breadcrumb-item"><a href="javascript: void(0);">제공컨텐츠 관리</a></li>
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
						<h5 class="card-header bg-secondary text-white">회원검색</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_m_id" <?=$selected['search_key']['search_m_id']?>>회원아이디</option>
												<!--<option value="search_m_no" <?=$selected['search_key']['search_m_no']?>>회원고유번호</option>-->
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">회원 조회</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">제공컨텐츠 다운로드 이력</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">회원아이디</th>
												<th class="text-center">제공컨텐츠명</th>
												<th class="text-center">다운로드클릭횟수</th>
												<th class="text-center">ip</th>
												<th class="text-center">다운로드일자</th>
												<th class="text-center">마지막다운로드일자</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											$num=0;

											if($patch_download_log->success == true){
												$result = $patch_download_log->resultset->fetchAll();

												foreach($result as $value){
										?>
											<tr>
												<td class="text-center"><?=$patch_download_log->total_results-((($page-1)*50)+$num)?></td>
												<td class="text-center"><?=$value['m_id']?></td>
												<td class="text-start"><?=$value['patch_name']?></td>
												<td class="text-center"><?=$value['count']?></td>
												<td class="text-center"><?=$value['ip']?></td>
												<td class="text-center"><?=$value['reg_date']?></td>
												<td class="text-center"><?=$value['last_download']?></td>
											</tr>
									<?			$num++;
												}
											}
										?>
										</tbody>
									</table>
								</div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
						<div class="text-center mt-3"><?echo $patch_download_log->links_html;?></div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div>
			<!-- container -->

		</div>
		<!-- content -->

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
</body>
</html>
