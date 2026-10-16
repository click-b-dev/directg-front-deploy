<?
ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_cart.xml');
$logger = Logger::getLogger("pc");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_SANITIZE_STRING);
$goods_sku_arr = filter_input(INPUT_POST, 'goods_sku_arr', FILTER_SANITIZE_STRING,FILTER_FORCE_ARRAY);

if($_SESSION['member']['m_id']==""){
	/*
	$response =array(
		"error_code"=>"99",
		"error_msg"=>"로그인 이후에 이용이 가능합니다."
	);
	echo json_encode($response);
	exit;
	*/
	echo "<div class='text-center font-14 py-5'>로그인 이후에 이용이 가능합니다.</div>";
	exit;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$member = new Member($conn);
	$goods = new Goods($conn);
	$order = new Order($conn);
	
	$asset = new Asset();

	switch($mode){
		//헤더 배지 값 — 담기 모달을 닫을 때 호출된다(새로고침 대신 배지만 다시 그림)
		//값만 반환하고 그리는 것은 header.html 이 담당한다. 응답 : {"cart_cnt":3,"cart_promo":1,"wish_promo":0}
		case "header_badge":
			header("Content-Type:application/json; charset=utf-8");
			echo json_encode($goods->getHeaderBadge($_SESSION['member']['m_no']));
			exit;
		break;

		case "add_cart":
			if($goods_sku==""){
				echo "<div class='text-center font-14 py-5'>잘못된 접근입니다.</div>";
				exit;
			}
			$cart_list = $order->getCartList($_SESSION['member']['m_no']);
			
			if(count($cart_list)>=20){
				echo "<div class='text-center font-14 py-5'>장바구니는 최대 20개까지 담을 수 있습니다.</div>";
				$logger->info("=======최대 수량========");
				exit;
			}
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
			
			if($goods_item_info['product_code']==""){
				echo "<div class='text-center font-14 py-5'>잘못된 접근입니다.</div>";
				exit;
			}
			
			$ip = get_client_ip_env();
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"product_type"=>$goods_item_info['option_type'],
			);
			$logger->info($request_params);
			
			//계정당 구매수량제한 확인
			$member_purchase_chk = $order->memberPurchaseLimitChk($_SESSION['member']['m_id'],$goods_item_info['product_code'],$goods_item_info['product_name']);
			
			if($member_purchase_chk['is_order']=="fail"){
				echo "<div class='text-center font-14 py-5'>".$member_purchase_chk['msg']."</div>";
				exit;
			}
			
			//재고여부 확인
			$delivery_item_list = $order->getGoodsItemDelivery($goods_item_info['product_code']);
			foreach($delivery_item_list as $delivery_item){
				switch($delivery_item['order_system']){
					case "1":
						$stock = $asset->runAssetStock($delivery_item['item_id']);
						if($stock<=0){
							$goods->setGoodsItemSoldout($goods_item_info['product_code']);
							echo "<div class='text-center font-14 py-5'>해당 상품은 품절되었습니다.</div>";
							exit;
						}
					break;
				}
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
					echo "<div class='text-center font-14 py-5'>본 상품은 청소년 이용불가 상품으로 본인 인증 후 만 19세 이상 회원분들만 구매가 가능한 상품입니다. 아래의 본인 인증 바로가기를 클릭해주십시요.<br/>본인 인증은 마이페이지 > 회원정보 > 계정 설정 메뉴에서도 가능합니다. <br/><br/><a href='/mypage/account_settings.html' style='color:#ffffff'>본인인증 바로가기</a></div>";
					$logger->info("본 상품은 청소년 이용불가 상품으로 본인 인증 후 만 19세 이상 회원분들만 구매가 가능한 상품입니다. 아래의 본인 인증 바로가기를 클릭해주십시요.");
					exit;
				break;
				case "NO_PURCHARSE":
					echo "<div class='text-center font-14 py-5'>본 상품은 청소년 이용불가 상품으로 본인 인증 후 만 19세 이상 회원분들만 구매가 가능한 상품입니다.</div>";
					$logger->info("본 상품은 청소년 이용불가 상품으로 본인 인증 후 만 19세 이상 회원분들만 구매가 가능한 상품입니다.");
					exit;
				break;
				case "NO_SELF_AUTH":
					echo "<div class='text-center font-14 py-5'>본 상품은 구매 시 본인 인증이 필요한 상품입니다. 아래의 본인 인증 바로가기를 클릭해주십시요.<br/>본인 인증은 마이페이지 > 회원정보 > 계정 설정 메뉴에서도 가능합니다. <br/><br/><a href='/mypage/account_settings.html' style='color:#ffffff'>본인인증 바로가기</a></div>";
					$logger->info("본 상품은 구매 시 본인 인증이 필요한 상품입니다.");
					exit;
				break;
			}
			$logger->info("============장바구니 상품추가==========");
			$logger->info($_SERVER['HTTP_REFERER']);
			$result = $order->addCart($request_params);
			$logger->info($result);
			$goods_price=0;
			if($result=="success"){
?>
		<div class="alert text-warning rounded-0 px-1 py-0">
			<h5 class="alert-heading"><i class="uil uil-exclamation-triangle"></i> 유의사항</h5>
			<p class="font-13 lh-sm mb-1"><i class="mdi mdi-circle-medium"></i> 선택하신 상품의 이름,플랫폼,가격 등의 정보를 다시 한번 확인해 주시기 바랍니다.</p>
			<p class="font-13 lh-sm mb-1"><i class="mdi mdi-circle-medium"></i> 장바구니에 담긴 이후 상품 가격, 재고, 프로모션 여부, 특전제공 여부의 내용은 변경될 수 있습니다. 주문 전 다시 한 번 확인해 주시기 바랍니다.</p>
		</div>
		<div class="card rounded-0">
			<div class="row g-0">
				<div class="col-md-3 rounded-0">
					<div class="position-relative">
						<img src="/upload/product/<?=$goods_item_info['product_code']?>/header/header.jpg" class="img-fluid rounded-0 w-100 h-100">
						<div class="position-absolute bottom-0 start-0">
							<? 
								switch($goods_item_info['game_type']){
									case "game":
										switch($goods_item_info['display_type']){
											case "basic":
							?>
							<span class="badge bg-info rounded-0 font-14 py-2">기본게임</span>
							<?
											break;
											case "edition":
							?>
							<span class="badge bg-primary rounded-0 font-14 py-2">에디션</span>
							<?
											break;
											case "multi":
							?>
							<span class="badge bg-warning">멀티팩</span>
							<?
											break;
										}
									break;
									case "dlc":
							?>
							<span class="badge bg-content rounded-0 font-14 py-2">DLC</span>
							<?
									break;
									case "music":
							?>
							<span class="badge bg-content rounded-0 font-14 py-2">Music</span>
							<?
									break;
									case "bundle":
							?>
							<span class="badge bg-success rounded-0 font-14 py-2">번들</span>
							<?
									break;
									case "holomodels":
										switch($goods_item_info['display_type']){
											case "holomodels":
								?>
								<span class="badge bg-success rounded-0 font-14 py-2">본체</span>
								<?
											break;
											case "holomodelsdlc":
								?>
								<span class="badge bg-content rounded-0 font-14 py-2">DLC</span>
								<?
											break;
											case "holomodelsedition":
								?>
								<span class="badge bg-primary rounded-0 font-14 py-2">에디션</span>
								<?
											break;
										}
									break;
								}
							?>
						</div>
					</div>
				</div>
				<div class="col-md-9">
					<div class="row g-0 overflow-hidden flex-md-row shadow-sm position-relative">
						<div class="col py-1 px-3 d-flex flex-column position-static">
							<h5 class="mb-3"><?=$goods_item_info['product_name']?></h5>
							<div class="mb-3 text-body-secondary">
								<?if($goods_item_info['release_date']>'1990-01-01 00:00:00'){?><span class="badge rounded-2 bg-label font-12 fw-500"><?=date('Y-m-d',strtotime($goods_item_info['release_date']))?> 출시</span><?}?>

								<?if($goods_item_info['spoken_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500">음성 한국어</span><?}?>
								<?if($goods_item_info['interface_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500">인터페이스/자막 한글</span><?}?>
								<?if($goods_item_info['exclusive_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500">독점 한국어</span><?}?>

								<?if($goods_item_info['delivery_type']=='1'){?><span class="badge badge-outline-success rounded-2 font-12 fw-500">코드발송</span><?}?>
								<?if($goods_item_info['delivery_type']=='2'){?><span class="badge badge-outline-post rounded-2 font-12 fw-500">택배발송</span><?}?>
								<?if($goods_item_info['delivery_type']=='3'){?><span class="badge badge-outline-code-post rounded-2 font-12 fw-500">코드+택배발송</span><?}?>

								<?if($goods_item_info['is_promotion']=="Y"){?><span class="badge rounded-2 badge-outline-danger font-12 fw-500">프로모션</span><?}?>
								<?if($goods_item_info['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning font-12 fw-500">예약구매</span><?}?>
								<?if($goods_item_info['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info font-12 fw-500">특전</span><?}?>
							</div>
							<div class="product-price">
								<div class="d-flex flex-row align-items-end justify-content-start">
									<?if($goods_item_info['promotion']['discount_rate']>0){?>
										<div class="rounded-2 bg-danger font-14 fw-bold px-3 py-1 me-2 num minus"><?=$goods_item_info['promotion']['discount_rate']?> %</div>
										<strong class="num fs-5 fw-bold text-white me-2 won"> <?=number_format($goods_item_info['promotion']['sale_price'])?></strong>
										<s class="num font-11 won"> <?=number_format($goods_item_info['consumer_price'])?></s>
									<?
												$goods_price=$goods_item_info['promotion']['sale_price'];
										}else{
											if($goods_item_info['discount']>0){
									?>
										<div class="rounded-2 bg-primary font-14 fw-bold px-3 py-1 me-2 num minus"><?=$goods_item_info['discount']?> %</div>
										<strong class="num fs-5 fw-bold text-white me-2 won"> <?=number_format($goods_item_info['price'])?></strong>
										<s class="num font-11 won"> <?=number_format($goods_item_info['consumer_price'])?></s>
									<?
												$goods_price=$goods_item_info['price'];
											}else{
									?>
										<strong class="num fs-5 fw-bold text-white me-2 won"> <?=number_format($goods_item_info['price'])?></strong>
									<?
												$goods_price=$goods_item_info['price'];
											}
										}
									?>
								</div>
							</div>
						</div>
						<div class="col-auto d-none d-lg-block">
							<? 
								switch($goods_item_info['product_platform']){
									case "1":
							?>
							<div class="mw-100 text-end"><img src="/assets/images/platform/Platform_logo_steam.png" class="w-75"></div>
							<?
									break;
									case "34":
							?>
							<div class="w-75 text-end"><img src="/assets/images/platform/Platform_logo_epic.png" class="w-75 "></div>
							<?
									break;
									case "35":
							?>
							<div class="w-75 text-end"><img src="/assets/images/platform/Platform_logo_rockstar.png" class="w-75"></div>
							<?
									break;
									case "51":
							?>
							<div class="w-75 text-end"><img src="/assets/images/platform/Platform_logo_holomodels.svg" class="w-75"></div>
							<?
									break;
								}
							?>
						</div>
					</div>
				</div>
			</div>
		</div>
		<script>
		gtag('event', 'add_to_cart', {
			currency: 'KRW',
			value: <?=$goods_price?>,
			items: [{
				item_id: '<?=$goods_sku?>',
				item_name: '<?=$goods_item_info["product_name"]?>',
				price: <?=$goods_price?>,
				quantity: 1
			}]
		});
		</script>
<?
			}else{
				echo "<div class='text-center font-14 py-5'>이미 장바구니에 해당 상품이 존재합니다.</div>";
				/*
				$response =array(
					"error_code"=>"1",
					"error_msg"=>"이미 장바구니에 해당 상품이 존재합니다."
				);
				echo json_encode($response);
				exit;
				*/
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
		case "select_del_cart":
			$logger->info("============장바구니 선택 삭제==========");
			$ip = get_client_ip_env();
			foreach($goods_sku_arr as $goods_sku){
				$request_params = array(
					"m_no"=>$_SESSION['member']['m_no'],
					"ip"=>$ip,
					"goods_sku"=>$goods_sku,
				);
				$logger->info($request_params);
				$order->deleteCart($request_params);
			}
		break;
	}

}catch(Exception $e){
	//echo 'Error!: '.$e->getMessage();
	die();
}
?>