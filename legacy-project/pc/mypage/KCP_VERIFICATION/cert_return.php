<?php
/* ============================================================================== */
/* =   KCP 본인확인 - Ret_URL 콜백 (인증 완료 후 KCP 가 호출)                      = */
/* = -------------------------------------------------------------------------- = */
/* =   1) reg_cert_key 세션 검증                                                  = */
/* =   2) 결과조회 API 호출 → enc_cert_data 복호화                                = */
/* =   3) 중복 실명인증 체크 후 회원 본인인증 정보 갱신(updateMemberDupinfo)       = */
/* =   4) 팝업 종료 및 부모창 reload                                              = */
/* ============================================================================== */
    ini_set("display_errors", 0);

    include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
    include_once($_SERVER['DOCUMENT_ROOT'].'/../conf/kcp_cert_conf.php');  // 공통 설정 (PC/모바일 공용)
    // Crypto 는 src/classes/Crypto.php 오토로드 (별도 include 불필요)

    header("Content-Type: text/html; charset=utf-8");

    include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
    require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
    Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcpcert.xml');
    $logger = Logger::getLogger("response");

    $account_url = "/mypage/account_settings.html";

    /* 팝업 닫기 + (성공 시) 부모창 reload */
    function close_popup($msg, $url, $reload = false) {
        $jmsg = json_encode($msg, JSON_UNESCAPED_UNICODE);
        $jurl = json_encode($url);
        echo "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body><script>";
        echo "var m=" . $jmsg . ";";
        echo "if(window.opener){ if(m) alert(m);";
        echo $reload ? " window.opener.location.reload();" : "";
        echo " window.close(); } else { if(m) alert(m); location.href=" . $jurl . "; }";
        echo "</script></body></html>";
        exit;
    }

    $res_cd          = $_POST["res_cd"]       ?? "";
    $res_msg         = $_POST["res_msg"]      ?? "";
    $cb_reg_cert_key = $_POST["reg_cert_key"] ?? "";

    $logger->info(["return_post" => $_POST]);

    $sess         = $_SESSION['kcp_cert'] ?? [];
    $reg_cert_key = $sess['reg_cert_key'] ?? "";
    $ordr_idxx    = $sess['ordr_idxx']    ?? "";
    $m_no         = $sess['m_no']         ?? "";

    // 1) 거래등록키 검증 (위변조 / 유효하지 않은 요청 차단)
    if ($cb_reg_cert_key === "" || $cb_reg_cert_key !== $reg_cert_key) {
        unset($_SESSION['kcp_cert']);
        close_popup("유효하지 않은 요청입니다.", $account_url);
    }

    // 인증창 결과 코드 확인
    if ($res_cd !== "0000") {
        unset($_SESSION['kcp_cert']);
        close_popup("본인인증에 실패하였습니다.\n[" . $res_cd . "] " . $res_msg, $account_url);
    }

    // 2) 결과조회 API 호출
    $headers = [
        "Content-Type: application/json",
        "site_cd: " . $g_conf_site_cd
    ];
    $body = json_encode([
        "reg_cert_key" => $reg_cert_key,
        "ordr_idxx"    => $ordr_idxx
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $ch = curl_init($g_conf_dec_url);
    curl_setopt($ch, CURLOPT_POST,           true);
    curl_setopt($ch, CURLOPT_HTTPHEADER,     $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS,     $body);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $resData = curl_exec($ch);
    curl_close($ch);

    $query        = json_decode($resData, true);
    $query_res_cd = $query["res_cd"] ?? "";

    unset($_SESSION['kcp_cert']); // 1회용 - 결과조회 후 즉시 폐기

    if ($query_res_cd !== "0000") {
        close_popup("결과조회에 실패하였습니다.\n[" . $query_res_cd . "] " . ($query["res_msg"] ?? ""), $account_url);
    }

    // 3) 인증정보 복호화
    $enc_cert_data = $query["enc_cert_data"] ?? "";
    $rv            = $query["rv"]            ?? "";

    $cert_json = Crypto::decryptJson($enc_cert_data, $rv, $g_conf_ENC_KEY, $g_conf_site_cd);
    $cert      = json_decode($cert_json, true);
    $logger->info(["cert_data" => $cert]);

    $di        = $cert["DI"]        ?? "";   // 중복가입 확인값(DI) → tbl_member.dupinfo
    $ci        = $cert["CI"]        ?? "";   // 연계정보(CI) → tbl_member.ci
    $user_name = $cert["user_name"] ?? "";
    $birth_day = $cert["birth_day"] ?? "";
    $phone_no  = $cert["phone_no"]  ?? "";
    $sex_code  = $cert["sex_code"]  ?? "";

    if ($di === "" || $user_name === "") {
        $logger->error(["msg" => "필수 인증정보 누락", "cert" => $cert]);
        close_popup("본인인증 정보를 가져오지 못했습니다.", $account_url);
    }

    // 4) 회원 본인인증 처리 (기존 ct_cli 방식과 동일한 DB 로직)
    try {
        $conn = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $member = new Member($conn);

        $join_chk = $member->getMemberDupinfo($birth_day, $user_name, $di);
        if ($join_chk[0] > 2) {
            close_popup("이미 실명인증된 아이디가 있습니다.", $account_url);
        }

        $member->updateMemberDupinfo($m_no, $user_name, $birth_day, $phone_no, $di, $sex_code, $ci);
    } catch (PDOException $e) {
        $logger->error($e->getMessage());
        close_popup("처리 중 오류가 발생했습니다.", $account_url);
    }

    close_popup("본인인증에 성공하였습니다.", $account_url, true);
?>
