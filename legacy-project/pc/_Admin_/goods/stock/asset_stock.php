<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset 재고현황";
$sidebar_file = "sidebar_stock.php";

$page          = filter_input(INPUT_GET, 'page',          FILTER_SANITIZE_STRING);
$asset_id      = filter_input(INPUT_GET, 'asset_id',      FILTER_SANITIZE_STRING);
$asset_name    = filter_input(INPUT_GET, 'asset_name',    FILTER_SANITIZE_STRING);
$productTypeCd = filter_input(INPUT_GET, 'productTypeCd', FILTER_SANITIZE_STRING);
$assetTypeCd   = filter_input(INPUT_GET, 'assetTypeCd',   FILTER_SANITIZE_STRING);
$platformCd    = filter_input(INPUT_GET, 'platformCd',    FILTER_SANITIZE_STRING);
$publisherCd   = filter_input(INPUT_GET, 'publisherCd',   FILTER_SANITIZE_STRING);

$selected['productTypeCd'][$productTypeCd] = "selected";
$selected['assetTypeCd'][$assetTypeCd]     = "selected";
$selected['platformCd'][$platformCd]       = "selected";
$selected['publisherCd'][$publisherCd]     = "selected";

if(!$page){ $page = 1; }

$where = [];
$param = "";
foreach($_GET as $key => $value){
	if($key <> "page" && $value <> ""){
		$param .= "&" . $key . "=" . $value;
	}
}

try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$admin = new Admin($conn);

	$orderby = "stock asc, update_dt desc";

	if(isset($asset_id) && $asset_id <> ""){
		$where[] = " asset_id ='" . $asset_id . "'";
	}
	if(isset($asset_name) && $asset_name <> ""){
		$where[] = " asset_name like '%" . $asset_name . "%'";
	}
	if(isset($publisherCd) && $publisherCd <> ""){
		$where[] = " publisher ='" . $admin->getAssetCodeInfo($publisherCd) . "'";
	}
	if(isset($assetTypeCd) && $assetTypeCd <> ""){
		$where[] = " assetType ='" . $admin->getAssetCodeInfo($assetTypeCd) . "'";
	}
	if(isset($productTypeCd) && $productTypeCd <> ""){
		$where[] = " productType ='" . $admin->getAssetCodeInfo($productTypeCd) . "'";
	}
	if(isset($platformCd) && $platformCd <> ""){
		$where[] = " platform ='" . $admin->getAssetCodeInfo($platformCd) . "'";
	}

	$add_where = "";
	foreach($where as $value){
		$add_where .= " and " . $value;
	}

	$asset_list      = $admin->getAssetList($page, $add_where, $orderby, $param);
	$asset_publisher = $admin->getAssetCodeList('PUBL');
	$asset_platform  = $admin->getAssetCodeList('PLFM');
	$product_type    = $admin->getAssetCodeList('PDTP');
	$asset_type      = $admin->getAssetCodeList('ASTP');
}catch(PDOException $e){
	echo 'Error!: ' . $e->getMessage();
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">Asset 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<input type="hidden" id="page" name="page" value="<?=$page?>">
								<div class="row mb-2">
									<div class="col-lg-2">
										<div class="row">
											<label for="asset_id" class="col-sm-4 col-form-label bg-light border">Asset ID</label>
											<div class="col-sm-8">
												<input type="text" class="form-control" id="asset_id" name="asset_id" placeholder="Asset ID" value="<?=$asset_id?>">
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="row">
											<label for="asset_name" class="col-sm-2 col-form-label bg-light border">Asset 이름</label>
											<div class="col-sm-10">
												<input type="text" class="form-control" id="asset_name" name="asset_name" placeholder="Asset 이름" value="<?=$asset_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="publisherCd" class="col-sm-4 col-form-label bg-light border">Asset 공급처</label>
											<div class="col-sm-8">
												<select class="form-select select2" name="publisherCd" id="publisherCd" data-toggle="select2">
													<option value="">::: Asset 공급처 선택 :::</option>
													<? foreach($asset_publisher as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['publisherCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="productTypeCd" class="col-sm-4 col-form-label bg-light border">Asset 유형</label>
											<div class="col-sm-8">
												<select class="form-select" name="productTypeCd" id="productTypeCd">
													<option value="">::: Asset 유형 선택 :::</option>
													<? foreach($product_type as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['productTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="assetTypeCd" class="col-sm-4 col-form-label bg-light border">Asset 형식</label>
											<div class="col-sm-8">
												<select id="assetTypeCd" name="assetTypeCd" class="form-select">
													<option value="">::: Asset 형식 선택 :::</option>
													<? foreach($asset_type as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['assetTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="platformCd" class="col-sm-4 col-form-label bg-light border">Asset 플랫폼</label>
											<div class="col-sm-8">
												<select id="platformCd" name="platformCd" class="form-select">
													<option value="">::: Asset 플랫폼 선택 :::</option>
													<? foreach($asset_platform as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['platformCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">Asset 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">* 에셋 서버 데이터가 아니고 동기화 된 데이터 입니다. [저재고 동기화]는 재고 30 미만 품목만 갱신합니다.</div>
					<div class="col-12 mb-2">
						<div class="float-start">총 <strong id="total" class="text-danger"><?=number_format($asset_list->total_results)?></strong> 개</div>
						<div class="float-end">
							<button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_stock_batch" title="재고 30 미만(저재고) 품목만 에셋 서버와 동기화합니다.">저재고 동기화</button>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-sm table-centered table-bordered mb-0">
						<thead class="table-dark font-13">
							<tr>
								<th class="text-center">Asset ID</th>
								<th class="text-center">Asset 이름</th>
								<th class="text-center">Asset 유형</th>
								<th class="text-center">Asset 형식</th>
								<th class="text-center">Asset 플랫폼</th>
								<th class="text-center">Asset 공급처</th>
								<th class="text-center">재고</th>
								<th class="text-center">재고수량</th>
								<th class="text-center">업데이트 일자</th>
								<th class="text-center">수정</th>
							</tr>
						</thead>
						<tbody class="bg-white font-12">
						<?
							if($asset_list->success == true){
								$result = $asset_list->resultset->fetchAll();
								foreach($result as $value){
						?>
						<tr>
							<td class="text-center"><?=$value['asset_id']?></td>
							<td><?=$value['asset_name']?></td>
							<td class="text-center"><?=$value['productType']?></td>
							<td class="text-center"><?=$value['assetType']?></td>
							<td class="text-center"><?=$value['platform']?></td>
							<td class="text-center"><?=$value['publisher']?></td>
							<td class="text-center"><button type="button" class="btn btn-outline-dark btn-sm btn_stock_chk" data-idx="<?=$value['asset_id']?>">재고확인</button></td>
							<td class="text-end"><?=number_format($value['stock'])?></td>
							<td class="text-center"><?=$value['update_dt']?></td>
							<td class="text-center"><button type="button" class="btn btn-outline-warning btn-sm btn_asset_modify" data-idx="<?=$value['asset_id']?>">Asset 수정</button></td>
						</tr>
						<?
								}
							}
						?>
						</tbody>
						</table>
						<div class="text-center mt-3"><?=$asset_list->links_html?></div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_stock_chk").bind("click", function(){
		LoadingOverlay("show");
		var asset_id = $(this).data("idx");
		$.ajax({
			type: "POST",
			url: "asset_stock_ps.php",
			data: {mode:"stock_chk", asset_id:asset_id},
			success: function(data){ location.reload(); },
			error: function(data){ alert(data); },
			complete: function(){ LoadingOverlay("hide"); }
		});
	});

	// 저재고 동기화 (재고 30 미만 품목만 에셋 서버와 동기화)
	$("#btn_stock_batch").bind("click", function(){
		LoadingOverlay("show");
		$.ajax({
			type: "POST",
			url: "asset_stock_ps.php",
			data: {mode:"stock_chk_batch", thr:"30"},
			success: function(data){ location.reload(); },
			error: function(data){ alert(data); },
			complete: function(){ LoadingOverlay("hide"); }
		});
	});

	$(".btn_asset_modify").bind("click", function(){
		var asset_id = $(this).data("idx");
		location.href = "../asset/asset_modify.php?asset_id=" + asset_id;
	});
});
</script>
</body>
</html>
