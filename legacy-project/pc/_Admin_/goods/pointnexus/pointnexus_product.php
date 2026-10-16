<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 판매 가능 상품 목록";

$mode    = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$page    = (int)filter_input(INPUT_GET, "page",   FILTER_SANITIZE_NUMBER_INT);
$limit   = (int)filter_input(INPUT_GET, "limit",  FILTER_SANITIZE_NUMBER_INT);
$filters = filter_input(INPUT_GET, "filters", FILTER_DEFAULT);

$mode = pn_normalize_mode($mode);
if(!$limit || $limit < 10){ $limit = 50; }
if($limit > 100){ $limit = 100; }
if(!$page || $page < 1){ $page = 1; }
if($filters === null){ $filters = ''; }

$offset = ($page - 1) * $limit;

$result   = null;
$error    = "";
$products = array();
$total    = 0;
try{
	$pointnexus = new PointNexus($mode);
	$result = $pointnexus->runProduct($offset, $limit, $filters);
	if (!empty($result->success)) {
		$products = !empty($result->data) ? $result->data : array();
		$total    = isset($result->count) ? $result->count : 0;
	} else {
		$error = pn_extract_error($result);
	}
}catch(Exception $e){
	$error = $e->getMessage();
}

//PointNexus /product 의 count 는 응답 data 크기를 돌려주는 것으로 보여 전체 페이지 수를 알 수 없음
//→ 현재 응답이 limit 만큼 차있으면 다음 페이지 있다고 가정하는 cursor 방식 사용
$has_more = !empty($products) && count($products) >= $limit;

//페이지네이션 링크용 파라미터(현재 GET에서 page 제거)
$pg_params = $_GET;
unset($pg_params['page']);
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.price-row { white-space: nowrap; line-height: 1.7; }
.promo-price { color: #f59e0b; font-weight: 600; }
.origin-price { text-decoration: line-through; color: #6c757d; font-size: 11px; }
.product-id { font-family: monospace; font-size: 12px; color: #6c757d; word-break: break-all; }
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">PointNexus 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">GET /product</small></h4>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2 mb-2">
									<div class="col-3">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode, false); ?></div>
										</div>
									</div>
									<div class="col-2">
										<div class="row g-2">
											<label for="limit" class="col-4 col-form-label col-form-label-sm bg-light border">한 페이지</label>
											<div class="col-8">
												<select class="form-control form-control-sm" id="limit" name="limit">
													<option value="10"  <?=$limit==10?'selected':''?>>10</option>
													<option value="50"  <?=$limit==50?'selected':''?>>50</option>
													<option value="100" <?=$limit==100?'selected':''?>>100</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-7">
										<div class="row g-2">
											<label for="filters" class="col-2 col-form-label col-form-label-sm bg-light border">filters</label>
											<div class="col-10">
												<input type="text" class="form-control form-control-sm" id="filters" name="filters" placeholder='[{"field":"type","op":"=","value":"sale"}]' value="<?=htmlspecialchars($filters)?>">
													<details class="mt-1">
														<summary class="text-muted" style="cursor:pointer; font-size:12px;"><i class="mdi mdi-help-circle-outline"></i> filters 사용법 / 예시</summary>
														<div class="border rounded p-2 mt-1" style="font-size:12px; background:#f8f9fa;">
															<div class="mb-1">형식 <code>[{"field":"필드","op":"연산자","value":"값"}]</code> — 여러 개 넣으면 모두 만족(AND)</div>
															<div class="mb-1">연산자 <code>=</code> <code>!=</code> <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>IN</code> <code>NOT IN</code></div>
															<div class="mb-1">주요 필드 <code>type</code> <code>platform</code> <code>publisher</code> <code>genericName</code> <code>isPreOrder</code> <code>id</code> <code>steamAppID</code> <code>releaseDate</code> <code>lastUpdatedAt</code></div>
															<div class="mb-1">예시 (클릭하면 입력칸에 채워집니다 — 값만 바꿔 검색):</div>
															<div class="d-flex flex-wrap gap-1 mb-1">
																<button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="document.getElementById('filters').value=this.dataset.f;" data-f='[{"field":"type","op":"=","value":"sale"}]'>type = sale</button>
																<button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="document.getElementById('filters').value=this.dataset.f;" data-f='[{"field":"platform","op":"=","value":"Steam"}]'>platform = Steam</button>
																<button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="document.getElementById('filters').value=this.dataset.f;" data-f='[{"field":"publisher","op":"=","value":"Focus"}]'>publisher = Focus</button>
																<button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="document.getElementById('filters').value=this.dataset.f;" data-f='[{"field":"isPreOrder","op":"=","value":true}]'>isPreOrder = true</button>
																<button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1" onclick="document.getElementById('filters').value=this.dataset.f;" data-f='[{"field":"platform","op":"=","value":"Steam"},{"field":"type","op":"=","value":"build"}]'>Steam + build (AND)</button>
															</div>
															<div class="text-danger">※ <code>=</code>는 정확히 일치만 됩니다(부분검색 X). 상품명 일부로 찾으려면 <a href="pointnexus_catalogue.php?mode=<?=urlencode($mode)?>">카탈로그(DB) 페이지</a>의 키워드 검색을 쓰세요.</div>
														</div>
													</details>
											</div>
										</div>
									</div>
								</div>
								<div class="row g-0 mt-1">
									<div class="col-12 text-end">
										<button type="submit" class="btn btn-primary btn-sm shadow-none">검색</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<? if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else { ?>
				<div class="row mb-2">
					<div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
						<div class="text-muted">
							<? if(!empty($products)){ ?>
							<?=number_format($offset + 1)?>–<?=number_format($offset + count($products))?> 표시
							&middot; 현재 <strong class="text-dark"><?=number_format($page)?></strong> 페이지
							<? if(!$has_more){ ?> &middot; <span class="text-secondary">마지막 페이지</span><? } ?>
							<? } else { ?>
							결과 없음
							<? } ?>
						</div>
						<?=pn_pagination_cursor($page, $has_more, $pg_params)?>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="table-responsive">
								<table class="table table-hover table-bordered table-sm mb-0">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center" style="width:40px;">#</th>
											<th style="min-width:240px;">상품명 / 장르</th>
											<th class="text-center" style="width:80px;">플랫폼</th>
											<th class="text-center" style="width:120px;">퍼블리셔</th>
											<th class="text-center" style="width:80px;">타입</th>
											<th class="text-center" style="width:70px;">프리오더</th>
											<th style="min-width:180px;">가격</th>
											<th class="text-center" style="width:120px;">허용통화</th>
											<th class="text-center" style="width:80px;">판매국가</th>
											<th class="text-center" style="width:100px;">출시일</th>
											<th class="text-center" style="width:200px;">상품 ID</th>
										</tr>
									</thead>
									<tbody class="font-12">
										<? if(empty($products)){ ?>
											<tr><td colspan="11" class="text-center text-muted py-4">표시할 상품이 없습니다.</td></tr>
										<? } else {
											foreach ($products as $i => $p){
												$name        = isset($p->genericName) ? $p->genericName : '—';
												$platform    = isset($p->platform)    ? $p->platform    : '—';
												$publisher   = isset($p->publisher)   ? $p->publisher   : '—';
												$type        = isset($p->type)        ? $p->type        : '—';
												$isPreOrder  = !empty($p->isPreOrder);
												$genres      = !empty($p->genres) ? (array)$p->genres : array();
												$prices      = !empty($p->prices) ? (array)$p->prices : array();
												$currencies  = !empty($p->allowedCurrencies) ? (array)$p->allowedCurrencies : array();
												$countryCount= !empty($p->allowedCountries) ? count((array)$p->allowedCountries) : 0;
												$releaseDate = !empty($p->releaseDate) ? substr($p->releaseDate, 0, 10) : '—';
												$pid         = isset($p->id) ? $p->id : '';
										?>
										<tr>
											<td class="text-center text-muted"><?=$offset + $i + 1?></td>
											<td>
												<div class="fw-semibold">
													<a href="pointnexus_product_view.php?mode=<?=urlencode($mode)?>&id=<?=urlencode($pid)?>" class="text-dark text-decoration-none"><?=htmlspecialchars($name)?></a>
												</div>
												<? if(!empty($genres)){ ?>
												<div class="mt-1">
													<? foreach($genres as $g){ ?>
													<span class="badge bg-light text-dark border"><?=htmlspecialchars($g)?></span>
													<? } ?>
												</div>
												<? } ?>
											</td>
											<td class="text-center"><span class="badge bg-info"><?=htmlspecialchars($platform)?></span></td>
											<td class="text-center"><?=htmlspecialchars($publisher)?></td>
											<td class="text-center"><span class="badge bg-secondary"><?=htmlspecialchars($type)?></span></td>
											<td class="text-center">
												<? if($isPreOrder){ ?>
												<span class="badge bg-warning text-dark">프리오더</span>
												<? } else { ?>
												<span class="text-muted">—</span>
												<? } ?>
											</td>
											<td>
												<? if(!empty($prices)){
													$hidden_pr = 0;
													echo '<div class="price-row">';
													foreach ($prices as $pr){
														$pcc = isset($pr->currency) ? $pr->currency : '';
														if (!pn_is_relevant_currency($pcc)){ $hidden_pr++; continue; }
														echo '<div>';
														echo '<span class="text-muted" style="font-size:11px;">'.htmlspecialchars($pcc).'</span> ';
														if (!empty($pr->promo)){
															echo '<span class="origin-price">'.htmlspecialchars(pn_fmt_price(isset($pr->initialFormatted)?$pr->initialFormatted:'')).'</span> ';
															echo '<span class="promo-price">'.htmlspecialchars(pn_fmt_price(isset($pr->priceFormatted)?$pr->priceFormatted:'')).'</span>';
														} else {
															echo '<span>'.htmlspecialchars(pn_fmt_price(isset($pr->priceFormatted)?$pr->priceFormatted:'')).'</span>';
														}
														echo '</div>';
													}
													if($hidden_pr > 0){
														echo '<div class="text-muted">외 '.$hidden_pr.'개 통화</div>';
													}
													echo '</div>';
												} else {
													echo '<span class="text-muted">—</span>';
												}
												?>
											</td>
											<td class="text-center">
												<?
												$cf = pn_filter_currencies($currencies);
												foreach ($cf['shown'] as $c){
													echo '<span class="badge bg-light text-dark border me-1">'.htmlspecialchars($c).'</span>';
												}
												if ($cf['hidden'] > 0){
													echo '<span class="badge bg-secondary me-1">외 '.$cf['hidden'].'개</span>';
												}
												?>
											</td>
											<td class="text-center"><?=$countryCount?>개국</td>
											<td class="text-center" style="font-size:11px;"><?=htmlspecialchars($releaseDate)?></td>
											<td class="product-id text-center"><?=htmlspecialchars($pid)?></td>
										</tr>
										<? } } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div class="d-flex justify-content-center mt-3 mb-2">
					<?=pn_pagination_cursor($page, $has_more, $pg_params)?>
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
</body>
</html>
