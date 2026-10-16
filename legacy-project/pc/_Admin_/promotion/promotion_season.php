<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 0 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['promotion'] = "active";

$page_title="대규모 프로모션 목록";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);
$search_confirm = filter_input(INPUT_GET, 'search_confirm', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " promotion_week_name like '%".$search_value."%' ";
		break;
	}
}

if($search_confirm){
	$where[] = " is_view ='".$search_confirm."'";
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	//$conn -> exec("set names utf8");

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "promotion_season_start desc,promotion_season_end desc";

	$admin_promotion= new AdminPromotion($conn);
	$adminGoods= new AdminGoods($conn);

	$promotion_season = $admin_promotion->getPromotionSeason($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_key'][$search_key] = "selected";
$checked['search_confirm'][$search_confirm] = "checked";

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">대규모 프로모션 관리</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 
					
					<div class="row g-2">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">대규모 프로모션 검색필터</h5>
							<div class="card-body">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row">
										<div class="col-lg-6 mb-2">
											<div class="input-group row">
												<select class="form-select col-sm-3" name="search_key" id="search_key">
													<option value="search_name" <?=$selected['search_key']['search_name']?>>대규모 프로모션 이름</option>
												</select>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
												</div>
											</div>
										</div>
									</div>

									<div class="row">
										<div class="col-lg-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					
					<div class="mb-2"><? echo number_format($promotion_season->total_results)?> 개</div>

					<div class="row">
						<div class="col-12">
							<?
								if($promotion_season->success == true){
									$result = $promotion_season->resultset->fetchAll();
									
									$num = 0;

									foreach($result as $value){
										$promotion_recommand_goods = explode("|",$value['promotion_season_recommand']);
										$promotion_best_goods = explode("|",$value['promotion_season_best']);
										$promotion_max_discount = explode("|",$value['promotion_max_discount']);
										$promotion_price_5000 = explode("|",$value['promotion_price_5000']);
										$promotion_price_10000 = explode("|",$value['promotion_price_10000']);
										$promotion_add_repay = explode("|",$value['promotion_add_repay']);
							?>
							<div class="card mb-4">
								<div class="card-header p-2">
									<div class="float-start">
										<span class="font-16 fw-bold"><a href="promotion_season_view.php?idx=<?=$value['idx']?>"><?=$value['promotion_season_name']?></a></span>
										<span class="ps-2">프로모션 기간</span>: <?=date('Y-m-d H:i:s',$value['promotion_season_start'])?> ~ <?=date('Y-m-d H:i:s',$value['promotion_season_end'])?>
										<span class="badge bg-secondary font-14"><?=($value['is_view']=="Y")?"노출함":"노출안함"?></span>
									</div>
									<div class="float-end">
										<a href="promotion_season_register.php?mode=modify&idx=<?=$value['idx']?>" class="action-icon text-secondary"> <i class="mdi mdi-square-edit-outline font-16"></i> 프로모션 수정</a>
									</div>
								</div>
								<?php if ($value['notice_view'] == "Y") { ?>
								<div class="card-header p-2">
									<div class="float-start">
										프로모션 공지 >> <span class="font-16 fw-bold"><?=$value['notice_title']?></span>
										<a href="<?=$value['notice_btn_url']?>" target="_blank" class="btn-sm btn-primary ms-2">
											<?=$value['notice_btn_title']?>
										</a>
									</div>
								</div>
								<?php } ?>
								<div class="card-body p-0">
									<div class="card mb-0 rounded-0">
										<div class="row g-0">
											<div class="col-md-3">
												<div class="card p-2 mb-0">
													<div class="card-header text-center bg-light fw-bold border">PC버전 배너</div>
													<img src="<?=$value['promotion_season_banner_pc']?>" class="img-fluid">
												</div>
												<div class="card p-2 mb-0">
													<div class="card-header text-center bg-light fw-bold border">모바일버전 배너</div>
													<img src="<?=$value['promotion_season_banner_mobile']?>" class="img-fluid">
												</div>
											</div>
											<div class="col-md-3">
												<div class="card p-2 mb-0">
													<div class="card-header text-center bg-light fw-bold border">추천 및 특집</div>
													<img src="<?=$value['promotion_season_recommand_banner']?>" class="img-fluid">
													<div class="d-flex flex-column justify-content-start mb-2">
														<?
															foreach($promotion_recommand_goods as $recommand_goods){
																$goods_option_info = $adminGoods->getGoodsOptionSearch($recommand_goods);
																echo "<div class='p-1 border-start border-bottom border-end font-12'>".$goods_option_info['product_code']." <br/> ".$goods_option_info['product_name']." </div>";
															}
														?>
													</div>
												</div>
											</div>
											<div class="col-md-6">
												<div class="row g-1 my-1 mx-1">
													<div class="col-md-4">
														<div class="">
															<div class="d-flex align-items-start align-content-start justify-content-start">
																<div class="align-middle align-self-center flex-fill mb-auto bg-light text-center fw-bold py-2 border">대규모 역대 최대할인</div>
															</div>
															<div class="d-flex flex-column justify-content-start">
																<?
																	foreach($promotion_max_discount as $max_discount){
																		$goods_option_info = $adminGoods->getGoodsOptionSearch($max_discount);
																		echo "<div class='p-1 border-start border-bottom border-end font-12'>".$goods_option_info['product_code']." <br/> ".$goods_option_info['product_name']." </div>";
																	}
																?>
															</div>
														</div>
														<div class="my-1">
															<div class="d-flex align-items-start align-content-start justify-content-start">
																<div class="align-middle align-self-center flex-fill mb-auto bg-light text-center fw-bold py-2 border">추가 포인트 적립</div>
															</div>
															<div class="d-flex flex-column justify-content-start">
																<?
																	foreach($promotion_add_repay as $add_repay){
																		$goods_option_info = $adminGoods->getGoodsOptionSearch($add_repay);
																		echo "<div class='p-1 border-start border-bottom border-end font-12'>".$goods_option_info['product_code']." <br/> ".$goods_option_info['product_name']." </div>";
																	}
																?>
															</div>
														</div>
													</div>
													<div class="col-md-4">
														<div class="d-flex align-items-start align-content-start justify-content-start">
															<div class="align-middle align-self-center flex-fill mb-auto bg-light text-center fw-bold py-2 border">대규모 인기게임</div>
														</div>
														<div class="d-flex flex-column justify-content-start">
															<?
																foreach($promotion_best_goods as $best_goods){
																	$goods_option_info = $adminGoods->getGoodsOptionSearch($best_goods);
																	echo "<div class='p-1 border-start border-bottom border-end font-12'>".$goods_option_info['product_code']." <br/> ".$goods_option_info['product_name']." </div>";
																}
															?>
														</div>
													</div>
													<div class="col-md-4">
														<div class="d-flex align-items-start align-content-start justify-content-start">
															<div class="align-middle align-self-center flex-fill mb-auto bg-light text-center fw-bold py-2 border">대규모 5천원 미만</div>
														</div>
														<div class="d-flex flex-column justify-content-start mb-2">
															<?
																foreach($promotion_price_5000 as $price_5000){
																	$goods_option_info = $adminGoods->getGoodsOptionSearch($price_5000);
																	echo "<div class='p-1 border-start border-bottom border-end font-12'>".$goods_option_info['product_code']." <br/> ".$goods_option_info['product_name']." </div>";
																}
															?>
														</div>

														<div class="d-flex align-items-start align-content-start justify-content-start">
															<div class="align-middle align-self-center flex-fill mb-auto bg-light text-center fw-bold py-2 border">대규모 1만원 미만</div>
														</div>
														<div class="d-flex flex-column justify-content-start">
															<?
																foreach($promotion_price_10000 as $price_10000){
																	$goods_option_info = $adminGoods->getGoodsOptionSearch($price_10000);
																	echo "<div class='p-1 border-start border-bottom border-end font-12'>".$goods_option_info['product_code']." <br/> ".$goods_option_info['product_name']." </div>";
																}
															?>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						<?
									$num++;
								}
							}
						?>
							<div class="text-center mt-3"><?echo $promotion_season->links_html;?></div>

						</div>
					</div>
					<!-- end row --> 

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
