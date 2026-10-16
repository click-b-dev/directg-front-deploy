	<div class="card rounded-0 bg-card border-0 p-0 flex-shrink-0">
		<div class="thumb-area p-0 position-relative overflow-hidden">
			<a href="<?=$value['view_url']?>">
				<img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="card-img-top rounded-0 img-fluid" alt="<?=$value['product_name']?>" onerror="this.style.visibility='hidden'">
			</a>
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
						case "holomodels":
							switch($value['display_type']){
								case "holomodels":
				?>
				<span class="label bg-success rounded-0 font-12 fw-bold">본체</span>
				<?
								break;
								case "holomodelsdlc":
				?>
				<span class="label bg-content rounded-0 font-12 fw-bold">DLC</span>
				<?
								break;
								case "holomodelsedition":
				?>
				<span class="label bg-primary rounded-0 font-12 fw-bold">에디션</span>
				<?
								break;
							}
						break;
					}
				?>
			</div>
		</div>

		<div class="content-area">
			<div class="title_area font-13 text-decoration-none text-secondary text-truncate align-content-center">
				<?=$value['product_name']?>
			</div>
			<div class="purchase-area d-flex align-items-end justify-content-between">
				<?php if($value['discount']>0){?>
				<div class="discount_rate_area d-flex">
					<span class="discount-rate rounded-2 align-content-center text-center <?=$value['promotion_label']?> font-12 fw-bold num minus"><?=$value['discount']?>%</span>
				</div>
				<?php }?>
				<div class="price-area">
					<div class="consumer_price align-content-end">
						<?if($value['discount']>0){?><s class="num font-11 text-secondary-80 won"> <?=number_format($value['consumer_price'])?></s><?}?>
					</div>
					<div class="discount_price align-content-end">
						<span class="num font-13 won fw-bold text-white"> <?=number_format($value['price'])?></span>
					</div>
				</div>
				<div class="button-area align-content-end">
					<div class="wishlist-area text-center">
						<button type="button" class="btn btn-sm shadow-none btn_wishlist <?=$value['wishlist_chk']=="Y"?"":"btn_wishlist_off"?>" data-sku="<?=$value['goods_sku']?>">
							<span class="icon_area"><img src="/assets/images/icon/wishlist-icon_<?=$value['wishlist_chk']=="Y"?"y":"n"?>-new.svg" class="d-block w-100"></span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
