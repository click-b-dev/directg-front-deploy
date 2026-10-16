<?
//Point Nexus 공통 모드 설정 — 모든 페이지에서 $mode 변수로 참조 ('test' | 'prod')
//운영/테스트 전환은 이 한 줄만 변경하면 됨
$mode = 'test';

//Point Nexus 페이지 공통 레이아웃 (헤더/푸터/공통 스타일/유틸 함수)
//각 API별 페이지에서 include하여 사용

function pn_head($title, $endpoint = '', $back_url = 'list.php') {
?>
<!DOCTYPE html>
<html lang="ko" data-bs-theme="dark">
<head>
<meta charset="utf-8">
<title>Point Nexus — <?=htmlspecialchars($title)?></title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
<style>
body { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; background: #1a1a2e; }
.page-header { background: linear-gradient(135deg, #16213e, #0f3460); border-bottom: 1px solid #0f3460; }
.label-col { width: 160px; font-size: 12px; color: #adb5bd; white-space: nowrap; }
.value-col { font-size: 13px; }
.uuid { font-family: monospace; font-size: 11px; color: #adb5bd; word-break: break-all; }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; border-bottom: 1px solid #2a2a4a; padding-bottom: 6px; margin-bottom: 14px; }
.json-box { background: #0d0d20; border: 1px solid #2a2a4a; border-radius: 6px; padding: 14px; font-family: monospace; font-size: 11px; color: #c8d3f5; max-height: 480px; overflow: auto; white-space: pre-wrap; word-break: break-all; }
.empty-state { padding: 60px 0; text-align: center; color: #6c757d; }
.form-control-sm, .form-select-sm { font-size: 12px; background: #0d0d20; border-color: #2a2a4a; color: #e0e0e0; }
.form-control-sm:focus, .form-select-sm:focus { background: #0d0d20; border-color: #0d6efd; color: #e0e0e0; box-shadow: none; }
.field-label { font-size: 11px; color: #6c757d; margin-bottom: 2px; }
.endpoint-path { font-family: monospace; font-size: 12px; color: #adb5bd; }
.method-GET    { background: #0d6efd; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 700; }
.method-POST   { background: #198754; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 700; }
.key-display { font-family: monospace; font-size: 22px; font-weight: 700; color: #f59e0b; background: #2a1a0a; padding: 14px 20px; border-radius: 8px; border: 1px solid #4a3a1a; letter-spacing: 2px; user-select: all; display: inline-block; }
.opid-display { font-family: monospace; font-size: 14px; color: #4ec9b0; background: #0a2a2a; padding: 8px 14px; border-radius: 6px; border: 1px solid #1a4a4a; user-select: all; display: inline-block; }
.country-wrap { font-size: 11px; line-height: 2.2; }
.country-wrap .badge { font-weight: normal; }
.product-id-mono { font-family: monospace; font-size: 12px; color: #adb5bd; word-break: break-all; }
.req-form-card { background: #12122a; border: 1px solid #2a2a4a; }
.promo-price { color: #f59e0b; font-weight: 700; }
.origin-price { text-decoration: line-through; color: #6c757d; font-size: 11px; }
.table th { font-size: 12px; white-space: nowrap; }
.table td { font-size: 13px; vertical-align: middle; }
.dim { color: #6c757d; }
</style>
</head>
<body>
<div class="page-header py-3 px-4 mb-4">
	<div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
		<div>
			<h5 class="mb-0 text-white"><i class="fas fa-plug me-2 text-info"></i>Point Nexus — <?=htmlspecialchars($title)?></h5>
			<?if ($endpoint):?>
			<small class="endpoint-path"><?=htmlspecialchars($endpoint)?></small>
			<?endif?>
		</div>
		<div class="d-flex gap-2">
			<a href="<?=htmlspecialchars($back_url)?>" class="btn btn-sm btn-outline-secondary">
				<i class="fas fa-list me-1"></i>API 목록
			</a>
			<button type="button" class="btn btn-sm btn-outline-secondary" onclick="window.close()">
				<i class="fas fa-xmark me-1"></i>창 닫기
			</button>
		</div>
	</div>
</div>
<div class="container-fluid px-4">
<?
}

function pn_foot() {
?>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>
<?
}

//에러 알림 출력
function pn_alert_error($msg) {
?>
	<div class="alert alert-danger d-flex align-items-center">
		<i class="fas fa-triangle-exclamation me-2"></i>
		<span><?=htmlspecialchars($msg)?></span>
	</div>
<?
}

//성공 알림 출력
function pn_alert_success($msg) {
?>
	<div class="alert alert-success d-flex align-items-center">
		<i class="fas fa-check-circle me-2"></i>
		<span><?=htmlspecialchars($msg)?></span>
	</div>
<?
}

//API 응답에서 에러 메시지 추출
function pn_extract_error($result, $default = 'API 오류가 발생했습니다.') {
	if (!empty($result->errors[0]->message)) return $result->errors[0]->message;
	return $default;
}

//원본 JSON 응답 펼침 박스
function pn_json_box($data, $title = '원본 응답 (JSON)') {
	$pretty = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body py-2">
			<details>
				<summary class="text-secondary" style="cursor:pointer; font-size:12px;">
					<i class="fas fa-code me-1"></i><?=htmlspecialchars($title)?>
				</summary>
				<pre class="json-box mt-2 mb-0"><?=htmlspecialchars($pretty)?></pre>
			</details>
		</div>
	</div>
<?
}

//다국어 객체에서 우선순위에 따라 텍스트 추출
function pn_get_lang($obj, $langs = array('ko-KR', 'en-GB', 'en-US')) {
	if (empty($obj)) return '';
	$arr = (array)$obj;
	foreach ($langs as $lang) {
		if (!empty($arr[$lang])) return $arr[$lang];
	}
	return reset($arr) ?: '';
}

//날짜 정리 (T → 공백, 초 단위까지)
function pn_fmt_date($s, $len = 19) {
	if (empty($s)) return '—';
	return str_replace('T', ' ', substr($s, 0, $len));
}

//금액 포맷 — 0원 단위 통화(KRW/JPY)는 정수 그대로, 그 외(EUR/USD/GBP 등)는 최소단위(×100)이므로 100으로 나눠 소수 2자리
function pn_money($amount, $currency) {
	if ($amount === null || $amount === '') return '';
	$zero_decimal = array('KRW', 'JPY');
	if (in_array($currency, $zero_decimal, true)) {
		return number_format((int)$amount);
	}
	return number_format($amount / 100, 2);
}

//라벨/값 행
function pn_row($label, $value, $is_html = false) {
?>
	<tr>
		<td class="label-col"><?=htmlspecialchars($label)?></td>
		<td class="value-col"><?=$is_html ? $value : htmlspecialchars((string)$value)?></td>
	</tr>
<?
}

//한국·일본 시장 기준 — 표시할 통화/국가 코드 (그 외는 "외 N개"로 축약)
function pn_relevant_currencies() { return array('KRW', 'JPY', 'USD'); }
function pn_relevant_countries()  { return array('KR', 'JP', 'WW', 'ROW'); }

function pn_is_relevant_currency($code) {
	return in_array($code, pn_relevant_currencies(), true);
}
function pn_is_relevant_country($code) {
	return in_array($code, pn_relevant_countries(), true);
}

//통화 배열을 [노출 항목, 숨김 개수]로 분리
function pn_filter_currencies($currencies) {
	$shown = array(); $hidden = 0;
	foreach ((array)$currencies as $c) {
		if (pn_is_relevant_currency($c)) {
			if (!in_array($c, $shown, true)) $shown[] = $c;
		} else { $hidden++; }
	}
	return array('shown'=>$shown, 'hidden'=>$hidden);
}

//국가 배열을 [노출 항목, 숨김 개수]로 분리
function pn_filter_countries($countries) {
	$shown = array(); $hidden = 0;
	foreach ((array)$countries as $c) {
		if (pn_is_relevant_country($c)) {
			if (!in_array($c, $shown, true)) $shown[] = $c;
		} else { $hidden++; }
	}
	return array('shown'=>$shown, 'hidden'=>$hidden);
}
?>
