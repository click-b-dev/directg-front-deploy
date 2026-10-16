<?php
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
    include "cfg/site_conf_inc.php";
    include "utils/Crypto.php";

    header("Content-type: text/html; charset=utf-8");

    $res_cd          = $_POST["res_cd"]          ?? "";
    $res_msg         = $_POST["res_msg"]         ?? "";
    $cb_reg_cert_key = $_POST["reg_cert_key"]    ?? ""; // 본인확인 완료 후 KCP 콜백으로 내려오는 거래등록키

    // TODO: 가맹점에서는 세션이 아닌 DB에 저장된 거래등록키(reg_cert_key)와 주문번호(ordr_idxx)를 확인하여
    //       /return 콜백으로 내려온 reg_cert_key 값을 통해 일치하는지 검증 후 본인확인 결과에 따른 처리 진행 권장
    $sess_reg_cert_key = $_SESSION["reg_cert_key"] ?? "";
    if ($cb_reg_cert_key !== $sess_reg_cert_key) {
        unset($_SESSION["reg_cert_key"]);
        unset($_SESSION["ordr_idxx"]);
        $errMsg   = "거래등록키 불일치: 유효하지 않은 요청입니다.";
        $indexUrl = "index.php?error=" . urlencode($errMsg);
        echo "<!DOCTYPE html><html><body><script>";
        echo "if(window.opener){window.opener.location.href=\"$indexUrl\";window.close();}";
        echo "else{location.href=\"$indexUrl\";}";
        echo "</script></body></html>";
        exit;
    }

    $indexUrl  = "index.php";
    $resultUrl = "result.php";

    if ($res_cd !== "0000") {
        unset($_SESSION["reg_cert_key"]);
        unset($_SESSION["ordr_idxx"]);
        $msg      = "본인확인에 실패하였습니다.\n코드: " . $res_cd . "\n메시지: " . $res_msg;
        $errorUrl = $indexUrl . "?error=" . urlencode($msg);
?>
<!DOCTYPE html><html><body><script>
    if(window.opener) {
        window.opener.location.href = "<?= $errorUrl ?>";
        window.close();
    } else {
        location.href = "<?= $errorUrl ?>";
    }
</script></body></html>
<?php
        exit;
    }

    $reg_cert_key = $_SESSION["reg_cert_key"] ?? "";
    $ordr_idxx    = $_SESSION["ordr_idxx"]    ?? "";

    // TODO: 가맹점 DB에 저장된 거래등록키(reg_cert_key)와 주문번호(ordr_idxx)를 확인하여
    //       /return 콜백으로 내려온 reg_cert_key 값을 통해 일치하는지 검증 후 결과조회 API 호출

    // 본인확인 결과 조회 API 호출
    $headers = [
        "Content-Type: application/json",
        "site_cd: $g_conf_site_cd"
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

    $query_result = json_decode($resData, true);

    $query_res_cd = $query_result["res_cd"] ?? "";

    unset($_SESSION["reg_cert_key"]);
    unset($_SESSION["ordr_idxx"]);

    if ($query_res_cd !== "0000") {
        $query_res_msg = $query_result["res_msg"] ?? "";
        $msg      = "결과조회에 실패하였습니다.\n코드: " . $query_res_cd . "\n메시지: " . $query_res_msg;
        $errorUrl = $indexUrl . "?error=" . urlencode($msg);
?>
<!DOCTYPE html><html><body><script>
    if(window.opener) {
        window.opener.location.href = "<?= $errorUrl ?>";
        window.close();
    } else {
        location.href = "<?= $errorUrl ?>";
    }
</script></body></html>
<?php
        exit;
    }

    $enc_cert_data = $query_result["enc_cert_data"] ?? "";
    $rv            = $query_result["rv"]            ?? "";

    // 복호화 응답 결과에 대한 상세한 값은 연동 가이드를 참고하시기 바랍니다.
    $cert_data_json = Crypto::decryptJson($enc_cert_data, $rv, $g_conf_ENC_KEY, $g_conf_site_cd);
    $cert_data = json_decode($cert_data_json, true);
    // $CI = $cert_data["CI"] ?? "";
    // $DI = $cert_data["DI"] ?? "";
?>
<!DOCTYPE html><html><body><script>
    if(window.opener) {
        window.opener.location.href = "<?= $resultUrl ?>";
    } else {
        location.href = "<?= $resultUrl ?>";
    }
    window.close();
</script></body></html>
