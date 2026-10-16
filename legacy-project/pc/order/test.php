<?php
exit;
	header("Content-type: text/html; charset=utf-8");
	
	// KCP API 서버 정보
    $target_URL 	= "https://stg-spl.kcp.co.kr/gw/hub/v1/payment"; 
	    
    // 상점 정보
    $site_cd       	= "T0000";
    $kcp_cert_info  = "-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----";
	
	// 공통 정보
    $pay_method 	= "VCNT";  
    $amount			= "1004"; 
    $currency		= "410"; 
    $cust_ip		= "0.0.0.1";
    
 	// 주문 정보
 	$ordr_idxx		= "TEST1234567890";
 	$good_name		= "테스트상품"; 
 	$buyr_name		= "홍길동"; 
 	$buyr_tel2		= "01012345678"; 
 	$buyr_mail		= "test@test.co.kr"; 
 	    
    // 가상계좌 정보
    $va_txtype		= "41100000";
    $va_mny			= "1004"; 
    $va_bankcode	= "BK23"; 
    $va_name		= "이종석"; 
    $va_date		= "20250915235959";
    $va_receipt_gubn= "";
    $va_taxno		= "";
	
	$data = array(               
              "site_cd" 	   => $site_cd,
              "kcp_cert_info"  => $kcp_cert_info,
              "pay_method"     => $pay_method,
              "amount"         => $amount,
              "currency" 	   => $currency,
              "cust_ip"        => $cust_ip,             
              "ordr_idxx"      => $ordr_idxx,
              "good_name"      => $good_name,
			  "buyr_name"      => $buyr_name,
			  "buyr_tel2"      => $buyr_tel2, 
              "buyr_mail" 	   => $buyr_mail,
              "va_txtype"      => $va_txtype,
			  "va_mny"         => $va_mny,  
              "va_bankcode"    => $va_bankcode,
              "va_name"    	   => $va_name,
			  "va_date"    	   => $va_date,
			  "va_receipt_gubn"=> $va_receipt_gubn,
			  "va_taxno"       => $va_taxno
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
	        응답 데이터 : <textarea class="form-control mb-5"  rows="10" readonly><?=$res_data?></textarea>
        </div>
    </div>
</body>
</html>