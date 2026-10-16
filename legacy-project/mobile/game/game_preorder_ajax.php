<?
	ini_set( "display_errors", 0 );

	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
	
	$page = filter_input(INPUT_POST, 'page', FILTER_SANITIZE_STRING);
	
	$page = $page+1;

	if(!$page){
		$page=1;
	}

	$where = [];
	$param = "";
	
	$where[] = " release_date>date_format(now(),'%Y-%m-%d')";

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$goods = new Goods($conn);
	$promotion = new Promotion($conn);

	$orderby = " release_date asc";
	$goods_list = $goods->getGoodsOptionPreOrderM($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}
?>
<?
	if($goods_list->success == true){
	$result = $goods_list->resultset->fetchAll();

	$count = 0;
	foreach($result as $value){
		$option_game=$goods->getTitleGameList($value['title_id'],'1');
		$option_edition=$goods->getTitleEditionList($value['title_id'],'1');
		$option_dlc=$goods->getTitleDLCList($value['title_id'],'1');
		$goods_option = array_merge($option_game,$option_edition,$option_dlc);
?>
	<div class="col-12">
		<div class="card product-card mx-2">
			<div class="card-body p-0">
				<a href="/game/game_view.html?product_id=<?=$value['sku']?>" class="text-white">
					<div class="position-relative">
						<img src="<?=$value['domain']?>/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg" class="image rounded-0" alt="$value['title_name'] image">
					</div>
					<!-- 옵션상품 목록 -->
					<ul class="listview image-listview">
						<?
							foreach($goods_option as $sub_value){
								$promotion_goods=$promotion->getPromotionGoodsPrice($sub_value['product_code']);
								if($promotion_goods['sale_price']>0){
									$sub_value['discount'] =$promotion_goods['discount_rate'];
									$sub_value['price'] =$promotion_goods['sale_price'];
									$sub_value['is_promotion']="Y";
									$sub_value['promotion_label']="bg-danger";
								}else{
									$sub_value['is_promotion']="N";
									$sub_value['promotion_label']="bg-primary";
								}
						?>
						<li>
							<a href="/game/game_view.html?product_id=<?=$value['sku']?>" class="item">
							<div class="in">
								<div>
									<header class="mb-1">출시 예정일: <?=$value['release_date']?></header>
									<p class="font-16 mb-0"><?=$sub_value['product_name']?></p>
									<footer>
										<?if($sub_value['discount']>0){?><span class="badge <?=$sub_value['promotion_label']?> fw-bold font-14 num rounded-2 me-1 px-2 py-2">-<?=$sub_value['discount']?>%</span><?}?>
										<?if($sub_value['discount']>0){?><span class="text-decoration-line-through text-muted font-11 num me-1">₩ <?=number_format($sub_value['consumer_price'])?></span><?}?>
										<span class="fw-bold font-14 num me-1">₩ <?=number_format($sub_value['price'])?></span>
									</footer>
								</div>
							</div>
							</a>
						</li>
						<?
							}
						?>
					</ul>
				</a>
			</div>
		</div>
	</div>
<?
			$count++;
		}
	}
?>