<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset 등록";
$sidebar_file = "sidebar_stock.php";

//등록 전용 페이지 — 수정은 asset_modify.php 가 담당
try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$admin = new Admin($conn);

	$asset_publisher = $admin->getAssetCodeList('PUBL');
	$asset_platform  = $admin->getAssetCodeList('PLFM');
	$product_type    = $admin->getAssetCodeList('PDTP');
	$asset_type      = $admin->getAssetCodeList('ASTP');
}catch(PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
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
									<input type="hidden" name="mode" id="mode" value="asset_register">
									<div class="row mb-3">
										<label for="asset_name" class="col-3 col-form-label">*Asset 명</label>
										<div class="col-9">
											<input type="text" class="form-control" id="asset_name" name="asset_name" placeholder="" required>
										</div>
									</div>
									<div class="row mb-3">
										<label for="productTypeCd" class="col-3 col-form-label">*Asset 유형</label>
										<div class="col-9">
											<select class="form-select" name="productTypeCd" id="productTypeCd" required>
												<option value="">::: Asset 유형 선택 :::</option>
												<? foreach($product_type as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['productTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-3">
										<label for="assetTypeCd" class="col-3 col-form-label">*Asset 형식</label>
										<div class="col-9">
											<select id="assetTypeCd" name="assetTypeCd" class="form-select" required>
												<option value="">::: Asset 형식 선택 :::</option>
												<? foreach($asset_type as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['assetTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-3">
										<label for="platformCd" class="col-3 col-form-label">*Asset 플랫폼</label>
										<div class="col-9">
											<select id="platformCd" name="platformCd" class="form-select" required>
												<option value="">::: Asset 플랫폼 선택 :::</option>
												<? foreach($asset_platform as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['platformCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-3">
										<label for="publisherCd" class="col-3 col-form-label">Asset 공급처</label>
										<div class="col-9">
											<select class="form-select" name="publisherCd" id="publisherCd">
												<option value="">::: Asset 공급처 선택 :::</option>
												<? foreach($asset_publisher as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['publisherCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-3">
										<div class="col-12">
											<div class="text-end">
												<button type="submit" class="btn btn-primary shadow-none">Asset 등록</button>
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
