<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id   = trim($_REQUEST['id'] ?? '');

$executed = ($id !== '');
$error    = '';
$op       = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runOperation($id);
		if (!empty($result->success)) {
			$op = !empty($result->data) ? (is_array($result->data) ? $result->data[0] : $result->data) : null;
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

$state_colors = array(
	'done'=>'success', 'pending'=>'warning', 'failed'=>'danger',
	'cancelled'=>'secondary', 'cancelling'=>'secondary', 'error'=>'danger'
);
$type_colors = array(
	'sale'=>'primary', 'book'=>'warning', 'reveal'=>'info',
	'cancel'=>'danger', 'refund'=>'danger'
);

pn_head('오퍼레이션 조회', 'GET /operation/{id}');
?>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="get" action="operation_view.php" class="row g-2 align-items-end">
			<div class="col-md-10">
				<div class="field-label">id (필수) — 오퍼레이션 UUID</div>
				<input type="text" name="id" class="form-control form-control-sm" value="<?=htmlspecialchars($id)?>" placeholder="예: dd2d9ecb-118f-4e07-9f7a-1a1e68ce00f3" required>
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
<?elseif ($op):?>

	<?
	$opArr        = (array)$op;
	$state        = $opArr['state']         ?? '';
	$type         = $opArr['type']          ?? '';
	$qtyToProcess = $opArr['qtyToProcess']  ?? null;
	$qtyProcessed = $opArr['qtyProcessed']  ?? null;
	$qtyInError   = $opArr['qtyInError']    ?? null;
	$createdAt    = $opArr['createdAt']     ?? '';
	$lastUpdated  = $opArr['lastUpdatedAt'] ?? '';
	$buildID      = $opArr['buildID']       ?? '';
	$variant      = $opArr['productVariant'] ?? null;
	$countryCodes = '';
	if ($variant) {
		$vArr = (array)$variant;
		$countryCodes = $vArr['countryCodes'] ?? '';
	}
	$capsule      = $opArr['capsule']       ?? null;
	$capsuleID    = $capsule->id            ?? '';
	$item         = $capsule->item          ?? null;
	$key          = $item->key              ?? '';
	$platform     = $item->platform         ?? '';
	$details      = $opArr['details']       ?? null;
	$stateColor   = $state_colors[$state]   ?? 'info';
	$typeColor    = $type_colors[$type]     ?? 'secondary';
	?>

	<!-- 상태/타입 헤더 -->
	<div class="card border-0 shadow-sm mb-4" style="background:#16213e;">
		<div class="card-body">
			<div class="d-flex flex-wrap gap-3 align-items-center">
				<div>
					<div class="field-label">상태 (state)</div>
					<span class="badge bg-<?=$stateColor?>" style="font-size:14px; padding:6px 12px;"><?=htmlspecialchars($state ?: '—')?></span>
				</div>
				<div>
					<div class="field-label">타입 (type)</div>
					<span class="badge bg-<?=$typeColor?>" style="font-size:14px; padding:6px 12px;"><?=htmlspecialchars($type ?: '—')?></span>
				</div>
				<div class="ms-auto">
					<div class="field-label text-end">operationID</div>
					<span class="opid-display"><?=htmlspecialchars($id)?></span>
				</div>
			</div>
		</div>
	</div>

	<!-- 라이선스 키 (capsule이 있을 때만) -->
	<?if ($key):?>
	<div class="card border-0 shadow-sm mb-4" style="background:#16213e;">
		<div class="card-body text-center py-4">
			<div class="section-title">라이선스 키</div>
			<span class="key-display"><?=htmlspecialchars($key)?></span>
			<div class="mt-3 text-secondary" style="font-size:12px;">
				<i class="fas fa-cube me-1"></i>플랫폼: <strong><?=htmlspecialchars($platform)?></strong>
			</div>
		</div>
	</div>
	<?endif?>

	<div class="row g-4 mb-4">
		<!-- 처리량 -->
		<div class="col-md-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">처리량 (Quantity)</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?if ($qtyToProcess !== null):?><?pn_row('qtyToProcess', $qtyToProcess)?><?endif?>
							<?if ($qtyProcessed !== null):?>
							<tr>
								<td class="label-col">qtyProcessed</td>
								<td class="value-col"><span class="badge bg-success"><?=(int)$qtyProcessed?></span></td>
							</tr>
							<?endif?>
							<?if ($qtyInError !== null):?>
							<tr>
								<td class="label-col">qtyInError</td>
								<td class="value-col">
									<?if ((int)$qtyInError > 0):?>
									<span class="badge bg-danger"><?=(int)$qtyInError?></span>
									<?else:?>
									<span class="badge bg-secondary">0</span>
									<?endif?>
								</td>
							</tr>
							<?endif?>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- 시각 정보 -->
		<div class="col-md-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">시각</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?pn_row('createdAt',     pn_fmt_date($createdAt))?>
							<?pn_row('lastUpdatedAt', pn_fmt_date($lastUpdated))?>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- 상품/빌드 정보 -->
		<div class="col-md-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">상품 / 빌드</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?if ($buildID):?>
							<tr>
								<td class="label-col">buildID</td>
								<td class="value-col uuid">
									<a href="product_view.php?id=<?=urlencode($buildID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars($buildID)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
									</a>
								</td>
							</tr>
							<?endif?>
							<?if ($countryCodes):?><?pn_row('countryCodes', $countryCodes)?><?endif?>
							<?if ($capsuleID):?>
							<tr>
								<td class="label-col">capsule</td>
								<td class="value-col uuid">
									<a href="capsule_view.php?id=<?=urlencode($capsuleID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars(substr($capsuleID, 0, 16))?>… <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
									</a>
								</td>
							</tr>
							<?endif?>
							<?if (!$buildID && !$countryCodes && !$capsuleID):?>
							<tr><td colspan="2" class="text-secondary text-center">아직 처리 정보 없음</td></tr>
							<?endif?>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- 결제·수익 배분 (details) -->
	<?if ($details):?>
	<?
	$dArr = (array)$details;
	$sellPrice          = $dArr['sellPrice']                     ?? null;
	$sellCurr           = $dArr['sellCurrencyCode']              ?? '';
	$vat                = $dArr['VAT']                           ?? null;
	$convCurr           = $dArr['convertedCurrencyCode']         ?? '';
	$sellPriceConv      = $dArr['sellPriceConverted']            ?? null;
	$conversionRate     = $dArr['conversionRate']                ?? '';
	$srpBefore          = $dArr['SRPBeforePromo']                ?? null;
	$srp                = $dArr['SRP']                           ?? null;
	$promoName          = $dArr['promoName']                     ?? null;
	$promoPct           = $dArr['promoDiscountPct']              ?? 0;
	$revSharePct        = $dArr['revSharePct']                   ?? null;
	$pubAmount          = $dArr['publisherShareAmount']          ?? null;
	$pubCurr            = $dArr['publisherCurrencyCode']         ?? '';
	$pubAmountConv      = $dArr['publisherShareAmountConverted'] ?? null;
	$sellerAmount       = $dArr['sellerShareAmount']             ?? null;
	$sellerCurr         = $dArr['sellerCurrencyCode']            ?? '';
	$sellerAmountConv   = $dArr['sellerShareAmountConverted']    ?? null;
	?>
	<div class="row g-4 mb-4">
		<!-- 판매 가격 -->
		<div class="col-lg-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">판매 가격</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?if ($sellPrice !== null):?>
							<tr>
								<td class="label-col">sellPrice</td>
								<td class="value-col fw-semibold"><?=pn_money($sellPrice, $sellCurr)?> <small class="text-secondary"><?=htmlspecialchars($sellCurr)?></small></td>
							</tr>
							<?endif?>
							<?if ($vat !== null):?>
							<tr>
								<td class="label-col">VAT (세율)</td>
								<td class="value-col"><?=number_format($vat/100, 2)?> <small class="text-secondary">%</small></td>
							</tr>
							<?endif?>
							<?if ($sellPriceConv !== null):?>
							<tr>
								<td class="label-col">환산 가격</td>
								<td class="value-col"><?=pn_money($sellPriceConv, $convCurr)?> <small class="text-secondary"><?=htmlspecialchars($convCurr)?></small></td>
							</tr>
							<?endif?>
							<?if ($conversionRate):?><?pn_row('환율', $conversionRate)?><?endif?>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- 정가 / 프로모션 -->
		<div class="col-lg-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">정가 / 프로모션</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?if ($srpBefore !== null):?>
							<tr>
								<td class="label-col">SRP (할인 전)</td>
								<td class="value-col"><?=pn_money($srpBefore, $convCurr)?> <small class="text-secondary"><?=htmlspecialchars($convCurr)?></small></td>
							</tr>
							<?endif?>
							<?if ($srp !== null):?>
							<tr>
								<td class="label-col">SRP</td>
								<td class="value-col fw-semibold"><?=pn_money($srp, $convCurr)?> <small class="text-secondary"><?=htmlspecialchars($convCurr)?></small></td>
							</tr>
							<?endif?>
							<tr>
								<td class="label-col">프로모션</td>
								<td class="value-col">
									<?if ($promoName):?>
									<span class="badge bg-warning text-dark"><?=htmlspecialchars($promoName)?></span>
									<small class="ms-2 text-warning"><?=number_format((float)$promoPct, 1)?>% 할인</small>
									<?else:?>
									<span class="text-secondary">없음</span>
									<?endif?>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- 수익 배분 -->
		<div class="col-lg-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">수익 배분</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?if ($revSharePct !== null):?>
							<tr>
								<td class="label-col">revSharePct</td>
								<td class="value-col"><span class="badge bg-info"><?=htmlspecialchars($revSharePct)?>%</span></td>
							</tr>
							<?endif?>
							<?if ($pubAmount !== null):?>
							<tr>
								<td class="label-col">퍼블리셔</td>
								<td class="value-col fw-semibold text-success"><?=pn_money($pubAmount, $pubCurr)?> <small class="text-secondary"><?=htmlspecialchars($pubCurr)?></small></td>
							</tr>
							<?endif?>
							<?if ($sellerAmount !== null):?>
							<tr>
								<td class="label-col">셀러</td>
								<td class="value-col fw-semibold text-info"><?=pn_money($sellerAmount, $sellerCurr)?> <small class="text-secondary"><?=htmlspecialchars($sellerCurr)?></small></td>
							</tr>
							<?endif?>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	<?endif?>

	<!-- 후속 작업 -->
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">후속 작업</div>
			<div class="d-flex gap-2 flex-wrap">
				<?if ($type === 'sale' && !$key):?>
				<a href="operation_reveal.php?id=<?=urlencode($id)?>" target="_blank" class="btn btn-sm btn-warning">
					<i class="fas fa-key me-1"></i>키 공개 (reveal)
				</a>
				<?endif?>
				<?if ($type === 'book'):?>
				<a href="book_confirm.php?id=<?=urlencode($id)?>" target="_blank" class="btn btn-sm btn-success">
					<i class="fas fa-check me-1"></i>예약 확정
				</a>
				<a href="book_cancel.php?id=<?=urlencode($id)?>" target="_blank" class="btn btn-sm btn-outline-danger">
					<i class="fas fa-ban me-1"></i>예약 취소
				</a>
				<?endif?>
				<?if ($state !== 'cancelled'):?>
				<a href="operation_cancel.php?id=<?=urlencode($id)?>" target="_blank" class="btn btn-sm btn-outline-danger">
					<i class="fas fa-times-circle me-1"></i>오퍼레이션 취소
				</a>
				<?endif?>
				<?if ($capsuleID):?>
				<a href="capsule_view.php?id=<?=urlencode($capsuleID)?>" target="_blank" class="btn btn-sm btn-outline-info">
					<i class="fas fa-cube me-1"></i>캡슐 상세
				</a>
				<?endif?>
			</div>
		</div>
	</div>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
