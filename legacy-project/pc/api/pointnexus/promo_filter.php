<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$startDate  = trim($_REQUEST['startDate']  ?? '');
$endDate    = trim($_REQUEST['endDate']    ?? '');
$productIDs = trim($_REQUEST['productIDs'] ?? '');
$issuerIDs  = trim($_REQUEST['issuerIDs']  ?? '');

$executed  = ($_SERVER['REQUEST_METHOD'] === 'POST');
$error     = '';
$campaigns = array();
$total     = 0;
$result    = null;

if ($executed) {
	$params = array(
		'startDate'  => $startDate,
		'endDate'    => $endDate,
		'productIDs' => array_filter(array_map('trim', explode(',', $productIDs))),
		'issuerIDs'  => array_filter(array_map('trim', explode(',', $issuerIDs))),
	);

	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runPromoFilter($params);
		if (!empty($result->success)) {
			$campaigns = !empty($result->data) ? (array)$result->data : array();
			$total     = $result->count ?? count($campaigns);
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

pn_head('필터링된 프로모션 캠페인 목록', 'POST /promo');
?>

<!-- 필터 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<div class="section-title">필터 (모두 선택사항)</div>
		<form method="post" action="promo_filter.php" class="row g-2">
			<div class="col-md-3">
				<div class="field-label">startDate</div>
				<input type="text" name="startDate" class="form-control form-control-sm" placeholder="2025-01-29T23:00:00+0000" value="<?=htmlspecialchars($startDate)?>">
			</div>
			<div class="col-md-3">
				<div class="field-label">endDate</div>
				<input type="text" name="endDate" class="form-control form-control-sm" placeholder="2025-01-30T23:00:00+0000" value="<?=htmlspecialchars($endDate)?>">
			</div>
			<div class="col-md-3">
				<div class="field-label">productIDs (콤마 구분)</div>
				<input type="text" name="productIDs" class="form-control form-control-sm" placeholder="uuid1, uuid2" value="<?=htmlspecialchars($productIDs)?>">
			</div>
			<div class="col-md-3">
				<div class="field-label">issuerIDs (콤마 구분)</div>
				<input type="text" name="issuerIDs" class="form-control form-control-sm" placeholder="uuid1, uuid2" value="<?=htmlspecialchars($issuerIDs)?>">
			</div>
			<div class="col-md-12 text-end mt-2">
				<button type="submit" class="btn btn-sm btn-primary"><i class="fas fa-filter me-1"></i>필터 적용</button>
			</div>
		</form>
	</div>
</div>

<?if ($executed):?>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?else:?>

	<div class="d-flex align-items-center justify-content-between mb-3">
		<div class="text-secondary">필터 결과 <strong class="text-white"><?=number_format($total)?></strong>개 캠페인</div>
	</div>

	<?if (empty($campaigns)):?>
	<div class="empty-state">
		<i class="fas fa-filter-circle-xmark fa-3x mb-3 d-block"></i>
		조건에 맞는 캠페인이 없습니다.
	</div>
	<?else:?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="table-responsive">
			<table class="table table-hover table-bordered mb-0">
				<thead class="table-dark">
					<tr>
						<th class="text-center" style="width:40px;">#</th>
						<th>캠페인명</th>
						<th>발행자</th>
						<th class="text-center" style="width:90px;">상태</th>
						<th class="text-center" style="width:100px;">상품 수</th>
						<th class="text-center" style="width:140px;">시작일</th>
						<th class="text-center" style="width:140px;">종료일</th>
						<th class="text-center" style="width:200px;">캠페인 ID</th>
						<th class="text-center" style="width:80px;"></th>
					</tr>
				</thead>
				<tbody>
					<?
					$state_colors = array('running'=>'success','scheduled'=>'info','ended'=>'secondary','paused'=>'warning');
					foreach ($campaigns as $i => $c):
						$cArr        = (array)$c;
						$id_         = $cArr['id']        ?? '';
						$name        = $cArr['name']      ?? '—';
						$state       = $cArr['state']     ?? '';
						$issuerName  = $cArr['issuer']->name ?? '—';
						$pids        = !empty($cArr['productIDs']) ? (array)$cArr['productIDs'] : array();
						$sd          = $cArr['startDate'] ?? '';
						$ed          = $cArr['endDate']   ?? '';
						$stateColor  = $state_colors[$state] ?? 'info';
					?>
					<tr>
						<td class="text-center text-secondary"><?=$i + 1?></td>
						<td class="fw-semibold"><?=htmlspecialchars($name)?></td>
						<td><?=htmlspecialchars($issuerName)?></td>
						<td class="text-center">
							<?if ($state):?><span class="badge bg-<?=$stateColor?>"><?=htmlspecialchars($state)?></span><?else:?><span class="text-secondary">—</span><?endif?>
						</td>
						<td class="text-center"><span class="badge bg-secondary"><?=count($pids)?>개</span></td>
						<td class="text-center" style="font-size:12px;"><?=htmlspecialchars(pn_fmt_date($sd, 16))?></td>
						<td class="text-center" style="font-size:12px;"><?=htmlspecialchars(pn_fmt_date($ed, 16))?></td>
						<td class="text-center uuid"><?=htmlspecialchars($id_)?></td>
						<td class="text-center">
							<a href="promo_view.php?id=<?=urlencode($id_)?>" target="_blank" class="btn btn-sm btn-outline-info">
								<i class="fas fa-eye"></i>
							</a>
						</td>
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
