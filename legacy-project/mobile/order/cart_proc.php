<?
ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_cart_mobile.xml');
$logger = Logger::getLogger("mobile");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_SANITIZE_STRING);

if($_SESSION['member']['m_id']==""){
	$response =array(
		"error_code"=>"99",
		"error_msg"=>"로그인 이후에 이용이 가능합니다."
	);
	echo json_encode($response);
	exit;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$goods = new Goods($conn);
	$order = new Order($conn);
	$member = new Member($conn);
	
	$asset = new Asset();

	switch($mode){
		//헤더/사이드바 배지 값 — 담기 알림을 닫을 때 호출된다(새로고침 대신 배지만 다시 그림)
		//값만 반환하고 그리는 것은 sub_header.html / sidebar.html 이 담당한다. 응답 : {"cart_cnt":3,"cart_promo":1,"wish_promo":0}
		case "header_badge":
			header("Content-Type:application/json; charset=utf-8");
			echo json_encode($goods->getHeaderBadge($_SESSION['member']['m_no']));
			exit;
		break;

		case "add_cart":
			if($goods_sku==""){
				$response =array(
					"error_code"=>"99",
					"error_msg"=>"잘못된 접근입니다."
				);
				echo json_encode($response);
				$logger->info($response);
				exit;
			}
			$cart_list = $order->getCartList($_SESSION['member']['m_no']);
			
			if(count($cart_list)>=20){
				$response =array(
					"error_code"=>"99",
					"error_msg"=>"장바구니는 최대 20개까지 담을 수 있습니다."
				);
				echo json_encode($response);
				
				$logger->info($response);
				exit;
			}
			
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
			
			//계정당 구매수량제한 확인
			$member_purchase_chk = $order->memberPurchaseLimitChk($_SESSION['member']['m_id'],$goods_item_info['product_code'],$goods_item_info['product_name']);
			$logger->info($member_purchase_chk);
			
			if($member_purchase_chk['is_order']=="fail"){
				$response =array(
					"error_code"=>"99",
					"error_msg"=>$member_purchase_chk['msg']
				);
				echo json_encode($response);
				
				$logger->info($response);
				exit;
			}
			
			//연령제한 여부 확인
			$logger->info("============상품연령제한정보==========");
			$goods_age_data = $goods->getGoodsItemAgeLimit($goods_item_info['product_code']);
			//$logger->info($goods_age_data['age_limit']);
			//$logger->info("============연령제한 여부 확인==========");
			//$age=$member->getMemberAge($_SESSION['member']['m_id']);
			$logger->info($_SESSION['member']['m_id']);
			//$logger->info($age);
			
			if($goods_age_data['age_limit']=="19"){
				$is_purcharse = $member->isAuthAdult($_SESSION['member']['m_id'],$goods_age_data['age_limit']);
				$logger->info($is_purcharse);
				
			}else if($goods_item_info['is_auth']=="Y"){
				//본인인증 필수 상품 (성인여부 무관, 실명인증만 확인)
				$is_purcharse = $member->isAuthSelf($_SESSION['member']['m_id']);
				$logger->info($is_purcharse);
			}else{
				$is_purcharse = "OK";
				$logger->info($is_purcharse);
			}
			
			switch($is_purcharse){
				case "NO_AUTH":
					$response =array(
						"error_code"=>"99",
						"error_msg"=>"본 상품은 청소년 이용불가 상품으로 본인 인증 후 만 19세 이상 회원분들만 구매가 가능한 상품입니다. <br/>본인 인증은 마이페이지 > 회원정보 > 계정 설정 메뉴에서도 가능합니다. "
					);
					echo json_encode($response);
					
					$logger->info($response);
					exit;
				break;
				case "NO_PURCHARSE":
					$response =array(
						"error_code"=>"99",
						"error_msg"=>"본 상품은 청소년 이용불가 상품으로 본인 인증 후 만 19세 이상 회원분들만 구매가 가능한 상품입니다. "
					);
					echo json_encode($response);

					$logger->info($response);
					exit;
				break;
				case "NO_SELF_AUTH":
					$response =array(
						"error_code"=>"99",
						"error_msg"=>"본 상품은 구매 시 본인 인증이 필요한 상품입니다. <br/>본인 인증은 마이페이지 > 회원정보 > 계정 설정 메뉴에서 가능합니다. "
					);
					echo json_encode($response);

					$logger->info($response);
					exit;
				break;
			}
			
			//재고여부 확인
			$delivery_item_list = $order->getGoodsItemDelivery($goods_item_info['product_code']);
			
			foreach($delivery_item_list as $delivery_item){
				switch($delivery_item['order_system']){
					case "1":
						$stock = $asset->runAssetStock($delivery_item['item_id']);
						if($stock<=0){
							$goods->setGoodsItemSoldout($goods_item_info['product_code']);
							$response =array(
								"error_code"=>"99",
								"error_msg"=>"해당 상품은 품절되었습니다."
							);
							echo json_encode($response);
							
							$logger->info($response);
							exit;
						}
					break;
				}
			}
			
			$logger->info("\n============장바구니 상품추가==========");
			
			$ip = get_client_ip_env();
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"product_type"=>$goods_item_info['option_type'],
			);
			$logger->info($request_params);

			$result = $order->addCart($request_params);
			if($result=="success"){
				$response =array(
					"error_code"=>"0",
					"error_msg"=>"성공"
				);
				echo json_encode($response);
				exit;

			}else{
				$response =array(
					"error_code"=>"99",
					"error_msg"=>"이미 장바구니에 해당 상품이 존재합니다."
				);
				echo json_encode($response);
				exit;
			}
		break;
		case "cart_item_select":
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
		
			if($goods_item_info['promotion']['sale_price']>0){
				$price = $goods_item_info['promotion']['sale_price'];
			}else{
				$price = $goods_item_info['price'];
			}
		
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"price"=>$price
			);
			$order->setCartItemSelect($request_params);
		break;
		case "cart_item_deselect":
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
		
			if($goods_item_info['promotion']['sale_price']>0){
				$price = $goods_item_info['promotion']['sale_price'];
			}else{
				$price = $goods_item_info['price'];
			}
		
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"price"=>$price
			);
			$order->setCartItemDeselect($request_params);
		break;
		case "del_cart":
			//장바구니 삭제
			$logger->info("============장바구니 삭제==========");
			$ip = get_client_ip_env();
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
			);
			$logger->info($request_params);
			$order->deleteCart($request_params);
		break;
	}

}catch(Exception $e){
	//echo 'Error!: '.$e->getMessage();
	die();
}
?>