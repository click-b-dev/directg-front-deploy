		<div class="col">
			<div class="card rounded-0 bg-light border-0 flex-row g-0">
				<div class="thumb-area flex-shrink-0 rounded-0">
					<div class="position-relative">
						<a href="<?=$value['view_url']?>" class="text-white"><img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="img-fluid rounded-0 w-100 h-100"></a>
						<div class="label_area position-absolute bottom-0 start-0">
							<? 
								switch($value['game_type']){
									case "game":
										switch($value['display_type']){
											case "basic":
							?>
							<span class="label bg-info rounded-0 font-12 fw-bold">GAME</span>
							<?
											break;
											case "edition":
							?>
							<span class="label bg-primary rounded-0 font-12 fw-bold">에디션</span>
							<?
											break;
											case "multi":
							?>
							<span class="label bg-warning">멀티팩</span>
							<?
											break;
										}
									break;
									case "dlc":
							?>
							<span class="label bg-content rounded-0 font-12 fw-bold">DLC</span>
							<?
									break;
									case "music":
							?>
							<span class="label bg-content rounded-0 font-12 fw-bold">Music</span>
							<?
									break;
									case "bundle":
							?>
							<span class="label bg-success rounded-0 font-12 fw-bold">번들</span>
							<?
									break;
								}
							?>
						</div>
					</div>
				</div>
				<div class="content-area d-flex flex-column justify-content-between">
					<div class="title-area d-flex align-items-center">
						<div class="platform-area flex-shrink-0 d-lg-block d-flex text-center align-content-center">
							<? 
								switch($value['product_platform']){
									case "1":
							?>
							<img src="/assets/images/platform/steam_logo.svg" class="platform_icon">
							<?
									break;
									case "34":
							?>
							<img src="/assets/images/platform/epic_logo.svg" class="platform_icon">
							<?
									break;
									case "35":
							?>
							<img src="/assets/images/platform/rockstar_logo.svg" class="platform_icon">
							<?
									break;
								}
							?>
						</div>
						<div class="bar_area align-self-center"></div>
						<div class="product_name_area font-15 text-decoration-none text-white text-truncate"><?=$value['product_name']?></div>
					</div>
					<div class="badge_area align-content-center">
						<?if($value['delivery_type']=='1'){?><span class="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">코드</span><?}?>
						<?if($value['delivery_type']=='2'){?><span class="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">택배</span><?}?>
						<?if($value['delivery_type']=='3'){?><span class="badge text-secondary bg-none-40 rounded-2 font-11 fw-500">코드+택배</span><?}?>

						<?if($value['spoken_korean']=="Y"){?><span class="badge text-secondary rounded-2 bg-none-40 font-11 fw-500">음성 한국어</span><?}?>
						<?if($value['interface_korean']=="Y"){?><span class="badge text-secondary rounded-2 bg-none-40 font-11 fw-500">인터페이스/자막 한글</span><?}?>
						<?if($value['exclusive_korean']=="Y"){?><span class="badge exclusive_korean rounded-2 font-11 fw-500">독점 한국어</span><?}?>
						
						<?if($value['is_preorder']=="Y"){?>
							<span class="badge bg-none-40 text-secondary rounded-2 font-11 fw-500">예약구매</span>
						<?}?>
						<?if($value['is_bonus']=="Y"){?>
							<span class="badge bg-none-40 text-secondary rounded-2 font-11 fw-500">특전</span>
						<?}?>

						<?if($value['is_naverpay_coupon']=="Y"){?>
							<span class="badge badge-naverpay rounded-2 font-11 fw-500"><img src="/assets/images/logo/logo_npaybk_small.svg" style="height: 1rem;">네이버페이</span>
						<?}?>
					</div>
					<div class="price_area align-content-center d-flex align-items-center">
						<?if($value['discount']>0){?>
						<span class="discount-rate rounded-2 align-content-center text-center <?=$value['promotion_label']?> font-14 fw-bold me-2 num minus"><?=$value['discount']?>%</span>
						<?}?>

						<strong class="num font-16 fw-bold text-white me-2 won"> <?=number_format($value['price'])?></strong>
						<?if($value['discount']>0){?><s class="num font-11 me-2 won opacity-50 text-end"> <?=number_format($value['consumer_price'])?></s><?}?>
					</div>
				</div>

				<div class="button-area d-flex flex-column justify-content-between align-items-end">
					<div class="wishlist-area text-center">
						<button type="button" class="btn btn-sm shadow-none btn_wishlist <?=$value['wishlist_chk']=="Y"?"":"btn_wishlist_off"?>" data-sku="<?=$value['goods_sku']?>">
							<span class="icon_area"><img src="/assets/images/icon/wishlist-icon_<?=$value['wishlist_chk']=="Y"?"y":"n"?>-new.svg" class="d-block w-100"></span>
						</button>
					</div>
					<div class="cart-area text-center align-content-end">
						<?if($value['soldout']!="Y"){?>
							<button type="button" class="btn shadow-none btn_cart" data-sku="<?=$value['goods_sku']?>">
								<span class="icon_area"><img src="/assets/images/icon/basket-icon-white-new.svg" class="d-block w-100"></span>
							</button>
						<?}else{?>
							<button type="button" class="btn shadow-none font-13 bg-secondary align-items-center justify-content-center pe-none fw-bold">품절</button>
						<?}?>
					</div>
				</div>
			</div>
		</div>
