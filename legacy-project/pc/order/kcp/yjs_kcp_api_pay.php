<?php
	ini_set('display_errors', '0');
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
    header("Content-type: text/html; charset=utf-8");
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcp.xml');
	$logger = Logger::getLogger("pc");

	$res_cd = filter_input(INPUT_POST, 'res_cd', FILTER_SANITIZE_STRING);
	$res_msg = filter_input(INPUT_POST, 'res_msg', FILTER_SANITIZE_STRING);
	$site_cd = filter_input(INPUT_POST, 'site_cd', FILTER_SANITIZE_STRING);
	$tran_cd = filter_input(INPUT_POST, 'tran_cd', FILTER_SANITIZE_STRING);
	$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);

	$pay_method = filter_input(INPUT_POST, 'pay_method', FILTER_SANITIZE_STRING);
	$good_name = filter_input(INPUT_POST, 'good_name', FILTER_SANITIZE_STRING);
	$va_bankcode = filter_input(INPUT_POST, 'va_bankcode', FILTER_SANITIZE_STRING);
	$va_name = filter_input(INPUT_POST, 'va_name', FILTER_SANITIZE_STRING);
	$va_date = date("YmdHis", strtotime("+3 DAYS"));										//입금 마감시각 (3일뒤)
	$va_receipt_gubn = filter_input(INPUT_POST, 'va_receipt_gubn', FILTER_SANITIZE_STRING);
	$va_taxno = filter_input(INPUT_POST, 'va_taxno', FILTER_SANITIZE_STRING);

	$kcp = new Kcp("");

	$tran_cd            = $_POST["tran_cd"]; // 요청코드
	$site_cd            = $_POST["site_cd"]; // 사이트코드
	$enc_data           = $_POST["enc_data"]; // 암호화 인증데이터
	$enc_info           = $_POST["enc_info"]; // 암호화 인증데이터
	//$ordr_mony          = $_POST["good_mny"]; // 결제요청금액   ** 1 원은 실제로 업체에서 결제하셔야 될 원 금액을 넣어주셔야 합니다. 결제금액 유효성 검증 ** -> 밑에서 계산
	/* = -------------------------------------------------------------------------- = */
	$use_pay_method     = $_POST["use_pay_method"]; // 결제 방법
	$ordr_idxx          = $_POST["ordr_idxx"]; // 결제번호
	$shop_user_id          = $_POST["shop_user_id"]; // 회원아이디
	$m_no          = $_POST["param_opt_1"]; // 회원고유번호
	$use_emoney          = $_POST["param_opt_2"]; // 사용포인트


	switch($use_pay_method){
		case "100000000000"://신용카드
			$pay_type="PACA";
		break;
		case "010000000000"://계좌이체
			$pay_type="PABK";
		break;
		case "000010000000"://휴대폰
			$pay_type="PAMC";
		break;
		case "001000000000": //가상계좌
			$pay_type="VCNT";
		break;
	}

	$logger->info($_POST);
	if($_SESSION['member']["m_id"]==""){
		header( "HTTP/1.1 301 Moved Permanently" );
		header( 'Location: https://directg.net/order/order_fail.html?msg=세션만료');
		exit;
	}

try{
	//리뉴얼 DB
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//기존 DB
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$order = new Order($conn);
	$member = new Member($conn_dgkr);

	$asset = new Asset();
	$genba = new Genba("Live");
	$ztorm = new Ztorm();
	$vaultn = new Vaultn();
	$pointnexus = new PointNexus("test"); //TODO: 운영 전환 시 "prod"

	//배송시스템별로 발송로직 분리
	$fulfillment = new OrderFulfillment($conn, array(
		'asset'      => $asset,
		'ztorm'      => $ztorm,
		'vaultn'     => $vaultn,
		'genba'      => $genba,
		'pointnexus' => $pointnexus,
	), $logger);

	//공통 후처리 헬퍼 (tbl_order_item update, 장바구니 삭제, 적립금 차감, 실물 배송 insert)
	$order_repo = new OrderRepository($conn, $logger);

	$order_info = $order->getOrder($ordr_idxx);

	$totalPaymentAmt = $order_info['total_price'];
	$use_emoney = $order_info['use_emoney'];

	if($use_emoney>0){
		$member_emoney = $member->getMemberEmoney($_SESSION['member']['m_no']);

		if($member_emoney<$use_emoney){
			header( "HTTP/1.1 301 Moved Permanently" );
			header( 'Location: https://directg.net/order/order_fail.html?msg=포인트오류');
			exit;
		}
	}

	$ordr_mony = $totalPaymentAmt; //25-09-09(화) 14:13 [이종석] 실제 결제됐어야 할 금액

	if($res_cd=="0000"){
		if($pay_method=="001000000000"){ //25-09-15(월) 17:12 [이종석] 가상계좌
			$params = array(
				"pay_method"     => "VCNT",
				"amount"         => $ordr_mony,
				"currency"       => "410",
				"ordr_idxx"      => $ordr_idxx,
				"good_name"      => $good_name,
				"buyr_name"      => $buyr_name,
				"va_txtype"      => "41100000",
				"va_mny"         => $ordr_mony,
				"va_bankcode"    => $va_bankcode,
				"va_name"        => $va_name,
				"va_date"        => $va_date,
				"va_receipt_gubn"=> $va_receipt_gubn,
				"va_taxno"       => $va_taxno
			);
		} else {
			$params = array(
				"tran_cd"=>$tran_cd,
				"enc_data"=>$enc_data,
				"enc_info"=>$enc_info,
				"ordr_mony"=>$ordr_mony,
				"use_pay_method"=>$use_pay_method,
				"ordr_idxx"=>$ordr_idxx,
				"pay_type"=>$pay_type,
			);
		}

		$req_data = json_encode($params);
		$logger->info("\n####결제창 인증응답API#########\n");
		$logger->info($req_data);

		 /*
		==========================================================================
		결제요청 응답결과 DATA
		--------------------------------------------------------------------------
		*/
		// 공통
		$res_cd         = "";
		$res_msg        = "";
		$res_en_msg     = "";
		$tno            = "";
		$amount         = "";
		$app_time       = ""; // 공통(카드:승인시간,계좌이체:계좌이체시간,가상계좌:가상계좌 채번시간)
		$partcanc_yn="";

		// 카드
		$card_cd     = ""; // 카드코드
		$card_name   = ""; // 카드사
		$app_no      = ""; // 승인번호
		$quota       = ""; // 할부개월
		$noinf       = ""; // 무이자여부

		// 포인트
		$pnt_issue        = ""; // 포인트 서비스사
		$add_pnt          = ""; // 발생 포인트
		$use_pnt          = ""; // 사용가능 포인트
		$rsv_pnt          = ""; // 적립 포인트
		$pnt_app_time     = ""; // 승인시간
		$pnt_app_no       = ""; // 승인번호
		$pnt_amount       = ""; // 적립금액 or 사용금액

		// 계좌이체
		$bank_name        = ""; // 은행명
		$bank_code        = ""; // 은행코드

		// 가상계좌
		$bankname         = ""; // 입금할 은행
		$bankcode         = ""; // 입금할 은행코드
		$depositor        = ""; // 입금할 계좌 예금주
		$account          = ""; // 입금할 계좌 번호
		$va_date          = ""; // 가상계좌 입금마감시간

		// 휴대폰
		$commid           = ""; // 통신사 코드
		$mobile_no        = ""; // 휴대폰 번호

		// 상품권
		$tk_van_code      = ""; // 발급사 코드
		$tk_app_no        = ""; // 승인 번호
		$tk_app_time      = ""; // 상품권 승인시간

		// 현금 영수증
		$cash_yn        = $_POST[ "cash_yn"]; // 현금 영수증 등록 여부
		$cash_tr_code   = $_POST[ "cash_tr_code"]; // 현금 영수증 발행 구분
		$cash_id_info   = $_POST[ "cash_id_info"]; // 현금 영수증 등록 번호
		$cash_authno    = ""; // 현금 영수증 승인 번호
		$cash_no        = ""; // 현금 영수증 거래 번호

		/*결제요청 API URL (target URL)*/
		$res_data = $kcp->requestPayment($params);

		// RES JSON DATA Parsing
		$json_res = json_decode($res_data, true);

		$logger->info("\n####결제요청 응답결과API#########\n");
		$logger->info($json_res);

		$res_cd = $json_res["res_cd"];
		$res_msg = $json_res["res_msg"];
		$res_en_msg = $json_res["res_en_msg"];

		if ( $res_cd == "0000" ||  $res_cd == "V000"){ //정상처리
			$tno       = $json_res["tno"];
			$res_cd    = $json_res["res_cd"];
			$res_msg   = $json_res["res_msg"];
			$amount    = $json_res["amount"];
			$escw_yn    = $json_res["escw_yn"];
			$partcanc_yn    = $json_res["partcanc_yn"];

			// 카드
			if ( $use_pay_method == "100000000000" ){
				$card_cd   = $json_res["card_cd"];
				$card_name = $json_res["card_name"];
				$card_no = $json_res["card_no"];
				$app_no    = $json_res["app_no"];
				$app_time  = $json_res["app_time"];
				$noinf     = $json_res["noinf"];
				$quota     = $json_res["quota"];
				$payment_method = "SC0010";
				$step="2";
				// 포인트 복합결제
				$pnt_issue = $json_res["pnt_issue"];
				if ( $pnt_issue == "SCSK" || $pnt_issue ==  "SCWB" )
				{
					$pnt_issue    = $json_res["pnt_issue"];
					$add_pnt      = $json_res["add_pnt"];
					$use_pnt      = $json_res["use_pnt"];
					$rsv_pnt      = $json_res["rsv_pnt"];
					$pnt_app_time = $json_res["pnt_app_time"];
					$pnt_app_no   = $json_res["pnt_app_no"];
					$pnt_amount   = $json_res["pnt_amount"];
					// 현금영수증 발급시
					if ( $cash_yn == "Y" )
					{
						$cash_authno = $json_res["cash_authno"];
						$cash_no     = $json_res["cash_no"];
					}
				}
			}
			// 계좌이체
			else if ( $use_pay_method == "010000000000" )
			{
				$bank_name = $json_res["bank_name"];
				$bank_code = $json_res["bank_code"];
				$app_time  = $json_res["app_time"];
				$payment_method = "SC0030";
				$step="2";

				// 현금영수증 발급시
				if ( $cash_yn == "Y" )
				{
					$cash_authno = $json_res["cash_authno"];
					$cash_no     = $json_res["cash_no"];
				}
			}
			// 가상계좌
			else if ( $use_pay_method == "001000000000" )
			{
				$bank_name  = $json_res["bankname"];
				$bank_code  = $json_res["bankcode"];
				$depositor = $json_res["depositor"];
				$app_time  = $json_res["app_time"];
				$account   = $json_res["account"];
				$va_date   = $json_res["va_date"];
				$van_apptime   = $json_res["van_apptime"];
				$van_cd  = $json_res["van_cd"];
				$va_name  = $json_res["va_name"];
				$van_txid  = $json_res["van_txid"];
				$payment_method = "SC0040";
				$step="1";
			}
			// 포인트
			else if ( $use_pay_method == "000100000000" )
			{
				$pnt_issue    = $json_res["pnt_issue"];
				$add_pnt      = $json_res["add_pnt"];
				$use_pnt      = $json_res["use_pnt"];
				$rsv_pnt      = $json_res["rsv_pnt"];
				$pnt_app_time = $json_res["pnt_app_time"];
				$pnt_app_no   = $json_res["pnt_app_no"];
				$pnt_amount   = $json_res["pnt_amount"];
				// 현금영수증 발급시
				if ( $cash_yn == "Y" )
				{
					$cash_authno = $json_res["cash_authno"];
					$cash_no     = $json_res["cash_no"];
				}
			}
			// 휴대폰
			else if ( $use_pay_method == "000010000000" ){
				$app_time    = $json_res["app_time"];
				$commid      = $json_res["commid"];
				$mobile_no   = $json_res["mobile_no"];
				$van_id      = $json_res["van_id"];
				$payment_method = "SC0060";
				$step="2";
			}else if ( $use_pay_method == "000000001000" ){// 상품권
				$tk_van_code  = $json_res["tk_van_code"];
				$tk_app_no    = $json_res["tk_app_no"];
				$tk_app_time  = $json_res["tk_app_time"];
			}

			//주문결제내역 저장
			$ip = get_client_ip_env();

			if($use_emoney==""){
				$use_emoney = "0";
			}

			//결제로그 저장
			$query = "insert into kcp_log set settle_no=:settle_no,res_cd=:res_cd,res_msg=:res_msg,res_en_msg=:res_en_msg,pay_method=:pay_method,tno=:tno,amount=:amount,card_cd=:card_cd,card_name=:card_name,card_no=:card_no,app_no=:app_no,app_time=:app_time,noinf=:noinf,noinf_type=:noinf_type,quota=:quota,card_mny=:card_mny,coupon_mny=:coupon_mny,payco_point_mny=:payco_point_mny,partcanc_yn=:partcanc_yn,card_bin_type_01=:card_bin_type_01,card_bin_type_02=:card_bin_type_02,isp_issuer_cd=:isp_issuer_cd,isp_issuer_nm=:isp_issuer_nm,bank_name=:bank_name,bank_code=:bank_code,bk_mny=:bk_mny,depositor=:depositor,account=:account,va_date=:va_date,va_name=:va_name,cash_authno=:cash_authno,cash_no=:cash_no,commid=:commid,mobile_no=:mobile_no,van_id=:van_id,escw_yn=:escw_yn";
			$stmt = $conn->prepare($query);
			$params = array(
				':settle_no'=>$ordr_idxx,
				':res_cd'=>$res_cd,
				':res_msg'=>$res_msg,
				':res_en_msg'=>$res_en_msg,
				':pay_method'=>$json_res["pay_method"],
				':tno'=>$tno,
				':amount'=>$amount,
				':card_cd'=>$card_cd,
				':card_name'=>$card_name,
				':card_no'=>$card_no,
				':app_no'=>$app_no,
				':app_time'=>$app_time,
				':noinf'=>$noinf,
				':noinf_type'=>$noinf_type,
				':quota'=>$quota,
				':card_mny'=>$card_mny,
				':coupon_mny'=>$coupon_mny,
				':payco_point_mny'=>$payco_point_mny,
				':partcanc_yn'=>$partcanc_yn,
				':card_bin_type_01'=>$card_bin_type_01,
				':card_bin_type_02'=>$card_bin_type_02,
				':isp_issuer_cd'=>$isp_issuer_cd,
				':isp_issuer_nm'=>$isp_issuer_nm,
				':bank_name'=>$bank_name,
				':bank_code'=>$bank_code,
				':bk_mny'=>$bk_mny,
				':depositor'=>$depositor,
				':account'=>$account,
				':va_date'=>$va_date,
				':va_name'=>$va_name,
				':cash_authno'=>$cash_authno,
				':cash_no'=>$cash_no,
				':commid'=>$commid,
				':mobile_no'=>$mobile_no,
				':van_id'=>$van_id,
				':escw_yn'=>$escw_yn,
			);
			$stmt->execute($params);

			//##############################################################
			//결제상태 업데이트
			//##############################################################
			$query = "update tbl_order set step=:step,payment_date=now() where settle_no=:settle_no";
			$stmt = $conn->prepare($query);
			$params = array(
				':step'=>$step,
				':settle_no'=>$ordr_idxx
			);
			$stmt->execute($params);

			//##############################################################
			//게임코드발송
			//##############################################################
			$order_item = $order->getOrderItem($ordr_idxx);

			foreach($order_item as $value){
				//게임코드 발송아이템 정보
				$delivery_item_list = $order->getGoodsItemDelivery($value['product_code']);

				switch($value['delivery_type']){
					case "1": //디지털상품 주문
						$send_status = "pending";
						$item_order_id = "";

						$payment_info = array(
							'pay_type'       => $pay_type,
							'ip'             => $ip,
							'm_no'           => $_SESSION['member']['m_no'],
							'm_id'           => $_SESSION['member']['m_id'],
							'name'           => $_SESSION['member']['name'],
							'nickname'       => $_SESSION['member']['nickname'],
							'payment_method' => $payment_method,
							'pg'             => 'kcp', //PointNexus VCNT 분기용
						);
						foreach($delivery_item_list as $sub_value){
							$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
							$order_status = $res['order_status'];
							$send_status  = $res['send_status'];
							$order_system = $res['order_system'];
						}
					break;
					case "2": //실물상품 주문
						if($pay_type=="VCNT"){
							$order_status="3";
						} else {
							$order_status="2";
						}
						$order_repo->insertShipment($ordr_idxx, $value, $buyr_name, $order_status);

					break;
					case "3": //디지털 + 실물상품 배송
						//디지털 상품 주문
						$send_status = "pending";
						$item_order_id = "";

						$payment_info = array(
							'pay_type'       => $pay_type,
							'ip'             => $ip,
							'm_no'           => $_SESSION['member']['m_no'],
							'm_id'           => $_SESSION['member']['m_id'],
							'name'           => $_SESSION['member']['name'],
							'nickname'       => $_SESSION['member']['nickname'],
							'payment_method' => $payment_method,
							'pg'             => 'kcp', //PointNexus VCNT 분기용
						);
						foreach($delivery_item_list as $sub_value){
							$res = $fulfillment->processItem($sub_value['order_system'], $value, $sub_value, $payment_info);
							$order_status = $res['order_status'];
							$send_status  = $res['send_status'];
							$order_system = $res['order_system'];
						}

						if($pay_type=="VCNT"){
							$order_status="3";
						} else {
							$order_status="2";
						}
						//실물상품 주문
						$order_repo->insertShipment($ordr_idxx, $value, $buyr_name, $order_status);

					break;
				}

				//주문상품내역 정보 업데이트
				$order_repo->updateItemStatus($value['ordno'], $order_status, $send_status, $order_system);
			}

			//장바구니 삭제
			$order_repo->clearCart($m_no);

			//사용 적립금 차감
			if($use_emoney>0){
				$member->setMemberEmoney($_SESSION['member']['m_no'],$use_emoney,'주문결제시 할인',$ordr_idxx);
			}

			header( "HTTP/1.1 301 Moved Permanently" );
			header( 'Location: https://directg.net/order/order_end.html?settle_no='.$ordr_idxx );
			exit;
		} else {
			//echo $res_data['res_msg'];
			header( "HTTP/1.1 301 Moved Permanently" );
			header( 'Location: https://directg.net/order/order_fail.html?msg=결제금액오류');
			exit;
		}

			/*
			==========================================================================
				 승인 결과 DB 처리 실패시 : 자동취소
			--------------------------------------------------------------------------
				 승인 결과를 DB 작업 하는 과정에서 정상적으로 승인된 건에 대해
			DB 작업을 실패하여 DB update 가 완료되지 않은 경우, 자동으로
				 승인 취소 요청을 하는 프로세스가 구성되어 있습니다.

			DB 작업이 실패 한 경우, bSucc 라는 변수(String)의 값을 "false"
				 로 설정해 주시기 바랍니다. (DB 작업 성공의 경우에는 "false" 이외의
				 값을 설정하시면 됩니다.)
			--------------------------------------------------------------------------
			*/
			$bSucc = "false";
			/*

			if ( $res_cd == "0000" ){
				if ( $bSucc == "false"){
					$res_data      = "";
					$req_data      = "";
					$kcp_sign_data = "";

					$params = array(
						"site_cd"=>$site_cd,
						"kcp_cert_info"=>$kcp_cert_info,
						"tno"=>$tno,
					);

					//결제취소 API
					$response = $kcp->cancelPayment($params);
					//결제금액 유효성 검증

					//결제수단 유효성 검증
					$logger->info("####결제취소API#########");
					$logger->info($response);
				}
			}
			*/

		//결제인증 응답
	}else{ //결제인증실패
		$logger->info($_POST);
		print_r($_POST);
	}

}catch(Exception $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
