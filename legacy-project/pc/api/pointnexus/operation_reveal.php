<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id      = trim($_REQUEST['id'] ?? '');
$confirm = !empty($_POST['confirm']);

$executed = ($id !== '' && $confirm);
$error    = '';
$data     = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runOperationReveal($id);
		if (!empty($result->success)) {
			$data = !empty($result->data) ? (is_array($result->data) ? $result->data[0] : $result->data) : null;
		} else {
			$error = pn_extract_error($result, '아직 출시되지 않았거나 reveal할 수 없는 상태입니다.');
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

pn_head('프리오더 키 공개 (reveal)', 'POST /operation/{id}/reveal');
?>

<div class="alert alert-info d-flex align-items-center" style="font-size:12px;">
	<i class="fas fa-circle-info me-2"></i>
	<span>프리오더 sell 후 퍼블리셔의 출시 처리가 완료되어야 키가 공개됩니다. 400 응답 시 일정 간격으로 재시도하세요.</span>
</div>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="post" action="operation_reveal.php" class="row g-2 align-items-end">
			<div class="col-md-9">
				<div class="field-label">id (필수) — 프리오더 sell 시 받은 operationID</div>
				<input type="text" name="id" class="form-control form-control-sm" value="<?=htmlspecialchars($id)?>" required>
			</div>
			<div class="col-md-3 text-end">
				<input type="hidden" name="confirm" value="1">
				<button type="submit" class="btn btn-sm btn-warning"><i class="fas fa-key me-1"></i>키 공개 실행</button>
			</div>
		</form>
	</div>
</div>

<?if ($executed):?>

<?if ($error):?>
	<?pn_alert_error($error)?>
	<div class="alert alert-secondary" style="font-size:12px;">
		<i class="fas fa-clock me-1"></i>퍼블리셔 출시 대기 중일 가능성이 높습니다. 시간 간격을 두고 재시도하세요.
	</div>
<?elseif ($data):?>

	<?
	$dataArr      = (array)$data;
	$revealID     = $dataArr['id']             ?? '';
	$revealType   = $dataArr['type']           ?? '';
	$productID    = $dataArr['productID']      ?? '';
	$variant      = $dataArr['productVariant'] ?? null;
	$countryCodes = $variant->countryCodes     ?? '';
	$capsule      = $dataArr['capsule']        ?? null;
	$capsuleID    = $capsule->id               ?? '';
	$item         = $capsule->item             ?? null;
	$key          = $item->key                 ?? '';
	$platform     = $item->platform            ?? '—';
	?>

	<?pn_alert_success('키가 공개되었습니다.')?>

	<?if ($key):?>
	<div class="card border-0 shadow-sm mb-4" style="background:#16213e;">
		<div class="card-body text-center py-4">
			<div class="section-title">공개된 라이선스 키</div>
			<span class="key-display"><?=htmlspecialchars($key)?></span>
			<div class="mt-3 text-secondary" style="font-size:12px;">
				<i class="fas fa-cube me-1"></i>플랫폼: <strong><?=htmlspecialchars($platform)?></strong>
			</div>
		</div>
	</div>
	<?endif?>

	<div class="row g-4 mb-4">
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">reveal 정보</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<tr><td class="label-col">operationID (요청)</td><td class="value-col uuid"><?=htmlspecialchars($id)?></td></tr>
							<?if ($revealID):?>
							<tr><td class="label-col">reveal id</td><td class="value-col uuid"><?=htmlspecialchars($revealID)?></td></tr>
							<?endif?>
							<?if ($revealType):?><?pn_row('type', $revealType)?><?endif?>
							<?if ($productID):?>
							<tr>
								<td class="label-col">productID</td>
								<td class="value-col uuid">
									<a href="product_view.php?id=<?=urlencode($productID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars($productID)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
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
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">관련 작업</div>
					<div class="d-grid gap-2">
						<a href="operation_view.php?id=<?=urlencode($id)?>" target="_blank" class="btn btn-sm btn-outline-info">
							<i class="fas fa-eye me-1"></i>오퍼레이션 상세 조회
						</a>
						<?if ($capsuleID):?>
						<a href="capsule_view.php?id=<?=urlencode($capsuleID)?>" target="_blank" class="btn btn-sm btn-outline-info">
							<i class="fas fa-cube me-1"></i>캡슐 상세
						</a>
						<?endif?>
					</div>
				</div>
			</div>
		</div>
	</div>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
