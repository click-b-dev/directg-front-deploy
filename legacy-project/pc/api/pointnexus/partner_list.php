<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$persona = trim($_REQUEST['persona'] ?? '');

$error    = '';
$partners = array();
$total    = 0;
$result   = null;

try {
	$nexus  = new PointNexus($mode);
	$result = $nexus->runPartner($persona);
	if (!empty($result->success)) {
		$partners = !empty($result->data) ? (array)$result->data : array();
		$total    = $result->count ?? count($partners);
	} else {
		$error = pn_extract_error($result);
	}
} catch (Exception $e) {
	$error = $e->getMessage();
}

$personas = array(''=>'(전체)','publisher'=>'publisher','manufacturer'=>'manufacturer','distributor'=>'distributor','store'=>'store','influencer'=>'influencer','platform'=>'platform','trader'=>'trader');

$persona_colors = array(
	'publisher'=>'primary','manufacturer'=>'success','distributor'=>'info',
	'store'=>'warning','influencer'=>'danger','platform'=>'secondary','trader'=>'dark'
);

pn_head('파트너 목록', 'GET /partner');
?>

<!-- 필터 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="get" action="partner_list.php" class="row g-2 align-items-end">
			<div class="col-md-10">
				<div class="field-label">persona (선택)</div>
				<select name="persona" class="form-select form-select-sm" onchange="this.form.submit()">
					<?foreach ($personas as $val => $disp):?>
					<option value="<?=htmlspecialchars($val)?>" <?=$persona===$val?'selected':''?>><?=htmlspecialchars($disp)?></option>
					<?endforeach?>
				</select>
			</div>
			<div class="col-md-2 text-end">
				<button type="submit" class="btn btn-sm btn-primary"><i class="fas fa-search me-1"></i>조회</button>
			</div>
		</form>
	</div>
</div>

<?if ($error):?>
	<?pn_alert_error($error)?>
<?else:?>

	<div class="d-flex align-items-center justify-content-between mb-3">
		<div class="text-secondary">전체 <strong class="text-white"><?=number_format($total)?></strong>개 파트너<?=$persona ? ' (persona: '.htmlspecialchars($persona).')' : ''?></div>
	</div>

	<?if (empty($partners)):?>
	<div class="empty-state">
		<i class="fas fa-handshake-slash fa-3x mb-3 d-block"></i>
		파트너가 없습니다.
	</div>
	<?else:?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="table-responsive">
			<table class="table table-hover table-bordered mb-0">
				<thead class="table-dark">
					<tr>
						<th class="text-center" style="width:40px;">#</th>
						<th>이름</th>
						<th class="text-center" style="width:120px;">persona</th>
						<th class="text-center" style="width:90px;">useAPI</th>
						<th class="text-center" style="width:100px;">계약 수</th>
						<th class="text-center" style="width:200px;">파트너 ID</th>
						<th class="text-center" style="width:80px;"></th>
					</tr>
				</thead>
				<tbody>
					<?foreach ($partners as $i => $p):
						$pArr      = (array)$p;
						$pid       = $pArr['id']        ?? '';
						$pname     = $pArr['name']      ?? '—';
						$pper      = $pArr['persona']   ?? '';
						$useAPI    = !empty($pArr['useAPI']);
						$contracts = !empty($pArr['contracts']) ? (array)$pArr['contracts'] : array();
						$color     = $persona_colors[$pper] ?? 'secondary';
					?>
					<tr>
						<td class="text-center text-secondary"><?=$i + 1?></td>
						<td class="fw-semibold"><?=htmlspecialchars($pname)?></td>
						<td class="text-center"><span class="badge bg-<?=$color?>"><?=htmlspecialchars($pper ?: '—')?></span></td>
						<td class="text-center">
							<?if ($useAPI):?>
							<span class="badge bg-success">true</span>
							<?else:?>
							<span class="badge bg-secondary">false</span>
							<?endif?>
						</td>
						<td class="text-center"><span class="badge bg-dark border border-secondary"><?=count($contracts)?>개</span></td>
						<td class="text-center uuid"><?=htmlspecialchars($pid)?></td>
						<td class="text-center">
							<a href="partner_view.php?partnerID=<?=urlencode($pid)?>" target="_blank" class="btn btn-sm btn-outline-info">
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

<?pn_foot();?>
