<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 캡슐 조회";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$id   = filter_input(INPUT_GET, "id", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result  = null;
$error   = "";
$capsule = null;
if($id){
	try{
		$pointnexus = new PointNexus($mode);
		$result = $pointnexus->runCapsule($id);
		if (!empty($result->success) && !empty($result->data)) {
			$capsule = is_array($result->data) ? $result->data[0] : $result->data;
		} else {
			$error = pn_extract_error($result);
		}
	}catch(Exception $e){
		$error = $e->getMessage();
	}
}

$status_colors = array(
	'init'=>'secondary','running'=>'primary','success'=>'success','failed'=>'danger','cancelled'=>'warning'
);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.uuid { font-family: monospace; font-size: 11px; color: #6c757d; word-break: break-all; }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 14px; }
.label-col { width: 130px; font-size: 12px; color: #6c757d; white-space: nowrap; }
.json-box { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 11px; max-height: 300px; overflow: auto; white-space: pre-wrap; word-break: break-all; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /capsule/{id}</small></h4>
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
											<label for="id" class="col-2 col-form-label col-form-label-sm bg-light border">캡슐 ID</label>
											<div class="col-10">
												<input type="text" class="form-control form-control-sm" id="id" name="id" value="<?=htmlspecialchars($id)?>" placeholder="hex 문자열">
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
					<div class="alert alert-info">캡슐 ID(hex)를 입력하세요.</div>
				<? } else if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else if($capsule){
					$cArr        = (array)$capsule;
					$cId         = isset($cArr['id'])            ? $cArr['id']            : $id;
					$status      = isset($cArr['status'])        ? $cArr['status']        : '—';
					$createdAt   = isset($cArr['createdAt'])     ? $cArr['createdAt']     : '';
					$lastUpdated = isset($cArr['lastUpdatedAt']) ? $cArr['lastUpdatedAt'] : '';
					$flowID      = isset($cArr['flowID'])        ? $cArr['flowID']        : '';
					$flowCode    = isset($cArr['flowCodename'])  ? $cArr['flowCodename']  : '';
					$flowVersion = isset($cArr['flowVersion'])   ? $cArr['flowVersion']   : '';
					$productID   = isset($cArr['productID'])     ? $cArr['productID']     : '';
					$poolName    = isset($cArr['poolName'])      ? $cArr['poolName']      : '';
					$metadata    = isset($cArr['metadata'])      ? $cArr['metadata']      : null;
					$productVariant  = isset($cArr['productVariant'])  ? $cArr['productVariant']  : null;
					$productSnapshot = isset($cArr['productSnapshot']) ? $cArr['productSnapshot'] : null;
					$statusColor = isset($status_colors[$status]) ? $status_colors[$status] : 'info';

					$baseKeys  = array('id','status','createdAt','lastUpdatedAt','flowID','flowCodename','flowVersion','productID','poolName','metadata','productVariant','productSnapshot');
					$extraKeys = array_diff(array_keys($cArr), $baseKeys);
				?>
				<div class="row g-3 mb-3">
					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">캡슐 정보</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><td class="label-col">status</td><td><span class="badge bg-<?=$statusColor?>"><?=htmlspecialchars($status)?></span></td></tr>
										<? if($poolName){ ?>
										<tr><td class="label-col">poolName</td><td><span class="badge bg-light text-dark border"><?=htmlspecialchars($poolName)?></span></td></tr>
										<? } ?>
										<? if($createdAt){ ?>
										<tr><td class="label-col">createdAt</td><td><?=htmlspecialchars(pn_fmt_date($createdAt))?></td></tr>
										<? } ?>
										<? if($lastUpdated){ ?>
										<tr><td class="label-col">lastUpdatedAt</td><td><?=htmlspecialchars(pn_fmt_date($lastUpdated))?></td></tr>
										<? } ?>
										<tr><td class="label-col">id</td><td class="uuid"><?=htmlspecialchars($cId)?></td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">플로우 (flow)</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<? if($flowCode){ ?>
										<tr><td class="label-col">flowCodename</td><td><?=htmlspecialchars($flowCode)?></td></tr>
										<? } ?>
										<? if($flowVersion!==''){ ?>
										<tr><td class="label-col">flowVersion</td><td><?=htmlspecialchars($flowVersion)?></td></tr>
										<? } ?>
										<? if($flowID){ ?>
										<tr><td class="label-col">flowID</td><td class="uuid"><?=htmlspecialchars($flowID)?></td></tr>
										<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">연관 상품</div>
								<? if($productID){ ?>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><td class="label-col">productID</td><td class="uuid">
											<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($productID)?>" class="text-info text-decoration-none">
												<?=htmlspecialchars($productID)?> <i class="mdi mdi-open-in-new"></i>
											</a>
										</td></tr>
									</tbody>
								</table>
								<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($productID)?>" class="btn btn-sm btn-outline-info mt-2">
									<i class="mdi mdi-eye"></i> 상품 상세 조회
								</a>
								<? } else { ?>
								<p class="text-muted mb-0">연관 상품 정보 없음</p>
								<? } ?>
							</div>
						</div>
					</div>
				</div>

				<!-- metadata / variant / snapshot — 비어있지 않을 때만 -->
				<?
				$arrayFields = array(
					'metadata'        => $metadata,
					'productVariant'  => $productVariant,
					'productSnapshot' => $productSnapshot,
				);
				$nonEmpty = array_filter($arrayFields, function($v){ return !empty((array)$v); });
				?>
				<? if(!empty($nonEmpty)){ ?>
				<div class="card mb-3">
					<div class="card-body">
						<div class="section-title">상세 데이터</div>
						<? foreach($nonEmpty as $name => $val){ ?>
						<div class="mb-3">
							<div class="text-muted small mb-1"><?=htmlspecialchars($name)?></div>
							<pre class="json-box mb-0" style="max-height:200px;"><?=htmlspecialchars(json_encode($val, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))?></pre>
						</div>
						<? } ?>
					</div>
				</div>
				<? } ?>

				<? if(!empty($extraKeys)){ ?>
				<div class="card mb-3">
					<div class="card-body">
						<div class="section-title">추가 정보</div>
						<table class="table table-sm table-borderless mb-0">
							<tbody>
								<? foreach($extraKeys as $k){
									$v = $cArr[$k];
									$display = is_scalar($v) ? (string)$v : json_encode($v, JSON_UNESCAPED_UNICODE);
								?>
								<tr><td class="label-col"><?=htmlspecialchars($k)?></td><td><?=htmlspecialchars($display)?></td></tr>
								<? } ?>
							</tbody>
						</table>
					</div>
				</div>
				<? } ?>

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
