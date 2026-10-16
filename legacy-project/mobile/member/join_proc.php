<?php
ini_set( "display_errors", 1 );
header('Content-Type: application/json');

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
require_once $_SERVER["DOCUMENT_ROOT"].'/../geoip2/geoip2.phar';

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/src/main/php/Logger.php');
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_join_mobile.xml');
$logger = Logger::getLogger('mobile');
$logger->info($_POST['m_id']);
$logger->info($_POST['mode']);

define('KEY','01234567890123456789012345678901');
define('KEY_128',substr(KEY,0,128/8));
define('KEY_256',substr(KEY,0,256/8));

$m_id = filter_input(INPUT_POST, 'm_id', FILTER_SANITIZE_STRING);
$m_pwd = filter_input(INPUT_POST, 'm_pwd', FILTER_SANITIZE_STRING);
$m_pwd_re = filter_input(INPUT_POST, 'm_pwd_re', FILTER_SANITIZE_STRING);
$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_STRING);

$visitorId = filter_input(INPUT_POST, 'visitorId', FILTER_SANITIZE_STRING);

$is_mailling = filter_input(INPUT_POST, 'is_mailling', FILTER_SANITIZE_STRING);
$is_sms = filter_input(INPUT_POST, 'is_sms', FILTER_SANITIZE_STRING);
$is_event = filter_input(INPUT_POST, 'is_event', FILTER_SANITIZE_STRING);
$id_chk = filter_input(INPUT_POST, 'id_chk', FILTER_SANITIZE_STRING);
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$birthday = filter_input(INPUT_POST, 'birthday', FILTER_SANITIZE_STRING);
$auth_enc = filter_input(INPUT_POST, 'auth_enc', FILTER_SANITIZE_STRING);

$auth_dec = openssl_decrypt($auth_enc,"AES-128-CBC",KEY_128,0,KEY_128);
$auth_obj = json_decode($auth_dec);

$token = filter_input(INPUT_POST, 'token', FILTER_SANITIZE_STRING);
$auth_code = filter_input(INPUT_POST, 'auth_code', FILTER_SANITIZE_STRING);

$ip = get_client_ip_env();
	
try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn_dgkr);
	$mypage = new Mypage($conn_dgkr);
	
	switch($mode){
		case "idChk":
			$chk_domain = $member->chkJoinDomain($m_id);

			if ($chk_domain==false) {
				$json_data = array(
					'error_code' => "1",
					'msg' => "가입이 불가능한 도메인입니다."
				);
			}else{
				$data = $member->memberChk($m_id,$m_pwd,$ip);

				if($data['error_code']=='NOT_FOUND'){
					$json_data = array(
						'error_code' => "0",
						'msg' => "ok"
					);
				}else{
					$json_data = array(
						'error_code' => "1",
						'msg' => "이미 가입된 아이디입니다"
					);
				}
			}

			$json = json_encode($json_data);
			echo $json;
		break;
		case "join":
			include_once($_SERVER['DOCUMENT_ROOT']."/../conf/email/email_join.php");

			// ===== hCaptcha 검증 =====
			$captcha_response = $_POST['h-captcha-response'] ?? '';

			if (empty($captcha_response)) {
				echo json_encode(array('error_code' => "1", 'msg' => "캡챠 인증이 필요합니다."));
				exit;
			}

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, "https://hcaptcha.com/siteverify");
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array(
				'secret'   => $hcaptcha_secret,
				'response' => $captcha_response,
				'remoteip' => $ip
			)));
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
			curl_setopt($ch, CURLOPT_TIMEOUT, 10);
			$captcha_result = curl_exec($ch);
			$captcha_http   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
			curl_close($ch);

			$captcha_obj = json_decode($captcha_result);

			if ($captcha_http != 200 || empty($captcha_obj->success)) {
				$logger->info("hCaptcha 검증 실패: " . $captcha_result);
				echo json_encode(array('error_code' => "1", 'msg' => "캡챠 인증에 실패했습니다."));
				exit;
			}
			// ===== 검증 끝 =====

			try {
				$country = $member->getCountry($ip);
				$logger->info($country);
			} catch (Exception $e) {
				//echo $e->getMessage();
				$logger->info($e->getMessage());
				$country ="";
			}

			if($country=="RU" || $country=="RO" || $country=="BR" || $country=="FR" || $country=="VN" || $country=="DE" || $country=="PH" || $country=="AT" || $country=="NZ"  || $country=="NL" || $country=="PL" || $country=="GB" || $country=="AE" || $country=="IT" || $country=="MO" || $country=="IN"  || $country=="EC"  || $country=="CO" || $country=="DK" || $country=="CH" || $country=="TH" || $country=="CN" || $country=="TW" || $country=="HK" || $country=="ZA" || $country=="US"  || $country=="AU" || $country=="CA" || $country=="IL"  || $country=="EE" || $country=="GR"){
				$json_data = array(
					'error_code' => "2",
					'msg' => "해외에서는 회원가입을 하실 수 없습니다."
				);
				$json = json_encode($json_data);
				echo $json;
				exit;
			}

			$chk_domain = $member->chkJoinDomain($m_id);

			if ($chk_domain==false) {
				$json_data = array(
					'error_code' => "1",
					'msg' => "가입이 불가능한 도메인입니다."
				);
				$json = json_encode($json_data);
				echo $json;
				exit;
			}

			if($m_pwd!=$m_pwd_re){
				$json_data = array(
					'error_code' => "1",
					'msg' => "비밀번호 오류"
				);
				$json = json_encode($json_data);
				echo $json;
				exit;
			}

			if(!$json_data['error_code']){
				$nickname=strstr($m_id, '@', true);
				$name=$nickname;
				$country="KR";
				$mem_type="P";
				$is_auth="N";
	//			$dupinfo=$auth_obj->di_url;
	//			$auth_type="ASC007";
				$channel="mobile";
	//			$hp=$auth_obj->phone_no;
	//			$sex=$auth_obj->sex_code;
				
				$m_no=$member->setMemberAuth($m_id,$name,$nickname,$m_pwd,$birthday,$ip,$country,$mem_type,$is_auth,$is_mailling,$dupinfo,$auth_type,$channel,$hp,$sex,$visitorId);

				if($m_no>0){
					$auth_key = md5($m_id.$m_no);
					
					$join_confirm = "<a href='https://".$_SERVER['HTTP_HOST']."/member/join_confirm.php?m_no=$m_no&auth_key=$auth_key&m_id=$m_id'>[인증완료]</a>";
					$mail_html = htmlspecialchars_decode($set['email']['body']);
					$mail_html = str_replace("&#60;","<",$mail_html);
					$mail_html = str_replace("&#62;",">",$mail_html);
					$mail_html = str_replace("&#34;","'",$mail_html);
					$mail_html = str_replace("&#38;","&",$mail_html);
					$mail_html = str_replace("&nbsp;"," ",$mail_html);
					$mail_html = str_replace("[join_confirm]",$join_confirm,$mail_html);
					$mail_html = str_replace("[m_id]",$m_id,$mail_html);

					$body = $mail_html;

					$mail = new DirectSendMail;
					$result = $mail->sendMail($set['email']['subject'],$set['email']['senderMail'],$body,$m_id);
					
					$result_json = json_decode($result);
					
					if($result_json->status=="0"){
						$auth_key_result = $member->updateMemberAuthkey($m_id,$auth_key);
						$json_data = array(
							'error_code' => "0",
							'msg' => "회원가입 성공"
						);
					} else {
						$json_data = array(
							'error_code' => "2",
							'msg' => "인증메일 발송에 실패하였습니다."
						);
					}
				} else {
					$json_data = array(
						'error_code' => "1",
						'msg' => "회원가입 실패"
					);
				}
			}
			$json = json_encode($json_data);
			echo $json;

		break;
		case "findpassword":
			include_once($_SERVER['DOCUMENT_ROOT'].'/inc/email/email_findpassword.php');

			$data = $member->memberChk($email,"","");
			if($data['error_code']=="NOT_FOUND"){
				$json_data = array(
					'error_code' => "1",
					'msg' => "일치하는 회원이 존재하지 않습니다."
				);
			} else {
				$otp = new otp;
				
				$token = $otp->getToken();
				$certificationCode = $otp->getOTP();
				
				$mypage->setOtp($email,$token,$certificationCode);
				
				$mail_html = htmlspecialchars_decode($set['email']['body']);
				$mail_html = str_replace("&#60;","<",$mail_html);
				$mail_html = str_replace("&#62;",">",$mail_html);
				$mail_html = str_replace("&#34;","'",$mail_html);
				$mail_html = str_replace("[certificationCode]",$certificationCode,$mail_html);
				$mail_html = str_replace("[m_id]",$email,$mail_html);

				$headers['Name']    = "Direct Games";
				$headers['From']    = $set['email']['senderMail'];
				$headers['To']      = $email;
				$headers['Subject'] = iconv("utf-8","euckr",'Direct Games Password');
				$body = $mail_html;

				$mail = new DirectSendMail;
				$result = $mail->sendMail($set['email']['subject'],$set['email']['senderMail'],$body,$email,"password");

				$result_json = json_decode($result);
				
				if($result_json->status=="0"){
					$json_data = array(
						'error_code' => "0",
						'm_id'=>$email,
						'token'=>$token,
						'otp'=>$certificationCode,
						'msg'=>"인증번호가 전송되었습니다."
					);
				} else {
					$json_data = array(
						'error_code' => "1",
						'msg' => "메일발송 실패"
					);
				}
			}
			$json = json_encode($json_data);
			echo $json;
		break;
		case "authConfirm":
			$data = $mypage->getOtp($email);

			if($data['token']==$token && $data['otp']==$auth_code){
				$mypage->updateOtp($email,'1');
				$json_data = array(
					'error_code' => "0",
					'auth_code' => $auth_code,
					'token' => $token,
					'msg' => "인증에 성공하였습니다."
				);
			}else{
				$json_data = array(
					'error_code' => "1",
					'msg' => "인증정보가 일치하지 않습니다.".$token
				);
			}

			$json = json_encode($json_data);
			echo $json;
		break;
		case "resetpassword":
			if($m_pwd!=$m_pwd_re){
				$json_data = array(
					'error_code'=>'1',
					'msg'=>'새 비밀번호와 새 비밀번호 확인이 다릅니다.'
				);
				echo json_encode($json_data);
				exit;
			}
			
			$mypage->updateNewPassword($m_id,$m_pwd);
			$json_data = array(
				'error_code'=>'0',
				'msg'=>'비밀번호 변경이 완료되었습니다.'
			);
			echo json_encode($json_data);
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>