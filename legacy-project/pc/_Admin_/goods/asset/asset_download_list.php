<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset 다운로드(반품출고)";
$sidebar_file = "sidebar_stock.php";

//등록 폼 진입 시 Asset ID 프리필 (asset_list 등에서 넘어오는 경우)
$asset_id = filter_input(INPUT_GET, 'asset_id', FILTER_SANITIZE_NUMBER_INT);

//페이징·검색 GET — 페이지 링크가 full reload 방식이라 page/owner를 GET으로 받아 유지
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
$search_owner = filter_input(INPUT_GET, 'owner', FILTER_SANITIZE_STRING);
if(!$page){ $page = 1; }
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">

				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">Asset 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="alert alert-warning py-2 mb-3 font-13">
							Asset에 등록된 키 중 일정 수량을 <strong>반품출고(RETURN)</strong>로 묶어 다운로드합니다.
							다운로드 후 <strong>삭제</strong> 처리 시 해당 키는 Asset에서 삭제됩니다.
						</div>
					</div>
				</div>

				<!-- 등록 폼 -->
				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">다운로드(반품출고) 등록</h5>
							<div class="card-body">
								<form class="form-horizontal" action="asset_ps.php" method="post">
									<input type="hidden" name="mode" value="asset_download_register">
									<div class="row g-2 mb-2">
										<div class="col-lg-3">
											<label for="asset_id" class="form-label mb-1">*Asset ID</label>
											<input type="number" class="form-control" id="asset_id" name="asset_id" value="<?=$asset_id?>" placeholder="Asset ID" required>
										</div>
										<div class="col-lg-3">
											<label for="owner" class="form-label mb-1">*소유자(owner)</label>
											<input type="text" class="form-control" id="owner" name="owner" placeholder="담당자/업체명" required value="<?=explode("@", $_SESSION['admin']['admin_id'])[0]?>">
										</div>
										<div class="col-lg-2">
											<label for="qty" class="form-label mb-1">*수량 (≤1000)</label>
											<input type="number" class="form-control" id="qty" name="qty" min="1" max="1000" placeholder="수량" required>
										</div>
										<div class="col-lg-2">
											<label for="pin" class="form-label mb-1">*PIN (zip 암호)</label>
											<input type="text" class="form-control" id="pin" name="pin" placeholder="압축 암호" required>
										</div>
									</div>
									<div class="row g-2 mb-2">
										<div class="col-lg-3">
											<label for="download_limit" class="form-label mb-1">*다운로드 제한횟수</label>
											<input type="number" class="form-control" id="download_limit" name="download_limit" min="1" value="5" required>
										</div>
										<div class="col-lg-3">
											<label for="download_expired_day" class="form-label mb-1">*만료일(등록일+N일)</label>
											<input type="number" class="form-control" id="download_expired_day" name="download_expired_day" min="1" value="7" required>
										</div>
										<div class="col-lg-6 d-flex align-items-end justify-content-end">
											<button type="submit" class="btn btn-primary shadow-none">다운로드 등록</button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

				<!-- 목록 검색 -->
				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body py-2">
								<form class="form-horizontal" id="searchFrm" onsubmit="return false;">
									<input type="hidden" id="page" name="page" value="<?=$page?>">
									<div class="row g-2">
										<div class="col-lg-4">
											<div class="input-group">
												<span class="input-group-text">소유자</span>
												<input type="text" class="form-control" id="search_owner" placeholder="owner 검색" value="<?=htmlspecialchars($search_owner, ENT_QUOTES)?>">
												<button type="button" class="btn btn-primary shadow-none" id="btn_search">검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12 mb-2">
						총 <strong id="total" class="text-danger">0</strong> 개
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered table-sm table-bordered mb-0" id="download_list">
										<thead class="table-dark font-13">
											<tr>
												<th class="text-center text-nowrap">번호</th>
												<th class="text-center text-nowrap">PO</th>
												<th class="text-center text-nowrap">Asset ID</th>
												<th class="text-start w-100">Asset 이름</th>
												<th class="text-center text-nowrap">소유자</th>
												<th class="text-center text-nowrap">수량</th>
												<th class="text-center text-nowrap">PIN</th>
												<th class="text-center text-nowrap">남은횟수</th>
												<th class="text-center text-nowrap">다운로드일시</th>
												<th class="text-center text-nowrap">만료일시</th>
												<th class="text-center text-nowrap">등록일시</th>
												<th class="text-center text-nowrap">관리</th>
											</tr>
										</thead>
										<tbody class="font-12">
										</tbody>
									</table>
								</div>
								<div id="paging" class="text-center mt-3"></div>
							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function () {
	getDownloadList($("#page").val());

	$("#btn_search").on("click", function(){
		$("#page").val(1);
		getDownloadList(1);
	});
	$("#search_owner").on("keypress", function(e){
		if(e.which === 13){ $("#page").val(1); getDownloadList(1); }
	});

	//키 다운로드 — 암호화 zip (새 창으로 프록시 호출)
	$("#download_list").on("click", ".btn_dl", function(){
		var po = $(this).data("po");
		location.href = "asset_download.php?po=" + encodeURIComponent(po);
	});

	//삭제(finish) — 다운로드된 키를 Asset에서 삭제 (되돌릴 수 없음). 성공 시 '삭제 완료'로 목록에 표시
	$("#download_list").on("click", ".btn_finish", function(){
		var po = $(this).data("po");
		if(!confirm("PO " + po + " 의 다운로드된 키를 Asset에서 삭제 처리합니다.\n되돌릴 수 없습니다. 진행하시겠습니까?")) return;
		$.ajax({
			url: "asset_ps.php",
			type: "POST",
			dataType: "JSON",
			data: {mode:"asset_download_finish", po:po},
			success: function(res){
				if(res && res.id){
					alert("삭제 완료 (삭제 키: " + (res.count != null ? res.count : "-") + "개)");
					getDownloadList($("#page").val());
				}else{
					alert(res && res.message ? res.message : "처리에 실패했습니다.");
				}
			},
			error: function(){ alert("error"); }
		});
	});
});

function getDownloadList(page){
	$("#page").val(page);
	$.ajax({
		url: "asset_ps.php",
		type: "POST",
		dataType: "JSON",
		data: {mode:"asset_download_list", page:page, size:30, owner:$("#search_owner").val()},
		success: function(str){
			renderDownloadTable(str.content);
			renderPaging({
				page         : page,
				totalPages   : str.totalPages,
				totalElements: str.totalElements,
				baseUrl      : 'asset_download_list.php',
				params       : { owner: $("#search_owner").val() }
			});
		},
		error: function(){ alert("error"); }
	});
}

function renderDownloadTable(list){
	var html = '';
	if(list && list.length){
		$.each(list, function(i, v){
			var finished = (v.is_finish === 'Y');
			var remain = parseInt(v.downloadLimit) || 0;
			var manage = '';
			if(finished){
				manage = '<span class="badge bg-secondary">삭제 완료</span><br/><span class="num font-11">' + escHtml(v.finish_date || '') + '</span>';
			}else{
				//남은 횟수 있으면 다운로드 버튼, 소진되면 '소진' 표시. 삭제(키삭제) 버튼은 항상 노출
				if(remain > 0){
					manage += '<button type="button" class="btn btn-outline-info btn-sm me-1 btn_dl" data-po="' + escHtml(v.po) + '">다운로드</button>';
				}else{
					manage += '<span class="badge bg-warning text-dark me-1">다운로드 소진</span>';
				}
				manage += '<button type="button" class="btn btn-outline-danger btn-sm btn_finish" data-po="' + escHtml(v.po) + '">삭제</button>';
			}
			html += '<tr' + (finished ? ' class="text-muted"' : '') + '>';
			html += '<td class="text-center text-nowrap">' + escHtml(v.no) + '</td>';
			html += '<td class="text-center text-nowrap"><span class="eng font-11">' + escHtml(v.po) + '</span></td>';
			html += '<td class="text-center text-nowrap">' + escHtml(v.asset_id) + '</td>';
			html += '<td class="text-start w-100"><span class="eng font-12">' + escHtml(v.asset_name) + '</span></td>';
			html += '<td class="text-center text-nowrap">' + escHtml(v.owner) + '</td>';
			html += '<td class="text-end text-nowrap">' + escHtml(v.qty) + '</td>';
			html += '<td class="text-center text-nowrap"><span class="eng">' + escHtml(v.pin) + '</span></td>';
			html += '<td class="text-center text-nowrap' + (remain <= 0 ? ' text-danger fw-bold' : '') + '">' + escHtml(v.downloadLimit) + '</td>';
			html += '<td class="text-center text-nowrap">' + (v.download_date ? '<span class="num font-11">' + escHtml(v.download_date) + '</span>' : '<span class="text-muted">미다운로드</span>') + '</td>';
			html += '<td class="text-center text-nowrap"><span class="num font-11">' + escHtml(v.expired_dt || '') + '</span></td>';
			html += '<td class="text-center text-nowrap"><span class="num font-11">' + escHtml(v.reg_date) + '</span></td>';
			html += '<td class="text-center text-nowrap">' + manage + '</td>';
			html += '</tr>';
		});
	}else{
		html = '<tr><td colspan="12" class="text-center text-muted py-3">등록된 다운로드 건이 없습니다.</td></tr>';
	}
	$("#download_list tbody").html(html);
}
</script>
</body>
</html>
