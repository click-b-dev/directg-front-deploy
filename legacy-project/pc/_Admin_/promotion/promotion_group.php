<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['promotion'] = "active";

$page_title="할인 프로모션 그룹 설정";


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$admin_goods= new AdminGoods($conn); 
	$admin_promotion= new AdminPromotion($conn); 
	
	$promotion_group_list = $admin_promotion->getPromotionGroupList();
	
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">할인 프로모션 그룹 관리</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<?
						$group_num = "1";
						foreach($promotion_group_list as $promotion_group){
							$promotion_item_data = $admin_promotion->getPromotionGroupSchedule($promotion_group['publisher_code'],$promotion_group['promotion_start'],$promotion_group['promotion_end']);
					?>
					<div class="row mb-3">
						<div class="col-12">
							<div class="lead border p-2 bg-white">
								<h5 class="mt-0"><?=$admin_goods->getPublisherName($promotion_group['publisher_code'])?> 할인 프로모션</h5>
								<p class="font-12 text-dark fw-normal mb-0">개발사/퍼블리셔의 사정에 따라 프로모션 기간 및 할인율이 변경될 수 있으며, 프로모션 상품은 한정 수량으로 재고 소진 시 조기 종료될 수 있습니다.</p>
								<small class="fw-normal">(<?=$promotion_group['promotion_start']?> ~ <?=$promotion_group['promotion_end']?>)</small>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-12">
							<div class="row row-cols-1 row-cols-md-6 g-2">
								<?
									foreach($promotion_item_data as $promotion_item){
								?>
								<div class="col">
									<div class="card shadow-none border">
										<img src="/upload/product/<?=$promotion_item['product_code']?>/header/header.jpg" class="card-img-top" alt="Card image cap">
										<div class="card-body p-1">
											<h5 class="card-title font-14 lh-base fw-normal" style="min-height:50px"><?=$promotion_item['product_name']?></h5>
											<div class="d-flex justify-content-between">
												<span class="badge bg-danger font-14 fw-bold px-2"><?=$promotion_item['discount_rate']?> %</span>
												<div>
													<s class="font-12"><?=number_format($promotion_item['consumer_price'])?> 원</s>
													<span class="font-14 fw-bold"><?=number_format($promotion_item['sale_price'])?> 원</span>
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
					</div> 
					<?
							$group_num++;
						}
					?>
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){

});
</script>
</body>
</html>
