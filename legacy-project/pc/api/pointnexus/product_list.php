<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$offset  = (int)filter_input(INPUT_GET, 'offset',  FILTER_SANITIZE_NUMBER_INT);
$limit   = (int)filter_input(INPUT_GET, 'limit',   FILTER_SANITIZE_NUMBER_INT);
$filters = filter_input(INPUT_GET, 'filters', FILTER_SANITIZE_STRING);

if ($offset < 0)   $offset = 0;
if ($limit  < 10)  $limit  = 50;
if ($limit  > 100) $limit  = 100;
if ($filters === null) $filters = '';

$products = array();
$total    = 0;
$error    = '';

try {
	$nexus  = new PointNexus($mode);
	$result = $nexus->runProduct($offset, $limit, $filters);

	if (!empty($result->success)) {
		$products = $result->data ?? array();
		$total    = $result->count ?? 0;
	} else {
		$error = !empty($result->errors[0]->message) ? $result->errors[0]->message : 'API 오류가 발생했습니다.';
	}
} catch (Exception $e) {
	$error = $e->getMessage();
}

$prev_offset = max(0, $offset - $limit);
$next_offset = $offset + $limit;
?>
<!DOCTYPE html>
<html lang="ko" data-bs-theme="dark">
<head>
<meta charset="utf-8">
<title>Point Nexus — 상품 목록</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
<style>
body { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; background: #1a1a2e; }
.page-header { background: linear-gradient(135deg, #16213e, #0f3460); border-bottom: 1px solid #0f3460; }
.table th { font-size: 12px; white-space: nowrap; }
.table td { font-size: 13px; vertical-align: middle; }
.product-id { font-family: monospace; font-size: 11px; color: #adb5bd; }
.price-row { white-space: nowrap; line-height: 2; }
.promo-price { color: #f59e0b; font-weight: 600; }
.origin-price { text-decoration: line-through; color: #6c757d; font-size: 11px; }
.genre-badge { font-size: 10px; }
.empty-state { padding: 60px 0; }
</style>
</head>
<body>

<div class="page-header py-3 px-4 mb-4">
	<div class="d-flex align-items-center justify-content-between">
		<div>
			<h5 class="mb-0 text-white"><i class="fas fa-box-open me-2 text-info"></i>Point Nexus — 판매 가능 상품 목록</h5>
			<small class="text-secondary">GET /product</small>
		</div>
		<form method="get" action="" class="d-flex align-items-center gap-2">
			<select name="limit" class="form-select form-select-sm" style="width:90px;" onchange="this.form.submit()">
				<option value="10"  <?=$limit==10?'selected':''?>>10개</option>
				<option value="50"  <?=$limit==50?'selected':''?>>50개</option>
				<option value="100" <?=$limit==100?'selected':''?>>100개</option>
			</select>
			<input type="hidden" name="offset" value="0">
		</form>
	</div>
</div>

<div class="container-fluid px-4">

<?if ($error):?>
	<div class="alert alert-danger d-flex align-items-center">
		<i class="fas fa-triangle-exclamation me-2"></i>
		<span><?=htmlspecialchars($error)?></span>
	</div>
<?else:?>

	<div class="d-flex align-items-center justify-content-between mb-3">
		<div class="text-secondary">
			전체 <strong class="text-white"><?=number_format($total)?></strong>개
			&nbsp;·&nbsp;
			<?=number_format($offset + 1)?>–<?=number_format(min($offset + $limit, $total))?> 표시
		</div>
		<div class="d-flex gap-2">
			<?if ($offset > 0):?>
			<a href="?offset=<?=$prev_offset?>&limit=<?=$limit?>" class="btn btn-sm btn-outline-secondary">
				<i class="fas fa-chevron-left me-1"></i>이전
			</a>
			<?endif?>
			<?if ($next_offset < $total):?>
			<a href="?offset=<?=$next_offset?>&limit=<?=$limit?>" class="btn btn-sm btn-outline-secondary">
				다음<i class="fas fa-chevron-right ms-1"></i>
			</a>
			<?endif?>
		</div>
	</div>

	<?if (empty($products)):?>
	<div class="text-center text-secondary empty-state">
		<i class="fas fa-inbox fa-3x mb-3 d-block"></i>
		표시할 상품이 없습니다.
	</div>
	<?else:?>
	<div class="card border-0 shadow-sm">
		<div class="table-responsive">
			<table class="table table-hover table-bordered mb-0">
				<thead class="table-dark">
					<tr>
						<th class="text-center" style="width:40px;">#</th>
						<th style="min-width:220px;">상품명</th>
						<th class="text-center" style="width:80px;">플랫폼</th>
						<th class="text-center" style="width:90px;">퍼블리셔</th>
						<th class="text-center" style="width:80px;">타입</th>
						<th class="text-center" style="width:70px;">프리오더</th>
						<th style="min-width:160px;">가격</th>
						<th class="text-center" style="width:80px;">허용통화</th>
						<th class="text-center" style="width:70px;">판매국가</th>
						<th class="text-center" style="width:100px;">출시일</th>
						<th class="text-center" style="width:195px;">상품 ID</th>
					</tr>
				</thead>
				<tbody>
				<?
				foreach ($products as $i => $p):
					$name        = $p->genericName    ?? '—';
					$platform    = $p->platform       ?? '—';
					$publisher   = $p->publisher      ?? '—';
					$type        = $p->type           ?? '—';
					$isPreOrder  = !empty($p->isPreOrder);
					$genres      = !empty($p->genres) ? (array)$p->genres : array();
					$prices      = !empty($p->prices) ? (array)$p->prices : array();
					$currencies  = !empty($p->allowedCurrencies) ? (array)$p->allowedCurrencies : array();
					$countryCount = !empty($p->allowedCountries) ? count((array)$p->allowedCountries) : 0;
					$releaseDate = !empty($p->releaseDate) ? substr($p->releaseDate, 0, 10) : '—';
				?>
				<tr>
					<td class="text-center text-secondary"><?=$offset + $i + 1?></td>
					<td>
						<div class="fw-semibold">
							<a href="product_view.php?id=<?=urlencode($p->id ?? '')?>" class="text-white text-decoration-none link-hover">
								<?=htmlspecialchars($name)?>
							</a>
						</div>
						<?if (!empty($genres)):?>
						<div class="mt-1">
							<?foreach ($genres as $g):?>
							<span class="badge bg-secondary genre-badge"><?=htmlspecialchars($g)?></span>
							<?endforeach?>
						</div>
						<?endif?>
					</td>
					<td class="text-center">
						<span class="badge bg-info"><?=htmlspecialchars($platform)?></span>
					</td>
					<td class="text-center">
						<small><?=htmlspecialchars($publisher)?></small>
					</td>
					<td class="text-center">
						<span class="badge bg-secondary"><?=htmlspecialchars($type)?></span>
					</td>
					<td class="text-center">
						<?if ($isPreOrder):?>
						<span class="badge bg-warning text-dark">프리오더</span>
						<?else:?>
						<span class="text-secondary">—</span>
						<?endif?>
					</td>
					<td>
						<?if (!empty($prices)):?>
						<div class="price-row">
							<?
							$hidden_pr = 0;
							foreach ($prices as $pr):
								$pcc = $pr->currency ?? '';
								if (!pn_is_relevant_currency($pcc)) { $hidden_pr++; continue; }
							?>
							<div>
								<span class="text-secondary" style="font-size:11px;"><?=htmlspecialchars($pcc)?></span>
								<?if (!empty($pr->promo)):?>
								<span class="origin-price"><?=htmlspecialchars($pr->initialFormatted ?? '')?></span>
								<span class="promo-price"><?=htmlspecialchars($pr->priceFormatted ?? '')?></span>
								<?else:?>
								<span class="text-white"><?=htmlspecialchars($pr->priceFormatted ?? '')?></span>
								<?endif?>
							</div>
							<?endforeach?>
							<?if ($hidden_pr > 0):?>
							<div><small class="text-secondary">외 <?=$hidden_pr?>개 통화</small></div>
							<?endif?>
						</div>
						<?else:?>
						<span class="text-secondary">—</span>
						<?endif?>
					</td>
					<td class="text-center">
						<?
						$cf = pn_filter_currencies($currencies);
						foreach ($cf['shown'] as $c):?>
						<span class="badge bg-dark border border-secondary me-1" style="font-size:11px;"><?=htmlspecialchars($c)?></span>
						<?endforeach?>
						<?if ($cf['hidden'] > 0):?>
						<span class="badge bg-secondary me-1" style="font-size:11px;">외 <?=$cf['hidden']?>개</span>
						<?endif?>
					</td>
					<td class="text-center">
						<span class="badge bg-dark border border-secondary"><?=$countryCount?>개국</span>
					</td>
					<td class="text-center" style="font-size:12px;"><?=htmlspecialchars($releaseDate)?></td>
					<td class="product-id text-center"><?=htmlspecialchars($p->id ?? '—')?></td>
				</tr>
				<?endforeach?>
				</tbody>
			</table>
		</div>
	</div>

	<div class="d-flex justify-content-end gap-2 mt-3 mb-4">
		<?if ($offset > 0):?>
		<a href="?offset=<?=$prev_offset?>&limit=<?=$limit?>" class="btn btn-sm btn-outline-secondary">
			<i class="fas fa-chevron-left me-1"></i>이전
		</a>
		<?endif?>
		<?if ($next_offset < $total):?>
		<a href="?offset=<?=$next_offset?>&limit=<?=$limit?>" class="btn btn-sm btn-outline-secondary">
			다음<i class="fas fa-chevron-right ms-1"></i>
		</a>
		<?endif?>
	</div>
	<?endif?>

<?endif?>
</div>

<?pn_json_box($result)?>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>
