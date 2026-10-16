<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset Item(키) 현황";
$sidebar_file = "sidebar_stock.php";

$page     = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
$asset_id = filter_input(INPUT_GET, 'asset_id', FILTER_SANITIZE_NUMBER_INT);

if(!$asset_id){
	msg("잘못된 접근입니다. (asset_id 없음)", "asset_list.php");
	exit;
}
if(!$page){
	$page = 1;
}

//어느 Asset인지 헤더 표시용 — Asset 서버에서 상세 조회
try{
	$conn  = new PDO($dsn, DB_USER, DB_PASSWORD);
	$asset = new Asset($conn);

	$detail = json_decode($asset->runAssetDetail($asset_id));
	if(is_array($detail)){ $detail = $detail[0] ?? null; }
	$asset_name      = isset($detail->title) ? $detail->title : (isset($detail->name) ? $detail->name : '');
	$asset_platform  = isset($detail->platform)  ? $detail->platform  : '';
	$asset_publisher = isset($detail->publisher) ? $detail->publisher : '';
}catch(PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
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
									<li class="breadcrumb-item"><a href="asset_list.php">Asset 현황</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<!-- Asset 컨텍스트 헤더 (테이블) -->
				<div class="row">
					<div class="col-12">
						<div class="d-flex justify-content-between align-items-end mb-2">
							<table class="table table-sm table-bordered mb-0 w-auto">
								<tbody>
									<tr>
										<th class="bg-light text-center">Asset ID</th>
										<td class="text-center"><?=$asset_id?></td>
										<th class="bg-light text-center">이름</th>
										<td class="eng"><?=htmlspecialchars($asset_name, ENT_QUOTES)?></td>
										<th class="bg-light text-center">플랫폼</th>
										<td class="eng text-center"><?=htmlspecialchars($asset_platform, ENT_QUOTES)?></td>
										<th class="bg-light text-center">공급처</th>
										<td class="eng text-center"><?=htmlspecialchars($asset_publisher, ENT_QUOTES)?></td>
									</tr>
								</tbody>
							</table>
							<a href="asset_list.php" class="btn btn-sm btn-light">← Asset 현황</a>
						</div>
					</div>
				</div>

				<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
					<input type="hidden" id="page" name="page" value="<?=$page?>">
					<input type="hidden" name="asset_id" id="asset_id" value="<?=$asset_id?>">
				</form>

				<div class="row">
					<div class="col-12 mb-2">
						총 <strong id="total" class="text-danger"></strong> 개
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<table class="table table-centered nowrap table-sm table-bordered" id="asset_item_list">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center">Item ID</th>
										<th class="text-center">Asset 이름</th>
										<th class="text-center">등록일시</th>
										<th class="text-center">소유자</th>
										<th class="text-center">주문번호(po)</th>
										<th class="text-center">예약할당</th>
										<th class="text-center">활성화</th>
										<th class="text-center">키(치환명)</th>
										<th class="text-center">관리</th>
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
	var page     = $("#page").val();
	var asset_id = $("#asset_id").val();
	var size     = 100;

	getAssetItemList(page, asset_id, size);

	//예약(키 할당) 취소 (PUT /reserves/{reserveId}/cancel) — 활성화된 키는 취소 불가
	$(document).on("click", ".btn_item_cancel", function(){
		var reserve_id = $(this).data("reserveid");
		if(!confirm("이 예약(키 할당)을 취소하시겠습니까?")) return;
		itemAction({mode:"asset_reserve_cancel", reserve_id:reserve_id}, "예약취소 완료");
	});
});

//액션 공용 — 성공(id) 시 목록 갱신, 실패 시 message 표시
function itemAction(data, okMsg){
	$.ajax({
		url: "asset_ps.php",
		type: "POST",
		dataType: "JSON",
		data: data,
		success: function(res){
			if(res && res.id){
				alert(okMsg);
				getAssetItemList($("#page").val(), $("#asset_id").val(), 100);
			}else{
				alert(res && res.message ? res.message : "처리에 실패했습니다.");
			}
		},
		error: function(){ alert("error"); }
	});
}

//Asset Item(키) 목록
function getAssetItemList(page, asset_id, size){
	$.ajax({
		url: "asset_ps.php",
		type: "POST",
		dataType: "JSON",
		data: {mode:"asset_item_list", method:"POST", page:page, size:size, asset_id:asset_id},
		success: function(str){
			renderAssetItemTable(str.content);
			renderPaging({
				page         : page,
				totalPages   : str.totalPages,
				totalElements: str.totalElements,
				baseUrl      : 'asset_item_list.php',
				params       : { asset_id: asset_id },
				perBlock     : 20
			});
		},
		error: function(){ alert("error"); }
	});
}

function renderAssetItemTable(list) {
	var html = '';
	if(list && list.length){
		$.each(list, function(i, v) {
			//예약할당 (여부+일자 한 셀)
			var reserveCell = v.reserved
				? '예약<br/><span class="num">' + escHtml(v.reserveDt || '') + '</span>'
				: '<span class="text-muted">미예약</span>';
			//활성화 (여부+일자 한 셀 — 최초 키 조회 시 활성화)
			var activateCell = v.activated
				? '<span class="text-success">활성</span><br/><span class="num">' + escHtml(v.activatedDt || '') + '</span>'
				: '<span class="text-muted">미활성</span>';

			//관리: 예약취소는 예약됐고 아직 미활성 + reserveId 있을 때만 (활성화된 키는 취소 불가)
			var actions = '';
			if(v.reserved && !v.activated && v.reserveId){
				actions = '<button type="button" class="btn btn-outline-secondary btn-sm btn_item_cancel" data-reserveid="' + escHtml(v.reserveId) + '">예약취소</button>';
			}

			html += '<tr>';
			html += '<td class="text-center"><span class="num">' + escHtml(v.id) + '</span></td>';
			html += '<td class="text-start"><span class="eng font-12">' + escHtml(v.title) + '</span></td>';
			html += '<td class="text-center"><span class="num">' + escHtml(v.regDt) + '</span></td>';
			html += '<td class="text-center"><span class="num">' + escHtml(v.owner) + '</span></td>';
			html += '<td class="text-center"><span class="eng font-12">' + escHtml(v.po) + '</span></td>';
			html += '<td class="text-center">' + reserveCell + '</td>';
			html += '<td class="text-center">' + activateCell + '</td>';
			html += '<td class="text-start"><span class="eng font-12">' + escHtml(v.key) + '</span></td>';
			html += '<td class="text-center text-nowrap">' + actions + '</td>';
			html += '</tr>';
		});
	}else{
		html = '<tr><td colspan="9" class="text-center text-muted py-3">등록된 키가 없습니다.</td></tr>';
	}
	$("#asset_item_list tbody").html(html);
}
</script>
</body>
</html>
