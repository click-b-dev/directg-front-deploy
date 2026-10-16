<?php
ini_set( "display_errors", 0 );

include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$main = new Main($conn);
	$goods = new Goods($conn);
	$promotion = new Promotion($conn);

	//$main_banner_plan= $main->getMainBanner('1','mobile'); //메인기획배너
	//$main_banner= $main->getMainBanner('2','mobile'); //메인배너리스트
	//$main_banner_jehu_a= $main->getMainBanner('3','mobile'); //메인제휴(롤링형)
	//$main_banner_jehu_b= $main->getMainBanner('4','mobile'); //메인제휴
	
	//메인배너 목록
	$main_banner = $main->getMainBanner();
	
    //추천 및 특집
	$main_recommand = $main->getMainRecommand();

	$recommand_title = array();

	//신규게임 리스트
	$new_game = $main->getNewGame(8); 
	
	//인기게임 리스트
	$best_title = $main->getBestTitle(10);

	//공지사항
	$notice_list = $main->getNoticeMain(3);
	
	//예약상품 리스트
	$goods_preorder = $main->getGoodsPreorder(12); 

	//음성한국어 지원리스트
	$goods_spoken_korean = $main->getGoodsSpokenKorean(5); 

	//독점 한국어지원리스트
	$goods_exclusive_korean = $main->getGoodsExclusiveKorean(5); 
	

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>
<html>
<head>
<title>다이렉트 게임즈</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#ffffff">
<meta name="description" content="다이렉트 게임즈는 세계 유수의 개발사 및 퍼블리셔와 직접 제휴하여 자체 유통 마진은 최소화하면서도 양질의 상품들을 좀 더 합리적인 가치로써 제공하고 있습니다.">
<meta name="Keywords" content="다이렉트 게임즈,다렉,H2,에이치투,H2interactive,에이치투인터렉티브">
<link rel="shortcut icon" href="/favicon/favicon-32x32.png">
<link href="https://directg.net" rel="canonical" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
<link rel="manifest" href="/manifest.json?t=20260126_2">
<link rel="stylesheet" href="/assets/css/style.css">
<link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/dg_style.css?d=20260721">
<link rel="stylesheet" href="/assets/css/styleguide.css?t=20250826">

<link rel="stylesheet preload" as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S69YNEJF27"></script>
<?if($_SESSION['member']["m_id"]){?>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
 var user_id = "<?=$_SESSION['member']['m_no']?>";
  gtag('config', 'G-S69YNEJF27', {'user_id': user_id});
</script>
<?}else{?>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-S69YNEJF27');
</script>
<?}?>
	
<script type="text/javascript">
(function(c,l,a,r,i,t,y){
	c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
	t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
	y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "vn7kuje787");
</script>

<style>
#appCapsule{
	padding-bottom:56px;
}

.adbox.fixed{
	width: 320px;
}

.adbox-320-55 img {
	width: 320px;
	height: 55px;
}
</style>
</head>

<body class="dark-mode-active">
<!-- App Header -->
<? include_once($_SERVER["DOCUMENT_ROOT"].'/inc/main_header.html'); ?>
<!-- * App Header -->

<!-- App Capsule -->
<div id="appCapsule" class="full-height">
	<?//if(count($main_banner_plan)>0){?>
	<!--
	<div class="section full">
		<div class="adbox adbox-300-50 fixed">
			<?
				foreach($main_banner_plan as $value){
			?>
			<a href="<?=$value['banner_link']?>"><img src="<?=$value['domain']?>/upload/ezwel/banner/<?=$value['banner_img_mobile']?>" alt="<?=$value['banner_title']?>"></a>
			<?
				}
			?>
			<span class="closebutton" data-bs-dismiss="modal">
				<ion-icon name="close-outline"></ion-icon>
			</span>
		</div>
	</div>-->
	<?//}?>
	
	<!-- 기획배너 고정형 -->
	<? if(date('Y-m-d H:i:s')>='2026-06-25 16:00:00' && date('Y-m-d H:i:s')<'2026-07-09 16:00:00'){?>
	<div class="section">
		<div class="adbox adbox-320-55 fixed">
			<a href="/promotion/promotion_season.html"><img src="https://image.directg.net/x8a5Yy5gI7" alt="다이렉트 게임즈 2026 여름 프로모션"></a>
			<span class="closebutton" data-bs-dismiss="modal">
				<ion-icon name="close-outline"></ion-icon>
			</span>
		</div>
	</div>
	<?}?>

	<div class="section full mb-2">
		<div class="carousel-full splide" id="main_banner">
			<div class="splide__track">
				<ul class="splide__list">
					<?
						foreach($main_banner as $banner){
							/*
							switch($banner['option_info']['game_type']){
								case "game":
									$banner['main_banner_link'] = "/game/game_view.html?product_id=".$banner['title_info']['sku']."&sku=".$banner['option_info']['goods_sku']."&platform=".$banner['option_info']['product_platform'];
								break;
								case "dlc":
									$banner['main_banner_link'] = "/game/dlc_view.html?sku=".$banner['option_info']['goods_sku']."&platform=".$banner['option_info']['product_platform'];
								break;
								case "music":
									$banner['main_banner_link'] = "/game/dlc_view.html?sku=".$banner['option_info']['goods_sku']."&platform=".$banner['option_info']['product_platform'];
								break;
								case "bundle":
									$banner['main_banner_link'] = "/game/bundle_view.html?sku=".$banner['option_info']['goods_sku']."&platform=".$banner['option_info']['product_platform'];
								break;
								case "accessories":
									$banner['main_banner_link'] = "/game/goods_item_view.html?product_id=".$banner['title_info']['sku']."&sku=".$banner['option_info']['goods_sku']."&platform=".$banner['option_info']['product_platform'];
								break;
								case "holomodels":
									$banner['main_banner_link'] = "/game/holomodels_view.html?product_id=".$banner['title_info']['sku']."&sku=".$banner['option_info']['goods_sku']."&platform=".$banner['option_info']['product_platform'];
									if($banner['option_info']['display_type']=="holomodelsdlc"){
										$banner['main_banner_link'] = "/game/holomodelsdlc_view.html?sku=".$banner['option_info']['goods_sku']."&platform=";
									}
								break;
							}
							*/
							
							$consumer_price = $banner['option_info']['consumer_price'] ?? 0;
							$info_badge="";
							$promotion_badge="";
							if(!empty($banner['option_info'])){
								if($banner['option_info']['promotion']['sale_price']>0){
									$price = $banner['option_info']['promotion']['sale_price'];
									$discount = round(($consumer_price-$price)*100/$consumer_price);
									$is_promotion="Y";
									$banner['promotion_label']="bg-danger";
								}else{
									$price = $banner['option_info']['price'];
									$discount = round(($consumer_price-$price)*100/$consumer_price);
									$is_promotion="N";
									$banner['promotion_label']="bg-cprimary";
								}
							}
							if($banner['option_info']['is_preorder']=="Y"){
								$sales_status = "<span class='badge bg-cwarning rounded-1'>예약구매</span>";
							}else{
								$sales_status = "<span class='badge bg-cprimary rounded-1'>절찬 판매중</span>";
							}
							if($banner['option_info']['is_bonus']=="Y"){
								$info_badge = "<span class='badge bg-cinfo rounded-1'>특전</span>";
							}
							if($is_promotion=="Y"){
								$promotion_badge = "<span class='badge bg-cdanger rounded-1'>프로모션</span>";
							}
					?>
					<li class="splide__slide">
						<div class="card product-card rounded-0" >
							<a href="<?=$banner['main_banner_link']?>">
								<img src="<?=$banner['main_banner_mobile']?>" class="imaged w-100 rounded-0" alt="<?=$banner['option_info']['product_name']?> 이미지">
								
                                <div class="card-img-overlay rounded-0 d-flex align-items-end ">
									<div class="status_badge col-6 p-0">
                                <?php
                                    //실물상품도 통합하여 상품정보, 판매정보 노출여부로 관련영역 노출 26.04.29 KDY

                                    // 상품정보 노출 일때만
                                    if ($banner['show_prod_info'] == "Y") {
                                        echo $sales_status;
                                    }

                                    echo $promotion_badge;
                                    echo $info_badge;
                                ?>
									</div>
                                
									<div class="status_price col-6 p-0">
                                <?php
                                    // 판매정보 노출 일때만
                                    if ($banner['show_sale_info'] == "Y") {
                                ?>
                                        <?if($discount>0){?>
                                        <div class="d-flex align-items-end">
                                            <span class="badge <?=$banner['promotion_label']?> fw-bold num rounded-1 minus"><?=$discount?> %</span>
                                        </div>
                                        <?}?>
                                        <div class="d-flex flex-column align-items-start">
                                            <?if($discount>0){?><s class="num mb-0 won"> <?=number_format($consumer_price)?></s><?}?>
                                            <span class="fw-bold num text-white won"> <?=number_format($price)?></span>
                                        </div>
                                <?php 
                                    }
                                ?>
                                    </div>
								</div>
							</a>
						</div>
					</li>
					<?
						}
					?>
				</ul>
			</div>
		</div>
	</div>

	<section id="notice_section">
		<div class="container">
			<div class="col-12 border-primary d-flex border-1 border-solid notice_div">
				<div class="notice_icon align-content-center">
					<img src="/assets/img/icon/mingcute_notification-fill.svg" class="h-75">
				</div>
				<div id="notice" class="splide h-100 text-truncate">
					<div class="splide__track">
						<ul class="splide__list">
						<?php
							foreach($notice_list as $value){
						?>
							<li class="splide__slide">
								<div class="splide__slide__container news-item align-content-center text-truncate">
									<a href="/board/notice_view.html?idx=<?=$value['idx']?>">
										<span class="notice_date"><?=substr($value['deploy_date'],0,10)?></span>
										<span class="notice_subject"><?=$value['subject']?></span>
									</a>
								</div>
							</li>
						<?php
							}
						?>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!--기획 고정 배너2-->
	<div class="section">
	<? include_once($_SERVER['DOCUMENT_ROOT'].'/inc/footer_banner.html');?>
	</div>
	<!--End 기획 고정 배너 배너2-->

<!--	
	<div class="section full mb-2">
		<div class="section-title py-2">타임딜</div>
			https://image.directg.net/X82vMKs4rI
	</div>
-->
	<!--추천 및 특집-->
	<? if(count($main_recommand)>0){?>
	<div class="section">
		<div class="section-title py-2 px-0"><h2 class="mb-0">추천 및 특집</h2> </div>
		<div class="col" id="recommand_list">
		<?php
			foreach($main_recommand as $recommand){
		?>
			<div class="">
				<div class="recommand_main_img">
					<a href="<?=$recommand['recommand_banner_link']?>" title="<?=$recommand['recommand_name']?>"><img src="<?=$recommand['recommand_banner']?>" class="img-fluid w-100 card-shadow"></a>
				</div>
				<ul class="list-unstyled d-flex flex-wrap">
					<?php
						$recommand_goods_loop = 0;
						foreach($recommand['recommand_goods'] as $recommand_goods){
							$title_info = $goods->getGoodsOptionTitleInfo($recommand_goods['product_code']);
							$promotion_goods=$promotion->getPromotionGoodsPrice($recommand_goods['product_code']);
							if($promotion_goods['sale_price']>0){
								$recommand_goods['discount'] =$promotion_goods['discount_rate'];
								$recommand_goods['price'] =$promotion_goods['sale_price'];
								$recommand_goods['is_promotion']="Y";
								$recommand_goods['promotion_label']="bg-cdanger";
							}else{
								$recommand_goods['is_promotion']="N";
								$recommand_goods['promotion_label']="bg-cprimary";
							}
							if($recommand_goods_loop<2){
								if($recommand_goods['promotion']['sale_price']>0){
									$price = $recommand_goods['promotion']['sale_price'];
									$discount = $recommand_goods['promotion']['discount_rate'];
									$promotion_label="bg-danger";
								}else{
									$price = $recommand_goods['price'];
									$discount = $recommand_goods['discount'];
									$promotion_label="bg-cprimary";
								}
								switch($recommand_goods['delivery_type']){
									case "1":
										switch($recommand_goods['game_type']){
											case "game":
												$recommand_url = "/game/game_view.html?product_id=".$title_info['sku']."&sku=".$recommand_goods['goods_sku'];
											break;
											case "dlc":
												if($recommand_goods['display_type']=="dlc_bundle"){
													$recommand_url = "/game/bundle_view.html?sku=".$recommand_goods['goods_sku'];
												}else{
													$recommand_url = "/game/dlc_view.html?sku=".$recommand_goods['goods_sku'];
												}
											break;
											case "bundle":
												$recommand_url = "/game/bundle_view.html?sku=".$recommand_goods['goods_sku'];
											break;
											case "holomodels":
												switch($recommand_goods['display_type']){
													case "holomodels":
														$recommand_url = "/game/holomodels_view.html?product_id=".$title_info['sku']."&sku=".$recommand_goods['goods_sku'];
													break;
													case "holomodelsdlc":
														$recommand_url = "/game/holomodelsdlc_view.html?product_id=".$title_info['sku']."&sku=".$recommand_goods['goods_sku'];
													break;
													case "holomodelsedition":
														$recommand_url = "/game/holomodels_view.html?product_id=".$title_info['sku']."&sku=".$recommand_goods['goods_sku'];
													break;
												}
											break;
											default:
												$recommand_url="/game/game_view.html?product_id=".$title_info['sku'];
											break;
										}
									break;
									case "2":case "3":
										$recommand_url="/game/goods_item_view.html?product_id=".$title_info['sku']."&sku=".$recommand_goods['goods_sku'];
									break;
								}
					?>
					<div class="card row-card rounded-1 card-shadow border-0">
						<div class="card-body d-flex p-0">
							<div class="img rounded-0 position-relative col-5">
								<a href="<?=$recommand_url?>"><img src="<?=$recommand_goods['domain']?>/upload/product/<?=$recommand_goods['product_code']?>/header/header.jpg" class="img-fluid"></a>
								<div class="position-absolute top-0 start-0">
									<? 
										switch($recommand_goods['game_type']){
											case "game":
												switch($recommand_goods['display_type']){
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
												switch($recommand_goods['display_type']){
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
							<div class="product-info col-7">
								<div class="card-title d-flex flex-column mb-0 justify-content-evenly w-100 h-100">
									<div class="d-flex align-items-start flex-wrap align-content-start flex-shrink-0">
										<?if($recommand_goods['spoken_korean']=="Y"){?><span class="badge rounded-2 bg-cinfo">음성 한국어</span><?}?>
										<?if($recommand_goods['interface_korean']=="Y"){?><span class="badge rounded-2 bg-clight">인터페이스/자막 한글</span><?}?>
										<?if($recommand_goods['exclusive_korean']=="Y"){?><span class="badge rounded-2 bg-clight">독점 한국어</span><?}?>
									</div>
									<div class="product_name text-truncate">
										<?=$recommand_goods['product_name']?>
									</div>
								</div>
							</div>
						</div>

						<div class="d-flex justify-content-between card-tail">
							<div class="d-flex flex-row justify-content-start flex-wrap card-badge align-content-center">
								<?if($recommand_goods['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2">코드</span><?}?>
								<?if($recommand_goods['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2">택배</span><?}?>
								<?if($recommand_goods['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2">코드+택배</span><?}?>
								<?if($recommand_goods['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2">프로모션</span><?}?>
								<?if($recommand_goods['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning">예약</span><?}?>
								<?if($recommand_goods['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info">특전</span><?}?>
							</div>
							<div>
								<div class="d-flex flex-row justify-content-between align-items-center card-price">
									<?if($recommand_goods['discount']>0){?><div class="rounded-2 <?=$recommand_goods['promotion_label']?> badge percent minus"><?=$recommand_goods['discount']?> %</div><?}else{?><div></div><?}?>
									<div class="align-content-end d-flex flex-column align-items-end">
										<?if($recommand_goods['discount']>0){?><s class="num won old-price"> <?=number_format($recommand_goods['consumer_price'])?></s><?}?>
										<span class="current-price text-white num won"> <?=number_format($recommand_goods['price'])?></span>
									</div>
								</div>
							</div>
						</div>

					</div>
					<?
								$recommand_goods_loop++;
							}
						}
					?>
				</ul>
			</div>
		<?php
			}
		?>
		</div>
	</div>
	<?}?>

	<div class="section mb-2">
		<div class="section-title py-2 px-0">
			<h2 class="mb-0">인기게임</h2>
		</div>
		<div class="carousel-multiple splide" id="main_best">
			<div class="splide__track">
				<ul class="splide__list">
					<?
						$ranking =1;
						foreach($best_title as $value){
					?>
					<li class="splide__slide">
						<div class="card product-card">
							<div class="card-img position-relative rounded-0">
								<a href="/game/game_view.html?product_id=<?=$value['sku']?>" title="<?=$value['title_name']?>">
									<div class="position-absolute top-0 start-0">
										<div class="bg-secondary text-dark text-center" style="width:32px;height:32px;background:#313E4F !important "><span class="badge rounded-0 fs-5 my-1"><?=$ranking?></span></div>
									</div>
									<img src="<?=$value['domain']?>/upload/title/<?=$value['title_id']?>/library/library_600x900.jpg" class="imaged w-100 square" alt="<?=$value['title_name']?>">
								</a>
								<div class="position-absolute bottom-0 start-0">
									<? 
										switch($value['game_type']){
											case "game":
									?>
									<span class="badge bg-cinfo rounded-0">GAME</span>
									<?
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
							<!--
							<div class="card-badge bg-grey d-flex flex-row align-items-center">
								<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2">코드발송</span><?}?>
								<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2">택배발송</span><?}?>
								<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2">코드+택배발송</span><?}?>
								<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2">프로모션</span><?}?>
								<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning">예약구매</span><?}?>
								<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info">특전</span><?}?>
							</div>
							<div class="card-body">
								<div class="d-flex justify-content-between align-items-center">
									<div>
									<?if($value['discount']>0){?>
									<span class="badge bg-cprimary rounded-1 percent"><?=$value['discount']?> %</span>
									<?}?>
									</div>
									<div class="card-price">
										<div class="old-price"><?if($value['discount']>0){?><s class="won"> <?=number_format($value['consumer_price'])?></s><?}else{?>&nbsp;<?}?></div>
										<div class="current-price text-white won"> <?=number_format($value['price'])?></div>
									</div>
								</div>
							</div>
							-->
						</div>
					</li>
					<?	$ranking++;
						}
					?>
				</ul>
			</div>
		</div>
	</div>

	<div class="section">
		<div class="section-title py-2 px-0">
			<div class="d-flex justify-content-between align-items-end w-100">
				<h2 class="mb-0">신규게임</h2>
				<a href="/game/game_thumb.html" class="btn btn-outline-primary btn-allview">전체보기</a>
			</div>
		</div>
		<div class="carousel-multiple splide" id="main_new">
			<div class="splide__track">
				<ul class="splide__list">
					<?php
						foreach($new_game as $value){
							//프로모션 반영 — PC getProductInfo()와 동일. 활성 프로모션이 있으면 price/discount를 프로모션가로 덮어씀
							if(!empty($value['promotion']) && $value['promotion']['sale_price']>0){
								$value['discount']       = $value['promotion']['discount_rate'];
								$value['price']          = $value['promotion']['sale_price'];
								$value['is_promotion']   = "Y";
								$value['promotion_label']= "bg-danger";
							}else{
								$value['is_promotion']   = "N";
								$value['promotion_label']= "bg-cprimary";
							}
							switch($value['delivery_type']){
								case "1":
									$url="/game/game_view.html?product_id=".$value['sku'];
								break;
								case "2":case "3":
									$url="/game/goods_item_view.html?product_id=".$value['sku']."&sku=".$value['goods_sku'];
								break;
							}
					?>
					<li class="splide__slide">
						<div class="card product-card">
							<div class="card-header rounded-0 text-truncate ps-1 border-0">
								<?=$value['product_name']?>
							</div>
							<div class="card-img position-relative rounded-0">
								<a href="<?=$url?>">
									<img src="<?=$value['domain']?>/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg" class="imaged w-100 square" alt="<?=$value['product_name']?> image">
								
								</a>
								<div class="position-absolute bottom-0 start-0">
									<? 
										switch($value['game_type']){
											case "game":
									?>
									<span class="badge bg-cinfo rounded-0">GAME</span>
									<?
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
							<div class="card-badge bg-grey d-flex flex-row align-items-center">
								<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2">코드발송</span><?}?>
								<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2">택배발송</span><?}?>
								<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2">코드+택배발송</span><?}?>
								<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2">프로모션</span><?}?>
								<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning">예약구매</span><?}?>
								<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info">특전</span><?}?>
							</div>
							<div class="card-body">
								<div class="d-flex justify-content-between align-items-center">
									<div>
									<?if($value['discount']>0){?>
									<span class="badge <?=$value['promotion_label']?> rounded-1 percent minus"><?=$value['discount']?> %</span>
									<?}?>
									</div>
									<div class="card-price">
										<div class="old-price"><?if($value['discount']>0){?><s class="won"> <?=number_format($value['consumer_price'])?></s><?}else{?>&nbsp;<?}?></div>
										<div class="current-price text-white won"> <?=number_format($value['price'])?></div>
									</div>
								</div>
							</div>
						</div>
					</li>
					<?}?>
				</ul>
			</div>
		</div>
	</div>
	
	<? if(date('Y-m-d H:i:s')>='2025-08-27 16:00:00' && date('Y-m-d H:i:s')<'2025-09-01 00:00:00'){?>
	<div class="section mb-2">
		<div class="section-title py-2 px-0">
			<h2 class="mb-0">다이렉트 게임즈 X 네이버페이 즉시할인 이벤트</h2>
		</div>
		<div class="event_banner" id="event_banner">
			<a href="/board/notice_view.html?idx=30">
				<img src="https://image.directg.net/v82AtcoPy4" class="w-100">
			</a>
		</div>
	</div>
	<?}?>

	<?
		if(count($goods_preorder)>0){
	?>
	<div class="section">
		<div class="section-title py-2 px-0">
			<div class="d-flex justify-content-between align-items-end w-100">
				<h2 class="mb-0">예약구매</h2>
				<a href="/game/game_thumb.html?is_preorder=Y" class="btn btn-outline-primary btn-allview">전체보기</a>
			</div>
		</div>
		<div class="carousel-multiple splide" id="main_preorder">
			<div class="splide__track">
				<ul class="splide__list">
					<?php
						foreach($goods_preorder as $value){
							//프로모션 반영 — PC getProductInfo()와 동일. 활성 프로모션이 있으면 price/discount를 프로모션가로 덮어씀
							if(!empty($value['promotion']) && $value['promotion']['sale_price']>0){
								$value['discount']       = $value['promotion']['discount_rate'];
								$value['price']          = $value['promotion']['sale_price'];
								$value['is_promotion']   = "Y";
								$value['promotion_label']= "bg-danger";
							}else{
								$value['is_promotion']   = "N";
								$value['promotion_label']= "bg-cprimary";
							}
							switch($value['delivery_type']){
								case "1":
									switch($value['game_type']){
										case "game":
											$url = "/game/game_view.html?product_id=".$value['sku'];
										break;
										case "dlc":
											$url = "/game/dlc_view.html?sku=".$value['goods_sku'];
										break;
									}
								break;
								case "2":case "3":
									$url="/game/goods_item_view.html?product_id=".$value['sku']."&sku=".$value['goods_sku'];
								break;
							}
							
							
					?>
					<li class="splide__slide">
						<div class="card product-card">
							<div class="card-header rounded-0 text-truncate ps-1 border-0">
								<?=$value['product_name']?>
							</div>
							<div class="card-img position-relative rounded-0">
								<a href="<?=$url?>">
									<img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="imaged w-100 square" alt="<?=$value['product_name']?> 이미지">
								</a>
								<div class="position-absolute bottom-0 start-0">
									<? 
										switch($value['game_type']){
											case "game":
									?>
									<span class="badge bg-cinfo rounded-0">GAME</span>
									<?
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
							<div class="card-badge bg-grey d-flex flex-row align-items-center">
								<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2">코드발송</span><?}?>
								<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2">택배발송</span><?}?>
								<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2">코드+택배발송</span><?}?>
								<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2">프로모션</span><?}?>
								<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning">예약구매</span><?}?>
								<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info">특전</span><?}?>
							</div>
							<div class="card-body">
								<div class="d-flex justify-content-between align-items-center">
									<div>
									<?if($value['discount']>0){?>
									<span class="badge <?=$value['promotion_label']?> rounded-1 percent minus"><?=$value['discount']?> %</span>
									<?}?>
									</div>
									<div class="card-price">
										<div class="old-price"><?if($value['discount']>0){?><s class="won"> <?=number_format($value['consumer_price'])?></s><?}else{?>&nbsp;<?}?></div>
										<div class="current-price text-white won"> <?=number_format($value['price'])?></div>
									</div>
								</div>
							</div>
						</div>
					</li>
					<?}?>
				</ul>


			</div>
		</div>
	</div>
	<?
		}
	?>

	<div class="section">
		<div class="section-title py-2 px-0">
			<h2 class="mb-0">퍼블리셔 안내</h2>
		</div>
		<div class="col" id="publisher_list">
			<ul class="list-unstyled d-flex flex-wrap">
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">2K</span>
						</div>
						<a href="/game/publisher_2k_thumb.html" class="" title="2K"><img src="https://image.directg.net/N84CVZeIW8" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">SEGA</span>
						</div>
						<a href="/game/publisher_sega_thumb.html" class="" title="SEGA"><img src="https://image.directg.net/I84CVZipaf" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">CAPCOM</span>
						</div>
						<a href="/game/publisher_capcom_thumb.html" class="" title="CAPCOM"><img src="https://image.directg.net/upload/main/publisher_capcom.png" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header text-truncate">
							<span class="mb-0">Paradox Interactive</span>
						</div>
						<a href="/game/publisher_paradox_thumb.html" class="" title="Paradox Interactive"><img src="https://image.directg.net/y84CVZhNXz" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">PlayStation PC LLC</span>
						</div>
						<a href="/game/publisher_playstation_thumb.html" class="" title="PlayStation PC LLC"><img src="https://image.directg.net/T84CVZi7pP" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">NEOWIZ</span>
						</div>
						<a href="/game/publisher_neowiz_thumb.html" class="" title="NEOWIZ"><img src="https://image.directg.net/upload/main/publisher_neowiz.png" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">Arc System Works</span>
						</div>
						<a href="/game/publisher_asw_thumb.html" class="" title="Arc System Works"><img src="https://image.directg.net/I84CVZeZrr" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">THQ Nordic</span>
						</div>
						<a href="/game/publisher_thq_thumb.html" class="" title="THQ Nordic"><img src="https://image.directg.net/B84CVZiYCO" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">505 Games</span>
						</div>
						<a href="/game/publisher_505_games_thumb.html" class="" title="505 Games"><img src="https://image.directg.net/R84CVZeS5n" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">Focus Entertainment</span>
						</div>
						<a href="/game/publisher_focus_thumb.html" class="" title="Focus Entertainment"><img src="https://image.directg.net/C86t87TuRI" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0">Hooded Horse</span>
						</div>
						<a href="/game/publisher_hooded_horse_thumb.html" class="" title="Hooded Horse"><img src="https://image.directg.net/E84CVZfcs2" class="w-100"></a>
					</div>
				</li>
				<li class="col-6 p-0">
					<div class="card rounded-top card-shadow">
						<div class="card-header border-0 text-truncate">
							<span class="mb-0 ">Clouded Leopard Entertainment</span>
						</div>
						<a href="/game/publisher_clouded_leopard_thumb.html" class="" title="Clouded Leopard Entertainment"><img src="https://image.directg.net/P84CVZf632" class="w-100"></a>
					</div>
				</li>
			</ul>
		</div>
	</div>

	<?
	/*
		if(count($goods_spoken_korean)>0){
	?>

	<div class="section full">
		<div class="section-title py-2 mb-2 px-2">
			<h2 class="mb-0">음성 한국어지원</h2>
		</div>
		<div class="col" id="spoken_korean">
		<?
			foreach($goods_spoken_korean as $key=>$value){
				if($value['promotion']['sale_price']>0){
					$value['discount'] =$value['promotion']['discount_rate'];
					$value['price'] =$value['promotion']['sale_price'];
					$value['is_promotion']="Y";
					$value['promotion_label']="bg-danger";
				}else{
					$value['is_promotion']="N";
					$value['promotion_label']="bg-primary";
				}
		?>
				<div class="card row-card rounded-1 card-shadow border-0">
					<div class="card-body d-flex p-0">
						<div class="col-3 rounded-0 position-relative py-1">
							<a href="/game/game_view.html?product_id=<?=$value['sku']?>"><img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="img-fluid"></a>
							<div class="position-absolute top-0 start-0">
								<? 
									switch($value['game_type']){
										case "game":
								?>
								<span class="badge bg-info rounded-0 font-12 py-1">GAME</span>
								<?
										break;
										case "dlc":
								?>
								<span class="badge bg-content rounded-0 font-12 py-1">DLC</span>
								<?
										break;
										case "music":
								?>
								<span class="badge bg-content rounded-0 font-12 py-1">Music</span>
								<?
										break;
										case "bundle":
								?>
								<span class="badge bg-success rounded-0 font-12 py-1">번들</span>
								<?
										break;

									}
								?>
							</div>

						</div>
						<div class="col-9 product-info">
							<div class="d-flex justify-content-between">
								<div class="card-title d-flex flex-column mb-0 justify-content-between">
									<div class="text-secondary">
										<h5 class=""><?=$value['product_name']?></h5>
									</div>
									<div class="d-flex justify-content-end align-items-start flex-wrap align-content-start flex-shrink-0">
										<?if($value['spoken_korean']=="Y"){?><span class="badge rounded-2 bg-cinfo">음성 한국어</span><?}?>
										<?if($value['interface_korean']=="Y"){?><span class="badge rounded-2 bg-clight">인터페이스/자막 한글</span><?}?>
										<?if($value['exclusive_korean']=="Y"){?><span class="badge rounded-2 bg-csecondary">독점 한국어</span><?}?>
									</div>
								</div>


								<div class="d-flex flex-column justify-content-between">
									<div class="d-flex flex-row justify-content-end flex-wrap">
										<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2">코드발송</span><?}?>
										<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2">택배발송</span><?}?>
										<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2">코드+택배발송</span><?}?>
										<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2">프로모션</span><?}?>
										<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning">예약구매</span><?}?>
										<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info">특전</span><?}?>
									</div>

									<div class="d-flex flex-row justify-content-end align-items-end">
										<? if($value['discount']>0){?><span class="rounded-2 <?=$value['promotion_label']?> font-15 fw-bold px-2 py-1 num text-nowrap"><?=$value['discount']?> %</span><?}?>
										<div class="text-end mb-0 text-nowrap ms-2">
											<? if($value['discount']>0){?>
											<s class="num pe-1 font-12 text-secondary won"> <?=number_format($value['consumer_price'])?></s>
											<?}?>
											<span class="num font-12 fw-bold text-white won"> <?=number_format($value['price'])?></span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
		<?
			}
		?>






			<?foreach($goods_spoken_korean as $value){?>
				<!--div class="card mb-2 p-0 shadow-none">
					<div class="row m-0 g-2 align-items-center border rounded-0 border-opacity-10">
						<div class="col-4 p-0 m-0">
							<a href="/game/game_view.html?product_id=<?=$value['sku']?>" class="stretched-link w-100"><img src="/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg" class="w-100 h-100" alt="<?=$value['title_name']?>"></a>
						</div>
						<div class="col-8 p-0 m-0">
							<div class="card-body p-1">
								<h4 class="font-14 fw-400 mb-2"><?=$value['title_name']?></h4>
								<div class="price mb-0">
									<div class="d-flex flex-row-reverse justify-content-between align-items-center">
										<div class="me-1">
											<?if($value['discount']>0){?>
											<s class="text-secondary font-12 me-1">&#8361;<?=number_format($value['consumer_price'])?></s>
											<?}?>
											<span class="text-white font-14">&#8361; <?=number_format($value['price'])?></span>
										</div>
										<?if($value['discount']>0){?>
											<div class="chip chip-primary rounded-2 font-14"><span class="chip-label"><?=$value['discount']?> %</span></div>
										<?}?>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div-->
			<?}?>
		</div>
	</div>
	<?
		}
			*/
	?>

	
	<?
	/*
		if(count($goods_exclusive_korean)>0){
	?>

	<div class="section full">
		<div class="section-title py-2 mb-2 px-2">
			<h2 class="mb-0">독점 한국어지원</h2>
		</div>
		<div class="" id="exclusive_korean">
			<?foreach($goods_exclusive_korean as $value){?>
				<div class="card mb-2 p-0 shadow-none">
					<div class="row m-0 g-2 align-items-center border rounded-0 border-opacity-10">
						<div class="col-4 p-0 m-0">
							<a href="/game/game_view.html?product_id=<?=$value['sku']?>" class="stretched-link w-100"><img src="/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg" class="w-100 h-100" alt="<?=$value['title_name']?>"></a>
						</div>
						<div class="col-8 p-0 m-0">
							<div class="card-body p-1">
								<h4 class="font-14 fw-400 mb-2"><?=$value['title_name']?></h4>
								<div class="price mb-0">
									<div class="d-flex flex-row-reverse justify-content-between align-items-center">
										<div class="me-1">
											<s class="text-secondary font-12 me-1">&#8361;<?=number_format($value['consumer_price'])?></s>
											<span class="text-white font-14">&#8361; <?=number_format($value['price'])?></span>
										</div>
										<?if($value['discount']>0){?>
											<div class="chip chip-primary rounded-2 font-14"><span class="chip-label"><?=$value['discount']?> %</span></div>
										<?}?>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			<?}?>
		</div>
	</div>
	<?
	}
	*/
	?>

<!--
	<a href="#" class="button goTop show" title="위로">
		<div><img src="/assets/img/icon/bytesize_chevron-top.svg"></div>
		<div>TOP</div>
	</a>
-->
	<!-- App Footer -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/inc/main_footer.html'); ?>
	<!-- App Footer -->

</div>
<!-- * App Capsule -->

<!-- App Bottom Menu -->
<? include_once($_SERVER["DOCUMENT_ROOT"].'/inc/bottom_menu.html'); ?>
<!-- * App Bottom Menu -->

<!-- App Sidebar -->
<? include_once($_SERVER["DOCUMENT_ROOT"].'/inc/sidebar.html'); ?>
<!-- * App Sidebar -->

<!-- App Search -->
<? include_once($_SERVER["DOCUMENT_ROOT"].'/inc/app_search.html'); ?>
<!-- * App Search -->

<!-- ============== Js Files ==============  -->
<!-- Bootstrap -->
<script src="/assets/js/lib/bootstrap.min.js"></script>
<!-- Ionicons -->
<script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
<!-- Splide -->
<script src="/assets/js/plugins/splide/splide.min.js"></script>
<!-- ProgressBar js -->
<script src="/assets/js/plugins/progressbar-js/progressbar.min.js"></script>

<script src="/assets/js/plugins/splide/splide-extension-grid.min.js"></script>

<script src="/assets/js/lib/jquery-3.4.1.min.js"></script>

<script src="/assets/js/base.js?20250813"></script>

<script>
$(document).ready(function(){
	$(".btn_preorder").bind("click",function(){
		var index = $(".btn_preorder").index(this);
		var goods_code = $(".btn_preorder").eq(index).attr("data-goodscode");

		var newForm = $('<form></form>');
		newForm.attr("name","newForm");
		newForm.attr("method","post");
		newForm.attr("action","/order/order_pre.html");
		//newForm.attr("target","_blank");

		newForm.append($('<input/>', {type: 'hidden', name: 'goods_code', value:goods_code }));
		newForm.appendTo('body');
		newForm.submit();
	});

	$("#btn_search").bind("click",function(){
		$("#offcanvas-search").show();
	});

	$("#btn_searchbox_close").bind("click",function(){
		$("#search").removeClass("show");
	});
	
});
	
	var main_banner = document.getElementById("main_banner");
	if(main_banner!=null){
		var splide0 = new Splide( '#main_banner', {
			type: 'loop',
			grid: {
				gap : {
					row: '0rem',
					col: '0rem',
				},
		   },
			perPage    : 1,
			perMove    : 1,
			pagination: false,
			arrows: false,
			drag: true,
			flickMaxPages: 1,
			autoplay: true,
			interval: 4000
		} );

		splide0.mount(window.splide0.Extensions);
	}

	var main_new = document.getElementById("main_new");
	if(main_new!==null){
		var splide2 = new Splide( '#main_new', {
			grid: {
				gap : {
					row: '1rem',
					col: '1rem',
				},
			},
			perPage    : 2,
			perMove    : 1,
			pagination: false,
			arrows: false,
			drag: true,
			flickMaxPages: 1
		} );

		splide2.mount(window.splide2.Extensions);
	}
	
	var main_best = document.getElementById("main_best");
	if(main_best!=null){
		var splide3 = new Splide( '#main_best', {
		grid: {
				gap : {
					row: '1rem',
					col: '1rem',
				},
		},
			perPage    : 2,
			perMove    : 1,
			pagination: false,
			arrows: false,
			drag: true,
			flickMaxPages: 1
		} );

		splide3.mount(window.splide3.Extensions);
	}
	
	var main_preorder = document.getElementById("main_preorder");
	if(main_preorder!=null){
		var splide4 = new Splide( '#main_preorder', {
			grid: {
				gap : {
					row: '1rem',
					col: '1rem',
				},
		   },
			perPage    : 2,
			perMove    : 1,
			pagination: false,
			arrows: false,
			drag: true,
			flickMaxPages: 1,
		} );

		splide4.mount(window.splide4.Extensions);
	}

	/*
	var publisher_list = document.getElementById("publisher_list");
	if(publisher_list!=null){
		var splide5 = new Splide( '#publisher_list', {
			grid: {
				gap : {
					row: '0rem',
					col: '0rem',
				},
		   },
			perPage    : 1,
			perMove    : 1,
			pagination: false,
			arrows: false,
			rewind:false
		} );

		splide5.mount(window.splide5.Extensions);
	}
	*/


document.addEventListener( 'DOMContentLoaded', function () {
	var notice = new Splide( '#notice', {
		type: 'loop',
		perPage: 1,
		rewind: true,
		arrows:false,
		direction: 'ttb',
		drag: true,
		dragMinThreshold: {
			mouse:0,
			touch:10,
		},
		wheel: true,
		releaseWheel: true,
		wheelSleep: 100,
		height: '2rem' ,
		focus: 'center',
		pagination: false,
		autoplay: true,
		interval: 3000, 
	});

	notice.mount();
});
</script>
</body>
</html>