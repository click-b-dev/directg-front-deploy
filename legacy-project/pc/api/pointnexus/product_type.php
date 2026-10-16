<?
header('Content-Type: text/html; charset=utf-8');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once(__DIR__.'/_layout.php');

$error = '';
$types = array();
$total = 0;
$result = null;

try {
	$nexus  = new PointNexus($mode);
	$result = $nexus->runProductType();
	if (!empty($result->success)) {
		$types = !empty($result->data) ? (array)$result->data : array();
		$total = $result->count ?? count($types);
	} else {
		$error = pn_extract_error($result);
	}
} catch (Exception $e) {
	$error = $e->getMessage();
}

//응답 데이터의 모든 키를 동적으로 수집 (스키마가 가변적이므로)
$columns = array();
foreach ($types as $t) {
	foreach ((array)$t as $k => $v) {
		if (!in_array($k, $columns, true)) $columns[] = $k;
	}
}

pn_head('상품 타입 목록', 'GET /productType');

if ($error):
	pn_alert_error($error);
else:
?>

<div class="d-flex align-items-center justify-content-between mb-3">
	<div class="text-secondary">전체 <strong class="text-white"><?=number_format($total)?></strong>개</div>
</div>

<?if (empty($types)):?>
<div class="empty-state">
	<i class="fas fa-inbox fa-3x mb-3 d-block"></i>
	표시할 상품 타입이 없습니다.
</div>
<?else:?>
<div class="card border-0 shadow-sm mb-4">
	<div class="table-responsive">
		<table class="table table-hover table-bordered mb-0">
			<thead class="table-dark">
				<tr>
					<th class="text-center" style="width:40px;">#</th>
					<?foreach ($columns as $col):?>
					<th><?=htmlspecialchars($col)?></th>
					<?endforeach?>
				</tr>
			</thead>
			<tbody>
				<?foreach ($types as $i => $t):
					$arr = (array)$t;
				?>
				<tr>
					<td class="text-center text-secondary"><?=$i + 1?></td>
					<?foreach ($columns as $col):
						$v = $arr[$col] ?? '';
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
</div>
<?endif?>

<?
	pn_json_box($result);
endif;

pn_foot();
?>
