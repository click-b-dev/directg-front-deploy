<?
//사용x
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "재고이동현황";
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<link href="<?=$document_root?>/assets/css/vendor/bootstrap-steps.min.css" rel="stylesheet">
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고관리</a></li>
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
								<table class="table table-sm table-centered table-bordered mb-0">
								<thead class="table-dark">
									<tr>
										<th class="text-center">DGKR<br/>Asset ID</th>
										<th class="text-center">Asset 이름</th>
										<th class="text-center">재고이동<br/>요청정보</th>
										<th class="text-center">승인처리정보</th>
										<th class="text-center">처리상태</th>
										<th class="text-center">재고이동날짜</th>
										<th class="text-center">재고이동사이트</th>
										<th class="text-center">재고이동목적</th>
										<th class="text-center">재고이동Asset ID</th>
										<th class="text-center">재고이동수량</th>
									</tr>
								</thead>
								<tbody>
								<tr>
									<td class="text-center">3511</td>
									<td>Fell Seal: Arbiter's Mark - Missions and Monsters</td>
									<td class="text-center">kjw<br/>(2023-06-12 18:59:22)</td>
									<td class="text-center">관리자<br/>(2023-06-12 18:59:22)</td>
									<td class="text-center">승인대기</td>
									<td class="text-center"></td>
									<td class="text-center">DGJP</td>
									<td class="text-center">재고등록</td>
									<td class="text-center"></td>
									<td class="text-end">30</td>
								</tr>
								</tbody>
								</table>
							</div>
							<!-- end card-body-->
						</div>
						<!-- end card-->
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->
				<div class="row">
					<div class="col-12">
						<ul class="steps">
						  <li class="step step-success">
							<div class="step-content">
							  <span class="step-circle">1</span>
							  <span class="step-text">재고이동요청</span>
							</div>
						  </li>
						  <li class="step step-active">
							<div class="step-content">
							  <span class="step-circle">2</span>
							  <span class="step-text">승인완료</span>
							</div>
						  </li>
						  <li class="step">
							<div class="step-content">
							  <span class="step-circle">3</span>
							  <span class="step-text">다운로드</span>
							</div>
						  </li>
						  <li class="step">
							<div class="step-content">
							  <span class="step-circle">4</span>
							  <span class="step-text">재고이동완료</span>
							</div>
						  </li>
						</ul>
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
