<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id   = trim($_REQUEST['id'] ?? '');

$executed = ($id !== '');
$error    = '';
$campaign = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runPromoRetrieve($id);
		if (!empty($result->success)) {
			$campaign = !empty($result->data) ? (is_array($result->data) ? $result->data[0] : $result->data) : null;
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

pn_head('프로모션 캠페인 상세', 'GET /promo/{id}');
?>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="get" action="promo_view.php" class="row g-2 align-items-end">
			<div class="col-md-10">
				<div class="field-label">id (필수) — 캠페인 UUID</div>
				<input type="text" name="id" class="form-control form-control-sm" value="<?=htmlspecialchars($id)?>" required>
			</div>
			<div class="col-md-2 text-end">
				<button type="submit" class="btn btn-sm btn-primary"><i class="fas fa-search me-1"></i>조회</button>
			</div>
		</form>
	</div>
</div>

<?if ($executed):?>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?elseif ($campaign):?>

	<?
	$cArr        = (array)$campaign;
	$cId         = $cArr['id']         ?? $id;
	$name        = $cArr['name']       ?? '—';
	$state       = $cArr['state']      ?? '';
	$issuer      = $cArr['issuer']     ?? null;
	$startDate   = $cArr['startDate']  ?? '';
	$endDate     = $cArr['endDate']    ?? '';
	$productIDs  = !empty($cArr['productIDs']) ? (array)$cArr['productIDs'] : array();
	$products    = !empty($cArr['products'])   ? (array)$cArr['products']   : array();
	$state_colors = array('running'=>'success','scheduled'=>'info','ended'=>'secondary','paused'=>'warning');
	$stateColor  = $state_colors[$state] ?? 'info';
	?>

	<div class="row g-4 mb-4">
		<div class="col-lg-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">캠페인 정보</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?pn_row('이름', $name)?>
							<?if ($state):?>
							<tr>
								<td class="label-col">상태 (state)</td>
								<td class="value-col"><span class="badge bg-<?=$stateColor?>"><?=htmlspecialchars($state)?></span></td>
							</tr>
							<?endif?>
							<?if ($startDate):?><?pn_row('시작일', pn_fmt_date($startDate, 19))?><?endif?>
							<?if ($endDate):?><?pn_row('종료일',   pn_fmt_date($endDate, 19))?><?endif?>
							<tr><td class="label-col">캠페인 ID</td><td class="value-col uuid"><?=htmlspecialchars($cId)?></td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">발행자 (issuer)</div>
					<?if ($issuer):?>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?pn_row('이름', $issuer->name ?? '—')?>
							<tr><td class="label-col">ID</td><td class="value-col uuid"><?=htmlspecialchars($issuer->id ?? '—')?></td></tr>
						</tbody>
					</table>
					<?else:?>
					<p class="text-secondary mb-0">발행자 정보 없음</p>
					<?endif?>
				</div>
			</div>
		</div>
	</div>

	<!-- 캠페인 상품 목록 -->
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">캠페인 대상 상품 (<?=!empty($products) ? count($products) : count($productIDs)?>개)</div>
			<?if (!empty($products)):?>
			<div class="table-responsive">
				<table class="table table-sm table-bordered mb-0">
					<thead class="table-dark">
						<tr>
							<th class="text-center" style="width:40px;">#</th>
							<th>상품명</th>
							<th class="text-center" style="width:90px;">기본 할인</th>
							<th>가격 (통화별)</th>
							<th class="text-center" style="width:200px;">상품 ID</th>
							<th class="text-center" style="width:80px;"></th>
						</tr>
					</thead>
					<tbody>
						<?foreach ($products as $i => $p):
							$pId      = $p->id   ?? '';
							$pName    = $p->name ?? '—';
							$defPct   = $p->defaultDiscountPercent ?? 0;
							$prices   = !empty($p->prices) ? (array)$p->prices : array();
						?>
						<tr>
							<td class="text-center text-secondary"><?=$i + 1?></td>
							<td class="fw-semibold"><?=htmlspecialchars($pName)?></td>
							<td class="text-center">
								<?if ($defPct > 0):?>
								<span class="badge bg-warning text-dark"><?=(int)$defPct?>%</span>
								<?else:?>
								<span class="text-secondary">—</span>
								<?endif?>
							</td>
							<td>
								<?if (!empty($prices)):
									$hidden_pp = 0;
								?>
								<?foreach ($prices as $pr):
									$curr     = $pr->currency ?? null;
									$currName = $curr->name ?? '';
									if (!pn_is_relevant_currency($currName)) { $hidden_pp++; continue; }
									$initFmt  = $pr->initialPrice->formatted    ?? '';
									$discFmt  = $pr->discountedPrice->formatted ?? '';
									$discPct  = $pr->discount->percent           ?? 0;
								?>
								<div class="mb-1" style="font-size:12px; line-height:1.5;">
									<span class="badge bg-dark border border-secondary me-1" style="font-weight:normal;"><?=htmlspecialchars($currName)?></span>
									<?if ($discPct > 0):?>
									<span class="origin-price"><?=htmlspecialchars($initFmt)?></span>
									<span class="promo-price ms-1"><?=htmlspecialchars($discFmt)?></span>
									<small class="text-warning ms-1">(-<?=(int)$discPct?>%)</small>
									<?else:?>
									<span class="text-white"><?=htmlspecialchars($initFmt)?></span>
									<?endif?>
								</div>
								<?endforeach?>
								<?if ($hidden_pp > 0):?>
								<small class="text-secondary">외 <?=$hidden_pp?>개 통화</small>
								<?endif?>
								<?else:?>
								<span class="text-secondary">—</span>
								<?endif?>
							</td>
							<td class="text-center uuid"><?=htmlspecialchars($pId)?></td>
							<td class="text-center">
								<a href="product_view.php?id=<?=urlencode($pId)?>" target="_blank" class="btn btn-sm btn-outline-info">
									<i class="fas fa-eye"></i>
								</a>
							</td>
						</tr>
						<?endforeach?>
					</tbody>
				</table>
			</div>
			<?elseif (!empty($productIDs)):?>
			<table class="table table-sm table-bordered mb-0">
				<thead class="table-dark">
					<tr>
						<th class="text-center" style="width:40px;">#</th>
						<th>상품 ID</th>
						<th class="text-center" style="width:80px;"></th>
					</tr>
				</thead>
				<tbody>
					<?foreach ($productIDs as $i => $pid):?>
					<tr>
						<td class="text-center text-secondary"><?=$i + 1?></td>
						<td class="uuid"><?=htmlspecialchars($pid)?></td>
						<td class="text-center">
							<a href="product_view.php?id=<?=urlencode($pid)?>" target="_blank" class="btn btn-sm btn-outline-info">
								<i class="fas fa-eye"></i>
							</a>
						</td>
					</tr>
					<?endforeach?>
				</tbody>
			</table>
			<?else:?>
			<p class="text-secondary mb-0">대상 상품 정보 없음</p>
			<?endif?>
		</div>
	</div>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
