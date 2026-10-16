<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 상품 타입 목록";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result = null;
$error  = "";
$types  = array();
$total  = 0;
try{
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runProductType();
	if (!empty($result->success)) {
		$types = !empty($result->data) ? (array)$result->data : array();
		$total = isset($result->count) ? $result->count : count($types);
	} else {
		$error = pn_extract_error($result);
	}
}catch(Exception $e){
	$error = $e->getMessage();
}

//응답 데이터의 모든 키를 동적으로 수집 (스키마 가변)
$columns = array();
foreach ($types as $t) {
	foreach ((array)$t as $k => $v) {
		if (!in_array($k, $columns, true)) $columns[] = $k;
	}
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /productType</small></h4>
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
					<div class="col-12 text-muted">전체 <strong class="text-dark"><?=number_format($total)?></strong>개</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="table-responsive">
								<table class="table table-hover table-bordered table-sm mb-0">
									<thead class="table-light">
										<tr>
											<th class="text-center" style="width:40px;">#</th>
											<? foreach ($columns as $col){ ?>
											<th><?=htmlspecialchars($col)?></th>
											<? } ?>
										</tr>
									</thead>
									<tbody class="font-12">
										<? if(empty($types)){ ?>
											<tr><td colspan="<?=count($columns)+1?>" class="text-center text-muted py-4">표시할 상품 타입이 없습니다.</td></tr>
										<? } else {
											foreach ($types as $i => $t){
												$arr = (array)$t;
										?>
										<tr>
											<td class="text-center text-muted"><?=$i + 1?></td>
											<? foreach ($columns as $col){
												$v = isset($arr[$col]) ? $arr[$col] : '';
											?>
											<td>
												<? if (is_array($v) || is_object($v)){ ?>
													<code style="font-size:11px;"><?=htmlspecialchars(json_encode($v, JSON_UNESCAPED_UNICODE))?></code>
												<? } else if (is_bool($v)){ ?>
													<span class="badge bg-<?=$v?'success':'secondary'?>"><?=$v?'true':'false'?></span>
												<? } else if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-/', (string)$v)){ ?>
													<span class="text-monospace small"><?=htmlspecialchars($v)?></span>
												<? } else { ?>
													<?=htmlspecialchars((string)$v)?>
												<? } ?>
											</td>
											<? } ?>
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
