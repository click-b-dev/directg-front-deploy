<?
//사용x
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "입고등록";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고</a></li>
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
										<label for="stock_type" class="col-3 col-form-label">재고등록방식</label>
										<div class="col-9">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="stock_in_type_file" name="stock_in_type" class="form-check-input" value="file">
												<label class="form-check-label" for="stock_in_type_file">파일업로드</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="stock_in_type_key" name="stock_in_type" class="form-check-input" value="key">
												<label class="form-check-label" for="stock_in_type_key">코드직접등록</label>
											</div>
										</div>
									</div>

									<div id="file_section" class="d-none">
									<div class="row mb-3" id="file_section">
										<label for="stock_file" class="col-3 col-form-label">재고등록파일</label>
										<div class="col-9">
											<input class="form-control" type="file" id="stock_file" name="stock_file">
										</div>
									</div>
									</div>

									<div id="key_section" class="d-none">
									<div class="row mb-3" >
										<label for="asset_item" class="col-3 col-form-label">코드등록</label>
										<div class="col-9">
											<textarea class="form-control" placeholder="재고등록할 코드를 넣어주세요.(엔터로 수량구분)" id="asset_item" name="asset_item" style="height: 100px;"></textarea>
										</div>
									</div>
									</div>

									<div class="row mb-3">
										<label for="unit_price" class="col-3 col-form-label">매입단가</label>
										<div class="col-4">
											<div class="input-group">
												<input type="text" class="form-control" id="unit_price" name="unit_price" placeholder="공급처 PPR" data-bts-prefix="\">
												<div class="input-group-text">원</div>
											</div>
										</div>
									</div>
									<div class="row mb-3">
										<div class="col-12">
											<div class="text-end">
												<button type="button" class="btn btn-primary shadow-none">재고등록</button>
											</div>
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
							<h5 class="card-header bg-secondary text-white">입고등록 안내</h5>
							<div class="card-body">
								<p>※ 재고등록은 파일업로드 방식으로 재공합니다.</p>
								<p>※ 코드직접등록시 엔터단위로 수량을 판단합니다. 불필요한 엔터가 없는지 확인부탁드립니다.</p>
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

<script>
$(document).ready(function(){
	$('input[name="stock_in_type"]').bind("click",function(){
		$('input[name="stock_in_type"]').each(function(index, item){
			if($(this).prop('checked')){
				if($('input[name="stock_in_type"]').eq(index).val()=="file"){
					$("#file_section").removeClass('d-none');
					$("#file_section").addClass('d-block');
					$("#key_section").addClass('d-none');
				}else{
					$("#key_section").removeClass('d-none');
					$("#key_section").addClass('d-block');
					$("#file_section").addClass('d-none');
				}
			}
		});
	});
});
</script>
</body>
</html>
