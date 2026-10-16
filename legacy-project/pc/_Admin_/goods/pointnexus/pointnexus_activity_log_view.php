<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 활동 로그 상세";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$id   = filter_input(INPUT_GET, "id", FILTER_SANITIZE_STRING);
if($mode!="prod"){ $mode = "test"; }

$result = null;
$error  = "";
$log    = null;
if($id){
	try{
		$pointnexus = new PointNexus($mode);
		$result = $pointnexus->runActivityLogRetrieve($id);
		if (!empty($result->success) && !empty($result->data)) {
			$log = is_array($result->data) ? $result->data[0] : $result->data;
		} else {
			$error = pn_extract_error($result);
		}
	}catch(Exception $e){
		$error = $e->getMessage();
	}
}

$type_colors = array(
	'sale'=>'success','cancel'=>'danger','refund'=>'warning','revenue'=>'info','reveal'=>'primary'
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /activitylog/{id}</small></h4>
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
											<label for="id" class="col-2 col-form-label col-form-label-sm bg-light border">로그 UUID</label>
											<div class="col-10">
												<input type="text" class="form-control form-control-sm" id="id" name="id" value="<?=htmlspecialchars($id)?>">
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
					<div class="alert alert-info">로그 UUID를 입력하세요.</div>
				<? } else if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else if($log){
					$lArr      = (array)$log;
					$lid       = isset($lArr['id'])              ? $lArr['id']              : $id;
					$type      = isset($lArr['type'])            ? $lArr['type']            : '';
					$createdAt = isset($lArr['createdAt'])       ? $lArr['createdAt']       : '';
					$opID      = isset($lArr['operationID'])     ? $lArr['operationID']     : '';
					$fromOpID  = isset($lArr['fromOperationID']) ? $lArr['fromOperationID'] : '';
					$prod      = isset($lArr['product'])         ? $lArr['product']         : null;
					$prodArr   = $prod ? (array)$prod : array();
					$prodID    = isset($prodArr['id'])           ? $prodArr['id']           : '';
					$tColor    = isset($type_colors[$type])      ? $type_colors[$type]      : 'secondary';

					$baseKeys  = array('id','type','createdAt','operationID','fromOperationID','product');
					$extraKeys = array_diff(array_keys($lArr), $baseKeys);
				?>

				<div class="row g-3 mb-3">
					<div class="col-md-6">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">로그 정보</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><td class="label-col">id</td><td class="uuid"><?=htmlspecialchars($lid)?></td></tr>
										<? if($type){ ?>
										<tr><td class="label-col">type</td><td><span class="badge bg-<?=$tColor?>"><?=htmlspecialchars($type)?></span></td></tr>
										<? } ?>
										<? if($createdAt){ ?>
										<tr><td class="label-col">createdAt</td><td><?=htmlspecialchars(pn_fmt_date($createdAt))?></td></tr>
										<? } ?>
										<? if($opID){ ?>
										<tr><td class="label-col">operationID</td><td class="uuid">
											<a href="pointnexus_operation.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($opID)?>" class="text-info text-decoration-none">
												<?=htmlspecialchars($opID)?> <i class="mdi mdi-open-in-new"></i>
											</a>
										</td></tr>
										<? } ?>
										<? if($fromOpID){ ?>
										<tr><td class="label-col">fromOperationID</td><td class="uuid">
											<a href="pointnexus_operation.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($fromOpID)?>" class="text-info text-decoration-none">
												<?=htmlspecialchars($fromOpID)?> <i class="mdi mdi-open-in-new"></i>
											</a>
											<small class="text-muted d-block mt-1">원본 오퍼레이션 (예: 취소의 원래 판매)</small>
										</td></tr>
										<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">상품 (product)</div>
								<? if($prod){ ?>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<? foreach($prodArr as $k => $v){
											if (is_array($v) || is_object($v)) {
												$display = json_encode($v, JSON_UNESCAPED_UNICODE);
											} else {
												$display = (string)$v;
											}
										?>
										<tr>
											<td class="label-col"><?=htmlspecialchars($k)?></td>
											<td<?=$k==='id'?' class="uuid"':''?>>
												<? if($k==='id' && $prodID){ ?>
												<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($prodID)?>" class="text-info text-decoration-none">
													<?=htmlspecialchars($display)?> <i class="mdi mdi-open-in-new"></i>
												</a>
												<? } else { ?>
												<?=htmlspecialchars($display)?>
												<? } ?>
											</td>
										</tr>
										<? } ?>
									</tbody>
								</table>
								<? } else { ?>
								<p class="text-muted mb-0">상품 정보 없음</p>
								<? } ?>
							</div>
						</div>
					</div>
				</div>

				<? if(!empty($extraKeys)){ ?>
				<div class="card mb-3">
					<div class="card-body">
						<div class="section-title">추가 정보</div>
						<table class="table table-sm table-borderless mb-0">
							<tbody>
								<? foreach($extraKeys as $k){
									$v = $lArr[$k];
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
