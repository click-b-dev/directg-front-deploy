<?php
	ini_set('display_errors', '1');
    header("Content-type: text/html; charset=utf-8");
	$result = json_encode($_REQUEST);
	error_log("\r\n[".date('Y.m.d H:i:s')."] Request ".$result."\n", 3, "./test");

	/* 
    ==========================================================================
         결제 API URL                                                                 
    --------------------------------------------------------------------------
    */
    $target_URL = "https://stg-spl.kcp.co.kr/gw/enc/v1/payment"; // 개발서버
    //$target_URL = "https://spl.kcp.co.kr/gw/enc/v1/payment"; // 운영서버
    /* 
    ==========================================================================
         요청정보                                                                
    --------------------------------------------------------------------------
    */
    $tran_cd            = $_POST[ "tran_cd"  ]; // 요청코드
    $site_cd            = $_POST[ "site_cd"  ]; // 사이트코드
    // 인증서 정보(직렬화)
    $kcp_cert_info      = "-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----";

//25-03-25(화) 10:25 [이종석] 실 사용 인증서
//	$kcp_cert_info="-----BEGIN CERTIFICATE-----MIIDjDCCAnSgAwIBAgIHBzHBn2r56zANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yNTAzMjUwMTE0MTVaFw0zMDAzMjQwMTE0MTVaMHsxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTEWMBQGA1UECgwNTkhOIEtDUCBDb3JwLjEXMBUGA1UECwwOUEdXRUJERVYgVGVhbS4xGTAXBgNVBAMMEDIwMjUwMzI0MTAwMDk4NDEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCGYNalbqgw6zeHhprhTZsv8Kcb37JVa4rUi0z4O4oD/5b20hIx86OPn9QYj40XOOarE29EKpjBt4uwBSKG4ohi8pBNE070UY6Qlm4NtpOEEZy9ZJDDRIeYDbrGnOmX3ea4nLGN+uDKVrhDZUwmAJwMbk9p4s/hK0dJeVUmT3Rq3ah8YeUOLbJwdqK+j3noVU8yt8uttzL9e4E7YBylKsplogC9wbcv3btmETHRiqLBNYFamCLSoIBmu23djkN6URO2kT8iyrOhUmQI5+FG8mzt7HcBUf5WjIY8P9W04PkuJps2lv4F3BYDExCxPlKPGrlijgC3fdsO9AikZFBEPr5XAgMBAAGjHTAbMA4GA1UdDwEB/wQEAwIHgDAJBgNVHRMEAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQBCNPKrQF2xipJTPBCHnbJKPJqns4+1YgCsOJ0zTXLtV8hUeA5Wja/Stv2W5B5vXQBfvlD9fKT09c45lXgUarsVvrVAHN6f6Uu/rvrYgVwYw5qd/axeShx5J4oxw+FLQktwszzQ5eR0nIinR67Kb6/wEWcE75P7hOvBlhfQ6TMDuU2xoh4d8dTGbIxI0IYhx4NrTKdzuVnXe7EUe1B5HzSAGQPSe/xfN/nmWdLT4uIqGp8iofJ31XXRacuNo+NxRYfujpfvZNdR1UF+xYXZv1C1ShCi5m+qjFhVNknCaa7luPhElobOdBVCldZtvI4kZocYnazGIp93e7PtLyQqn3EY-----END CERTIFICATE-----";

    $enc_data           = $_POST[ "enc_data" ]; // 암호화 인증데이터
    $enc_info           = $_POST[ "enc_info" ]; // 암호화 인증데이터  
    /* = -------------------------------------------------------------------------- = */
    
    $data = array(
              "tran_cd"        => $tran_cd, 
              "site_cd"        => $site_cd,
              "kcp_cert_info"  => $kcp_cert_info,
              "enc_data"       => $enc_data,
              "enc_info"       => $enc_info,
              "ordr_mony"      => "1004", // 실제 결제될 금액이 1004원이라면   ** 결제금액 유효성 검증 **
			  "pay_type"       => "PACA" // 실제 결제할 수단이 신용카드라면 PACA로 세팅 ** 결제수단 유효성 검증 **
			  
			  // "ordr_no"        => "TEST1234567890", // 실제 처리할 주문번호가 TEST1234567890라면 ** 주문번호검증 **
			  /* ordr_no의 경우 결제창으로 전달하는 주문번호와
				 실제 승인요청때 처리하는 주문번호가 동일해야하는 경우 검증처리바랍니다.
				 다를경우 주문번호 검증은 하지 않으시기 바랍니다. */
            );
    
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
	curl_setopt($ch, CURLOPT_SSLVERSION, '6');
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

	
    // API RES
    $res_data  = curl_exec($ch); 
     
    
    // RES JSON DATA Parsing
    $json_res = json_decode($res_data, true);
    
	

?>
<!DOCTYPE html>
<html>
<head>
    <title>*** NHN KCP API SAMPLE ***</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=yes, target-densitydpi=medium-dpi">
    <link href="static/css/style.css" rel="stylesheet" type="text/css"/>
</head>
<body oncontextmenu="return false;">
    <div class="wrap">
        <!-- header -->
        <div class="header">
            <a href="index.html" class="btn-back"><span>뒤로가기</span></a>
            <h1 class="title">TEST SAMPLE</h1>
        </div>
        <!-- //header -->
        <!-- contents -->
        <div id="skipCont" class="contents">
            <h2 class="title-type-3">요청  DATA</h2>
            <ul class="list-type-1">
                <li>
                    <div class="left">
                        <p class="title"></p>
                    </div>
                    <div class="right">
                        <div class="ipt-type-1 pc-wd-3">
                            <textarea style="height:200px; width:450px" readonly><?=$req_data ?></textarea>
                        </div>
                    </div>
                </li>
            </ul>
            <h2 class="title-type-3">응답  DATA </h2>
            <ul class="list-type-1">
                <li>
                    <div class="left">
                        <p class="title"></p>
                    </div>
                    <div class="right">
                        <div class="ipt-type-1 pc-wd-3">
                            <textarea style="height:200px; width:450px" readonly><?=$res_data ?></textarea>
                        </div>
                    </div>
                </li>
            </ul>       
            <ul class="list-btn-2">
                <li class="pc-only-show"><a href="index.html" class="btn-type-3 pc-wd-2">처음으로</a></li>
            </ul>
        </div>
        <div class="grid-footer">
            <div class="inner">
                <!-- footer -->
                <div class="footer">
                                     ⓒ NHN KCP Corp.
                </div>
                <!-- //footer -->
            </div>
        </div>
    </div>
    <!--//wrap-->
</body>
</html>