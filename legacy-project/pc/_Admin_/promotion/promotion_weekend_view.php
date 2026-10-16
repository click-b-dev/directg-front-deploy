<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['promotion'] = "active";

$page_title= "주말특가 프로모션 상세보기";

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	if($idx>0){
		$adminGoods= new AdminGoods($conn);
		
		$query="select * from tbl_promotion_weekend where idx=:idx";
		$stmt = $conn->prepare($query);
		$params = array(
			":idx"=>$idx,
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		$promotion_week_start = date('Y-m-d H:i:s',$data['promotion_week_start']);
		$promotion_week_end = date('Y-m-d H:i:s',$data['promotion_week_end']);
		
		$promotion_recommand_goods = explode("|",$data['promotion_week_recommand']);
		$promotion_best_goods = explode("|",$data['promotion_week_best']);
		
		
		foreach($promotion_recommand_goods as $key=>$value){
			$promotion_recommand[$key] = array(
				"title_info"=>$adminGoods->getGoodsOptionTitleInfo($value),
				"option_info"=>$adminGoods->getGoodsItemDetail($value),
			);
		}
		
		foreach($promotion_best_goods as $key=>$value){
			if($key<4){
				$promotion_best[$key] = array(
					"title_info"=>$adminGoods->getGoodsOptionTitleInfo($value),
					"option_info"=>$adminGoods->getGoodsItemDetail($value),
				);
			}else{
				$promotion_best_small[$key] = array(
					"title_info"=>$adminGoods->getGoodsOptionTitleInfo($value),
					"option_info"=>$adminGoods->getGoodsItemDetail($value),
				);
			}
		}
	}
	
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>

<div class="content-page">
		<div class="content">
<!-- Start Content-->
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">프로모션</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">주말특가 프로모션 관리</a></li>
									<li class="breadcrumb-item active">주말특가 프로모션 상세보기</li>
								</ol>
							</div>
							<h4 class="page-title"><?=$data['promotion_week_name']?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				
				<div class="row">
					<div class="col-12">
						<div class="container">
							<a href="<?=$data['promotion_week_banner_link']?>" target="_blank"><img src="https://image.directg.net/U84s2DngyK" class="w-100" alt="다이렉트 게임즈 주말 프로모션"></a>
							<div class="b-example-divider"></div>
						</div>
						
						<section class="mb-3">
							<div class="container">
								<h3 class="fw-bold">DG 추천게임</h3>
								
								<div class="row row-col-1 row-cols-md-4 g-2 justify-content-center">
									<?
										foreach($promotion_recommand as $recommand){
											if($recommand['option_info']['promotion']['sale_price']>0){
												$recommand['option_info']['discount'] =$recommand['option_info']['promotion']['discount_rate'];
												$recommand['option_info']['price'] =$recommand['option_info']['promotion']['sale_price'];
												$recommand['option_info']['promotion_label']="bg-danger";
											}else{
												$recommand['option_info']['promotion_label']="bg-primary";
											}
									?>
									<div class="col-3">
										<div class="card mb-0 rounded-1 card-shadow bg-card border-0">
											<div class="card-header bg-secondary text-white"><?=$recommand['title_info']['title_name']?></div>
											<a href="/game/game_view.html?product_id=<?=$recommand['title_info']['sku']?>" title="<?=$recommand['title_info']['title_name']?>"><img src="<?=$recommand['title_info']['domain']?>/upload/title/<?=$recommand['title_info']['title_id']?>/hero/hero_capsule.jpg" class="card-img-top rounded-1" alt="<?=$recommand['title_info']['title_name']?>" onerror="this.src='/assets/images/logo/H2_DG_BI_VERTICAL.svg'"></a>
											<div class="card-footer px-2 py-0 border-0 bg-secondary">
												<div class="d-flex flex-row justify-content-between align-items-center" style="min-height:48px">
													<?if($recommand['option_info']['discount']>0){?>
													<div><span class="badge <?=$recommand['option_info']['promotion_label']?> num font-14 px-2 py-2">-<?=$recommand['option_info']['discount']?>%</span></div>
													<?}?>
													<div class="ms-auto text-end align-text-bottom">
														<?if($recommand['option_info']['discount']>0){?>
														<div class="d-block fw-normal p-0 m-0"><small class="text-decoration-line-through text-white font-11 num won"> <?=number_format($recommand['option_info']['consumer_price'])?></small></div>
														<?}?>
														<div class="d-block"><span class="d-block p-0 m-0 num text-white font-16 fw-bold won"> <?=number_format($recommand['option_info']['price'])?></span></div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<?
										}
									?>
								</div>
							</div>
							<div class="b-example-divider"></div>
						</section>
						
						<section class="mb-3">
							<div class="container">
								<h3 class="fw-bold">프로모션 인기게임</h3>
								
								<div class="row row-col-1 row-cols-md-4 g-2 justify-content-center mb-3">
									<?
										$ranking = 1;
										foreach($promotion_best as $best){
											if($best['option_info']['promotion']['sale_price']>0){
												$best['option_info']['discount'] =$best['option_info']['promotion']['discount_rate'];
												$best['option_info']['price'] =$best['option_info']['promotion']['sale_price'];
												$best['option_info']['is_promotion']="Y";
												$best['option_info']['promotion_label']="bg-danger";
											}else{
												$best['option_info']['is_promotion']="N";
												$best['option_info']['promotion_label']="bg-primary";
											}
											
											switch($best['option_info']['display_type']){
												case "basic":
													$best['option_info']['option_gubun'] = "<span class='badge bg-info rounded-0 font-12 py-1'>기본게임</span>";
												break;
												case "edition":
													$best['option_info']['option_gubun'] = "<span class='badge bg-primary rounded-0 font-12 py-1'>에디션</span>";
												break;
											}
											
											switch($best['option_info']['game_type']){
												case "game":
													$best['option_info']['view_url'] = "/game/game_view.html?product_id=".$best['title_info']['sku'];
												break;
												case "dlc":
													$best['option_info']['view_url'] = "/game/dlc_view.html?sku=".$best['option_info']['goods_sku'];
												break;
												case "bundle":
													$best['option_info']['view_url'] = "/game/bundle_view.html?sku=".$best['option_info']['goods_sku'];
													$best['option_info']['option_gubun'] = "<span class='badge bg-success rounded-0 font-12 py-1'>번들</span>";
												break;
											}
									?>
									<div class="col-3">
										<div class="card mb-0 rounded-1 card-shadow bg-dark text-white border-0">
											<div class="card-header mb-0 p-2 border-0 rounded-0 bg-secondary"><a href="<?=$best['option_info']['view_url']?>" title="<?=$best['option_info']['product_name']?>"><h5 class="card-title fw-400 font-14 text-white mb-0 py-1 align-content-center text-truncate"><?=$best['option_info']['product_name']?></h5></a></div>
											<div class="card-body p-0 bg-grey rounded-0">
												<div class="position-relative">
													<div class="position-absolute top-0 start-0">
														<div class="ratio ratio-1x1" style="width:32px;height:32px">
															<span class="badge bg-dark text-white rounded-0 font-14 num px-1 py-2"><?=$ranking++?></span>
														</div>
													</div>
													<a href="<?=$best['option_info']['view_url']?>" title="<?=$best['option_info']['product_name']?>"><img src="<?=$best['option_info']['domain']?>/upload/product/<?=$best['option_info']['product_code']?>/header/header.jpg?t=20251027" class="card-img-top rounded-0" alt="<?=$best['option_info']['product_name']?>" onerror="this.src='/assets/images/logo/H2_DG_BI_VERTICAL.svg'"></a>
													<div class="position-absolute bottom-0 start-0"><?=$best['option_info']['option_gubun']?></div>
												</div>
												<div class="p-2">
													<span class="badge badge-outline-success rounded-2 font-12 p-1 ms-1 mb-1">코드발송</span>
													<?if($best['option_info']['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2 font-12 p-2 ms-2">프로모션</span><?}?>
													<?if($best['option_info']['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning font-12 p-2 ms-2">예약구매</span><?}?>
													<?if($best['option_info']['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info font-12 p-2 ms-2">특전</span><?}?>
												</div>
											</div>
											<div class="card-footer px-2 py-0 border-0 bg-secondary">
												<div class="d-flex flex-row justify-content-between align-items-center" style="min-height:48px">
													<?if($best['option_info']['discount']>0){?>
													<div><span class="badge <?=$best['option_info']['promotion_label']?> num font-14 px-2 py-2">-<?=$best['option_info']['discount']?>%</span></div>
													<?}?>
													<div class="ms-auto text-end align-text-bottom">
														<?if($best['option_info']['discount']>0){?>
														<div class="d-block fw-normal p-0 m-0"><small class="text-decoration-line-through text-white font-11 num won"> <?=number_format($best['option_info']['consumer_price'])?></small></div>
														<?}?>
														<div class="d-block"><span class="d-block p-0 m-0 num text-white font-14 fw-bold won"> <?=number_format($best['option_info']['price'])?></span></div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<?
								}
									?>
								</div>
								
								<div class="row row-col-1 row-cols-md-6 g-2 justify-content-center">
									<?
										foreach($promotion_best_small as $best_small){
											if($best_small['option_info']['promotion']['sale_price']>0){
												$best_small['option_info']['discount'] =$best_small['option_info']['promotion']['discount_rate'];
												$best_small['option_info']['price'] =$best_small['option_info']['promotion']['sale_price'];
												$best_small['option_info']['is_promotion']="Y";
												$best_small['option_info']['promotion_label']="bg-danger";
											}else{
												$best_small['option_info']['is_promotion']="N";
												$best_small['option_info']['promotion_label']="bg-primary";
											}
											
											switch($best_small['option_info']['display_type']){
												case "basic":
													$best_small['option_info']['option_gubun'] = "<span class='badge bg-info rounded-0 font-12 py-1'>기본게임</span>";
												break;
												case "edition":
													$best_small['option_info']['option_gubun'] = "<span class='badge bg-primary rounded-0 font-12 py-1'>에디션</span>";
												break;
											}
											
											switch($best_small['option_info']['game_type']){
												case "game":
													$best_small['option_info']['view_url'] = "/game/game_view.html?product_id=".$best_small['title_info']['sku'];
												break;
												case "dlc":
													$best_small['option_info']['view_url'] = "/game/dlc_view.html?sku=".$best_small['option_info']['goods_sku'];
												break;
												case "bundle":
													$best_small['option_info']['view_url'] = "/game/bundle_view.html?sku=".$best_small['option_info']['goods_sku'];
													$best_small['option_info']['option_gubun'] = "<span class='badge bg-success rounded-0 font-12 py-1'>번들</span>";
												break;
											}
									?>
									<div class="col-2">
										<div class="card mb-0 rounded-1 card-shadow bg-card border-0">
											<div class="card-header mb-0 p-2 border-0 rounded-0 bg-secondary"><a href="<?=$best_small['option_info']['view_url']?>" title="<?=$best_small['option_info']['product_name']?>"><h5 class="card-title fw-400 font-14 text-white mb-0 py-1 align-content-center text-truncate"><?=$best_small['option_info']['product_name']?></h5></a></div>
											<div class="position-relative">
												<div class="position-absolute top-0 start-0">
													<div class="ratio ratio-1x1" style="width:32px;height:32px">
														<span class="badge bg-dark text-white rounded-0 font-14 num px-1 py-2"><?=$ranking++?></span>
													</div>
												</div>
												<a href="<?=$best_small['option_info']['view_url']?>" title="<?=$best_small['option_info']['product_name']?>"><img src="<?=$best_small['option_info']['domain']?>/upload/product/<?=$best_small['option_info']['product_code']?>/header/header.jpg" class="card-img-top rounded-0" alt="<?=$best_small['option_info']['product_name']?>" onerror="this.src='/assets/images/logo/H2_DG_BI_VERTICAL.svg'"></a>
												<div class="position-absolute bottom-0 start-0"><?=$best_small['option_info']['option_gubun']?></div>
											</div>
											<div class="card-footer px-2 py-0 border-0 bg-secondary">
												<div class="d-flex flex-row justify-content-between align-items-center" style="min-height:48px">
													<?if($best_small['option_info']['discount']>0){?>
													<div><span class="badge <?=$best_small['option_info']['promotion_label']?> num font-14 px-2 py-2">-<?=$best_small['option_info']['discount']?>%</span></div>
													<?}?>
													<div class="ms-auto text-end align-text-bottom">
														<div class="d-block fw-normal p-0 m-0"><small class="text-decoration-line-through text-white font-11 num won"> <?=number_format($best_small['option_info']['consumer_price'])?></small></div>
														<div class="d-block"><span class="d-block p-0 m-0 num text-white font-14 fw-bold won"> <?=number_format($best_small['option_info']['price'])?></span></div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<?
										}
									?>
								</div>
							</div>
							<div class="b-example-divider"></div>
						</section>
					</div>
				</div>
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
