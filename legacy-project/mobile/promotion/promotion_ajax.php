<?
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

$sort = filter_input(INPUT_POST, 'sort', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);

$where = [];
$param = "";

$page = $page+1;
try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$goods= new Goods($conn);
	$promotion = new Promotion($conn);

	if($is_bonus<>""){
		$where[] = " a.is_bonus='".$is_bonus."'";
		$search_option["is_bonus"]="구매특전";
		$checked['is_bonus'][$is_bonus] = "checked";
	}

	if($is_preorder<>""){
		$where[] = " date_format(a.release_date,'%Y-%m-%d')>'".date('Y-m-d')."'";
		$search_option["is_preorder"]="예약구매";
		$checked['is_preorder'][$is_preorder] = "checked";
	}

	if($is_repay<>""){
		//$where[] = " a.is_repay='".$is_repay."'";
		$search_option["is_repay"]="추가적립";
		$checked['is_repay'][$is_repay] = "checked";
	}


	if($is_promotion<>""){
		//$where[] = " a.is_repay='".$is_repay."'";
		$search_option["is_promotion"]="할인 프로모션";
		$checked['is_promotion'][$is_promotion] = "checked";
	}
	
	if($search_price<>""){
		$search_option["search_price"]="가격대";
		switch($search_price){
			case "1": //₩ 1,000 미만
				$where[] = " c.sale_price<1000";
			break;
			case "2":	//₩ 1,000 이상 ~ ₩ 10,000 미만
				$where[] = " c.sale_price>=1000 and c.sale_price<10000";
			break;
			case "3": //₩ 10,000 이상 ~ ₩ 20,000 미만
				$where[] = " c.sale_price>=10000 and c.sale_price<20000";
			break;
			case "4": //₩ 20,000 이상 ~ ₩ 30,000 미만
				$where[] = " c.sale_price>=20000 and c.sale_price<30000";
			break;
			case "5": //₩ 30,000 이상 ~ ₩ 40,000 미만
				$where[] = " c.sale_price>=30000 and c.sale_price<40000";
			break;
			case "6": //₩ 30,000 이상 ~ ₩ 40,000 미만
				$where[] = " c.sale_price>=40000 and c.sale_price<50000";
			break;
			case "7": //₩ 30,000 이상 ~ ₩ 40,000 미만
				$where[] = " c.sale_price>=50000";
			break;
		}
		$checked['search_price'][$search_price] = "checked";
	}

	//플랫폼 필터링
	if($platform<>""){
		$where[] = " a.product_platform='".$platform."'";
	}

	//게임유형 필터링
	if($game_type<>""){
		$where[] = " a.game_type='".$game_type."'";
		$search_option["game_type"]=$goods->getGameType($game_type);
	}else{
		//$where[] = " find_in_set(a.game_type,'game,dlc,music')";
	}

	if($interface_korean<>""){
		$where[] = " a.interface_korean='".$interface_korean."'";
		$search_option["interface_korean"]="한국어 자막지원";
		$checked['interface_korean'][$interface_korean] = "checked";
	}

	if($spoken_korean<>""){
		$where[] = " a.spoken_korean='".$spoken_korean."'";
		$search_option["spoken_korean"]="한국어 음석지원";
		$checked['spoken_korean'][$spoken_korean] = "checked";
	}

	if($exclusive_korean<>""){
		$where[] = " a.exclusive_korean='".$exclusive_korean."'";
		$search_option["exclusive_korean"]="독점/한글패치";
		$checked['exclusive_korean'][$exclusive_korean] = "checked";
	}

	if(isset($genre_code) && $genre_code<>""){
		$where[] = " match(a.genre) AGAINST('+".$genre_code."')";
		$checked['genre_code'][$genre_code] = "checked";
	}

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				if(is_array($value)){
					foreach($value as $sub_value){
						$param.="&".$key."[]=".$sub_value;
					}
				}else{
					$param.="&".$key."=".$value;
				}
				
			}
		}
	}
	
	switch($sort){
		case "release": //출시일순
			$orderby = "a.release_date desc";
		break;
		case "pricedown": //낮은가격순
			$orderby = "c.sale_price asc";
		break;
		case "priceup": //높은 가격순
			$orderby = "c.sale_price desc";
		break;
		case "discount":
			$orderby = "c.discount_rate desc";
		break;
		default:
			$orderby = "c.discount_rate desc";
			$sort = "discount";
		break;
	}
	
	$promotion_list = $promotion->getPromotionIng($page,$add_where,$orderby,$param,'30');

	if($promotion_list->success == true){
		$result = $promotion_list->resultset->fetchAll();

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
			}

			$promotion_goods=$promotion->getPromotionGoodsPrice($value['product_code']);
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
				<div class="card row-card rounded-1 card-shadow border-0">
					<div class="card-body d-flex p-0">
						<div class="img rounded-0 position-relative col-5">
							<a href="<?=$view_url?>"><img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="img-fluid"></a>
							<div class="position-absolute top-0 start-0">
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

									}
								?>
							</div>

						</div>
						<div class="product-info col-7">
							<div class="card-title d-flex flex-column mb-0 justify-content-evenly w-100 h-100">
								<div class="d-flex align-items-start flex-wrap align-content-start flex-shrink-0">
									<?if($value['spoken_korean']=="Y"){?><span class="badge rounded-2 bg-cinfo">음성 한국어</span><?}?>
									<?if($value['interface_korean']=="Y"){?><span class="badge rounded-2 bg-clight">인터페이스/자막 한글</span><?}?>
									<?if($value['exclusive_korean']=="Y"){?><span class="badge rounded-2 bg-clight">독점 한국어</span><?}?>
								</div>
								<div class="product_name text-truncate">
									<?=$value['product_name']?>
								</div>
							</div>
						</div>
						
					</div>

					<div class="d-flex justify-content-between card-tail">
						<div class="d-flex flex-row justify-content-start flex-wrap card-badge align-content-center">
							<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2">코드</span><?}?>
							<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2">택배</span><?}?>
							<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2">코드+택배</span><?}?>
							<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2">프로모션</span><?}?>
							<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning">예약</span><?}?>
							<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info">특전</span><?}?>
						</div>
						<div>
							<div class="d-flex flex-row justify-content-between align-items-center card-price">
								<?if($value['discount']>0){?><div class="rounded-2 <?=$value['promotion_label']?> badge percent"><?=$value['discount']?> %</div><?}else{?><div></div><?}?>
								<div class="align-content-end d-flex flex-column align-items-end">
									<?if($value['discount']>0){?><s class="num won old-price"> <?=number_format($value['consumer_price'])?></s><?}?>
									<span class="current-price text-white num won"> <?=number_format($value['price'])?></span>
								</div>
							</div>
						</div>
 					</div>

				</div>
<?
		$count++;
		}
	}

}catch (PDOException $e){  
	//echo 'Error!: '.$e->getMessage();  
	die();  
}
?>