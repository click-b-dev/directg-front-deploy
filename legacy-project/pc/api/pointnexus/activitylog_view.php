<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id   = trim($_REQUEST['id'] ?? '');

$executed = ($id !== '');
$error    = '';
$log      = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runActivityLogRetrieve($id);
		if (!empty($result->success)) {
			$log = !empty($result->data) ? (is_array($result->data) ? $result->data[0] : $result->data) : null;
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

$type_colors = array(
	'sale'=>'success','cancel'=>'danger','refund'=>'warning','revenue'=>'info','reveal'=>'primary'
);

pn_head('활동 로그 상세', 'GET /activitylog/{id}');
?>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="get" action="activitylog_view.php" class="row g-2 align-items-end">
			<div class="col-md-10">
				<div class="field-label">id (필수) — 로그 UUID</div>
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
<?elseif ($log):?>

	<?
	$lArr            = (array)$log;
	$lid             = $lArr['id']                ?? $id;
	$type            = $lArr['type']              ?? '';
	$createdAt       = $lArr['createdAt']         ?? '';
	$opID            = $lArr['operationID']       ?? '';
	$fromOpID        = $lArr['fromOperationID']   ?? '';
	$prod            = $lArr['product']           ?? null;
	$prodArr         = $prod ? (array)$prod : array();
	$prodID          = $prodArr['id']             ?? '';
	$tColor          = $type_colors[$type]        ?? 'secondary';

	$baseKeys  = array('id','type','createdAt','operationID','fromOperationID','product');
	$extraKeys = array_diff(array_keys($lArr), $baseKeys);
	?>

	<div class="row g-4 mb-4">
		<div class="col-md-6">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">로그 정보</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<tr><td class="label-col">id</td><td class="value-col uuid"><?=htmlspecialchars($lid)?></td></tr>
							<?if ($type):?>
							<tr>
								<td class="label-col">type</td>
								<td class="value-col"><span class="badge bg-<?=$tColor?>"><?=htmlspecialchars($type)?></span></td>
							</tr>
							<?endif?>
							<?if ($createdAt):?><?pn_row('createdAt', pn_fmt_date($createdAt))?><?endif?>
							<?if ($opID):?>
							<tr>
								<td class="label-col">operationID</td>
								<td class="value-col uuid">
									<a href="operation_view.php?id=<?=urlencode($opID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars($opID)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
									</a>
								</td>
							</tr>
							<?endif?>
							<?if ($fromOpID):?>
							<tr>
								<td class="label-col">fromOperationID</td>
								<td class="value-col uuid">
									<a href="operation_view.php?id=<?=urlencode($fromOpID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars($fromOpID)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
									</a>
									<small class="text-secondary d-block mt-1">원본 오퍼레이션 (예: 취소의 원래 판매)</small>
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
					<div class="section-title">상품 (product)</div>
					<?if ($prod):?>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?foreach ($prodArr as $k => $v):
								if (is_array($v) || is_object($v)) {
									$display = json_encode($v, JSON_UNESCAPED_UNICODE);
								} else {
									$display = (string)$v;
								}
							?>
							<tr>
								<td class="label-col"><?=htmlspecialchars($k)?></td>
								<td class="value-col<?=$k==='id'?' uuid':''?>">
									<?if ($k==='id' && $prodID):?>
									<a href="product_view.php?id=<?=urlencode($prodID)?>" target="_blank" class="text-info text-decoration-none">
										<?=htmlspecialchars($display)?> <i class="fas fa-arrow-up-right-from-square fa-xs"></i>
									</a>
									<?else:?>
									<?=htmlspecialchars($display)?>
									<?endif?>
								</td>
							</tr>
							<?endforeach?>
						</tbody>
					</table>
					<?else:?>
					<p class="text-secondary mb-0">상품 정보 없음</p>
					<?endif?>
				</div>
			</div>
		</div>
	</div>

	<?if (!empty($extraKeys)):?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">추가 정보</div>
			<table class="table table-sm table-borderless mb-0">
				<tbody>
					<?foreach ($extraKeys as $k):
						$v = $lArr[$k];
						$display = is_scalar($v) ? (string)$v : json_encode($v, JSON_UNESCAPED_UNICODE);
					?>
					<tr>
						<td class="label-col"><?=htmlspecialchars($k)?></td>
						<td class="value-col"><?=htmlspecialchars($display)?></td>
					</tr>
					<?endforeach?>
				</tbody>
			</table>
		</div>
	</div>
	<?endif?>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
