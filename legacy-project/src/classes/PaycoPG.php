<?php
class PaycoPG{
	protected $sellerKey;
	protected $cpId;
	protected $productId;
	protected $deliveryId;
	protected $deliveryReferenceKey;
	protected $host;
	
	
	public function __construct($mode){
		if($mode=="test"){
			$this->sellerKey= "S0FSJE";
			$this->cpId= "PARTNERTEST";	
			$this->productId= "PROD_EASY";
			$this->host = "https://alpha-api-bill.payco.com";
		}else{
			$this->sellerKey= "GBPT2K"			;									//(필수) 가맹점 코드 - 파트너센터에서 알려주는 값으로, 초기 연동 시 PAYCO에서 쇼핑몰에 값을 전달한다.
			$this->cpId= "DIRECTG"		;									//(필수) 상점ID, 30자 이내
			$this->productId= "DIRECTG_EASYP";									//(필수) 상품ID, 50자 이내
			$this->host = "https://api-bill.payco.com";
		}
		
		$this->deliveryId= "DELIVERY_PROD";									//(필수) 배송비상품ID, 50자 이내
		$this->deliveryReferenceKey= "DV0001";									//(필수) 가맹점에서 관리하는 배송비상품 연동 키, 100자 이내, 고정
	}
	
	//결제창호출
	public function paycoReserve($params){
		$url = $this->host."/outseller/order/reserve";
		
		$method="POST";

		//---------------------------------------------------------------------------------
		// 변수 초기화
		//---------------------------------------------------------------------------------
		$TotalProductPaymentAmt = 0	;		//주문 상품이 여러개일 경우 상품들의 총 금액을 저장할 변수
		$OrderNumber			= 0;		//주문 상품이 여러개일 경우 순번을 매길 변수
		
		//---------------------------------------------------------------------------------
		// 구매 상품을 변수에 셋팅 ( JSON 문자열을 생성 )
		//---------------------------------------------------------------------------------
		$ProductRows = array();				// (필수) 주문서에 담길 상품 목록 생성

		$tmpTotalTaxfreeAmt = 0;			// 면세상품합
		$tmpTotalTaxableAmt = 0;			// 과세상품합
		$tmpTotalVatAmt		= 0;			// 부가세합
		
		//---------------------------------------------------------------------------------
		// 상품정보 값 입력
		//---------------------------------------------------------------------------------
		$OrderNumber					= $OrderNumber + 1;									// 상품에 순번을 정하기 위해 값을 증가합니다.

		$orderQuantity					= 1;												// (필수) 주문수량 (1로 세팅)
		$productUnitPrice				= $params["totalPaymentAmt"];											// (필수) 상품 단가      ( 테스트용으로써 100,000원으로 설정. )
		$productUnitPaymentPrice		= $params["totalPaymentAmt"];										// (필수) 상품 결제 단가 ( 테스트용으로써 100,000원으로 설정. 배송비 설정시 상품가격에 포함시킴 ex)2,500 )
		
		//상품단가(productAmt)는 원 상품단가이고 상품결제단가(productPaymentAmt)는 상품단가에서 할인등을 받은 금액입니다. 실제 결제에는 상품결제단가가 사용됩니다.
		$productAmt						= $productUnitPrice * $orderQuantity;				// (필수) 상품 결제금액(상품단가 * 수량)
		$productPaymentAmt				= $productUnitPaymentPrice * $orderQuantity;		// (필수) 상품 결제금액(상품결제단가 * 수량)
		$TotalProductPaymentAmt			= $TotalProductPaymentAmt + $productPaymentAmt;		// 주문정보를 구성하기 위한 상품들 누적 결제 금액(상품 결제 금액)
		
		//$iOption						= "신발사이즈";									  		// 옵션 ( 최대 100 자리 )
		$sortOrdering					= $OrderNumber;										// (필수) 상품노출순서, 10자 이내
		$productName					= $params["orderTitle"];								// (필수) 상품명, 4000자 이내
		$orderConfirmUrl				= "";												// 주문완료 후 주문상품을 확인할 수 있는 url, 4000자 이내
		$orderConfirmMobileUrl			= "";												// 주문완료 후 주문상품을 확인할 수 있는 모바일 url, 1000자 이내
		$productImageUrl				= "";												// 이미지URL (배송비 상품이 아닌 경우는 필수), 4000자 이내, productImageUrl에 적힌 이미지를 썸네일해서 PAYCO 주문창에 보여줍니다.
		$sellerOrderProductReferenceKey = "ITEM_100001"	;									// 외부가맹점에서 관리하는 주문상품 연동 키(sellerOrderProductReferenceKey)는 주문 별로 고유한 key이어야 한다.
		$taxationType					= "TAXATION";										// 과세타입 : DUTYFREE :면세, COMBINE : 결합상품, TAXATION : 과세

		//---------------------------------------------------------------------------------------------------------------------------------
		// 주문서에 담길 부가 정보를 JSON 으로 작성 (필요시 사용) 
		// payExpiryYmdt			: 해당 주문예약건 만료 처리 일시 
		// virtualAccountExpiryYmd  : 가상계좌만료일시
		//
		// cancelMobileUrl			: 모바일 결제페이지에서 취소 버튼 클릭시 이동할 URL (결제창 이전 URL 등). 미입력시 메인 URL로 이동
		/// 모바일 결제페이지에서 취소 버튼 클릭시 이동할 URL (결제창 이전 URL 등)
		/// 1순위 : 주문예약 > extraData > cancelMobileUrl 값이 있을시 => cancelMobileUrl 이동
		/// 2순위 : 주문예약시 전달받은 returnUrl 이동 + 실패코드(오류코드:2222)
		/// 3순위 : 가맹점 URL로 이동(가맹점등록시 받은 사이트URL)
		/// 4순위 : 이전 페이지로 이동 => history.Back();
		//
		// viewOptions			    : 화면UI옵션(showMobileTopGnbYn : 모바일 상단 GNB 노출여부 , iframeYn : Iframe 호출현재 iframeYN의 용도는 없으며, 차후 iframe 이슈 대응을 위한 필드로 iframe 사용인 경우는 Y로사용 )
		//---------------------------------------------------------------------------------------------------------------------------------
		 
		//$payExpiryYmdt			             	= "20171231180000";	             // 미적용시, 자동으로 만료시간 지정됨.
		//$virtualAccountExpiryYmd					= "20171231180000";
		
		//$appUrl = "payco://";														 // IOS 인앱 결제시 ISP 모바일 등의 앱에서 결제를 처리한 뒤 복귀할 앱 URL
																					 // 앱을 호출하는 url , Safari 에서 호출 테스트  예) payco://  
																					 
		//$cancelMobileUrl 							= $AppWebPath."index.php";       //모바일 PAYCO 결제창 [취소] 버튼 선택
	
		$viewOptionsArry 							= array();                      
		//$viewOptionsArry["showMobileTopGnbYn"]		= "Y";
		$viewOptionsArry["iframeYn"]				= "N";
		//$viewOptions = json_encode($viewOptionsArry);                             // 배열 형태를 JSON 으로 Encode 금지. 주문예약 요청 JSON 형식에 맞지않는 역슬래시가 자동 추가됨.
			
		$extraDataArray								= array();
		//$extraDataArray["payExpiryYmdt"] 			    = $payExpiryYmdt;
		//$extraDataArray["virtualAccountExpiryYmd"] 	= $virtualAccountExpiryYmd;
		
		//$extraDataArray["appUrl"] 					= $appUrl;
		//$extraDataArray["cancelMobileUrl"] 			= $cancelMobileUrl;
		
		$extraDataArray["viewOptions"] 				= $viewOptionsArry; 			
		
		$extraData = addslashes(json_encode($extraDataArray));
			
		//-----------------------------------------------------------------------------------------------------------------------------------------------------------
		// $tmpTotalTaxfreeAmt(면세상품 총액) / $tmpTotalTaxableAmt(과세상품 총액) / $tmpTotalVatAmt(부가세 총액) -> 일부 필요한 가맹점을위한 예제임 (필요시 사용)
		//------------------------------------------------------------------------------------------------------------------------------------------------------------
			
		// 과세상품일 경우
		if( $taxationType == "TAXATION") {
			$tmpTotalTaxableAmt = round($TotalProductPaymentAmt/1.1);
			$tmpTotalVatAmt		= $TotalProductPaymentAmt - $tmpTotalTaxableAmt;

		// 면세상품일 경우
		}
		//---------------------------------------------------------------------------------
		// 상품값으로 읽은 변수들로 Json String 을 작성합니다.
		//---------------------------------------------------------------------------------
		try {
			$ProductsList = array();
			$ProductsList["cpId"]= $this->cpId;
			$ProductsList["productId"]= $this->productId;
			$ProductsList["productAmt"]				= $productAmt;
			$ProductsList["productPaymentAmt"]		= $productPaymentAmt;
			$ProductsList["orderQuantity"]			= $orderQuantity;
			//$ProductsList["option"]					= urlencode($iOption);
			$ProductsList["sortOrdering"]			= $sortOrdering;
			$ProductsList["productName"]			= urlencode($productName);

			if ( $orderConfirmUrl!= "") {		$ProductsList["orderConfirmUrl"]				= $orderConfirmUrl; 				};
			if ( $orderConfirmMobileUrl!= "") {		$ProductsList["orderConfirmMobileUrl"]			= $orderConfirmMobileUrl;			};
			if ( $productImageUrl!= "") {		$ProductsList["productImageUrl"]				= $productImageUrl;};
			if ( $sellerOrderProductReferenceKey!= "") {		$ProductsList["sellerOrderProductReferenceKey"] = $sellerOrderProductReferenceKey;	};	
			array_push($ProductRows, $ProductsList);

		} catch ( Exception $e ) {
			$Error_Return = array();
			$Error_Return["result"]		= "DB_RECORDSET_ERROR";
			$Error_Return["message"]	= $e->getMassage();
			$Error_Return["code"]		= $e->getLine();
			return json_encode($Error_Return);
		}
		
		//---------------------------------------------------------------------------------
		// 주문정보 값 입력 ( 가맹점 수정 가능 부분 )
		//---------------------------------------------------------------------------------
		$sellerOrderReferenceKey		=  $params["sellerOrderReferenceKey"];														// (필수) 외부가맹점의 주문번호
		$sellerOrderReferenceKeyType	= "UNIQUE_KEY";																//  외부가맹점의 주문번호 타입 UNIQUE_KEY 유니크 키 - 기본값, DUPLICATE_KEY 중복 가능한 키( 외부가맹점의 주문번호가 중복 가능한 경우 사용)

		//$sellerOptions = "{\\\"clientIp\\\":\\\"210.206.104.164\\\",\\\"memberId\\\":\\\"userid\\\"}"; // 게임결제용_판매자부가정보
		
		$iCurrency						= "KRW";																	// 통화(default=KRW)

		//$totalOrderAmt				= $TotalProductPaymentAmt;													// (필수) 총 주문금액.
		$totalPaymentAmt				= $TotalProductPaymentAmt;													// (필수) 총 결재 할 금액.
		$orderTitle						= $params["orderTitle"];										// 주문 타이틀	
		
		$returnUrl						= $params["returnUrl"];// 주문완료 후 Redirect 되는 Url
		//---------------------------------------------------------------------------------------------------------------------------------
		//$returnUrlParam 담길 값를 JSON 으로 작성 (필요시 사용)
		//---------------------------------------------------------------------------------------------------------------------------------
		$returnUrlParamArray = array();
		$returnUrlParamArray["m_no"] = $params["m_no"];                      // 회원고유번호
		$returnUrlParamArray["m_id"] = $params["m_id"];                      // 회원아이디
		$returnUrlParamArray["use_emoney"] = $params["use_emoney"];                      // 사용포인트
		
		// 과세상품일 경우
		$returnUrlParamArray["tmpTotalTaxableAmt"] = $tmpTotalTaxableAmt;      // 과세금액
		$returnUrlParamArray["tmpTotalVatAmt"]     = $tmpTotalVatAmt;          // 부과세금액
		
		$returnUrlParamArrayJSON = addslashes(json_encode($returnUrlParamArray));   // {\"cartNo\":\"CartNo_12345\"}
		
		//주문완료 시 PAYCO에서 가맹점의 Service API 호출할때 같이 전달할 파라미터(payco_reserve.php 에서 payco_return.php 로 전달할 값을 JSON 형태의 문자열로 전달)
		$returnUrlParam                = $returnUrlParamArrayJSON;
		//Write_Log("payco_reserve.php is Called - returnUrlParam : $returnUrlParam");
		
		
		$nonBankbookDepositInformUrl=$params["nonBankbookDepositInformUrl"]; //무통장입금완료통보 URL
		$orderMethod= "EASYPAY";																// (필수) 주문유형(=결재유형) - 체크아웃형 : CHECKOUT - 간편결제형+가맹점 id 로그인 : EASYPAY_F , 간편결제형+가맹점 id 비로그인(PAYCO 회원구매) : EASYPAY
		$orderChannel= $params["orderChannel"];// 주문채널 ( default : PC / MOBILE )
		$inAppYn						= "N";																		// 인앱결제 여부( Y/N ) ( default = N )
		$individualCustomNoInputYn		= "N"	;																	// 개인통관고유번호 입력 여부 ( Y/N ) ( default = N )
		$orderSheetUiType				= "GRAY";																	// 주문서 UI 타입 선택 ( 선택 가능값 : RED / GRAY )
		$payMode						= "PAY2";																	// 결제모드 ( PAY1 - 결제인증, 승인통합 / PAY2 - 결제인증, 승인분리 )
		
		//-----------------------------------------------------------------------------------------------------------------------------------------------------------
		// $tmpTotalTaxfreeAmt(면세상품 총액) / $tmpTotalTaxableAmt(과세상품 총액) / $tmpTotalVatAmt(부가세 총액) -> 일부 필요한 가맹점을위한 예제임 (필요시 사용)
		//------------------------------------------------------------------------------------------------------------------------------------------------------------

		$totalTaxfreeAmt				= $tmpTotalTaxfreeAmt;														// 면세금액(면세상품의 공급가액 합)					
		$totalTaxableAmt				= $tmpTotalTaxableAmt;														// 과세금액(과세상품의 공급가액 합)
		$totalVatAmt					= $tmpTotalVatAmt;															// 부가세(과세상품의 부가세 합)
		
		//---------------------------------------------------------------------------------
		// 설정한 주문정보들을 Json String 을 작성합니다.
		//---------------------------------------------------------------------------------		

		$json = array();
		try {
			$strJson = array();
			$strJson["sellerKey"]= $this->sellerKey;
			$strJson["sellerOrderReferenceKey"]= $sellerOrderReferenceKey;
			$strJson["sellerOrderReferenceKeyType"] = $sellerOrderReferenceKeyType;
			
			// $strJson["sellerOptions"] = $sellerOptions; // 게임결제용_판매자부가정보
			
			$strJson["totalPaymentAmt"]			= $totalPaymentAmt;
			$strJson["orderTitle"]				= urlencode($orderTitle);
			$strJson["orderMethod"]				= $orderMethod;		
			if ( $iCurrency						!= "") {		$strJson["currency"]					= $iCurrency;					};
			if ( $returnUrl						!= "") {		$strJson["returnUrl"]					= $returnUrl;					};
			if ( $returnUrlParam				!= "") {		$strJson["returnUrlParam"]				= $returnUrlParam;				};
			if ( $nonBankbookDepositInformUrl	!= "") {		$strJson["nonBankbookDepositInformUrl"] = $nonBankbookDepositInformUrl;	};		
			if ( $orderChannel					!= "") {		$strJson["orderChannel"]				= $orderChannel;				};
			if ( $inAppYn						!= "") {		$strJson["inAppYn"]						= $inAppYn;						};
			if ( $individualCustomNoInputYn		!= "") {		$strJson["individualCustomNoInputYn"]	= $individualCustomNoInputYn;	};
			if ( $orderSheetUiType				!= "") {		$strJson["orderSheetUiType"]			= $orderSheetUiType;			};
			if ( $payMode						!= "") {		$strJson["payMode"] = $payMode;											};
			
		//-----------------------------------------------------------------------------------------------------------------------------------------------------------
		// $tmpTotalTaxfreeAmt(면세상품 총액) / $tmpTotalTaxableAmt(과세상품 총액) / $tmpTotalVatAmt(부가세 총액) -> 일부 필요한 가맹점을위한 예제임 (필요시 사용)
		//------------------------------------------------------------------------------------------------------------------------------------------------------------
			$strJson["totalTaxfreeAmt"]			= $totalTaxfreeAmt;
			$strJson["totalTaxableAmt"]			= $totalTaxableAmt;
			$strJson["totalVatAmt"]				= $totalVatAmt;

			$strJson["extraData"]				= $extraData;
			$strJson["orderProducts"]			= $ProductRows;

			$data = urldecode(stripslashes(json_encode($strJson)));
		} catch ( Exception $e ) {
			$Error_Return				= array();
			$Error_Return["result"]		= "RESERVE_ERROR";
			$Error_Return["message"]	= $e->getMassage();
			$Error_Return["code"]		= $e->getCode();
			Write_Log("payco_reserve.php Logical Error : Code - ".$e->getCode().", Description - ".$e->getMessage());
			return json_encode($Error_Return);
		}
		
		//주문예약 API - REQUEST
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		
		//print_r($response);
		
		if($data['code']=="0") {
			//주문예약 API - RESPONSE
			// reserveOrderNo - 주문예약 API 호출에 따른 PAYCO 주문예약 번호
			// orderSheetUrl - PAYCO 결제창(주문서) URL 입니다. 해당 URL을 팝업으로 Open 하시면 결제창이 호출됩니다.
			//echo $data['result']['reserveOrderNo'];
			//echo $data['result']['orderSheetUrl'];
			//echo $response;
			return $response;
		}else{
			print_r($data);
		}
	}
	
	//결제승인 API - REQUEST
	public function paycoApproval($params){
		$url = $this->host."/outseller/payment/approval";
		
		$method="POST";
		
		$json = array();
		try {
			$strJson = array();
			$strJson["sellerKey"]= $this->sellerKey; //PAYCO에서 전달받은 가맹점 고유 코드입니다.
			$strJson["reserveOrderNo"]= $params['reserveOrderNo']; // 결제건에 대한 PAYCO 주문예약번호 입니다.
			$strJson["sellerOrderReferenceKey"] = $params['sellerOrderReferenceKey']; //가맹점에서 사용하는 거래 주문번호(고유번호) 이며, 기본적으로 값은 유니크 해야합니다.
			$strJson["paymentCertifyToken"] = $params['paymentCertifyToken']; // 결제승인을 위한 결제인증토큰 입니다. 결제승인 API 호출 시 필요합니다.
			$strJson["totalPaymentAmt"]			= $params['totalPaymentAmt'];

			$data = urldecode(stripslashes(json_encode($strJson)));
		} catch ( Exception $e ) {
			$Error_Return				= array();
			$Error_Return["result"]		= "RESERVE_ERROR";
			$Error_Return["message"]	= $e->getMassage();
			$Error_Return["code"]		= $e->getCode();
			return json_encode($Error_Return);
		}
		
		//주문예약 API - REQUEST
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		/*
			결제승인 API - RESPONSE
		*/
		//print_r($response);
		return $response;
		
	}
	
	//결제취소 API - REQUEST
	public function paycoCancel($params){
		$url = $this->host."/outseller/order/cancel";
		
		$method="POST";
		$json = array();
		try {
			$strJson = array();
			$strJson["sellerKey"]= $this->sellerKey;
			$strJson["orderNo"]= $params['orderNo'];
			$strJson["cancelTotalAmt"]= $params['cancelTotalAmt'];
			$strJson["orderCertifyKey"]= $params['orderCertifyKey'];
			
			$data = urldecode(stripslashes(json_encode($strJson)));
			
		} catch ( Exception $e ) {
			$Error_Return				= array();
			$Error_Return["result"]		= "RESERVE_ERROR";
			$Error_Return["message"]	= $e->getMassage();
			$Error_Return["code"]		= $e->getCode();
			return json_encode($Error_Return);
		}
		
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		/*
			결제승인 API - RESPONSE
		*/
		//print_r($response);
		return $response;
	}
	
	
	//결제상세조회 API - REQUEST
	public function paycoGetDetailForVerify($params){
		$url = $this->host."/outseller/payment/approval/getDetailForVerify";
		
		$method="POST";
		
		//sellerKey
		//reserveOrderNo
		//sellerOrderReferenceKey

		$json = array();
		try {
			$strJson = array();
			$strJson["sellerKey"]= $this->sellerKey; //PAYCO에서 전달받은 가맹점 고유 코드입니다.
			$strJson["reserveOrderNo"]= $params['reserveOrderNo']; // 결제건에 대한 PAYCO 주문예약번호 입니다.
			$strJson["sellerOrderReferenceKey"] = $params['sellerOrderReferenceKey']; //가맹점에서 사용하는 거래 주문번호(고유번호) 이며, 기본적으로 값은 유니크 해야합니다.

			$data = urldecode(stripslashes(json_encode($strJson)));
		} catch ( Exception $e ) {
			$Error_Return				= array();
			$Error_Return["result"]		= "RESERVE_ERROR";
			$Error_Return["message"]	= $e->getMassage();
			$Error_Return["code"]		= $e->getCode();
			return json_encode($Error_Return);
		}
		
		//상세조회 API - REQUEST
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		/*
			결제승인 API - RESPONSE
		*/
		//print_r($response);
		return $response;

	}
	
	//가맹점용 영수증 Sample URL: https://bill.payco.com/seller/receipt/{sellerKey}/{sellerOrderReferenceKey}/{orderNo}
}
?>