<?
header('Content-Type: text/html; charset=UTF-8');
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 카탈로그 (DB)";

$mode      = filter_input(INPUT_GET, "mode",      FILTER_SANITIZE_STRING);
$keyword   = filter_input(INPUT_GET, "keyword",   FILTER_SANITIZE_STRING);
$publisher = filter_input(INPUT_GET, "publisher", FILTER_SANITIZE_STRING);
$platform  = filter_input(INPUT_GET, "platform",  FILTER_SANITIZE_STRING);
$preorder  = filter_input(INPUT_GET, "preorder",  FILTER_SANITIZE_STRING);  //'', 'Y', 'N'
$mapping   = filter_input(INPUT_GET, "mapping",   FILTER_SANITIZE_STRING);  //'', 'Y'(매핑됨), 'N'(미매핑)
$stale     = filter_input(INPUT_GET, "stale",     FILTER_SANITIZE_STRING);  //'', 'Y'(단종의심), 'N'(정상)
$page      = (int)filter_input(INPUT_GET, "page",  FILTER_SANITIZE_NUMBER_INT);
$limit     = (int)filter_input(INPUT_GET, "limit", FILTER_SANITIZE_NUMBER_INT);

$mode = pn_normalize_mode($mode);
if(!$limit || $limit < 10){ $limit = 50; }
if($limit > 200){ $limit = 200; }
if(!$page || $page < 1){ $page = 1; }

$offset = ($page - 1) * $limit;

$products       = array();
$total          = 0;
$publisher_list = array();
$platform_list  = array();
$error          = "";

try {
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//카탈로그 삭제 처리 (PRG) — 매핑된 상품은 삭제 차단(먼저 매핑 해제 필요)
	$action = filter_input(INPUT_POST, "action", FILTER_SANITIZE_STRING);
	if($action === "delete"){
		$del_productID = filter_input(INPUT_POST, "productID", FILTER_SANITIZE_STRING);
		$del_mode      = filter_input(INPUT_POST, "del_mode",  FILTER_SANITIZE_STRING);
		$del_mode = pn_normalize_mode($del_mode);
		$flash = ""; $flash_type = "";

		if($del_productID){
			//매핑(order_system='10') 존재 시 삭제 차단
			$stmt = $conn->prepare("SELECT COUNT(*) FROM tbl_goods_item_delivery WHERE item_id=:iid AND order_system='10'");
			$stmt->execute(array(":iid" => $del_productID));
			if((int)$stmt->fetchColumn() > 0){
				$flash = "매핑된 상품은 삭제할 수 없습니다. 먼저 매핑을 해제하세요.";
				$flash_type = "warning";
			} else {
				$stmt = $conn->prepare("DELETE FROM pointnexus_catalogue WHERE productID=:pid AND mode=:mode");
				$stmt->execute(array(":pid" => $del_productID, ":mode" => $del_mode));
				$flash = "삭제되었습니다: ".$del_productID;
				$flash_type = "success";
			}
		}

		//현재 검색조건(GET) 유지하며 redirect
		$qs = $_GET;
		$qs['flash'] = $flash;
		$qs['flash_type'] = $flash_type;
		header("Location: ".strtok($_SERVER['PHP_SELF'], '?')."?".http_build_query($qs));
		exit;
	}

	//현재 mode의 마지막 동기화 회차값. update_date가 이 값보다 작으면 이번 동기화에 누락된 = 단종 의심
	$stmt = $conn->prepare("SELECT MAX(update_date) FROM pointnexus_catalogue WHERE mode=:mode");
	$stmt->execute(array(":mode" => $mode));
	$max_update = $stmt->fetchColumn();

	//필터 조건 구성
	$where = " a.mode = :mode ";
	$bind  = array(":mode" => $mode);

	if($keyword != ""){
		$where .= " AND (a.genericName LIKE :kw OR a.productID LIKE :kw OR a.publisher LIKE :kw) ";
		$bind[':kw'] = '%'.$keyword.'%';
	}
	if($publisher != ""){
		$where .= " AND a.publisher = :publisher ";
		$bind[':publisher'] = $publisher;
	}
	if($platform != ""){
		$where .= " AND a.platform = :platform ";
		$bind[':platform'] = $platform;
	}
	if($preorder == 'Y'){
		$where .= " AND a.isPreOrder = 1 ";
	} else if($preorder == 'N'){
		$where .= " AND a.isPreOrder = 0 ";
	}

	//매핑 여부 필터 — 서브쿼리로 EXISTS 체크
	if($mapping == 'Y'){
		$where .= " AND EXISTS (SELECT 1 FROM tbl_goods_item_delivery x WHERE x.item_id = a.productID AND x.order_system = '10') ";
	} else if($mapping == 'N'){
		$where .= " AND NOT EXISTS (SELECT 1 FROM tbl_goods_item_delivery x WHERE x.item_id = a.productID AND x.order_system = '10') ";
	}

	//단종 필터 — 마지막 동기화 회차에 누락된 상품(update_date < MAX)
	if($max_update){
		if($stale == 'Y'){
			$where .= " AND a.update_date < :max_update ";
			$bind[':max_update'] = $max_update;
		} else if($stale == 'N'){
			$where .= " AND a.update_date >= :max_update ";
			$bind[':max_update'] = $max_update;
		}
	}

	//전체 건수
	$cnt_sql = "SELECT COUNT(*) FROM pointnexus_catalogue a WHERE ".$where;
	$stmt = $conn->prepare($cnt_sql);
	$stmt->execute($bind);
	$total = (int)$stmt->fetchColumn();

	//페이지 데이터 — LEFT JOIN으로 매핑 정보 집계
	$list_sql = "SELECT a.productID, a.genericName, a.edition, a.platform, a.publisher,
	                    a.type, a.isPreOrder, a.releaseDate, a.prices, a.lastUpdatedAt, a.update_date,
	                    GROUP_CONCAT(b.product_code SEPARATOR '|') AS mapped_codes,
	                    GROUP_CONCAT(c.product_name SEPARATOR '|') AS mapped_names
	             FROM pointnexus_catalogue a
	             LEFT JOIN tbl_goods_item_delivery b ON b.item_id = a.productID AND b.order_system = '10'
	             LEFT JOIN tbl_goods_item c ON c.product_code = b.product_code
	             WHERE ".$where."
	             GROUP BY a.productID
	             ORDER BY a.genericName ASC
	             LIMIT ".(int)$limit." OFFSET ".(int)$offset;
	$stmt = $conn->prepare($list_sql);
	$stmt->execute($bind);
	$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

	//퍼블리셔 / 플랫폼 select 옵션 (현재 mode 한정)
	$stmt = $conn->prepare("SELECT DISTINCT publisher FROM pointnexus_catalogue WHERE mode=:mode AND publisher IS NOT NULL AND publisher<>'' ORDER BY publisher ASC");
	$stmt->execute(array(":mode" => $mode));
	$publisher_list = $stmt->fetchAll(PDO::FETCH_COLUMN);

	$stmt = $conn->prepare("SELECT DISTINCT platform FROM pointnexus_catalogue WHERE mode=:mode AND platform IS NOT NULL AND platform<>'' ORDER BY platform ASC");
	$stmt->execute(array(":mode" => $mode));
	$platform_list = $stmt->fetchAll(PDO::FETCH_COLUMN);

} catch (PDOException $e) {
	$error = $e->getMessage();
}

$total_pages = ($limit > 0) ? (int)ceil($total / $limit) : 1;

//페이지네이션용 base 파라미터 (page 제외)
$pg_params = $_GET;
unset($pg_params['page'], $pg_params['flash'], $pg_params['flash_type']);

//삭제 결과 flash
$flash      = filter_input(INPUT_GET, "flash",      FILTER_SANITIZE_STRING);
$flash_type = filter_input(INPUT_GET, "flash_type", FILTER_SANITIZE_STRING);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.product-id { font-family: monospace; font-size: 12px; color: #6c757d; word-break: break-all; }
.table .badge { font-size: 12px; font-weight: 500; }
.price-row { white-space: nowrap; line-height: 1.5; font-size: 13px; }
.origin-price { text-decoration: line-through; color: #6c757d; font-size: 11px; }
.promo-price  { color: #f59e0b; font-weight: 600; }
.mapped-list { font-size: 12px; line-height: 1.4; }
.mapped-list .mapped-item { margin-bottom: 5px; }
.mapped-list .code { font-family: monospace; color: #0d6efd; }
.col-action { white-space: nowrap; }
.col-action .btn { display: inline-flex; align-items: center; gap: 2px; }
.stock-check-row { margin-top: 4px; }
.stock-check-row .btn-stock-check { font-size: 11px; padding: 1px 6px; line-height: 1.5; }
.stock-check-row .stock-result { font-size: 12px; }
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
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">pointnexus_catalogue 테이블 조회</small></h4>
						</div>
					</div>
				</div>

				<? if($flash){ ?>
				<div class="alert alert-<?=htmlspecialchars($flash_type ?: 'info')?> alert-dismissible py-2">
					<?=htmlspecialchars($flash)?>
					<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
				</div>
				<? } ?>

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2 mb-2">
									<div class="col-md-2">
										<div class="row g-2">
											<label class="col-4 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-8"><? pn_mode_select($mode, true); ?></div>
										</div>
									</div>
									<div class="col-md-3">
										<div class="row g-2">
											<label class="col-4 col-form-label col-form-label-sm bg-light border">퍼블리셔</label>
											<div class="col-8">
												<select class="form-control form-control-sm" name="publisher">
													<option value="">전체</option>
													<? foreach($publisher_list as $pb){ ?>
													<option value="<?=htmlspecialchars($pb)?>" <?=$publisher==$pb?'selected':''?>><?=htmlspecialchars($pb)?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-2">
										<div class="row g-2">
											<label class="col-5 col-form-label col-form-label-sm bg-light border">플랫폼</label>
											<div class="col-7">
												<select class="form-control form-control-sm" name="platform">
													<option value="">전체</option>
													<? foreach($platform_list as $pf){ ?>
													<option value="<?=htmlspecialchars($pf)?>" <?=$platform==$pf?'selected':''?>><?=htmlspecialchars($pf)?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-2">
										<div class="row g-2">
											<label class="col-5 col-form-label col-form-label-sm bg-light border">프리오더</label>
											<div class="col-7">
												<select class="form-control form-control-sm" name="preorder">
													<option value="">전체</option>
													<option value="Y" <?=$preorder=='Y'?'selected':''?>>프리오더만</option>
													<option value="N" <?=$preorder=='N'?'selected':''?>>일반만</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-3">
										<div class="row g-2">
											<label class="col-3 col-form-label col-form-label-sm bg-light border">매핑</label>
											<div class="col-9">
												<select class="form-control form-control-sm" name="mapping">
													<option value="">전체</option>
													<option value="Y" <?=$mapping=='Y'?'selected':''?>>매핑됨</option>
													<option value="N" <?=$mapping=='N'?'selected':''?>>미매핑</option>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row g-2 mb-2">
									<div class="col-md-7">
										<div class="row g-2">
											<label class="col-1 col-form-label col-form-label-sm bg-light border">키워드</label>
											<div class="col-11">
												<input type="text" class="form-control form-control-sm" name="keyword" placeholder="상품명 / productID / publisher" value="<?=htmlspecialchars($keyword)?>">
											</div>
										</div>
									</div>
									<div class="col-md-2">
										<div class="row g-2">
											<label class="col-4 col-form-label col-form-label-sm bg-light border">단종</label>
											<div class="col-8">
												<select class="form-control form-control-sm" name="stale">
													<option value="">전체</option>
													<option value="Y" <?=$stale=='Y'?'selected':''?>>단종의심</option>
													<option value="N" <?=$stale=='N'?'selected':''?>>정상</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-2">
										<div class="row g-2">
											<label class="col-5 col-form-label col-form-label-sm bg-light border">한페이지</label>
											<div class="col-7">
												<select class="form-control form-control-sm" name="limit">
													<option value="50"  <?=$limit==50?'selected':''?>>50</option>
													<option value="100" <?=$limit==100?'selected':''?>>100</option>
													<option value="200" <?=$limit==200?'selected':''?>>200</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-1 text-end">
										<button type="submit" class="btn btn-primary btn-sm shadow-none w-100">검색</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<? if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else { ?>
				<div class="row mb-2 mt-2">
					<div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
						<div class="text-muted">
							총 <strong class="text-dark"><?=number_format($total)?></strong>건
							<? if($total > 0){ ?>
							&middot; <?=number_format($offset + 1)?>–<?=number_format($offset + count($products))?> 표시
							&middot; <?=number_format($page)?> / <?=number_format($total_pages)?> 페이지
							<? } ?>
						</div>
						<?=pn_pagination_html($page, $total_pages, $pg_params)?>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="table-responsive">
								<table class="table table-hover table-bordered table-sm mb-0">
									<thead class="table-light">
										<tr>
											<th class="text-center" style="width:40px;">#</th>
											<th style="min-width:240px;">상품명</th>
											<th class="text-center" style="width:80px;">플랫폼</th>
											<th class="text-center" style="width:120px;">퍼블리셔</th>
											<th class="text-center" style="width:80px;">타입</th>
											<th class="text-center" style="width:70px;">프리오더</th>
											<th style="width:90px;">가격(KRW)</th>
											<th class="text-center" style="width:100px;">출시일</th>
											<th style="min-width:200px;">매핑 자사상품</th>
											<th class="text-center" style="width:160px;">관리</th>
										</tr>
									</thead>
									<tbody>
										<? if(empty($products)){ ?>
											<tr><td colspan="10" class="text-center text-muted py-4">표시할 상품이 없습니다.</td></tr>
										<? } else {
											foreach($products as $i => $p){
												$pid          = $p['productID'];
												$name         = $p['genericName'] ?: '—';
												$platform_v   = $p['platform']   ?: '—';
												$publisher_v  = $p['publisher']  ?: '—';
												$type_v       = $p['type']       ?: '—';
												$isPreOrder   = !empty($p['isPreOrder']);
												$release      = !empty($p['releaseDate']) ? substr($p['releaseDate'], 0, 10) : '—';
												$prices       = !empty($p['prices']) ? json_decode($p['prices']) : array();
												$mapped_codes = !empty($p['mapped_codes']) ? explode('|', $p['mapped_codes']) : array();
												$mapped_names = !empty($p['mapped_names']) ? explode('|', $p['mapped_names']) : array();
												$is_mapped    = count($mapped_codes) > 0;
												//단종 의심 — update_date가 mode 최신 동기화 회차값보다 작으면 이번 동기화에 누락
												$is_discontinued = (!empty($p['update_date']) && !empty($max_update) && $p['update_date'] < $max_update);

												//KRW 가격 객체 추출 — 정가(initial)/프로모션(promo) 구분 표시용
												//prices는 동기화 시점 스냅샷이므로, 정가(initialFormatted)는 안정적이지만
												//priceFormatted/promo는 동기화 시점의 프로모션 상태가 그대로 박혀 있을 수 있음
												$krw_pr = null;
												foreach($prices as $pr){
													if(isset($pr->currency) && $pr->currency == 'KRW'){
														$krw_pr = $pr;
														break;
													}
												}
										?>
										<tr>
											<td class="text-center text-muted"><?=$offset + $i + 1?></td>
											<td>
												<div class="fw-semibold">
													<?=htmlspecialchars($name)?>
													<? if($is_discontinued){ ?>
													<span class="badge bg-danger ms-1" title="마지막 동기화에 누락된 상품 (PointNexus 카탈로그에서 제외 추정)">단종 의심</span>
													<? } ?>
												</div>
												<div class="product-id mt-1"><a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($pid)?>" target="_blank" class="text-decoration-none" title="PointNexus 상품 상세 조회"><?=htmlspecialchars($pid)?> <i class="mdi mdi-open-in-new"></i></a></div>
												<div class="stock-check-row d-flex align-items-center gap-1">
													<button type="button" class="btn btn-outline-info shadow-none btn-stock-check" data-id="<?=htmlspecialchars($pid)?>" data-mode="<?=htmlspecialchars($mode)?>"><i class="mdi mdi-package-variant-closed"></i> 재고 조회</button>
													<span class="stock-result"></span>
												</div>
											</td>
											<td class="text-center"><span class="badge bg-info"><?=htmlspecialchars($platform_v)?></span></td>
											<td class="text-center"><?=htmlspecialchars($publisher_v)?></td>
											<td class="text-center"><span class="badge bg-secondary"><?=htmlspecialchars($type_v)?></span></td>
											<td class="text-center">
												<? if($isPreOrder){ ?>
												<span class="badge bg-warning text-dark">프리오더</span>
												<? } else { ?>
												<span class="text-muted">—</span>
												<? } ?>
											</td>
											<td class="price-row">
												<? if($krw_pr){
													if(!empty($krw_pr->promo)){ //동기화 시점 프로모션 — 정가(취소선) + 프로모션가 ?>
													<span class="origin-price"><?=htmlspecialchars(pn_fmt_price(isset($krw_pr->initialFormatted)?$krw_pr->initialFormatted:''))?></span>
													<span class="promo-price"><?=htmlspecialchars(pn_fmt_price(isset($krw_pr->priceFormatted)?$krw_pr->priceFormatted:''))?></span>
													<span class="badge bg-warning text-dark" title="동기화 시점 프로모션 — 실제 현재 상태는 최신 동기화 필요">프로모션</span>
													<? } else { //정가만 ?>
													<span><?=htmlspecialchars(pn_fmt_price(isset($krw_pr->initialFormatted)?$krw_pr->initialFormatted:''))?></span>
													<? } ?>
												<? } else { ?>
													<span class="text-muted">—</span>
												<? } ?>
											</td>
											<td class="text-center" style="font-size:13px;"><?=htmlspecialchars($release)?></td>
											<td>
												<? if($is_mapped){ ?>
													<? if($is_discontinued){ ?>
													<div class="text-danger fw-semibold mb-1" style="font-size:12px;">
														<i class="mdi mdi-alert"></i> 단종 의심 상품이 매핑됨 — 결제 시 발급 실패 위험
													</div>
													<? } ?>
													<div class="mapped-list">
													<? foreach($mapped_codes as $idx => $mc){
														$mn = isset($mapped_names[$idx]) ? $mapped_names[$idx] : '';
													?>
														<div class="mapped-item">
															<div>
																<span class="badge bg-success">매핑</span>
																<a class="code" href="../goods_option_view.php?product_code=<?=urlencode($mc)?>" target="_blank"><?=htmlspecialchars($mc)?></a>
															</div>
															<? if($mn){ ?>
															<div class="text-dark"><?=htmlspecialchars($mn)?></div>
															<? } ?>
														</div>
													<? } ?>
													</div>
												<? } else { ?>
													<span class="badge bg-light text-dark border">미매핑</span>
												<? } ?>
											</td>
											<td class="text-center">
												<div class="col-action d-flex gap-1 justify-content-center flex-nowrap">
													<a href="pointnexus_catalogue_map.php?mode=<?=urlencode($mode)?>&productID=<?=urlencode($pid)?>" class="btn btn-sm btn-primary shadow-none">
														<i class="mdi mdi-link-variant"></i> 매핑 관리
													</a>
													<? if(!$is_mapped){ ?>
													<form method="post" action="<?=htmlspecialchars($_SERVER['REQUEST_URI'])?>" class="m-0" onsubmit="return confirm('이 카탈로그 상품을 삭제하시겠습니까?\nproductID: <?=htmlspecialchars($pid, ENT_QUOTES)?>');">
														<input type="hidden" name="action" value="delete">
														<input type="hidden" name="productID" value="<?=htmlspecialchars($pid)?>">
														<input type="hidden" name="del_mode" value="<?=htmlspecialchars($mode)?>">
														<button type="submit" class="btn btn-sm btn-danger shadow-none">
															<i class="mdi mdi-trash-can"></i> 삭제
														</button>
													</form>
													<? } ?>
												</div>
											</td>
										</tr>
										<? } } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div class="d-flex justify-content-center mt-3 mb-2">
					<?=pn_pagination_html($page, $total_pages, $pg_params)?>
				</div>
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
<script>
$(function(){
	//카탈로그 행별 재고 지연조회 — 클릭 시 해당 상품만 라이브 조회(GET /product/{id})
	$(document).on('click', '.btn-stock-check', function(){
		var $btn    = $(this);
		var $result = $btn.siblings('.stock-result');
		$btn.prop('disabled', true);
		$result.text('조회중…');
		$.ajax({
			url: 'pointnexus_stock_check.php',
			type: 'GET',
			dataType: 'json',
			data: { id: $btn.data('id'), mode: $btn.data('mode') },
			success: function(res){
				$btn.prop('disabled', false);
				if(res && res.success){
					var cls  = res.total_qty > 0 ? 'bg-success' : 'bg-danger';
					var html = '<span class="badge '+cls+'">총 '+Number(res.total_qty).toLocaleString()+'개</span>';
					if(res.variants && res.variants.length > 1){
						html += ' <span class="badge bg-light text-dark border">변이 '+res.variants.length+'</span>';
					}
					$result.html(html);
				} else {
					$result.empty().append($('<span class="text-danger">').text(res && res.error ? res.error : '조회 실패'));
				}
			},
			error: function(){
				$btn.prop('disabled', false);
				$result.empty().append($('<span class="text-danger">').text('조회 실패'));
			}
		});
	});
});
</script>
</body>
</html>
