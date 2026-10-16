<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$page_title="공급처별 주문통계";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);

if(!$search_year){
	$search_year = date('Y');
}

$start_date = $search_year."-01-01";
$end_date = $search_year."-12-31";


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 

	//공급처 변경 대응: tbl_sales.supplier_code(주문시점 박제)로 귀속, 없으면(레거시) 현재 supplier_code 폴백 → 총합 동일, 귀속만 정확. 서브쿼리 제거로 속도 복원
	$query = "select COALESCE(a.supplier_code,b.supplier_code)as supplier_code,a.is_promotion,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where a.ord_ymd between :start_date and :end_date group by COALESCE(a.supplier_code,b.supplier_code),a.is_promotion order by supplier_code asc,a.is_promotion asc";
	$params = array(
		":start_date"=>$start_date,
		":end_date"=>$end_date
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$data = $stmt->fetchAll();



	$sales_data = array();

	$promotion_total_count = array();
	$promotion_total_price = array();
	$normal_total_count = array();
	$normal_total_price = array();

	foreach($data as $value){
		$sales_data[$value['supplier_code']]['supplier_code']= $value['supplier_code'];
		//$sales_data[$value['publisher_code']]['total_count'] = 0;
		//$sales_data[$value['publisher_code']]['total_price'] = 0;
		if($value['is_promotion']=="Y"){
			//$sales_data['publisher_code'] = $value['publisher_code'];
			$sales_data[$value['supplier_code']]['promotion']['total_count']=$value['total_count'];
			$sales_data[$value['supplier_code']]['promotion']['total_price']=$value['total_price'];
			$promotion_total_count[$value['supplier_code']]+=$value['total_count'];
			$promotion_total_price[$value['supplier_code']]+=$value['total_price'];
		}

		if($value['is_promotion']=="N"){
			//$sales_data['publisher_code'] = $value['publisher_code'];
			$sales_data[$value['supplier_code']]['normal']['total_count']=$value['total_count'];
			$sales_data[$value['supplier_code']]['normal']['total_price']=$value['total_price'];
			$normal_total_count[$value['supplier_code']]+=$value['total_count'];
			$normal_total_price[$value['supplier_code']]+=$value['total_price'];
		}

		$sales_data[$value['supplier_code']]['total_count']=$promotion_total_count[$value['supplier_code']]+$normal_total_count[$value['supplier_code']];
		$sales_data[$value['supplier_code']]['total_price']=$promotion_total_price[$value['supplier_code']]+$normal_total_price[$value['supplier_code']];

		$total_count+= $value['total_count'];
		$total_price+= $value['total_price'];
	}


	$publisher_data= $admin->getPublisherAllList($search_year);

	foreach($publisher_data as $sub_value){
		if($sub_value['supplier_code']){
		$sales_data[$sub_value['supplier_code']]['supplier_code']= $sub_value['supplier_code'];
		if($promotion_total_count[$sub_value['supplier_code']]>0 && $normal_total_count[$sub_value['supplier_code']]>0){
			$sales_data[$sub_value['supplier_code']]['total_count']=$promotion_total_count[$sub_value['supplier_code']]+$normal_total_count[$sub_value['supplier_code']];
			$sales_data[$sub_value['supplier_code']]['total_price']=$promotion_total_price[$sub_value['supplier_code']]+$normal_total_price[$sub_value['supplier_code']];
		}else{
			$sales_data[$sub_value['supplier_code']]['total_count'] = 0;
			$sales_data[$sub_value['supplier_code']]['total_price'] = 0;
		}
		}
	}

	

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$result1 = arr_sort($sales_data,'total_price','desc');

$selected['search_publisher'][$search_publisher] = "selected";
$selected['search_year'][$search_year] = "selected";
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
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body">
									<form class="row row-cols-lg-auto g-3 align-items-center mb-3" action="<?=$_SERVER["PHP_SELF"]?>" method="get">
										<div class="col-12">
											<div class="d-flex align-items-center">
												<label for="status-select" class="col-sm-3 col-form-label me-2">연도</label>
												<div class="col-sm-9">
													<select class="form-select" id="search_year" name="search_year">
														<option value="">연도</option>
														<? for($i=2013;$i<=date('Y');$i++){?>
														<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?></option>
														<?}?>
													</select>
												</div>
											</div>
										</div>
										<div class="col-12">
											<div class="col-auto">
												<button class="input-group-text btn-primary shadow-none" type="submit">검색</button>
											</div>
										</div>
									</form>

									<div class="table-responsive">
										<table class="table table-bordered table-centered w-100  nowrap table-sm">
											<thead class="table-dark">
											<tr>
												<th class="text-center" rowspan="2">순위</th>
												<th class="text-center" rowspan="2">퍼블리셔</th>
												<th class="text-center" colspan="2">일반판매</th>
												<th class="text-center" colspan="2">프로모션</th>
												<th class="text-center" colspan="2">합계</th>
												<th class="text-center" style="width:100px" rowspan="2">주문건수비율</th>
												<th class="text-center" style="width:150px" rowspan="2">주문금액비율</th>
											</tr>
											<tr>
												<th class="text-center" style="width:100px">주문건수</th>
												<th class="text-center" style="width:130px">주문금액</th>
												<th class="text-center" style="width:100px">주문건수</th>
												<th class="text-center" style="width:130px">주문금액</th>
												<th class="text-center" style="width:100px">주문건수</th>
												<th class="text-center" style="width:130px">주문금액</th>
											</tr>
											</thead>
											<tbody class="font-13">
											<?
												$ranking = 1;
												$promotion_total_count =0;
												$promotion_total_price = 0;
												$normal_total_count = 0;
												$normal_total_price = 0;
												foreach($result1 as $key=>$value){
											?>
											<tr>
												<td class="text-center"><?=$ranking++?></td>
												<td class="text-start"><?=$adminGoods->getPublisherNameFallback($value['supplier_code'])?></td>
												<td class="text-end"><?=number_format($value['normal']['total_count'])?><br/>(<?=round($value['normal']['total_count']*100/($value['normal']['total_count']+$value['promotion']['total_count']),2)?>%)</td>
												<td class="text-end"><?=number_format($value['normal']['total_price'])?><br/>(<?=round($value['normal']['total_price']*100/($value['normal']['total_price']+$value['promotion']['total_price']),2)?>%)</td>
												<td class="text-end"><?=number_format($value['promotion']['total_count'])?><br/>(<?=round($value['promotion']['total_count']*100/($value['normal']['total_count']+$value['promotion']['total_count']),2)?>%)</td>
												<td class="text-end"><?=number_format($value['promotion']['total_price'])?><br/>(<?=round($value['promotion']['total_price']*100/($value['normal']['total_price']+$value['promotion']['total_price']),2)?>%)</td>
												<td class="text-end"><?=number_format($value['total_count'])?></td>
												<td class="text-end"><?=number_format($value['total_price'])?></td>
												<td class="text-end"><?=round($value['total_count']*100/$total_count,2)?>%</td>
												<td class="text-end"><?=round($value['total_price']*100/$total_price,4)?>%</td>
											</tr>
											<?
													$normal_total_count+=$value['normal']['total_count'];
													$normal_total_price+=$value['normal']['total_price'];

													$promotion_total_count+=$value['promotion']['total_count'];
													$promotion_total_price+=$value['promotion']['total_price'];
												}
											?>
											</tbody>
											<tfoot class="table-dark">
											<tr>
												<th class="text-center" colspan="2">합계</th>
												<th class="text-end"><?=number_format($normal_total_count)?><br/>(<?=round(($normal_total_count/$total_count)*100,2)?>%)</th>
												<th class="text-end"><?=number_format($normal_total_price)?><br/>(<?=round(($normal_total_price/$total_price)*100,2)?>%)</th>
												<th class="text-end"><?=number_format($promotion_total_count)?><br/>(<?=round(($promotion_total_count/$total_count)*100,2)?>%)</th>
												<th class="text-end"><?=number_format($promotion_total_price)?><br/>(<?=round(($promotion_total_price/$total_price)*100,2)?>%)</th>
												<th class="text-end"><?=number_format($total_count)?></th>
												<th class="text-end"><?=number_format($total_price)?></th>
												<th class="text-end"></th>
												<th class="text-end"></th>
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

<script>
$(document).ready(function(){
	$(".btn_sales_count").bind("click",function(){
		var index = $(".btn_sales_count").index(this);
		var goods_code = $(".btn_sales_count").eq(index).attr("data-goodscode");
		$.ajax({
			 type: "GET",
			 url: "../mongo_order_goods_batch.php",
			 data: {product_code:goods_code,search_year:"2021"},
			 success: function (data) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert(data);
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
