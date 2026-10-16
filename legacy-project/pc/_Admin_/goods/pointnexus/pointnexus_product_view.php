<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/_inc.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "PointNexus 상품 상세";

$mode = filter_input(INPUT_GET, "mode", FILTER_SANITIZE_STRING);
$id   = filter_input(INPUT_GET, "id", FILTER_SANITIZE_STRING);
$mode = pn_normalize_mode($mode);

$result  = null;
$error   = "";
$product = null;
if($id){
	try{
		$pointnexus = new PointNexus($mode);
		$result = $pointnexus->runProductRetrieve($id);
		if (!empty($result->success) && !empty($result->data)) {
			$product = is_array($result->data) ? $result->data[0] : $result->data;
		} else {
			$error = pn_extract_error($result);
		}
	}catch(Exception $e){
		$error = $e->getMessage();
	}
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
.product-id { font-family: monospace; font-size: 12px; color: #6c757d; word-break: break-all; }
.card-body .badge { font-size: 12px; font-weight: 500; }
.promo-price { color: #f59e0b; font-weight: 700; }
.origin-price { text-decoration: line-through; color: #6c757d; font-size: 12px; }
.description-box { font-size: 13px; line-height: 1.8; max-height: 500px; overflow-y: auto; background: #f8f9fa; border-radius: 6px; padding: 16px; }
.description-box img { max-width: 100%; height: auto; }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-bottom: 14px; }
.label-col { width: 130px; font-size: 12px; color: #6c757d; white-space: nowrap; }
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
							<h4 class="page-title"><?=!empty($product->genericName) ? htmlspecialchars($product->genericName) : $page_title?> <small class="text-muted">GET /product/{id}</small></h4>
						</div>
					</div>
				</div>

				<div class="row g-0">
					<div class="card">
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2">
									<div class="col-2">
										<div class="row g-2">
											<label for="mode" class="col-3 col-form-label col-form-label-sm bg-light border">환경</label>
											<div class="col-9"><? pn_mode_select($mode, false); ?></div>
										</div>
									</div>
									<div class="col-8">
										<div class="row g-2">
											<label for="id" class="col-2 col-form-label col-form-label-sm bg-light border">상품 UUID</label>
											<div class="col-10">
												<input type="text" class="form-control form-control-sm" id="id" name="id" value="<?=htmlspecialchars($id)?>" placeholder="예: a536a4ff-b110-40f8-bde1-777f7ef842b2">
											</div>
										</div>
									</div>
									<div class="col-2 text-end">
										<button type="submit" class="btn btn-primary btn-sm shadow-none">조회</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<? if(!$id){ ?>
					<div class="alert alert-info">상품 UUID를 입력하세요.</div>
				<? } else if($error){ ?>
					<div class="alert alert-danger"><i class="mdi mdi-alert"></i> <?=htmlspecialchars($error)?></div>
				<? } else if($product){
					$name         = isset($product->genericName)  ? $product->genericName  : '—';
					$platform     = isset($product->platform)     ? $product->platform     : '—';
					$publisher    = isset($product->publisher)    ? $product->publisher    : '—';
					$type         = isset($product->type)         ? $product->type         : '—';
					$edition      = isset($product->edition)      ? $product->edition      : '';
					$copyright    = isset($product->copyright)    ? $product->copyright    : '';
					$isPreOrder   = !empty($product->isPreOrder);
					$genres       = !empty($product->genres)            ? (array)$product->genres            : array();
					$prices       = !empty($product->prices)            ? (array)$product->prices            : array();
					$currencies   = !empty($product->allowedCurrencies) ? (array)$product->allowedCurrencies : array();
					$countries    = !empty($product->allowedCountries)  ? (array)$product->allowedCountries  : array();
					$releaseDate  = !empty($product->releaseDate)       ? substr($product->releaseDate, 0, 10) : '—';
					$updatedAt    = !empty($product->lastUpdatedAt)     ? substr($product->lastUpdatedAt, 0, 19) : '—';
					$platformSKU  = isset($product->platformSKU)  ? $product->platformSKU  : '—';
					$publisherSKU = isset($product->publisherSKU) ? $product->publisherSKU : '—';
					$steamAppID   = isset($product->steamAppID)   ? $product->steamAppID   : '';
					$shortDesc    = pn_get_lang(isset($product->shortDescription) ? $product->shortDescription : null);
					$longDesc     = pn_get_lang(isset($product->longDescription)  ? $product->longDescription  : null);
				?>
				<div class="row g-3">
					<!-- 기본 정보 -->
					<div class="col-lg-6">
						<div class="card h-100">
							<div class="card-body">
								<div class="section-title">기본 정보</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr><td class="label-col">상품명</td><td class="fw-semibold"><?=htmlspecialchars($name)?></td></tr>
										<tr><td class="label-col">재고</td><td>
											<?php
												//GET /product/{id} 응답의 stock 필드 — 변이(variant)별 [{productVariantID, countries[], qty, geolock}]
												$stock = isset($product->stock) && is_array($product->stock) ? $product->stock : array();
												if(count($stock) === 0){
													echo '<span class="badge bg-light text-dark border">재고 정보 없음</span>';
												} else {
													$total_qty = 0;
													foreach($stock as $s){ if(isset($s->qty) && is_numeric($s->qty)){ $total_qty += (int)$s->qty; } }
													echo '<span class="badge '.($total_qty > 0 ? 'bg-success' : 'bg-danger').'">총 '.number_format($total_qty).'개</span>';
													echo '<div class="mt-2">';
													foreach($stock as $s){
														$qty     = isset($s->qty) ? (int)$s->qty : 0;
														$geolock = isset($s->geolock) ? (string)$s->geolock : '';
														$cc      = (isset($s->countries) && is_array($s->countries)) ? count($s->countries) : 0;
														echo '<div class="mb-1">';
														echo '<span class="badge bg-secondary me-1">'.number_format($qty).'개</span>';
														if($geolock !== ''){ echo '<span class="badge bg-light text-dark border me-1">'.htmlspecialchars($geolock).'</span>'; }
														if($cc > 0){ echo '<span class="badge bg-light text-dark border me-1">판매국 '.number_format($cc).'개국</span>'; }
														echo '</div>';
													}
													echo '</div>';
												}
											?>
										</td></tr>
										<? if($edition){ ?>
										<tr><td class="label-col">에디션</td><td><?=htmlspecialchars($edition)?></td></tr>
										<? } ?>
										<tr><td class="label-col">플랫폼</td><td><span class="badge bg-info"><?=htmlspecialchars($platform)?></span></td></tr>
										<tr><td class="label-col">퍼블리셔</td><td><?=htmlspecialchars($publisher)?></td></tr>
										<tr><td class="label-col">타입</td><td><span class="badge bg-secondary"><?=htmlspecialchars($type)?></span></td></tr>
										<tr><td class="label-col">프리오더</td><td><? if($isPreOrder){ ?><span class="badge bg-warning text-dark">프리오더</span><? } else { ?><span class="text-muted">—</span><? } ?></td></tr>
										<? if(!empty($genres)){ ?>
										<tr><td class="label-col">장르</td><td>
											<? foreach($genres as $g){ ?>
											<span class="badge bg-light text-dark border me-1"><?=htmlspecialchars($g)?></span>
											<? } ?>
										</td></tr>
										<? } ?>
										<tr><td class="label-col">출시일</td><td><?=htmlspecialchars($releaseDate)?></td></tr>
										<tr><td class="label-col">최종 업데이트</td><td><?=htmlspecialchars(str_replace('T', ' ', $updatedAt))?></td></tr>
										<tr><td class="label-col">플랫폼 SKU</td><td class="product-id"><?=htmlspecialchars($platformSKU)?></td></tr>
										<tr><td class="label-col">퍼블리셔 SKU</td><td class="product-id"><?=htmlspecialchars($publisherSKU)?></td></tr>
										<? if($steamAppID){ ?>
										<tr><td class="label-col">Steam App ID</td><td>
											<a href="https://store.steampowered.com/app/<?=urlencode($steamAppID)?>" target="_blank" class="text-info text-decoration-none"><?=htmlspecialchars($steamAppID)?> <i class="mdi mdi-open-in-new"></i></a>
										</td></tr>
										<? } ?>
										<? if($copyright){ ?>
										<tr><td class="label-col">저작권</td><td class="text-muted"><?=htmlspecialchars($copyright)?></td></tr>
										<? } ?>
										<tr><td class="label-col">상품 ID</td><td class="product-id"><?=htmlspecialchars(isset($product->id) ? $product->id : '—')?></td></tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<!-- 가격 정보 -->
					<div class="col-lg-6">
						<div class="card">
							<div class="card-body">
								<div class="section-title">가격 정보</div>
								<? if(!empty($prices)){ ?>
								<div class="table-responsive">
									<table class="table table-sm table-bordered mb-0">
										<thead class="table-light">
											<tr>
												<th class="text-center" style="width:70px;">통화</th>
												<th class="text-center">정가</th>
												<th class="text-center">판매가</th>
												<th class="text-center" style="width:90px;">프로모션</th>
												<th>판매 국가</th>
											</tr>
										</thead>
										<tbody>
										<?
										$hidden_rows = 0;
										foreach ($prices as $pr){
											$pcc = isset($pr->currency) ? $pr->currency : '';
											if (!pn_is_relevant_currency($pcc)){ $hidden_rows++; continue; }
										?>
											<tr>
												<td class="text-center"><span class="badge bg-light text-dark border"><?=htmlspecialchars($pcc)?></span></td>
												<td class="text-center">
													<? if (!empty($pr->promo)){ ?>
													<span class="origin-price"><?=htmlspecialchars(pn_fmt_price(isset($pr->initialFormatted)?$pr->initialFormatted:''))?></span>
													<? } else { ?>
													<span><?=htmlspecialchars(pn_fmt_price(isset($pr->priceFormatted)?$pr->priceFormatted:''))?></span>
													<? } ?>
												</td>
												<td class="text-center">
													<? if (!empty($pr->promo)){ ?>
													<span class="promo-price"><?=htmlspecialchars(pn_fmt_price(isset($pr->priceFormatted)?$pr->priceFormatted:''))?></span>
													<? } else { ?>
													<span class="text-muted">—</span>
													<? } ?>
												</td>
												<td class="text-center">
													<? if (!empty($pr->promo)){ ?>
													<span class="badge bg-warning text-dark"><?=htmlspecialchars(is_string($pr->promo) ? $pr->promo : 'ON')?></span>
													<? } else { ?>
													<span class="text-muted">—</span>
													<? } ?>
												</td>
												<td>
													<? if (!empty($pr->allowedCountries)){
														$pkf = pn_filter_countries((array)$pr->allowedCountries);
														foreach ($pkf['shown'] as $c){
															echo '<span class="badge bg-light text-dark border me-1">'.htmlspecialchars($c).'</span>';
														}
														if ($pkf['hidden'] > 0){
															echo '<span class="badge bg-secondary me-1">외 '.$pkf['hidden'].'개국</span>';
														}
													} else {
														echo '<span class="text-muted">—</span>';
													} ?>
												</td>
											</tr>
										<? } ?>
										<? if ($hidden_rows > 0){ ?>
										<tr><td colspan="5" class="text-center text-muted">외 <?=$hidden_rows?>개 통화 가격 정보 숨김 (KRW · JPY · USD 외)</td></tr>
										<? } ?>
										</tbody>
									</table>
								</div>
								<? } else { ?>
								<p class="text-muted mb-0">가격 정보 없음</p>
								<? } ?>
							</div>
						</div>

						<!-- 판매 범위 -->
						<div class="card mt-3">
							<div class="card-body">
								<div class="section-title">판매 범위</div>
								<table class="table table-sm table-borderless mb-0">
									<tbody>
										<tr>
											<td class="label-col">허용 통화</td>
											<td>
												<? if (!empty($currencies)){
													$cf = pn_filter_currencies($currencies);
													foreach ($cf['shown'] as $c){
														echo '<span class="badge bg-light text-dark border me-1">'.htmlspecialchars($c).'</span>';
													}
													if ($cf['hidden'] > 0){
														echo '<span class="badge bg-secondary me-1">외 '.$cf['hidden'].'개</span>';
													}
												} else {
													echo '<span class="text-muted">—</span>';
												} ?>
											</td>
										</tr>
										<tr>
											<td class="label-col">판매 국가 수</td>
											<td><span class="badge bg-secondary"><?=count($countries)?>개국</span></td>
										</tr>
									</tbody>
								</table>
								<? if (!empty($countries)){
									$kf = pn_filter_countries($countries);
								?>
								<div class="mt-2">
									<? foreach ($kf['shown'] as $c){ ?>
									<span class="badge bg-light text-dark border me-1"><?=htmlspecialchars($c)?></span>
									<? } ?>
									<? if ($kf['hidden'] > 0){ ?>
									<span class="badge bg-secondary me-1">외 <?=$kf['hidden']?>개국</span>
									<? } ?>
								</div>
								<? } ?>
							</div>
						</div>
					</div>

					<!-- 설명 -->
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<div class="section-title">짧은 설명</div>
								<? if($shortDesc){ ?>
								<p class="mb-4" style="font-size:13px; line-height:1.8;"><?=htmlspecialchars($shortDesc)?></p>
								<? } else { ?>
								<p class="text-muted mb-4">정보 없음</p>
								<? } ?>
								<div class="section-title">긴 설명</div>
								<? if($longDesc){ ?>
								<div class="description-box"><?=$longDesc?></div>
								<? } else { ?>
								<p class="text-muted mb-0">정보 없음</p>
								<? } ?>
							</div>
						</div>
					</div>
				</div>

				<? pn_json_box($result); ?>
				<? } else { ?>
					<div class="alert alert-warning">데이터 없음</div>
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
