<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$id   = trim($_REQUEST['id'] ?? '');

$executed = ($id !== '');
$error    = '';
$capsule  = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runCapsule($id);
		if (!empty($result->success)) {
			$capsule = !empty($result->data) ? (is_array($result->data) ? $result->data[0] : $result->data) : null;
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

$status_colors = array(
	'init'=>'secondary','running'=>'primary','success'=>'success','failed'=>'danger','cancelled'=>'warning'
);

pn_head('캡슐 조회', 'GET /capsule/{id}');
?>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="get" action="capsule_view.php" class="row g-2 align-items-end">
			<div class="col-md-10">
				<div class="field-label">id (필수) — 캡슐 hex ID</div>
				<input type="text" name="id" class="form-control form-control-sm" value="<?=htmlspecialchars($id)?>" placeholder="예: 3eaceb256ea08958b1f6a7abf690a741fc5f1baa335f9e5c43b6766c6460026c" required>
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
<?elseif ($capsule):?>

	<?
	$cArr        = (array)$capsule;
	$cId         = $cArr['id']            ?? $id;
	$status      = $cArr['status']        ?? '—';
	$createdAt   = $cArr['createdAt']     ?? '';
	$lastUpdated = $cArr['lastUpdatedAt'] ?? '';
	$flowID      = $cArr['flowID']        ?? '';
	$flowCode    = $cArr['flowCodename']  ?? '';
	$flowVersion = $cArr['flowVersion']   ?? '';
	$productID   = $cArr['productID']     ?? '';
	$poolName    = $cArr['poolName']      ?? '';
	$metadata    = $cArr['metadata']      ?? null;
	$productVariant  = $cArr['productVariant']  ?? null;
	$productSnapshot = $cArr['productSnapshot'] ?? null;
	$statusColor = $status_colors[$status] ?? 'info';

	$baseKeys  = array('id','status','createdAt','lastUpdatedAt','flowID','flowCodename','flowVersion','productID','poolName','metadata','productVariant','productSnapshot');
	$extraKeys = array_diff(array_keys($cArr), $baseKeys);
	?>

	<div class="row g-4 mb-4">
		<div class="col-md-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">캡슐 정보</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<tr>
								<td class="label-col">status</td>
								<td class="value-col"><span class="badge bg-<?=$statusColor?>"><?=htmlspecialchars($status)?></span></td>
							</tr>
							<?if ($poolName):?>
							<tr>
								<td class="label-col">poolName</td>
								<td class="value-col"><span class="badge bg-dark border border-secondary"><?=htmlspecialchars($poolName)?></span></td>
							</tr>
							<?endif?>
							<?if ($createdAt):?><?pn_row('createdAt',     pn_fmt_date($createdAt))?><?endif?>
							<?if ($lastUpdated):?><?pn_row('lastUpdatedAt', pn_fmt_date($lastUpdated))?><?endif?>
							<tr><td class="label-col">id</td><td class="value-col uuid"><?=htmlspecialchars($cId)?></td></tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<div class="col-md-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">플로우 (flow)</div>
					<table class="table table-sm table-borderless mb-0">
						<tbody>
							<?if ($flowCode):?><?pn_row('flowCodename', $flowCode)?><?endif?>
							<?if ($flowVersion!==''):?><?pn_row('flowVersion', $flowVersion)?><?endif?>
							<?if ($flowID):?>
							<tr><td class="label-col">flowID</td><td class="value-col uuid"><?=htmlspecialchars($flowID)?></td></tr>
							<?endif?>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<div class="col-md-4">
			<div class="card border-0 shadow-sm h-100">
				<div class="card-body">
					<div class="section-title">연관 상품</div>
					<?if ($productID):?>
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
						</tbody>
					</table>
					<a href="product_view.php?id=<?=urlencode($productID)?>" target="_blank" class="btn btn-sm btn-outline-info mt-2">
						<i class="fas fa-eye me-1"></i>상품 상세 조회
					</a>
					<?else:?>
					<p class="text-secondary mb-0">연관 상품 정보 없음</p>
					<?endif?>
				</div>
			</div>
		</div>
	</div>

	<!-- metadata / variant / snapshot — 비어있지 않을 때만 -->
	<?
	$arrayFields = array(
		'metadata'        => $metadata,
		'productVariant'  => $productVariant,
		'productSnapshot' => $productSnapshot,
	);
	$nonEmpty = array_filter($arrayFields, function($v){ return !empty((array)$v); });
	?>
	<?if (!empty($nonEmpty)):?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">상세 데이터</div>
			<?foreach ($nonEmpty as $name => $val):?>
			<div class="mb-3">
				<div class="field-label"><?=htmlspecialchars($name)?></div>
				<pre class="json-box mb-0" style="max-height:200px;"><?=htmlspecialchars(json_encode($val, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))?></pre>
			</div>
			<?endforeach?>
		</div>
	</div>
	<?endif?>

	<?if (!empty($extraKeys)):?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">추가 정보</div>
			<table class="table table-sm table-borderless mb-0">
				<tbody>
					<?foreach ($extraKeys as $k):
						$v = $cArr[$k];
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
