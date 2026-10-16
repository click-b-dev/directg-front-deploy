<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$error     = '';
$campaigns = array();
$total     = 0;
$result    = null;

try {
	$nexus  = new PointNexus($mode);
	$result = $nexus->runPromo();
	if (!empty($result->success)) {
		$campaigns = !empty($result->data) ? (array)$result->data : array();
		$total     = $result->count ?? count($campaigns);
	} else {
		$error = pn_extract_error($result);
	}
} catch (Exception $e) {
	$error = $e->getMessage();
}

pn_head('진행 중/예정 프로모션 캠페인 목록', 'GET /promo');

if ($error):
	pn_alert_error($error);
else:
?>

<div class="d-flex align-items-center justify-content-between mb-3">
	<div class="text-secondary">전체 <strong class="text-white"><?=number_format($total)?></strong>개 캠페인</div>
	<a href="promo_filter.php" target="_blank" class="btn btn-sm btn-outline-info">
		<i class="fas fa-filter me-1"></i>필터로 조회
	</a>
</div>

<?if (empty($campaigns)):?>
<div class="empty-state">
	<i class="fas fa-tag fa-3x mb-3 d-block"></i>
	진행 중인 캠페인이 없습니다.
</div>
<?else:?>
<div class="card border-0 shadow-sm mb-4">
	<div class="table-responsive">
		<table class="table table-hover table-bordered mb-0">
			<thead class="table-dark">
				<tr>
					<th class="text-center" style="width:40px;">#</th>
					<th>캠페인명</th>
					<th>발행자 (issuer)</th>
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
					$id          = $cArr['id']        ?? '';
					$name        = $cArr['name']      ?? '—';
					$state       = $cArr['state']     ?? '';
					$issuer      = $cArr['issuer']    ?? null;
					$issuerName  = $issuer->name      ?? '—';
					$productIDs  = !empty($cArr['productIDs']) ? (array)$cArr['productIDs'] : array();
					$startDate   = $cArr['startDate'] ?? '';
					$endDate     = $cArr['endDate']   ?? '';
					$stateColor  = $state_colors[$state] ?? 'info';
				?>
				<tr>
					<td class="text-center text-secondary"><?=$i + 1?></td>
					<td class="fw-semibold"><?=htmlspecialchars($name)?></td>
					<td><?=htmlspecialchars($issuerName)?></td>
					<td class="text-center">
						<?if ($state):?><span class="badge bg-<?=$stateColor?>"><?=htmlspecialchars($state)?></span><?else:?><span class="text-secondary">—</span><?endif?>
					</td>
					<td class="text-center"><span class="badge bg-secondary"><?=count($productIDs)?>개</span></td>
					<td class="text-center" style="font-size:12px;"><?=htmlspecialchars(pn_fmt_date($startDate, 16))?></td>
					<td class="text-center" style="font-size:12px;"><?=htmlspecialchars(pn_fmt_date($endDate, 16))?></td>
					<td class="text-center uuid"><?=htmlspecialchars($id)?></td>
					<td class="text-center">
						<a href="promo_view.php?id=<?=urlencode($id)?>" target="_blank" class="btn btn-sm btn-outline-info">
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

<?
	pn_json_box($result);
endif;

pn_foot();
?>
