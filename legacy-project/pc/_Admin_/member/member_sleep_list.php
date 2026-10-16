<?
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
	$topmenu['member'] = "active";
	$page_title="휴면회원 완료";
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title><?=$page_title?></title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta content="" name="description" />
<meta content="" name="author" />
<!-- App favicon -->
<link rel="shortcut icon" href="<?=$document_root?>/assets/images/favicon.ico">

<!-- App css -->
<link href="<?=$document_root?>/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
<link href="<?=$document_root?>/assets/css/app.min.css?<?=time()?>" rel="stylesheet" type="text/css" id="light-style" />
<link href="<?=$document_root?>/assets/css/app-dark.min.css" rel="stylesheet" type="text/css" id="dark-style" />

</head>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
	<!-- Begin page -->
	<div class="wrapper">
		<!-- ========== Left Sidebar Start ========== -->
		<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sidebar_member.php');?>
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">회원</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">회원관리</a></li>
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
								<div class="card-body">
								</div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
						</div>
						<!-- end col -->
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
	</div>
	<!-- END wrapper -->

<!-- bundle -->
<script src="<?=$document_root?>/assets/js/vendor.min.js"></script>
<script src="<?=$document_root?>/assets/js/app.min.js"></script>

</body>
</html>
