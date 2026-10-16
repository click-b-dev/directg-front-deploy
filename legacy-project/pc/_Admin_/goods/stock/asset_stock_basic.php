<?
//사용x
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "기초재고등록";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고 관리</a></li>
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
									<div class="row mb-3">
										<label for="asset_id" class="col-3 col-form-label">Asset 아이디</label>
										<div class="col-9">
											<div class="input-group">
												<input type="text" class="form-control" name="asset_id" id="asset_id" placeholder="검색할 Asset ID를 입력해 주세요.">
												<button class="btn btn-dark" type="button">Asset 검색</button>
											</div>
										</div>
									</div>
								</form>

							</div>
							<!-- end card-body-->
						</div>
						<!-- end card-->
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
