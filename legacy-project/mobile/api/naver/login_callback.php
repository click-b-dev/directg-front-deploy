<?
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_naver.xml');
$logger = Logger::getLogger("mobile");

$code = filter_input(INPUT_GET, 'code', FILTER_SANITIZE_STRING);
$state = filter_input(INPUT_GET, 'state', FILTER_SANITIZE_STRING);
$error = filter_input(INPUT_GET, 'error', FILTER_SANITIZE_STRING);

$ip = get_client_ip_env();

/*ip로 국가코드 조회하기*/
use GeoIp2\Database\Reader;
$reader = new Reader('/home/dgkrshop/www/geoip2/GeoLite2-Country.mmdb');
$record = $reader->country($ip);

$country = $record->country->isoCode;
/*#############################*/

$naver = new Naver('mobile');

//access Token 발급요청
$naver->getAccessToken();

//프로필 정보조회
$user_info = $naver->getUserProfile();

//로그기록
$logger->info($ip);
$logger->info($country);
$logger->info($user_info);

//26-03-30(월) 10:53 [이종석] 닉네임 없을 경우 메일주소 아이디를 닉네임으로
if(!$user_info['name']){
	$nickname=strstr($user_info['email'], '@', true);
	$user_info['name']=$nickname;
}
if(!$user_info['nickname']){
	$nickname=strstr($user_info['email'], '@', true);
	$user_info['nickname']=$nickname;
}

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn_dgkr);
	
	//간편로그인(Naver) 을 통한 회원가입여부 확인
	$snsinfo_member = $member->getSnsMemberChk("NAVER",$user_info['userID']);
	
	if($snsinfo_member['m_id']){ //DGKR회원, 간편로그인 연결정보 있음.
		//로그인 처리 및 방문횟수 업데이트
		$member->setMemberLogin($snsinfo_member['m_id'],$ip,$country);
		
		//로그인 처리
		$_SESSION['member']=array(
			'm_no'=>$snsinfo_member['m_no'],
			'm_id'=>$snsinfo_member['m_id'],
			'name'=>$snsinfo_member['name'],
			'nickname'=>$snsinfo_member['nickname'],
			'mem_level'=>$snsinfo_member['mem_level'],
			'mem_type'=>$snsinfo_member['mem_type']
		);

		$msg = $snsinfo_member['m_id']." 네이버 간편로그인 성공";
		$status = "IS_MEMBER";

	}else{ // 신규회원 (간편로그인 미연동 및 신규회원)
		if($user_info['email']){ //간편로그인 이메일 주소 제공시
			//기존에 가입된 네이버계정이 있는지 확인
			$chk_member = $member->isMemberChk($user_info['email']);

			if($chk_member['m_id']){ //기존회원(tbl_member :O, sns_info : X)
				if($chk_member['sns_type']=="naver"){
					$msg = " 아이디 (".$user_info['email'].") 는 네이버 간편로그인 연결이 안된 계정입니다. 비밀번호 찾기를 통하여 비밀번호를 변경하신 후에 로그인 후 마이페이지 > 간편로그인을 통해서 계정연결 후 이용이 가능합니다.";
					$status = "NOT_CONNECT";
				}else{
					if($_SESSION['member']['m_no']){ //마이페이지 > 간편로그인 연결
						$query = "insert into sns_info set email=:email ,sns_id=:sns_id,sns_type=:sns_type,sns_name=:sns_name,sns_profile=:sns_profile,sns_connect_date=now(),access_token=:access_token,m_no=:m_no,flag='C'";
						$stmt = $conn_dgkr->prepare($query);
						$params = array(
							':email'=>$user_info['email'],
							':sns_id'=>$user_info['userID'],
							':sns_type'=>'NAVER',
							':sns_name'=>$user_info['name'],
							':sns_profile'=>$user_info['nickname'],
							':access_token'=>$_SESSION['NAVER']['access_token'],
							':m_no'=>$_SESSION['member']['m_no']
						);
						$stmt->execute($params);
						$status = "CONNECT";
					}else{
						$msg = " 아이디 (".$user_info['email'].") 는 네이버 간편로그인 연결이 안된 계정입니다. 로그인 후 마이페이지 > 간편로그인을 통해서 계정연결 후 이용이 가능합니다.";
						$status = "NOT_CONNECT";
					}
					
				}
			}else{ //신규회원(tbl_member :X, sns_info : X)
				$access_token = $_SESSION['NAVER']['access_token'];
				//신규회원 가입처리
				$m_no = $member->setMemberJoin($user_info,$ip,$country,$access_token,'naver');
				$member->setMemberLogin($user_info['email'],$ip,$country);
				
				// 로그인 처리
				$_SESSION['member']=array(
					'm_no'=>$m_no,
					'm_id'=>$user_info['email'],
					'name'=>$user_info['name'],
					'nickname'=>$user_info['nickname'],
					'mem_level'=>'1',
				);
				
				if($m_no>0){
					//$msg = "네이버 간편로그인 회원가입 성공\n";
					$status = "NO_MEMBER";
				}else{
					$msg = "이미 연결된 간편로그인 계정\n";
					$status = "IS_MEMBER";
				}
			}
		}else{ //이메일 정보제공 미동의
			$msg = "회원가입페이지로 이동\n";
			$status = "NOT_EMAIL";
		}
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$logger->info($status);
?>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>NAVER 간편로그인 연동</title>
</head>
<script>
	const lastUrl = sessionStorage.getItem('LastUrl');
</script>
<? if($status=="IS_MEMBER"){?>
<script type="text/javascript">	
	opener.parent.location.replace(lastUrl);
	sessionStorage.removeItem('LastUrl');
	self.close();
</script>
<?}elseif($status=="NO_MEMBER"){?>
<script type="text/javascript">
	opener.parent.location.replace(lastUrl);
	sessionStorage.removeItem('LastUrl');
self.close();
</script>
<?}elseif($status=="NOT_CONNECT"){?>
<script type="text/javascript">
alert('<?=$msg?>');
self.close();
</script>
<?}elseif($status=="CONNECT"){?>
<script type="text/javascript">
opener.parent.location.reload();
self.close();
</script>
<?}elseif($status=="NOT_EMAIL"){?>
<script type="text/javascript">
var memberInfo_idNo = "<?=$profile['userID']?>";
opener.parent.join_naver(memberInfo_idNo);
self.close();
</script>
<?}else{?>
<script type="text/javascript">
//alert("<?=$profile['email']?>");
history.back(-1);
self.close();
</script>
<?}?>
<body>
</body>
</html>