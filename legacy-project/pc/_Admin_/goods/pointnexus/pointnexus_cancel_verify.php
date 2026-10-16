<?
//PointNexus 비동기 취소(cancel_pending) 검증 — 어드민 수동 실행 페이지
//order_view 열람 시 자동검증도 되지만, 이 페이지는 여러 건을 한 번에 조회/확정하는 sweep 용도.
//검증은 비파괴적: GET /operation 으로 최종 상태만 읽어 canceled/cancel_failed 로 확정(새 취소 발행 아님).
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 취소 검증 (cancel_pending)";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

//현재 cancel_pending 건수 미리 집계 — UI 표시용
$target_cnt = 0;
try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$stmt = $conn->prepare("
		SELECT COUNT(*)
		FROM tbl_order_item_pointnexus pn
		INNER JOIN (
			SELECT ordno, productID, MAX(idx) AS max_idx
			FROM tbl_order_item_pointnexus
			WHERE mode = :mode
			GROUP BY ordno, productID
		) latest ON latest.ordno = pn.ordno AND latest.productID = pn.productID AND latest.max_idx = pn.idx
		WHERE pn.status = 'cancel_pending'
		  AND pn.operationID IS NOT NULL AND pn.operationID != ''");
	$stmt->execute(array(':mode' => $mode));
	$target_cnt = (int)$stmt->fetchColumn();
} catch (PDOException $e) {
	//무시 (UI 표시만 영향)
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.stat-card .stat-value { font-size: 22px; font-weight: 600; }
#targetTable td, #targetTable th { vertical-align: middle; font-size: 12px; }
.run-log {
	max-height: 320px;
	overflow-y: auto;
	background: #f8f9fa;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	padding: 8px;
	font-family: monospace;
	font-size: 12px;
}
.run-log .row-ok   { color: #198754; }
.run-log .row-fail { color: #dc3545; }
.run-log .row-info { color: #6c757d; }
.run-log .row-batch{ color: #0d6efd; font-weight: 600; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">operationCancel 비동기 결과 → GET /operation 으로 확정</small></h4>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-md-6">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">검증 대기(cancel_pending) 항목 (<?=htmlspecialchars($mode)?>)</div>
								<div class="stat-value text-warning" id="targetCnt"><?=number_format($target_cnt)?></div>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">현재 시각</div>
								<div class="stat-value" style="font-size:16px;"><?=date('Y-m-d H:i:s')?></div>
							</div>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">조회 설정</h5>
						<div class="card-body">
							<form id="cfgForm" class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2 mb-2">
									<div class="col-3">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode, true); ?></div>
										</div>
									</div>
								</div>
							</form>

							<div class="alert alert-info py-2 mb-3" style="font-size:13px;">
								<i class="mdi mdi-information"></i>
								<strong><?=$mode=='test'?'Sandbox(test)':'Production(prod)'?></strong> 환경 —
								어드민 취소/VCNT 배치가 <code>runOperationCancel</code>(비동기)로 접수한 건은 status <code>cancel_pending</code>으로 남습니다.
								<strong>검증 실행</strong>은 <code>GET /operation</code>으로 최종 상태를 읽어
								<code>done</code>이면 <code>canceled</code>(+주문상품 취소완료), <code>error</code>면 <code>cancel_failed</code>(수동확인)로 확정합니다.
								<strong>새로운 취소를 발행하지 않는 비파괴 작업</strong>입니다.
							</div>

							<div class="text-end">
								<button type="button" id="btnPreview" class="btn btn-outline-primary btn-sm shadow-none">
									<i class="mdi mdi-eye"></i> 대기 항목 조회
								</button>
								<button type="button" id="btnRun" class="btn btn-primary btn-sm shadow-none">
									<i class="mdi mdi-check-decagram"></i> 검증 실행
								</button>
								<button type="button" id="btnStop" class="btn btn-outline-secondary btn-sm shadow-none" disabled>
									<i class="mdi mdi-stop"></i> 중단
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="row mt-3">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-light">검증 대기 목록 <small class="text-muted" id="listCount"></small></h5>
							<div class="card-body">
								<table class="table table-centered table-sm table-bordered border-light w-100" id="targetTable">
									<thead class="table-light">
										<tr>
											<th class="text-center">결제번호</th>
											<th class="text-center">상품명</th>
											<th class="text-center">productID</th>
											<th class="text-center">operationID</th>
											<th class="text-center">state</th>
											<th class="text-center">결과</th>
											<th class="text-center">메시지</th>
										</tr>
									</thead>
									<tbody class="bg-white" id="targetRows">
										<tr><td colspan="7" class="text-center text-muted py-3">"대기 항목 조회"를 눌러주세요.</td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div class="row mt-3">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-light">실행 로그</h5>
							<div class="card-body">
								<div class="run-log" id="runLog"></div>
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
	var btnPreview  = document.getElementById('btnPreview');
	var btnRun      = document.getElementById('btnRun');
	var btnStop     = document.getElementById('btnStop');
	var rowsEl      = document.getElementById('targetRows');
	var listCount   = document.getElementById('listCount');
	var elTargetCnt = document.getElementById('targetCnt');
	var runLog      = document.getElementById('runLog');

	var mode = <?=json_encode($mode)?>;
	var ORDER_VIEW = '/_Admin_/order/order_view.php';
	var ENDPOINT = 'pointnexus_cancel_verify_batch.php';
	var stopRequested = false, running = false;

	function resultBadge(result){
		var map = { 'ok':'bg-success', 'fail':'bg-danger', 'pending':'bg-secondary', 'preview':'bg-light text-dark' };
		var cls = map[result] || 'bg-light text-dark';
		var sp = document.createElement('span');
		sp.className = 'badge ' + cls;
		sp.textContent = result;
		return sp;
	}

	function td(text, cls){
		var c = document.createElement('td');
		if(cls) c.className = cls;
		c.textContent = (text === null || text === undefined) ? '' : text;
		return c;
	}

	function renderRows(items){
		rowsEl.innerHTML = '';
		if(!items || !items.length){
			var tr = document.createElement('tr');
			var c = document.createElement('td');
			c.colSpan = 7;
			c.className = 'text-center text-muted py-3';
			c.textContent = '검증 대기 항목이 없습니다.';
			tr.appendChild(c);
			rowsEl.appendChild(tr);
			return;
		}
		items.forEach(function(it){
			var tr = document.createElement('tr');

			//결제번호 → 주문상세 링크
			var tdNo = document.createElement('td');
			tdNo.className = 'text-center';
			if(it.settle_no){
				var a = document.createElement('a');
				a.href = ORDER_VIEW + '?settle_no=' + encodeURIComponent(it.settle_no);
				a.textContent = it.settle_no;
				a.target = '_blank';
				tdNo.appendChild(a);
			} else {
				tdNo.textContent = it.ordno || '';
			}
			tr.appendChild(tdNo);

			tr.appendChild(td(it.name));
			tr.appendChild(td(it.productID, 'text-center'));
			tr.appendChild(td(it.operationID, 'text-center'));
			tr.appendChild(td(it.state, 'text-center'));

			var tdRes = document.createElement('td');
			tdRes.className = 'text-center';
			tdRes.appendChild(resultBadge(it.result));
			tr.appendChild(tdRes);

			tr.appendChild(td(it.message));

			rowsEl.appendChild(tr);
		});
	}

	function appendLog(msg, cls){
		var div = document.createElement('div');
		div.className = cls || '';
		div.textContent = msg;
		runLog.appendChild(div);
		runLog.scrollTop = runLog.scrollHeight;
	}

	//대기 항목 조회 — 검증 없이 목록만 (mutation 없음)
	btnPreview.addEventListener('click', async function(){
		btnPreview.disabled = true;
		rowsEl.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">조회 중...</td></tr>';
		listCount.textContent = '';
		try {
			var fd = new FormData();
			fd.append('mode', mode);
			fd.append('dry_run', '1');
			fd.append('limit', '1000');
			var res  = await fetch(ENDPOINT, { method:'POST', body: fd });
			var json = await res.json();
			if(!json.success){
				rowsEl.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">조회 실패 — ' + (json.error || '알 수 없는 오류') + '</td></tr>';
				return;
			}
			renderRows(json.items);
			var n = (json.items || []).length;
			listCount.textContent = '(' + n + '개' + (json.has_more ? ', 1000건 초과분 제외' : '') + ')';
			elTargetCnt.textContent = Number(json.count).toLocaleString();
		} catch (e){
			rowsEl.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">네트워크 오류 — ' + e.message + '</td></tr>';
		} finally {
			btnPreview.disabled = false;
		}
	});

	btnStop.addEventListener('click', function(){
		stopRequested = true;
		appendLog('▶ 중단 요청 — 현재 배치 완료 후 정지합니다.', 'row-info');
	});

	//검증 실행 — cancel_pending 을 GET /operation 으로 확정 (비파괴)
	btnRun.addEventListener('click', async function(){
		if(running) return;
		if(!confirm('cancel_pending 항목을 GET /operation 으로 검증해 canceled/cancel_failed 로 확정합니다.\n(새 취소를 발행하지 않는 비파괴 작업) 진행할까요? mode=' + mode)) return;

		runLog.innerHTML = '';
		appendLog('▶ 검증 실행 — mode=' + mode, 'row-batch');
		stopRequested = false;
		running = true; btnRun.disabled = true; btnStop.disabled = false; btnPreview.disabled = true;

		var totalRows = 0, totalOk = 0, totalFail = 0, totalPending = 0, batchNo = 0;
		try {
			while(true){
				if(stopRequested){ appendLog('▶ 사용자 중단', 'row-info'); break; }
				var fd = new FormData();
				fd.append('mode', mode);
				fd.append('dry_run', '0');
				fd.append('limit', '50');
				var res, json;
				try {
					res  = await fetch(ENDPOINT, { method:'POST', body: fd });
					json = await res.json();
				} catch (e){ appendLog('✘ 네트워크 오류 — ' + e.message, 'row-fail'); break; }
				if(!json.success){ appendLog('✘ batch 실패 — ' + (json.error || '알 수 없는 오류'), 'row-fail'); break; }
				if(json.count === 0){ appendLog('▶ 검증 완료 — 대기 항목 없음', 'row-batch'); break; }
				batchNo++;
				totalRows    += json.count;
				totalOk      += (json.resolved_ok   || 0);
				totalFail    += (json.resolved_fail || 0);
				totalPending += (json.still_pending || 0);
				appendLog('✓ batch #' + batchNo + ' / 검사=' + json.count + ' / canceled=' + json.resolved_ok + ' / cancel_failed=' + json.resolved_fail + ' / 보류=' + json.still_pending, 'row-batch');
				(json.items || []).forEach(function(it){
					var line = '  · ' + (it.settle_no || it.ordno) + ' / ' + (it.name || '') + ' [state=' + (it.state || '-') + ']';
					appendLog(line + ' — ' + it.message, it.result === 'ok' ? 'row-ok' : (it.result === 'fail' ? 'row-fail' : 'row-info'));
				});
				//보류만 남고 확정이 없으면 무한루프 방지 위해 종료 (아직 처리중 건은 다음에 재시도)
				if(json.resolved_ok === 0 && json.resolved_fail === 0){
					appendLog('▶ 남은 항목은 아직 처리중(보류) — 잠시 후 다시 실행하세요.', 'row-info');
					break;
				}
				if(!json.has_more){ break; }
			}
			appendLog('▶ 종료 — 검사 ' + totalRows + ' / canceled ' + totalOk + ' / cancel_failed ' + totalFail + ' / 보류 ' + totalPending, 'row-batch');
		} finally {
			running = false; btnRun.disabled = false; btnStop.disabled = true; btnPreview.disabled = false;
		}
	});
})();
</script>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
