<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 프로모션 캠페인 목록";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result    = null;
$error     = "";
$campaigns = array();
$total     = 0;
try{
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runPromo();
	if (!empty($result->success)) {
		$campaigns = !empty($result->data) ? (array)$result->data : array();
		$total     = isset($result->count) ? $result->count : count($campaigns);
	} else {
		$error = pn_extract_error($result);
	}
}catch(Exception $e){
	$error = $e->getMessage();
}

$state_colors = array('running'=>'success','scheduled'=>'info','ended'=>'secondary','paused'=>'warning');
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.uuid { font-family: monospace; font-size: 12px; color: #6c757d; word-break: break-all; }
.table .badge { font-size: 12px; font-weight: 500; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /promo</small></h4>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2">
									<div class="col-3">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode); ?></div>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<? if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else { ?>
				<div class="row mb-2">
					<div class="col-12 text-muted">전체 <strong class="text-dark"><?=number_format($total)?></strong>개 캠페인</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="table-responsive">
								<table class="table table-hover table-bordered table-sm mb-0">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center" style="width:40px;">#</th>
											<th>캠페인명</th>
											<th>발행자 (issuer)</th>
											<th class="text-center" style="width:90px;">상태</th>
											<th class="text-center" style="width:80px;">상품 수</th>
											<th class="text-center" style="width:140px;">시작일</th>
											<th class="text-center" style="width:140px;">종료일</th>
											<th class="text-center" style="width:200px;">캠페인 ID</th>
											<th class="text-center" style="width:60px;"></th>
										</tr>
									</thead>
									<tbody class="font-12">
									<? if(empty($campaigns)){ ?>
										<tr><td colspan="9" class="text-center text-muted py-4">진행 중인 캠페인이 없습니다.</td></tr>
									<? } else {
										foreach ($campaigns as $i => $c){
											$cArr        = (array)$c;
											$cid         = isset($cArr['id'])        ? $cArr['id']        : '';
											$name        = isset($cArr['name'])      ? $cArr['name']      : '—';
											$state       = isset($cArr['state'])     ? $cArr['state']     : '';
											$issuer      = isset($cArr['issuer'])    ? $cArr['issuer']    : null;
											$issuerName  = isset($issuer->name)      ? $issuer->name      : '—';
											$productIDs  = !empty($cArr['productIDs']) ? (array)$cArr['productIDs'] : array();
											$startDate   = isset($cArr['startDate']) ? $cArr['startDate'] : '';
											$endDate     = isset($cArr['endDate'])   ? $cArr['endDate']   : '';
											$stateColor  = isset($state_colors[$state]) ? $state_colors[$state] : 'info';
									?>
										<tr>
											<td class="text-center text-muted"><?=$i + 1?></td>
											<td class="fw-semibold"><?=htmlspecialchars($name)?></td>
											<td><?=htmlspecialchars($issuerName)?></td>
											<td class="text-center">
												<? if($state){ ?><span class="badge bg-<?=$stateColor?>"><?=htmlspecialchars($state)?></span><? } else { ?><span class="text-muted">—</span><? } ?>
											</td>
											<td class="text-center"><?=count($productIDs)?>개</td>
											<td class="text-center"><?=htmlspecialchars(pn_fmt_date($startDate, 16))?></td>
											<td class="text-center"><?=htmlspecialchars(pn_fmt_date($endDate, 16))?></td>
											<td class="text-center uuid"><?=htmlspecialchars($cid)?></td>
											<td class="text-center">
												<a href="pointnexus_promo_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($cid)?>" class="btn btn-sm btn-outline-info"><i class="mdi mdi-eye"></i></a>
											</td>
										</tr>
									<? } } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<? pn_json_box($result); ?>
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
