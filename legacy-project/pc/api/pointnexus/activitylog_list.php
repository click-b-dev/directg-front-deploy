<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$offset        = (int)($_REQUEST['offset'] ?? 0);
$limit         = (int)($_REQUEST['limit']  ?? 50);
$sort          = trim($_REQUEST['sort']          ?? 'createdAt');
$sortDirection = trim($_REQUEST['sortDirection'] ?? 'DESC');
$filters       = trim($_REQUEST['filters']       ?? '');

if ($offset < 0)   $offset = 0;
if ($limit  < 10)  $limit  = 50;
if ($limit  > 100) $limit  = 100;

$error = '';
$logs  = array();
$total = 0;
$result = null;

try {
	$nexus  = new PointNexus($mode);
	$result = $nexus->runActivityLog($offset, $limit, $sort, $sortDirection, $filters);
	if (!empty($result->success)) {
		$logs  = !empty($result->data) ? (array)$result->data : array();
		$total = $result->count ?? count($logs);
	} else {
		$error = pn_extract_error($result);
	}
} catch (Exception $e) {
	$error = $e->getMessage();
}

$type_colors = array(
	'sale'=>'success','cancel'=>'danger','refund'=>'warning','revenue'=>'info','reveal'=>'primary'
);

$prev_offset = max(0, $offset - $limit);
$next_offset = $offset + $limit;

$query_keep = function($overrides = array()) use ($offset, $limit, $sort, $sortDirection, $filters) {
	return http_build_query(array_merge(array(
		'offset'        => $offset,
		'limit'         => $limit,
		'sort'          => $sort,
		'sortDirection' => $sortDirection,
		'filters'       => $filters,
	), $overrides));
};

pn_head('활동 로그 목록', 'GET /activitylog');
?>

<!-- 필터 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="get" action="activitylog_list.php" class="row g-2 align-items-end">
			<div class="col-md-2">
				<div class="field-label">offset</div>
				<input type="number" name="offset" class="form-control form-control-sm" value="<?=(int)$offset?>" min="0">
			</div>
			<div class="col-md-2">
				<div class="field-label">limit (10~100)</div>
				<input type="number" name="limit" class="form-control form-control-sm" value="<?=(int)$limit?>" min="10" max="100">
			</div>
			<div class="col-md-2">
				<div class="field-label">sort</div>
				<select name="sort" class="form-select form-select-sm">
					<?foreach (array('createdAt','productID','type') as $s):?>
					<option value="<?=$s?>" <?=$sort===$s?'selected':''?>><?=$s?></option>
					<?endforeach?>
				</select>
			</div>
			<div class="col-md-2">
				<div class="field-label">sortDirection</div>
				<select name="sortDirection" class="form-select form-select-sm">
					<?foreach (array('DESC','ASC') as $sd):?>
					<option value="<?=$sd?>" <?=$sortDirection===$sd?'selected':''?>><?=$sd?></option>
					<?endforeach?>
				</select>
			</div>
			<div class="col-md-3">
				<div class="field-label">filters (JSON)</div>
				<input type="text" name="filters" class="form-control form-control-sm" value="<?=htmlspecialchars($filters)?>" placeholder='[{"field":"type","op":"=","value":"sale"}]'>
			</div>
			<div class="col-md-1 text-end">
				<button type="submit" class="btn btn-sm btn-primary w-100"><i class="fas fa-search"></i></button>
			</div>
		</form>
	</div>
</div>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?else:?>

	<div class="d-flex align-items-center justify-content-between mb-3">
		<div class="text-secondary">
			전체 <strong class="text-white"><?=number_format($total)?></strong>개
			<?if ($total > 0):?>
			&nbsp;·&nbsp;
			<?=number_format($offset + 1)?>–<?=number_format(min($offset + $limit, $total))?> 표시
			<?endif?>
		</div>
		<div class="d-flex gap-2">
			<?if ($offset > 0):?>
			<a href="?<?=$query_keep(array('offset'=>$prev_offset))?>" class="btn btn-sm btn-outline-secondary">
				<i class="fas fa-chevron-left me-1"></i>이전
			</a>
			<?endif?>
			<?if ($next_offset < $total):?>
			<a href="?<?=$query_keep(array('offset'=>$next_offset))?>" class="btn btn-sm btn-outline-secondary">
				다음<i class="fas fa-chevron-right ms-1"></i>
			</a>
			<?endif?>
		</div>
	</div>

	<?if (empty($logs)):?>
	<div class="empty-state">
		<i class="fas fa-clock-rotate-left fa-3x mb-3 d-block"></i>
		활동 로그가 없습니다.
	</div>
	<?else:?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="table-responsive">
			<table class="table table-hover table-bordered mb-0">
				<thead class="table-dark">
					<tr>
						<th class="text-center" style="width:40px;">#</th>
						<th class="text-center" style="width:90px;">type</th>
						<th class="text-center" style="width:150px;">createdAt</th>
						<th>상품</th>
						<th class="text-center" style="width:200px;">operationID</th>
						<th class="text-center" style="width:200px;">로그 ID</th>
						<th class="text-center" style="width:80px;"></th>
					</tr>
				</thead>
				<tbody>
					<?foreach ($logs as $i => $log):
						$lArr      = (array)$log;
						$lid       = $lArr['id']           ?? '';
						$type      = $lArr['type']         ?? '';
						$createdAt = $lArr['createdAt']    ?? '';
						$opID      = $lArr['operationID']  ?? '';
						$prod      = $lArr['product']      ?? null;
						$prodID    = $prod->id             ?? '';
						$prodName  = $prod->genericName    ?? '';
						$tColor    = $type_colors[$type]   ?? 'secondary';
					?>
					<tr>
						<td class="text-center text-secondary"><?=$offset + $i + 1?></td>
						<td class="text-center"><span class="badge bg-<?=$tColor?>"><?=htmlspecialchars($type ?: '—')?></span></td>
						<td class="text-center" style="font-size:12px;"><?=htmlspecialchars(pn_fmt_date($createdAt))?></td>
						<td>
							<?if ($prodName):?>
							<div class="fw-semibold"><?=htmlspecialchars($prodName)?></div>
							<?endif?>
							<?if ($prodID):?>
							<div class="uuid">
								<a href="product_view.php?id=<?=urlencode($prodID)?>" target="_blank" class="text-info text-decoration-none">
									<?=htmlspecialchars($prodID)?>
								</a>
							</div>
							<?else:?>
							<span class="text-secondary">—</span>
							<?endif?>
						</td>
						<td class="text-center uuid">
							<?if ($opID):?>
							<a href="operation_view.php?id=<?=urlencode($opID)?>" target="_blank" class="text-info text-decoration-none">
								<?=htmlspecialchars($opID)?>
							</a>
							<?else:?>
							<span class="text-secondary">—</span>
							<?endif?>
						</td>
						<td class="text-center uuid"><?=htmlspecialchars($lid)?></td>
						<td class="text-center">
							<a href="activitylog_view.php?id=<?=urlencode($lid)?>" target="_blank" class="btn btn-sm btn-outline-info">
								<i class="fas fa-eye"></i>
							</a>
						</td>
					</tr>
					<?endforeach?>
				</tbody>
			</table>
		</div>
	</div>

	<div class="d-flex justify-content-end gap-2 mt-3 mb-4">
		<?if ($offset > 0):?>
		<a href="?<?=$query_keep(array('offset'=>$prev_offset))?>" class="btn btn-sm btn-outline-secondary">
			<i class="fas fa-chevron-left me-1"></i>이전
		</a>
		<?endif?>
		<?if ($next_offset < $total):?>
		<a href="?<?=$query_keep(array('offset'=>$next_offset))?>" class="btn btn-sm btn-outline-secondary">
			다음<i class="fas fa-chevron-right ms-1"></i>
		</a>
		<?endif?>
	</div>
	<?endif?>

<?endif?>

<?pn_json_box($result)?>

<?pn_foot();?>
