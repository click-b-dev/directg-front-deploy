<?
ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8");
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_wishlist.xml');
$logger = Logger::getLogger("pc");

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$goods_sku = filter_input(INPUT_POST, 'goods_sku', FILTER_SANITIZE_STRING);

if($_SESSION['member']['m_id']==""){
	echo "<div class='text-center font-14 py-5' id='fail'>로그인 이후에 이용이 가능합니다.</div>";
	exit;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$goods = new Goods($conn);
	$order = new Order($conn);

	switch($mode){
		case "add_wishlist":
			$goods_item_info = $goods->getGoodsItemDetailSku($goods_sku);
			$logger->info("============장바구니 상품추가==========");
			$ip = get_client_ip_env();
			$request_params = array(
				"m_no"=>$_SESSION['member']['m_no'],
				"ip"=>$ip,
				"goods_sku"=>$goods_sku,
				"product_code"=>$goods_item_info['product_code'],
				"product_name"=>$goods_item_info['product_name'],
			);
			$logger->info($request_params);

			$result = $order->addWishList($request_params);
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
								<?if($goods_item_info['delivery_type']=="1"){?>
								<span class="badge rounded-2 bg-secondary font-12 fw-500"><?=date('Y-m-d',strtotime($goods_item_info['release_date']))?> 출시</span>
								<?}?>
								<?if($goods_item_info['spoken_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500">음성 한국어</span><?}?>
								<?if($goods_item_info['interface_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500">인터페이스/자막 한글</span><?}?>
								<?if($goods_item_info['exclusive_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500">독점 한국어</span><?}?>
								
								<?if($goods_item_info['is_promotion']=="Y"){?><span class="badge rounded-2 bg-danger font-12 fw-500">프로모션</span><?}?>
								<?if($goods_item_info['is_preorder']=="Y"){?><span class="badge rounded-2 text-bg-warning font-12 fw-500">예약구매</span><?}?>
								<?if($goods_item_info['is_bonus']=="Y"){?><span class="badge rounded-2 text-bg-info font-12 fw-500">특전</span><?}?>
							</div>
							<div class="product-price">
								<div class="d-flex flex-row align-items-end justify-content-start">
									<?if($goods_item_info['promotion']['discount_rate']>0){?>
										<div class="rounded-2 bg-danger font-14 fw-bold px-3 py-1 me-2 num minus"><?=$goods_item_info['promotion']['discount_rate']?> %</div>
										<strong class="num fs-5 fw-bold text-white me-2">&#8361; <?=number_format($goods_item_info['promotion']['sale_price'])?></strong>
										<s class="num font-11">&#8361; <?=number_format($goods_item_info['consumer_price'])?></s>
									<?
										}else{
											if($goods_item_info['discount']>0){
									?>
										<div class="rounded-2 bg-primary font-14 fw-bold px-3 py-1 me-2 num minus"><?=$goods_item_info['discount']?> %</div>
										<strong class="num fs-5 fw-bold text-white me-2">&#8361; <?=number_format($goods_item_info['price'])?></strong>
										<s class="num font-11">&#8361; <?=number_format($goods_item_info['consumer_price'])?></s>
									<?
											}else{
									?>
										<strong class="num fs-5 fw-bold text-white me-2">&#8361; <?=number_format($goods_item_info['price'])?></strong>
									<?
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
							<div class="w-75 text-end"><img src="/assets/images/platform/Platform_logo_epic.png" class="w-75"></div>
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
<?
			}else{
				echo "<div class='text-center font-14 py-5'>이미 위시리스트에 해당 상품이 존재합니다.</div>";
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
	}

}catch(Exception $e){
	//echo 'Error!: '.$e->getMessage();
	die();
}
?>