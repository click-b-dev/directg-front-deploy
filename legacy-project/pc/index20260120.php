<?php

if($_SERVER['REMOTE_ADDR']<>"112.216.231.146"){
	header( "HTTP/1.1 301 Moved Permanently" );
	header( 'Location: https://directg.net/index.php' );
	exit;
}

ini_set( "display_errors", 1 );
header("Content-Type:text/html; charset=utf-8"); 

include_once($_SERVER["DOCUMENT_ROOT"].'/lib/lib.php');

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$main = new Main($conn);
	$goods = new Goods($conn);
	$mypage = new Mypage2($conn);
	$draw = new Draw($conn);
	
	$main_banner_plan = array();
	$main_banner = array();
	$main_banner_jehu = array();
	$main_promotion_banner = array();
	$main_banner_jehu_b = array();
	$goods_preorder = array();
	$goods_spoken_korean = array();
	$goods_exclusive_korean = array();
	$best_game = array();
	
	$aside['cart'] = "Y";
	$aside['wishlist'] = "Y";
	
	//메인배너 목록
	$main_banner = $main->getMainBanner();
	
	//추천 및 특집 목록
	$main_recommand = $main->getMainRecommand();

	//공지사항
	$notice_list = $main->getNoticeMain(5);

	//인기타이틀 리스트
	$best_title = $main->getBestTitle(12);

	//신규게임(기본게임) 리스트
	$new_game = $main->getNewGame(8);

	//음성한국어 지원리스트
	$goods_spoken_korean = $main->getGoodsSpokenKorean(5);

	//독점 한국어지원리스트
	$goods_exclusive_korean = $main->getGoodsExclusiveKorean(5);
	
	//예약판매 리스트
	$goods_preorder = $main->getGoodsPreorder(30);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

?>
<!DOCTYPE html>
<html lang="ko" data-bs-theme="dark">
<head>
<meta charset="utf-8" />
<title>다이렉트 게임즈</title>
<meta name="description" content="다이렉트 게임즈는 세계 유수의 개발사 및 퍼블리셔와 직접 제휴하여 자체 유통 마진은 최소화하면서도 양질의 상품들을 좀 더 합리적인 가치로써 제공하고 있습니다.">
<meta name="Keywords" content="다이렉트 게임즈,다렉,H2,에이치투,H2interactive,에이치투인터렉티브">
<meta content="H2interactive" name="author" />
<meta name="viewport" content="width=device-width">
<link href="https://directg.net" rel="canonical" />
<link rel="alternate" media="only screen and (max-width: 640px)"  href="https://m.directg.net" hreflang="ko-kr">
<link rel="shortcut icon" href="/favicon.ico?t=20250828">
<link rel="stylesheet" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap">

<link rel="stylesheet" as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<!--
<link rel="stylesheet" type="text/css" href="/assets/css/vendor/splide.min.css?t=<?=time()?>">
-->
<link href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css" rel="stylesheet">

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">

<link href="/templete/assets/dist/css/custom.css" rel="stylesheet">

<link rel="stylesheet" type="text/css" href="/assets/css/page/main.css">

<link href="/assets/css/directg.css?t=2026020401" rel="stylesheet" type="text/css" />
<link href="/assets/css/styleguide.css?t=2026020401" rel="stylesheet" type="text/css" />
<link href="/assets/css/card-list.css?d=2026020401" rel="stylesheet" type="text/css" />

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

<style>
	.text-shadow{
		text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px  1px 0 #000, 1px  1px 0 #000;
	}
	#splide .splide{
		margin-top:16px;
	}
	
	#splide .splide__slide__container{
		padding:0px 16px 0px 16px;
	}
	#splide .splide__slide__container img {
		width: 1296px;
		height: 500px;
	}
	
	#splide .splide__pagination{
		bottom:-30px;
		height:30px;
	}
	
	#splide .splide__pagination li{
		margin-right:10px;
	}
	
	#splide .splide__pagination li .splide__pagination__page{
		color:#ffffff;
		width:50px;
		height:15px;
		border-radius:5px;
	}
	#splide .splide__pagination__page.is-active{
		transform:none;
		color:#0d6efd;
		background:#0d6efd;
	}
	
	#splide .splide__pagination li.is-active button:before{
		color:#ffffff;
		content:"";
		
	}
	
	#splide .splide__pagination__page{
		
	}

	.badge-lg {
		padding: 9px 13px !important;
	}
	.card-badge{
		min-height:42px;
	}
	.font-notosans{
		font-family: 'Noto Sans KR', sans-serif;
	}
	
	
</style>
</head>
<body>
<div class="wrapper">
	<? include_once($_SERVER['DOCUMENT_ROOT'].'/inc/header.html');?>

	<main>

		<section class="splide mt-5" id="splide" >
			<div class="splide__track">
				<ul class="splide__list">
					<?
						foreach($main_banner as $banner){
					?>
					<li class="splide__slide">
						<div class="splide__slide__container">
							<a href="<?=$banner['main_banner_link']?>" class="stretched-link" title="<?=$banner['option_info']['product_name']?>" target="<?=$banner['main_banner_target']?>"><img src="<?=$banner['main_banner_pc']?>" alt="<?=$banner['option_info']['product_name']?>"></a>
							
								<?
									$consumer_price = $banner['option_info']['consumer_price'];
							
									if($banner['option_info']['promotion']['sale_price']>0){
										$price = $banner['option_info']['promotion']['sale_price'];
										$discount = ($consumer_price-$price)*100/$consumer_price;
										$banner['promotion_label']="bg-danger";
									}else{
										$price = $banner['option_info']['price'];
										$discount = ($consumer_price-$price)*100/$consumer_price;
										$banner['promotion_label']="bg-primary";
									}
									
									if($banner['option_info']['is_preorder']=="Y"){
										$sales_status = "<span class='badge bg-warning fs-5 badge-lg'>예약구매</span>";
									}else{
										$sales_status = "<span class='badge bg-primary fs-5 badge-lg'>절찬 판매중</span>";
									}

								?>
								<?
									//실물상품은 라벨과 상품명 노출 제외
									if($banner['option_info']['game_type']=="accessories"){
								?>
							<div class="caption2 w-50">
								<div class="d-flex flex-column " style="height:400px">
									<div class="mb-auto"></div>
									<div class="mb-3"><span class="h4"><?=$banner['main_banner_publisher']?></span></div>
									<div class="mb-3">
										<div class="d-flex flex-row align-items-center">
											<?php if($discount>0){?>
											<div class="pe-3">
												<span class="badge <?=$banner['promotion_label']?> fw-bold font-16 num px-3 py-3">-<?=round($discount)?>%</span>
											</div>
											<?php } ?>
											<div class="d-flex flex-column">
											<?php if($discount>0){?>
												<s class="font-12 text-secondary num won"> <?=number_format($consumer_price)?></s>
											<?php } ?>
												<span class="font-16 fw-bold num won"> <?=number_format($price)?></span>
											</div>
										</div>
									</div>
									<div class="mb-3">
									<?php
										if($banner['option_info']['release_date']>"1990-01-01 00:00:00"){
									?>
										<span class="font-16">출시일: <?=substr($banner['option_info']['release_date'],0,10)?></span>
									<?php
										}
									?>
									</div>
								</div>
							</div>
								<?
									}else{
								?>
							<div class="caption w-50">
								<div class="d-flex flex-column " style="height:400px">
									<div class="mb-3"><?=$sales_status?></div>
									<div class="mb-auto"><h2 class="h2 text-white fw-bold text-wrap lh-sm"><?=$banner['option_info']['product_name']?></h2></div>
									<div class="mb-3"><span class="h4"><?=$banner['main_banner_publisher']?></span></div>
									<div class="mb-3">
										<div class="d-flex flex-row align-items-center">
											<?php if($discount>0){?>
											<div class="pe-3">
												<span class="badge <?=$banner['promotion_label']?> fw-bold font-16 num px-3 py-3">-<?=round($discount)?>%</span>
											</div>
											<?php } ?>
											<div class="d-flex flex-column">
											<?php if($discount>0){?>
												<s class="font-12 text-secondary num won"> <?=number_format($consumer_price)?></s>
											<?php } ?>
												<span class="font-16 fw-bold num won"> <?=number_format($price)?></span>
											</div>
										</div>
									</div>
									<div class="mb-3">
									<?php
										if($banner['option_info']['release_date']>"1990-01-01 00:00:00"){
									?>
										<span class="font-16">출시일: <?=substr($banner['option_info']['release_date'],0,10)?></span>
									<?php
										}
									?>
									</div>
								</div>
							</div>
								<?
									}
								?>
						</div>
					</li>
					<?
						}
					?>
				</ul>
			</div>
		</section>

		<div class="b-example-divider"></div>
		
		<!--공지사항-->
		<section id="notice_section">
			<div class="container">
				<div class="col-12 border-primary d-flex border-1 border-solid">
					<div class="splide-title col-2 text-primary fw-600 d-flex align-items-center justify-content-center gap-2">
						<img src="/assets/images/icon/mingcute_notification-fill.svg"> 공지사항
					</div>
					<div id="notice" class="splide col-10">
						<div class="splide__track">
							<ul class="splide__list">
							<?php
								foreach($notice_list as $value){
							?>
								<li class="splide__slide">
									<div class="splide__slide__container news-item font-16 align-content-center text-white">
										<a href="/board/notice_view.html?idx=<?=$value['idx']?>" title="<?=$value['subject']?>">
											<span class="pe-2"><?=substr($value['deploy_date'],0,10)?></span>
											<span><?=$value['subject']?></span>
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
		<!--//공지사항-->
		<div class="b-example-divider"></div>
		
		<!--이벤트 배너-->
		<?
		if(date('Y-m-d H:i:s')>='2025-11-14 00:00:00' && date('Y-m-d H:i:s')<'2025-12-03 23:59:00'){
		?>
		<section id="event_banner" class="mb-0">
			<div class="container">
				<a href="/board/notice_view.html?idx=141"><img src="https://image.directg.net/h84zMsihbi" class="d-block w-100" alt="네이버페이로 5만원이상 결제시 3천원 즉시 할인"></a>
			</div>
		</section>
		
		<div class="b-example-divider"></div>
		<?
		}
		?>
		<!--//이벤트 배너-->

<!--
		<section id="time_deal" class="mb-2">
			<div class="container">
				<h2 class="fw-bold">다이렉트 게임즈 타임딜</h2>
				<div class="d-flex justify-content-center align-items-center">
					<img src="/assets/images/common/DG_partnerBr_1296x160_timedeal_240327.png">
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
-->
		<!--추천 및 특집-->
		<? if(count($main_recommand)>0){?>
		<section id="recommand" class="mb-2">
			<div class="container">
				<h2 class="fw-bold">추천 및 특집</h2>
				<?
					foreach($main_recommand as $recommand){
				?>
				<article class="my-3">
					<div class="row g-0 m-0">
						<div class="col-md-6"><a href="<?=$recommand['recommand_banner_link']?>" title="<?=$recommand['recommand_name']?>"><img src="<?=$recommand['recommand_banner']?>" class="img-fluid card-shadow" alt="<?=$recommand['recommand_name']?>"></a></div>
						<div class="col-md-6">
							<div class="d-flex flex-wrap thumb_list justify-content-start" id="">
								<?
									$draw->drawThumb($recommand['recommand_goods'],$_SESSION['member']['m_no']);
								?>
							</div>
						</div>
					</div>
				</article>
				<div class="b-example-divider"></div>
				<?}?>
			</div>
		</section>
		<?}?>

		<!--인기게임-->
		<section id="best_game" class="mb-2">
			<div class="container">
				<h2 class="fw-bold">인기게임</h2>
				<div class="row row-col-2 row-cols-md-6 g-2">
					<?
						$ranking =1;
						foreach($best_title as $key=>$value){
					?>
					<div class="col-2">
						<div class="card mb-0 rounded-1 card-shadow border-0 h-100">
							<div class="position-relative h-100 d-flex align-items-center">
								<div class="position-absolute top-0 start-0">
									<div class="ratio ratio-1x1" style="width:32px;height:32px"><span class="badge bg-darkblue text-white rounded-0 font-14 num px-1 py-2"><?=$ranking?></span></div>
								</div>
								<a href="/game/game_view.html?product_id=<?=$value['sku']?>" title="<?=$value['title_name']?>"><img src="<?=$value['domain']?>/upload/title/<?=$value['title_id']?>/library/library_600x900.jpg" class="card-img-top rounded-1" alt="<?=$value['title_name']?>" onerror="this.src='/assets/images/logo/H2_DG_BI_VERTICAL.svg'"></a>
							</div>
						</div>
					</div>
					<?
							$ranking++;
						}
					?>
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
		<!--//인기게임-->
		
		<!--신규게임-->
		<section id="new_game" class="mb-2">
			<div class="container">
				<div class="d-flex align-items-start">
					<h2 class="fw-bold d-inline">신규게임</h2> <a href="/game/game_thumb.html?category_code=&sort=release" class="btn btn-primary all-btn">전체보기</a>
				</div>
				<div class="row row-col-2 row-cols-md-4 g-3">
					<?
						$goods_loop = 1;
						foreach($new_game as $key=>$value){
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
					<div class="col-3">
						<div class="card mb-0 rounded-1 bg-card card-shadow border-0">
							<div class="card-header mb-0 p-2 rounded-0 border-0"><h5 class="card-title fw-400 font-14 text-secondary mb-0 p-2 align-content-center text-truncate"><a href="/game/game_view.html?product_id=<?=$value['sku']?>" title="<?=$value['product_name']?>" class="text-secondary text-decoration-none"><?=$value['product_name']?></a></h5></div>
							<div class="card-body position-relative p-0">
								<a href="/game/game_view.html?product_id=<?=$value['sku']?>" title="<?=$value['product_name']?>">
									<img src="<?=$value['domain']?>/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg" class="card-img-top rounded-0" alt="<?=$value['product_name']?>" onerror="this.style.visibility='hidden'">
								</a>
								<div class="position-absolute bottom-0 start-0">
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
							<div class="card-badge bg-grey d-flex flex-row align-items-center">
								<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2 font-12 p-2 ms-2">코드발송</span><?}?>
								<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2 font-12 p-2 ms-2">택배발송</span><?}?>
								<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2 font-12 p-2 ms-2">코드+택배발송</span><?}?>
								<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2 font-12 p-2 ms-2">프로모션</span><?}?>
								<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning font-12 p-2 ms-2">예약구매</span><?}?>
								<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info font-12 p-2 ms-2">특전</span><?}?>
							</div>
							<div class="card-footer px-2 py-0 border-0">
								<div class="d-flex flex-row justify-content-between align-items-center" style="min-height:48px">
									<?if($value['discount']>0){?>
									<div><span class="badge <?=$value['promotion_label']?> num font-14 px-3 py-2">-<?=$value['discount']?>%</span></div>
									<?}?>
									<div  class="ms-auto text-end align-text-bottom">
										<?if($value['discount']>0){?>
										<div class="d-block fw-normal p-0 m-0"><small class="text-decoration-line-through font-11 num text-secondary won"> <?=number_format($value['consumer_price'])?></small></div>
										<?}?>
										<div class="d-block"><span class="d-block p-0 m-0 num text-white font-14 fw-bold won"> <?=number_format($value['price'])?></span></div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<?	
						}
					?>
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
		<!--//신규게임-->
		
		<!--이벤트 배너-->
		<? if(date('Y-m-d H:i:s')>='2025-08-27 16:00:00' && date('Y-m-d H:i:s')<'2025-09-01 00:00:00'){?>
		<section id="event_banner2" class="mb-0">
			<div class="container">
				<div id="event_banner_carousel" class="carousel slide">
					<div class="carousel-inner">
						<div class="carousel-item active">
							<h2 class="font-24 text-white">다이렉트 게임즈 X 네이버페이 즉시할인 이벤트</h2>
							<a href="/board/notice_view.html?idx=30"><img src="https://image.directg.net/X82k22XCkH" class="d-block" alt="다이렉트 게임즈 X 네이버페이 즉시할인 이벤트"></a>
						</div>
					</div>
					<!--
					<button class="carousel-control-prev mt-4" type="button" data-bs-target="#event_banner_carousel" data-bs-slide="prev">
						<span class="carousel-control-prev-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Previous</span>
					</button>
					<button class="carousel-control-next mt-4" type="button" data-bs-target="#event_banner_carousel" data-bs-slide="next">
						<span class="carousel-control-next-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Next</span>
					</button>
					-->
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
		<?}?>
		<!--//이벤트 배너-->
		
		<!--예약구매-->
		<section id="goods_preorder" class="mb-2">
			<div class="container">
				<div class="d-flex align-items-start">
					<h2 class="fw-bold d-inline">예약구매</h2> <a href="/game/game_preorder.html" target="_blank" class="btn btn-primary all-btn">전체보기</a>
				</div>
				<div id="preorder_area" class="d-flex flex-row justify-content-start flex-nowrap card-shadow border-0 custom-scroll">
				<?
					foreach($goods_preorder as $key=>$value){
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
					<div class="float-start" style="margin-right:1.5rem">
						<div class="card rounded-1 bg-card card-shadow border-0"  style="width:360px;">
							<div class="card-header mb-0 p-2 border-0"><h5 class="card-title fw-400 font-14 text-secondary mb-0 py-2 align-content-center text-truncate"><a href="/game/game_view.html?product_id=<?=$value['sku']?>" class="text-decoration-none text-secondary"><?=$value['product_name']?></a></h5></div>
							<div class="card-body p-0 position-relative">
								<a href="/game/game_view.html?product_id=<?=$value['sku']?>">
									<img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="card-img-top rounded-0" alt="<?=$value['product_name']?>" onerror="this.style.visibility='hidden'">
									<div class="position-absolute top-0 start-0">
									<?php
										if($value['release_date']>'1990-01-01 00:00:00'){
									?>
										<span class="badge align-top bg-primary font-12 rounded-0 fw-normal"><?=substr($value['release_date'],0,10)?> 출시</span>
									<?php
										}
									?>
									</div>
								</a>
								<div class="position-absolute bottom-0 start-0">
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
									<span class="badge bg-primary rounded-0 font-12 py-1">번들</span>
									<?
											break;

										}
									?>
								</div>
							</div>
							<div class="card-badge bg-grey d-flex flex-row align-items-center">
								<?if($value['delivery_type']=='1'){?><span class="badge badge-outline-success rounded-2 font-12 p-2 ms-2">코드발송</span><?}?>
								<?if($value['delivery_type']=='2'){?><span class="badge badge-outline-post rounded-2 font-12 p-2 ms-2">택배발송</span><?}?>
								<?if($value['delivery_type']=='3'){?><span class="badge badge-outline-code-post rounded-2 font-12 p-2 ms-2">코드+택배발송</span><?}?>
								<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2 font-12 p-2 ms-2">프로모션</span><?}?>
								<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning font-12 p-2 ms-2">예약구매</span><?}?>
								<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info font-12 p-2 ms-2">특전</span><?}?>
							</div>
							<div class="card-footer px-2 py-0 border-0">
								<div class="d-flex flex-row justify-content-between align-items-center" style="min-height:48px">
									<?if($value['discount']>0){?>
									<div><span class="badge <?=$value['promotion_label']?> num font-14 px-3 py-2">-<?=$value['discount']?>%</span></div>
									<?}?>
									<div  class="ms-auto text-end align-text-bottom">
										<?if($value['discount']>0){?>
										<div class="d-block fw-normal p-0 m-0"><small class="text-decoration-line-through text-secondary font-11 num won"> <?=number_format($value['consumer_price'])?></small></div>
										<?}?>
										<div class="d-block"><span class="d-block p-0 m-0 num text-white font-14 fw-bold won"> <?=number_format($value['price'])?></span></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				<?
					}
				?>
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
		<!--//예약구매-->
		
		<section id="goods_publisher" class="mb-2">
			<div class="container">
				<h2 class="fw-bold">퍼블리셔 안내</h2>
				<div class="row" id="publisher_area">
					<div class="col-4">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">2K</div>
							<div class="card-body p-0"><a href="/game/publisher_2k_thumb.html" class="stretched-link" title="2K"><img src="https://image.directg.net/N84CVZeIW8" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">SEGA</div>
							<div class="card-body p-0"><a href="/game/publisher_sega_thumb.html" class="stretched-link" title="SEGA"><img src="https://image.directg.net/I84CVZipaf" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">CAPCOM</div>
							<div class="card-body p-0"><a href="/game/publisher_capcom_thumb.html" class="stretched-link" title="CAPCOM"><img src="https://image.directg.net/upload/main/publisher_capcom.png" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">Paradox Interactive</div>
							<div class="card-body p-0"><a href="/game/publisher_paradox_thumb.html" class="stretched-link" title="Paradox Interactive"><img src="https://image.directg.net/y84CVZhNXz" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">PlayStation PC LLC</div>
							<div class="card-body p-0"><a href="/game/publisher_playstation_thumb.html" class="stretched-link" title="PlayStation PC LLC"><img src="https://image.directg.net/T84CVZi7pP" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">NEOWIZ</div>
							<div class="card-body p-0"><a href="/game/publisher_neowiz_thumb.html" class="stretched-link" title="NEOWIZ"><img src="https://image.directg.net/upload/main/publisher_neowiz.png" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">Arc System Works</div>
							<div class="card-body p-0"><a href="/game/publisher_asw_thumb.html" class="stretched-link" title="Arc System Works"><img src="https://image.directg.net/I84CVZeZrr" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">THQ Nordic</div>
							<div class="card-body p-0"><a href="/game/publisher_thq_thumb.html" class="stretched-link" title="THQ Nordic"><img src="https://image.directg.net/B84CVZiYCO" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">505 Games</div>
							<div class="card-body p-0"><a href="/game/publisher_505_games_thumb.html" class="stretched-link" title="505 Games"><img src="https://image.directg.net/R84CVZeS5n" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">Square Enix</div>
							<div class="card-body p-0"><a href="/game/publisher_square_enix_thumb.html" class="stretched-link" title="Square Enix"><img src="https://image.directg.net/I84CVZiH4q" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">Hooded Horse</div>
							<div class="card-body p-0"><a href="/game/publisher_hooded_horse_thumb.html" class="stretched-link" title="Hooded Horse"><img src="https://image.directg.net/E84CVZfcs2" class="w-100"></a></div>
						</div>
					</div>
					<div class="col-4 mt-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 border-0">Clouded Leopard Entertainment</div>
							<div class="card-body p-0"><a href="/game/publisher_clouded_leopard_thumb.html" class="stretched-link" title="Clouded Leopard Entertainment"><img src="https://image.directg.net/P84CVZf632" class="w-100"></a></div>
						</div>
					</div>
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
		
		<section id="goods_korean" class="mb-2">
			<div class="container">
				<div class="row g-2">
					<div class="col-6">
						<div class="d-flex align-items-start">
							<h2 class="fw-bold d-inline">음성 한국어지원</h2> <a href="/game/game_search_thumb.html?spoken_korean=Y" target="_blank" class="btn btn-primary all-btn">전체보기</a>
						</div>
						<article id="spoken_korean">
							<div class="row row-cols-1 row-cols-md-1 g-3">
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
								<div class="col">
									<div class="card rounded-1 bg-grey card-shadow border-0">
										<div class="row g-0">
											<div class="col-md-4 rounded-0 position-relative">
												<a href="/game/game_view.html?product_id=<?=$value['sku']?>"><img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="img-fluid rounded-start"></a>
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
											<div class="col-md-8">
												<div class="card-body h-100 d-flex flex-column justify-content-between">
													<div class="card-title pb-2 d-flex flex-row mb-0 justify-content-between">
														<div class="text-secondary">
															<h5 class=""><a href="/game/game_view.html?product_id=<?=$value['sku']?>" class="text-secondary text-decoration-none"><?=$value['product_name']?></a></h5>
														</div>
														<div class="d-flex justify-content-end align-items-start flex-wrap align-content-start flex-shrink-0">
															<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2 font-12 p-2 ms-1 mb-1">코드발송</span><?}?>
															<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2 font-12 p-2 ms-1 mb-1">택배발송</span><?}?>
															<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2 font-12 p-2 ms-1 mb-1">코드+택배발송</span><?}?>
															<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2 font-12 p-2 ms-1 mb-1">프로모션</span><?}?>
															<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning font-12 p-2 ms-1 mb-1">예약구매</span><?}?>
															<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info font-12 p-2 ms-1 mb-1">특전</span><?}?>
														</div>
													</div>


													<div class="d-flex flex-row">
														<div class="d-flex flex-row align-items-end col-6 flex-wrap">
															<?if($value['spoken_korean']=="Y"){?><span class="badge rounded-2 bg-info font-12 fw-500 me-1">음성 한국어</span><?}?>
															<?if($value['interface_korean']=="Y"){?><span class="badge rounded-2 bg-light font-12 fw-500 me-1">인터페이스/자막 한글</span><?}?>
															<?if($value['exclusive_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500 me-1">독점 한국어</span><?}?>
														</div>

														<div class="d-flex flex-row justify-content-end col-6 align-items-end">
															<? if($value['discount']>0){?><span class="rounded-2 <?=$value['promotion_label']?> font-14 fw-bold px-3 py-1 num text-nowrap">-<?=$value['discount']?>%</span><?}?>
															<div class="text-end mb-0 text-nowrap ms-2">
																<? if($value['discount']>0){?>
																<s class="num pe-1 font-11 text-secondary won"> <?=number_format($value['consumer_price'])?></s>
																<?}?>
																<span class="num font-14 fw-bold text-white won"> <?=number_format($value['price'])?></span>
															</div>
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
							</div>
						</article>
					</div>
					<div class="col-6">
						<div class="d-flex align-items-start">
							<h2 class="fw-bold d-inline">독점 한국어지원</h2> <a href="/game/game_search_thumb.html?exclusive_korean=Y" target="_blank" class="btn btn-primary all-btn">전체보기</a>
						</div>
						<article id="exclusive_korean">
							<div class="row row-cols-1 row-cols-md-1 g-3">
							<?
								foreach($goods_exclusive_korean as $key=>$value){
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
								<div class="col">
									<div class="card rounded-1 bg-grey card-shadow border-0">
										<div class="row g-0">
											<div class="col-md-4">
												<div class="position-relative">
													<a href="/game/game_view.html?product_id=<?=$value['sku']?>" class=""><img src="<?=$value['domain']?>/upload/product/<?=$value['product_code']?>/header/header.jpg" class="img-fluid rounded-start"></a>
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
											</div>
											<div class="col-md-8">
												<div class="card-body h-100 d-flex flex-column justify-content-between">

													<div class="card-title pb-2 d-flex flex-row mb-0 justify-content-between">
														<div class="text-secondary">
															<h5 class=""><a href="/game/game_view.html?product_id=<?=$value['sku']?>" class="text-secondary text-decoration-none"><?=$value['product_name']?></a></h5>
														</div>
														<div class="d-flex justify-content-end align-items-start flex-wrap align-content-start flex-shrink-0">
															<?if($value['delivery_type']=="1"){?><span class="badge badge-outline-success rounded-2 font-12 p-2 ms-1 mb-1">코드발송</span><?}?>
															<?if($value['delivery_type']=="2"){?><span class="badge badge-outline-post rounded-2 font-12 p-2 ms-1 mb-1">택배발송</span><?}?>
															<?if($value['delivery_type']=="3"){?><span class="badge badge-outline-code-post rounded-2 font-12 p-2 ms-1 mb-1">코드+택배발송</span><?}?>
															<?if($value['is_promotion']=="Y"){?><span class="badge badge-outline-danger rounded-2 font-12 p-2 ms-1 mb-1">프로모션</span><?}?>
															<?if($value['is_preorder']=="Y"){?><span class="badge rounded-2 badge-outline-warning font-12 p-2 ms-1 mb-1">예약구매</span><?}?>
															<?if($value['is_bonus']=="Y"){?><span class="badge rounded-2 badge-outline-info font-12 p-2 ms-1 mb-1">특전</span><?}?>
														</div>
													</div>
													<div class="d-flex flex-row">
														<div class="d-flex flex-row align-items-end col-6 flex-wrap">
															<?if($value['spoken_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500 me-1 mb-1">음성 한국어</span><?}?>
															<?if($value['interface_korean']=="Y"){?><span class="badge rounded-2 bg-light font-12 fw-500 me-1 mb-1">인터페이스/자막 한글</span><?}?>
															<?if($value['exclusive_korean']=="Y"){?><span class="badge rounded-2 bg-secondary font-12 fw-500 me-1 mb-1">독점 한국어</span><?}?>
														</div>

														<div class="d-flex flex-row justify-content-end col-6 align-items-end">
															<? if($value['discount']>0){?><span class="rounded-2 <?=$value['promotion_label']?> font-14 fw-bold px-3 py-1 num text-nowrap">-<?=$value['discount']?>%</span><?}?>
															<div class="text-end mb-0 text-nowrap ms-2">
															<? if($value['discount']>0){?>
																<s class="num pe-1 font-11 text-secondary won"> <?=number_format($value['consumer_price'])?></s>
															<?}?>
																<span class="num font-14 fw-bold text-white won"> <?=number_format($value['price'])?></span>
															</div>
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
							</div>
						</article>
					</div>
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
		
		<section id="platform" class="mb-2">
			<div class="container">
				<h2 class="fw-bold">플랫폼 이용안내</h2>
				<div class="row g-3">
					<div class="col-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 bg-card text-secondary border-0">다이렉트 게임즈</div>
							<div class="card-body p-0"><a href="/service/guide.html" title="다이렉트 게임즈 이용안내"><img src="/assets/images/common/platform_dg_v2.png"></a></div>
						</div>
					</div>
					<div class="col-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 bg-card text-secondary border-0">스팀</div>
							<div class="card-body p-0"><a href="/service/guide_steam.html" title="스팀 게임즈 이용안내"><img src="/assets/images/common/platform_steam.png"></a></div>
						</div>
					</div>
					<div class="col-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 bg-card text-secondary border-0">에픽 게임즈</div>
							<div class="card-body p-0"><a href="/service/guide_epic.html" title="에픽 게임즈 이용안내"><img src="/assets/images/common/platform_epic.png"></a></div>
						</div>
					</div>
					<div class="col-3">
						<div class="card rounded-0 card-shadow border-0">
							<div class="card-header font-14 ps-2 bg-card text-secondary border-0">락스타 게임즈</div>
							<div class="card-body p-0"><a href="/service/guide_rockstar.html" title="락스타 게임즈 이용안내"><img src="/assets/images/common/platform_rockstar.png"></a></div>
						</div>
					</div>
				</div>
				<div class="b-example-divider"></div>
			</div>
		</section>
	</main>
	
	<? include_once($_SERVER['DOCUMENT_ROOT'].'/inc/footer.html');?>
</div>
<!-- end of wrapper -->

<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" crossorigin="anonymous"></script>

<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"></script>
<!--
<script src="/assets/js/vendor/splide.min.js"></script>
<script src="/assets/js/vendor/splide-extension-grid.min.js"></script>
-->
<script src="/assets/js/vendor/jquery.ticker.js?2"></script>

<script src="/assets/js/main.js"></script>

<script>

const topBtn = document.getElementById("topBtn");
window.addEventListener("scroll", () => {
	if (window.scrollY > 200) {
		topBtn.classList.add("show");
	} else {
		topBtn.classList.remove("show");
	}
});

topBtn.addEventListener("click", () => {
	window.scrollTo({ top: 0, behavior: "smooth" });
});

$(document).ready(function(){
	$(".btn_cart").bind("click",function(){
		var index = $(".btn_cart").index(this);
		var goods_code = $(".btn_cart").eq(index).attr("data-goodscode");
		var prod_tp = $(".btn_cart").eq(index).attr("data-prodtp");

		$.ajax({
			'url': '/order/cart_proc.php',
			'type': 'POST',
			'dataType': 'json',
			'data':{mode:"add_cart",goods_code:goods_code,prod_tp:prod_tp},
			'success': function (data) {
				if(data.error_code=="0"){
					$("#cart-modal #cart-modal-msg").html(data.error_msg);
					$("#cart-modal").modal("show");
				}else{
					alert(data.error_msg);
				}
			},
			'error':function(data){
				alert(data);
			}
		});
	});
	
	$("#cart-modal #btn_model_close").bind("click",function(){
		$("#cart-modal").modal("hide");
	});

	$("#cart-modal #btn_cart_move").bind("click",function(){
		location.href="/order/cart.html";
	});
});

document.addEventListener( 'DOMContentLoaded', function () {

	var main_banner = new Splide( '#splide', {
		type   : 'loop',
		padding: '15%',
		autoWidth: true,
		focus    : 'center',
		arrows:true,
		arrowPath: 'M33.1875 26.1313L15.7719 42.725C15.4813 43.002 15.0952 43.1566 14.6937 43.1566C14.2923 43.1566 13.9062 43.002 13.6156 42.725L13.5969 42.7063C13.4555 42.572 13.3429 42.4103 13.266 42.2312C13.1891 42.052 13.1494 41.859 13.1494 41.6641C13.1494 41.4691 13.1891 41.2762 13.266 41.097C13.3429 40.9178 13.4555 40.7562 13.5969 40.6219L29.9969 24.9969L13.5969 9.37813C13.4555 9.24384 13.3429 9.0822 13.266 8.90303C13.1891 8.72387 13.1494 8.53092 13.1494 8.33595C13.1494 8.14096 13.1891 7.94802 13.266 7.76886C13.3429 7.58969 13.4555 7.42805 13.5969 7.29376L13.6156 7.27501C13.9062 6.99799 14.2923 6.84346 14.6937 6.84346C15.0952 6.84346 15.4813 6.99799 15.7719 7.27501L33.1875 23.8688C33.3407 24.0147 33.4626 24.1902 33.5459 24.3847C33.6292 24.5791 33.6722 24.7885 33.6722 25C33.6722 25.2116 33.6292 25.4209 33.5459 25.6154C33.4626 25.8098 33.3407 25.9853 33.1875 26.1313Z',
		classes:{
			pagination: 'splide__pagination splide-button',
			page      : 'splide__pagination__page splide-button'
		},
		autoplay: true,
		interval: 4000
	} );

	main_banner.mount();
	
	/*
	$('#js-news').ticker({
		titleText: '공지사항',
		controls:false,
		displayType: 'fade',
		pauseOnItems: 5000,
		fadeInSpeed: 600,      // Speed of fade in animation
		fadeOutSpeed: 300      // Speed of fade out animation
	});
	*/


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
		height: '56px' ,
		focus: 'center',
		pagination: false,
		autoplay: true,
		interval: 3000, 
	});

	notice.mount();
});

$('#promotion_banner').on('click', '.carousel-item', function (event) {
	var index = $("#promotion_banner .carousel-item").index(this);
	var banner_link = $("#promotion_banner .carousel-item img").eq(index).attr("data-link");
	location.href= banner_link;
	
});
</script>
<script>
$(document).ready(function(){

});
</script>
</body>
</html>