var hcaptchaWidgetID = null;

function onHcaptchaLoad() {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', renderHcaptcha);
	} else {
		renderHcaptcha();
	}
}

function renderHcaptcha() {
	hcaptchaWidgetID = hcaptcha.render('hcaptcha-container', {
		sitekey: "8fb4453a-f8c2-4134-afa4-231c42baf408",
		size: 'invisible',
		callback: function(token){
			if (typeof onCaptchaSuccess === 'function') onCaptchaSuccess(token);
		},
		'open-callback':  function(){ $.LoadingOverlay("hide",true); },
		'close-callback': function(){ $.LoadingOverlay("hide",true); },
		'error-callback': onCaptchaError,
		'expired-callback': onCaptchaExpired
	});
}

function onCaptchaError() {
	$.LoadingOverlay("hide",true);
	alert("캡챠 인증 중 오류가 발생했습니다. 다시 시도해주세요.");
	if (hcaptchaWidgetID !== null) hcaptcha.reset(hcaptchaWidgetID);
}

function onCaptchaExpired() {
	$.LoadingOverlay("hide",true);
	if (hcaptchaWidgetID !== null) hcaptcha.reset(hcaptchaWidgetID);
}

// 캡챠 실행 (오버레이 표시 + execute) — submit에서 이걸 호출
function runCaptcha() {
	$.LoadingOverlay("show");
	hcaptcha.execute(hcaptchaWidgetID);
}