<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$partnerID = trim($_REQUEST['partnerID'] ?? '');

$executed = ($partnerID !== '');
$error    = '';
$partner  = null;
$result   = null;

if ($executed) {
	try {
		$nexus  = new PointNexus($mode);
		$result = $nexus->runPartnerRetrieve($partnerID);
		if (!empty($result->success)) {
			$partner = !empty($result->data) ? (is_array($result->data) ? $result->data[0] : $result->data) : null;
		} else {
			$error = pn_extract_error($result);
		}
	} catch (Exception $e) {
		$error = $e->getMessage();
	}
}

$persona_colors = array(
	'publisher'=>'primary','manufacturer'=>'success','distributor'=>'info',
	'store'=>'warning','influencer'=>'danger','platform'=>'secondary','trader'=>'dark'
);

pn_head('파트너 상세', 'GET /partner/{partnerID}');
?>

<!-- 입력 폼 -->
<div class="card req-form-card mb-4">
	<div class="card-body">
		<form method="get" action="partner_view.php" class="row g-2 align-items-end">
			<div class="col-md-10">
				<div class="field-label">partnerID (필수)</div>
				<input type="text" name="partnerID" class="form-control form-control-sm" value="<?=htmlspecialchars($partnerID)?>" required>
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
<?elseif ($partner):?>

	<?
	$pArr      = (array)$partner;
	$pid       = $pArr['id']         ?? $partnerID;
	$pname     = $pArr['name']       ?? '—';
	$pper      = $pArr['persona']    ?? '—';
	$useAPI    = !empty($pArr['useAPI']);
	$contracts = !empty($pArr['contracts']) ? (array)$pArr['contracts'] : array();
	$color     = $persona_colors[$pper] ?? 'secondary';
	?>

	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">기본 정보</div>
			<table class="table table-sm table-borderless mb-0">
				<tbody>
					<?pn_row('이름', $pname)?>
					<tr>
						<td class="label-col">persona</td>
						<td class="value-col"><span class="badge bg-<?=$color?>"><?=htmlspecialchars($pper)?></span></td>
					</tr>
					<tr>
						<td class="label-col">useAPI</td>
						<td class="value-col">
							<?if ($useAPI):?>
							<span class="badge bg-success">true</span>
							<?else:?>
							<span class="badge bg-secondary">false</span>
							<?endif?>
						</td>
					</tr>
					<tr><td class="label-col">파트너 ID</td><td class="value-col uuid"><?=htmlspecialchars($pid)?></td></tr>
				</tbody>
			</table>
		</div>
	</div>

	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="section-title">계약 (contracts) — <?=count($contracts)?>건</div>
			<?if (empty($contracts)):?>
			<p class="text-secondary mb-0">계약 정보 없음</p>
			<?else:?>
			<?
			//계약 객체의 필드를 동적으로 수집
			$contractKeys = array();
			foreach ($contracts as $ct) {
				foreach ((array)$ct as $k => $v) {
					if (!in_array($k, $contractKeys, true)) $contractKeys[] = $k;
				}
			}
			?>
			<div class="table-responsive">
				<table class="table table-sm table-bordered mb-0">
					<thead class="table-dark">
						<tr>
							<th class="text-center" style="width:40px;">#</th>
							<?foreach ($contractKeys as $k):?>
							<th><?=htmlspecialchars($k)?></th>
							<?endforeach?>
						</tr>
					</thead>
					<tbody>
						<?foreach ($contracts as $i => $ct):
							$ctArr = (array)$ct;
						?>
						<tr>
							<td class="text-center text-secondary"><?=$i + 1?></td>
							<?foreach ($contractKeys as $k):
								$v = $ctArr[$k] ?? '';
							?>
							<td>
								<?if (is_array($v) || is_object($v)):?>
								<code style="font-size:11px;"><?=htmlspecialchars(json_encode($v, JSON_UNESCAPED_UNICODE))?></code>
								<?elseif (is_bool($v)):?>
								<span class="badge bg-<?=$v?'success':'secondary'?>"><?=$v?'true':'false'?></span>
								<?elseif (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-/', (string)$v)):?>
								<span class="uuid"><?=htmlspecialchars($v)?></span>
								<?else:?>
								<?=htmlspecialchars((string)$v)?>
								<?endif?>
							</td>
							<?endforeach?>
						</tr>
						<?endforeach?>
					</tbody>
				</table>
			</div>
			<?endif?>
		</div>
	</div>

<?endif?>

<?pn_json_box($result)?>

<?endif?>

<?pn_foot();?>
