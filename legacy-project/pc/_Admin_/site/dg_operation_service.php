<?
$sidebar_file = "sidebar_site.php";
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$topmenu['site'] = "active";

	$page_title = "운영서비스 현황";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">사이트설정</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered nowrap table-sm table-bordered" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center" style="width: 10%;">시스템 분류</th>
												<th class="text-center" style="width: 10%;">서비스 분류</th>
												<th class="text-center" style="width: 10%;">서비스 용도</th>
												<th class="text-center" style="width: 20%;">서비스 내용</th>
												<th class="text-center" style="width: 15%;">서비스 기간</th>
												<th class="text-center" style="width: 10%;">서비스 제공업체</th>
												<th class="text-center" style="width: 20%;">운영관리업무</th>
											</tr>
										</thead>
									</table>
								</div>
							</div>
							<!-- end card-body-->
						</div>
						<!-- end card-->
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->   
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
