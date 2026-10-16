<?
//사용x
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "출고요청 등록";
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
					<div class="col-6">
						<div class="card">
							<div class="card-body">
								<form class="form-horizontal">
									<input type="hidden" class="form-control" id="downloadLimit" name="downloadLimit" placeholder="다운로드 생성파일 제한횟수" value="5">
									<input type="hidden" class="form-control" id="downloadExpiredDay" name="downloadExpiredDay" placeholder="다운로드 생성파일 만료일자" value="5">
									<input type="hidden" class="form-control" id="owner" name="owner" placeholder="접속한 운영자계정 아이디" value="">
									<input type="hidden" class="form-control" id="pin" name="pin" placeholder="접속한 운영자계정 비밀번호" value="">
									<div class="row mb-3">
										<label for="asset_id" class="col-3 col-form-label">Asset 아이디</label>
										<div class="col-9">
											<div class="input-group">
												<input type="text" class="form-control" name="asset_id" id="asset_id" placeholder="검색할 Asset ID를 입력해 주세요.">
												<button class="btn btn-dark" type="button">Asset 검색</button>
											</div>
										</div>
									</div>
									<div class="row mb-3">
										<label for="asset_name" class="col-3 col-form-label">Asset 명</label>
										<div class="col-9">
											<input type="text" class="form-control" id="asset_name" name="asset_name" placeholder="검색성공시 자동입력" readonly>
										</div>
									</div>
									<div class="row mb-3">
										<label for="productTypeCd" class="col-3 col-form-label">Asset 유형</label>
										<div class="col-9">
											<input type="text" class="form-control" id="productTypeCd" name="productTypeCd" placeholder="검색성공시 자동입력" readonly>
										</div>
									</div>
									<div class="row mb-3">
										<label for="assetTypeCd" class="col-3 col-form-label">Asset 형식</label>
										<div class="col-9">
											<input type="text" class="form-control" id="assetTypeCd" name="assetTypeCd" placeholder="검색성공시 자동입력" readonly>
										</div>
									</div>
									<div class="row mb-3">
										<label for="platformCd" class="col-3 col-form-label">Asset 플랫폼</label>
										<div class="col-9">
											<input type="text" class="form-control" id="platformCd" name="platformCd" placeholder="검색성공시 자동입력" readonly>
										</div>
									</div>
									<div class="row mb-3">
										<label for="publisherCd" class="col-3 col-form-label">Asset 공급처</label>
										<div class="col-9">
											<input type="text" class="form-control" id="publisherCd" name="publisherCd" placeholder="검색성공시 자동입력" readonly>
										</div>
									</div>
									<div class="row mb-3">
										<label for="qty" class="col-3 col-form-label">출고요청수량</label>
										<div class="col-9">
											<input type="text" class="form-control" id="qty" name="qty" placeholder="Email">
										</div>
									</div>
									<div class="row mb-3">
										<label for="inputEmail3" class="col-3 col-form-label">사용처</label>
										<div class="col-9">
											<input type="email" class="form-control" id="inputEmail3" placeholder="Email">
										</div>
									</div>
								</form>

							</div>
							<!-- end card-body-->
						</div>
						<!-- end card-->
					</div>
					<div class="col-6">
						<div class="card">
							<div class="card-header"><h4 class="header-title">출고요청 안내</h4></div>
							<div class="card-body">
								<p>※ 출고요청을 하면 담당자 승인완료 이후 재고> 재고 관리 > 출고완료현황에서 가능합니다.</p>
								<p>※ 다운로드는 담당자 승인완료일로부터 5일 후에는 다운로드 불가능합니다.</p>
								<p>※ 다운로드횟수는 5회로 제한됩다.</p>
							</div>
							<!-- end card-body -->
						</div>
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->
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
