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
		$result = $nexus->runProductSell($id, array(
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

pn_head('즉시 판매 (라이선스 키 발급)', 'POST /product/{id}/sell');
?>

<div class="alert alert-warning d-flex align-items-center" style="font-size:12px;">
	<i class="fas fa-circle-exclamation me-2"></i>
	<span>이 API는 실제 판매를 수행합니다. 응답의 <code>operationID</code>는 반드시 DB에 저장하세요.</span>
</div>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<div class="section-title">요청 파라미터</div>
		<form method="post" action="product_sell.php" class="row g-2">
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
				<button type="submit" class="btn btn-sm btn-success"><i class="fas fa-cash-register me-1"></i>판매 실행</button>
			</div>
		</form>
	</div>
</div>

<?if ($executed):?>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?elseif ($data):?>

	<?
	$operationID = $data->operationID ?? '';
	$productID   = $data->productID   ?? '—';
	$license     = $data->license     ?? null;
	$key         = $license->key      ?? '';
	$platform    = $license->platform ?? '—';
	$countries   = !empty($license->countries) ? (array)$license->countries : array();
	$isPreorder  = empty($key);
	?>

	<?if ($isPreorder):?>
	<div class="alert alert-info d-flex align-items-center">
		<i class="fas fa-clock me-2"></i>
		<span>프리오더 판매 등록 완료 — 출시 후 <a href="operation_reveal.php?id=<?=urlencode($operationID)?>" target="_blank" class="alert-link">reveal</a>로 키를 조회하세요.</span>
	</div>
	<?else:?>
	<?pn_alert_success('판매 완료 — 라이선스 키가 발급되었습니다.')?>
	<?endif?>

	<!-- 핵심 결과 -->
	<div class="card border-0 shadow-sm mb-4" style="background:#16213e;">
		<div class="card-body text-center py-4">
			<div class="section-title">operationID (반드시 저장)</div>
			<span class="opid-display"><?=htmlspecialchars($operationID)?></span>

			<?if (!$isPreorder):?>
			<div class="mt-4">
				<div class="section-title">라이선스 키</div>
				<span class="key-display"><?=htmlspecialchars($key)?></span>
			</div>
			<?endif?>
		</div>
	</div>

	<div class="row g-4 mb-4">
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">판매 정보</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?pn_row('productID', $productID)?>
							<?pn_row('platform',  $platform)?>
							<?pn_row('상태',      $isPreorder ? '프리오더 (키 미발급)' : '판매 완료 (키 발급)')?>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">후속 작업</div>
					<div class="d-grid gap-2">
						<a href="operation_view.php?id=<?=urlencode($operationID)?>" target="_blank" class="btn btn-sm btn-outline-info">
							<i class="fas fa-eye me-1"></i>오퍼레이션 상세 조회
						</a>
						<?if ($isPreorder):?>
						<a href="operation_reveal.php?id=<?=urlencode($operationID)?>" target="_blank" class="btn btn-sm btn-outline-warning">
							<i class="fas fa-key me-1"></i>키 공개 (reveal)
						</a>
						<?endif?>
						<a href="operation_cancel.php?id=<?=urlencode($operationID)?>" target="_blank" class="btn btn-sm btn-outline-danger">
							<i class="fas fa-ban me-1"></i>판매 취소
						</a>
					</div>
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
		</div>
	</div>
	<?endif?>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
