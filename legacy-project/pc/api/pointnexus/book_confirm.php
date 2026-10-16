<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id      = trim($_REQUEST['id'] ?? '');
$confirm = !empty($_POST['confirm']);

$executed = ($id !== '' && $confirm && $_SERVER['REQUEST_METHOD'] === 'POST');
$error    = '';
$data     = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runBookConfirm($id);
		if (!empty($result->success)) {
			$data = $result->data ?? null;
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

pn_head('예약 확정 (키 공개)', 'POST /book/{id}/confirm');
?>

<div class="alert alert-info d-flex align-items-center" style="font-size:12px;">
	<i class="fas fa-circle-info me-2"></i>
	<span>결제 완료 후 호출하세요. 이미 confirm/cancel된 예약은 재확정할 수 없습니다.</span>
</div>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="post" action="book_confirm.php" class="row g-2 align-items-end">
			<div class="col-md-9">
				<div class="field-label">id (필수) — 확정할 예약 operationID</div>
				<input type="text" name="id" class="form-control form-control-sm" value="<?=htmlspecialchars($id)?>" required>
			</div>
			<div class="col-md-3 text-end">
				<input type="hidden" name="confirm" value="1">
				<button type="submit" class="btn btn-sm btn-success"><i class="fas fa-check me-1"></i>예약 확정 실행</button>
			</div>
		</form>
	</div>
</div>

<?if ($executed):?>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?elseif ($data):?>

	<?
	$operationID = $data->operationID ?? $id;
	$productID   = $data->productID   ?? '—';
	$license     = $data->license     ?? null;
	$key         = $license->key      ?? '';
	$platform    = $license->platform ?? '—';
	$countries   = !empty($license->countries) ? (array)$license->countries : array();
	?>

	<?pn_alert_success('예약이 확정되었습니다 — 키가 발급되었습니다.')?>

	<?if ($key):?>
	<div class="card border-0 shadow-sm mb-4" style="background:#16213e;">
		<div class="card-body text-center py-4">
			<div class="section-title">발급된 라이선스 키</div>
			<span class="key-display"><?=htmlspecialchars($key)?></span>
		</div>
	</div>
	<?endif?>

	<div class="row g-4 mb-4">
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">확정 정보</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<tr><td class="label-col">operationID</td><td class="value-col uuid"><?=htmlspecialchars($operationID)?></td></tr>
							<?if ($productID && $productID !== '—'):?>
							<tr>
								<td class="label-col">productID</td>
								<td class="value-col uuid">
									<a href="product_view.php?id=<?=urlencode($productID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars($productID)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
									</a>
								</td>
							</tr>
							<?endif?>
							<?pn_row('platform', $platform)?>
							<tr><td class="label-col">처리 시각</td><td class="value-col"><?=date('Y-m-d H:i:s')?></td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">관련 작업</div>
					<a href="operation_view.php?id=<?=urlencode($operationID)?>" target="_blank" class="btn btn-sm btn-outline-info">
						<i class="fas fa-eye me-1"></i>오퍼레이션 상세 조회
					</a>
				</div>
			</div>
		</div>
	</div>

	<?if (!empty($countries)):?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">리딤 가능 국가 (<?=count($countries)?>개)</div>
			<div class="country-wrap">
				<?foreach ($countries as $c):?>
				<span class="badge bg-dark border border-secondary me-1"><?=htmlspecialchars($c)?></span>
				<?endforeach?>
			</div>
		</div>
	</div>
	<?endif?>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
