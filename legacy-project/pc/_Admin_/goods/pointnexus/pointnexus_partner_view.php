<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 파트너 상세";

$mode      = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$partnerID = filter_input(INPUT_GET, "partnerID", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result  = null;
$error   = "";
$partner = null;
if($partnerID){
	try{
		$pointnexus = new PointNexus($mode);
		$result = $pointnexus->runPartnerRetrieve($partnerID);
		if (!empty($result->success) && !empty($result->data)) {
			$partner = is_array($result->data) ? $result->data[0] : $result->data;
		} else {
			$error = pn_extract_error($result);
		}
	}catch(Exception $e){
		$error = $e->getMessage();
	}
}

$persona_colors = array(
	'publisher'=>'primary','manufacturer'=>'success','distributor'=>'info',
	'store'=>'warning','influencer'=>'danger','platform'=>'secondary','trader'=>'dark'
);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.uuid { font-family: monospace; font-size: 11px; color: #6c757d; word-break: break-all; }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 14px; }
.label-col { width: 130px; font-size: 12px; color: #6c757d; white-space: nowrap; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /partner/{partnerID}</small></h4>
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
											<label for="partnerID" class="col-2 col-form-label col-form-label-sm bg-light border">파트너 UUID</label>
											<div class="col-10">
												<input type="text" class="form-control form-control-sm" id="partnerID" name="partnerID" value="<?=htmlspecialchars($partnerID)?>" placeholder="예: bce51079-b46b-45bd-8029-e03f7d9578b9">
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

				<? if(!$partnerID){ ?>
					<div class="alert alert-info">파트너 UUID를 입력하세요.</div>
				<? } else if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else if($partner){
					$pArr      = (array)$partner;
					$pid       = isset($pArr['id'])      ? $pArr['id']      : $partnerID;
					$pname     = isset($pArr['name'])    ? $pArr['name']    : '—';
					$pper      = isset($pArr['persona']) ? $pArr['persona'] : '—';
					$useAPI    = !empty($pArr['useAPI']);
					$contracts = !empty($pArr['contracts']) ? (array)$pArr['contracts'] : array();
					$color     = isset($persona_colors[$pper]) ? $persona_colors[$pper] : 'secondary';
				?>

				<div class="card mb-3">
					<div class="card-body">
						<div class="section-title">기본 정보</div>
						<table class="table table-sm table-borderless mb-0">
							<tbody>
								<tr><td class="label-col">이름</td><td class="fw-semibold"><?=htmlspecialchars($pname)?></td></tr>
								<tr><td class="label-col">persona</td><td><span class="badge bg-<?=$color?>"><?=htmlspecialchars($pper)?></span></td></tr>
								<tr><td class="label-col">useAPI</td><td>
									<? if($useAPI){ ?><span class="badge bg-success">true</span><? } else { ?><span class="badge bg-secondary">false</span><? } ?>
								</td></tr>
								<tr><td class="label-col">파트너 ID</td><td class="uuid"><?=htmlspecialchars($pid)?></td></tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="card mb-3">
					<div class="card-body">
						<div class="section-title">계약 (contracts) — <?=count($contracts)?>건</div>
						<? if(empty($contracts)){ ?>
						<p class="text-muted mb-0">계약 정보 없음</p>
						<? } else {
							//계약 객체의 필드를 동적으로 수집
							$contractKeys = array();
							foreach ($contracts as $ct) {
								foreach ((array)$ct as $k => $v) {
									if (!in_array($k, $contractKeys, true)) $contractKeys[] = $k;
								}
							}
						?>
						<div class="table-responsive">
							<table class="table table-sm table-bordered mb-0">
								<thead class="table-light">
									<tr>
										<th class="text-center" style="width:40px;">#</th>
										<? foreach($contractKeys as $k){ ?>
										<th><?=htmlspecialchars($k)?></th>
										<? } ?>
									</tr>
								</thead>
								<tbody class="font-12">
									<? foreach ($contracts as $i => $ct){
										$ctArr = (array)$ct;
									?>
									<tr>
										<td class="text-center text-muted"><?=$i + 1?></td>
										<? foreach ($contractKeys as $k){
											$v = isset($ctArr[$k]) ? $ctArr[$k] : '';
										?>
										<td>
											<? if (is_array($v) || is_object($v)){ ?>
												<code style="font-size:11px;"><?=htmlspecialchars(json_encode($v, JSON_UNESCAPED_UNICODE))?></code>
											<? } else if (is_bool($v)){ ?>
												<span class="badge bg-<?=$v?'success':'secondary'?>"><?=$v?'true':'false'?></span>
											<? } else if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-/', (string)$v)){ ?>
												<span class="uuid"><?=htmlspecialchars($v)?></span>
											<? } else { ?>
												<?=htmlspecialchars((string)$v)?>
											<? } ?>
										</td>
										<? } ?>
									</tr>
									<? } ?>
								</tbody>
							</table>
						</div>
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
