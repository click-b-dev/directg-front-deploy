<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset Code 현황";
$sidebar_file = "sidebar_stock.php";

//코드 그룹 정의 (asset.md 3장)
$code_groups = array(
	"PDTP" => "상품유형 (Product Type)",
	"ASTP" => "상품형식 (Asset Type)",
	"PLFM" => "플랫폼 (Platform)",
	"PUBL" => "공급처 (Publisher)",
);
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
						<div class="alert alert-secondary py-2 mb-2 font-13">
							Asset 서버에서 실시간 조회한 코드 그룹별 현황입니다. 그룹 탭을 선택하세요.
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">

								<!-- 그룹 탭 -->
								<ul class="nav nav-tabs nav-bordered nav-justified mb-3 fs-6" id="codeTab" role="tablist">
									<? $first = true; foreach($code_groups as $gid => $gname){ ?>
									<li class="nav-item">
										<a class="nav-link <?=$first?'active':''?>" data-group="<?=$gid?>" href="javascript:void(0);">
											<span class="font-12"><?=$gname?></span>
										</a>
									</li>
									<? $first = false; } ?>
								</ul>

								<div class="d-flex justify-content-between align-items-center mb-2">
									<div>총 <strong id="total" class="text-danger">0</strong> 개</div>
									<div class="text-muted font-12">현재 그룹: <strong id="cur_group">PDTP</strong></div>
								</div>

								<div class="table-responsive">
									<table class="table table-centered table-sm table-bordered mb-0" id="code_list">
										<thead class="table-dark font-13">
											<tr>
												<th class="text-center text-nowrap">번호</th>
												<th class="text-center text-nowrap">코드(ID)</th>
												<th class="text-center text-nowrap">그룹</th>
												<th class="text-center text-nowrap">시퀀스</th>
												<th class="text-start w-100">코드명</th>
												<th class="text-center text-nowrap">관리</th>
											</tr>
										</thead>
										<tbody class="font-12">
										</tbody>
									</table>
								</div>

							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<!-- 코드 수정 레이어팝업 (asset_list.php 모달과 동일 패턴) -->
<div class="modal fade" id="codeModifyModal" tabindex="-1" aria-labelledby="codeModifyModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="codeModifyModalLabel">Asset Code 수정</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<form name="codeFrm" id="codeFrm">
					<input type="hidden" name="mode" value="asset_code_modify"/>
					<div class="mb-3">
						<label for="modify_code_id" class="col-form-label">코드(ID)</label>
						<input type="text" class="form-control" id="modify_code_id" name="code_id" readonly>
					</div>
					<div class="mb-3">
						<label for="modify_code_name" class="col-form-label">코드명</label>
						<input type="text" class="form-control" id="modify_code_name" name="name" required>
					</div>
				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary shadow-none" data-bs-dismiss="modal">취소</button>
				<button type="button" class="btn btn-primary shadow-none" id="btn_code_modify_submit">수정</button>
			</div>
		</div>
	</div>
</div>

<script>
$(document).ready(function () {
	//최초 진입 — 첫 탭(PDTP) 로드
	getCodeList($("#codeTab .nav-link.active").data("group"));

	//탭 클릭 시 해당 그룹 조회
	$("#codeTab").on("click", ".nav-link", function(){
		$("#codeTab .nav-link").removeClass("active");
		$(this).addClass("active");
		var group = $(this).data("group");
		$("#cur_group").text(group);
		getCodeList(group);
	});

	//코드 수정 모달 — 이름만 변경 가능 (asset.md 4.2). 트리거 버튼의 data로 폼 채움
	var codeModifyModal = document.getElementById('codeModifyModal');
	if(codeModifyModal){
		codeModifyModal.addEventListener('show.bs.modal', function(event){
			var button = event.relatedTarget;
			$("#modify_code_id").val(button.getAttribute('data-code'));
			$("#modify_code_name").val(button.getAttribute('data-name'));
		});
	}

	//수정 실행
	$("#btn_code_modify_submit").on("click", function(){
		var code = $("#modify_code_id").val();
		var name = $("#modify_code_name").val().trim();
		if(name === ""){ alert("코드명을 입력하세요."); return; }
		codeAction({mode:"asset_code_modify", code_id:code, name:name}, "코드 수정 완료");
	});

	//코드 삭제 (asset.md 4.3)
	$("#code_list").on("click", ".btn_code_delete", function(){
		var code = $(this).data("code");
		var name = $(this).data("name");
		if(!confirm("코드 [" + code + "] " + name + " 을(를) 삭제하시겠습니까?")) return;
		codeAction({mode:"asset_code_delete", code_id:code}, "코드 삭제 완료");
	});
});

//수정/삭제 공용 — 성공(id) 시 현재 그룹 재조회, 실패 시 message 표시
function codeAction(data, okMsg){
	$.ajax({
		url: "asset_ps.php",
		type: "POST",
		dataType: "JSON",
		data: data,
		success: function(res){
			if(res && res.id){
				//수정 모달이 열려있으면 닫기 (삭제는 모달 없음 → 인스턴스 null 안전 처리)
				var modalEl = document.getElementById('codeModifyModal');
				var inst = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
				if(inst){ inst.hide(); }
				alert(okMsg);
				getCodeList($("#codeTab .nav-link.active").data("group"));
			}else{
				alert(res && res.message ? res.message : "처리에 실패했습니다.");
			}
		},
		error: function(){ alert("error"); }
	});
}

function getCodeList(group){
	$.ajax({
		url: "asset_ps.php",
		type: "POST",
		dataType: "JSON",
		data: {mode:"asset_code_list", group_id:group},
		success: function(res){
			renderCodeTable(res.content);
		},
		error: function(){ alert("error"); }
	});
}

function renderCodeTable(list){
	var html = '';
	if(list && list.length){
		$.each(list, function(i, v){
			//id 예: PLFM0001 → 앞 4자리 그룹 / 뒤 시퀀스 (asset.md 3장). subId 있으면 우선 사용
			var code = escHtml(v.id);
			var grp  = escHtml(v.groupId || (v.id ? String(v.id).substring(0,4) : ''));
			var seq  = escHtml(v.subId  || (v.id ? String(v.id).substring(4)  : ''));
			var name = v.name || '';
			html += '<tr>';
			html += '<td class="text-center text-nowrap">' + (i+1) + '</td>';
			html += '<td class="text-center text-nowrap"><span class="eng">' + code + '</span></td>';
			html += '<td class="text-center text-nowrap"><span class="eng">' + grp + '</span></td>';
			html += '<td class="text-center text-nowrap"><span class="eng">' + seq + '</span></td>';
			html += '<td class="text-start w-100">' + escHtml(name) + '</td>';
			html += '<td class="text-center text-nowrap">'
			      + '<button type="button" class="btn btn-outline-warning btn-sm me-1 btn_code_modify" data-bs-toggle="modal" data-bs-target="#codeModifyModal" data-code="' + code + '" data-name="' + escHtml(name) + '">수정</button>'
			      + '<button type="button" class="btn btn-outline-danger btn-sm btn_code_delete" data-code="' + code + '" data-name="' + escHtml(name) + '">삭제</button>'
			      + '</td>';
			html += '</tr>';
		});
		$("#total").text(list.length);
	}else{
		html = '<tr><td colspan="6" class="text-center text-muted py-3">조회된 코드가 없습니다.</td></tr>';
		$("#total").text(0);
	}
	$("#code_list tbody").html(html);
}
</script>
</body>
</html>
