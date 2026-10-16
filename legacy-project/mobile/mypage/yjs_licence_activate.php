<?php
ini_set("display_errors",1);
//header('Content-Type: application/json');
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_licence.xml');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$ordno = filter_input(INPUT_POST, 'ordno', FILTER_SANITIZE_STRING);
$reserve_id = filter_input(INPUT_POST, 'reserve_id', FILTER_SANITIZE_NUMBER_INT);
$zt_mem_id = filter_input(INPUT_POST, 'zt_mem_id', FILTER_SANITIZE_NUMBER_INT);
$zt_item_id = filter_input(INPUT_POST, 'zt_item_id', FILTER_SANITIZE_NUMBER_INT);
$zt_ord_no = filter_input(INPUT_POST, 'zt_ord_no', FILTER_SANITIZE_NUMBER_INT);
$pre_order = filter_input(INPUT_POST, 'pre_order', FILTER_SANITIZE_STRING);
$supp_cd = filter_input(INPUT_POST, 'supp_cd', FILTER_SANITIZE_STRING);
$settle_no = filter_input(INPUT_POST, 'settle_no', FILTER_SANITIZE_STRING);
$preorder_free = filter_input(INPUT_POST, 'preorder_free', FILTER_SANITIZE_STRING);
$asset_id = filter_input(INPUT_POST, 'asset_id', FILTER_SANITIZE_STRING);
$vaultn_order_id = filter_input(INPUT_POST, 'orderid', FILTER_SANITIZE_STRING);

$logger = Logger::getLogger("mobile");
$logger->info($_POST);

$is_genba_mode="Live";

$m_id = $_SESSION['member']['m_id'];
$m_no = $_SESSION['member']['m_no'];
$ip = get_client_ip_env();


try{
	$conn = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$licence = new Licence($conn);
	$ztorm = new Ztorm;
	$asset = new Asset;

	switch($mode){
		case "setZtormActivate":	//Ztorm키 활성화 getInstallKey 호출
			try{
				$data = $licence->getOrderItem($ordno);
				$status = $data['status'];

				if($status=="9"){
					$result = array(
						"error_code"=>"99",
						"error_msg"=>"이미 취소가 완료된 주문건입니다.",
					);
					$json = json_encode($result);

					echo $json;
					$logger->info($json);
					exit;
				}

				switch($supp_cd){
					case "2":
						$params = array(
							"RetailerOrderID"=>$ordno
						);
						
						//주문확인
						$order_reponse = $ztorm->runGetOrder($params);

						$logger->info($order_reponse);
						
						foreach($order_reponse->Value->Order->Contents->OrderContent->CustomerProducts->CustomerProductID as $value){
							$params2 = array(
								"CustomerProductID"=>$value,
							);

							$logger->info($params2);

							$installKey_reponse = $ztorm->runGetInstallKeys($params2);
							$logger->info($installKey_reponse);
						}

						//키 활성화 시작
						$logger->info("[response] GetInstallKeys - setZtormActivate :".$installKey_reponse);

						$success = true;
						$msg = "ok";
						$error_code = "0";
					break;

					case "3": //ztorm-IPA
						$params = array(
							"CustomerProductID"=>$zt_ord_no,
							"CustomerIP"=>$ip
						);

						$order_response = $ztorm->runFulfillProviderOrder($params);
						$logger->info("[response] FulfillProviderOrder - runFulfillProviderOrder :".$order_response);

						if($order_response->ErrorCode=="0"){
							$success = true;
							$msg = "ok";
							$error_code = "0";
						}else{
							$success = false;
							$msg = $order_response->ErrorMsg;
							$error_code = $order_response->ErrorCode;
						}
					break;
				}

				$logger->info($error_code);
				$logger->info($status);
				
				if($error_code=="0"){
					if($status=="2"){
						//키 확인 처리
						$licence->updateLicence($ordno);
						$logger->info($ordno);
					}
					//포인트 적립
					$licence->setOrderEmoney($ordno,$m_no);
					
					$result = array(
						"error_code"=>$error_code,
						"error_msg"=>$msg,
					);
				}else{
					if($error_code=="3016"){
						$result = array(
						"error_code"=>$error_code,
						"error_msg"=>'출시 전 상품으로 현재 유플레이 계정 연동이 불가합니다.',
						);
					}else{
						$result = array(
						"error_code"=>$error_code,
						"error_msg"=>'제품 활성화에 실패하였습니다.자세한 사항은 고객지원에 문의해 주시기 바랍니다.',
						);
					}
				}
				$json = json_encode($result);
				$logger->info($json);
				echo $json;
			}catch(\Ztorm\Api\ZtormException $e){
				$API_ERROR_LOG = "/log/ztormapi_error";
				//echo $e->getMessage();
				$ymd = date('Ymd');
				error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
				$logger->debug($e);
			}
		break;

		case "setActivate": //자체상품 키 활성화
			//예약판매 상품은 pre_order 종료후 키 활성화 가능
			$headers = apache_request_headers();
			$logger->info($headers);

			$data = $licence->getOrderItem($ordno);
			$status = $data['status'];

			if($status=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}

			if($pre_order=="y" && $preorder_free=="N"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.",
				);
			}else{
				//최초 1회 실행시 활성화
				if($supp_cd=="4"){	//번들
					$bundle_result = $licence->getOrderBundleItem($ordno);
					foreach($bundle_result as $bundle_data){
						$asset->runReserve($bundle_data['reserve_id'],$m_id);
					}
				}elseif($supp_cd=="6"){
					$asset_result = $asset->runReserve($reserve_id,$m_id);
					$logger->info($asset_result);
					$key = explode("-",$asset_result->key);
					
					/*캐시제품키 패턴 DIRECTG-CASH-금액-일렬번호*/
					if(trim($key[1])=="CASH" || trim($key[1])=="cash" || trim($key[1])=="CASH" || trim($key[1])=="POINT"){//포인트면 포인트지급
						$point_result = $licence->setRandomBoxEmoney($m_no,$key[2],$ordno);
						$logger->info($point_result);
						$logger->info($ordno."포인트지급완료");
					}

				}else{ //단일
					$asset->runReserve($reserve_id,$m_id);
				}

				if($status=="2"){
				//키 확인 처리
					$licence->updateLicence($ordno);
					$logger->info($ordno);
				}
				
				//포인트 적립
				$licence->setOrderEmoney($ordno,$m_no);

				$result = array(
					"error_code"=>"0",
					"error_msg"=>"ok",
				);
			}

			$json = json_encode($result);
			echo $json;
			$logger->info($json);
		break;

		case "setGenbaActivate": //Genba 키 활성화
			$data = $licence->getOrderItem($ordno);
			$status = $data['status'];
			$is_lic_actv = $data['is_lic_actv'];

			//중복주문 호출방지
			if($is_lic_actv=="1"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 키 활성화가 완료된 주문건입니다. 새로고침(F5) 이후에 키확인을 통해서 제품키를 확인해 주세요."
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}//end of if

			if($status=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}

			//주문할 상품sku 조회
			
			$genba = new Genba($is_genba_mode);
			$genba_log=$licence->getGenbaLog($ordno);
			$genba_item = $licence->getOrderGenba($ordno);
			$logger->info($genba_item);

			if($genba_item["ID"]){ //이미 겐바주문예약완료 상태시
				switch($genba_item["State"]){
					case "0": //Back-Order
						$response = $genba->runGenbaGetOrderAsync($genba_item["ID"]);
						switch($response->State){
							case "0": //Back Order(품절시 발생)
								$is_activate="0";
								$error_code = "99";
								$error_msg = "현재 일시 품절로 재입고 대기 중입니다. 자세한 사항은 고객지원에 문의 부탁드립니다.";
							break;
							case "1": // Pre Order(예약주문)
								$is_activate="0";
								$error_code = "99";
								$error_msg = "해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.";
							break;
							case "2": // 키 전배송완료
								$is_activate="1";
								$licence->updateLicence($ordno);

								//포인트 적립
								$licence->setOrderEmoney($ordno,$m_no);

								$message = "[DELIVERED] 키 배송 완료";
								$licence->setOrderLog($settle_no,$ordno,$message);
								$logger->info($settle_no);
								$logger->info($ordno);
								$logger->info($message);

								$error_code = "0";
								$error_msg = "OK";
							break;
							case "3": // 주문취소완료 (환불처리된건)
								$error_code = "99";
								$error_msg = "이미 환불처리가 완료된 주문입니다.";
							break;
							case "4": // 주문API 처리 진행중
								$error_code = "99";
								$error_msg = "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
							break;
						}
						$result = array(
							"error_code"=>$error_code,
							"error_msg"=>$error_msg,
						);
					break;
					case "1":
						$response = $genba->runGenbaGetOrderAsync($genba_item["ID"]);
						switch($response->State){
							case "1": // Pre Order(예약주문)
								$is_activate="0";
								$error_code = "99";
								$error_msg = "해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.";
							break;
							case "2": // 키 전배송완료
								$is_activate="1";
								$licence->updateLicence($ordno);

								//포인트 적립
								$licence->setOrderEmoney($ordno,$m_no);

								$message = "[DELIVERED] 키 배송 완료";
								$licence->setOrderLog($settle_no,$ordno,$message);
								$logger->info($settle_no);
								$logger->info($ordno);
								$logger->info($message);

								$error_code = "0";
								$error_msg = "OK";
							break;
							case "3": // 주문취소완료 (환불처리된건)
								$error_code = "99";
								$error_msg = "이미 환불처리가 완료된 주문입니다.";
							break;
						}
						$result = array(
							"error_code"=>$error_code,
							"error_msg"=>$error_msg,
						);
					break;
					case "2": //미수령 주문사전처리
						$is_activate="1";
						$licence->updateLicence($ordno);

						//포인트 적립
						$licence->setOrderEmoney($ordno,$m_no);

						$message = "[DELIVERED] 키 배송 완료";
						$licence->setOrderLog($settle_no,$ordno,$message);
						$logger->info($settle_no);
						$logger->info($ordno);
						$logger->info($message);

						$result = array(
							"error_code"=>"0",
							"error_msg"=>"OK",
						);
					break;
				}

				$logger->info($result);

				$json = json_encode($result);
				echo $json;
				exit;
			}

			if($pre_order=="y"){//예약판매시
				if($is_lic_actv=="0"){ //첫 활성화시에만 겐바주문예약실행
					$logger->info("Genba PlaceOrderAsync 예약주문시작");
					$reservationid = "";
					$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$genba_log['Sku'],$genba_log['price'],$genba_log['goods_ppr'],$ip);
					$logger->info($order_response);
					$logger->info("Genba PlaceOrderAsync 예약주문완료");

					if($order_response->ID){
						/*Genba주문결과저장*/
						$licence->ReservationIDsetOrderGenba($ordno,$order_response->ClientTransactionID,$order_response->Sku,$order_response->Created,$order_response->Expiration,$order_response->State,$order_response->CommunicatedBuyingPrice->Amount,$order_response->ActualBuyingPrice->Amount,$order_response->SellingPrice->NetAmount,$order_response->SellingPrice->GrossAmount,$order_response->ReservationID,$order_response->ID);

						$is_activate = "0";

						$error_code = "99";
						$error_msg = "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";

						$licence->updateLicence($ordno,'2');
					}else{
						//예약주문실패시
						$is_activate = "0";
						$error_code =  $order_response->Code;
						$error_msg =  $order_response->Details;

						$message = "[".$error_code."] ".$error_msg;
						$licence->setOrderLog($settle_no,$ordno,$message);
						$logger->info($settle_no);
						$logger->info($ordno);
						$logger->info($message);
					}
				}else{
					if($is_lic_actv=="2"){ //겐바예약주문이 완료된 상태의 키활성화
						//주문상태체크
						$response = $genba->runGenbaGetOrderAsync($genba_item["ID"]);
						switch($response->State){
							case "0": //Back Order(품절시 발생)
								$is_activate="0";
								$error_code = "99";
								$error_msg = "일시품절된 상품입니다. 고객센터에 문의바랍니다.";
							break;
							case "1": // Pre Order(예약주문)
								$is_activate="0";
								$error_code = "99";
								$error_msg = "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
							break;
							case "2": // 키 전배송완료
								$is_activate="1";
								$licence->updateLicence($ordno);
								
								//키배송이 완료되면 포인트를 지급해 준다.
								$licence->setOrderEmoney($ordno,$m_no);
							break;
							case "3": // 주문취소완료 (환불처리된건)
								$error_code = "99";
								$error_msg = "이미 환불처리가 완료된 주문입니다.";
							break;
							case "4": // 주문API 처리 진행중
								$error_code = "99";
								$error_msg = "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
							break;
						}
						
					}
				}

				$result = array(
					"error_code"=>$error_code,
					"error_msg"=>$error_msg,
				);
			}else{ //일반판매
				$logger->info("Genba PlaceReservationAsync 주문예약시작");
				$reservation_response = $genba->runGenbaPlaceReservationAsync($genba_log['Sku'],$genba_log['price'],$genba_log['goods_ppr'],$ip);
				$reservationid = $reservation_response->ID;
				$logger->info($reservation_response);
				$logger->info("Genba PlaceReservationAsync 주문예약완료");
				
				if($reservationid){ //주문예약 성공시
					/*Genba주문예약결과저장*/
					
					$licence->ReservationIDsetOrderGenba($ordno,$reservation_response->ClientTransactionID,$reservation_response->Sku,$reservation_response->Created,$reservation_response->Expiration,$reservation_response->State,$reservation_response->CommunicatedBuyingPrice->Amount,$reservation_response->ActualBuyingPrice->Amount,$reservation_response->SellingPrice->NetAmount,$reservation_response->SellingPrice->GrossAmount,$reservation_response->ID);

					$logger->info("Genba PlaceOrderAsync 주문시작");
					$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$genba_log['Sku'],$genba_log['price'],$genba_log['goods_ppr'],$ip);
					$logger->info($order_response);
					$logger->info("Genba PlaceOrderAsync 주문완료");

					//Genba 주문결과 업데이트
					$licence->updateOrderGenba($order_response->State,$order_response->ID,$ordno);
				}else{ //주문예약 실패시
					$is_activate = "0";
					$error_code =  $reservation_response->Code;
					$error_msg =  $reservation_response->Details;

					if($error_code=="2007"){ //This SKU is temporarily out of stock
						$logger->info("Genba PlaceOrderAsync Back-Order 시작");
						$reservationid = "";
						$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$genba_log['Sku'],$genba_log['price'],$genba_log['goods_ppr'],$ip);
						$logger->info($order_response);
						$logger->info("Genba PlaceOrderAsync Back-Order 완료");
						
						if($order_response->ID){
							$licence->ReservationIDsetOrderGenba($ordno,$order_response->ClientTransactionID,$order_response->Sku,$order_response->Created,$order_response->Expiration,$order_response->State,$order_response->CommunicatedBuyingPrice->Amount,$order_response->ActualBuyingPrice->Amount,$order_response->SellingPrice->NetAmount,$order_response->SellingPrice->GrossAmount,$order_response->ReservationID,$order_response->ID);
							$licence->updateLicence($ordno,'2');
						}
					}

					$message = "[".$error_code."] ".$error_msg;
					$licence->setOrderLog($settle_no,$ordno,$message);
					$logger->info($settle_no);
					$logger->info($ordno);
					$logger->info($message);
				}

				if($order_response->ID){
					switch($order_response->State){
						case "0": //Back Order(품절시 발생)
							$is_activate = "0"; 
							$error_code = "99";
							$error_msg = "일시품절된 상품입니다. 고객센터에 문의바랍니다.";
						break;
						case "1": // Pre Order(예약주문)
							$is_activate = "0"; 
							$error_code = "99";
							$error_msg = "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
						break;
						case "2": // 키 전송완료
							$is_activate = "1"; 
						break;
						case "3": // 주문취소완료 (환불처리된건)
							$is_activate = "1"; 
							$error_code = "99";
							$error_msg = "이미 환불처리가 완료된 주문입니다.";
						break;
						case "4": // 주문API 처리 진행중
							$is_activate = "1"; 
							$error_code = "99";
							$error_msg = "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
						break;
					}
				}

				if($is_activate=="1"){
					//키 활성화 처리
					$licence->updateLicence($ordno);
					$logger->info($ordno);

					//포인트 적립
					$licence->setOrderEmoney($ordno,$m_no);

					$result = array(
						"error_code"=>"0",
						"error_msg"=>"ok",
					);
				}else{
					$result = array(
						"error_code"=>$error_code,
						"error_msg"=>$error_msg,
					);
				}
			}

			$json = json_encode($result);
			$logger->info($result);

			echo $json;
			exit;
		break;

		case "setVaultnActivate":
			$data = $licence->getOrderItem($ordno);

			$is_lic_actv = $data['is_lic_actv'];
			$status = $data['status'];
			$goods_code = $data['product_code'];

			//중복주문 호출방지
			if($is_lic_actv=="1"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 키 활성화가 완료된 주문건입니다. 새로고침(F5) 이후에 키확인을 통해서 제품키를 확인해 주세요."
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}//end of if

			if($status=="9"){
				$result = array(
					"error_code"=>"99",
					"error_msg"=>"이미 취소가 완료된 주문건입니다.",
				);
				$json = json_encode($result);

				echo $json;
				exit;
			}

			//주문할 상품sku 조회
			
			$vaultn_log = $licnece->getVaultnLog($ordno);

			$sku=$vaultn_log['Sku'];
			$currencyCode="KRW";
			$salesPriceGross=$vaultn_log['price'];
			$salesPriceNet=$vaultn_log['goods_ppr'];
			$clientOrderReference=$ordno;
			$clientCustomerReference=$m_no;
			$immediateFulfilment=TRUE; //키 활성화 한 상태로 주문
			$mustFulfil=0; //재고가 없어도 Backorder가 되어야 함
			$salesCountryCode="KR";
			$orderType=1; //reservation이 필요 없고 무조건 order로 주문

			$appliedDiscountPercentage="";
			$appliedDiscountAmount="";
			$agreementGUID="";
			$priceListGuid="";
			$keylessSuccessEndPoint="";
			$keylessFailureEndPoint="";

			$logger->info($sku);
			$logger->info($ip);
			$logger->info($currencyCode);
			$logger->info($salesPriceGross);
			$logger->info($salesPriceNet);
			$logger->info($clientOrderReference);
			$logger->info($clientCustomerReference);
			$logger->info($immediateFulfilment);
			$logger->info($mustFulfil);
			$logger->info($salesCountryCode);
			$logger->info($orderType);
			$logger->info($appliedDiscountPercentage);
			$logger->info($appliedDiscountAmount);
			$logger->info($agreementGUID);
			$logger->info($priceListGuid);

			//주문API 중복방지
			$vaultn_chk = $licence->getOrderVaultn($ordno);

			$logger->info($vaultn_chk);
			
			$vaultn = new Vaultn("");

			if($vaultn_chk["orderId"]){ //이미 주문완료인 경우 (관리자가 주문을 넣었을 경우)
				$response = $vaultn->runRetrieveOrder($vaultn_chk["orderId"]);
				if($response->status == $vaultn_chk["status"]){
					switch($response->status){
						case "Pending":
							$result=$vaultn->runCompleteReservation($vaultn_chk["orderId"]); //Pending->Complete
							if($result->status){
								$licence->updateOrderVaultn($result->status,DATE("Y-m-d H:i:s"),$result->orderItemDetails->fulfilmentStatus,$result->orderId);

								$error_code = "0";
								$error_msg = "OK";
							}
						break;
						case "Completed":
							if($response->orderItemDetails->fulfilmentStatus != $vaultn_chk['fulfilmentStatus']){
								$licence->updateOrderVaultn($result->status,DATE("Y-m-d H:i:s"),$result->orderItemDetails->fulfilmentStatus,$result->orderId);

								$error_code = "0";
								$error_msg = "OK";
							}
							switch($response->orderItemDetails->fulfilmentStatus){
								case "Fulfilled":
									$message = "[DELIVERED] 키 배송 완료";
									$licence->setOrderLog($settle_no,$ordno,$message);
									$logger->info($settle_no);
									$logger->info($ordno);
									$logger->info($message);
									
									$licence->updateLicence($ordno);

									//포인트 적립
									$licence->setOrderEmoney($ordno,$m_no);

									$error_code = "0";
									$error_msg = "OK";
								break;
								case "NotFulfilled":
									$message = "[DELIVERED] 키 배송되지 않음";
									$licence->setOrderLog($settle_no,$ordno,$message);
									$logger->info($settle_no);
									$logger->info($ordno);
									$logger->info($message);

									$error_code = "0";
									$error_msg = "OK";
								break;
								case "RequestedNotFulfilled":
									$is_activate="0";
									$error_code = "99";
									$error_msg = "해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.";
								break;
								case "Cancel": // 주문취소완료 (환불처리된건)
									$error_code = "99";
									$error_msg = "이미 환불처리가 완료된 주문입니다.";
								break;
							}
						break;
						case "BackOrder":
							$is_activate="0";
							$error_code = "99";
							$error_msg = "해당 상품은 품절으로 추후 공지사항을 통해 안내할 예정입니다.";
						break;
						case "PreOrder":
							$is_activate="0";
							$error_code = "99";
							$error_msg = "해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.";
						break;
						case "Cancelled": // 취소된 주문
							$is_activate="0";
							$error_code = "99";
							$error_msg = "취소가 완료된 주문입니다.";
						break;
						default:
							$error_code = "99";
							$error_msg = "관리자에게 문의해 주세요.";
						break;
					}
				} else {
					switch($response->status){
						case "Pending":
							$result=$vaultn->runCompleteReservation($vaultn_chk["orderId"]); //Pending->Complete
							if($result->status){
								$licence->updateOrderVaultn($result->status,DATE("Y-m-d H:i:s"),$result->orderItemDetails->fulfilmentStatus,$result->orderId);

								$error_code = "0";
								$error_msg = "OK";
							}
						break;
						case "Completed":
							switch($response->orderItemDetails->fulfilmentStatus){
								case "Fulfilled":
									$message = "[DELIVERED] 키 배송 완료";
									$licence->setOrderLog($settle_no,$ordno,$message);
									$logger->info($settle_no);
									$logger->info($ordno);
									$logger->info($message);
									$licence->updateLicence($ordno);

									//포인트 적립
									$licence->setOrderEmoney($ordno,$m_no);

									$error_code = "0";
									$error_msg = "OK";
								break;
								case "NotFulfilled":
									$message = "[DELIVERED] 키 배송되지 않음";
									$licence->setOrderLog($settle_no,$ordno,$message);
									$logger->info($settle_no);
									$logger->info($ordno);
									$logger->info($message);

									$error_code = "99";
									$error_msg = "해당 상품은 품절으로 추후 공지사항을 통해 안내할 예정입니다.";
								break;
								case "RequestedNotFulfilled":
									$is_activate="0";
									$error_code = "99";
									$error_msg = "해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.";
								break;
								case "Cancel": // 주문취소완료 (환불처리된건)
									$error_code = "99";
									$error_msg = "이미 환불처리가 완료된 주문입니다.";
								break;
							}
						break;
						case "BackOrder":
							$is_activate="0";
							$error_code = "99";
							$error_msg = "해당 상품은 품절으로 추후 공지사항을 통해 안내할 예정입니다.";
						break;
						case "PreOrder":
							$is_activate="0";
							$error_code = "99";
							$error_msg = "해당 상품은 예약 판매 중으로 실제 제품 코드(키) 발송은 추후 공지사항을 통해 안내할 예정입니다.";
						break;
						case "Cancelled": // 취소된 주문
							$is_activate="0";
							$error_code = "99";
							$error_msg = "취소가 완료된 주문입니다.";
						break;
						default:
							$error_code = "99";
							$error_msg = "관리자에게 문의해 주세요.";
						break;
					}
					$licence->updateOrderVaultn($result->status,DATE("Y-m-d H:i:s"),$result->orderItemDetails->fulfilmentStatus,$result->orderId);
				}
				$result = array(
					"error_code"=>$error_code,
					"error_msg"=>$error_msg,
				);
				$logger->info($result);

				$json = json_encode($result);
				echo $json;
				exit;
			} else {	//최초 주문 생성
				$result=$vaultn->runCreateReservation($sku,$ipAddress,$currencyCode,$salesPriceGross,$salesPriceNet,$appliedDiscountPercentage,$appliedDiscountAmount,$clientOrderReference,$clientCustomerReference,$agreementGUID,$priceListGuid,$immediateFulfilment,$mustFulfil,$salesCountryCode,$orderType,$keylessSuccessEndPoint,$keylessFailureEndPoint);
				$logger->info($result);

				if($result->orderId){ //주문 성공했을 경우
					$licence->setOrderVaultn($result);

					$result=$vaultn->runCompleteReservation($result->orderId); //Pending->Complete (예판일 경우 PreOrder)
					$logger->info($result);
				} else {
					$message = "[주문실패]";
					$licence->setOrderLog($settle_no,$ordno,$message);
					$logger->info($settle_no);
					$logger->info($ordno);
					$logger->info($message);
				}

				if($result->status){
					$licence->updateOrderVaultn($result->status,DATE("Y-m-d H:i:s"),$result->orderItemDetails->fulfilmentStatus,$result->orderId);
				}

				if($result->status=="Completed"){
					$is_activate="1";
					$licence->updateLicence($ordno);

					//포인트 적립
					$licence->setOrderEmoney($ordno,$m_no);

					$result = array(
						"error_code"=>"0",
						"error_msg"=>"OK",
					);

				} else if($result->status=="PreOrder"){
					$is_activate="0";

					$result = array(
						"error_code"=>"99",
						"error_msg"=>"본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.",
					);
				} else {
					$is_activate="0";
					//24-11-28(목) 18:07 [이종석] 주문이 실패한 경우
					$result = array(
						"error_code"=>"99",
						"error_msg"=>"현재 일시 품절로 재입고 대기 중입니다. 자세한 사항은 고객지원에 문의 부탁드립니다.",
					);
				}
			}

			$json = json_encode($result);
			$logger->info($result);

			//24-11-12(화) 16:02 [이종석] tbl_goods_gift에 사은품 추가가 되어 있는 상품인 경우 사은품도 주문함

			$order_gift = $licence->getOrderGift($goods_code);

			$logger->info($order_gift);

			foreach($order_gift as $gift_data){
				$logger->info($gift_data);
				if($gift_data['gift_yn']=="y"){
					if (($gift_data['period_limit'] == "n") || ($gift_data['period_limit'] == "y" && date("Y-m-d H:i:s") > $gift_data['start_dt'] && date("Y-m-d H:i:s") < $gift_data['end_dt'])){
						$gift_result=$vaultn->runCreateReservation(trim($gift_data['sku']),$ipAddress,$currencyCode,0,0,0,0,$clientOrderReference,$clientCustomerReference,$agreementGUID,$priceListGuid,$immediateFulfilment,$mustFulfil,$salesCountryCode,$orderType,$keylessSuccessEndPoint,$keylessFailureEndPoint);
						$logger->info($gift_result);

						if($gift_result->orderId){ //주문 성공했을 경우
							$licence->setOrderGift($ordno,$gift_data['gift_nm'],$m_id,$m_no,$gift_data['sku'],$gift_result->orderId,$gift_result->status,$gift_result->orderItemDetails->fulfilmentStatus);
						}

						$gift_complete=$vaultn->runCompleteReservation($gift_result->orderId); //Pending->Complete (예판일 경우 PreOrder)
						$logger->info($gift_complete);

						if($gift_complete->status){
							$active_dt = $gift_result->created;
							$datetime = new DateTime($active_dt);
							$datetime = $datetime->format('Y-m-d H:i:s');
							$licence->updateOrderGift($gift_complete->status,$datetime,$gift_complete->orderItemDetails->fulfilmentStatus,$gift_complete->orderId);
						}
					}
				}
			}
			echo $json;
			exit;
		break;


	case "getLicence":
		switch($supp_cd){
			case "1":
				$data = $licence->getOrderItem($ordno);
				$status = $data['status'];
				$reserveId = $data['reserve_id'];
				
				$logger->info($ordno);
				$asset_result = $asset->runReserve($reserveId,$m_id);
				$logger->info($asset_result);

				$add_html = "<div class='list-group'>";
				$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text licence_key' style='font-size:14px'>".$asset_result->key."</p><p> <small>제품키 활성화 : (".$asset_result->activatedDt.")</small></p>";
				if($data['asset_id']=="950"){
					$add_html.= "<p><small>(www.callofduty.com/redeem 에서 제품 키 등록)</small></p>";
				}
				$add_html.="</li>";
				$add_html.="</div>";
				
				echo $add_html;
			break;
			case "4":
				$bundle_result=$licence->getOrderBundleItem($ordno);
				$logger->info($bundle_result);

				$add_html = "<div class='list-group'>";
				foreach($bundle_result as $bundle_data){
					$asset_result = $asset->runReserve($bundle_data['reserve_id'],$m_id);
					$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$bundle_data['item_nm']."</h4><p class='list-group-item-text licence_key' style='font-size:14px'>".$asset_result->key."</p><p> <small>제품키 활성화 : (".$asset_result->activatedDt.")</small></p>";
					if($bundle_data['asset_id']=="950"){
						$add_html.= "<p><small>(www.callofduty.com/redeem 에서 제품 키 등록)</small></p>";
					}
					$add_html.="</li>";
				}
				$add_html.="</div>";
				echo $add_html;
			break;
			case "2":
				try{
					$params = array(
						"RetailerOrderID"=>$ordno
					);
				
					//주문확인
					$order_reponse = $ztorm->runGetOrder($params);
					$order_goods_info = $licence->getOrderItemInfo($ordno);
					$logger->info($order_reponse);
					echo "<div class='list-group'>";
					foreach($order_reponse->Value->Order->Contents->OrderContent->CustomerProducts->CustomerProductID as $value){
						$params2 = array(
							"CustomerProductID"=>$value,
						);

						$installKey_reponse = $ztorm->runGetInstallKeys($params2);

						$logger->info($installKey_reponse);
						foreach($installKey_reponse->Value->InstallKey as $value2){
							echo "<li class='list-group-item'><h4 class='list-group-item-heading'>".$order_goods_info['goods_nm_en']." - ".$value2->KeyPoolName."</h4><p class='list-group-item-text licence_key' style='font-size:14px;padding-top:10px'>".$value2->Value." </p></li>";
						}
					}
					echo "</div>";
				}catch(\Ztorm\Api\ZtormException $e){
					$API_ERROR_LOG = "/log/ztormapi_error";
					//echo $e->getMessage();
					$ymd = date('Ymd');
					error_log("[".date('Y.m.d H:i:s')."] Request ".$e->getMessage()."\n", 3, $_SERVER['DOCUMENT_ROOT'].$API_ERROR_LOG.'_'.$ymd);
				}
			break;
			case "5":
				$data = $licence->getOrderItem($ordno);
				$reserveId = $data['reserve_id'];
				$logger->info($ordno);
				$logger->info($reserveId);
				$logger->info($m_id);
				$asset_result = $asset->runReserve($reserveId,$m_id);
				$logger->info($asset_result);

				$add_html = "<div class='list-group'>";
				$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text licence_key' style='font-size:14px'>".$asset_result->key."</p><p> <small>제품키 활성화 : (".$asset_result->activatedDt.")</small></p>";
				if($data['asset_id']=="950"){
					$add_html.= "<p><small>(www.callofduty.com/redeem 에서 제품 키 등록)</small></p>";
				}
				$add_html.="</li>";
				$add_html.="</div>";
				
				echo $add_html;
			break;
			case "6":
				$data = $licence->getOrderItem($ordno);
				$reserveId = $data['reserve_id'];

				$asset_result = $asset->runReserve($reserveId,$m_id);

				$logger->info($asset_result);

				$add_html = "<div class='list-group'>";
				
				$key = explode("-",$asset_result->key);
				if(trim($key[1])=="CASH" || trim($key[1])=="cash" || trim($key[1])==" CASH" || trim($key[1])=="POINT"){
					$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text' style='font-size:14px'>포인트가 지급되었습니다. 마이페이지> 포인트에서 확인하시기 바랍니다.</p></li>";
				}else{
					$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text licence_key' style='font-size:14px'>".$asset_result->key."</p><p> <small>제품키 활성화 : (".$asset_result->activatedDt.")</small></p></li>";
				}
				$add_html.="</div>";
				echo $add_html;
			break;
			case "9": //Genba 키확인
				$genba_item = $licence->getOrderGenba($ordno);
				$orderid = $genba_item['ID'];

				$genba = new Genba($is_genba_mode);
				$response = $genba->runGenbaGetOrderAsync($orderid);
				$logger->info($response);
				
				switch($response->State){
					case "0": //Back Order(이월주문)
						echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
					case "1": // Pre Order(예약주문)
						echo "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
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
						echo $add_html;
					break;
					case "3": // 주문취소완료 (환불처리된건)
						echo "이미 환불처리가 완료된 주문입니다.";
					break;
					case "4": // 주문API 처리 진행중
						echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
				}
			break;
			case "8": //Vaultn 키확인
				$vaultn_item=$licence->getOrderVaultn($ordno);

				$orderid = $vaultn_item['orderId'];
				
				$vaultn = new Vaultn("");
				$response = $vaultn->runRetrieveOrder($orderid);
				$logger->info($response);
				
				switch($response->status){
					case "BackOrder": //Back Order(이월주문)
						echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
					case "PreOrder": // Pre Order(예약주문)
						echo "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
					break;
					case "Completed": // 키 전송완료
						$add_html="<div class='list-group'>";
						foreach($response->orderItemDetails->orderItemContent as $orderItem){
							foreach($orderItem->serials as $serials){
								$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'></h4><p class='list-group-item-text' id='licence_key'>".$serials->keycode."</p></li>";
							}
						}
						$add_html.="</div>";
						echo $add_html;
					break;
					case "Cancelled": // 주문취소완료 (환불처리된건)
						echo "이미 환불처리가 완료된 주문입니다.";
					break;
					case "4": // 주문API 처리 진행중
						echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
					break;
				}
			break;
		}
		break;

		case "getGiftView":
			$asset_result = $asset->runReserve($reserve_id,$m_id);
			$logger->info($asset_result);

			$add_html = "<ul class='listview'>";
			$add_html.="<li><div class='item'><h4 class='list-group-item-heading'>".$asset_result->title."</h4><p class='list-group-item-text' style='font-size:14px'>".$asset_result->key."</p><p> <small>제품키 활성화 : (".$asset_result->activatedDt.")</small></p></div></li>";
			$add_html.="</div>";

			echo $add_html;
			$licence->updateEventGiftMember($reserve_id,$asset_result->activatedDt);
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
		break;

		case "getVaultnGift":
			$vaultn = new Vaultn("");
			$response = $vaultn->runRetrieveOrder($vaultn_order_id);
			$logger->info($response);
			
			switch($response->status){
				case "BackOrder": //Back Order(이월주문)
					echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
				break;
				case "PreOrder": // Pre Order(예약주문)
					echo "본 상품은 예약 판매 중으로, 제품 코드(키) 발송은 추가 공지사항을 통해 안내드릴 예정입니다.";
				break;
				case "Completed": // 키 전송완료
					$add_html="<div class='list-group'>";
					foreach($response->orderItemDetails->orderItemContent as $orderItem){
						foreach($orderItem->serials as $serials){
							$add_html.="<li class='list-group-item'><h4 class='list-group-item-heading'></h4><p class='list-group-item-text' id='licence_key'>".$serials->keycode."</p></li>";
						}
					}
					$add_html.="</div>";
					echo $add_html;
				break;
				case "Cancelled": // 주문취소완료 (환불처리된건)
					echo "이미 환불처리가 완료된 주문입니다.";
				break;
				case "4": // 주문API 처리 진행중
					echo "주문처리중입니다. 잠시 후에 다시 시도해 주시기 바랍니다.";
				break;
			}
		break;
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>