<?
header("Content-Type: text/html; charset=UTF-8");

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kakao_connect.xml');
$logger = Logger::getLogger("kakao");

$ip = get_client_ip_env();

/*ip로 국가코드 조회하기*/
use GeoIp2\Database\Reader;
$reader = new Reader('/home/dgkrshop/www/geoip2/GeoLite2-Country.mmdb');
$record = $reader->country($ip);

$country = $record->country->isoCode;
/*#############################*/

$code = $_REQUEST["code"];
$state = $_REQUEST["state"];
$stored_state = $_SESSION['KAKAO']['state'];

if( $state != $stored_state ) {
	//return RESPONSE_UNAUTHORIZED; //401 unauthorized
	echo "RESPONSE_UNAUTHORIZED";
	$logger->info("RESPONSE_UNAUTHORIZED");
}else{
	$kakao = new Kakao("pc",'kakao_connect');
	//사용자 토큰 받기
	$kakao -> call_accesstoken();

	//사용자 정보요청
	$property_keys = array(
		'kakao_account.email','properties.nickname'
	);

	$data_string = array(
		'secure_resource'=> 'true ',
		'property_keys'=>json_encode($property_keys)
	);
	
	$kakao_user_info = $kakao ->get_user_info($data_string);

	$logger->info($kakao_user_info);

	$kakao_idNo = $kakao_user_info['id'];
	$kakao_nickname = $kakao_user_info['properties']['nickname'];
	$email = $kakao_user_info['kakao_account']['email']; //카카오계정 대표 이메일
	$email_needs_agreement = $kakao_user_info['kakao_account']['email_needs_agreement']; // 사용자 동의 시 이메일 제공 가능
	$has_email = $kakao_user_info['kakao_account']['has_email'];
	$is_email_valid = $kakao_user_info['kakao_account']['is_email_valid']; // 이메일이 다른 카카오계정에 사용돼 만료되었다면 무효(false)
	$is_email_verified = $kakao_user_info['kakao_account']['is_email_verified']; //이메일 인증 여부

	//26-03-30(월) 10:53 [이종석] 닉네임 없을 경우 메일주소 아이디를 닉네임으로
	if(!$kakao_nickname){
		$nickname=strstr($email, '@', true);
		$kakao_nickname=$nickname;
	}

	
	try{  
		$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
		$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		//다중계정 동일간편로그인 연동 방지
		$query = "select count(*)as cc from sns_info where sns_type='KAKAO' and sns_id=:sns_id";
		$params = array(
					':sns_id'=>$kakao_idNo
				);
		$stmt = $conn_dgkr->prepare($query);
		$stmt->execute($params);
		$chk_member = $stmt->fetch();

		if($chk_member['cc']==0){
			if($kakao_idNo){
				//카카오 간편로그인 정보 추가
				$query = "insert into sns_info set email=:email ,sns_id=:sns_id,sns_type=:sns_type,sns_name=:sns_name,sns_profile=:sns_profile,sns_connect_date=now(),access_token=:access_token,m_no=:m_no,flag='C'";
				$stmt = $conn_dgkr->prepare($query);
				$params = array(
					':email'=>$email,
					':sns_id'=>$kakao_idNo,
					':sns_type'=>'KAKAO',
					':sns_name'=>$kakao_nickname,
					':sns_profile'=>$kakao_nickname,
					':access_token'=>$_SESSION['KAKAO_SESSION_NAME']['access_token'],
					':m_no'=>$_SESSION['member']['m_no']
				);
				$stmt->execute($params);
			}

			msg("카카오 간편로그인 연결성공.");
			echo "<script>opener.parent.location.reload();self.close();</script>";
			exit;
		}else{
			msg("이미 연결된 간편로그인 계정입니다.");
			echo "<script>self.close();</script>";
			exit;
		}

	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();
		$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
		die();  
		//exit;
	}

	$logger->info($msg);
}
?>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>KAKAO 간편로그인 연동</title>
</head>
<? if($status=="IS_MEMBER"){?>
<script type="text/javascript">	
	alert("<?=$msg?>");
	self.close();
</script>
<?}elseif($status=="NO_MEMBER"){?>
<script type="text/javascript">
//opener.parent.location.href='/api/kakao/join.php';
/*동적폼 생성후 submit*/
self.close();
</script>
<?}else{?>
<script type="text/javascript">
alert("<?=$chk_member['m_id']?>");
self.close();
</script>
<?}?>
<body>
</body>
</html>