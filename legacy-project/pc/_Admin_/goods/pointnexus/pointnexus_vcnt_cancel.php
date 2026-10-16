<?
//PointNexus VCNT 미입금 만료 자동 cancel — 어드민 수동 실행 페이지
//취소 실행은 주문상세(order_view.php)에서도 가능 — 이 페이지는 취소 대상 목록 뷰 역할
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus VCNT 미입금 만료 취소";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

//현재 대상(미입금 만료 + 최신 row 활성) 건수 미리 집계 — UI 표시용
$target_cnt = 0;
try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$now = date('YmdHis');
	$stmt = $conn->prepare("
		SELECT COUNT(DISTINCT pn.ordno)
		FROM tbl_order_item_pointnexus pn
		INNER JOIN (
			SELECT ordno, productID, MAX(idx) AS max_idx
			FROM tbl_order_item_pointnexus
			WHERE mode = :mode
			GROUP BY ordno, productID
		) latest ON latest.ordno = pn.ordno AND latest.productID = pn.productID AND latest.max_idx = pn.idx
		INNER JOIN tbl_order_item a ON a.ordno = pn.ordno
		INNER JOIN tbl_order b ON b.settle_no = a.settle_no
		INNER JOIN (
			SELECT settle_no, MAX(va_date) AS va_date
			FROM kcp_log
			WHERE va_date IS NOT NULL AND va_date != ''
			GROUP BY settle_no
		) c ON c.settle_no = b.settle_no
		WHERE b.pg_provider = 'kcp'
		  AND b.step = '1'
		  AND pn.status IN ('booked','pending_reveal','sold')
		  AND pn.operationID IS NOT NULL AND pn.operationID != ''
		  AND c.va_date < :now");
	$stmt->execute(array(':mode' => $mode, ':now' => $now));
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">VCNT 미입금 만료 → runBookCancel / runOperationCancel</small></h4>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-md-6">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">현재 취소 대상 주문 (<?=htmlspecialchars($mode)?> / 미입금 만료)</div>
								<div class="stat-value text-danger" id="targetCnt"><?=number_format($target_cnt)?></div>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="card stat-card">
							<div class="card-body">
								<div class="text-muted">기준 시각 (입금기한 만료 판정)</div>
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

							<div class="alert alert-warning py-2 mb-3" style="font-size:13px;">
								<i class="mdi mdi-alert"></i>
								<strong><?=$mode=='test'?'Sandbox(test)':'Production(prod)'?></strong> 환경 대상 —
								KCP 가상계좌(VCNT) 주문 중 <strong>입금기한(va_date) 만료 + 미입금(step=1)</strong>인데
								PointNexus 예약/판매가 아직 활성으로 남은 건입니다.
								결제번호를 클릭하면 주문상세에서 취소할 수 있습니다
								(<code>booked</code> → <code>runBookCancel</code>,
								<code>pending_reveal·sold</code> → <code>runOperationCancel</code>).
							</div>

							<div class="text-end">
								<button type="button" id="btnPreview" class="btn btn-outline-primary btn-sm shadow-none">
									<i class="mdi mdi-eye"></i> 취소 대상 조회
								</button>
								<!--
								필요 시 이 페이지에서 직접 일괄 취소를 실행하려면 아래 버튼의 주석을 해제하세요.
								(취소 실행은 주문상세 order_view.php에서도 가능)
								<button type="button" id="btnRun" class="btn btn-danger btn-sm shadow-none">
									<i class="mdi mdi-cancel"></i> 취소 실행
								</button>
								<button type="button" id="btnStop" class="btn btn-outline-secondary btn-sm shadow-none" disabled>
									<i class="mdi mdi-stop"></i> 중단
								</button>
								-->
							</div>
						</div>
					</div>
				</div>

				<div class="row mt-3">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-light">취소 대상 목록 <small class="text-muted" id="listCount"></small></h5>
							<div class="card-body">
								<table class="table table-centered table-sm table-bordered border-light w-100" id="targetTable">
									<thead class="table-light">
										<tr>
											<th class="text-center">주문일자</th>
											<th class="text-center">결제번호</th>
											<th class="text-center">회원</th>
											<th class="text-center">상품명</th>
											<th class="text-center">주문금액</th>
											<th class="text-center">상태</th>
											<th class="text-center">취소방식</th>
											<th class="text-center">마감시각(만료)</th>
										</tr>
									</thead>
									<tbody class="bg-white" id="targetRows">
										<tr><td colspan="8" class="text-center text-muted py-3">"취소 대상 조회"를 눌러주세요.</td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<!--
				취소 실행(btnRun)을 사용할 때 진행 로그 영역. 위 버튼 주석 해제 시 함께 노출하세요.
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
				-->
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
	var btnPreview = document.getElementById('btnPreview');
	var rowsEl     = document.getElementById('targetRows');
	var listCount  = document.getElementById('listCount');
	var elTargetCnt = document.getElementById('targetCnt');

	var mode = <?=json_encode($mode)?>;
	var ORDER_VIEW = '/_Admin_/order/order_view.php';

	function badge(status){
		var map = { 'booked':'bg-secondary', 'pending_reveal':'bg-warning text-dark', 'sold':'bg-info' };
		var cls = map[status] || 'bg-light text-dark';
		var sp = document.createElement('span');
		sp.className = 'badge ' + cls;
		sp.textContent = status;
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
			c.colSpan = 8;
			c.className = 'text-center text-muted py-3';
			c.textContent = '취소 대상이 없습니다.';
			tr.appendChild(c);
			rowsEl.appendChild(tr);
			return;
		}
		items.forEach(function(it){
			var tr = document.createElement('tr');

			tr.appendChild(td(it.reg_date, 'text-center'));

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

			tr.appendChild(td(it.m_id));
			tr.appendChild(td(it.name));
			tr.appendChild(td(Number(it.total_price || 0).toLocaleString(), 'text-end'));

			var tdStatus = document.createElement('td');
			tdStatus.className = 'text-center';
			tdStatus.appendChild(badge(it.status));
			tr.appendChild(tdStatus);

			tr.appendChild(td(it.action, 'text-center'));
			tr.appendChild(td(it.va_date, 'text-center text-danger'));

			rowsEl.appendChild(tr);
		});
	}

	//취소 대상 조회 — 취소 없이 1회 조회 (mutation 없음)
	btnPreview.addEventListener('click', async function(){
		btnPreview.disabled = true;
		rowsEl.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">조회 중...</td></tr>';
		listCount.textContent = '';
		try {
			var fd = new FormData();
			fd.append('mode', mode);
			fd.append('dry_run', '1');
			fd.append('limit', '1000');
			var res  = await fetch('pointnexus_vcnt_cancel_batch.php', { method:'POST', body: fd });
			var json = await res.json();
			if(!json.success){
				rowsEl.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-3">조회 실패 — ' + (json.error || '알 수 없는 오류') + '</td></tr>';
				return;
			}
			renderRows(json.items);
			var n = (json.items || []).length;
			listCount.textContent = '(주문 ' + json.count + '건 / 항목 ' + n + '개' + (json.has_more ? ', 1000건 초과분 제외' : '') + ')';
			elTargetCnt.textContent = Number(json.count).toLocaleString();
		} catch (e){
			rowsEl.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-3">네트워크 오류 — ' + e.message + '</td></tr>';
		} finally {
			btnPreview.disabled = false;
		}
	});

	/*
	// === 취소 실행 (필요 시 주석 해제) ===
	// 위 btnRun/btnStop 버튼과 #runLog 영역 주석도 함께 해제해야 동작합니다.
	var btnRun  = document.getElementById('btnRun');
	var btnStop = document.getElementById('btnStop');
	var runLog  = document.getElementById('runLog');
	var stopRequested = false, running = false;

	function appendLog(msg, cls){
		var div = document.createElement('div');
		div.className = cls || '';
		div.textContent = msg;
		runLog.appendChild(div);
		runLog.scrollTop = runLog.scrollHeight;
	}

	btnStop.addEventListener('click', function(){
		stopRequested = true;
		appendLog('▶ 중단 요청 — 현재 배치 완료 후 정지합니다.', 'row-info');
	});

	btnRun.addEventListener('click', async function(){
		if(running) return;
		if(!confirm('미입금 만료된 VCNT PointNexus 예약/판매를 실제로 취소합니다.\n되돌릴 수 없습니다. 진행할까요? (mode=' + mode + ')')) return;

		runLog.innerHTML = '';
		appendLog('▶ 취소 실행 — mode=' + mode, 'row-batch');
		stopRequested = false;
		running = true; btnRun.disabled = true; btnStop.disabled = false; btnPreview.disabled = true;

		var totalOrders = 0, totalOk = 0, totalFail = 0, batchNo = 0;
		try {
			while(true){
				if(stopRequested){ appendLog('▶ 사용자 중단', 'row-info'); break; }
				var fd = new FormData();
				fd.append('mode', mode);
				fd.append('dry_run', '0');
				fd.append('limit', '50');
				var res, json;
				try {
					res  = await fetch('pointnexus_vcnt_cancel_batch.php', { method:'POST', body: fd });
					json = await res.json();
				} catch (e){ appendLog('✘ 네트워크 오류 — ' + e.message, 'row-fail'); break; }
				if(!json.success){ appendLog('✘ batch 실패 — ' + (json.error || '알 수 없는 오류'), 'row-fail'); break; }
				if(json.count === 0){ appendLog('▶ 취소 완료 — 더 이상 대상 없음', 'row-batch'); break; }
				batchNo++;
				totalOrders += json.count;
				totalOk     += (json.canceled_ok   || 0);
				totalFail   += (json.canceled_fail || 0);
				appendLog('✓ batch #' + batchNo + ' / 주문=' + json.count + ' / 취소성공=' + json.canceled_ok + ' / 실패=' + json.canceled_fail, 'row-batch');
				(json.items || []).forEach(function(it){
					var line = '  · ' + (it.settle_no || it.ordno) + ' / ' + (it.name || '') + ' [' + it.status + ' → ' + it.action + ']';
					appendLog(line + ' — ' + it.message, it.result === 'ok' ? 'row-ok' : (it.result === 'fail' ? 'row-fail' : ''));
				});
				if(!json.has_more){ appendLog('▶ 취소 완료 — 총 주문 ' + totalOrders + ' / 성공 ' + totalOk + ' / 실패 ' + totalFail, 'row-batch'); break; }
			}
		} finally {
			running = false; btnRun.disabled = false; btnStop.disabled = true; btnPreview.disabled = false;
		}
	});
	*/
})();
</script>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
