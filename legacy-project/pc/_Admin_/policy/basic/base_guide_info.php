<?
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$topmenu['site'] = "active";
	$sidebar_file = "sidebar_site.php";

	$page_title = "안내문구 관리";

	$cart_msg = fopen("/home/dgkrshop/www/conf/cart.txt", 'r');
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
					<div class="col-12">
						<form name="frm1" method="post" action="base_guide_ps.php">
							<input type="hidden" name="mode" value="cart">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">장바구니 안내문구(고정)</h5>
								<div class="card-body p-2">
									<textarea name="cart_msg" id="cart_msg" class="form-control" rows="7" required placeholder="장바구니 페이지에 노출할 안내문구"><?while(!feof($cart_msg)){
										$str = fgets($cart_msg);
										echo $str;
									}
									?></textarea>
								</div>
								<div class="card-footer text-end">
									<button type="submit" class="btn btn-primary btn-sm shadow-none">장바구니 안내문구 저장</button>
								</div>
							</div>
						</form>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<form name="frm1" method="post" action="base_guide_ps.php">
							<input type="hidden" name="mode" value="order">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">주문하기 안내문구(고정)</h5>
								<div class="card-body p-2">
									<textarea name="order_msg" id="order_msg" class="form-control" rows="5" required placeholder="주문하기 페이지에 노출할 안내문구"></textarea>
								</div>
								<div class="card-footer text-end">
									<button type="submit" class="btn btn-primary btn-sm shadow-none">주문하기 안내문구 저장</button>
								</div>
							</div>
						</form>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">문의하기 안내문구(고정)</h5>
							<div class="card-body">
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">마이페이지 > 정보수정 안내문구(고정)</h5>
						<div class="card-body">
						</div>
					</div>

					<div class="card">
						<h5 class="card-header bg-secondary text-white">마이페이지 > 회원탈퇴 안내문구(고정)</h5>
						<div class="card-body">
						</div>
					</div>

					<div class="card">
						<h5 class="card-header bg-secondary text-white">마이페이지 > 사은품 안내문구(고정)</h5>
						<div class="card-body">
						</div>
					</div>
					<div class="card">
						<h5 class="card-header bg-secondary text-white">마이페이지 > 포인트 안내문구(고정)</h5>
						<div class="card-body">
						</div>
					</div>
					<div class="card">
						<h5 class="card-header bg-secondary text-white">마이페이지 > 쿠폰 안내문구(고정)</h5>
						<div class="card-body">
						</div>
					</div>
					<div class="card">
						<h5 class="card-header bg-secondary text-white">마이페이지 > 위시리스트 안내문구(고정)</h5>
						<div class="card-body">
						</div>
					</div>
					<div class="card">
						<h5 class="card-header bg-secondary text-white">마이페이지 > 주문내역 안내문구(고정)</h5>
						<div class="card-body">
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
