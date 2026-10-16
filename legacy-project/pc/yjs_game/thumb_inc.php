	<div class="card rounded-0 bg-card border-0 p-0 flex-shrink-0">
		<a href="<?=$value['view_url']?>">
			<div class="thumb-area p-0 position-relative">
				<img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="card-img-top rounded-0 img-fluid" alt="<?=$value['product_name']?>" onerror="this.style.visibility='hidden'">
				<div class="thumb-content-area">
					<div class="promotion_date_area">
					<?php
						if($value['is_promotion']=="Y"){
					?>
							<span class="text-danger font-13 fw-bold"><?=$value['promotion_end']?> 종료</span>
					<?php
						}
					?>
					</div>
					<div class="badge-area text-center">
						<div class="title_badge_area align-content-center">
							<?if($value['delivery_type']=='1'){?><span class="badge text-secondary bg-light-50 rounded-2 font-11 fw-500">코드</span><?}?>
							<?if($value['delivery_type']=='2'){?><span class="badge text-secondary bg-light-50 rounded-2 font-11 fw-500">택배</span><?}?>
							<?if($value['delivery_type']=='3'){?><span class="badge text-secondary bg-light-50 rounded-2 font-11 fw-500">코드+택배</span><?}?>

							<?if($value['spoken_korean']=="Y"||$value['interface_korean']=="Y"||$value['exclusive_korean']=="Y"){?>
								<?if($value['spoken_korean']=="Y"){?><span class="badge text-secondary rounded-2 bg-light-50 font-11 fw-500">음성 한국어</span><?}?>
								<?if($value['interface_korean']=="Y"){?><span class="badge text-secondary rounded-2 bg-light-50 font-11 fw-500">인터페이스/자막 한글</span><?}?>
								<?if($value['exclusive_korean']=="Y"){?><span class="badge exclusive_korean rounded-2 font-11 fw-500">독점 한국어</span><?}?>
							<?}else{?>
								<span class="badge text-secondary rounded-2 bg-light-50 font-11 fw-500">한국어 지원안함</span>
							<?}?>
							<?if($value['is_preorder']=="Y"){?>
								<span class="badge bg-light-50 text-secondary rounded-2 font-11 fw-500">예약구매</span>
							<?}?>
							<?if($value['is_bonus']=="Y"){?>
								<span class="badge bg-light-50 text-secondary rounded-2 font-11 fw-500">특전</span>
							<?}?>
						</div>
						<?if($value['is_naverpay_coupon']=="Y"){?>
						<div class="npay_badge_area align-content-center text-center">
							<span class="badge badge-naverpay rounded-2 font-11 fw-500"><img src="/assets/images/logo/logo_npaybk_small.svg" style="height: 1rem;">네이버페이</span>
						</div>
						<?}?>
					</div>
				</div>
				<div class="label_area position-absolute bottom-0 start-0">
					<?php
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
					<span class="label bg-warning rounded-0 font-12 fw-bold">멀티팩</span>
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
			</a>
		</div>
		<div class="content-area bg-light d-flex flex-column">
			<div class="title-area d-flex">
				<?php
					if($value['product_platform']=="1"||$value['product_platform']=="34"||$value['product_platform']=="35"){
				?>
					<div class="platform_area">
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
				<?php
					}
				?>
				<div class="product_name_area font-14 text-decoration-none text-secondary text-truncate"><?=$value['product_name']?></div>
			</div>
			<div class="purchase-area d-flex h-100 align-items-end">
				<div class="price-info-area d-flex">
						<?php if($value['discount']>0){?>
					<div class="discount_rate_area d-flex">
							<span class="discount-rate rounded-2 align-content-center text-center <?=$value['promotion_label']?> font-16 fw-bold num minus"><?=$value['discount']?>%</span>
					</div>
						<?php }?>
					<div class="price-area">
						<div class="consumer_price align-content-end">
							<?if($value['discount']>0){?><s class="num font-12 text-secondary-80 won"> <?=number_format($value['consumer_price'])?></s><?}?>
						</div>
						<div class="discount_price align-content-end">
							<span class="num font-17 won fw-bold"> <?=number_format($value['price'])?></span>
						</div>
					</div>
				</div>
				<div class="button-area d-flex justify-content-between">
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
	</div>
