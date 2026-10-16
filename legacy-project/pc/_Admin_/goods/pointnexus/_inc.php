<?
//PointNexus 관리자 페이지 공통 유틸 함수

//PointNexus 운영 전환 완료 — 어드민 환경은 항상 PointNexus 클래스의 DEFAULT_MODE를 따름(환경 선택 불가).
function pn_default_mode(){ return PointNexus::DEFAULT_MODE; }
//입력값(GET/POST) 무시 — 항상 클래스 기본값 반환. 셀렉트 제거로 환경 전환 불가.
function pn_normalize_mode($mode){
	return pn_default_mode();
}

//API 응답에서 에러 메시지 추출
function pn_extract_error($result, $default = 'API 오류가 발생했습니다.') {
	if (!empty($result->errors[0]->message)) return $result->errors[0]->message;
	return $default;
}

//다국어 객체에서 우선순위에 따라 텍스트 추출
function pn_get_lang($obj, $langs = array('ko-KR', 'en-GB', 'en-US', 'ja-JP', 'zh-CN', 'zh-TW')) {
	if (empty($obj)) return '';
	$arr = (array)$obj;
	foreach ($langs as $lang) {
		if (!empty($arr[$lang]) && is_string($arr[$lang]) && trim(strip_tags($arr[$lang])) !== '') {
			return $arr[$lang];
		}
	}
	foreach ($arr as $text) {
		if (is_string($text) && trim(strip_tags($text)) !== '') return $text;
	}
	return '';
}

//날짜 포맷 (T → 공백, 초 단위까지)
function pn_fmt_date($s, $len = 19) {
	if (empty($s)) return '—';
	return str_replace('T', ' ', substr($s, 0, $len));
}

//가격 포맷 — 통화 기호를 금액 앞으로 이동하고 한 칸 띄움 ("58,000₩" → "₩ 58,000")
function pn_fmt_price($formatted, $symbol = null) {
	if ($formatted === null || $formatted === '') return '';
	$s = trim($formatted);
	//끝에 통화 기호가 있는 경우 분리
	if (preg_match('/^([0-9][0-9,\.]*)\s*(.+)$/u', $s, $m)) {
		$amount = $m[1];
		$sym    = trim($m[2]);
		if ($sym !== '') return $sym . ' ' . $amount;
	}
	//앞에 이미 기호가 있는 경우 그대로
	if (preg_match('/^(\D+?)\s*([0-9][0-9,\.]*)$/u', $s, $m)) {
		return trim($m[1]) . ' ' . $m[2];
	}
	if ($symbol) return $symbol . ' ' . $s;
	return $s;
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

function pn_filter_currencies($currencies) {
	$shown = array(); $hidden = 0;
	foreach ((array)$currencies as $c) {
		if (pn_is_relevant_currency($c)) {
			if (!in_array($c, $shown, true)) $shown[] = $c;
		} else { $hidden++; }
	}
	return array('shown'=>$shown, 'hidden'=>$hidden);
}

function pn_filter_countries($countries) {
	$shown = array(); $hidden = 0;
	foreach ((array)$countries as $c) {
		if (pn_is_relevant_country($c)) {
			if (!in_array($c, $shown, true)) $shown[] = $c;
		} else { $hidden++; }
	}
	return array('shown'=>$shown, 'hidden'=>$hidden);
}

//환경 표시 — 운영 전환으로 선택 제거. 클래스 설정값을 읽기전용 뱃지로 표시하고, 폼/JS 호환용 id=mode hidden input 유지.
function pn_mode_select($mode, $auto_submit = true) {
	$m     = pn_default_mode();
	$label = ($m === 'prod') ? 'Production(prod)' : 'Sandbox(test)';
	$cls   = ($m === 'prod') ? 'bg-success' : 'bg-warning text-dark';
?>
	<span class="badge <?=$cls?> py-1 px-2"><?=htmlspecialchars($label)?></span>
	<input type="hidden" id="mode" name="mode" value="<?=htmlspecialchars($m)?>">
<?
}

//페이지 번호 기반 페이지네이션 HTML 생성 (전체 페이지 수가 명확할 때)
//$page: 현재 페이지(1부터), $total_pages: 전체 페이지 수, $base_params: GET 파라미터(page 키는 자동 치환)
function pn_pagination_html($page, $total_pages, $base_params, $window = 5) {
	if ($total_pages <= 1) return '';
	$page         = max(1, (int)$page);
	$total_pages  = max(1, (int)$total_pages);
	$start        = max(1, $page - $window);
	$end          = min($total_pages, $page + $window);

	$mk = function($p, $label = null, $disabled = false, $active = false) use ($base_params) {
		$lbl = $label === null ? $p : $label;
		if ($disabled) {
			return '<li class="page-item disabled"><span class="page-link">'.$lbl.'</span></li>';
		}
		$qs = http_build_query(array_merge($base_params, array('page' => $p)));
		$cls = $active ? ' active' : '';
		return '<li class="page-item'.$cls.'"><a class="page-link" href="?'.$qs.'">'.$lbl.'</a></li>';
	};

	$html  = '<nav><ul class="pagination pagination-sm mb-0">';
	$html .= $mk(1, '«', $page<=1);
	$html .= $mk(max(1,$page-1), '‹', $page<=1);
	if ($start > 1) {
		$html .= $mk(1, '1');
		if ($start > 2) $html .= '<li class="page-item disabled"><span class="page-link">…</span></li>';
	}
	for ($i=$start; $i<=$end; $i++) {
		$html .= $mk($i, null, false, $i==$page);
	}
	if ($end < $total_pages) {
		if ($end < $total_pages-1) $html .= '<li class="page-item disabled"><span class="page-link">…</span></li>';
		$html .= $mk($total_pages, $total_pages);
	}
	$html .= $mk(min($total_pages,$page+1), '›', $page>=$total_pages);
	$html .= $mk($total_pages, '»', $page>=$total_pages);
	$html .= '</ul></nav>';
	return $html;
}

//커서형 페이지네이션 — 전체 건수가 없는 API 용. 현재 응답이 limit 만큼 차있으면 다음 페이지 있다고 가정
//$has_more: 다음 페이지 존재 여부, $base_params: GET 파라미터
function pn_pagination_cursor($page, $has_more, $base_params, $window_back = 4, $window_fwd = 5) {
	$page = max(1, (int)$page);
	if ($page <= 1 && !$has_more) return '';

	$mk = function($p, $label = null, $disabled = false, $active = false) use ($base_params) {
		$lbl = $label === null ? $p : $label;
		if ($disabled) {
			return '<li class="page-item disabled"><span class="page-link">'.$lbl.'</span></li>';
		}
		$qs = http_build_query(array_merge($base_params, array('page' => $p)));
		$cls = $active ? ' active' : '';
		return '<li class="page-item'.$cls.'"><a class="page-link" href="?'.$qs.'">'.$lbl.'</a></li>';
	};

	$start = max(1, $page - $window_back);
	$end   = $has_more ? $page + $window_fwd : $page;

	$html  = '<nav><ul class="pagination pagination-sm mb-0">';
	$html .= $mk(1, '«', $page<=1);
	$html .= $mk(max(1,$page-1), '‹ 이전', $page<=1);
	if ($start > 1) {
		$html .= $mk(1, '1');
		if ($start > 2) $html .= '<li class="page-item disabled"><span class="page-link">…</span></li>';
	}
	for ($i=$start; $i<=$end; $i++) {
		$html .= $mk($i, null, false, $i==$page);
	}
	$html .= $mk($page+1, '다음 ›', !$has_more);
	$html .= '</ul></nav>';
	return $html;
}

//원본 JSON 응답 펼침 박스
function pn_json_box($data, $title = '원본 응답 (JSON)') {
	$pretty = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
	<div class="card mb-3">
		<div class="card-body py-2">
			<details>
				<summary class="text-muted" style="cursor:pointer; font-size:12px;">
					<i class="mdi mdi-code-tags"></i> <?=htmlspecialchars($title)?>
				</summary>
				<pre class="bg-light p-2 mt-2 mb-0" style="max-height:480px; overflow:auto; font-size:11px;"><?=htmlspecialchars($pretty)?></pre>
			</details>
		</div>
	</div>
<?
}
?>
