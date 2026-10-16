<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 0 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['promotion'] = "active";

$page_title="주말특가 프로모션 목록";

/*
9월 2주	2025-09-12 오후 4:00:00	2025-09-15 오후 4:00:00
9월 3주	2025-09-19 오후 4:00:00	2025-09-22 오후 4:00:00
9월 4주	2025-09-26 오후 4:00:00	2025-09-29 오후 4:00:00
10월 3주	2025-10-17 오후 4:00:00	2025-10-20 오후 4:00:00
10월 4주	2025-10-24 오후 4:00:00	2025-10-27 오후 4:00:00
*/

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

	$orderby = "promotion_week_start desc,promotion_week_end desc";

	$admin_promotion= new AdminPromotion($conn);
	$adminGoods= new AdminGoods($conn);

	$promotion_week = $admin_promotion->getPromotionWeekend($page,$add_where,$orderby,$param);

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">주말특가 프로모션 관리</a></li>
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
							<h5 class="card-header bg-secondary text-white">주말 프로모션 검색필터</h5>
							<div class="card-body">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row">
										<div class="col-lg-6 mb-2">
											<div class="input-group row">
												<select class="form-select col-sm-3" name="search_key" id="search_key">
													<option value="search_name" <?=$selected['search_key']['search_name']?>>주말 프로모션 이름</option>
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
					
					<div class="mb-2"><? echo number_format($promotion_week->total_results)?> 개</div>

					<div class="row">
						<div class="col-12">
							
							<div class="table-responsive">
								<table class="table table-centered dt-responsive nowrap table-sm table-bordered" id="">
									<thead class="table-light">
										<tr>
											<th class="text-center">번호</th>
											<th class="text-center">주말특가 프로모션 이름</th>
											<th class="text-center">주말특가 프로모션 기간</th>
											<th class="text-center">주말특가 추천게임</th>
											<th class="text-center">주말특가 인기게임</th>
											<th class="text-center">노출여부</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody class="font-12 bg-white">
									<?
										if($promotion_week->success == true){
											$result = $promotion_week->resultset->fetchAll();
											
											$num = 0;

											foreach($result as $value){
												$promotion_recommand_goods = explode("|",$value['promotion_week_recommand']);
												$promotion_best_goods = explode("|",$value['promotion_week_best']);
									?>
										<tr>
											<td class="text-center"><?=$promotion_week->total_results-(($page-1)*10)-$num?></td>
											<td class="text-center"><a href="promotion_weekend_view.php?idx=<?=$value['idx']?>"><?=$value['promotion_week_name']?></a></td>
											<td class="text-center"><?=date('Y-m-d H:i:s',$value['promotion_week_start'])?> ~ <?=date('Y-m-d H:i:s',$value['promotion_week_end'])?></td>
											<td class="text-center align-top">
												<div class="d-flex flex-column align-items-stretch justify-content-start align-content-start">
													<ol class="list-group list-group-numbered">
													<?
														foreach($promotion_recommand_goods as $recommand_goods){
															$goods_option_info = $adminGoods->getGoodsOptionSearch($recommand_goods);
															echo "<li class='list-group-item text-start'>".$goods_option_info['product_code']." / ".$goods_option_info['product_name']." / ".$goods_option_info['game_type']."</li>";
														}
													?>
													</ol>
												</div>
											</td>
											<td class="text-center">
												<ol class="list-group list-group-numbered">
												<?
													foreach($promotion_best_goods as $best_goods){
														$goods_option_info = $adminGoods->getGoodsOptionSearch($best_goods);
														echo "<li class='list-group-item text-start'>".$goods_option_info['product_code']." / ".$goods_option_info['product_name']." / ".$goods_option_info['game_type']."</li>";
													}
												?>
													</ol>
											</td>
											<td class="text-center"><?=$value['is_view']?></td>
											<td class="text-center"><a href="promotion_weekend_register.php?mode=modify&idx=<?=$value['idx']?>" class="action-icon text-secondary font-14"> <i class="mdi mdi-square-edit-outline font-16"></i> 수정</a></td>
										</tr>
									<?
												$num++;
											}
										}
									?>
									<?if($promotion_week->total_results=="0"){?>
									<tr>
										<td colspan="7"  class="text-center py-3 font-14">등록된 주말 프로모션이 없습니다.</td>
									</tr>
									<?}?>
									</tbody>
								</table>
							</div>

							<div class="text-center mt-3"><?echo $promotion_week->links_html;?></div>

						</div> <!-- end col -->
					</div>
					<!-- end row --> 

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
