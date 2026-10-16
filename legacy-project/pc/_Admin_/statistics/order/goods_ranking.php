<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['statistics'] = "active";
$page_title="누적판매순위";



$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);
$search_game_type = filter_input(INPUT_GET, 'search_game_type', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);


if($search_year){
	$add_where = " and date_format(a.ord_ymd,'%Y')='".$search_year."'";
}

$selected['search_publisher'][$search_publisher] = "selected";
$selected['search_year'][$search_year] = "selected";
$checked['search_game_type'][$search_game_type] = "checked";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 

	$publisher_data= $admin->getPublisherAllList('all');
	
	if($search_game_type){
		if($search_publisher){
			$query = "select a.product_code,b.product_name,COALESCE(a.supplier_code,b.supplier_code)as supplier_code,b.product_platform,b.release_date,b.game_type,b.start_date,b.end_date,b.status,a.is_preorder ,a.is_promotion,b.preorder_start,b.preorder_end,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where b.status<>'9' and COALESCE(a.supplier_code,b.supplier_code)=:publisher_code and b.game_type=:game_type ".$add_where." group by a.product_code,a.is_preorder,a.is_promotion order by a.product_code asc,a.is_preorder asc,a.is_promotion asc";
			$stmt = $conn->prepare($query);
			$params = array(
				':publisher_code'=>$search_publisher,
				':game_type'=>$search_game_type,
			);
			$stmt->execute($params);
			$goods_list = $stmt->fetchAll();
		}else{
			$query = "select a.product_code,b.product_name,COALESCE(a.supplier_code,b.supplier_code)as supplier_code,b.product_platform,b.release_date,b.game_type,b.start_date,b.end_date,b.status,a.is_preorder ,a.is_promotion,b.preorder_start,b.preorder_end,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where b.status<>'9' and b.game_type=:game_type ".$add_where." group by a.product_code,a.is_preorder,a.is_promotion order by a.product_code asc,a.is_preorder asc,a.is_promotion asc";
			$stmt = $conn->prepare($query);
			$params = array(
				':game_type'=>$search_game_type,
			);
			$stmt->execute($params);
			$goods_list = $stmt->fetchAll();
		}
		
	}else{
		if($search_publisher){
			$query = "select a.product_code,b.product_name,COALESCE(a.supplier_code,b.supplier_code)as supplier_code,b.product_platform,b.release_date,b.game_type,b.start_date,b.end_date,b.status,a.is_preorder ,a.is_promotion,b.preorder_start,b.preorder_end,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where b.status<>'9' and COALESCE(a.supplier_code,b.supplier_code)=:publisher_code ".$add_where." group by a.product_code,a.is_preorder,a.is_promotion order by a.product_code asc,a.is_preorder asc,a.is_promotion asc";
			$stmt = $conn->prepare($query);
			$params = array(
				':publisher_code'=>$search_publisher
			);
			$stmt->execute($params);
			$goods_list = $stmt->fetchAll();
		}else{
			$query = "select a.product_code,b.product_name,COALESCE(a.supplier_code,b.supplier_code)as supplier_code,b.product_platform,b.release_date,b.game_type,b.start_date,b.end_date,b.status,a.is_preorder ,a.is_promotion,b.preorder_start,b.preorder_end,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where b.status<>'9' and b.game_type<>'randombox' ".$add_where." group by a.product_code,a.is_preorder,a.is_promotion order by a.product_code asc,a.is_preorder asc,a.is_promotion asc";
			$stmt = $conn->prepare($query);
			$stmt->execute();
			$goods_list = $stmt->fetchAll();
		}
	}
	
	$preorder_total_count = array();
	$preorder_total_price = array();
	$promotion_total_count = array();
	$promotion_total_price = array();
	$normal_total_count = array();
	$normal_total_price = array();

	$sales_data = array();
	foreach($goods_list as $sub_value){
		if($sub_value['is_preorder']=="Y"){
			$goods_array[$sub_value['product_code']]['preorder']['total_count']=$sub_value['total_count'];
			$goods_array[$sub_value['product_code']]['preorder']['total_price']=$sub_value['total_price'];
			$preorder_total_count[$sub_value['product_code']]+=$sub_value['total_count'];
			$preorder_total_price[$sub_value['product_code']]+=$sub_value['total_price'];
		}else{
			if($sub_value['is_promotion']=="Y"){
				$goods_array[$sub_value['product_code']]['promotion']['total_count']=$sub_value['total_count'];
				$goods_array[$sub_value['product_code']]['promotion']['total_price']=$sub_value['total_price'];
				$promotion_total_count[$sub_value['product_code']]+=$sub_value['total_count'];
				$promotion_total_price[$sub_value['product_code']]+=$sub_value['total_price'];
			}else{
				$goods_array[$sub_value['product_code']]['normal']['total_count']=$sub_value['total_count'];
				$goods_array[$sub_value['product_code']]['normal']['total_price']=$sub_value['total_price'];
				$normal_total_count[$sub_value['product_code']]+=$sub_value['total_count'];
				$normal_total_price[$sub_value['product_code']]+=$sub_value['total_price'];
			}
			
		}

		$goods_array[$sub_value['product_code']]['total_count']+=$sub_value['total_count'];
		$goods_array[$sub_value['product_code']]['total_price']+=$sub_value['total_price'];
	}

	foreach($goods_list as $value){
		$goods_array[$value['product_code']]['product_code']=$value['product_code'];
		$goods_array[$value['product_code']]['product_name']=$value['product_name'];
		$goods_array[$value['product_code']]['game_type']=$value['game_type'];
		$goods_array[$value['product_code']]['release_date']=$value['release_date'];
		$goods_array[$value['product_code']]['status']=$value['status'];
		$goods_array[$value['product_code']]['product_platform']=$value['product_platform'];
		$goods_array[$value['product_code']]['product_srp']=$value['product_srp'];
		$goods_array[$value['product_code']]['price']=$value['price'];
		$goods_array[$value['product_code']]['start_date']=$value['start_date'];
		$goods_array[$value['product_code']]['end_date']=$value['end_date'];
		$goods_array[$value['product_code']]['preorder_start']=$value['preorder_start'];
		$goods_array[$value['product_code']]['preorder_end']=$value['preorder_end'];
		$goods_array[$value['product_code']]['supplier_code']=$value['supplier_code'];
		$goods_array[$value['product_code']]['publisher_code']=$value['publisher_code'];

		//$goods_array[$value['product_code']]['promotion']['unit_price'] = $sales_data[$value['product_code']]['promotion']['unit_price'];
		//$goods_array[$value['product_code']]['normal']['unit_price'] = $sales_data[$value['product_code']]['normal']['unit_price'];

	}

	


	//print_r($goods_array);
	//exit;

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$result1 = arr_sort($goods_array,'total_count','desc');


//print_r($result1);
//exit;

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문분석</a></li>
										<li class="breadcrumb-item active">누적판매순위</li>
									</ol>
								</div>
								<h4 class="page-title">누적판매순위</h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body">
									<form class="form-horizontal" action="<?=$_SERVER["PHP_SELF"]?>" method="get">
										<div class="row mb-2">
											<div class="col-lg-2">
												<div class="row">
													<label for="search_year" class="col-sm-3 col-form-label bg-light border">연도</label>
													<div class="col-sm-9">
														<select class="form-select" id="search_year" name="search_year">
															<option value="">:::년도:::</option>
															<?
																for($i=2013;$i<=date('Y');$i++){
															?>
															<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
															<?
																}
															?>
														</select>
													</div>
												</div>
											</div>
											<div class="col-lg-3">
												<div class="row">
													<label for="search_publisher" class="col-sm-3 col-form-label bg-light border">공급처</label>
													<div class="col-sm-9">
														<select id="search_publisher" name="search_publisher" class="form-select">
															<option value="">:::선택:::</option>
															<?
																foreach($publisher_data as $value){
															?>
															<option value="<?=$value['publisher_code']?>" <?=$selected['search_publisher'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
															<?
																}
															?>
														</select>
													</div>
												</div>
											</div>
											<div class="col-lg-7">
												<div class="row">
													<label for="search_game_type" class="col-sm-2 col-form-label col-form-label-sm bg-light border">옵션상품유형</label>
													<div class="col-sm-10 pt-1">
														<div class="form-check form-check-inline">
															<input type="radio" id="search_game_type_game" name="search_game_type" class="form-check-input" value="game" <?=$checked['search_game_type']['game']?>>
															<label class="form-check-label" for="search_game_type_game">Game</label>
														</div>
														<div class="form-check form-check-inline">
															<input type="radio" id="search_game_type_dlc" name="search_game_type" class="form-check-input" value="dlc" <?=$checked['search_game_type']['dlc']?>>
															<label class="form-check-label" for="search_game_type_dlc">DLC</label>
														</div>
														<div class="form-check form-check-inline">
															<input type="radio" id="search_game_type_music" name="search_game_type" class="form-check-input" value="music" <?=$checked['search_game_type']['music']?>>
															<label class="form-check-label" for="search_game_type_music">Music</label>
														</div>
														<div class="form-check form-check-inline">
															<input type="radio" id="search_game_type_bundle" name="search_game_type" class="form-check-input" value="bundle" <?=$checked['search_game_type']['bundle']?>>
															<label class="form-check-label" for="search_game_type_bundle">Bundle</label>
														</div>
														<div class="form-check form-check-inline">
															<input type="radio" id="search_game_type_randombox" name="search_game_type" class="form-check-input" value="randombox" <?=$checked['search_game_type']['randombox']?>>
															<label class="form-check-label" for="search_game_type_randombox">랜덤박스</label>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="row mb-2">
											<div class="col-lg-12">
												<div class="float-end">
													<button type="submit" class="btn btn-primary shadow-none">상품옵션 검색</button>
												</div>
											</div>
										</div>
									</form>

									<div class="table-responsive">
										<table class="table table-bordered table-centered w-100 table-sm">
											<thead class="table-dark font-13">
											<tr>
												<th class="text-center" rowspan="2">순위</th>
												<th class="text-center" rowspan="2">상품코드</th>
												<th class="text-center" rowspan="2">상품명</th>
												<th class="text-center" rowspan="2">판매시작일<br/>(예약판매시작일)</th>
												<th class="text-center" rowspan="2">판매종료일<br/>(예약판매종료일)</th>
												<th class="text-center" rowspan="2">판매기간</th>
												<th class="text-center" colspan="2">예약판매</th>
												<th class="text-center" colspan="2">일반판매</th>
												<th class="text-center" colspan="2">할인 프로모션</th>
												<th class="text-center" colspan="2">합계</th>
												<th class="text-center" rowspan="2">일평균</th>
												<th class="text-center" rowspan="2">프로모션<br/>의존율(%)</th>
											</tr>
											<tr>
												<th class="text-center">수량</th>
												<th class="text-center">금액</th>
												<th class="text-center">수량</th>
												<th class="text-center">금액</th>
												<th class="text-center">수량</th>
												<th class="text-center">금액</th>
												<th class="text-center">수량</th>
												<th class="text-center">금액</th>
											</tr>
											</thead>
											<tbody class="font-12">
											<?
												$ranking = 1;
												foreach($result1 as $key=>$value){
													$day_diff=0;
													if($value['product_code'] && $ranking<=100){
											?>
											<tr>
												<td class="text-center"><?=$ranking++?></td>
												<td class="text-center"><?=$value['product_code']?></td>
												<td class="">
													<?=$value['product_name']?><br/>
													<div class="badge bg-secondary fw-normal mb-2"><?=$admin->getProductPlatform($value['product_platform'])?></div>
													<div class="badge bg-primary fw-normal mb-2"><?=$value['game_type']?></div>
													<div class="badge bg-info fw-normal mb-2"><?=substr($value['release_date'],0,10)?></div>
													<div class="badge bg-secondary fw-normal mb-2"><?=$adminGoods->getPublisherName($value['supplier_code'])?></div>
													<?=$admin->getProductStatus($value['status'])?>
												</td>
												<td class="text-center">
													<span class="num"><?=($value['start_date']>0)?date('Y-m-d',$value['start_date']):''?></span><br/>
													<?if($value['preorder_start']>0){?>(<span class="num"><?=($value['preorder_start']>0)?date('Y-m-d',$value['preorder_start']):''?></span>)<?}?>
												</td>
												<td class="text-center">
													<?if($value['end_date']<time()){?><span class="num"><?=($value['end_date']>0)?date('Y-m-d',$value['end_date']):''?></span><?}?><br/>
													<?if($value['preorder_end']>0){?>(<span class="num"><?=($value['preorder_end']>0)?date('Y-m-d',$value['preorder_end']):''?></span>)<?}?>
												</td>
												<td class="text-end num">
													<?
														if($search_year){ //검색년도
															$tmp_start_date = $search_year."-01-01";
															$tmp_end_date= $search_year."-12-31";

															if($value['status']=="0"){//판매중
																if($value['start_date']>strtotime($tmp_start_date)){
																	$day_diff = floor((time()-$value['start_date'])/86400);
																}else{
																	$day_diff = floor((time()-strtotime($tmp_start_date))/86400);
																}
																
																$a=1;
															}else{//판매종료
																$day_diff = floor(($value['end_date']-strtotime($tmp_start_date))/86400);
																$a=2;
															}
														}else{//누적
															if($value['status']=="0"){//판매중
																$day_diff = floor((time()-$value['start_date'])/86400);
																$a=3;
															}else{//판매종료
																if($value['end_date']>0){
																	$day_diff = floor(($value['end_date']-$value['start_date'])/86400);
																	$a=4;
																}else{
																	$day_diff = floor((time()-$value['start_date'])/86400);
																	$a=5;
																}
															}
														}
														
														echo number_format($day_diff)."일";

													//echo $a;
													?>
												</td>
												<td class="text-end"><span class="num"><?=number_format($preorder_total_count[$value['product_code']])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($preorder_total_price[$value['product_code']])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($normal_total_count[$value['product_code']])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($normal_total_price[$value['product_code']])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($promotion_total_count[$value['product_code']])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($promotion_total_price[$value['product_code']])?></span></td>
												<td class="text-end table-active"><span class="num"><?=number_format($value['total_count'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['total_price'])?></span></td>
												<td class="text-end">
													<?
														if($day_diff==0){
															
														}else{
															echo round($value['total_count']/$day_diff,2)."<br/>";
														}
														
														//echo $day_diff;
													?>
												</td>
												<td class="text-end">
												<?if($promotion_total_count[$value['product_code']]>0){?>
													<span class="num">
													<?=round($promotion_total_count[$value['product_code']]*100/($preorder_total_count[$value['product_code']]+$normal_total_count[$value['product_code']]+$promotion_total_count[$value['product_code']]),2)?> %</span>
													<?}?></td>
											</tr>
											<?
														$pre_total_count+=$preorder_total_count[$value['product_code']];
														$pre_total_price+=$preorder_total_price[$value['product_code']];
														$n_total_count+=$normal_total_count[$value['product_code']];
														$n_total_price+=$normal_total_price[$value['product_code']];
														$p_total_count+=$promotion_total_count[$value['product_code']];
														$p_total_price+=$promotion_total_price[$value['product_code']];
														$total_count+=$value['total_count'];
														$total_price+=$value['total_price'];
													}
												}
											?>
											</tbody>
											<tfoot class="table-dark">
											<tr>
												<th class="text-center" colspan="6">합계</th>
												<td class="text-end"><?=number_format($pre_total_count)?><br/>(<?=round($pre_total_count*100/$total_count,2)?>%)</td>
												<td class="text-end"><?=number_format($pre_total_price)?><br/>(<?=round($pre_total_price*100/$total_price,2)?>%)</td>
												<td class="text-end"><?=number_format($n_total_count)?><br/>(<?=round($n_total_count*100/$total_count,2)?>%)</td>
												<td class="text-end"><?=number_format($n_total_price)?><br/>(<?=round($n_total_price*100/$total_price,2)?>%)</td>
												<td class="text-end"><?=number_format($p_total_count)?><br/>(<?=round($p_total_count*100/$total_count,2)?>%)</td>
												<td class="text-end"><?=number_format($p_total_price)?><br/>(<?=round($p_total_price*100/$total_price,2)?>%)</td>
												<td class="text-end"><?=number_format($total_count)?></td>
												<td class="text-end"><?=number_format($total_price)?></td>
												<td></td>
												<td></td>
											</tr>
											</tfoot>
										</table>
									</div>
								</div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
