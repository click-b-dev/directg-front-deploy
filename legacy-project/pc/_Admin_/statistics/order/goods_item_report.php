<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['statistics'] = "active";
$page_title="옵션상품별 리포트";
/*
타입	Pre Order 판매기준		출시 후 7일 이내		첫 할인 프로모션 전까지		첫 할인 프로모션 [예상]			
A	판매 시작일	출시일 D+0	출시일 D+1	출시일 D+6	판매 시작일	첫 할인 프로모션 시작일	프로모션 기간	일평균	할인률	예상판매량
B	예약판매시작일	예약판매종료일	출시일 D+1	출시일 D+6	판매 시작일	첫 할인 프로모션 시작일	프로모션 기간	일평균	할인률	예상판매량

*/

$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);

/*상품정보*/

$goods_special_item = array();

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);

	//옵션상품정보
	$query="select * from tbl_goods_item where product_code=:product_code";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);

	$goods_data = $stmt->fetch();

	//옵션상품 금액별 주문통계
	$query="select ord_ymd,sum(sales_count)as sales_count from tbl_sales where product_code=:product_code group by ord_ymd order by ord_ymd asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);
	$sales_price_data = $stmt->fetchAll();

	//옵션상품 주문일자별 통계
	$query="select date_format(ord_ymd,'%Y')as order_year,ord_ymd,unit_price,sum(sales_count)as sales_count,count(*)as day_diff from tbl_sales where product_code=:product_code group by ord_ymd,unit_price order by ord_ymd asc,unit_price asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);
	$goods_option_sales_data = $stmt->fetchAll();


	
	foreach($goods_option_sales_data as $value){
		$sales_day_data[$value['order_year']][$value['ord_ymd']][]=array(
			"unit_price"=>$value['unit_price'],
			"sales_count"=>$value['sales_count'],
		);
	}

	//print_r($sales_day_data);
	//exit;

	//옵션상품 프로모션별 주문통계
	$query="select b.promotion_type,b.promotion_gubun,b.promotion_label,a.product_code,a.promotion_start,a.promotion_end,a.unit_price,b.discount_rate,sum(a.sales_count)as sales_count,count(*) from tbl_sales_promotion a inner join tbl_promotion_schedule b on a.product_code=b.product_code and a.promotion_start=b.promotion_start and a.promotion_end=b.promotion_end and a.unit_price=b.sale_price where a.product_code=:product_code group by a.unit_price,a.promotion_start,a.promotion_end order by a.promotion_start asc,a.promotion_end asc,a.unit_price asc";
	$stmt = $conn->prepare($query);
	$params = array(
		":product_code"=>$product_code
	);
	$stmt->execute($params);
	$promotion_sales_data = $stmt->fetchAll();

	/*관련 DLC목록*/
	/*if($goods_data['product_type']=="1"){
		$dlc_data = [];

		$dlc_count = 0;
		foreach($dlc_cursor as $value){
			$dlc_data[$dlc_count]['goods_code']= $value->goods_code;
			$dlc_data[$dlc_count]['goods_nm']= $value->goods_nm;
			$dlc_data[$dlc_count]['open_date']= $value->open_date;
			$dlc_data[$dlc_count]['goods_srp']= $value->goods_srp;
			$dlc_data[$dlc_count]['price']= $value->price;
			$dlc_count++;
		}
	}*/

	if($line_chart['0']['x']<>date('Y-m-d',strtotime($goods_data['start_date']))){
		$u_query="update tbl_goods_item set start_date=:start_date where product_code=:product_code";
		$stmt = $conn->prepare($u_query);
		$params = array(
			":start_date"=>$line_chart['0']['x'],
			":product_code"=>$product_code
		);
		//$stmt->execute($params);
	}

	$loop = 0;
	foreach($sales_price_data as $value){
		$goods_data['total']+=$value['sales_count'];
		$line_chart[$loop]['x']=$value['ord_ymd'];
		$line_chart[$loop]['y']=$value['sales_count'];
		$loop++;
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문 분석</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title -->
					<div class="row">
						<div class="col-4">
							<div class="card">
								<div class="card-header"><strong>옵션상품정보</strong></div>
								<div class="card-body p-1">
									<table class="table table-centered table-bordered mb-0">
									<tbody class='font-14'>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">옵션상품코드</th>
											<td class="p-1 ps-2"><?=$goods_data['product_code']?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">옵션상품명</th>
											<td class="p-1 ps-2"><?=$goods_data['product_name']?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">공급처</th>
											<td class="p-1 ps-2"><?=$adminGoods->getPublisherName($goods_data['supplier_code'])?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">플랫폼</th>
											<td class="p-1 ps-2"><?=$admin->getProductPlatform($goods_data['product_platform'])?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">판매상태</th>
											<td class="p-1 ps-2"> <?=$admin->getProductStatus($goods_data['status'])?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">상품유형</th>
											<td class="p-1 ps-2"><?=$admin->getProductType($goods_data['product_type'])?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">출시일</th>
											<td class="p-1 ps-2"><?=$goods_data['release_date']?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">예약판매기간</th>
											<td class="p-1 ps-2">
											<?=(is_null($goods_data['start_date']))?'':date('Y-m-d',strtotime($goods_data['start_date']))?>
											</td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">예약판매 수량</th>
											<td class="p-1 ps-2"></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">예약판매 일평균</th>
											<td class="p-1 ps-2"></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">판매시작일</th>
											<td class="p-1 ps-2"><?=$line_chart['0']['x']?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">일반판매기간</th>
											<td class="p-1 ps-2">
												<?=(is_null($goods_data['start_date']))?'':date('Y-m-d',strtotime($goods_data['start_date']))?> ~ <?=(is_null($goods_data['end_date']))?'':date('Y-m-d',strtotime($goods_data['end_date']))?>
												<? 
													$time_check = strtotime($goods_data['end_date'])-strtotime($goods_data['start_date']);
												?>
												<span class="ms-1 badge badge-secondary-lighten font-12"><?=number_format(floor($time_check/86400))?>일</span>
											</td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">누적 판매수량</th>
											<td class="p-1 ps-2">
												<? if($goods_data['total']==0){?>
												<button type="button" class="btn btn-secondary btn-sm shadow-none" id="btn_sales_count" data-goodscode="<?=$goods_data['goods_code']?>">집계</button>
												<?}else{?>
												<?=number_format($goods_data['total'])?>
												<?}?>
											</td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">최근 30일 판매수량</th>
											<td class="p-1 ps-2"><?=number_format($month_total_count,0)?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">최근 30일 일평균</td>
											<td class="p-1 ps-2"><?=$month_per_count?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">SRP</th>
											<td class="p-1 ps-2"><?=number_format($goods_data['product_srp'])?></td>
										</tr>
										<tr>
											<th class="bg-light p-1 px-2" scope="col">DG판매가</th>
											<td class="p-1 ps-2"><?=number_format($goods_data['price'])?></td>
										</tr>
									</tbody>
									</table>
								</div>
							</div>
						</div>
						<div class="col-8">
							<div class="card">
								<div class="card-body">
									<div class="dropdown float-end">
										<a href="#" class="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
											<i class="mdi mdi-dots-vertical"></i>
										</a>
										<div class="dropdown-menu dropdown-menu-end">
											<!-- item-->
											<a href="javascript:void(0);" class="dropdown-item">Weekly Report</a>
											<!-- item-->
											<a href="javascript:void(0);" class="dropdown-item">Monthly Report</a>
										</div>
									</div>
									<h4 class="header-title mb-4">일별 판매추이</h4>

									<div dir="ltr">
										<div class="line-container">
											<div id="chart"></div>
										</div>
									</div>

								</div> <!-- end card body-->
							</div> 
							<!-- end card -->
						</div>
					</div>

					<div class="row">
						<div class="col-6">
							<?
								if($goods_data['goods_kind']=="기본게임"){
							?>
							<div class="card">
								<div class="card-header mb-2"><strong>관련 DLC</strong></div>
								<div class="card-body p-0">
									<table class="table table-striped-columns table-centered table-bordered mb-0 table-sm">
										<thead class="table-dark font-14">
											<tr>
												<th class="text-center">상품코드</th>
												<th class="text-center">상품명</th>
												<th class="text-center">출시일</th>
												<th class="text-center">SRP</th>
												<th class="text-center">DG판매가</th>
											</tr>
										</thead>
										<tbody class="p-0 font-12">
										<?
												foreach($dlc_data as $value){
										?>
										<tr>
											<td class="text-center p-1"><?=$value['goods_code']?></td>
											<td class="p-1"><?=$value['goods_nm']?></td>
											<td class="text-center p-1"><?=$value['open_date']?></td>
											<td  class="text-end p-1"><?=number_format($value['goods_srp'])?></td>
											<td  class="text-end p-1"><?=number_format($value['price'])?></td>
										</tr>
										<?	}
										?>
										</tbody>
										</table>
								</div>
							</div>
							<?
								}
							?>
							
							<div class="card">
								<div class="card-header mb-2">
									<div class="row">
										<div class="col-6"><strong>주문일자별 통계</strong></div>
										<div class="col-6">
											<form id="frm">
											<?
												$tmp_year = date('Y');
												$tmp_month=date('m');

												$selected['search_year'][$tmp_year]="selected";
												$selected['search_month'][$tmp_month]="selected";
											?>
												<input type="hidden" name="product_code" id="product_code" value="<?=$product_code?>">
												<div class="input-group">
													<select class="form-select form-select-sm" name="search_year" aria-label="년">
														<option selected>:::년:::</option>
														<?for($i=2013;$i<=date('Y');$i++){?>
														<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?></option>
														<?}?>
													</select>
													<span class="input-group-text" id="basic-addon1">년</span>
													<select class="form-select form-select-sm" name="search_month" aria-label="월">
														<option selected>:::월:::</option>
														<?for($i=1;$i<=12;$i++){?>
														<option value="<?=sprintf("%02d",$i)?>" <?=$selected['search_month'][sprintf("%02d",$i)]?>><?=sprintf("%02d",$i)?></option>
														<?}?>
													</select>
													<span class="input-group-text" id="basic-addon2">월</span>
													<button type="button" class="btn btn-sm btn-primary shadow-none" id="btn_sales_per_day">검색</button>
												</div>
											</form>
										</div>
									</div>
								</div>
								<div class="card-body p-0">
									<div id="order_goods_count">
										<table class="table table-centered table-bordered mb-0 table-sm" >
											<thead class="table-dark font-13">
												<tr>
													<th class="text-center p-1">주문일자</th>
													<th class="text-center p-1">DG 할인율</th>
													<th class="text-center p-1">DG 판매가</th>
													<th class="text-center p-1">주문수량</th>
													<th class="text-center p-1">주문합계</th>
												</tr>
											</thead>
											<tbody class="p-1 font-12">
											<?
													$last_day_count = date('t', strtotime($tmp_year."-".$tmp_month."-01"));

													for($i=1;$i<=$last_day_count;$i++){
														$tmp_date = $tmp_year."-".$tmp_month."-".sprintf("%02d",$i);
														$loop = 0;
														if(is_array($sales_day_data[$tmp_year][$tmp_date])){
															foreach($sales_day_data[$tmp_year][$tmp_date] as $sub_value){
											?>
											<tr>
												<?if($loop==0){?>
												<td class="text-center p-1" rowspan="<?=count($sales_day_data[$tmp_year][$tmp_date])?>"><?=$tmp_date?></td>
												<?}?>
												<td class="text-end p-1">
												<span class="text-danger mdi mdi-arrow-down-bold"></span> <span class="text-danger num"><?//=(1-round($sub_value['unit_price']/$goods_data['product_srp'],2))*100?>%</span>
												</td>
												<td class="text-end p-1">
													<?=number_format($sub_value['unit_price'])?>
												</td>
												<td class="text-end p-1"><?=number_format($sub_value['sales_count'])?></td>
												<td class="text-end p-1"><?=number_format($sub_value['unit_price']*$sub_value['sales_count'])?></td>
											</tr>
											<?	$total_count+=$sub_value['sales_count'];
													$total_price+=($sub_value['unit_price']*$sub_value['sales_count']);
												//}
															$loop++;
														}
													}else{
											?>
											<tr>
												<?if($loop==0){?>
												<td class="text-center p-1" rowspan=""><?=$tmp_date?></td>
												<?}?>
												<td class="text-end p-1">
													
												</td>
												<td class="text-end p-1">0</td>
												<td class="text-end p-1">0</td>
												<td class="text-end p-1">0</td>
											</tr>
											<?
													}
												}
											?>
											</tbody>
											<tfoot class="table-dark font-14">
											<tr>
												<th colspan="2" class="text-center p-1">합계</th>
												<td class="text-end p-1"></td>
												<td class="text-end p-1"><?=number_format($total_count)?></td>
												<td class="text-end p-1"><?=number_format($total_price)?></td>
											</tr>
											</tfoot>
										</table>
									</div>
								</div>
							</div>

						</div>
						<div class="col-6">
							<div class="card">
								<div class="card-header mb-2"><strong>프로모션별 주문통계</strong></div>
								<div class="card-body p-0">
									<table class="table table-centered table-bordered mb-0 table-sm">
										<thead class="table-dark font-14">
											<tr>
												<th class="text-center p-1">프로모션명</th>
												<th class="text-center p-1">프로모션 기간</th>
												<th class="text-center p-1">DG 할인가</th>
												<th class="text-center p-1">판매량</th>
												<th class="text-center p-1">일평균</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											foreach($promotion_sales_data as $value){
												$date1 = strtotime($value['promotion_start']);
												$date2 = strtotime($value['promotion_end']);

												$diff =  $date2 - $date1;

												if($value['sales_count']>0){
													 $sales_count =(int)$value['sales_count'];
												}else{
													$sales_count = 0;
												}

												if($diff>0){
													$event_term = $diff/(60*60)/24;
													$day_per_count = $sales_count/$event_term;
												}else{
													$day_per_count = 0;
												}
										?>
										<tr>
											<td class="p-1"><?=$admin->getPromotionTitle($value['promotion_type'],$value['promotion_gubun'],$value['promotion_label'],$value['product_code'],$value['promotion_start'])?></td>
											<td class="text-center p-1"><?=$value['promotion_start']?> ~ <?=$value['promotion_end']?></td>
											<td class="text-end p-1"><?=number_format($value['unit_price'])?><br/>(<span class="text-danger mdi mdi-arrow-down-bold"></span> <span class="text-danger num"><?=$value['discount_rate']?>%</span> )</td>
											<td class="text-end p-1"><?=number_format($value['sales_count'])?></td>
											<td class="text-end p-1"><?=round($day_per_count,2)?></td>
										</tr>
										<?
												$promotion_total_count+=$value['sales_count'];
											}
										?>
										</tbody>
										<tfoot class="table-light font-14">
											<tr>
												<th class="text-center">합계</th>
												<th></th>
												<th></th>
												<th class="text-end"><?=number_format($promotion_total_count)?></th>
												<th></th>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>

							
						</div>
					</div>
					<div class="col-12">
						
					</div>
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$("#btn_sales_count").bind("click",function(){
		var goods_code = $("#btn_sales_count").attr("data-goodscode");
		$.ajax({
			 type: "GET",
			 url: "mongo_order_goods_batch.php",
			 data: {product_code:goods_code,search_year:"2021"},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$("#btn_sales_per_day").bind("click",function(){
		var product_code = $("#product_code").val();
		var search_year = $("select[name='search_year'] option:selected").val();
		var search_month = $("select[name='search_month'] option:selected").val();
		
		if(search_year!="" && search_month!=""){
			$.ajax({
				 type: "POST",
				 url: "ajax_order_goods_count.php",
				 data: {product_code:product_code,search_year:search_year,search_month:search_month},
				 success: function (data, status) {
					//location.href='ezwel_goods_list.php';
					//location.reload();
					//alert(data);
					$("#order_goods_count").html(data);
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}else{
			alert("검색날짜를 선택해 주세요.");
		}
	});
});


var options = {
  series: [{
  name: '판매수량',
  data: <?=json_encode($line_chart)?>
}],
  chart: {
  type: 'area',
  stacked: false,
  height: 460,
  zoom: {
	type: 'x',
	enabled: true,
	autoScaleYaxis: true
  },
  toolbar: {
	autoSelected: 'zoom'
  }
},
dataLabels: {
  enabled: false,
},
markers: {
  size: 0,
},
title: {
  text: "[<?=$goods_data['product_name']?>] 주문일자별 판매현황",
  align: 'left'
},
fill: {
  type: 'gradient',
  gradient: {
	shadeIntensity: 1,
	inverseColors: false,
	opacityFrom: 0.5,
	opacityTo: 0
  },

},
xaxis: {
	type: 'datetime',
	labels: {
		 datetimeUTC:false,
		datetimeFormatter: {
              year: 'yyyy',
              month: "yyyy-MM",
              day: 'yyyy-MM-dd',
              hour: 'HH:mm',
          },
	}
},
	tooltip: {
	x: {
          show: true,
          format: 'yyyy-MM-dd',
          formatter: undefined,
      },
}
};

var chart = new ApexCharts(document.querySelector("#chart"), options);

chart.render();

</script>
</body>
</html>
