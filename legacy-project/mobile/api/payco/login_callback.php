<?
ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_payco_login.xml');
$logger = Logger::getLogger("payco_mobile");

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

$payco = new Payco('mobile');

$payco->getAccessToken();
$user_profile = $payco->getUserProfile();
	//로그기록
$logger->info($ip);
$logger->info($country);
$logger->info($user_profile);

try{  
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$member = new Member($conn_dgkr);
	
	if($user_profile->data->member->idNo){
		
		$memberInfo_idNo = $user_profile->data->member->idNo;
		$memberInfo_id = $user_profile->data->member->email;
		$memberInfo_hp = $user_profile->data->member->mobile; //(821045003256)
		$memberInfo_name = $user_profile->data->member->name;
		$memberInfo_ageGroup = $user_profile->data->member->ageGroup; //40
		$user_info = array(
			"userID"=>$user_profile->data->member->idNo,
			"email"=>$user_profile->data->member->email,
			"name"=>$user_profile->data->member->name,
			"nickname"=>$user_profile->data->member->name,
		);
		$access_token = $_SESSION['PAYCO']['access_token'];

		if(!$memberInfo_name){
			$nickname=strstr($memberInfo_id, '@', true);
			$memberInfo_name=$nickname;
		}

		//간편로그인 가입여부 확인
		$snsinfo_member = $member->getSnsMemberChk("PAYCO",$memberInfo_idNo);
		
		if($snsinfo_member['m_id']){ //DGKR회원, 간편로그인 연결정보 있음.

			//로그인 처리 및 방문횟수 업데이트
			$member->setMemberLogin($snsinfo_member['m_id'],$ip,$country);

			$_SESSION['member']=array(
				'm_no'=>$snsinfo_member['m_no'],
				'm_id'=>$snsinfo_member['m_id'],
				'name'=>$snsinfo_member['name'],
				'nickname'=>$snsinfo_member['nickname'],
				'mem_level'=>$snsinfo_member['mem_level'],
				'mem_type'=>$snsinfo_member['mem_type']
			);

			$msg = $snsinfo_member['m_id']."페이코 간편로그인 성공";
			$join_status = "IS_MEMBER";

		}else{ // 신규회원 (간편로그인 미연동 및 신규회원)
			if($memberInfo_id){ //간편로그인 이메일 주소 제공시
				
				//기존에 가입된 페이코 이메일 주소가 있는지 확인
				$chk_member = $member->isMemberChk($memberInfo_id);
				
				if($chk_member['m_id']){ //기존회원(tbl_member :O, sns_info : X)
					if($chk_member['sns_type']=="payco"){
						$msg = " 아이디 (".$memberInfo_id.") 는 페이코 간편로그인 연결이 안된 계정입니다. 비밀번호 찾기를 통하여 비밀번호를 변경하신 후에 로그인 후 마이페이지 > 간편로그인을 통해서 계정연결 후 이용이 가능합니다.";
						$join_status = "NOT_CONNECT";
					}else{
						//$msg = " 아이디 (".$memberInfo_id.") 는 페이코 간편로그인 연결이 안된 계정입니다. 로그인 후 마이페이지 > 간편로그인을 통해서 계정연결 후 이용이 가능합니다.";
						$query = "insert into sns_info set email=:email ,sns_id=:sns_id,sns_type=:sns_type,sns_name=:sns_name,sns_profile=:sns_profile,sns_connect_date=now(),access_token=:access_token,m_no=:m_no,flag='C'";
						$stmt = $conn_dgkr->prepare($query);
						$params = array(
							':email'=>$memberInfo_id,
							':sns_id'=>$memberInfo_idNo,
							':sns_type'=>'PAYCO',
							':sns_name'=>$memberInfo_name,
							':sns_profile'=>$memberInfo_name,
							':access_token'=>$_SESSION['PAYCO']['access_token'],
							':m_no'=>$_SESSION['member']['m_no']
						);
						$stmt->execute($params);
						$join_status = "CONNECT";
					}
					
					
				}else{ //신규회원(tbl_member :X, sns_info : X)
					//신규회원 가입처리
					$m_no = $member->setMemberJoin($user_info,$ip,$country,$access_token,'payco');
					
					//로그인 처리 및 방문횟수 업데이트
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
						$join_status = "NO_MEMBER";
					}else{
						$msg = "이미 연결된 간편로그인 계정\n";
						$join_status = "IS_MEMBER";
					}
				}
			}else{ //이메일 정보제공 미동의
				$msg = "회원가입페이지로 이동\n";
				$join_status = "NOT_EMAIL";
			}
		}
	}
	
	$logger->info($msg);
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

//echo $join_status;
echo $msg;
?>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>PAYCO 간편로그인 연동</title>
	</head>
<script>
	const lastUrl = sessionStorage.getItem('LastUrl');
</script>

	<?
		switch($join_status){
			case "NO_MEMBER":case "NOT_CONNECT": // 간편로그인 연결안됨;
?>
<script type="text/javascript">	
	window.opener.parent.join_payco("<?=$memberInfo_idNo?>","<?=$memberInfo_id?>","<?=$memberInfo_name?>","<?=$access_token?>");
	self.close();
</script>
<?
			break;
			case "CONNECT": //간편로그인 연결완료
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
	window.opener.parent.location.replace(lastUrl);
	sessionStorage.removeItem('LastUrl');
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
	alert("<?=$msg?>");
	self.close();
</script>
<?
			break;
		}
	