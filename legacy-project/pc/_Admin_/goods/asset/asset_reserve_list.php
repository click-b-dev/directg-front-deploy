<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset 예약현황";
$sidebar_file = "sidebar_stock.php";

$ordno = filter_input(INPUT_GET, 'ordno', FILTER_SANITIZE_STRING);  //주문번호(po)
$owner = filter_input(INPUT_GET, 'owner', FILTER_SANITIZE_STRING);  //소유자(회원아이디)
$cancelled = filter_input(INPUT_GET, 'cancelled', FILTER_SANITIZE_STRING);  //all=전체 / 1=취소건만 / 0=취소건 제외

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);

if(!$page){
	$page =1;
}

if($cancelled == ""){ $cancelled = "all"; }

$checked['cancelled'][$cancelled] = "checked";

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

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">예약(Reserve) 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<input type="hidden" id="page" name="page" value="<?=$page?>">
								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="owner" class="col-sm-4 col-form-label bg-light border">회원아이디</label>
											<div class="col-sm-8">
												<input type="text" class="form-control" id="owner" name="owner" placeholder="회원아이디 (M/ 자동보정)" value="<?=$owner?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="ordno" class="col-sm-4 col-form-label bg-light border">주문번호</label>
											<div class="col-sm-8">
												<input type="text" class="form-control" id="ordno" name="ordno" placeholder="주문번호(po)" value="<?=$ordno?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label class="col-sm-4 col-form-label bg-light border">취소여부</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" class="form-check-input" id="cancelled_all" name="cancelled" value="all" <?=$checked['cancelled']["all"]?>>
													<label class="form-check-label" for="cancelled_all">전체</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" class="form-check-input" id="cancelled_0" name="cancelled" value="0" <?=$checked['cancelled']["0"]?>>
													<label class="form-check-label" for="cancelled_0">취소건 제외</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" class="form-check-input" id="cancelled_1" name="cancelled" value="1" <?=$checked['cancelled']["1"]?>>
													<label class="form-check-label" for="cancelled_1">취소건만</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">예약 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12 mb-2">
						총 <strong id="total" class="text-danger"></strong> 개
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<table class="table table-centered nowrap table-sm table-bordered" id="reserve_list">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center" style="">Reserve ID</th>
										<th class="text-center" style="">Asset ID</th>
										<th class="text-center" style="">Asset 이름</th>
										<th class="text-center" style="">주문번호(po)</th>
										<th class="text-center" style="">소유자</th>
										<th class="text-center" style="">예약일시</th>
										<th class="text-center" style="">상태</th>
										<th class="text-center" style="">취소정보</th>
									</tr>
								</thead>
								<tbody class="font-12">
								</tbody>
								</table>
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
	var page      = $("#page").val();
	var ordno     = $("#ordno").val();
	var owner     = $("#owner").val();
	var cancelled = $("input[name=cancelled]:checked").val();
	var size      = 30;

	getReserveList(page, size, ordno, owner, cancelled);

	//검색 제출 시 페이지를 1로 리셋 (페이지네이션 링크는 폼 밖이라 영향 없음)
	$("#page").closest("form").on("submit", function(){
		$("#page").val(1);
	});
});

function getReserveList(page, size, ordno, owner, cancelled){
	$.ajax({
		url: "asset_ps.php",
		type: "POST",
		dataType: "JSON",
		data: {mode:"assets_reserve_list", method:"POST", page:page, size:size, ordno:ordno, owner:owner, cancelled:cancelled},
		success: function(str){
			renderReserveTable(str.content);
			renderPaging({
				page         : page,
				totalPages   : str.totalPages,
				totalElements: str.totalElements,
				baseUrl      : 'asset_reserve_list.php',
				params       : {ordno:ordno, owner:owner, cancelled:cancelled}
			});
		},
		error: function(){ alert("error"); }
	});
}

function renderReserveTable(list){
	var html = '';
	if(list && list.length){
		$.each(list, function(i, v){
			var status = v.cancelled ? '취소' : '정상';
			var cancelInfo = '';
			if(v.cancelled){
				cancelInfo = escHtml(v.cancelDt || '');
				if(v.canceller){ cancelInfo += '<br/>' + escHtml(v.canceller); }
			}
			//주문번호 → order_view, 소유자 → member_view (서버에서 settle_no/m_no 매핑된 경우만 링크)
			var poCell = escHtml(v.po);
			if(v.settle_no){
				poCell = '<a href="/_Admin_/order/order_view.php?settle_no=' + encodeURIComponent(v.settle_no) + '" target="_blank">' + escHtml(v.po) + '</a>';
			}
			var ownerCell = '<span class="eng font-12">' + escHtml(v.owner) + '</span>';
			if(v.m_no){
				ownerCell = '<a href="/_Admin_/member/member_view.php?m_no=' + encodeURIComponent(v.m_no) + '" target="_blank" class="eng font-12">' + escHtml(v.owner) + '</a>';
			}
			html += '<tr>';
			html += '<td class="text-center">' + escHtml(v.id) + '</td>';
			html += '<td class="text-center">' + escHtml(v.assetId) + '</td>';
			html += '<td class="text-start"><span class="eng font-12">' + escHtml(v.title) + '</span></td>';
			html += '<td class="text-center">' + poCell + '</td>';
			html += '<td class="">' + ownerCell + '</td>';
			html += '<td class="text-center">' + escHtml(v.reserveDt) + '</td>';
			html += '<td class="text-center">' + status + '</td>';
			html += '<td class="text-center">' + cancelInfo + '</td>';
			html += '</tr>';
		});
	}else{
		html = '<tr><td colspan="8" class="text-center text-muted py-3">조회된 예약이 없습니다.</td></tr>';
	}
	$("#reserve_list tbody").html(html);
}
</script>
</body>
</html>
