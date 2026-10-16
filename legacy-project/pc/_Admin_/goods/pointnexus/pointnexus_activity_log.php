<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 활동 로그 목록";

$mode          = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$offset        = (int)filter_input(INPUT_GET, "offset", FILTER_SANITIZE_NUMBER_INT);
$limit         = (int)filter_input(INPUT_GET, "limit",  FILTER_SANITIZE_NUMBER_INT);
$sort          = filter_input(INPUT_GET, "sort", FILTER_SANITIZE_STRING);
$sortDirection = filter_input(INPUT_GET, "sortDirection", FILTER_SANITIZE_STRING);
$filters       = filter_input(INPUT_GET, "filters", FILTER_DEFAULT);

$mode = pn_normalize_mode($mode);
if($offset < 0){ $offset = 0; }
if(!$limit || $limit < 10){ $limit = 50; }
if($limit > 100){ $limit = 100; }

$sort_list = array("createdAt","productID","type");
if(!in_array($sort, $sort_list)){ $sort = "createdAt"; }
if($sortDirection!="ASC"){ $sortDirection = "DESC"; }
if($filters === null){ $filters = ''; }

$result = null;
$error  = "";
$logs   = array();
$total  = 0;
try{
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runActivityLog($offset, $limit, $sort, $sortDirection, $filters);
	if (!empty($result->success)) {
		$logs  = !empty($result->data) ? (array)$result->data : array();
		$total = isset($result->count) ? $result->count : count($logs);
	} else {
		$error = pn_extract_error($result);
	}
}catch(Exception $e){
	$error = $e->getMessage();
}

$type_colors = array(
	'sale'=>'success','cancel'=>'danger','refund'=>'warning','revenue'=>'info','reveal'=>'primary'
);

$prev_offset = max(0, $offset - $limit);
$next_offset = $offset + $limit;
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.uuid { font-family: monospace; font-size: 11px; color: #6c757d; word-break: break-all; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /activitylog</small></h4>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2 mb-2">
									<div class="col-2">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode, false); ?></div>
										</div>
									</div>
									<div class="col-2">
										<div class="row g-2">
											<label for="limit" class="col-4 col-form-label col-form-label-sm bg-light border">limit</label>
											<div class="col-8">
												<input type="number" class="form-control form-control-sm" id="limit" name="limit" min="10" max="100" value="<?=$limit?>">
											</div>
										</div>
									</div>
									<div class="col-2">
										<div class="row g-2">
											<label for="sort" class="col-3 col-form-label col-form-label-sm bg-light border">sort</label>
											<div class="col-9">
												<select class="form-control form-control-sm" id="sort" name="sort">
													<? foreach($sort_list as $s){ ?>
													<option value="<?=$s?>" <?=$sort==$s?"selected":""?>><?=$s?></option>
													<? } ?>
											</select>
											</div>
										</div>
									</div>
									<div class="col-2">
										<div class="row g-2">
											<label for="sortDirection" class="col-4 col-form-label col-form-label-sm bg-light border">dir</label>
											<div class="col-8">
												<select class="form-control form-control-sm" id="sortDirection" name="sortDirection">
													<option value="DESC" <?=$sortDirection=="DESC"?"selected":""?>>DESC</option>
													<option value="ASC" <?=$sortDirection=="ASC"?"selected":""?>>ASC</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-4">
										<div class="row g-2">
											<label for="filters" class="col-3 col-form-label col-form-label-sm bg-light border">filters</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="filters" name="filters" placeholder='[{"field":"type","op":"=","value":"sale"}]' value="<?=htmlspecialchars($filters)?>">
											</div>
										</div>
									</div>
								</div>
								<input type="hidden" name="offset" value="0">
								<div class="row g-0 mt-1">
									<div class="col-12 text-end">
										<button type="submit" class="btn btn-primary btn-sm shadow-none">검색</button>
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
					<div class="col-12 d-flex justify-content-between align-items-center">
						<div class="text-muted">
							전체 <strong class="text-dark"><?=number_format($total)?></strong>개
							<? if ($total > 0){ ?>
							&middot; <?=number_format($offset + 1)?>–<?=number_format(min($offset + $limit, $total))?> 표시
							<? } ?>
						</div>
						<div class="d-flex gap-2">
							<? if($offset > 0){ ?>
							<a href="?<?=http_build_query(array_merge($_GET, array('offset'=>$prev_offset)))?>" class="btn btn-sm btn-light">‹ 이전</a>
							<? } ?>
							<? if($next_offset < $total){ ?>
							<a href="?<?=http_build_query(array_merge($_GET, array('offset'=>$next_offset)))?>" class="btn btn-sm btn-light">다음 ›</a>
							<? } ?>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="table-responsive">
								<table class="table table-hover table-bordered table-sm mb-0">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center" style="width:40px;">#</th>
											<th class="text-center" style="width:90px;">type</th>
											<th class="text-center" style="width:150px;">createdAt</th>
											<th>상품</th>
											<th class="text-center" style="width:200px;">operationID</th>
											<th class="text-center" style="width:200px;">로그 ID</th>
											<th class="text-center" style="width:60px;"></th>
										</tr>
									</thead>
									<tbody class="font-12">
									<? if(empty($logs)){ ?>
										<tr><td colspan="7" class="text-center text-muted py-4">활동 로그가 없습니다.</td></tr>
									<? } else {
										foreach ($logs as $i => $log){
											$lArr      = (array)$log;
											$lid       = isset($lArr['id'])           ? $lArr['id']           : '';
											$type      = isset($lArr['type'])         ? $lArr['type']         : '';
											$createdAt = isset($lArr['createdAt'])    ? $lArr['createdAt']    : '';
											$opID      = isset($lArr['operationID']) ? $lArr['operationID']  : '';
											$prod      = isset($lArr['product'])      ? $lArr['product']      : null;
											$prodID    = isset($prod->id)             ? $prod->id             : '';
											$prodName  = isset($prod->genericName)    ? $prod->genericName    : '';
											$tColor    = isset($type_colors[$type])   ? $type_colors[$type]   : 'secondary';
									?>
										<tr>
											<td class="text-center text-muted"><?=$offset + $i + 1?></td>
											<td class="text-center"><span class="badge bg-<?=$tColor?>"><?=htmlspecialchars($type ? $type : '—')?></span></td>
											<td class="text-center small"><?=htmlspecialchars(pn_fmt_date($createdAt))?></td>
											<td>
												<? if($prodName){ ?>
												<div class="fw-semibold"><?=htmlspecialchars($prodName)?></div>
												<? } ?>
												<? if($prodID){ ?>
												<div class="uuid">
													<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($prodID)?>" class="text-info text-decoration-none"><?=htmlspecialchars($prodID)?></a>
												</div>
												<? } else { ?>
												<span class="text-muted">—</span>
												<? } ?>
											</td>
											<td class="text-center uuid">
												<? if($opID){ ?>
												<a href="pointnexus_operation.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($opID)?>" class="text-info text-decoration-none"><?=htmlspecialchars($opID)?></a>
												<? } else { ?>
												<span class="text-muted">—</span>
												<? } ?>
											</td>
											<td class="text-center uuid"><?=htmlspecialchars($lid)?></td>
											<td class="text-center">
												<a href="pointnexus_activity_log_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($lid)?>" class="btn btn-sm btn-outline-info"><i class="mdi mdi-eye"></i></a>
											</td>
										</tr>
									<? } } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div class="d-flex justify-content-end gap-2 mt-2 mb-2">
					<? if($offset > 0){ ?>
					<a href="?<?=http_build_query(array_merge($_GET, array('offset'=>$prev_offset)))?>" class="btn btn-sm btn-light">‹ 이전</a>
					<? } ?>
					<? if($next_offset < $total){ ?>
					<a href="?<?=http_build_query(array_merge($_GET, array('offset'=>$next_offset)))?>" class="btn btn-sm btn-light">다음 ›</a>
					<? } ?>
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
