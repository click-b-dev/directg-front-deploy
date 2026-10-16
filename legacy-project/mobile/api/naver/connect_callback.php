<?
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_naver_connect.xml');
$logger = Logger::getLogger("naver");

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

$naver = new Naver('pc');

//access Token 발급요청
$naver->getAccessToken();

//프로필 정보조회
$user_info = $naver->getUserProfile();

//로그기록
//$logger->info($ip);
//$logger->info($country);
$logger->info($user_info);
$logger->info($_SESSION['member']['m_no']);

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
	
	///다중계정 동일간편로그인 연동 방지
	$query = "select count(*)as cc from sns_info where sns_type='NAVER' and sns_id=:sns_id";
	$params = array(
				':sns_id'=>$user_info['userID']
			);
	$stmt = $conn_dgkr->prepare($query);
	$stmt->execute($params);
	$chk_member = $stmt->fetch();
	$logger->info($params);

	if($chk_member['cc']==0){
		if($user_info['userID']){
			//네이버 간편로그인 정보 추가
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
			$logger->info($params);
		}

		//msg("네이버 간편로그인 연결성공.");
		$logger->info("네이버 간편로그인 연결성공.");
		echo "<script>opener.parent.location.reload();self.close();</script>";
		exit;
	}else{
			msg("이미 연결된 네이버 간편로그인 계정입니다.");
			$logger->info("이미 연결된 네이버 간편로그인 계정입니다.");
			echo "<script>self.close();</script>";
			exit;
		}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();
	$isDBOK = false; //DB처리 실패시 false로 변경해 주세요.
	die();  
	//exit;
}

$logger->info($status);
$logger->info($msg);
?>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>NAVER 간편로그인 연동</title>
</head>
<? if($status=="IS_MEMBER"){?>
<script type="text/javascript">	
	opener.parent.location.replace('/index.html');
	self.close();
</script>
<?}elseif($status=="NO_MEMBER"){?>
<script type="text/javascript">
opener.parent.location.replace('/index.html');
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