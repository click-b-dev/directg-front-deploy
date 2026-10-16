<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$error = '';
$data  = null;

try {
	$nexus  = new PointNexus($mode);
	$result = $nexus->runTest();
	if (!empty($result->success) && !empty($result->data)) {
		$data = is_array($result->data) ? $result->data[0] : $result->data;
	} else {
		$error = pn_extract_error($result);
	}
} catch (Exception $e) {
	$error = $e->getMessage();
}

pn_head('인증 상태 확인', 'GET /test');

if ($error):
	pn_alert_error($error);
elseif ($data):
	$isSandbox    = !empty($data->isSandbox);
	$provider     = $data->authenticatedProvider ?? null;
	$credentials  = $data->credentials           ?? null;
?>

<div class="row g-4 mb-4">

	<div class="col-md-4">
		<div class="card border-0 shadow-sm h-100">
			<div class="card-body text-center">
				<div class="section-title">환경</div>
				<?if ($isSandbox):?>
				<i class="fas fa-flask text-warning" style="font-size:42px;"></i>
				<h4 class="mt-3 mb-1"><span class="badge bg-warning text-dark">SANDBOX</span></h4>
				<small class="text-secondary">테스트 환경입니다</small>
				<?else:?>
				<i class="fas fa-rocket text-danger" style="font-size:42px;"></i>
				<h4 class="mt-3 mb-1"><span class="badge bg-danger">PRODUCTION</span></h4>
				<small class="text-secondary">운영 환경입니다</small>
				<?endif?>
			</div>
		</div>
	</div>

	<div class="col-md-4">
		<div class="card border-0 shadow-sm h-100">
			<div class="card-body">
				<div class="section-title">인증된 Provider</div>
				<?if ($provider):?>
				<table class="table table-sm table-borderless mb-0">
					<tbody>
						<?pn_row('이름',    $provider->name     ?? '—')?>
						<?pn_row('persona', $provider->persona  ?? '—')?>
						<tr>
							<td class="label-col">ID</td>
							<td class="value-col uuid"><?=htmlspecialchars($provider->id ?? '—')?></td>
						</tr>
					</tbody>
				</table>
				<?else:?>
				<p class="text-secondary mb-0">정보 없음</p>
				<?endif?>
			</div>
		</div>
	</div>

	<div class="col-md-4">
		<div class="card border-0 shadow-sm h-100">
			<div class="card-body">
				<div class="section-title">API 자격증명</div>
				<?if ($credentials):?>
				<table class="table table-sm table-borderless mb-0">
					<tbody>
						<?pn_row('이름', $credentials->name ?? '—')?>
						<tr>
							<td class="label-col">clientID</td>
							<td class="value-col uuid"><?=htmlspecialchars($credentials->clientID ?? '—')?></td>
						</tr>
					</tbody>
				</table>
				<?else:?>
				<p class="text-secondary mb-0">정보 없음</p>
				<?endif?>
			</div>
		</div>
	</div>

</div>

<?pn_alert_success('토큰이 정상적으로 인증되었습니다.')?>

<?
	pn_json_box($result);
endif;

pn_foot();
?>
