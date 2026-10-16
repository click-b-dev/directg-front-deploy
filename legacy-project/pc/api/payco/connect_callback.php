<?
ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payco_connect.xml');
$logger = Logger::getLogger("payco_pc");

$ip = get_client_ip_env();

/*ip로 국가코드 조회하기*/
use GeoIp2\Database\Reader;
$reader = new Reader('/home/dgkrshop/www/geoip2/GeoLite2-Country.mmdb');
$record = $reader->country($ip);

$country = $record->country->isoCode;
/*#############################*/
	
$code = filter_input(INPUT_GET, 'code', FILTER_SANITIZE_STRING);
$state = filter_input(INPUT_GET, 'state', FILTER_SANITIZE_STRING);
$serviceExtra = filter_input(INPUT_GET, 'serviceExtra', FILTER_SANITIZE_STRING);

$payco = new Payco('pc');

$payco->getAccessToken();
$user_profile = $payco->getUserProfile();
	//로그기록
//$logger->info($ip);
//$logger->info($country);
$logger->info($user_profile);

$memberInfo_idNo = $user_profile->data->member->idNo;
$memberInfo_id = $user_profile->data->member->email;
$memberInfo_hp = $user_profile->data->member->mobile; //(821045003256)
$memberInfo_name = $user_profile->data->member->name;
$memberInfo_ageGroup = $user_profile->data->member->ageGroup; //40

if(!$memberInfo_name){
	$nickname=strstr($memberInfo_id, '@', true);
	$memberInfo_name=$nickname;
}

$user_info = array(
	"userID"=>$user_profile->data->member->idNo,
	"email"=>$user_profile->data->member->email,
	"name"=>$user_profile->data->member->name,
	"nickname"=>$user_profile->data->member->name,
);
$access_token = $_SESSION['PAYCO']['access_token'];

try{  
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	//다중계정 동일간편로그인 연동 방지
	$query = "select count(*)as cc from sns_info where sns_type='PAYCO' and sns_id=:sns_id";
	$params = array(
				':sns_id'=>$memberInfo_idNo
			);
	$stmt = $conn_dgkr->prepare($query);
	$stmt->execute($params);
	$chk_member = $stmt->fetch();

	if($chk_member['cc']==0){
		if($memberInfo_idNo){
			//페이코 간편로그인 정보 추가
			$query = "insert into sns_info set email=:email ,sns_id=:sns_id,sns_type=:sns_type,sns_name=:sns_name,sns_profile=:sns_profile,sns_connect_date=now(),access_token=:access_token,m_no=:m_no,flag='C'";
			$stmt = $conn_dgkr->prepare($query);
			$params = array(
				':email'=>$memberInfo_id,
				':sns_id'=>$memberInfo_idNo,
				':sns_type'=>'PAYCO',
				':sns_name'=>$memberInfo_name,
				':sns_profile'=>$memberInfo_name,
				':access_token'=>$access_token,
				':m_no'=>$_SESSION['member']['m_no'],
			);
			$stmt->execute($params);
		}
	}else{
		msg("이미 연결된 간편로그인 계정입니다.");
		echo "<script>self.close();</script>";
		exit;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>PAYCO 간편로그인 연동</title>
	</head>
	<?
		switch($status){
			case "NO_MEMBER": // 간편로그인 연결안됨;
?>
<script type="text/javascript">	
	window.opener.parent.join_payco("<?=$memberInfo_idNo?>","<?=$memberInfo_id?>","<?=$memberInfo_name?>","<?=$access_token?>");
	self.close();
</script>
<?
			break;
			case "NOT_CONNECT":
?>
<script type="text/javascript">
	alert("<?=$msg?>");
	self.close();
</script>
<?
			break;
			case "CONNECT":
?>
<script type="text/javascript">
	window.opener.parent.location.reload();
	self.close();
</script>
<?
			break;
			case "IS_MEMBER": //간편로그인 성공
?>
<script type="text/javascript">
window.opener.parent.location.replace('/index.html');
self.close();
</script>
<?
			break;
			case "MEMBER_READY":
?>
	<script type="text/javascript">
	alert("회원가입 인증대기상태의 회원입니다. \r\n이메일을 확인하셔서 인증완료를 클릭해주세요.");
	self.close();
	</script>
<?
			break;
			default:
?>
<script type="text/javascript">
	self.close();
</script>
<?
			break;
		}
	