<?php
//header('Content-Type: application/json');
header("Content-Type:text/html; charset=utf-8");
ini_set('display_errors', '1');

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/login_check.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_licence.xml');
$logger = Logger::getLogger("pc");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$is_delivery = filter_input(INPUT_POST, 'is_delivery', FILTER_SANITIZE_STRING);
$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
$address_detail = filter_input(INPUT_POST, 'address_detail', FILTER_SANITIZE_STRING);
$tel = filter_input(INPUT_POST, 'tel', FILTER_SANITIZE_STRING);

$ip = get_client_ip_env();
$m_id = $_SESSION['member']['m_id'];
$m_no = $_SESSION['member']['m_no'];

try{
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$mypage = new Mypage($conn_dgkr);
	$licence = new Licence($conn_dgkr);
	$asset = new Asset;
	
	$chk_data=$mypage->getGiftMember($idx);

	$response = [
		'msg' => ""
	];

	if($chk_data["status"]=="0"){
		if($is_delivery=="Y"){ //배송이 되는 사은품
			$mypage->updateGiftMemberAddress($idx,$name,$zipcode,$address,$address_detail,$tel,'1');
			$response['msg'] = "사은품 발송신청이 완료되었습니다.";
		} else { //키로 지급되는 사은품
			$asset_id = $chk_data["asset_id"];
			$po_id = "Gift-".$idx."-".$m_no;
			
			// 사은품 수령기간 추가 260526 KDY
			$add_where = " a.idx = {$chk_data['parent_idx']} and b.idx = {$idx}";
			$temp_list = $mypage->getGiftList(1, $add_where, " a.idx DESC", "");
			$temp_list = $temp_list->resultset->fetchAll();
			
			if (!$temp_list) {
				$response['msg'] = "잘못된 요청입니다.";
				echo json_encode($response);
				exit;
			}

			$exp_date = $temp_list[0]['address_enddt'];

			if ($exp_date != '') {
				$now_date = date("Y-m-d");
			
				if ($now_date > $exp_date) {
					$response['msg'] = "사은품 수령 기간이 지났습니다.";
					echo json_encode($response);
					exit;
				}
			}

			//키 예약
			$result = $asset->runReserveGift($po_id,$asset_id,$m_id);
			$result=json_decode($result);
			
			foreach($result->list as $key=>$value){
				$mypage->updateGiftMemberAsset($idx,$po_id,$asset_id,$value->reserveId,'3');
			}

			$reserve_id = $result->list[0]->reserveId;
			
			//캐시상품 여부 확인후 캐시지급(캐시지급이력)
			$asset_result = $asset->runReserve($reserve_id,$m_id);
			$key = explode("-",$asset_result->key);

			//캐시제품키 패턴 DIRECTG-CASH-금액-일렬번호
			if(trim($key[1])=="CASH" || trim($key[1])=="CASH" || trim($key[1])=="cash"){//캐시면 캐시지급
				$licence->setEmoney($m_no,"+",$key[2],"구매사은품",$asset_result->key,"ordno");
			}
			$response['msg'] = "사은품 지급이 완료되었습니다.";
		}
		//주문서 로그
	}else{
		$mypage->updateGiftMemberAddress($idx,$name,$zipcode,$address,$address_detail,$tel,'1');
		$response['msg'] = "이미 사은품신청이 완료된 주문건입니다.";
	}

	echo json_encode($response);
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>