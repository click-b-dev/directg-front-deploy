<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 인증 상태 확인";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result = null;
$error  = "";
$data   = null;
try{
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runTest();
	if (!empty($result->success) && !empty($result->data)) {
		$data = is_array($result->data) ? $result->data[0] : $result->data;
	} else {
		$error = pn_extract_error($result);
	}
}catch(Exception $e){
	$error = $e->getMessage();
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /test</small></h4>
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

				<?
				if($error){
					echo '<div class="alert alert-danger"><i class="mdi mdi-alert"></i> '.htmlspecialchars($error).'</div>';
				} else if($data) {
					$isSandbox    = !empty($data->isSandbox);
					$provider     = isset($data->authenticatedProvider) ? $data->authenticatedProvider : null;
					$credentials  = isset($data->credentials) ? $data->credentials : null;
				?>
				<div class="row g-3">
					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body text-center">
								<h5 class="card-title text-muted text-uppercase fs-6">환경</h5>
								<? if($isSandbox){ ?>
									<i class="mdi mdi-flask-outline text-warning" style="font-size:42px;"></i>
									<h4 class="mt-3 mb-1"><span class="badge bg-warning text-dark">SANDBOX</span></h4>
									<small class="text-muted">테스트 환경입니다</small>
								<? } else { ?>
									<i class="mdi mdi-rocket-launch text-danger" style="font-size:42px;"></i>
									<h4 class="mt-3 mb-1"><span class="badge bg-danger">PRODUCTION</span></h4>
									<small class="text-muted">운영 환경입니다</small>
								<? } ?>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<h5 class="card-title text-muted text-uppercase fs-6">인증된 Provider</h5>
								<? if($provider){ ?>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><th style="width:90px;">이름</th><td><?=isset($provider->name)?htmlspecialchars($provider->name):"—"?></td></tr>
										<tr><th>persona</th><td><span class="badge bg-info"><?=isset($provider->persona)?htmlspecialchars($provider->persona):"—"?></span></td></tr>
										<tr><th>ID</th><td class="text-monospace small"><?=isset($provider->id)?htmlspecialchars($provider->id):"—"?></td></tr>
									</tbody>
								</table>
								<? } else { ?>
								<p class="text-muted mb-0">정보 없음</p>
								<? } ?>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="card h-100">
							<div class="card-body">
								<h5 class="card-title text-muted text-uppercase fs-6">API 자격증명</h5>
								<? if($credentials){ ?>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><th style="width:90px;">이름</th><td><?=isset($credentials->name)?htmlspecialchars($credentials->name):"—"?></td></tr>
										<tr><th>clientID</th><td class="text-monospace small" style="word-break:break-all;"><?=isset($credentials->clientID)?htmlspecialchars($credentials->clientID):"—"?></td></tr>
									</tbody>
								</table>
								<? } else { ?>
								<p class="text-muted mb-0">정보 없음</p>
								<? } ?>
							</div>
						</div>
					</div>
				</div>

				<div class="alert alert-success mt-3"><i class="mdi mdi-check-circle"></i> 토큰이 정상적으로 인증되었습니다.</div>

				<? pn_json_box($result); ?>
				<?
				}
				?>
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
