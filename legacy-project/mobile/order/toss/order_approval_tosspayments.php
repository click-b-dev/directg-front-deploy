<?php
	ini_set('display_errors', '0');
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Cache-Control: no-store");
    header("Pragma: no-cache");
    header("Content-type: application/json; charset=utf-8");

	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss_mobile.xml');
	$logger = Logger::getLogger("mobile");

	require_once($_SERVER["DOCUMENT_ROOT"]."/../lib/TOSSPAYMENTSComLibrary.php");
	$logger->info($_POST);

    $charSetType      = "utf-8";


    $siteCode         = $_POST[ "site_cd"     ];
    $ordr_idxx          = $_POST[ "ordr_idxx" ]; // 주문번호
    $good_mny           = $_POST[ "good_mny" ]; // 결제 금액
    $good_name          = $_POST[ "good_name" ]; // 상품명
    $pay_method         = $_POST[ "pay_method" ]; // 결제수단
    $Ret_URL            = $_POST[ "Ret_URL" ]; // 리턴 URL
    /* ============================================================================== */
    $actionResult       = $_POST[ "ActionResult" ]; // pay_method에 매칭되는 값 (인증창 호출 시 필요)
    $van_code           = $_POST[ "van_code" ]; // (포인트,상품권 인증창 호출 시 필요)
	
	$escw_used = filter_input(INPUT_POST, 'escw_used', FILTER_SANITIZE_STRING);
	$deli_term = filter_input(INPUT_POST, 'deli_term', FILTER_SANITIZE_STRING);
	
	$use_emoney = filter_input(INPUT_POST, 'use_emoney', FILTER_SANITIZE_STRING);
	$zipcode = filter_input(INPUT_POST, 'zipcode', FILTER_SANITIZE_STRING);
	$address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
	$address2 = filter_input(INPUT_POST, 'address2', FILTER_SANITIZE_STRING);
	$buyr_name = filter_input(INPUT_POST, 'buyr_name', FILTER_SANITIZE_STRING);
	$buyr_tel2 = filter_input(INPUT_POST, 'buyr_tel2', FILTER_SANITIZE_STRING);
	$msg = filter_input(INPUT_POST, 'msg', FILTER_SANITIZE_STRING);
	$user_agent = filter_input(INPUT_POST, 'user_agent', FILTER_SANITIZE_STRING);


    // Access Credential 
    $accessLicense    = "";
    $signature        = "";
    $timestamp        = "";

    // Base Request Type 
    $detailLevel      = "0";
    $requestApp       = "WEB";
    $requestID        = $ordr_idxx;
    $userAgent        = $_SERVER['HTTP_USER_AGENT'];
    $version          = "0.1";
	
	if($_SESSION['member']["m_id"]==""){
		$arr_data=array(
			"resCD"=>99,
			"resMsg"=>"세션만료"
		);
		$json_data = json_encode($arr_data);
		echo $json_data;
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
		$toss = new Tossadapter("");

		$totalPaymentAmt=0;
		$cart_item_list = $order->getCartItemList($_SESSION['member']['m_no']);
		foreach($cart_item_list as $key=>$value){
			if(is_array($value['promotion'])){
				$price = $value['promotion']['sale_price'];
			}else{
				$price = $value['price'];
			}

			$totalPaymentAmt+=$price;
		}

		if($use_emoney>0){
			$member_emoney = $member->getMemberEmoney($_SESSION['member']['m_no']);
			$totalPaymentAmt = $totalPaymentAmt-$use_emoney;

			if($member_emoney<$use_emoney){
				$arr_data=array(
					"resCD"=>"NG_POINT",
					"resMsg"=>"보유한 포인트보다 많은 포인트는 사용하실 수 없습니다."
				);
				$json_data = json_encode($arr_data);
				echo $json_data;
				exit;
			}
		}

		/****** TOSS 퀵계좌이체 거래등록 ******/
		try{
			$apiUrl = "https://customized-api.tosspayments.com/k/legacy/payment/register";
			$payService = new PayService($apiUrl);
			// $payService = new PayService( $g_wsdl ); 기존 PG사 모듈 호출하는 영역

			$payService->setCharSet( $charSetType );
			
			$payService->setAccessCredentialType( $accessLicense, $signature, $timestamp );
			$payService->setBaseRequestType( $detailLevel, $requestApp, $requestID, $userAgent, $version );
			$payService->setApproveReq( $escw_used, $ordr_idxx, $good_mny, "BANK", $good_name, $Ret_URL, $siteCode );
			$approveRes = $payService->approve();

			$logger->info("\n####거래등록 응답정보API#########\n");
			$logger->info($payService);
			$logger->info($approveRes);

			if($payService->resCD=="0000"){
				$response = array(
					"approvalKey" => $approveRes->approvalKey,
					"payUrl" => $approveRes->payUrl,
					"resCD"=>$payService->resCD,
					"resMsg"=>$payService->resMsg
				);
				$logger->info($response);

				$json_data = json_encode($response);
			}
		} catch (SoapFault $ex ){
			$logger->info($ex);
		}
		/*****************************************/

		/* 
		==========================================================================
		거래등록 응답정보                                                               
		--------------------------------------------------------------------------
		*/
		$res_cd      = ""; // 응답코드
		$res_msg     = ""; // 응답메세지
		$approvalKey = ""; // 거래등록키
		$traceNo     = ""; // 추적번호
		$PayUrl      = ""; // 거래등록 PAY URL
		
		$res_cd      = $response["resCD"];
		$res_msg     = $response["resMsg"];
		$approvalKey = $response["approvalKey"];
		$traceNo     = $response["traceNo"];
		$PayUrl      = $response["payUrl"];
		
		$settlekind = "toss_bank";
		
		if($res_cd=="0000"){ //거래등록 성공시
		//거래등록 응답 저장
			$ip = get_client_ip_env();
		
			$logger->info("\n####주문서 저장#########\n");
			$query = "insert into tbl_order set settle_no=:settle_no,m_no=:m_no,m_id=:m_id,ord_ymd=:ord_ymd,ip=:ip,use_emoney=:use_emoney,total_price=:total_price,payment_method=:payment_method,pg_provider='toss',step='1',reg_date=now(),is_mobile='Y',version='3'";
			$stmt = $conn->prepare($query);
			$params = array(
				':settle_no'=>$ordr_idxx,
				':m_no'=>$_SESSION['member']['m_no'],
				':m_id'=>$_SESSION['member']['m_id'],
				':ord_ymd'=>date('Y-m-d'),
				':ip'=>$ip,
				':use_emoney'=>$use_emoney,
				':total_price'=>$totalPaymentAmt,
				':payment_method'=>$settlekind,
			);
			$logger->info($params);
			$stmt->execute($params);
		
			/*######################################################################
			배송지 정보 저장
			*/######################################################################
			if($zipcode){
				$logger->info("\n####배송지 저장#########\n");
				$query = "insert into tbl_order_address set settle_no=:settle_no,m_id=:m_id,name=:name,zipcode=:zipcode,address=:address,address_detail=:address_detail,tel=:tel,msg=:msg,reg_date=now()";
				$stmt = $conn->prepare($query);
				$params = array(
					':settle_no'=>$ordr_idxx,
					':m_id'=>$_SESSION['member']['m_id'],
					':name'=>$buyr_name,
					':zipcode'=>$zipcode,
					':address'=>$address,
					':address_detail'=>$address2,
					':tel'=>$buyr_tel2,
					':msg'=>$msg,
				);
				$logger->info($params);
				$stmt->execute($params);
			}
		
			$cart_item_list = $order->getCartItemList($_SESSION['member']['m_no']);
			
			$item_count = 1;
			
			$logger->info("\n####주문서 상세저장#########\n");
			foreach($cart_item_list as $key=>$value){
				$ordno = $ordr_idxx."_".$item_count;
				if($value['promotion']['sale_price']>0){
					$price = $value['promotion']['sale_price'];
					$is_promotion = "Y";
					$order_srp = $value['promotion']['promotion_srp'];
				}else{
					$price = $value['price'];
					$is_promotion = "N";
					$order_srp = $value['product_srp'];
				}
				
				if($value['is_repay']=="Y"){
					$repay_point = $order->getOrderRepay($_SESSION['member']['m_id'],$price,$value['product_code']);
				}else{
					$repay_point = "0";
				}
				
				$i_query = "insert into tbl_order_item set settle_no=:settle_no,ordno=:ordno,product_code=:product_code,product_name=:product_name,quantity='1',status='1',delivery_type=:delivery_type,goods_price=:goods_price,price=:price,order_srp=:order_srp,order_ppr=:order_ppr,publisher_code=:publisher_code,m_no=:m_no,m_id=:m_id,ip=:ip,is_preorder=:is_preorder,is_promotion=:is_promotion,version='3',repay=:repay,order_date=now()";
				$stmt = $conn->prepare($i_query);
				$i_params = array(
					':settle_no'=>$ordr_idxx,
					':ordno'=>$ordno,
					':product_code'=>$value['product_code'],
					':product_name'=>$value['product_name'],
					':delivery_type'=>$value['delivery_type'],
					':goods_price'=>$value['consumer_price'],
					':price'=>$price,
					':order_srp'=>$order_srp,
					':order_ppr'=>$value['product_ppr'],
					':publisher_code'=>$value['publisher_code'],
					':m_no'=>$_SESSION['member']['m_no'],
					':m_id'=>$_SESSION['member']['m_id'],
					':ip'=>$ip,
					':is_preorder'=>$value['is_preorder'],
					':is_promotion'=>$is_promotion,
					':repay'=>$repay_point,
				);
				$logger->info($i_params);
				$stmt->execute($i_params);
				$item_count++;
			}
			
			echo $json_data;
		}else{//거래등록 실패시
			echo $json_data;
		}
	}catch(Exception $e){
		echo 'Error!: '.$e->getMessage();
		die();
	}

?>