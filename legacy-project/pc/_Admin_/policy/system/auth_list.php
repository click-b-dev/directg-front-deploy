<?
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$topmenu['site'] = "active";
	$sidebar_file = "sidebar_site.php";

	$page_title = "운영자 권한 관리";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">시스템관리정책</a></li>
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
							<div class="card-header">
								메뉴 목록
							</div>
							<div class="card-body">
								<table class="table table-striped table-centered mb-0">
								<thead>
									<tr>
										<th>메뉴구조</th>
										<th>메뉴명</th>
										<th>권한계정</th>
										<th>권한수정</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td class="table-user">
											기본설정 > 시스템관리정책
										</td>
										<td>운영자관리</td>
										<td>July 24, 1950</td>
										<td class="table-action">
											<a href="javascript: void(0);" class="action-icon"> <i class="mdi mdi-pencil"></i></a>
											<a href="javascript: void(0);" class="action-icon"> <i class="mdi mdi-delete"></i></a>
										</td>
									</tr>
								</tbody>
								</table>
							</div>
						</div>
					</div>
					<div class="col-6">
						<div class="card">
							<div class="card-header">
								메뉴 등록
							</div>
							<div class="card-body">
								<form class="form-horizontal">
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">* 메뉴명</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">메뉴경로</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">메뉴설정</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">우선순위</label>
									<div class="col-9">
										<input type="text" id="simpleinput" class="form-control">
									</div>
								</div>
								<div class="row mb-3">
									<label for="simpleinput" class="col-3 form-label">사용여부</label>
									<div class="col-9">
										<select id="inputState" class="form-select">
											<option>사용</option>
											<option>사용안함</option>
										</select>
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
