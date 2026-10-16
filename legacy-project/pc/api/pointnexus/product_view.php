<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_STRING);

if (empty($id)) {
	header('Location: product_list.php');
	exit;
}

$product = null;
$error   = '';

try {
	$nexus  = new PointNexus($mode);
	$result = $nexus->runProductRetrieve($id);

	if (!empty($result->success) && !empty($result->data)) {
		$product = is_array($result->data) ? $result->data[0] : $result->data;
	} else {
		$error = !empty($result->errors[0]->message) ? $result->errors[0]->message : '상품 정보를 불러올 수 없습니다.';
	}
} catch (Exception $e) {
	$error = $e->getMessage();
}

//다국어 설명에서 우선순위에 따라 텍스트 추출 (HTML 태그를 제거한 실제 텍스트가 있는 항목만)
function getLangText($obj, $langs = array('ko-KR', 'en-GB', 'en-US', 'ja-JP', 'zh-CN', 'zh-TW')) {
	if (empty($obj)) return '';
	$arr = (array)$obj;
	//1순위: 우선순위 언어 중 실제 텍스트 콘텐츠가 있는 항목
	foreach ($langs as $lang) {
		if (!empty($arr[$lang]) && is_string($arr[$lang]) && trim(strip_tags($arr[$lang])) !== '') {
			return $arr[$lang];
		}
	}
	//2순위: 어떤 언어든 실제 텍스트가 있는 첫 항목 (위 목록에 없는 언어 대응)
	foreach ($arr as $text) {
		if (is_string($text) && trim(strip_tags($text)) !== '') return $text;
	}
	return '';
}
?>
<!DOCTYPE html>
<html lang="ko" data-bs-theme="dark">
<head>
<meta charset="utf-8">
<title>Point Nexus — 상품 상세<?=!empty($product->genericName) ? ' | ' . htmlspecialchars($product->genericName) : ''?></title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
<style>
body { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; background: #1a1a2e; }
.page-header { background: linear-gradient(135deg, #16213e, #0f3460); border-bottom: 1px solid #0f3460; }
.label-col { width: 130px; font-size: 12px; color: #adb5bd; white-space: nowrap; }
.value-col { font-size: 13px; }
.product-id { font-family: monospace; font-size: 12px; color: #adb5bd; }
.promo-price { color: #f59e0b; font-weight: 700; }
.origin-price { text-decoration: line-through; color: #6c757d; font-size: 12px; }
.description-box { font-size: 13px; line-height: 1.8; max-height: 500px; overflow-y: auto; background: #12122a; border-radius: 6px; padding: 16px; color: #c8d3f5; }
.description-box img { max-width: 100%; height: auto; }
.description-box a { color: #4ec9b0; }
.description-box h1, .description-box h2, .description-box h3, .description-box h4 { color: #ffffff; }
.country-wrap { font-size: 11px; line-height: 2.2; }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; border-bottom: 1px solid #2a2a4a; padding-bottom: 6px; margin-bottom: 14px; }
</style>
</head>
<body>

<div class="page-header py-3 px-4 mb-4">
	<div class="d-flex align-items-center justify-content-between">
		<div>
			<h5 class="mb-0 text-white">
				<i class="fas fa-box me-2 text-info"></i>
				<?=!empty($product->genericName) ? htmlspecialchars($product->genericName) : 'Point Nexus — 상품 상세'?>
			</h5>
			<small class="text-secondary">GET /product/<?=htmlspecialchars($id)?></small>
		</div>
		<a href="product_list.php" class="btn btn-sm btn-outline-secondary">
			<i class="fas fa-arrow-left me-1"></i>목록으로
		</a>
	</div>
</div>

<div class="container-fluid px-4">

<?if ($error):?>
	<div class="alert alert-danger d-flex align-items-center">
		<i class="fas fa-triangle-exclamation me-2"></i>
		<span><?=htmlspecialchars($error)?></span>
	</div>
<?elseif ($product):?>

<?
$name         = $product->genericName  ?? '—';
$platform     = $product->platform     ?? '—';
$publisher    = $product->publisher    ?? '—';
$type         = $product->type         ?? '—';
$edition      = $product->edition      ?? '';
$copyright    = $product->copyright    ?? '';
$isPreOrder   = !empty($product->isPreOrder);
$genres       = !empty($product->genres)            ? (array)$product->genres            : array();
$prices       = !empty($product->prices)            ? (array)$product->prices            : array();
$currencies   = !empty($product->allowedCurrencies) ? (array)$product->allowedCurrencies : array();
$countries    = !empty($product->allowedCountries)  ? (array)$product->allowedCountries  : array();
$releaseDate  = !empty($product->releaseDate)       ? substr($product->releaseDate, 0, 10) : '—';
$updatedAt    = !empty($product->lastUpdatedAt)     ? substr($product->lastUpdatedAt, 0, 19) : '—';
$platformSKU  = $product->platformSKU  ?? '—';
$steamAppID   = $product->steamAppID   ?? '';
$shortDesc    = getLangText($product->shortDescription ?? null);
$longDesc     = getLangText($product->longDescription  ?? null);
?>

<div class="row g-4">

	<!-- 기본 정보 -->
	<div class="col-lg-6">
		<div class="card border-0 shadow-sm h-100">
			<div class="card-body">
				<div class="section-title">기본 정보</div>
				<table class="table table-sm table-borderless mb-0">
					<tbody>
						<tr>
							<td class="label-col">상품명</td>
							<td class="value-col fw-semibold"><?=htmlspecialchars($name)?></td>
						</tr>
						<?if ($edition):?>
						<tr>
							<td class="label-col">에디션</td>
							<td class="value-col"><?=htmlspecialchars($edition)?></td>
						</tr>
						<?endif?>
						<tr>
							<td class="label-col">플랫폼</td>
							<td class="value-col">
								<span class="badge bg-info"><?=htmlspecialchars($platform)?></span>
							</td>
						</tr>
						<tr>
							<td class="label-col">퍼블리셔</td>
							<td class="value-col"><?=htmlspecialchars($publisher)?></td>
						</tr>
						<tr>
							<td class="label-col">타입</td>
							<td class="value-col">
								<span class="badge bg-secondary"><?=htmlspecialchars($type)?></span>
							</td>
						</tr>
						<tr>
							<td class="label-col">프리오더</td>
							<td class="value-col">
								<?if ($isPreOrder):?>
								<span class="badge bg-warning text-dark">프리오더</span>
								<?else:?>
								<span class="text-secondary">—</span>
								<?endif?>
							</td>
						</tr>
						<?if (!empty($genres)):?>
						<tr>
							<td class="label-col">장르</td>
							<td class="value-col">
								<?foreach ($genres as $g):?>
								<span class="badge bg-secondary me-1" style="font-size:11px;"><?=htmlspecialchars($g)?></span>
								<?endforeach?>
							</td>
						</tr>
						<?endif?>
						<tr>
							<td class="label-col">출시일</td>
							<td class="value-col"><?=htmlspecialchars($releaseDate)?></td>
						</tr>
						<tr>
							<td class="label-col">최종 업데이트</td>
							<td class="value-col"><?=htmlspecialchars(str_replace('T', ' ', $updatedAt))?></td>
						</tr>
						<tr>
							<td class="label-col">플랫폼 SKU</td>
							<td class="value-col product-id"><?=htmlspecialchars($platformSKU)?></td>
						</tr>
						<?if ($steamAppID):?>
						<tr>
							<td class="label-col">Steam App ID</td>
							<td class="value-col">
								<a href="https://store.steampowered.com/app/<?=urlencode($steamAppID)?>" target="_blank" class="text-info text-decoration-none">
									<?=htmlspecialchars($steamAppID)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
								</a>
							</td>
						</tr>
						<?endif?>
						<?if ($copyright):?>
						<tr>
							<td class="label-col">저작권</td>
							<td class="value-col" style="font-size:12px; color:#adb5bd;"><?=htmlspecialchars($copyright)?></td>
						</tr>
						<?endif?>
						<tr>
							<td class="label-col">상품 ID</td>
							<td class="value-col product-id"><?=htmlspecialchars($product->id ?? '—')?></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- 가격 정보 -->
	<div class="col-lg-6">
		<div class="card border-0 shadow-sm">
			<div class="card-body">
				<div class="section-title">가격 정보</div>
				<?if (!empty($prices)):?>
				<div class="table-responsive">
					<table class="table table-sm table-bordered mb-0">
						<thead class="table-dark">
							<tr>
								<th class="text-center" style="width:70px;">통화</th>
								<th class="text-center">정가</th>
								<th class="text-center">판매가</th>
								<th class="text-center">프로모션</th>
								<th>판매 국가</th>
							</tr>
						</thead>
						<tbody>
						<?
						$hidden_rows = 0;
						foreach ($prices as $pr):
							$pcc = $pr->currency ?? '';
							if (!pn_is_relevant_currency($pcc)) { $hidden_rows++; continue; }
						?>
						<tr>
							<td class="text-center">
								<span class="badge bg-dark border border-secondary"><?=htmlspecialchars($pcc)?></span>
							</td>
							<td class="text-center">
								<?if (!empty($pr->promo)):?>
								<span class="origin-price"><?=htmlspecialchars($pr->initialFormatted ?? '')?></span>
								<?else:?>
								<span><?=htmlspecialchars($pr->priceFormatted ?? '')?></span>
								<?endif?>
							</td>
							<td class="text-center">
								<?if (!empty($pr->promo)):?>
								<span class="promo-price"><?=htmlspecialchars($pr->priceFormatted ?? '')?></span>
								<?else:?>
								<span class="text-secondary">—</span>
								<?endif?>
							</td>
							<td class="text-center">
								<?if (!empty($pr->promo)):?>
								<span class="badge bg-warning text-dark" style="font-size:11px;"><?=htmlspecialchars(is_string($pr->promo) ? $pr->promo : 'ON')?></span>
								<?else:?>
								<span class="text-secondary" style="font-size:12px;">—</span>
								<?endif?>
							</td>
							<td>
								<div class="country-wrap">
									<?if (!empty($pr->allowedCountries)):
										$pkf = pn_filter_countries((array)$pr->allowedCountries);
									?>
									<?foreach ($pkf['shown'] as $c):?>
									<span class="badge bg-dark border border-secondary me-1"><?=htmlspecialchars($c)?></span>
									<?endforeach?>
									<?if ($pkf['hidden'] > 0):?>
									<span class="badge bg-secondary me-1">외 <?=$pkf['hidden']?>개국</span>
									<?endif?>
									<?else:?>
									<span class="text-secondary">—</span>
									<?endif?>
								</div>
							</td>
						</tr>
						<?endforeach?>
						<?if ($hidden_rows > 0):?>
						<tr>
							<td colspan="5" class="text-center text-secondary" style="font-size:11px;">외 <?=$hidden_rows?>개 통화 가격 정보 숨김 (KRW · JPY · USD 외)</td>
						</tr>
						<?endif?>
						</tbody>
					</table>
				</div>
				<?else:?>
				<p class="text-secondary mb-0">가격 정보 없음</p>
				<?endif?>
			</div>
		</div>

		<!-- 허용 통화 / 판매 국가 -->
		<div class="card border-0 shadow-sm mt-4">
			<div class="card-body">
				<div class="section-title">판매 범위</div>
				<table class="table table-sm table-borderless mb-0">
					<tbody>
						<tr>
							<td class="label-col">허용 통화</td>
							<td class="value-col">
								<?if (!empty($currencies)):
									$cf = pn_filter_currencies($currencies);
								?>
								<?foreach ($cf['shown'] as $c):?>
								<span class="badge bg-dark border border-secondary me-1"><?=htmlspecialchars($c)?></span>
								<?endforeach?>
								<?if ($cf['hidden'] > 0):?>
								<span class="badge bg-secondary me-1">외 <?=$cf['hidden']?>개</span>
								<?endif?>
								<?else:?>
								<span class="text-secondary">—</span>
								<?endif?>
							</td>
						</tr>
						<tr>
							<td class="label-col">판매 국가 수</td>
							<td class="value-col">
								<span class="badge bg-secondary"><?=count($countries)?>개국</span>
							</td>
						</tr>
					</tbody>
				</table>
				<?if (!empty($countries)):
					$kf = pn_filter_countries($countries);
				?>
				<div class="country-wrap mt-2">
					<?foreach ($kf['shown'] as $c):?>
					<span class="badge bg-dark border border-secondary me-1"><?=htmlspecialchars($c)?></span>
					<?endforeach?>
					<?if ($kf['hidden'] > 0):?>
					<span class="badge bg-secondary me-1">외 <?=$kf['hidden']?>개국</span>
					<?endif?>
				</div>
				<?endif?>
			</div>
		</div>
	</div>

	<!-- 설명 -->
	<div class="col-12">
		<div class="card border-0 shadow-sm">
			<div class="card-body">
				<div class="section-title">짧은 설명</div>
				<?if ($shortDesc):?>
				<p class="mb-4" style="font-size:13px; line-height:1.8; color:#c8d3f5;"><?=htmlspecialchars($shortDesc)?></p>
				<?else:?>
				<p class="text-secondary mb-4">정보 없음</p>
				<?endif?>
				<div class="section-title">긴 설명</div>
				<?if ($longDesc):?>
				<div class="description-box"><?=$longDesc?></div>
				<?else:?>
				<p class="text-secondary mb-0">정보 없음 (모든 언어가 비어있거나 실제 텍스트가 없음)</p>
				<?endif?>
			</div>
		</div>
	</div>

</div><!-- /row -->

<?endif?>
</div>
<?pn_json_box($result)?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>
