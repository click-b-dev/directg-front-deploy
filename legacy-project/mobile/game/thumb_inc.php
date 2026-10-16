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
	<div class="card thumb-card card-shadow border-0 rounded-0 justify-content-between">
		<div>
			<div class="product_name text-truncate">
				<?=$value['product_name']?>
			</div>
			<div class="img position-relative">
				<a href="<?=$view_url?>" data-sku="<?=$value['goods_sku']?>" class="product-link"><img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="w-100"></a>
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
		</div>

		<div class="d-flex justify-content-between card-tail p-25 lh-1 align-items-center">
			<div class="align-self-center card-price">
				<?if($value['discount']>0){?><div class="rounded-2 <?=$value['promotion_label']?> badge percent px-2 minus"><?=$value['discount']?> %</div><?}else{?><div></div><?}?>
			</div>
			<div class="align-items-end d-flex flex-column ">
				<?if($value['discount']>0){?><s class="num won old-price"> <?=number_format($value['consumer_price'])?></s><?}?>
				<span class="current-price text-white num won"> <?=number_format($value['price'])?></span>
			</div>
		</div>

	</div>
<?
			$count++;
		}
	}
?>