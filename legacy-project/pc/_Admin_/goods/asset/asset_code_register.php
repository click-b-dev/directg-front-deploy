<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset Code 등록";
$sidebar_file = "sidebar_stock.php";

//코드 그룹 정의 (asset.md 3장)
$code_groups = array(
	"PDTP" => "상품유형 (Product Type)",
	"ASTP" => "상품형식 (Asset Type)",
	"PLFM" => "플랫폼 (Platform)",
	"PUBL" => "공급처 (Publisher)",
);
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Asset 관리</a></li>
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
								<form class="form-horizontal" action="asset_ps.php" method="post">
									<input type="hidden" name="mode" id="mode" value="asset_code_register">
									<div class="row mb-3">
										<label for="group_id" class="col-3 col-form-label">*코드 그룹</label>
										<div class="col-9">
											<select class="form-select" name="group_id" id="group_id" required>
												<option value="">::: 코드 그룹 선택 :::</option>
												<? foreach($code_groups as $gid => $gname){ ?>
												<option value="<?=$gid?>"><?=$gid?> / <?=$gname?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-3">
										<label for="name" class="col-3 col-form-label">*코드명</label>
										<div class="col-9">
											<input type="text" class="form-control" id="name" name="name" maxlength="64" placeholder="코드명 (최대 64자)" required>
										</div>
									</div>
									<div class="row mb-3">
										<div class="col-12">
											<div class="d-flex justify-content-between">
												<a href="asset_code_list.php" class="btn btn-light shadow-none">← 코드 현황</a>
												<button type="submit" class="btn btn-primary shadow-none">코드 등록</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
