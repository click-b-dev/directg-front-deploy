<?php
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
    include "cfg/site_conf_inc.php";
    include "utils/Crypto.php";

    // 본 샘플은 reg_cert_key, ordr_idxx 전달에 세션을 사용하지만,
    // 실제 운영 환경에서는 세션 대신 DB 또는 별도 저장소 사용을 권장합니다.

    $verified     = isset($verified) ? $verified : false;
    $call_url     = "";
    $reg_cert_key = "";

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        // KCP 콜백(return.php)이 크로스사이트 POST로 들어올 때 세션 쿠키가 전송되도록 SameSite=None 설정
        $sessionCookie = "PHPSESSID=" . session_id() . "; Path=/; Secure; SameSite=None";
        header("Set-Cookie: $sessionCookie");

        // 본인확인 거래등록 API 호출
        $ordr_idxx = $_POST["ordr_idxx"] ?? "";

        $req_data = [
            "site_cd"     => $g_conf_site_cd,
            "ordr_idxx"   => $ordr_idxx,
            "Ret_URL"     => $g_conf_Ret_URL,
            "web_siteid"  => "",
            "param_opt_1" => "",
            "param_opt_2" => "",
            "param_opt_3" => ""
        ];

        $req_json_str = json_encode($req_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $encResult    = Crypto::encryptJson($req_json_str, $g_conf_ENC_KEY, $g_conf_site_cd);
        $enc_data     = $encResult["encData"];
        $rv           = $encResult["rv"];

        $res_cd  = "";
        $res_msg = "";

        $headers = [
            "Content-Type: application/json",
            "site_cd: $g_conf_site_cd",
            "rv: $rv"
        ];

        $ch = curl_init($g_conf_cert_url);
        curl_setopt($ch, CURLOPT_POST,          true);
        curl_setopt($ch, CURLOPT_HTTPHEADER,    $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS,    $enc_data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $resData = curl_exec($ch);
        curl_close($ch);

        $reg_result = json_decode($resData, true);

        $call_url     = $reg_result["call_url"]     ?? "";
        $reg_cert_key = $reg_result["reg_cert_key"] ?? "";
        $res_cd       = $reg_result["res_cd"]       ?? "";
        $res_msg      = $reg_result["res_msg"]       ?? "";

        if ($res_cd !== "0000") {
            $error = "거래등록에 실패하였습니다.\n코드: {$res_cd}\n메시지: {$res_msg}";
        } else {
            $_SESSION["reg_cert_key"] = $reg_cert_key;
            $_SESSION["ordr_idxx"]    = $ordr_idxx;
        }
    }

    if (!isset($error)) $error = $_GET["error"] ?? "";
?>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>회원가입</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <style>
    body { background-color: #f4f6f9; min-height: 100vh; }
    .navbar-brand { font-weight: 700; }
    .card { border: none; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .card-header { border-radius: 12px 12px 0 0 !important; font-weight: 600; }
  </style>
</head>
<body>

  <nav class="navbar navbar-dark bg-primary shadow-sm">
    <div class="container">
      <a class="navbar-brand" href="index.php">NHN KCP 본인확인 V2 SAMPLE</a>
    </div>
  </nav>

  <main class="container my-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-7 col-lg-5">

        <div class="card">
          <div class="card-header bg-primary text-white text-center py-4">
            <h1 class="h4 mb-0 fw-bold text-white">회원가입 예제 페이지</h1>
          </div>

          <div class="card-body p-4">

            <div class="mb-3">
              <label class="form-label fw-semibold">아이디</label>
              <input type="text" class="form-control" placeholder="아이디를 입력하세요">
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">비밀번호</label>
              <input type="password" class="form-control" placeholder="비밀번호를 입력하세요">
            </div>

            <hr class="my-4">

            <p class="fw-semibold mb-2">본인확인 <span class="text-danger">*</span></p>
            <p class="text-muted small mb-3">회원가입을 위해 휴대폰 본인확인이 필요합니다.</p>

            <?php if ($verified): ?>
            <div class="alert alert-success d-flex align-items-center mb-3">
              <i class="bi bi-patch-check-fill me-2"></i>본인확인이 완료되었습니다.
            </div>
            <div class="d-grid gap-2">
              <button type="button" class="btn btn-primary fw-semibold">
                <i class="bi bi-person-plus me-2"></i>가입하기
              </button>
              <a href="index.php" class="btn btn-outline-secondary fw-semibold">
                <i class="bi bi-arrow-counterclockwise me-2"></i>다시하기
              </a>
            </div>
            <?php else: ?>
            <form name="reg_info" action="index.php" method="POST">
              <input type="hidden" name="ordr_idxx" value="">
              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-outline-primary fw-semibold"
                  id="startBtn"
                  onclick="init_orderid(); handleStart(this);"
                >
                  <i class="bi bi-shield-check me-2"></i>본인확인하기
                </button>
              </div>
            </form>
            <?php endif; ?>

            <?php if (!empty($call_url) && !empty($reg_cert_key)): ?>
            <form name="form_auth" method="post" style="display:none;">
              <input type="hidden" name="call_url"           value="<?= htmlspecialchars($call_url) ?>">
              <input type="hidden" name="reg_cert_key"       value="<?= htmlspecialchars($reg_cert_key) ?>">
              <input type="hidden" name="kcp_page_submit_yn" value="N">
            </form>
            <?php endif; ?>

          </div>
        </div>

      </div>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc4s9bIOgUxi8T/jzmB1Q0b2HQYbZkGMnqoKbpzDm0o" crossorigin="anonymous"></script>
  <script>
    <?php if (!empty($error)): ?>
    alert(<?= json_encode($error, JSON_UNESCAPED_UNICODE) ?>);
    <?php endif; ?>
    function init_orderid() {
      var today = new Date();
      var year  = today.getFullYear();
      var month = today.getMonth() + 1;
      var date  = today.getDate();
      var time  = today.getTime();

      if (parseInt(month) < 10) month = "0" + month;

      document.reg_info.ordr_idxx.value = year + "" + month + "" + date + "" + time;
    }

    function handleStart(btn) {
      setTimeout(function () {
        btn.disabled = true;
        btn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>'
          + '연결 중...';
      }, 0);
      setTimeout(function () {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-shield-check me-2"></i>본인확인하기';
      }, 5000);
    }

    <?php if (!empty($call_url) && !empty($reg_cert_key)): ?>
    (function () {
      var auth_form = document.form_auth;
      auth_form.action = auth_form.call_url.value;

      if (auth_form.kcp_page_submit_yn.value === "N") {
        var width  = 410;
        var height = 500;
        var left = (screen.width  / 2) - (width  / 2);
        var top  = (screen.height / 2) - (height / 2);
        var opts = "width=" + width + ",height=" + height
                 + ",toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no"
                 + ",left=" + left + ",top=" + top;
        window.open("", "auth_popup", opts);
        auth_form.target = "auth_popup";
      } else {
        auth_form.target = "_self";
      }
      auth_form.submit();
    })();
    <?php endif; ?>
  </script>
</body>
</html>
