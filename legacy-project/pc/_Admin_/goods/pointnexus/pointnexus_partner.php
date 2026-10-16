<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 파트너 목록";

$mode    = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$persona = filter_input(INPUT_GET, "persona", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);
if($persona === null){ $persona = ''; }

$personas = array(''=>'(전체)','publisher'=>'publisher','manufacturer'=>'manufacturer','distributor'=>'distributor','store'=>'store','influencer'=>'influencer','platform'=>'platform','trader'=>'trader');
$persona_colors = array(
	'publisher'=>'primary','manufacturer'=>'success','distributor'=>'info',
	'store'=>'warning','influencer'=>'danger','platform'=>'secondary','trader'=>'dark'
);

$result   = null;
$error    = "";
$partners = array();
$total    = 0;
try{
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runPartner($persona);
	if (!empty($result->success)) {
		$partners = !empty($result->data) ? (array)$result->data : array();
		$total    = isset($result->count) ? $result->count : count($partners);
	} else {
		$error = pn_extract_error($result);
	}
}catch(Exception $e){
	$error = $e->getMessage();
}
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /partner</small></h4>
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
											<div class="col-9"><? pn_mode_select($mode, false); ?></div>
										</div>
									</div>
									<div class="col-4">
										<div class="row g-2">
											<label for="persona" class="col-3 col-form-label col-form-label-sm bg-light border">persona</label>
											<div class="col-9">
												<select class="form-control form-control-sm" id="persona" name="persona" onchange="this.form.submit()">
													<? foreach ($personas as $val => $disp){ ?>
													<option value="<?=htmlspecialchars($val)?>" <?=$persona===$val?'selected':''?>><?=htmlspecialchars($disp)?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-2 text-end">
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
					<div class="col-12 text-muted">전체 <strong class="text-dark"><?=number_format($total)?></strong>개 파트너<?=$persona ? ' (persona: '.htmlspecialchars($persona).')' : ''?></div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="table-responsive">
								<table class="table table-hover table-bordered table-sm mb-0">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center" style="width:40px;">#</th>
											<th>이름</th>
											<th class="text-center" style="width:120px;">persona</th>
											<th class="text-center" style="width:90px;">useAPI</th>
											<th class="text-center" style="width:100px;">계약 수</th>
											<th class="text-center" style="width:200px;">파트너 ID</th>
											<th class="text-center" style="width:60px;"></th>
										</tr>
									</thead>
									<tbody class="font-12">
									<? if(empty($partners)){ ?>
										<tr><td colspan="7" class="text-center text-muted py-4">파트너가 없습니다.</td></tr>
									<? } else {
										foreach ($partners as $i => $p){
											$pArr      = (array)$p;
											$pid       = isset($pArr['id'])      ? $pArr['id']      : '';
											$pname     = isset($pArr['name'])    ? $pArr['name']    : '—';
											$pper      = isset($pArr['persona']) ? $pArr['persona'] : '';
											$useAPI    = !empty($pArr['useAPI']);
											$contracts = !empty($pArr['contracts']) ? (array)$pArr['contracts'] : array();
											$color     = isset($persona_colors[$pper]) ? $persona_colors[$pper] : 'secondary';
									?>
										<tr>
											<td class="text-center text-muted"><?=$i + 1?></td>
											<td class="fw-semibold"><?=htmlspecialchars($pname)?></td>
											<td class="text-center"><span class="badge bg-<?=$color?>"><?=htmlspecialchars($pper ? $pper : '—')?></span></td>
											<td class="text-center">
												<? if($useAPI){ ?><span class="badge bg-success">true</span><? } else { ?><span class="badge bg-secondary">false</span><? } ?>
											</td>
											<td class="text-center"><?=count($contracts)?>개</td>
											<td class="text-center uuid"><?=htmlspecialchars($pid)?></td>
											<td class="text-center">
												<a href="pointnexus_partner_view.php?mode=<?=urlencode($mode)?>&partnerID=<?=urlencode($pid)?>" class="btn btn-sm btn-outline-info"><i class="mdi mdi-eye"></i></a>
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
