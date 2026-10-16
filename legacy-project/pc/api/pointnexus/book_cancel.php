<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id      = trim($_REQUEST['id'] ?? '');
$confirm = !empty($_POST['confirm']);

$executed = ($id !== '' && $confirm && $_SERVER['REQUEST_METHOD'] === 'POST');
$error    = '';
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runBookCancel($id);
		if (empty($result->success)) {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

pn_head('예약 취소 (키 반납)', 'POST /book/{id}/cancel');
?>

<div class="alert alert-warning d-flex align-items-center" style="font-size:12px;">
	<i class="fas fa-triangle-exclamation me-2"></i>
	<span>예약 취소 시 키가 재고로 반납됩니다. 이미 confirm/cancel된 예약은 재취소할 수 없습니다.</span>
</div>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="post" action="book_cancel.php" class="row g-2 align-items-end" onsubmit="return confirm('정말로 이 예약을 취소하시겠습니까?\n\nID: ' + this.id.value);">
			<div class="col-md-9">
				<div class="field-label">id (필수) — 취소할 예약 operationID</div>
				<input type="text" name="id" class="form-control form-control-sm" value="<?=htmlspecialchars($id)?>" required>
			</div>
			<div class="col-md-3 text-end">
				<input type="hidden" name="confirm" value="1">
				<button type="submit" class="btn btn-sm btn-danger"><i class="fas fa-ban me-1"></i>예약 취소 실행</button>
			</div>
		</form>
	</div>
</div>

<?if ($executed):?>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?else:?>

	<?pn_alert_success('예약이 취소되었습니다 — 키가 재고로 반납되었습니다.')?>

	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">취소된 예약</div>
			<table class="table table-sm table-borderless mb-0">
				<tbody>
					<tr>
						<td class="label-col">operationID</td>
						<td class="value-col uuid"><?=htmlspecialchars($id)?></td>
					</tr>
					<tr>
						<td class="label-col">처리 시각</td>
						<td class="value-col"><?=date('Y-m-d H:i:s')?></td>
					</tr>
				</tbody>
			</table>

			<div class="mt-3">
				<a href="operation_view.php?id=<?=urlencode($id)?>" target="_blank" class="btn btn-sm btn-outline-info">
					<i class="fas fa-eye me-1"></i>현재 상태 조회
				</a>
			</div>
		</div>
	</div>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
