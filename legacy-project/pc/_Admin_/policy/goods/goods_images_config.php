<?
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$topmenu['site'] = "active";
	$sidebar_file = "sidebar_site.php";

	$page_title = "상품이미지 설정";
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">사이트설정</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품관리정책</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-6">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">대표상품 이미지 설정</h5>
							<div class="card-body">
								<form>
									<div class="mb-2 row">
										<label for="header_label" class="col-sm-4 col-form-label col-form-label-sm">header (대표상품 카드)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_width" name="header_width" placeholder="" value="460">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_height" name="header_height" placeholder="" value="215">
										</div>
									</div>

									<div class="mb-2 row">
										<label for="capsule_label" class="col-sm-4 col-form-label col-form-label-sm">capsule (대표상품 썸네일)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_width" name="capsule_width" placeholder="" value="231">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_height" name="capsule_height" placeholder="" value="87">
										</div>
									</div>

									<div class="mb-2 row">
										<label for="library_label" class="col-sm-4 col-form-label col-form-label-sm">library (대표상품 라이브러리)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_width" name="library_width" placeholder="" value="600">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_height" name="library_height" placeholder="" value="900">
										</div>
									</div>
								</form>
							</div>
						</div>
						<div class="card">
							<h5 class="card-header bg-secondary text-white">대표상품 스크린샷 설정</h5>
							<div class="card-body">
								<form>
									<div class="mb-2 row">
										<label for="screenshot_label" class="col-sm-4 col-form-label col-form-label-sm">스크린샷 (16:9)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="screenshot_width" name="screenshot_width" placeholder="" value="856">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="screenshot_height" name="screenshot_height" placeholder="" value="481">
										</div>
									</div>
									<div class="mb-2 row">
										<label for="screenshot_label" class="col-sm-4 col-form-label col-form-label-sm">스크린샷 썸네일(4:3)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="screenshot_width" name="screenshot_width" placeholder="" value="120">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="screenshot_height" name="screenshot_height" placeholder="" value="90">
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					<div class="col-6">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">옵션상품 이미지 설정</h5>
							<div class="card-body">
								<form>
									<div class="mb-2 row">
										<label for="header_label" class="col-sm-4 col-form-label col-form-label-sm">header (옵션상품 카드)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_width" name="header_width" placeholder="" value="460">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_height" name="header_height" placeholder="" value="215">
										</div>
									</div>

									<div class="mb-2 row">
										<label for="capsule_label" class="col-sm-4 col-form-label col-form-label-sm">capsule (옵션상품 썸네일)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_width" name="capsule_width" placeholder="" value="231">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_height" name="capsule_height" placeholder="" value="87">
										</div>
									</div>

									<div class="mb-2 row">
										<label for="capsule_label" class="col-sm-4 col-form-label col-form-label-sm">package (옵션상품 패키지)</label>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_width" name="capsule_width" placeholder="" value="">
										</div>
										<div class="col-sm-4">
											<input type="email" class="form-control" id="header_height" name="capsule_height" placeholder="" value="">
										</div>
									</div>

								</form>
							</div>
						</div>
					</div>
				</div>

			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
