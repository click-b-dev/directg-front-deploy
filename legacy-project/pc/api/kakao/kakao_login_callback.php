<?
header("Content-Type: text/html; charset=UTF-8");

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kakao.xml');
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

//페이지 직접접근방지
if( $state != $stored_state ) {
	//return RESPONSE_UNAUTHORIZED; //401 unauthorized
	echo "RESPONSE_UNAUTHORIZED";
	$logger->info("RESPONSE_UNAUTHORIZED");
}else{
	$kakao = new Kakao("pc",'kakao_login');
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

	//$logger->info($msg);
	try{  
		$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
		$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		
		$member = new Member($conn_dgkr);
		
		//간편로그인 연결여부 확인
		$snsinfo_member = $member->getSnsMemberChk("KAKAO",$kakao_idNo);
		$logger->info($snsinfo_member);
		
		if($snsinfo_member['m_id']==""){ //연결된 계정이 없음
			//DGKR 회원가입여부 확인
			$chk_member = $member->isMemberChk($email);
			
			if($chk_member['m_id']){ //기존회원(tbl_member :O, sns_info : X)
				if($chk_member['sns_type']=="KAKAO"){
					$msg = " 아이디 (".$email.") 는 카카오 간편로그인 연결이 안된 계정입니다. 비밀번호 찾기를 통하여 비밀번호를 변경하신 후에 로그인 후 마이페이지 > 간편로그인을 통해서 계정연결 후 이용이 가능합니다.";
					$status = "NOT_CONNECT";
				}else{
					if($_SESSION['member']['m_no']){ //마이페이지 > 간편로그인 연결
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
						
						$status = "CONNECT";
					}else{
						$msg = " 아이디 (".$email.") 는 이미 가입된 회원입니다. 로그인 후 마이페이지 > 간편로그인을 통해서 계정연결 후 이용이 가능합니다.";
						$status = "NOT_CONNECT";
					}
				}
				
			}else{ //신규회원(tbl_member :X, sns_info : X)
				$status = "NO_MEMBER";
				
				$user_info = array(
					"userID"=>$kakao_idNo,
					"email"=>$email,
					"name"=>$kakao_nickname,
					"nickname"=>$kakao_nickname,
				);
				
				$access_token = $_SESSION['KAKAO_SESSION_NAME']['access_token'];
				
				//DGKr 신규가입
				$m_no = $member->setMemberJoin($user_info,$ip,$country,$access_token,'KAKAO');
				
				$member->setMemberLogin($user_info['email'],$ip,$country);
				
				// 로그인 처리
				$_SESSION['member']=array(
					'm_no'=>$m_no,
					'm_id'=>$user_info['email'],
					'name'=>$user_info['name'],
					'nickname'=>$user_info['nickname'],
					'mem_level'=>'1',
				);
				$logger->info($_SESSION['member']);
			}
		}else{ //이미 연결된 계정이 있음 (로그인 처리)
			$logger->info($snsinfo_member['m_id']);
			$chk_member = $member->isMemberChk($snsinfo_member['m_id']);
			
			$query = "update tbl_member set log_date = now(),visited=visited+1,ip =:ip,country=:country where m_id=:m_id";
			$stmt = $conn_dgkr->prepare($query);
			$params = array(
				':ip'=>$ip,
				':country'=>$country,
				':m_id'=>$chk_member['m_id']
			);
			$logger->info($params);
			$stmt->execute($params); 

			// 세션정보 저장
			$_SESSION['member']=array(
				'm_no'=>$chk_member['m_no'],
				'm_id'=>$chk_member['m_id'],
				'name'=>$chk_member['name'],
				'nickname'=>$chk_member['nickname'],
				'mem_level'=>$chk_member['mem_level'],
				'mem_type'=>$chk_member['mem_type']
			);
			
			$logger->info($_SESSION['member']);

			$msg = $chk_member['m_id']." 카카오 간편로그인 성공";
			
			$status = "IS_MEMBER";
		}

	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();
		$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
		die();  
		//exit;
	}
}
$logger->info($status);
//echo $status;
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>KAKAO 간편로그인 연동</title>
</head>
<? if($status=="IS_MEMBER"){?>
<script type="text/javascript">	
	//alert("<?=$msg?>");
	opener.parent.location.replace('/index.html');
	self.close();
</script>
<?}elseif($status=="NOT_CONNECT"){?>
<script type="text/javascript">	
	alert("<?=$msg?>");
	self.close();
</script>
<?}elseif($status=="CONNECT"){?>
<script type="text/javascript">	
	opener.parent.location.reload();
	self.close();
</script>
<?}elseif($status=="NO_MEMBER"){?>
<script type="text/javascript">
//opener.parent.location.href='/api/kakao/join.php';
/*동적폼 생성후 submit*/
var memberInfo_idNo = "<?=$kakao_idNo?>";
var memberInfo_id = "<?=$email?>";
var memberInfo_mobileId = "";
var memberInfo_maskingId = "";
var memberInfo_maskingMobileId = "";
var memberInfo_name = "<?=$kakao_nickname?>";
var memberInfo_sexCode = "";
var memberInfo_birthdayMMdd = "";
var memberInfo_ageGroup ="";
var token_access_token = "";
opener.parent.set_info(memberInfo_idNo,memberInfo_id,memberInfo_mobileId,memberInfo_maskingId,memberInfo_maskingMobileId,memberInfo_name,memberInfo_sexCode,memberInfo_birthdayMMdd,memberInfo_ageGroup,token_access_token,'kakao');
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