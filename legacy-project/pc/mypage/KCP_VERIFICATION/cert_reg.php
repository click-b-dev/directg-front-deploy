<?php
/* ============================================================================== */
/* =   KCP 본인확인 - 거래등록 (AJAX 엔드포인트, JSON 반환)                        = */
/* = -------------------------------------------------------------------------- = */
/* =   /mypage/yjs_account_settings.html 의 [휴대폰본인인증] 클릭 시 AJAX 호출.   = */
/* =   거래등록 API 응답(call_url / reg_cert_key)을 JSON 으로 반환하고,           = */
/* =   reg_cert_key·ordr_idxx·m_no 를 세션에 보관(콜백 검증용).                   = */
/* ============================================================================== */
    ini_set("display_errors", 0);

    include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
    include_once($_SERVER['DOCUMENT_ROOT'].'/../conf/kcp_cert_conf.php');  // 공통 설정 (PC/모바일 공용)
    // Crypto 는 src/classes/Crypto.php 오토로드 (별도 include 불필요)

    header("Content-Type: application/json; charset=utf-8");

    // 로그인 회원만 본인인증 가능 (AJAX 이므로 리다이렉트 대신 JSON 으로 응답)
    $m_no = $_SESSION['member']['m_no'] ?? '';
    if ($m_no === '') {
        echo json_encode(["res_cd" => "9999", "res_msg" => "로그인이 필요합니다."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // KCP 콜백(cert_return.php)이 크로스사이트 POST 로 들어올 때 세션쿠키가 전송되도록 SameSite=None 설정
    header("Set-Cookie: PHPSESSID=" . session_id() . "; Path=/; Secure; SameSite=None");

    // 주문번호(요청번호)는 서버에서 생성 (클라이언트 입력 신뢰 X)
    $ordr_idxx = date("YmdHis") . random_int(100, 999);

    $req_data = [
        "site_cd"     => $g_conf_site_cd,
        "ordr_idxx"   => $ordr_idxx,
        "Ret_URL"     => $g_conf_Ret_URL,
        "web_siteid"  => "",
        "param_opt_1" => (string)$m_no,
        "param_opt_2" => $ip ?? "",
        "param_opt_3" => ""
    ];

    $req_json_str = json_encode($req_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $enc          = Crypto::encryptJson($req_json_str, $g_conf_ENC_KEY, $g_conf_site_cd);

    $headers = [
        "Content-Type: application/json",
        "site_cd: " . $g_conf_site_cd,
        "rv: " . $enc["rv"]
    ];

    $ch = curl_init($g_conf_cert_url);
    curl_setopt($ch, CURLOPT_POST,           true);
    curl_setopt($ch, CURLOPT_HTTPHEADER,     $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS,     $enc["encData"]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resData = curl_exec($ch);
    curl_close($ch);

    $reg          = json_decode($resData, true);
    $res_cd       = $reg["res_cd"]       ?? "";
    $res_msg      = $reg["res_msg"]      ?? "";
    $call_url     = $reg["call_url"]     ?? "";
    $reg_cert_key = $reg["reg_cert_key"] ?? "";

    if ($res_cd === "0000") {
        $_SESSION['kcp_cert'] = [
            "reg_cert_key" => $reg_cert_key,
            "ordr_idxx"    => $ordr_idxx,
            "m_no"         => $m_no
        ];
    }

    echo json_encode([
        "res_cd"       => $res_cd,
        "res_msg"      => $res_msg,
        "call_url"     => $call_url,
        "reg_cert_key" => $reg_cert_key
    ], JSON_UNESCAPED_UNICODE);
?>
