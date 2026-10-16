<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 카탈로그 동기화";

$mode  = filter_input(INPUT_GET, "mode",  FILTER_SANITIZE_STRING);
$limit = (int)filter_input(INPUT_GET, "limit", FILTER_SANITIZE_NUMBER_INT);
$mode = pn_normalize_mode($mode);
if($limit < 10){ $limit = 100; }
if($limit > 100){ $limit = 100; }

//현재 DB에 적재된 카탈로그 건수
$db_count_total = 0;
$db_count_mode  = 0;
$last_batch_at  = null;
try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$stmt = $conn->query("SELECT COUNT(*) FROM pointnexus_catalogue");
	$db_count_total = (int)$stmt->fetchColumn();

	$stmt = $conn->prepare("SELECT COUNT(*), MAX(update_date) FROM pointnexus_catalogue WHERE mode=:mode");
	$stmt->execute(array(":mode" => $mode));
	$row = $stmt->fetch(PDO::FETCH_NUM);
	$db_count_mode = (int)$row[0];
	$last_batch_at = $row[1];
} catch (PDOException $e) {
	//무시 (UI 표시만 영향)
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.sync-log {
	max-height: 480px;
	overflow-y: auto;
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	padding: 8px;
	font-family: monospace;
	font-size: 12px;
}
.sync-log .row-ok   { color: #198754; }
.sync-log .row-fail { color: #dc3545; }
.sync-log .row-info { color: #6c757d; }
.sync-log .row-batch{ color: #0d6efd; font-weight: 600; }
.stat-card .stat-value { font-size: 22px; font-weight: 600; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /product → pointnexus_catalogue</small></h4>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-md-4">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">DB 적재 카탈로그 (전체)</div>
								<div class="stat-value"><?=number_format($db_count_total)?></div>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">현재 mode (<?=htmlspecialchars($mode)?>) 적재 건수</div>
								<div class="stat-value"><?=number_format($db_count_mode)?></div>
							</div>
						</div>
					</div>
					<div class="col-md-4">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">최근 동기화 시각</div>
								<div class="stat-value" style="font-size:16px;"><?=$last_batch_at ? htmlspecialchars($last_batch_at) : '—'?></div>
							</div>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">동기화 설정</h5>
						<div class="card-body">
							<form id="syncForm" class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2 mb-2">
									<div class="col-3">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode, true); ?></div>
										</div>
									</div>
									<div class="col-3">
										<div class="row g-2">
											<label for="limit" class="col-4 col-form-label col-form-label-sm bg-light border">배치 크기</label>
											<div class="col-8">
												<select class="form-control form-control-sm" id="limit" name="limit" onchange="this.form.submit()">
													<option value="10"  <?=$limit==10?'selected':''?>>10</option>
													<option value="50"  <?=$limit==50?'selected':''?>>50</option>
													<option value="100" <?=$limit==100?'selected':''?>>100</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							</form>

							<div class="alert alert-info py-2 mb-3" style="font-size:13px;">
								<i class="mdi mdi-information"></i>
								<strong><?=$mode=='test'?'Sandbox(test)':'Production(prod)'?></strong> 환경의 PointNexus
								<code>/product</code> 응답을 <code>pointnexus_catalogue</code> 테이블에 INSERT 또는 UPDATE 합니다
								(productID 기준 ON DUPLICATE KEY UPDATE).
								배치 크기 <strong><?=$limit?></strong>개씩 offset을 증가시키며 반복 호출합니다.
							</div>

							<div class="text-end">
								<button type="button" id="btnStart" class="btn btn-primary btn-sm shadow-none">
									<i class="mdi mdi-cloud-download"></i> 동기화 시작
								</button>
								<button type="button" id="btnStop" class="btn btn-outline-danger btn-sm shadow-none" disabled>
									<i class="mdi mdi-stop"></i> 중단
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="row mt-3">
					<div class="col-md-3">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">현재 offset</div>
								<div class="stat-value" id="curOffset">0</div>
							</div>
						</div>
					</div>
					<div class="col-md-3">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">처리된 배치</div>
								<div class="stat-value" id="curBatches">0</div>
							</div>
						</div>
					</div>
					<div class="col-md-3">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">동기화 성공 (누적)</div>
								<div class="stat-value text-success" id="curOk">0</div>
							</div>
						</div>
					</div>
					<div class="col-md-3">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">실패 (누적)</div>
								<div class="stat-value text-danger" id="curFail">0</div>
							</div>
						</div>
					</div>
				</div>

				<div class="row mt-3">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-light">진행 로그</h5>
							<div class="card-body">
								<div class="sync-log" id="syncLog">
									<div class="row-info">동기화를 시작하려면 위의 "동기화 시작" 버튼을 눌러주세요.</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->

<script>
(function(){
	var btnStart  = document.getElementById('btnStart');
	var btnStop   = document.getElementById('btnStop');
	var logEl     = document.getElementById('syncLog');
	var elOffset  = document.getElementById('curOffset');
	var elBatches = document.getElementById('curBatches');
	var elOk      = document.getElementById('curOk');
	var elFail    = document.getElementById('curFail');

	var mode  = <?=json_encode($mode)?>;
	var limit = <?=(int)$limit?>;

	var stopRequested = false;
	var running = false;

	function appendLog(msg, cls){
		var div = document.createElement('div');
		div.className = cls || '';
		div.textContent = msg;
		logEl.appendChild(div);
		logEl.scrollTop = logEl.scrollHeight;
	}

	function setRunning(on){
		running = on;
		btnStart.disabled = on;
		btnStop.disabled  = !on;
	}

	btnStop.addEventListener('click', function(){
		stopRequested = true;
		appendLog('▶ 중단 요청 — 현재 배치 완료 후 정지합니다.', 'row-info');
	});

	btnStart.addEventListener('click', async function(){
		if(running) return;

		logEl.innerHTML = '';
		appendLog('▶ 동기화 시작 — mode=' + mode + ', limit=' + limit, 'row-batch');
		stopRequested = false;
		setRunning(true);

		var offset       = 0;
		var totalBatches = 0;
		var totalOk      = 0;
		var totalFail    = 0;

		try {
			while(true){
				if(stopRequested){
					appendLog('▶ 사용자 중단', 'row-info');
					break;
				}

				var fd = new FormData();
				fd.append('mode',   mode);
				fd.append('offset', offset);
				fd.append('limit',  limit);

				var res, json;
				try {
					res = await fetch('pointnexus_catalogue_sync_batch.php', { method:'POST', body: fd });
					json = await res.json();
				} catch (e){
					appendLog('✘ 네트워크 오류 — ' + e.message + ' (offset=' + offset + ')', 'row-fail');
					break;
				}

				if(!json.success){
					appendLog('✘ batch 실패 — ' + (json.error || '알 수 없는 오류') + ' (offset=' + offset + ')', 'row-fail');
					break;
				}

				totalBatches++;
				totalOk   += (json.synced_ok   || 0);
				totalFail += (json.synced_fail || 0);

				appendLog(
					'✓ batch #' + totalBatches +
					' offset=' + offset +
					' / 응답=' + json.count +
					' / 성공=' + json.synced_ok +
					' / 실패=' + json.synced_fail +
					(json.has_more ? ' / 다음 페이지 있음' : ' / 마지막 페이지'),
					'row-batch'
				);

				if(json.items && json.items.length){
					json.items.forEach(function(it){
						if(it.error){
							appendLog('  ✘ ' + it.id + ' / ' + (it.name || '') + ' — ' + it.error, 'row-fail');
						} else {
							appendLog('  · ' + it.id + ' / ' + (it.name || ''), 'row-ok');
						}
					});
				}

				elOffset.textContent  = (offset + json.count).toLocaleString();
				elBatches.textContent = totalBatches.toLocaleString();
				elOk.textContent      = totalOk.toLocaleString();
				elFail.textContent    = totalFail.toLocaleString();

				if(!json.has_more){
					appendLog('▶ 동기화 완료 — 총 ' + (totalOk + totalFail) + '건 (성공 ' + totalOk + ' / 실패 ' + totalFail + ')', 'row-batch');
					break;
				}

				offset += json.count;
			}
		} finally {
			setRunning(false);
		}
	});
})();
</script>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
