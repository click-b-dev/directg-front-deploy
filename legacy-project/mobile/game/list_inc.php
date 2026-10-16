<?php
	if($goods_list->success == true){
	$result = $goods_list->resultset->fetchAll();

	$count = 0;
	foreach($result as $value){
		//대표상품정보 
		$title_info = $goods->getGoodsOptionTitleInfo($value['product_code']);
		switch($value['game_type']){
			case "game":
				$view_url = "/game/game_view.html?product_id=".$title_info['sku']."&sku=".$value['goods_sku'];
			break;
			case "dlc":
				if($value['display_type']=="dlc_bundle"){
					$view_url = "/game/bundle_view.html?sku=".$value['goods_sku'];
				}else{
					$view_url = "/game/dlc_view.html?sku=".$value['goods_sku'];
				}
			break;
			case "music":
				$view_url = "/game/dlc_view.html?sku=".$value['goods_sku'];
			break;
			case "bundle":
				$view_url = "/game/bundle_view.html?sku=".$value['goods_sku'];
			break;
			case "accessories":
				$view_url = "/game/goods_item_view.html?product_id=".$title_info['sku']."&sku=".$value['goods_sku'];
			break;
			case "holomodels":
				switch($value['display_type']){
					case "holomodels":
						$view_url = "/game/holomodels_view.html?product_id=".$title_info['sku']."&sku=".$value['goods_sku'];
					break;
					case "holomodelsdlc":
						$view_url = "/game/holomodelsdlc_view.html?product_id=".$title_info['sku']."&sku=".$value['goods_sku'];
					break;
					case "holomodelsedition":
						$view_url = "/game/holomodels_view.html?product_id=".$title_info['sku']."&sku=".$value['goods_sku'];
					break;
				}
			break;
		}

		$promotion_goods=$promotion->getPromotionGoodsPrice($value['product_code']);
		if($_SESSION['member']['m_no']){
			$wishlist = $mypage->getWishlistItem($_SESSION['member']['m_no'],$value['product_code']);
			if($wishlist['idx']>0){
				$wishlist_chk="Y";
			} else {
				$wishlist_chk="N";
			}
		} else {
			$wishlist_chk="N";
		}

		if($promotion_goods['sale_price']>0){
			$value['discount'] =$promotion_goods['discount_rate'];
			$value['price'] =$promotion_goods['sale_price'];
			$value['is_promotion']="Y";
			$value['promotion_label']="bg-danger";
		}else{
			$value['is_promotion']="N";
			$value['promotion_label']="bg-primary";
		}
?>
	<div class="card row-card card-shadow border-0">
		<div class="card-body d-flex px-0 py-1 bg-clight h-auto">
			<div class="img rounded-0 position-relative col-5 h-auto">
				<a href="<?=$view_url?>" data-sku="<?=$value['goods_sku']?>" class="product-link"><img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="img-fluid"></a>
				<div class="position-absolute bottom-0 start-0">
					<? 
						switch($value['game_type']){
							case "game":
								switch($value['display_type']){
									case "basic":
					?>
					<span class="badge bg-cinfo rounded-0">기본게임</span>
					<?
									break;
									case "edition":
					?>
					<span class="badge bg-cprimary rounded-0">에디션</span>
					<?
									break;
									case "multi":
					?>
					<span class="badge bg-cwarning rounded-0">멀티팩</span>
					<?
									break;
								}
							break;
							case "dlc":
					?>
					<span class="badge bg-ccontent rounded-0">DLC</span>
					<?
							break;
							case "music":
					?>
					<span class="badge bg-ccontent rounded-0">Music</span>
					<?
							break;
							case "bundle":
					?>
					<span class="badge bg-csuccess rounded-0">번들</span>
					<?
							break;
							case "holomodels":
								switch($value['display_type']){
									case "holomodels":
					?>
						<span class="badge bg-csuccess rounded-0">본체</span>
					<?
									break;
									case "holomodelsdlc":
					?>
						<span class="badge bg-ccontent rounded-0">DLC</span>
					<?
									break;
									case "holomodelsedition":
					?>
						<span class="badge bg-cprimary rounded-0">에디션</span>
					<?
									break;
								}
							break;

						}
					?>
				</div>

			</div>
			<div class="product-info col-7 py-0 d-flex">
				<div class="card-title d-flex flex-column mb-0 justify-content-between w-100" style="flex: 1;">
					<div class="product_name text-truncate">
						<?=$value['product_name']?>
					</div>
					<div class="d-flex flex-row justify-content-start flex-wrap align-content-center">
						<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-secondary opacity-50 rounded-1 fs-7">코드</span><?}?>
						<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-secondary opacity-50 rounded-1 fs-7">택배</span><?}?>
						<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-secondary opacity-50 rounded-1 fs-7">코드+택배</span><?}?>
						<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-secondary opacity-50 rounded-1 fs-7">프로모션</span><?}?>
						<?if($value['is_preorder']=="Y"){?><span class="badge badge-outline-secondary opacity-50 rounded-1 fs-7">예약</span><?}?>
						<?if($value['is_bonus']=="Y"){?><span class="badge badge-outline-secondary opacity-50 rounded-1 fs-7">특전</span><?}?>
					</div>
					<div class="d-flex align-items-start flex-wrap align-content-start flex-shrink-0">
						<?if($value['spoken_korean']=="Y"){?><span class="badge opacity-50 rounded-1 fs-7 px-0 dot">음성 한국어</span><?}?>
						<?if($value['interface_korean']=="Y"){?><span class="badge opacity-50 rounded-1 fs-7 px-0 dot">인터페이스/자막 한글</span><?}?>
						<?if($value['exclusive_korean']=="Y"){?><span class="badge opacity-50 rounded-1 fs-7 px-0 dot">독점 한국어</span><?}?>
					</div>
					<div class="d-flex align-items-start flex-wrap align-content-start flex-shrink-0 h-25">
					<? 
						switch($value['product_platform']){
							case "1":
					?>
					<div class="mw-100 me-1 "><img src="/assets/images/platform/steam_logo.svg" class="" style="width: 1.25rem;"></div>
					<?
							break;
							case "34":
					?>
					<div class="mw-100 me-1 "><img src="/assets/images/platform/epic_logo.svg" class="" style="width: 1.25rem;"></div>
					<?
							break;
							case "35":
					?>
					<div class="mw-100 me-1 "><img src="/assets/images/platform/rockstar_logo.svg" class="" style="width: 1.25rem;"></div>
					<?
							break;
							case "51":
					?>
					<div class="mw-100 me-1 "><img src="/assets/images/platform/holomodels_logo.svg" class="" style="width: 1.25rem;"></div>
					<?
							break;
						}
					?>
					<?if($value['is_naverpay_coupon']=="Y"){?>
						<div class="mw-100">
							<span class="badge rounded-1 badge-naverpay fw-500"><img src="/assets/images/logo/logo_npaybk_small.svg" style="height: 0.5rem;">포인트 지급</span>
						</div>
					<?}?>
					<?if($value['is_add_repay']=="Y"){?>
						<div class="mw-100">
							<span class="badge rounded-1 bg-primary fw-500"><img src="/assets/images/icon/point_icon.svg" style="height: 0.5rem;">추가 적립</span>
						</div>
					<?}?>
					</div>
				</div>
			</div>
			
		</div>

		<div class="d-flex justify-content-between card-tail bg-clight bg-opacity-50 p-25">
			<div class="d-flex flex-row align-items-center card-price bg-opacity-50">
				<?if($value['discount']>0){?><div class="rounded-2 <?=$value['promotion_label']?> badge percent px-2 minus"><?=$value['discount']?> %</div><?}else{?><div></div><?}?>
				<div class="align-content-end d-flex flex-column ">
					<?if($value['discount']>0){?><s class="num won old-price"> <?=number_format($value['consumer_price'])?></s><?}?>
					<span class="current-price text-white num won"> <?=number_format($value['price'])?></span>
				</div>
			</div>
			<div class="align-self-center">
				<button type="button" class="btn <?=$wishlist_chk=="Y"?"btn-outline-cdanger":"btn-outline-csecondary"?> border-1 p-1 h-auto d-inline-flex align-items-center justify-content-center rounded-2 btn_wishlist" data-sku="<?=$value['goods_sku']?>">
					<img src="/assets/images/icon/wishlist-icon_<?=$wishlist_chk=="Y"?"y":"n"?>.svg" style="width: 1rem;" alt="위시리스트">
				</button>
				<?if($value['soldout']!="Y"){?>
				<button type="button" class="btn btn-outline-cinfo border-1 p-1 h-auto d-inline-flex align-items-center justify-content-center rounded-2 btn_cart" data-sku="<?=$value['goods_sku']?>">
					<img src="/assets/images/icon/basket_icon.svg" style="width: 1rem;" alt="장바구니">
				</button>
				<?}else{?>
					<span class="badge bg-secondary rounded-2 fw-bold font-14 py-3 px-2 align-middle">품절</span>
				<?}?>
			</div>
		</div>

	</div>
<?
			$count++;
		}
	}
?>
