<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 프로모션 캠페인 상세";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$id   = filter_input(INPUT_GET, "id", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result   = null;
$error    = "";
$campaign = null;
if($id){
	try{
		$pointnexus = new PointNexus($mode);
		$result = $pointnexus->runPromoRetrieve($id);
		if (!empty($result->success) && !empty($result->data)) {
			$campaign = is_array($result->data) ? $result->data[0] : $result->data;
		} else {
			$error = pn_extract_error($result);
		}
	}catch(Exception $e){
		$error = $e->getMessage();
	}
}

$state_colors = array('running'=>'success','scheduled'=>'info','ended'=>'secondary','paused'=>'warning');
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.uuid { font-family: monospace; font-size: 12px; color: #6c757d; word-break: break-all; }
.table .badge { font-size: 12px; font-weight: 500; }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 14px; }
.label-col { width: 130px; font-size: 12px; color: #6c757d; white-space: nowrap; }
.promo-price { color: #f59e0b; font-weight: 700; }
.origin-price { text-decoration: line-through; color: #6c757d; font-size: 11px; }
</style>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">PointNexus 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /promo/{id}</small></h4>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2">
									<div class="col-2">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode, false); ?></div>
										</div>
									</div>
									<div class="col-8">
										<div class="row g-2">
											<label for="id" class="col-2 col-form-label col-form-label-sm bg-light border">캠페인 UUID</label>
											<div class="col-10">
												<input type="text" class="form-control form-control-sm" id="id" name="id" value="<?=htmlspecialchars($id)?>" placeholder="예: 164e6469-cccc-41ab-bd0b-9843e3c0ecfb">
											</div>
										</div>
									</div>
									<div class="col-2 text-end">
										<button type="submit" class="btn btn-primary btn-sm shadow-none">조회</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<? if(!$id){ ?>
					<div class="alert alert-info">캠페인 UUID를 입력하세요.</div>
				<? } else if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else if($campaign){
					$cArr        = (array)$campaign;
					$cId         = isset($cArr['id'])         ? $cArr['id']         : $id;
					$name        = isset($cArr['name'])       ? $cArr['name']       : '—';
					$state       = isset($cArr['state'])      ? $cArr['state']      : '';
					$issuer      = isset($cArr['issuer'])     ? $cArr['issuer']     : null;
					$startDate   = isset($cArr['startDate'])  ? $cArr['startDate']  : '';
					$endDate     = isset($cArr['endDate'])    ? $cArr['endDate']    : '';
					$productIDs  = !empty($cArr['productIDs']) ? (array)$cArr['productIDs'] : array();
					$products    = !empty($cArr['products'])   ? (array)$cArr['products']   : array();
					$stateColor  = isset($state_colors[$state]) ? $state_colors[$state] : 'info';
				?>

				<div class="row g-3 mb-3">
					<div class="col-lg-6">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">캠페인 정보</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><td class="label-col">이름</td><td class="fw-semibold"><?=htmlspecialchars($name)?></td></tr>
										<? if($state){ ?>
										<tr><td class="label-col">상태 (state)</td><td><span class="badge bg-<?=$stateColor?>"><?=htmlspecialchars($state)?></span></td></tr>
										<? } ?>
										<? if($startDate){ ?><tr><td class="label-col">시작일</td><td><?=htmlspecialchars(pn_fmt_date($startDate, 19))?></td></tr><? } ?>
										<? if($endDate){ ?><tr><td class="label-col">종료일</td><td><?=htmlspecialchars(pn_fmt_date($endDate, 19))?></td></tr><? } ?>
										<tr><td class="label-col">캠페인 ID</td><td class="uuid"><?=htmlspecialchars($cId)?></td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div class="col-lg-6">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">발행자 (issuer)</div>
								<? if($issuer){ ?>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><td class="label-col">이름</td><td><?=isset($issuer->name)?htmlspecialchars($issuer->name):'—'?></td></tr>
										<tr><td class="label-col">ID</td><td class="uuid"><?=isset($issuer->id)?htmlspecialchars($issuer->id):'—'?></td></tr>
									</tbody>
								</table>
								<? } else { ?>
								<p class="text-muted mb-0">발행자 정보 없음</p>
								<? } ?>
							</div>
						</div>
					</div>
				</div>

				<!-- 캠페인 상품 목록 -->
				<div class="card mb-3">
					<div class="card-body">
						<div class="section-title">캠페인 대상 상품 (<?=!empty($products) ? count($products) : count($productIDs)?>개)</div>
						<? if(!empty($products)){ ?>
						<div class="table-responsive">
							<table class="table table-sm table-bordered mb-0">
								<thead class="table-light">
									<tr>
										<th class="text-center" style="width:40px;">#</th>
										<th>상품명</th>
										<th class="text-center" style="width:90px;">기본 할인</th>
										<th>가격 (통화별)</th>
										<th class="text-center" style="width:200px;">상품 ID</th>
										<th class="text-center" style="width:60px;"></th>
									</tr>
								</thead>
								<tbody class="font-12">
									<? foreach ($products as $i => $p){
										$pId      = isset($p->id)   ? $p->id   : '';
										$pName    = isset($p->name) ? $p->name : '—';
										$defPct   = isset($p->defaultDiscountPercent) ? $p->defaultDiscountPercent : 0;
										$prices   = !empty($p->prices) ? (array)$p->prices : array();
									?>
									<tr>
										<td class="text-center text-muted"><?=$i + 1?></td>
										<td class="fw-semibold"><?=htmlspecialchars($pName)?></td>
										<td class="text-center">
											<? if($defPct > 0){ ?><span class="badge bg-warning text-dark"><?=(int)$defPct?>%</span><? } else { ?><span class="text-muted">—</span><? } ?>
										</td>
										<td>
											<? if(!empty($prices)){
												$hidden_pp = 0;
												foreach ($prices as $pr){
													$curr     = isset($pr->currency) ? $pr->currency : null;
													$currName = isset($curr->name) ? $curr->name : '';
													if (!pn_is_relevant_currency($currName)){ $hidden_pp++; continue; }
													$initFmt  = isset($pr->initialPrice->formatted)    ? $pr->initialPrice->formatted    : '';
													$discFmt  = isset($pr->discountedPrice->formatted) ? $pr->discountedPrice->formatted : '';
													$discPct  = isset($pr->discount->percent) ? $pr->discount->percent : 0;
											?>
											<div class="mb-1" style="font-size:12px; line-height:1.5;">
												<span class="badge bg-light text-dark border me-1" style="font-weight:normal;"><?=htmlspecialchars($currName)?></span>
												<? if($discPct > 0){ ?>
												<span class="origin-price"><?=htmlspecialchars(pn_fmt_price($initFmt))?></span>
												<span class="promo-price ms-1"><?=htmlspecialchars(pn_fmt_price($discFmt))?></span>
												<span class="text-warning ms-1">(-<?=(int)$discPct?>%)</span>
												<? } else { ?>
												<span><?=htmlspecialchars(pn_fmt_price($initFmt))?></span>
												<? } ?>
											</div>
											<? }
												if ($hidden_pp > 0){ ?>
												<span class="text-muted">외 <?=$hidden_pp?>개 통화</span>
												<? }
											} else { ?>
												<span class="text-muted">—</span>
											<? } ?>
										</td>
										<td class="text-center uuid"><?=htmlspecialchars($pId)?></td>
										<td class="text-center">
											<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($pId)?>" class="btn btn-sm btn-outline-info"><i class="mdi mdi-eye"></i></a>
										</td>
									</tr>
									<? } ?>
								</tbody>
							</table>
						</div>
						<? } else if(!empty($productIDs)){ ?>
						<table class="table table-sm table-bordered mb-0">
							<thead class="table-light">
								<tr>
									<th class="text-center" style="width:40px;">#</th>
									<th>상품 ID</th>
									<th class="text-center" style="width:60px;"></th>
								</tr>
							</thead>
							<tbody>
								<? foreach($productIDs as $i => $pid){ ?>
								<tr>
									<td class="text-center text-muted"><?=$i + 1?></td>
									<td class="uuid"><?=htmlspecialchars($pid)?></td>
									<td class="text-center">
										<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($pid)?>" class="btn btn-sm btn-outline-info"><i class="mdi mdi-eye"></i></a>
									</td>
								</tr>
								<? } ?>
							</tbody>
						</table>
						<? } else { ?>
						<p class="text-muted mb-0">대상 상품 정보 없음</p>
						<? } ?>
					</div>
				</div>

				<? pn_json_box($result); ?>
				<? } else { ?>
					<div class="alert alert-warning">데이터 없음</div>
				<? } ?>
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
