<?php
	exit;
	ini_set("display_errors", 1);
	header('Content-Type: text/html; charset=utf-8');
	include_once("kcp.class.php");

	$mode="TEST";
	if($mode=="TEST"){
		$site_code="T0000";
		$kcp_cert_info      = "-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----";
	} else {
		$site_code="AKPV0";
		$kcp_cert_info="-----BEGIN CERTIFICATE-----MIIDjDCCAnSgAwIBAgIHBzHBn2r56zANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yNTAzMjUwMTE0MTVaFw0zMDAzMjQwMTE0MTVaMHsxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTEWMBQGA1UECgwNTkhOIEtDUCBDb3JwLjEXMBUGA1UECwwOUEdXRUJERVYgVGVhbS4xGTAXBgNVBAMMEDIwMjUwMzI0MTAwMDk4NDEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCGYNalbqgw6zeHhprhTZsv8Kcb37JVa4rUi0z4O4oD/5b20hIx86OPn9QYj40XOOarE29EKpjBt4uwBSKG4ohi8pBNE070UY6Qlm4NtpOEEZy9ZJDDRIeYDbrGnOmX3ea4nLGN+uDKVrhDZUwmAJwMbk9p4s/hK0dJeVUmT3Rq3ah8YeUOLbJwdqK+j3noVU8yt8uttzL9e4E7YBylKsplogC9wbcv3btmETHRiqLBNYFamCLSoIBmu23djkN6URO2kT8iyrOhUmQI5+FG8mzt7HcBUf5WjIY8P9W04PkuJps2lv4F3BYDExCxPlKPGrlijgC3fdsO9AikZFBEPr5XAgMBAAGjHTAbMA4GA1UdDwEB/wQEAwIHgDAJBgNVHRMEAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQBCNPKrQF2xipJTPBCHnbJKPJqns4+1YgCsOJ0zTXLtV8hUeA5Wja/Stv2W5B5vXQBfvlD9fKT09c45lXgUarsVvrVAHN6f6Uu/rvrYgVwYw5qd/axeShx5J4oxw+FLQktwszzQ5eR0nIinR67Kb6/wEWcE75P7hOvBlhfQ6TMDuU2xoh4d8dTGbIxI0IYhx4NrTKdzuVnXe7EUe1B5HzSAGQPSe/xfN/nmWdLT4uIqGp8iofJ31XXRacuNo+NxRYfujpfvZNdR1UF+xYXZv1C1ShCi5m+qjFhVNknCaa7luPhElobOdBVCldZtvI4kZocYnazGIp93e7PtLyQqn3EY-----END CERTIFICATE-----";
	}

	$kcp = new KCP($site_code,$kcp_cert_info, $mode);
	$order_data=array(
		"ordr_idxx"=>"TEST111",
		"good_mny"=>"2000",
		"pay_method"=>"CARD",
		"good_name"=>"테스트상품",
		"Ret_URL"=>"https://directg.net/api/kcp/test.php",
		"user_agent"=>"Mobile"
	);
	$result = $kcp->kcpRegister($order_data);
	
	echo "<br>";
	echo "<br>";
	print_r($result);
	echo "<br>";
	echo "<br>";
	

	$payment_data = array(
		"tran_cd" => $tran_cd, 
		"enc_data" => $enc_data,
		"enc_info" => $enc_info,
		"ordr_mony" => "1004", // 실제 결제될 금액이 1004원이라면   ** 결제금액 유효성 검증 **
		"pay_type" => "PACA", // 실제 결제할 수단이 신용카드라면 PACA로 세팅 ** 결제수단 유효성 검증 **
		"ordr_no" => "TEST1234567890", // 실제 처리할 주문번호가 TEST1234567890라면 ** 주문번호검증 **
	);

?>