<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id              = trim($_REQUEST['id']              ?? '');
$currency        = trim($_REQUEST['currency']        ?? '');
$countryCode     = trim($_REQUEST['countryCode']     ?? '');
$price           = trim($_REQUEST['price']           ?? '');
$vat             = trim($_REQUEST['vat']             ?? '');
$ip              = trim($_REQUEST['IP']              ?? '');
$buyerCountry    = trim($_REQUEST['buyerCountry']    ?? '');
$clientRequestID = trim($_REQUEST['clientRequestID'] ?? '');

$executed = ($id !== '' && $currency !== '' && $countryCode !== '' && $price !== '' && $vat !== '');
$error    = '';
$data     = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runProductCheck($id, array(
			'currency'        => $currency,
			'countryCode'     => $countryCode,
			'price'           => (int)$price,
			'vat'             => (int)$vat,
			'IP'              => $ip,
			'buyerCountry'    => $buyerCountry,
			'clientRequestID' => $clientRequestID,
		));
		if (!empty($result->success)) {
			$data = $result->data ?? null;
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

pn_head('판매 가능 여부 사전 확인', 'POST /product/{id}/check');
?>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<div class="section-title">요청 파라미터</div>
		<form method="post" action="product_check.php" class="row g-2">
			<div class="col-md-6">
				<div class="field-label">id (필수) — 상품 UUID</div>
				<input type="text" name="id" class="form-control form-control-sm" value="<?=htmlspecialchars($id)?>" required>
			</div>
			<div class="col-md-2">
				<div class="field-label">currency (필수)</div>
				<input type="text" name="currency" class="form-control form-control-sm" placeholder="USD" value="<?=htmlspecialchars($currency)?>" required>
			</div>
			<div class="col-md-2">
				<div class="field-label">countryCode (필수)</div>
				<input type="text" name="countryCode" class="form-control form-control-sm" placeholder="US" value="<?=htmlspecialchars($countryCode)?>" required>
			</div>
			<div class="col-md-1">
				<div class="field-label">price (필수)</div>
				<input type="text" name="price" class="form-control form-control-sm" placeholder="5990" value="<?=htmlspecialchars($price)?>" required>
			</div>
			<div class="col-md-1">
				<div class="field-label">vat (필수)</div>
				<input type="text" name="vat" class="form-control form-control-sm" placeholder="2000" value="<?=htmlspecialchars($vat)?>" required>
			</div>
			<div class="col-md-3">
				<div class="field-label">IP</div>
				<input type="text" name="IP" class="form-control form-control-sm" placeholder="123.45.67.89" value="<?=htmlspecialchars($ip)?>">
			</div>
			<div class="col-md-3">
				<div class="field-label">buyerCountry</div>
				<input type="text" name="buyerCountry" class="form-control form-control-sm" placeholder="US" value="<?=htmlspecialchars($buyerCountry)?>">
			</div>
			<div class="col-md-6">
				<div class="field-label">clientRequestID (24h 내 중복 방지)</div>
				<input type="text" name="clientRequestID" class="form-control form-control-sm" value="<?=htmlspecialchars($clientRequestID)?>">
			</div>
			<div class="col-md-12 text-end mt-2">
				<button type="submit" class="btn btn-sm btn-primary"><i class="fas fa-play me-1"></i>실행</button>
			</div>
		</form>
	</div>
</div>

<?if ($executed):?>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?elseif ($data):?>

	<?pn_alert_success('판매 가능합니다. (실제 키 발급은 sell 호출이 필요합니다)')?>

	<?
	$productID = $data->productID ?? '—';
	$platform  = $data->platform  ?? '—';
	$countries = !empty($data->countries) ? (array)$data->countries : array();
	$priceInfo = $data->price ?? null;
	$initFmt   = $priceInfo->initialFormatted ?? '';
	$priceFmt  = $priceInfo->priceFormatted   ?? '';
	$initVal   = $priceInfo->initial          ?? null;
	$priceVal  = $priceInfo->price            ?? null;
	$hasPromo  = !empty($priceInfo->promo);
	?>

	<!-- 가격 강조 -->
	<?if ($priceFmt):?>
	<div class="card border-0 shadow-sm mb-4" style="background:#16213e;">
		<div class="card-body text-center py-4">
			<div class="section-title">판매 가격</div>
			<?if ($hasPromo && $initFmt):?>
			<div class="origin-price mb-2" style="font-size:16px;"><?=htmlspecialchars($initFmt)?></div>
			<span class="key-display" style="color:#f59e0b;"><?=htmlspecialchars($priceFmt)?></span>
			<div class="mt-2">
				<span class="badge bg-warning text-dark">프로모션 적용</span>
			</div>
			<?else:?>
			<span class="key-display" style="color:#0d6efd;"><?=htmlspecialchars($priceFmt)?></span>
			<?endif?>
		</div>
	</div>
	<?endif?>

	<div class="row g-4 mb-4">
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">검증 결과</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<tr>
								<td class="label-col">productID</td>
								<td class="value-col uuid">
									<a href="product_view.php?id=<?=urlencode($productID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars($productID)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
									</a>
								</td>
							</tr>
							<tr>
								<td class="label-col">platform</td>
								<td class="value-col"><span class="badge bg-info"><?=htmlspecialchars($platform)?></span></td>
							</tr>
							<tr>
								<td class="label-col">리딤 가능 국가</td>
								<td class="value-col"><span class="badge bg-secondary"><?=count($countries)?>개<?=in_array('WW', $countries, true) ? ' (WW=전세계)' : '국'?></span></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">가격 상세</div>
					<?if ($priceInfo):?>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?pn_row('currency', $priceInfo->currency ?? '—')?>
							<?pn_row('symbol',   $priceInfo->symbol   ?? '—')?>
							<?if ($initVal !== null):?>
							<tr>
								<td class="label-col">initial (정가)</td>
								<td class="value-col"><?=number_format((int)$initVal)?></td>
							</tr>
							<?endif?>
							<?if ($priceVal !== null):?>
							<tr>
								<td class="label-col">price (판매가)</td>
								<td class="value-col fw-semibold"><?=number_format((int)$priceVal)?></td>
							</tr>
							<?endif?>
							<?pn_row('decimal', $priceInfo->decimal ?? '—')?>
							<?pn_row('divider', $priceInfo->divider ?? '—')?>
							<tr>
								<td class="label-col">promo</td>
								<td class="value-col">
									<?if ($hasPromo):?>
									<span class="badge bg-warning text-dark"><?=htmlspecialchars(is_string($priceInfo->promo) ? $priceInfo->promo : 'ON')?></span>
									<?else:?>
									<span class="text-secondary">없음</span>
									<?endif?>
								</td>
							</tr>
						</tbody>
					</table>
					<?else:?>
					<p class="text-secondary mb-0">가격 정보 없음</p>
					<?endif?>
				</div>
			</div>
		</div>
	</div>

	<?if (!empty($countries)):
		$kf = pn_filter_countries($countries);
	?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">리딤 가능 국가 (<?=count($countries)?>개)</div>
			<div class="country-wrap">
				<?foreach ($kf['shown'] as $c):?>
				<span class="badge bg-dark border border-secondary me-1"><?=htmlspecialchars($c)?></span>
				<?endforeach?>
				<?if ($kf['hidden'] > 0):?>
				<span class="badge bg-secondary me-1">외 <?=$kf['hidden']?>개국</span>
				<?endif?>
			</div>
			<?if (in_array('WW', $countries, true)):?>
			<small class="text-secondary d-block mt-2"><i class="fas fa-globe me-1"></i>WW = Worldwide (전 세계 리딤 가능)</small>
			<?endif?>
		</div>
	</div>
	<?endif?>

	<!-- 후속 작업 -->
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">후속 작업</div>
			<div class="d-flex gap-2 flex-wrap">
				<a href="product_sell.php?id=<?=urlencode($id)?>&currency=<?=urlencode($currency)?>&countryCode=<?=urlencode($countryCode)?>&price=<?=urlencode($price)?>&vat=<?=urlencode($vat)?>" target="_blank" class="btn btn-sm btn-success">
					<i class="fas fa-cash-register me-1"></i>즉시 판매 (sell)
				</a>
				<a href="product_book.php?id=<?=urlencode($id)?>&currency=<?=urlencode($currency)?>&countryCode=<?=urlencode($countryCode)?>&price=<?=urlencode($price)?>&vat=<?=urlencode($vat)?>" target="_blank" class="btn btn-sm btn-warning">
					<i class="fas fa-bookmark me-1"></i>예약 (book)
				</a>
			</div>
			<small class="text-secondary d-block mt-2">동일 파라미터로 sell/book 페이지가 사전 입력된 채 새 창으로 열립니다.</small>
		</div>
	</div>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
