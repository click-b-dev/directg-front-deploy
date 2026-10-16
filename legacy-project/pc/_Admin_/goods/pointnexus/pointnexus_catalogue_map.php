<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 카탈로그 매핑";

$mode      = filter_input(INPUT_GET, "mode",      FILTER_SANITIZE_STRING);
$productID = filter_input(INPUT_GET, "productID", FILTER_SANITIZE_STRING);

$mode = pn_normalize_mode($mode);
if(!$productID){
	header("Location: pointnexus_catalogue.php");
	exit;
}

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//product_platform 코드 → 표시명 변환용 (기존 Admin 메서드 재사용)
	$admin = new Admin($conn);

	//PointNexus 카탈로그 정보 조회
	$stmt = $conn->prepare("SELECT * FROM pointnexus_catalogue WHERE productID=:productID AND mode=:mode");
	$stmt->execute(array(":productID" => $productID, ":mode" => $mode));
	$pn_info = $stmt->fetch(PDO::FETCH_ASSOC);

	//단종 의심 판정 — 이 상품의 update_date가 mode 최신 동기화 회차값보다 작으면 누락
	$stmt = $conn->prepare("SELECT MAX(update_date) FROM pointnexus_catalogue WHERE mode=:mode");
	$stmt->execute(array(":mode" => $mode));
	$max_update = $stmt->fetchColumn();
	$pn_is_discontinued = ($pn_info && !empty($pn_info['update_date']) && !empty($max_update) && $pn_info['update_date'] < $max_update);

	//현재 매핑 목록
	$stmt = $conn->prepare("SELECT a.product_code, a.item_id, a.item_name, a.item_platform, a.item_publisher, a.order_system,
	                               b.product_name, b.product_platform, b.option_type, b.status
	                        FROM tbl_goods_item_delivery a
	                        LEFT JOIN tbl_goods_item b ON b.product_code = a.product_code
	                        WHERE a.item_id=:productID AND a.order_system='10'
	                        ORDER BY a.product_code ASC");
	$stmt->execute(array(":productID" => $productID));
	$mapped_list = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
	$pn_info = null;
	$mapped_list = array();
	$db_error = $e->getMessage();
}

//flash 메시지 (URL에서 받음)
$flash      = filter_input(INPUT_GET, "flash",      FILTER_SANITIZE_STRING);
$flash_type = filter_input(INPUT_GET, "flash_type", FILTER_SANITIZE_STRING);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.product-id { font-family: monospace; font-size: 12px; color: #6c757d; word-break: break-all; }
.info-table th { width: 140px; background: #f8f9fa; font-weight: 500; }
.info-table td { word-break: break-all; }
.table .badge { font-size: 12px; font-weight: 500; }
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
									<li class="breadcrumb-item"><a href="pointnexus_catalogue.php">PointNexus 카탈로그</a></li>
									<li class="breadcrumb-item active">매핑</li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">PointNexus 상품 ↔ 자사 옵션상품 연결</small></h4>
						</div>
					</div>
				</div>

				<? if($flash){ ?>
				<div class="alert alert-<?=htmlspecialchars($flash_type ?: 'info')?> alert-dismissible py-2">
					<?=htmlspecialchars($flash)?>
					<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
				</div>
				<? } ?>

				<? if(!empty($db_error)){ ?>
				<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($db_error)?></div>
				<? } ?>

				<div class="row">
					<div class="col-md-6">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">PointNexus 상품 정보</h5>
							<div class="card-body">
								<? if($pn_info){ ?>
								<? if($pn_is_discontinued){ ?>
								<div class="alert alert-danger py-2 mb-2" style="font-size:13px;">
									<i class="mdi mdi-alert"></i> <strong>단종 의심 상품</strong> — 마지막 동기화 회차에 누락되었습니다(PointNexus 카탈로그에서 제외 추정).
									매핑된 자사상품이 있으면 결제 시 발급 실패 위험이 있으니 매핑 해제를 검토하세요.
								</div>
								<? } ?>
								<table class="table table-sm info-table mb-0">
									<tr>
										<th>productID</th>
										<td class="product-id">
											<?=htmlspecialchars($pn_info['productID'])?>
											<? if($pn_is_discontinued){ ?><span class="badge bg-danger ms-1">단종 의심</span><? } ?>
										</td>
									</tr>
									<tr>
										<th>상품명</th>
										<td class="fw-semibold"><?=htmlspecialchars($pn_info['genericName'])?></td>
									</tr>
									<tr>
										<th>edition</th>
										<td><?=htmlspecialchars($pn_info['edition'] ?: '—')?></td>
									</tr>
									<tr>
										<th>플랫폼</th>
										<td><span class="badge bg-info"><?=htmlspecialchars($pn_info['platform'])?></span></td>
									</tr>
									<tr>
										<th>퍼블리셔</th>
										<td><?=htmlspecialchars($pn_info['publisher'] ?: '—')?></td>
									</tr>
									<tr>
										<th>타입</th>
										<td><span class="badge bg-secondary"><?=htmlspecialchars($pn_info['type'] ?: '—')?></span></td>
									</tr>
									<tr>
										<th>프리오더</th>
										<td><?=$pn_info['isPreOrder'] ? '<span class="badge bg-warning text-dark">프리오더</span>' : '—'?></td>
									</tr>
									<tr>
										<th>출시일</th>
										<td><?=htmlspecialchars($pn_info['releaseDate'] ? substr($pn_info['releaseDate'], 0, 10) : '—')?></td>
									</tr>
									<tr>
										<th>mode</th>
										<td><?=htmlspecialchars($pn_info['mode'])?></td>
									</tr>
									<tr>
										<th>마지막 동기화</th>
										<td>
											<?=htmlspecialchars(!empty($pn_info['update_date']) ? $pn_info['update_date'] : '—')?>
											<? if($pn_is_discontinued){ ?>
											<small class="text-danger">(최신 회차 <?=htmlspecialchars($max_update)?> 누락)</small>
											<? } ?>
										</td>
									</tr>
								</table>
								<? } else { ?>
								<div class="alert alert-warning mb-0">해당 productID를 pointnexus_catalogue에서 찾을 수 없습니다. (mode=<?=htmlspecialchars($mode)?>)</div>
								<? } ?>
							</div>
						</div>
					</div>

					<div class="col-md-6">
						<div class="card">
							<h5 class="card-header bg-success text-white">현재 매핑 (<?=count($mapped_list)?>건)</h5>
							<div class="card-body">
								<? if(empty($mapped_list)){ ?>
								<div class="text-muted">매핑된 자사 상품이 없습니다.</div>
								<? } else { ?>
								<div class="table-responsive">
									<table class="table table-sm table-bordered mb-0">
										<thead class="table-light">
											<tr>
												<th class="text-center">product_code</th>
												<th>상품명</th>
												<th>플랫폼</th>
												<th class="text-center" style="width:80px;">관리</th>
											</tr>
										</thead>
										<tbody>
										<? foreach($mapped_list as $m){ ?>
											<tr>
												<td class="product-id text-center"><?=htmlspecialchars($m['product_code'])?></td>
												<td><?=htmlspecialchars($m['product_name'] ?: '—')?></td>
												<td><?=$admin->getProductPlatform($m['product_platform']) ?: '—'?></td>
												<td class="text-center">
													<form method="post" action="pointnexus_catalogue_map_ps.php" onsubmit="return confirm('매핑을 해제하시겠습니까?');" style="display:inline;">
														<input type="hidden" name="action" value="unmap">
														<input type="hidden" name="product_code" value="<?=htmlspecialchars($m['product_code'])?>">
														<input type="hidden" name="productID" value="<?=htmlspecialchars($productID)?>">
														<input type="hidden" name="mode" value="<?=htmlspecialchars($mode)?>">
														<button type="submit" class="btn btn-sm btn-outline-danger shadow-none">해제</button>
													</form>
												</td>
											</tr>
										<? } ?>
										</tbody>
									</table>
								</div>
								<? } ?>
							</div>
						</div>
					</div>
				</div>

				<div class="row mt-3">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-primary text-white">자사 상품 검색 후 매핑</h5>
							<div class="card-body">
								<div class="input-group input-group-sm" style="max-width:480px;">
									<input type="text" class="form-control" id="search_keyword" placeholder="product_code 또는 상품명으로 검색">
									<button type="button" class="btn btn-primary shadow-none" id="btn_search">검색</button>
								</div>
								<div class="text-muted mt-2" style="font-size:12px;">검색 결과는 팝업으로 표시됩니다. (Enter 키로도 검색)</div>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-3 mb-3">
					<a href="pointnexus_catalogue.php?mode=<?=urlencode($mode)?>" class="btn btn-secondary btn-sm shadow-none">
						<i class="mdi mdi-arrow-left"></i> 카탈로그 목록으로
					</a>
				</div>
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->

<!-- 자사 상품 검색결과 모달 -->
<div id="search-modal" class="modal fade" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-lg modal-dialog-scrollable">
		<div class="modal-content">
			<div class="modal-header bg-primary">
				<h5 class="modal-title text-white">자사 상품 검색 결과</h5>
				<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body p-0">
				<table class="table table-sm table-bordered table-hover mb-0">
					<thead class="table-light">
						<tr>
							<th class="text-center" style="width:120px;">product_code</th>
							<th>상품명</th>
							<th class="text-center" style="width:80px;">플랫폼</th>
							<th class="text-center" style="width:80px;">옵션타입</th>
							<th class="text-center" style="width:60px;">상태</th>
							<th class="text-center" style="width:100px;">매핑</th>
						</tr>
					</thead>
					<tbody id="search_result_body"></tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>
$(function(){
	var searchModal = new bootstrap.Modal(document.getElementById('search-modal'));

	function pnDoSearch(){
		var kw = $.trim($("#search_keyword").val());
		if(kw === ""){ alert("검색어를 입력하세요."); return; }
		$.ajax({
			type: "POST",
			url: "pointnexus_catalogue_map_ps.php",
			data: {
				action: "search",
				keyword: kw,
				productID: "<?=htmlspecialchars($productID, ENT_QUOTES)?>",
				mode: "<?=htmlspecialchars($mode, ENT_QUOTES)?>"
			},
			success: function(html){
				$("#search_result_body").html(html);
				searchModal.show();
			},
			error: function(){ alert("검색 중 오류가 발생했습니다."); }
		});
	}

	$("#btn_search").on("click", pnDoSearch);
	$("#search_keyword").on("keypress", function(e){
		if(e.which === 13){ e.preventDefault(); pnDoSearch(); }
	});
});
</script>
</body>
</html>
