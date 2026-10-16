<?
ini_set( "display_errors", 1 );
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT']."/lib/login_check.php");

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/src/main/php/Logger.php');
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_event.xml');
$logger = Logger::getLogger('pc');

$logger->info($_POST);

header('Content-Type: text/html; charset=utf-8');

$event_no = filter_input(INPUT_POST, 'event_no', FILTER_SANITIZE_NUMBER_INT);

$m_no = $_SESSION['member']['m_no'];
$m_id = $_SESSION['member']['m_id'];

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$purchase_event = new PurchaseEvent($conn);

	//회원정보 조회
	$query="select m_no,m_id,name,birth_day,is_auth,hp from directgames.tbl_member where m_no=:m_no";
	$params = array(
			":m_no" => $_SESSION['member']['m_no']
		);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$member_data=  $stmt->fetch();
	
	if($_SESSION['member']['m_no']=="121876" || $_SESSION['member']['m_no']=="823942" || $_SESSION['member']['m_no']=="895084" || $_SESSION['member']['m_no']=="1023882"  || $_SESSION['member']['m_no']=="1173998"){
		//이벤트 대상자 여부 확인
		$event_result1 = "1";
		
		//이벤트 참여여부 확인
		$chk_event_member1 = "Y";
		
		switch($event_no){
			case "38": //#01 <풋볼 매니저 2024> & <풋볼 매니저 26> 구매하기
				$logger->info("#01 <풋볼 매니저 2024> 구매 회원 한정 추가 혜택 이벤트");
				$logger->info($member_data);
				$logger->info("이벤트 기준 달성여부 확인: ".$event_result1);
				$logger->info("이벤트 참여여부 확인: ".$chk_event_member1);
				
				if($event_result1){ //이벤트 기준 달성
					if($chk_event_member1=="Y"){
						$json_data = array(
							"result_code"=>"fail",
							"result_msg"=>"계정당 1회에 한해서만 이벤트 참여가 가능합니다.",
						);
						$logger->info("계정당 1회에 한해서만 이벤트 참여가 가능합니다.");
						echo json_encode($json_data);
						exit;
					}else{
						$gift_info = array(
							"title"=>"#01 <풋볼 매니저 2024> 구매 회원 한정 추가 혜택 이벤트 참여"
						);
						
						//포인트 지급처리
						$purchase_event->setEventPointSend($m_no,$event_no,"3000",$gift_info);
						
						//이벤트 참여이력 이력추가
						$purchase_event->setEventMemberLog($m_no,$m_id,$event_no,$member_data);

						$json_data = array(
						"result_code"=>"success",
						"result_msg"=>"포인트 지급이 완료되었습니다. [마이페이지 - 포인트] 메뉴에서 확인하실 수 있습니다",
						);
						$logger->info("포인트지급이 완료되었습니다. [마이페이지 - 포인트] 메뉴에서 확인하실 수 있습니다");
						echo json_encode($json_data);
					}
				}else{ // 이벤트 기준 미달
					$json_data = array(
						"result_code"=>"fail",
						"result_msg"=>"이벤트를 충족하지 못하였습니다. 구매 및 키활성화 완료 후 다시 시도해 주세요.",
					);
					$logger->info("이벤트를 충족하지 못하였습니다. 구매 및 키활성화 완료 후 다시 시도해 주세요.");
					echo json_encode($json_data);
					exit;
				}
			break;
			case "39"://#02 <풋볼 매니저 26> 사전 액세스 플레이 인증하기
				$logger->info("#02 <풋볼 매니저 26> 사전 액세스 플레이 인증 이벤트");
				
				$chk_event_member2 = $purchase_event->chkEventMemberLog($event_no,$m_no);
			
				//이벤트 참여이력 이력추가
				if($chk_event_member2<>"Y"){
					$purchase_event->setEventMemberLog($m_no,$m_id,$event_no,$member_data);
				}
				
				$json_data = array(
				"result_code"=>"request",
				"result_url"=>"https://forms.gle/LbkSuoDVhRyD7XFM7",
				);
				echo json_encode($json_data);
				exit;
			break;
		}
	}else{
		switch($event_no){ 
			case "38"://#01 <풋볼 매니저 2024> & <풋볼 매니저 26> 구매하기
				$logger->info("#01 <풋볼 매니저 2024> 구매 회원 한정 추가 혜택 이벤트");
				
				$logger->info($member_data);
				
				//이벤트 대상자 여부 확인
				$event_result1 = $purchase_event->chkEventOrderGoods_v2($event_no,$m_no);
				
				//이벤트 참여여부 확인
				$chk_event_member1 = $purchase_event->chkEventMemberLog($event_no,$m_no);
				
				$logger->info("이벤트 기준 달성여부 확인: ".$event_result1);
				$logger->info("이벤트 참여여부 확인: ".$chk_event_member1);
				
				if($event_result1){ //이벤트 기준 달성
					if($chk_event_member1=="Y"){
						$json_data = array(
							"result_code"=>"fail",
							"result_msg"=>"계정당 1회에 한해서만 이벤트 참여가 가능합니다.",
						);
						$logger->info("계정당 1회에 한해서만 이벤트 참여가 가능합니다.");
						echo json_encode($json_data);
						exit;
					}else{
						$gift_info = array(
							"title"=>"#01 <풋볼 매니저 2024> 구매 회원 한정 추가 혜택 이벤트 참여"
						);
						
						//포인트 지급처리
						$purchase_event->setEventPointSend($m_no,$event_no,"3000",$gift_info);
						
						//이벤트 참여이력 이력추가
						$purchase_event->setEventMemberLog($m_no,$m_id,$event_no,$member_data);

						$json_data = array(
						"result_code"=>"success",
						"result_msg"=>"포인트 지급이 완료되었습니다. [마이페이지 - 포인트] 메뉴에서 확인하실 수 있습니다",
						);
						$logger->info("포인트지급이 완료되었습니다. [마이페이지 - 포인트] 메뉴에서 확인하실 수 있습니다");
						echo json_encode($json_data);
					}
				}else{ // 이벤트 기준 미달
					$json_data = array(
						"result_code"=>"fail",
						"result_msg"=>"이벤트를 충족하지 못하였습니다. 구매 및 키활성화 완료 후 다시 시도해 주세요.",
					);
					$logger->info("이벤트를 충족하지 못하였습니다. 구매 및 키활성화 완료 후 다시 시도해 주세요.");
					echo json_encode($json_data);
					exit;
				}
				
			break;
			case "39": //#02 <풋볼 매니저 26> 사전 액세스 플레이 인증하기
				$logger->info("#02 <풋볼 매니저 26> 사전 액세스 플레이 인증 이벤트");
				$chk_event_member2 = $purchase_event->chkEventMemberLog($event_no,$m_no);
			
				//이벤트 참여이력 이력추가
				if($chk_event_member2<>"Y"){
					$purchase_event->setEventMemberLog($m_no,$m_id,$event_no,$member_data);
				}
						
				$json_data = array(
				"result_code"=>"request",
				"result_url"=>"https://forms.gle/LbkSuoDVhRyD7XFM7",
				);
				echo json_encode($json_data);
				exit;
			break;
		}
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>