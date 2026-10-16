<?php
    header("Content-type: text/html; charset=utf-8");
    /* 
    ==========================================================================
         결제 API URL                                                                 
    --------------------------------------------------------------------------
    */
    $target_URL = "https://customized-api-sandbox.tosspayments.com/gw/enc/v1/payment"; // 개발서버
    //$target_URL = "https://customized-api.tosspayments.com"; // 운영서버
    /* 
    ==========================================================================
         요청정보                                                                
    --------------------------------------------------------------------------
    */
    $tran_cd            = $_POST[ "tran_cd"]; // 요청코드
    $site_cd            = "tvivarepublica"; // 사이트코드
    // 인증서 정보(직렬화)
    $kcp_cert_info      = "-----BEGIN CERTIFICATE-----MIIDuDCCAqCgAwIBAgIUQrWxGrU0jrDah4ctJgutbYxG0REwDQYJKoZIhvcNAQELBQAwgYQxKDAmBgNVBAMMH2N1c3RvbWl6ZWQtYXBpLnRvc3NwYXltZW50cy5jb20xFTATBgNVBAoMDFRvc3NwYXltZW50czEQMA4GA1UECwwHUGF5bWVudDESMBAGA1UEBwwJU2VvY2hvLWd1MQ4wDAYDVQQIDAVTZW91bDELMAkGA1UEBhMCS1IwHhcNMjUwODExMTIxMDU1WhcNMzAwODExMTIxMDU1WjCBhDEoMCYGA1UEAwwfY3VzdG9taXplZC1hcGkudG9zc3BheW1lbnRzLmNvbTEVMBMGA1UECgwMVG9zc3BheW1lbnRzMRAwDgYDVQQLDAdQYXltZW50MRIwEAYDVQQHDAlTZW9jaG8tZ3UxDjAMBgNVBAgMBVNlb3VsMQswCQYDVQQGEwJLUjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMWlpDc1CQPmaym7IbpkYdyuztzyEEmzqobNK/6ObkRrsKPhV9DGm1fEuHZIuZSG72Rsyncw1UHluSkvEhiXCZ+5FwPBrcWZUelWDfK0Z9yaUrvKLj7vnptYR54MR3LB2vEDbP6Q+VQk3XxZ+poA8lqC18V94UJp63GX+ViBkd5UxYFapajVOVf12jo/LHQuE4iLRperWmtT7jp+0Io/dEK3hropkk1jmSFJ5wJVIOhOlNJIRev1hWw/z8sT7yHBaIZz/HXhPcg6g9GyixPAyU+RdnlPQCIQ/zL47Nllm2q4rVms6mi95zCe6DDYkgdl9NJt/nexKPv9qHyj2qKow50CAwEAAaMgMB4wDAYDVR0TAQH/BAIwADAOBgNVHQ8BAf8EBAMCBaAwDQYJKoZIhvcNAQELBQADggEBAJA4fUgtUL4k96AfNzJsoHjvetwRNC07RpBo8DXO/2bJposwHTHR7lNW1QVdB1Lyh2hhbDpbhbH90VDnPBFwff7aM9wEAW5GrMZn4NqhKlhLkpt3hdkMgtY3Fz9lI+/mMXlFOhNhNUOzjraU4R9qZ9eoMjazrOmNCpCmdPgzP8G0g92hUYBEMLqc4w7VzLOIomZ/ePaEEKUsKpzguXrKwuymNhnrtmnRXob6JTdskhbJQj73YKNrowVzf+5w6kgmi9AqyvP+plngcFPu8cYm9Gqd0SDRCefPooK7KCiT8Taiaxg7CJBH8F43/0l89FBw18/i6dP3mTamAs9TDy9wiXE=
-----END CERTIFICATE-----";

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