<?
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	$topmenu['site'] = "active";
	$sidebar_file = "sidebar_site.php";

	$page_title = "기본정보 관리";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">기본정책</a></li>
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
							<h5 class="card-header bg-secondary text-white">쇼핑몰 기본정보</h5>
							<div class="card-body">
								<form class="form-horizontal">
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">* 쇼핑몰명(국문)</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">* 쇼핑몰명(영문)</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">* 대표자명</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">* 대표도메인</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">*쇼핑몰 타이틀</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								</form>
							</div>
						</div>
						<div class="card">
							<h5 class="card-header bg-secondary text-white">고객센터 정보</h5>
							<div class="card-body">
								<form class="form-horizontal">
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">대표전화</label>
									<div class="col-3">
										<input type="text" id="simpleinput" class="form-control">
									</div>
									<div class="col-3">
										<input type="text" id="simpleinput" class="form-control">
									</div>
									<div class="col-3">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">팩스번호</label>
									<div class="col-3">
										<input type="text" id="simpleinput" class="form-control">
									</div>
									<div class="col-3">
										<input type="text" id="simpleinput" class="form-control">
									</div>
									<div class="col-3">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">이메일</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">운영시간</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								</form>
							</div>
						</div>
					</div>
					<div class="col-6">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">회사 정보</h5>
							<div class="card-body">
								<form class="form-horizontal">
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">상호(회사명)</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">사업자등록번호</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">사업장 주소</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">통신판매신고번호</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								</form>
							</div>
						</div>

						<div class="card">
							<h5 class="card-header bg-secondary text-white">파비콘 정보</h5>
							<div class="card-body">
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
