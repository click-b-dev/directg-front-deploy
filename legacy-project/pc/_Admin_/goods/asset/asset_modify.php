<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset 수정";
$sidebar_file = "sidebar_stock.php";

$asset_id = filter_input(INPUT_GET, 'asset_id', FILTER_SANITIZE_NUMBER_INT);

if(!$asset_id){
	msg("잘못된 접근입니다. (asset_id 없음)", "asset_list.php");
	exit;
}

try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$admin = new Admin($conn);
	$asset = new Asset($conn);

	//Asset 서버가 원천 — 수정 폼 값은 로컬 tbl_asset 이 아니라 API(runAssetDetail)에서 직접 조회
	//(로컬 미동기화/stale 여도 항상 서버 현재값을 보여주고, 빈값 덮어쓰기를 방지)
	$detail = json_decode($asset->runAssetDetail($asset_id));
	if(is_array($detail)){ $detail = $detail[0] ?? null; }
	if(empty($detail) || empty($detail->id)){
		msg("Asset 서버에서 정보를 불러오지 못했습니다. (id=".$asset_id.")", "asset_list.php");
		exit;
	}

	//이름은 title (asset.md 1.5), name 폴백
	$asset_name_val = isset($detail->title) ? $detail->title : ($detail->name ?? '');

	$asset_publisher = $admin->getAssetCodeList('PUBL');
	$asset_platform  = $admin->getAssetCodeList('PLFM');
	$product_type    = $admin->getAssetCodeList('PDTP');
	$asset_type      = $admin->getAssetCodeList('ASTP');

	//API 응답의 코드명(이름) → code_id 역매핑하여 셀렉트 프리셀렉트
	$selected['productTypeCd'][$admin->getAssetCode("PDTP", $detail->productType ?? '')] = "selected";
	$selected['assetTypeCd'][$admin->getAssetCode("ASTP",   $detail->assetType ?? '')]   = "selected";
	$selected['platformCd'][$admin->getAssetCode("PLFM",    $detail->platform ?? '')]    = "selected";
	$selected['publisherCd'][$admin->getAssetCode("PUBL",   $detail->publisher ?? '')]   = "selected";
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
								<form class="form-horizontal" method="POST" action="asset_ps.php">
									<input type="hidden" name="mode" value="asset_modify">
									<div class="mb-2 row">
										<label for="asset_id" class="col-sm-3 col-form-label bg-light">* Asset ID</label>
										<div class="col-sm-9">
											<input type="text" id="asset_id" name="asset_id" class="form-control" value="<?=$asset_id?>" readonly>
										</div>
									</div>
									<div class="mb-2 row">
										<label for="asset_name" class="col-sm-3 col-form-label bg-light">* Asset 명</label>
										<div class="col-sm-9">
											<input type="text" id="asset_name" name="asset_name" class="form-control" value="<?=htmlspecialchars($asset_name_val, ENT_QUOTES)?>" required>
										</div>
									</div>
									<div class="row mb-2">
										<label for="productTypeCd" class="col-3 col-form-label bg-light">Asset 유형</label>
										<div class="col-9">
											<select class="form-select" name="productTypeCd" id="productTypeCd">
												<option value="">::: Asset 유형 선택 :::</option>
												<? foreach($product_type as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['productTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-2">
										<label for="assetTypeCd" class="col-3 col-form-label bg-light">Asset 형식</label>
										<div class="col-9">
											<select id="assetTypeCd" name="assetTypeCd" class="form-select">
												<option value="">::: Asset 형식 선택 :::</option>
												<? foreach($asset_type as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['assetTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-2">
										<label for="platformCd" class="col-3 col-form-label bg-light">Asset 플랫폼</label>
										<div class="col-9">
											<select id="platformCd" name="platformCd" class="form-select">
												<option value="">::: Asset 플랫폼 선택 :::</option>
												<? foreach($asset_platform as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['platformCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-2">
										<label for="publisherCd" class="col-3 col-form-label bg-light">Asset 공급처</label>
										<div class="col-9">
											<select class="form-select" name="publisherCd" id="publisherCd">
												<option value="">::: Asset 공급처 선택 :::</option>
												<? foreach($asset_publisher as $value){ ?>
												<option value="<?=$value['code_id']?>" <?=$selected['publisherCd'][$value['code_id']]?>><?=$value['name']?></option>
												<? } ?>
											</select>
										</div>
									</div>
									<div class="row mb-2">
										<div class="col-12">
											<div class="text-end">
												<button type="submit" class="btn btn-primary shadow-none">Asset 저장</button>
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
