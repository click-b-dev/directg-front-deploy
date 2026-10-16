<?
ini_set( "display_errors", 0 );
include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_NUMBER_INT);
$publisher_code = filter_input(INPUT_POST, 'publisher_code', FILTER_SANITIZE_STRING);
$category_code = filter_input(INPUT_POST, 'category_code', FILTER_SANITIZE_STRING);
$genre_code = filter_input(INPUT_POST, 'genre_code', FILTER_SANITIZE_STRING);
$sort = filter_input(INPUT_POST, 'sort', FILTER_SANITIZE_STRING);

$page = $page+1;

$where = array();

$where[] = " find_in_set(a.game_type,'game,dlc,music,bundle')";

$where[] = "a.supplier_code='".$publisher_code."'";

//플랫폼 필터링
if(isset($search_platform) && $search_platform<>""){
	$where[] = " a.product_platform='".$search_platform."'";
}

//장르 필터링
if(isset($genre_code) && $genre_code<>""){
	$where[] = " match(a.genre) AGAINST('+".$genre_code."')";
}

//카테고리 필터링
if(isset($category_code) && $category_code<>""){
	$search_cateogorys = explode(',',$category_code);
	if(is_array($search_cateogorys)){
		$tag_filter = "";
		foreach($search_cateogorys as $search_cateogory){
			if($search_cateogory){
				$tag_filter .= $search_cateogory."+ ";
			}
		}

		if(isset($tag_filter) && $tag_filter<>""){
			$where[] = " match(a.category) AGAINST('".$tag_filter."')";
		}
	}else{
		$where[] = " match(a.category) AGAINST('+".$category_code."')";
	}
}

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$goods= new Goods($conn);
	$promotion = new Promotion($conn);
	
	switch($sort){
		case "release": //출시일순
			$orderby = "a.release_date desc";
		break;
		case "pricedown": //낮은가격순
			$orderby = "a.price asc";
		break;
		case "priceup": //높은 가격순
			$orderby = "a.price desc";
		break;
		case "discount":
			$orderby = "c.discount_rate desc";
		break;
		default:
			$orderby = "a.release_date desc";
			$sort = "discount";
		break;
	}

	$goods_list = $goods->getPublisherGoodsSearch($page,$add_where,$orderby,$param,$is_bonus);

	if($goods_list->success == true){
		$result = $goods_list->resultset->fetchAll();

		$count = 0;
		foreach($result as $value){
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
		}
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>