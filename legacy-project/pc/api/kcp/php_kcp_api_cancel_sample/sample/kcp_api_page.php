<?php
header("Content-type: text/html; charset=utf-8");
/* ============================================================================== */
/* =   1. Target data 생성														= */
/* = -------------------------------------------------------------------------- = */
/* =   Target data 생성은 NHN KCP PG-API 에 따라 다르니 연동가이드 확인 바랍니다.				= */
/* ============================================================================== */

 $site_cd         = $_POST[ "site_cd"         ]; // 사이트 코드
 $tno             = $_POST[ "tno"             ]; // NHN KCP 거래번호
 $mod_type        = $_POST[ "mod_type"        ]; // 취소 유형

// 결제 취소 (cancel) = site_cd^KCP거래번호^취소유형
$cancel_target_data = $site_cd."^".$tno."^".$mod_type;


/* ============================================================================== */
/* =   2. privatekey 파일 read													= */
/* ============================================================================== */
$key_data = file_get_contents('../certificate/splPrikeyPKCS8.pem');

/* ============================================================================== */
/* =   3. privatekey 추출															= */
/* =   'changeit' 은 테스트용 개인키비밀번호												= */
/* ============================================================================== */
$pri_key = openssl_pkey_get_private($key_data,'changeit');

/* ============================================================================== */
/* =   4. sign data 생성															= */
/* ============================================================================== */
// 결제 취소 signature 생성
openssl_sign($cancel_target_data, $signature, $pri_key, 'sha256WithRSAEncryption');
//echo "cancel_signature :".base64_encode($signature)."<br><br>";

$kcp_sign_data = base64_encode($signature);
?>
<?
    /* ============================================================================== */
    /* =   API URL                                                                  = */
    /* = -------------------------------------------------------------------------- = */	
	
    $target_URL = "https://stg-spl.kcp.co.kr/gw/mod/v1/cancel";  // 개발서버
    //$target_URL = "https://spl.kcp.co.kr/gw/mod/v1/cancel";    // 운영서버
    /* ============================================================================== */
    /* =  요청정보                                                                                                                                                         = */
    /* = -------------------------------------------------------------------------- = */    
    
    // 인증서 정보(직렬화)
    $kcp_cert_info      = "-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----";     
    
    $mod_desc       = $_POST["mod_desc" ]; // 변경 사유
    $mod_mny        = $_POST["mod_mny" ]; // 부분취소 요청금액
    $rem_mny        = $_POST["rem_mny" ]; // 부분취소 전 남은 금액
    


      if( $mod_type == "STSC")
	  {
    
      $data = array(
              "site_cd"        => $site_cd, 
              "kcp_cert_info"  => $kcp_cert_info,
              "kcp_sign_data"  => $kcp_sign_data,
              "mod_type"       => $mod_type,
              "tno"            => $tno,
              "mod_desc"       => $mod_desc		  		  
            );
    
	  }
	  
	  if( $mod_type == "STPC")
	  {
    
      $data = array(
              "site_cd"        => $site_cd, 
              "kcp_cert_info"  => $kcp_cert_info,
              "kcp_sign_data"  => $kcp_sign_data,
              "mod_type"       => $mod_type,
              "tno"            => $tno,
              "mod_desc"       => $mod_desc,
              "mod_mny"        => $mod_mny,		
              "rem_mny"        => $rem_mny		  		  
            );
    
	  }
	
    $req_data = json_encode($data);
    
    $header_data = array( "Content-Type: application/json", "charset=utf-8" );
    
    // API REQ
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $target_URL);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header_data); 
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $req_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    
    // API RES
    $res_data  = curl_exec($ch); 
 
    curl_close($ch);  
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=yes, target-densitydpi=medium-dpi">   
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="form-group border p-3 mt-5">
	        요청 데이터 : <textarea class="form-control mb-5"  rows="10" readonly><?=$req_data?></textarea>
	        응답 데이터 : <textarea class="form-control mb-5"  rows="5" readonly><?=$res_data?></textarea>	       
	        <button class="btn btn-primary d-block mx-auto" onclick ="location.href='cancel.html'">처음으로</button>
        </div>
    </div>
</body>
</html>