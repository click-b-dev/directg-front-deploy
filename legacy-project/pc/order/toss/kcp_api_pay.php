<?php
	ini_set('display_errors', '0');
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
    header("Content-type: text/html; charset=utf-8");
	//토스 퀵계좌이체시 kcp adapter 사용 흔적. (현재 사용 안함)
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss.xml');
	$logger = Logger::getLogger("pc");
	
	$res_cd = filter_input(INPUT_POST, 'res_cd', FILTER_SANITIZE_STRING);
	$res_msg = filter_input(INPUT_POST, 'res_msg', FILTER_SANITIZE_STRING);
	$site_cd = filter_input(INPUT_POST, 'site_cd', FILTER_SANITIZE_STRING);
	$tran_cd = filter_input(INPUT_POST, 'tran_cd', FILTER_SANITIZE_STRING);
	$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);
	$bk_mny = filter_input(INPUT_POST, 'bk_mny', FILTER_SANITIZE_STRING);
	
	$pay_method = filter_input(INPUT_POST, 'pay_method', FILTER_SANITIZE_STRING);
	$good_name = filter_input(INPUT_POST, 'good_name', FILTER_SANITIZE_STRING);
	$va_bankcode = filter_input(INPUT_POST, 'va_bankcode', FILTER_SANITIZE_STRING);
	$va_name = filter_input(INPUT_POST, 'va_name', FILTER_SANITIZE_STRING);
	$va_date = date("YmdHis", strtotime("+3 DAYS"));										//입금 마감시각 (3일뒤)
	$va_receipt_gubn = filter_input(INPUT_POST, 'va_receipt_gubn', FILTER_SANITIZE_STRING);
	$va_taxno = filter_input(INPUT_POST, 'va_taxno', FILTER_SANITIZE_STRING);

	$kcp = new Tossadapter("");
	
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

	if($res_cd=="0000"){ //결제창 인증응답 성공
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
		
		$delivery_real  = FALSE;
		
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
			$coupon_mny = $json_res["coupon_mny"];
			
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
					$cash_authno = $json_res["cash_authno"];
					$cash_no     = $json_res["cash_no"];
				}
			}
			// 계좌이체
			else if ( $use_pay_method == "010000000000" )
			{
				$bank_name = $json_res["bank_name"];
				$bank_code = $json_res["bank_code"];
				$app_time  = $json_res["app_time"];
				$payment_method = "toss_bank";
				$step="2";
				$cash_authno = $json_res["cash_authno"];
				$cash_no     = $json_res["cash_no"];
				$bk_mny = $json_res["bk_mny"];
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
			$query = "insert into toss_adapter_log set settle_no=:settle_no,res_cd=:res_cd,res_msg=:res_msg,res_en_msg=:res_en_msg,pay_method=:pay_method,tno=:tno,amount=:amount,card_cd=:card_cd,card_name=:card_name,card_no=:card_no,app_no=:app_no,app_time=:app_time,noinf=:noinf,noinf_type=:noinf_type,quota=:quota,card_mny=:card_mny,coupon_mny=:coupon_mny,payco_point_mny=:payco_point_mny,partcanc_yn=:partcanc_yn,card_bin_type_01=:card_bin_type_01,card_bin_type_02=:card_bin_type_02,isp_issuer_cd=:isp_issuer_cd,isp_issuer_nm=:isp_issuer_nm,bank_name=:bank_name,bank_code=:bank_code,bk_mny=:bk_mny,depositor=:depositor,account=:account,va_date=:va_date,va_name=:va_name,cash_authno=:cash_authno,cash_no=:cash_no,commid=:commid,mobile_no=:mobile_no,van_id=:van_id,escw_yn=:escw_yn";
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
						
						foreach($delivery_item_list as $sub_value){
							switch($sub_value['order_system']){
								case "1": //Asset API 주문
									$order_system="Asset";
									try{
										$asset_response = $asset->runReserveRegister($shop_user_id,$value['ordno'],$sub_value['item_id']);
										$logger->info($asset_response);
										foreach($asset_response->list as $asset_key=>$asset_item){
											$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd ";
											$stmt = $conn->prepare($query);
											$c_params = array(
												":m_no"=>$m_no,
												":m_id"=>$shop_user_id,
												":ordno"=>$asset_item->po,
												":product_code"=>$value['product_code'],
												":product_name"=>$value['product_name'],
												":asset_id"=>$asset_item->assetId,
												":asset_name"=>$sub_value['item_name'],
												":reserve_id"=>$asset_item->reserveId,
												":asset_publisher"=>$sub_value['item_publisher'],
												":asset_platform"=>$sub_value['item_platform'],
												":asset_type"=>$sub_value['item_type'],
												":ord_ymd"=>date('Y-m-d'),
											);
											$stmt->execute($c_params);
										}
										
										if($pay_type=="VCNT"){
											$order_status="3";
											$send_status = "pending";
										} else {
											$order_status="2";
											$send_status = "delivered";
										}
									}catch(Exception $e){
										//print_r($e);
										$order_status="1";
										$send_status = "fail";
									}
								break;
								case "2": //Ztorm API 주문
									if($_SESSION['member']['name']){
										$name = $_SESSION['member']['name'];
									}else{
										$name = $_SESSION['member']['nickname'];
									}
									//회원가입
									$member_params = array(
											"RetailerCustomerID"=>$_SESSION['member']['m_id'],
											"Username"=>$name,
											"Email"=>$_SESSION['member']['m_id'],
											"FirstName"=>'',
											"LastName"=>'',
											"CountryCode"=>'KR',
											"YearOfBirth"=>''
									);
									$member_response = $ztorm->runCreateCustomer($member_params);
									$logger->info($member_response);
									
									$zt_ord_no = $ztorm->runZtormOrder($_SESSION['member']['m_id'],$ip,$value['ordno'],$sub_value['item_id'],$value['price'],$payment_method,$value['publisher_code']);
									$logger->info($zt_ord_no);
									
									$query="insert into tbl_order_item_ztorm set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,ztorm_item_id=:ztorm_item_id,ztorm_item_name=:ztorm_item_name,customer_product_id=:customer_product_id,ztorm_publisher=:ztorm_publisher,ztorm_platform=:ztorm_platform,order_date=now(),ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE batch_date=now()";
									$stmt = $conn->prepare($query);
									$c_params = array(
										":m_no"=>$_SESSION['member']['m_no'],
										":m_id"=>$_SESSION['member']['m_id'],
										":ordno"=>$value['ordno'],
										":product_code"=>$value['product_code'],
										":product_name"=>$value['product_name'],
										":ztorm_item_id"=>$sub_value['item_id'],
										":ztorm_item_name"=>$sub_value['item_name'],
										":customer_product_id"=>$zt_ord_no,
										":ztorm_publisher"=>$sub_value['item_publisher'],
										":ztorm_platform"=>$sub_value['item_platform'],
										":ord_ymd"=>date('Y-m-d'),
									);
									//print_r($c_params);
									$logger->info($c_params);
									$stmt->execute($c_params);
									
									if($pay_type=="VCNT"){
										$order_status="3";
										$send_status = "pending";
									} else {
										$order_status="2";
										$send_status = "delivered";
									}

									$order_system="Ztorm";
								break;
								case "8": //Vaultn API 주문
									$order_system="Vaultn";
								
									$m_no=$_SESSION['member']['m_no'];
									$m_id=$_SESSION['member']['m_id'];
									
									$params = array(
										"sku"=>$sub_value['item_id'],
										"ipAddress"=>$ip,
										"salesPriceGross"=>$value['price'],
										"clientOrderReference"=>$value['ordno'],
										"clientCustomerReference"=>(string)$_SESSION['member']['m_no'],
									);
									$vaultn_data = $vaultn->runOrderCreate($params);
									$logger->info($vaultn_data);

									if($vaultn_data->orderId){
										$query="insert into tbl_order_item_vaultn set m_no=:m_no,m_id=:m_id,orderId=:orderId,clientOrderReference=:clientOrderReference,sku=:sku,clientCustomerReference=:clientCustomerReference,created=:created,status=:status,salesCurrency=:salesCurrency,salesCountry=:salesCountry,salesCountryCode=:salesCountryCode,salesPriceGross=:salesPriceGross,publisherName=:publisherName,publisherGuid=:publisherGuid,priceModel=:priceModel,priceListGuid=:priceListGuid,countryCode=:countryCode,srpCurrency=:srpCurrency,purchasePriceCurrency=:purchasePriceCurrency,baseSRP=:baseSRP,discountedSRP=:discountedSRP,netDiscountedSRP=:netDiscountedSRP,priceListVAT=:priceListVAT,basePurchasePrice=:basePurchasePrice,promoPercentage=:promoPercentage,netPurchasePrice=:netPurchasePrice,estimatedMargin=:estimatedMargin,provider=:provider,fulfilmentStatus=:fulfilmentStatus,reg_date=now(),ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name ON DUPLICATE KEY UPDATE update_date=now()";
										$stmt = $conn->prepare($query);
										$c_params2 = array(
											":m_no"=>$m_no,
											":m_id"=>$m_id,
											":orderId"=>$vaultn_data->orderId,
											":clientOrderReference"=>$value['ordno'],
											":sku"=>$vaultn_data->orderItemDetails->sku,
											":clientCustomerReference"=>$_SESSION['member']['m_no'],
											":created"=>$vaultn_data->created,
											":status"=>$vaultn_data->status,
											":salesCurrency"=>$vaultn_data->orderDetails->salesCurrency,
											":salesCountry"=>$vaultn_data->orderDetails->salesCountry,
											":salesCountryCode"=>$vaultn_data->orderDetails->salesCountryCode,
											":salesPriceGross"=>$vaultn_data->orderDetails->salesPriceGross,
											":publisherName"=>$vaultn_data->orderDetails->priceListDetails->publisherName,
											":publisherGuid"=>$vaultn_data->orderDetails->priceListDetails->publisherGuid,
											":priceModel"=>$vaultn_data->orderDetails->priceListDetails->priceModel,
											":priceListGuid"=>$vaultn_data->orderDetails->priceListDetails->priceListGuid,
											":countryCode"=>$vaultn_data->orderDetails->priceListDetails->countryCode,
											":srpCurrency"=>$vaultn_data->orderDetails->priceListDetails->srpCurrency,
											":purchasePriceCurrency"=>$vaultn_data->orderDetails->priceListDetails->purchasePriceCurrency,
											":baseSRP"=>$vaultn_data->orderDetails->priceListDetails->baseSRP,
											":discountedSRP"=>$vaultn_data->orderDetails->priceListDetails->discountedSRP,
											":netDiscountedSRP"=>$vaultn_data->orderDetails->priceListDetails->netDiscountedSRP,
											":priceListVAT"=>$vaultn_data->orderDetails->priceListDetails->priceListVAT,
											":basePurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->basePurchasePrice,
											":promoPercentage"=>$vaultn_data->orderDetails->priceListDetails->promoPercentage,
											":netPurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->netPurchasePrice,
											":estimatedMargin"=>$vaultn_data->orderDetails->priceListDetails->estimatedMargin,
											":provider"=>$vaultn_data->orderItemDetails->provider,
											":fulfilmentStatus"=>$vaultn_data->orderItemDetails->fulfilmentStatus,
											":ord_ymd"=>date('Y-m-d'),
											":product_code"=>$value['product_code'],
											":product_name"=>$value['product_name'],
											":Name"=>$sub_value['item_name'],
										);
										$logger->info($c_params2);
										$stmt->execute($c_params2);
										
										if($pay_type=="VCNT"){
											$order_status="3";
											$send_status = "pending";
										} else {
											$order_status="2";
											$send_status = "delivered";
										}
									}else{
										$order_status="1";
										$send_status = "fail";
									}
								break;
								case "9": //Genba API 주문
									$order_system="Genba";
									if($value['is_preorder']=="Y"){ // 예약구매
										$reservationid = "";
										$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
										$logger->info($order_response);
										$Created = $order_response->Created;
										$Expiration="";

									}else{ // 일반구매
										$reservation_response = $genba->runGenbaPlaceReservationAsync($sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
										$logger->info($reservation_response);
										
										if($reservation_response->Code=="2007"){ //품절 back-order처리
											$reservationid = "";
											$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
											$logger->info($order_response);
											$Created = $order_response->Created;
											$Expiration="";
										}else{ // 정상판매
											$reservationid = $reservation_response->ID;
											$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
											$logger->info($order_response);
											$Created = $reservation_response->Created;
											$Expiration = $reservation_response->Expiration;
										}
									}
									if($order_response->ID){ // Genba 주문성공
										$genba_query = "insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,ID=:ID,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name,Platform=:Platform,Publisher=:Publisher";
										$stmt = $conn->prepare($genba_query);
										$params = array(
											':m_no'=> $value['m_no'],
											':m_id'=> $value['m_id'],
											':ordno'=> $value['ordno'],
											':ID' =>$order_response->ID,
											':ClientTransactionID'=> $order_response->ClientTransactionID,
											':Sku' =>$order_response->Sku,
											':Created' =>$Created,
											':Expiration' =>$Expiration,
											':State' =>$order_response->State,
											':CommunicatedBuyingPrice' =>$order_response->CommunicatedBuyingPrice->Amount,
											':ActualBuyingPrice' =>$order_response->ActualBuyingPrice->Amount,
											':NetAmount' =>$order_response->SellingPrice->NetAmount,
											':GrossAmount' =>$order_response->SellingPrice->GrossAmount,
											':ReservationID' =>$order_response->ReservationID,
											":ord_ymd"=>date('Y-m-d'),
											":product_code"=>$value['product_code'],
											":product_name"=>$value['product_name'],
											":Name"=>$sub_value['Name'],
											":Platform"=>$sub_value['Platform'],
											":Publisher"=>$sub_value['Publisher'],
											
										);
										$stmt->execute($params);
										$logger->info($params);
										
										if($pay_type=="VCNT"){
											$order_status="3";
											$send_status = "pending";
										} else {
											$order_status="2";
											$send_status = "delivered";
										}
									}else{ // Genba 주문실패
										$query="insert into  genba_error_log set ordno=:ordno,sku=:sku,name=:name,Code=:Code,Details=:Details,reg_date=now()";
										$params = array(
											":ordno"=>$value['ordno'],
											":sku"=>$sub_value['item_id'],
											":name"=>$sub_value['Name'],
											":Code"=>$order_response->Code,
											":Details"=>$order_response->Details,
										);
										$stmt->execute($params);
										$order_status="1";
										$send_status = "fail";
									}
								break;
							}
						}
					break;
					case "2": //실물상품 주문
						if($pay_type=="VCNT"){
							$order_status="3";
						} else {
							$order_status="2";
						}
						$delivery_real=TRUE;
						$query="insert into tbl_order_shipment set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,model_code=:model_code,model_name=:model_name,courier_name=:courier_name,shipment_status=:shipment_status";
						$stmt = $conn->prepare($query);
						$d_params = array(
							":settle_no"=>$ordr_idxx,
							":ordno"=>$value['ordno'],
							":product_code"=>$value['product_code'],
							":product_name"=>$value['product_name'],
							":model_code"=>$value['model_code'],
							":model_name"=>$value['model_name'],
							":courier_name"=>$buyr_name,
							":shipment_status"=>$order_status
						);
						$logger->info($d_params);
						$stmt->execute($d_params);

					break;
					case "3": //디지털 + 실물상품 배송
						//디지털 상품 주문
						$delivery_real=TRUE;
						$send_status = "pending";
						$item_order_id = "";
						foreach($delivery_item_list as $sub_value){
							switch($sub_value['order_system']){
								case "1": //Asset API 주문
									$order_system="Asset";
									try{
										$asset_response = $asset->runReserveRegister($shop_user_id,$value['ordno'],$sub_value['item_id']);
										$logger->info($asset_response);
										foreach($asset_response->list as $asset_key=>$asset_item){
											$query="insert into tbl_order_item_asset set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,asset_id=:asset_id,asset_name=:asset_name,reserve_id=:reserve_id,asset_publisher=:asset_publisher,asset_platform=:asset_platform,order_date=now(),asset_type=:asset_type,ord_ymd=:ord_ymd ";
											$stmt = $conn->prepare($query);
											$c_params = array(
												":m_no"=>$m_no,
												":m_id"=>$shop_user_id,
												":ordno"=>$asset_item->po,
												":product_code"=>$value['product_code'],
												":product_name"=>$value['product_name'],
												":asset_id"=>$asset_item->assetId,
												":asset_name"=>$sub_value['item_name'],
												":reserve_id"=>$asset_item->reserveId,
												":asset_publisher"=>$sub_value['item_publisher'],
												":asset_platform"=>$sub_value['item_platform'],
												":asset_type"=>$sub_value['item_type'],
												":ord_ymd"=>date('Y-m-d'),
											);
											$stmt->execute($c_params);
										}
										if($pay_type=="VCNT"){
											$order_status="3";
											$send_status = "pending";
										} else {
											$order_status="2";
											$send_status = "delivered";
										}
									}catch(Exception $e){
										$order_status="1";
										$send_status = "fail";
									}
								break;
								case "2": //Ztorm API 주문
									if($_SESSION['member']['name']){
										$name = $_SESSION['member']['name'];
									}else{
										$name = $_SESSION['member']['nickname'];
									}
									//회원가입
									$member_params = array(
											"RetailerCustomerID"=>$_SESSION['member']['m_id'],
											"Username"=>$name,
											"Email"=>$shop_user_id,
											"FirstName"=>'',
											"LastName"=>'',
											"CountryCode"=>'KR',
											"YearOfBirth"=>''
									);
									$member_response = $ztorm->runCreateCustomer($member_params);
									$logger->info($member_response);
									
									$zt_ord_no = $ztorm->runZtormOrder($shop_user_id,$ip,$value['ordno'],$sub_value['item_id'],$value['price'],$payment_method,$value['publisher_code']);
									$logger->info($zt_ord_no);
									
									$query="insert into tbl_order_item_ztorm set m_no=:m_no,m_id=:m_id,ordno=:ordno,product_code=:product_code,product_name=:product_name,ztorm_item_id=:ztorm_item_id,ztorm_item_name=:ztorm_item_name,customer_product_id=:customer_product_id,ztorm_publisher=:ztorm_publisher,ztorm_platform=:ztorm_platform,order_date=now(),ord_ymd=:ord_ymd ON DUPLICATE KEY UPDATE batch_date=now()";
									$stmt = $conn->prepare($query);
									$c_params = array(
										":m_no"=>$m_no,
										":m_id"=>$shop_user_id,
										":ordno"=>$value['ordno'],
										":product_code"=>$value['product_code'],
										":product_name"=>$value['product_name'],
										":ztorm_item_id"=>$sub_value['item_id'],
										":ztorm_item_name"=>$sub_value['item_name'],
										":customer_product_id"=>$zt_ord_no,
										":ztorm_publisher"=>$sub_value['item_publisher'],
										":ztorm_platform"=>$sub_value['item_platform'],
										":ord_ymd"=>date('Y-m-d'),
									);
									//print_r($c_params);
									$logger->info($c_params);
									$stmt->execute($c_params);
									
									if($pay_type=="VCNT"){
										$order_status="3";
										$send_status = "pending";
									} else {
										$order_status="2";
										$send_status = "delivered";
									}
									$order_system="Ztorm";
								break;
								case "8": //Vaultn API 주문
									$order_system="Vaultn";
								
									$m_no=$_SESSION['member']['m_no'];
									$m_id=$_SESSION['member']['m_id'];
									
									$params = array(
										"sku"=>$sub_value['item_id'],
										"ipAddress"=>$ip,
										"salesPriceGross"=>$value['price'],
										"clientOrderReference"=>$value['ordno'],
										"clientCustomerReference"=>(string)$_SESSION['member']['m_no'],
									);
									$vaultn_data = $vaultn->runOrderCreate($params);
									$logger->info($vaultn_data);

									if($vaultn_data->orderId){
										$query="insert into tbl_order_item_vaultn set m_no=:m_no,m_id=:m_id,orderId=:orderId,clientOrderReference=:clientOrderReference,sku=:sku,clientCustomerReference=:clientCustomerReference,created=:created,status=:status,salesCurrency=:salesCurrency,salesCountry=:salesCountry,salesCountryCode=:salesCountryCode,salesPriceGross=:salesPriceGross,publisherName=:publisherName,publisherGuid=:publisherGuid,priceModel=:priceModel,priceListGuid=:priceListGuid,countryCode=:countryCode,srpCurrency=:srpCurrency,purchasePriceCurrency=:purchasePriceCurrency,baseSRP=:baseSRP,discountedSRP=:discountedSRP,netDiscountedSRP=:netDiscountedSRP,priceListVAT=:priceListVAT,basePurchasePrice=:basePurchasePrice,promoPercentage=:promoPercentage,netPurchasePrice=:netPurchasePrice,estimatedMargin=:estimatedMargin,provider=:provider,fulfilmentStatus=:fulfilmentStatus,reg_date=now(),ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name ON DUPLICATE KEY UPDATE update_date=now()";
										$stmt = $conn->prepare($query);
										$c_params2 = array(
											":m_no"=>$m_no,
											":m_id"=>$m_id,
											":orderId"=>$vaultn_data->orderId,
											":clientOrderReference"=>$value['ordno'],
											":sku"=>$vaultn_data->orderItemDetails->sku,
											":clientCustomerReference"=>$_SESSION['member']['m_no'],
											":created"=>$vaultn_data->created,
											":status"=>$vaultn_data->status,
											":salesCurrency"=>$vaultn_data->orderDetails->salesCurrency,
											":salesCountry"=>$vaultn_data->orderDetails->salesCountry,
											":salesCountryCode"=>$vaultn_data->orderDetails->salesCountryCode,
											":salesPriceGross"=>$vaultn_data->orderDetails->salesPriceGross,
											":publisherName"=>$vaultn_data->orderDetails->priceListDetails->publisherName,
											":publisherGuid"=>$vaultn_data->orderDetails->priceListDetails->publisherGuid,
											":priceModel"=>$vaultn_data->orderDetails->priceListDetails->priceModel,
											":priceListGuid"=>$vaultn_data->orderDetails->priceListDetails->priceListGuid,
											":countryCode"=>$vaultn_data->orderDetails->priceListDetails->countryCode,
											":srpCurrency"=>$vaultn_data->orderDetails->priceListDetails->srpCurrency,
											":purchasePriceCurrency"=>$vaultn_data->orderDetails->priceListDetails->purchasePriceCurrency,
											":baseSRP"=>$vaultn_data->orderDetails->priceListDetails->baseSRP,
											":discountedSRP"=>$vaultn_data->orderDetails->priceListDetails->discountedSRP,
											":netDiscountedSRP"=>$vaultn_data->orderDetails->priceListDetails->netDiscountedSRP,
											":priceListVAT"=>$vaultn_data->orderDetails->priceListDetails->priceListVAT,
											":basePurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->basePurchasePrice,
											":promoPercentage"=>$vaultn_data->orderDetails->priceListDetails->promoPercentage,
											":netPurchasePrice"=>$vaultn_data->orderDetails->priceListDetails->netPurchasePrice,
											":estimatedMargin"=>$vaultn_data->orderDetails->priceListDetails->estimatedMargin,
											":provider"=>$vaultn_data->orderItemDetails->provider,
											":fulfilmentStatus"=>$vaultn_data->orderItemDetails->fulfilmentStatus,
											":ord_ymd"=>date('Y-m-d'),
											":product_code"=>$value['product_code'],
											":product_name"=>$value['product_name'],
											":Name"=>$sub_value['item_name'],
										);
										$logger->info($c_params2);
										$stmt->execute($c_params2);
										
										if($pay_type=="VCNT"){
											$order_status="3";
											$send_status = "pending";
										} else {
											$order_status="2";
											$send_status = "delivered";
										}
									}else{
										$order_status="1";
										$send_status = "fail";
									}
								break;
								case "9": //Genba API 주문
									$order_system="Genba";
									
									if($value['is_preorder']=="Y"){ // 예약구매
										$reservationid = "";
										$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
										$logger->info($order_response);
										$Created = $order_response->Created;
										$Expiration="";

									}else{ // 일반구매
										$reservation_response = $genba->runGenbaPlaceReservationAsync($sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
										$logger->info($reservation_response);
										
										if($reservation_response->Code=="2007"){ //품절 back-order처리
											$reservationid = "";
											$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
											$logger->info($order_response);
											$Created = $order_response->Created;
											$Expiration="";
										}else{ // 정상판매
											$reservationid = $reservation_response->ID;
											$order_response = $genba->runGenbaPlaceOrderAsync($reservationid,$sub_value['item_id'],$value['price'],$value['order_ppr'],$value['ip']);
											$logger->info($order_response);
											$Created = $reservation_response->Created;
											$Expiration = $reservation_response->Expiration;
										}
									}
									if($order_response->ID){ // Genba 주문성공
										$genba_query = "insert into tbl_order_item_genba set m_no=:m_no,m_id=:m_id,ordno=:ordno,ID=:ID,ClientTransactionID=:ClientTransactionID,Sku=:Sku,Created=:Created,Expiration=:Expiration,State=:State,CommunicatedBuyingPrice=:CommunicatedBuyingPrice,ActualBuyingPrice=:ActualBuyingPrice,NetAmount=:NetAmount,GrossAmount=:GrossAmount,ReservationID=:ReservationID,ord_ymd=:ord_ymd,product_code=:product_code,product_name=:product_name,Name=:Name,Platform=:Platform,Publisher=:Publisher";
										$stmt = $conn->prepare($genba_query);
										$params = array(
											":m_no"=>$_SESSION['member']['m_no'],
											":m_id"=>$_SESSION['member']['m_id'],
											':ordno'=> $value['ordno'],
											':ID' =>$order_response->ID,
											':ClientTransactionID'=> $order_response->ClientTransactionID,
											':Sku' =>$order_response->Sku,
											':Created' =>$Created,
											':Expiration' =>$Expiration,
											':State' =>$order_response->State,
											':CommunicatedBuyingPrice' =>$order_response->CommunicatedBuyingPrice->Amount,
											':ActualBuyingPrice' =>$order_response->ActualBuyingPrice->Amount,
											':NetAmount' =>$order_response->SellingPrice->NetAmount,
											':GrossAmount' =>$order_response->SellingPrice->GrossAmount,
											':ReservationID' =>$order_response->ReservationID,
											":ord_ymd"=>date('Y-m-d'),
											":product_code"=>$value['product_code'],
											":product_name"=>$value['product_name'],
											":Name"=>$sub_value['Name'],
											":Platform"=>$sub_value['Platform'],
											":Publisher"=>$sub_value['Publisher'],
											
										);
										$stmt->execute($params);
										
										if($pay_type=="VCNT"){
											$order_status="3";
											$send_status = "pending";
										} else {
											$order_status="2";
											$send_status = "delivered";
										}
										
									}else{ // Genba 주문실패
										$query="insert into  genba_error_log set ordno=:ordno,sku=:sku,name=:name,Code=:Code,Details=:Details,reg_date=now()";
										$params = array(
											":ordno"=>$value['ordno'],
											":sku"=>$sub_value['item_id'],
											":name"=>$sub_value['Name'],
											":Code"=>$order_response->Code,
											":Details"=>$order_response->Details,
										);
										$stmt->execute($params);
										$order_status="1";
										$send_status = "fail";
									}
								break;
							}
						}
						
						if($pay_type=="VCNT"){
							$order_status="3";
						} else {
							$order_status="2";
						}
						//실물상품 주문
						$query="insert into tbl_order_shipment set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,model_code=:model_code,model_name=:model_name,courier_name=:courier_name,shipment_status=:order_status";
						$stmt = $conn->prepare($query);
						$d_params = array(
							":settle_no"=>$ordr_idxx,
							":ordno"=>$value['ordno'],
							":product_code"=>$value['product_code'],
							":product_name"=>$value['product_name'],
							":model_code"=>$value['model_code'],
							":model_name"=>$value['model_name'],
							":courier_name"=>$buyr_name,
							":order_status"=>$order_status
						);
						$logger->info($d_params);
						$stmt->execute($d_params);
						
					break;
				}

				//##############################################################
				//주문상품내역 정보 업데이트
				//##############################################################
				$query="update tbl_order_item set status=:status,send_status=:send_status,order_system=:order_system where ordno=:ordno";
				$params = array(
					":status"=>$order_status,
					":send_status"=>$send_status,
					":order_system"=>$order_system,
					":ordno"=>$value['ordno'],
				);
				$logger->info($params);
				$stmt = $conn->prepare($query);
				$stmt->execute($params);
			}

			//##############################################################
			//장바구니 삭제
			//##############################################################
			$query = "delete from tbl_cart where m_no=:m_no and selected='1'";
			$stmt = $conn->prepare($query);
			$params = array(
				':m_no'=>$m_no,
			);
			$stmt->execute($params);
			
			//##############################################################
			//사용 적립금 차감
			//##############################################################
			if($use_emoney>0){
				$member->setMemberEmoney($_SESSION['member']['m_no'],$use_emoney,'주문결제시 할인',$ordr_idxx);
			}

			if($escw_yn=="Y" && !$delivery_real){	//에스크로 결제이면서 실물배송상품이 없을 경우 바로 배송완료 등록
				$params = array(
					"settle_no"=>$ordr_idxx,
					"dlvtype"=>"01",
					"rcvdate"=>date('YmdHi'),
					"rcvname"=>$buyr_name,
					"rcvrelation"=>"본인"
				);
				$result = $kcp->regDelivery($params);
				$logger->info("\n####에스크로 배송완료 응답#########\n");
				$logger->info($result);
				$logger->info($params);
			}

			header( "HTTP/1.1 301 Moved Permanently" );
			header( 'Location: https://directg.net/order/order_end.html?settle_no='.$ordr_idxx );
			exit;
		} else {
			header( "HTTP/1.1 301 Moved Permanently" );
			header( 'Location: https://directg.net/order/order_fail.html?msg='.$res_msg);
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
