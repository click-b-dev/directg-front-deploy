<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$page_title="대표상품별 주문현황";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

if($search_year==""){
	$search_year = date('Y');
}

if($search_month==""){
	//$search_month =date('m');
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";

if(!$page){
	$page=1;
}

$where = [];


if(isset($search_year) && $search_year<>""){
	//$where[] = "date_format(t3.ord_ymd,'%Y') ='".$search_year."'";
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 
	
	/*
	$title_info = $adminGoods->getTitleListAll();
	
	foreach($title_info as $value){
		$title_list[$value['title_id']]['title_id'] =$value['title_id'] ;
		$title_list[$value['title_id']]['title_name'] =$value['title_name'] ;
		$title_list[$value['title_id']]['sales_price'] = 0;
		$title_list[$value['title_id']]['sales_count'] = 0;
	}
	*/
	
	//print_r($title_list);
	
	//$start_date = "2025-06-01";
	//$end_date = "2025-06-30";
	if($search_year==""){
		$search_year = date("Y");
		$start_date = $search_year."-01-01";
	}
	
	if($search_year==""){
		$search_year = date("Y");
		$start_date = $search_year."-01-01";
		$last_day = date("t", mktime(0, 0, 1, $search_month, 1, $search_year));
		$end_date = $search_year."-".$search_month."-".$last_day;
	}else{
		if($search_month==""){
			$start_date = $search_year."-01-01";
			$last_day = date("t", mktime(0, 0, 1, 12, 1, $search_year));
			$end_date = $search_year."-12-".$last_day;
		}else{
			$start_date = $search_year."-".$search_month."-01";
			$last_day = date("t", mktime(0, 0, 1, $search_month, 1, $search_year));
			$end_date = $search_year."-".$search_month."-".$last_day;
		}
	}

	$sales_title = $admin->getTitleSalesCount($start_date,$end_date);

	//print_r($sales_title);
	$game_count = array();
	$edition_count = array();
	$dlc_count = array();

	$game_price = array();
	$edition_price = array();
	$dlc_price = array();
	
	
	foreach($sales_title as $key=>$value){
		switch($value['product_type']){
			case "game":
				$title_list[$value['title_id']]['title_id']= $value['title_id'];
				$title_list[$value['title_id']]['title_name']= $admin->getTitleName($value['title_id']);
				$game_count[$value['title_id']]+=$value['total_count'];
				$game_price[$value['title_id']]+=$value['total_price'];
				
				$sales_info = array(
					'product_code'=>$value['product_code'],
					'product_name'=>$value['product_name'],
					'total_count'=>$value['total_count'],
					'total_price'=>$value['total_price'],
				);
				$title_list[$value['title_id']]['game'][] = $sales_info;
			break;
			case "edition":
				$title_list[$value['title_id']]['title_id']= $value['title_id'];
				$title_list[$value['title_id']]['title_name']= $admin->getTitleName($value['title_id']);
				$edition_count[$value['title_id']]+=$value['total_count'];
				$edition_price[$value['title_id']]+=$value['total_price'];
				
				$sales_info = array(
					'product_code'=>$value['product_code'],
					'product_name'=>$value['product_name'],
					'total_count'=>$value['total_count'],
					'total_price'=>$value['total_price'],
				);
				$title_list[$value['title_id']]['edition'][] = $sales_info;
			break;
			case "dlc":
				$title_list[$value['title_id']]['title_id']= $value['title_id'];
				$title_list[$value['title_id']]['title_name']= $admin->getTitleName($value['title_id']);
				$dlc_count[$value['title_id']]+=$value['total_count'];
				$dlc_price[$value['title_id']]+=$value['total_price'];
				
				$sales_info = array(
					'product_code'=>$value['product_code'],
					'product_name'=>$value['product_name'],
					'total_count'=>$value['total_count'],
					'total_price'=>$value['total_price'],
				);
				$title_list[$value['title_id']]['dlc'][] = $sales_info;
			break;
			/*
			case "bundle":
				$title_list[$value['title_id']]['title_id']= $value['title_id'];
				$title_list[$value['title_id']]['title_name']= $admin->getTitleName($value['title_id']);
				$multi_count[$value['title_id']]+=$value['total_count'];
				$multi_price[$value['title_id']]+=$value['total_price'];
				
				$sales_info = array(
					'product_code'=>$value['product_code'],
					'product_name'=>$value['product_name'],
					'total_count'=>$value['total_count'],
					'total_price'=>$value['total_price'],
				);
				$title_list[$value['title_id']]['multi'][] = $sales_info;
			break;
			*/
		}
		$title_list[$value['title_id']]['sales_price'] =$game_price[$value['title_id']]+$edition_price[$value['title_id']]+$dlc_price[$value['title_id']];
		$title_list[$value['title_id']]['sales_count'] =$game_count[$value['title_id']]+$edition_count[$value['title_id']]+$dlc_count[$value['title_id']];
	}

	foreach ($title_list as $key => $row) {
		$sales_price[$key]  = $row['sales_price'];
		$sales_count[$key] = $row['sales_count'];
	}
	
	

	$sales_price  = array_column($title_list, 'sales_price');
	$sales_count = array_column($title_list, 'sales_count');

	array_multisort($sales_price, SORT_DESC, $sales_count, SORT_DESC, $title_list);
	
	//print_r($title_list);

	//$result1 = arr_sort($title_list,'sales_price','asc');

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문분석</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 
					<div class="row g-2">
						<div class="col-12">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">검색필터</h5>
								<div class="card-body py-2">
									<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
										<div class="row mb-2">
											<div class="col-lg-12">
												<div class="row">
													<label for="search_title_id" class="col-sm-1 col-form-label bg-light border">주문기간</label>
													<div class="col-sm-3">
														<div class="input-group">
															<select class="form-select me-2" id="search_year" name="search_year">
																<option value="">:::년:::</option>
																<?
																	for($i=2013;$i<=date('Y');$i++){
																?>
																<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
																<?
																	}
																?>
															</select>
															<select class="form-select" id="search_month" name="search_month">
																<option value="">:::월:::</option>
																<?
																	for($i=1;$i<=12;$i++){
																?>
																<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_month'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>월</option>
																<?
																	}
																?>
															</select>
														</div>
													</div>
													<div class="col-auto">
														<button class="input-group-text btn-primary shadow-none" type="submit">검 색</button>
													</div>
												</div>
											</div>
										</div>
										<div class="row">
											<div class="col-lg-12 text-end">
												<button type="button" class="btn btn-info shadow-none" id="btn_best_save">인기 타이틀 저장</button>
											</div>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>

					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body p-0">
									<div class="table-responsive">
										<table class="table table-bordered table-centered table-sm">
											<thead class="table-light font-13">
											<tr>
												<th class="text-center" rowspan="2" style="width:50px">순위</th>
												<th class="text-center" rowspan="2" style="width:100px">대표상품코드</th>
												<th class="text-center" rowspan="2">대표상품명</th>
												<th class="text-center" colspan="2">기본게임</th>
												<th class="text-center" colspan="2">에디션</th>
												<th class="text-center" colspan="2">DLC</th>
												<th class="text-center" colspan="2">합계</th>
											</tr>
											<tr>
												<th class="text-center" style="width:40px">수량</th>
												<th class="text-center" style="width:40px">금액</th>
												<th class="text-center" style="width:40px">수량</th>
												<th class="text-center" style="width:40px">금액</th>
												<th class="text-center" style="width:40px">수량</th>
												<th class="text-center" style="width:40px">금액</th>
												<th class="text-center" style="width:40px">수량</th>
												<th class="text-center" style="width:40px">금액</th>
											</tr>
											</thead>
											<tbody class="font-12">
											<?
													$ranking = 1;
													
													foreach($title_list as $key=>$value){
														if($value['title_id']){
															if(is_array($value['game'])){
																foreach($value['game'] as $sub_key=>$sub_value){
																	$game_sales_count[$value['title_id']] +=$sub_value['total_count']; 
																	$game_sales_price[$value['title_id']] +=$sub_value['total_price']; 
																}
															}

															if(is_array($value['edition'])){
																foreach($value['edition'] as $sub_key=>$sub_value){
																	$edition_sales_count[$value['title_id']] +=$sub_value['total_count']; 
																	$edition_sales_price[$value['title_id']] +=$sub_value['total_price']; 
																}
															}
															
															if(is_array($value['dlc'])){
																foreach($value['dlc'] as $sub_key=>$sub_value){
																	$dlc_sales_count[$value['title_id']] +=$sub_value['total_count']; 
																	$dlc_sales_price[$value['title_id']] +=$sub_value['total_price']; 
																}
															}
											?>
											<tr>
												<td class="text-center"><?=$ranking++?></td>
												<td class="text-center"><?=$value['title_id']?></td>
												<td class="px-1"><?=$value['title_name']?></td>
												<td class="text-end" style='width:50px'><span class="num"><?=number_format($game_sales_count[$value['title_id']])?></span></td>
												<td class="text-end" style='width:50px'><span class="num"><?=number_format($game_sales_price[$value['title_id']])?></span></td>

												<td class="text-end" style='width:50px'><span class="num"><?=number_format($edition_sales_count[$value['title_id']])?></span></td>
												<td class="text-end" style='width:50px'><span class="num"><?=number_format($edition_sales_price[$value['title_id']])?></span></td>

												<td class="text-end" style='width:50px'><span class="num"><?=number_format($dlc_sales_count[$value['title_id']])?></span></td>
												<td class="text-end" style='width:50px'><span class="num"><?=number_format($dlc_sales_price[$value['title_id']])?></span></td>
												
												<td class="text-end" style='width:50px'><span class="num"><?=number_format($value['sales_count'])?></span></td>
												<td class="text-end" style='width:50px'><span class="num"><?=number_format($value['sales_price'])?></span></td>
												
												</td>
												
											</tr>
											<?
														$game_total_count+=$game_sales_count[$value['title_id']];
														$game_total_price+=$game_sales_price[$value['title_id']];
														$edition_total_count+=$edition_sales_count[$value['title_id']];
														$edition_total_price+=$edition_sales_price[$value['title_id']];
														$dlc_total_count+=$dlc_sales_count[$value['title_id']];
														$dlc_total_price+=$dlc_sales_price[$value['title_id']];
													}
												}
											?>
											</tbody>
											<tfoot class="table-dark">
											<tr>
												<th class="text-center" colspan="3"><?=$search_year?>년 <?=$search_month?> 합계</th>
												<th class="text-end"><span class="num"><?=number_format($game_total_count)?></span></th>
												<th class="text-end"><span class="num"><?=number_format($game_total_price)?></span></th>
												<th class="text-end"><span class="num"><?=number_format($edition_total_count)?></span></th>
												<th class="text-end"><span class="num"><?=number_format($edition_total_price)?></span></th>
												<th class="text-end"><?=number_format($dlc_total_count)?></th>
												<th class="text-end"><?=number_format($dlc_total_price)?></th>
												<th class="text-end"><span class="num"><?=number_format($game_total_count+$edition_total_count+$dlc_total_count)?></span></th>
												<th class="text-end"><span class="num"><?=number_format($game_total_price+$edition_total_price+$dlc_total_price)?></span></th>
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

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	//인기 타이틀 집계저장
	$("#btn_best_save").bind("click",function(){
		var search_year = $('select[name="search_year"] option:selected').val();
		var search_month = $('select[name="search_month"] option:selected').val();
		$.ajax({
			 type: "POST",
			 url: "title_order_ps.php",
			 data: {mode:"best_game_save",search_year:search_year,search_month:search_month},
			 success: function (data, status) {
				//location.reload();
				alert("집계가 완료되었습니다.");
				//alert(data);
				//location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
});
</script>
</body>
</html>
