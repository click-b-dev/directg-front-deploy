<?php
ini_set("display_errors",1);
//header('Content-Type: application/json');
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_licence.xml');
$logger = Logger::getLogger("pc");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$reserve_id = filter_input(INPUT_POST, 'reserve_id', FILTER_SANITIZE_NUMBER_INT);

$m_id = $_SESSION['member']['m_id'];
$m_no = $_SESSION['member']['m_no'];
$ip = get_client_ip_env();


$logger->info($m_id);
$logger->info($_POST);

if($_SESSION['member']["m_id"]==""){
	$result = array(
		"error_code"=>"98",
		"error_msg"=>"세션 종료",
	);
	$json = json_encode($result);
	echo $json;
	exit;
}

try{
	//리뉴얼DB
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	//기존DB
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	$goods = new Goods($conn);
	$order = new Order($conn);
	
	$licence = new Licence($conn);
	
	$asset = new Asset();
	$genba = new Genba("Live");
	$ztorm = new Ztorm();
	$vaultn = new Vaultn();
	
	
	
	switch($mode){
		case "setAssetActivate": //Asset 주문 키활성화
			$order_item_info = $order->getOrderItemOption($ordno);
			
			//주문완료가 아니면 키활성화 방지
			if($order_item_info['status']=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}
			
			$option_item_info = $goods->getGoodsItemDetail($order_item_info['product_code']);
			
			//수령가능일자가 안되면 키활성화 방지
			if($option_item_info['delivery_date']-time()>0){ //예약구매 상품(코드 발송전)
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}
			
			$order_item_asset = $order->getOrderItemAsset($order_item_info['ordno']);
			
			foreach($order_item_asset as $order_asset){
				//최초 1회 실행시 활성화
				$asset_result =$asset->runReserve($order_asset['reserve_id'],$order_asset['m_id']);
				$key = explode("-",$asset_result->key);

				/*캐시제품키 패턴 DIRECTG-CASH-금액-일렬번호*/
				if(trim($key[1])=="CASH" || trim($key[1])=="cash" || trim($key[1])=="CASH" || trim($key[1])=="POINT"){//포인트면 포인트지급
					$point_result = $licence->setRandomBoxEmoney($m_no,$key[2],$ordno);
					$logger->info($point_result);
					$logger->info($ordno."포인트지급완료");
				}
			}
			
			//키활성화 업데이트
			$licence->updateOrderItem($ordno,"1");

			//주문완료 구매 리워드 포인트 적립
			if($order_item_info['repay']>0){
				$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
			}

			$result = array(
				"error_code"=>"0",
				"error_msg"=>"ok",
			);
			
			$json = json_encode($result);
			echo $json;
			exit;
		break;
		case "getAssetLicence": //Asset 주문 키확인
			$order_item_info = $order->getOrderItemOption($ordno);

			if($order_item_info['status']=="2" && $order_item_info['is_actv']=="1"){
				$order_item_asset = $order->getOrderItemAsset($order_item_info['ordno']);

				$add_html = "<div class='list-group'>";
				foreach($order_item_asset as $order_asset){
					$asset_result =$asset->runReserve($order_asset['reserve_id'],$order_asset['m_id']);
					$logger->info($asset_result);

					$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text licence_key' style='font-size:14px'>".$asset_result->key."</p>";
					if($data['asset_id']=="950"){
						$add_html.= "<p><small>(www.callofduty.com/redeem 에서 제품 키 등록)</small></p>";
					}
					$add_html.="</li>";
					
				}
				$add_html.="</div>";

				$result = array(
					"error_code"=>"0",
					"error_msg"=>$add_html,
				);
				$json = json_encode($result);
			} else {
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"관리자에게 문의하세요.",
				);
				$json = json_encode($result);
			}

			echo $json;
			exit;
		break;
		case "setZtormActivate": //Ztorm 주문 키활성화
			$order_item_info = $order->getOrderItemOption($ordno);
			
			//주문완료가 아니면 키활성화 방지
			if($order_item_info['status']=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}
			
			$is_success = "1";
			$params = array(
				"RetailerOrderID"=>$ordno
			);
			$order_reponse = $ztorm->runGetOrder($params);
			$logger->info($order_reponse);
			
			foreach($order_reponse->Value->Order->Contents->OrderContent->CustomerProducts->CustomerProductID as $value){
				$params2 = array(
					"CustomerProductID"=>$value,
				);

				$installKey_reponse = $ztorm->runGetInstallKeys($params2);
				$logger->info($installKey_reponse);
			}
			
			
			if($is_success=="1"){
				//키활성화 업데이트
				$licence->updateOrderItem($ordno,"1");

				//주문완료 구매 리워드 포인트 적립
				if($order_item_info['repay']>0){
					$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
				}
				
				$result = array(
					"error_code"=>"0",
					"error_msg"=>"ok",
				);
				
				$json = json_encode($result);
				echo $json;
				exit;
			}
		break;
		case "getZtormLicence": //Ztorm 주문 키확인
			try{
				$order_item_info = $order->getOrderItemOption($ordno);
				
				$params = array(
					"RetailerOrderID"=>$ordno
				);
			
				//주문확인
				$order_reponse = $ztorm->runGetOrder($params);
				$logger->info($order_reponse);
				
				$add_html="<div class='list-group'>";
				foreach($order_reponse->Value->Order->Contents->OrderContent->CustomerProducts->CustomerProductID as $value){
					$params2 = array(
						"CustomerProductID"=>$value,
					);

					$installKey_reponse = $ztorm->runGetInstallKeys($params2);

					$logger->info($installKey_reponse);
					foreach($installKey_reponse->Value->InstallKey as $value2){
						$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$order_item_info['product_name']."</h4><p class='list-group-item-text licence_key' style='font-size:14px;padding-top:10px'>".$value2->Value." </p></li>";
					}
				}
				$add_html.="</div>";

				$result = array(
					"error_code"=>"0",
					"error_msg"=>$add_html,
				);
				$json = json_encode($result);
				echo $json;
				exit;
			}catch(\Ztorm\Api\ZtormException $e){
				//$API_ERROR_LOG = "/log/ztormapi_error";
				//echo $e->getMessage();
				//$ymd = date('Ymd');
				//error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
			}
		break;
		case "setGenbaActivate": //Genba 주문 키활성화
			$order_id = filter_input(INPUT_GET, 'order_id', FILTER_SANITIZE_STRING);
			
			$order_item_info = $order->getOrderItemOption($ordno);
			
			//주문완료가 아니면 키활성화 방지
			if($order_item_info['status']=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}

			$order_item_genba = $order->getOrderItemGenba($ordno);
			
			foreach($order_item_genba as $order_genba){
				$response = null;
				//Genba 고유 주문ID 우선(정확·1:1). 성공응답엔 State가 있고 에러(400/401/500)엔 Code만 있음
				if(!empty($order_genba['ID'])){
					$response = $genba->runGenbaGetOrderAsync($order_genba['ID']);
				}
				//ID가 없거나 정상주문(State)을 못받으면(주로 Code=2000 OBJECT_NOT_FOUND) CTID로 폴백
				if(!isset($response->State)){
					$response = $genba->runGenbaGetOrderByCtidAsync($order_genba['ClientTransactionID']);
				}
				$logger->info($response);
				$add_html="";
				switch($response->State){
					case "0": //Back Order(이월주문)
						$add_html.="주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
						$error_code="99";
					break;
					case "1": // Pre Order(예약주문)
						$add_html.="본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
						$error_code="99";
					break;
					case "2": // 키 전송완료
						if($order_item_info['repay']>0){
							$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
						}
						$licence->updateOrderItem($ordno,"1");
						$add_html="ok";
						$error_code="0";
					break;
					case "3": // 주문취소완료 (환불처리된건)
						$add_html="이미 환불처리가 완료된 주문입니다.";
						$error_code="99";
					break;
					case "4": // 주문API 처리 진행중
						$add_html="주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
						$error_code="99";
					break;
				}
			}
			$result = array(
				"error_code"=>$error_code,
				"error_msg"=>$add_html,
			);
			$json = json_encode($result);
			echo $json;
			exit;
			
			

			/*
			$response = $genba->runGenbaGetOrderAsync($order_id);
			$logger->info($response);
			
			switch($response->State){
				case "0": //Back Order(이월주문)
					echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
				break;
				case "1": // Pre Order(예약주문)
					echo "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
				break;
				case "2": // 키 전송완료
					//키 활성화 완료 업데이트
					
					//repay 포인트 지급 완료
					$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
				
					$result = array(
						"error_code"=>"0",
						"error_msg"=>"ok",
					);
					
					$json = json_encode($result);
					echo $json;
				break;
				case "3": // 주문취소완료 (환불처리된건)
					echo "이미 환불처리가 완료된 주문입니다.";
				break;
				case "4": // 주문API 처리 진행중
					echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
				break;
			}
			*/
			
		break;
		case "getGenbaLicence": //Genba 주문 키확인
			$order_item_genba = $order->getOrderItemGenba($ordno);
			
			foreach($order_item_genba as $order_genba){
				$response = null;
				//Genba 고유 주문ID 우선(정확·1:1). 성공응답엔 State가 있고 에러(400/401/500)엔 Code만 있음
				if(!empty($order_genba['ID'])){
					$response = $genba->runGenbaGetOrderAsync($order_genba['ID']);
				}
				//ID가 없거나 정상주문(State)을 못받으면(주로 Code=2000 OBJECT_NOT_FOUND) CTID로 폴백
				if(!isset($response->State)){
					$response = $genba->runGenbaGetOrderByCtidAsync($order_genba['ClientTransactionID']);
				}
				$logger->info($response);
				$add_html="";
				switch($response->State){
					case "0": //Back Order(이월주문)
						$add_html.="주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
					case "1": // Pre Order(예약주문)
						$add_html.="본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
					break;
					case "2": // 키 전송완료
						$add_html="<div class='list-group'>";
						foreach($response->Keys as $value){
							$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$value->ProductName."</h4><p class='list-group-item-text' id='licence_key'>".$value->Code."</p></li>";
							if(is_object($value->OtherDetails)){
								foreach($value->OtherDetails as $sub_value){
									$add_html.="<li>".$sub_value->Name." : ".$sub_value->Value."</li>";
								}
							}
						}
						$add_html.="</div>";
					break;
					case "3": // 주문취소완료 (환불처리된건)
						$add_html="이미 환불처리가 완료된 주문입니다.";
					break;
					case "4": // 주문API 처리 진행중
						$add_html="주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
				}
			}
			$result = array(
				"error_code"=>"0",
				"error_msg"=>$add_html,
			);
			$json = json_encode($result);
			echo $json;
			exit;
		break;
		case "setPointNexusActivate": //PointNexus 주문 키수령(활성화)
			$order_item_info = $order->getOrderItemOption($ordno);
			$order_item_pointnexus = $order->getOrderItemPointNexus($ordno);

			//주문완료가 아니면 키활성화 방지
			if($order_item_info['status']=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);
				echo $json;
				exit;
			}

			if(!empty($order_item_pointnexus)){
				$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
				$licence->updateOrderItem($ordno,"1");
				$result = array(
					"error_code"=>"0",
					"error_msg"=>"ok",
				);
			} else {
				$result = array(
					"error_code"=>"1",
					"error_msg"=>"실패",
				);
			}

			$json = json_encode($result);
			echo $json;
			exit;
		break;

		case "setVaultnActivate": //Vaultn 주문 키활성화
			$order_item_info = $order->getOrderItemOption($ordno);
			$order_item_vaultn = $order->getOrderItemVaultn($ordno);

			//주문완료가 아니면 키활성화 방지
			if($order_item_info['status']=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}
			
			if(!empty($order_item_vaultn)){
				$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
				$licence->updateOrderItem($ordno,"1");
				$result = array(
					"error_code"=>"0",
					"error_msg"=>"ok",
				);
			} else {
				$result = array(
					"error_code"=>"1",
					"error_msg"=>"실패",
				);
			}
			
			$json = json_encode($result);
			echo $json;
			exit;

			/*
			if(!empty($order_item_vaultn)){
				//주문완료가 아니면 키활성화 방지
				if($order_item_info['status']=="9"){
					$result = array(
						"error_code"=>"99",
						"error_msg"=>"이미 취소가 완료된 주문건입니다.",
					);
					$json = json_encode($result);

					echo $json;
					exit;
				}
				
				if($order_id){
						$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
						$result = array(
							"error_code"=>"0",
							"error_msg"=>"ok",
						);
						
						$json = json_encode($result);
						echo $json;
				} else {
						$result = array(
							"error_code"=>"1",
							"error_msg"=>"실패",
						);
						$json = json_encode($result);
						echo $json;
				}
			}
			*/

/*
			$response = $vaultn->runRetrieveOrder($order_id);
			$logger->info($response);
			
			switch($response->status){
				case "BackOrder": //Back Order(이월주문)
					echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
				break;
				case "PreOrder": // Pre Order(예약주문)
					echo "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
				break;
				case "Completed": // 키 전송완료
					//키 활성화 완료 업데이트
					
					//repay 포인트 지급 완료
					$licence->setOrderEmoney($ordno,$m_no,$order_item_info['repay']);
					
					$result = array(
						"error_code"=>"0",
						"error_msg"=>"ok",
					);
					
					$json = json_encode($result);
					echo $json;
				break;
				case "Cancelled": // 주문취소완료 (환불처리된건)
					echo "이미 환불처리가 완료된 주문입니다.";
				break;
				case "4": // 주문API 처리 진행중
					echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
				break;
			}
*/
		break;
		case "getPointNexusLicence": //PointNexus 주문 키확인 — 라이브 조회(Option A): DB 저장값 대신 PointNexus에서 직접 조회
			$order_item_pointnexus = $order->getOrderItemPointNexus($ordno);
			$add_html = "";
			foreach($order_item_pointnexus as $row){
				//sold/confirmed/pending_reveal은 PointNexus 라이브 조회 (실패 시 DB 폴백)
				$view = OrderFulfillment_PointNexus::fetchLicenseForView($conn, $row, $logger);
				switch($view['status']){
					case 'sold':
					case 'confirmed':
						if(!empty($view['license_key'])){
							$add_html .= "<div class='list-group'>";
							$add_html .= "<li class='list-group-item'>";
							$add_html .= "<h4 class='list-group-item-heading'>".htmlspecialchars($row['Name'])."</h4>";
							$add_html .= "<p class='list-group-item-text' id='licence_key'>".htmlspecialchars($view['license_key'])."</p>";
							if(!empty($view['license_platform'])){
								$add_html .= "<p><small>플랫폼: ".htmlspecialchars($view['license_platform'])."</small></p>";
							}
							$add_html .= "</li>";
							$add_html .= "</div>";
						}else{
							$add_html .= "키 정보를 확인하는 중입니다. 잠시 후 다시 시도해 주세요.";
						}
					break;
					case 'booked':
						$add_html .= "가상계좌 입금 대기 중인 주문입니다. 입금 완료 후 키가 발급됩니다.";
					break;
					case 'pending_reveal':
						$add_html .= "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
					break;
					case 'canceled':
						$add_html .= "이미 환불처리가 완료된 주문입니다.";
					break;
					case 'failed':
						$add_html .= "주문 처리 중 오류가 발생했습니다. 고객센터로 문의해 주세요.";
					break;
					default:
						$add_html .= "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
				}
			}
			$result = array(
				"error_code"=>"0",
				"error_msg"=>$add_html,
			);
			$json = json_encode($result);
			echo $json;
			exit;
		break;

		case "getVaultnLicence": //Vaultn 주문 키확인

			$order_item_vaultn = $order->getOrderItemVaultn($ordno);
			$add_html="";
			foreach($order_item_vaultn as $order_vaultn){
				$response = $vaultn->runRetrieveOrder($order_vaultn['orderId']);
				$logger->info($response);
				
				switch($response->status){
					case "BackOrder": //Back Order(이월주문)
						$add_html.="주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
					case "PreOrder": // Pre Order(예약주문)
						$add_html.="본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
					break;
					case "Completed": // 키 전송완료
						$add_html.="<div class='list-group'>";
						foreach($response->orderItemDetails->orderItemContent as $orderItem){
							foreach($orderItem->serials as $serials){
								$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'></h4><p class='list-group-item-text' id='licence_key'>".$serials->keycode."</p></li>";
							}
						}
						$add_html.="</div>";
					break;
					case "Cancelled": // 주문취소완료 (환불처리된건)
						$add_html.="이미 환불처리가 완료된 주문입니다.";
					break;
					case "4": // 주문API 처리 진행중
						$add_html.="주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
				}
			}
			$result = array(
				"error_code"=>"0",
				"error_msg"=>$add_html,
			);
			$json = json_encode($result);
			echo $json;
			exit;
		break;
		
		case "getGiftView":
			$asset_result = $asset->runReserve($reserve_id,$m_id);
			$logger->info($asset_result);

			$add_html = "<div class='list-group'>";
			$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text' style='font-size:14px'>".$asset_result->key."</p><p> <small>제품키 활성화 : (".$asset_result->activatedDt.")</small></p></li>";
			$add_html.="</div>";

			$licence_kr = new Licence($conn_dgkr);
			$licence_kr->updateEventGiftMember($reserve_id,$asset_result->activatedDt);
			
			$result = array(
				"error_code"=>"0",
				"error_msg"=>$add_html,
			);
			$json = json_encode($result);
			echo $json;
			exit;
		break;

		case "getGiftActive":
			$asset->runReserve($reserve_id,$m_id);
			$licence->updateOrderGiftActive($ordno);

			$result = array(
				"error_code"=>"0",
				"error_msg"=>"ok",
			);
			$json = json_encode($result);
			echo $json;
			exit;
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>