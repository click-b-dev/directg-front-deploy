<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$topmenu['statistics'] = "active";
	$page_title = "랜덤박스 판매리포트";

	$product_code = filter_input(INPUT_GET, 'product_code', FILTER_SANITIZE_STRING);
	exit;
	try{  
		$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
		$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

		//옵션상품정보
		$query="select * from tbl_goods_item where product_code=:product_code";
		$stmt = $conn->prepare($query);
		$params = array(
			":product_code"=>$product_code
		);
		$stmt->execute($params);

		$goods_option_data = $stmt->fetch();

		//일차별 판매추이
		$query = "select date_format(reg_date,'%Y-%m-%d %H')as dd,TIMESTAMPDIFF(day, :start_date, reg_date) AS day_diff,TIMESTAMPDIFF(hour, :start_date, reg_date) AS time_diff,count(*)as cc from tbl_order a inner join tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.product_code=:product_code group by time_diff";
		$params = array(
			":start_date"=>date('Y-m-d H:i:s',$goods_option_data['start_date']),
			":product_code"=>$product_code
		);
		$stmt = $conn_dgkr->prepare($query);
		$stmt->execute($params);
		$data = $stmt->fetchAll();

		$random_data = array();
		$chart_data = array();
		
		$loop = 0;
		foreach($data as $value){
			$random_data[$value['day_diff']]['time_count'][$value['time_diff']]= array(
				"order_time"=>$value['dd'],
				"time_diff"=>$value['time_diff'],
				"order_count"=>$value['cc'],
			);
			$chart_data[$value['day_diff']][]=$value['cc'];
			$line_chart[$loop]['x']=$value['dd'];
			$line_chart[$loop]['y']=$value['cc'];
			$random_data[$value['day_diff']]['total_count']+=$value['cc'];
			$sales_total+=$value['cc'];
			$loop++;
		}

	}catch (PDOException $e){  
		echo 'Error!: '.$e->getMessage();  
		die();  
	}

	//차트용 json
	
	for($i=0;$i<14;$i++){
		$chart_json[$i] = array(
			"data"=>$chart_data[$i],
		);
	}

	//print_r($chart_data);
	//echo json_encode($chart_json);
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">랜덤박스 분석</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<div class="row">
						<div class="col-3">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">랜덤박스 정보</h5>
								<div class="card-body p-2">
									<table class="table table-centered table-bordered mb-0 table-sm ">
										<tbody class="">
											<tr>
												<th class="text-center bg-light border" style="width:90px">옵션상품코드</th>
												<td class="text-start"><?=$goods_option_data['product_code']?></td>
											</tr>
											<tr>
												<th class="text-center bg-light border">옵션상품명</th>
												<td class="text-start"><?=$goods_option_data['product_name']?></td>
											</tr>
											<tr>
												<th class="text-center bg-light border">판매가</th>
												<td class="text-start"><?=number_format($goods_option_data['price'])?> 원</td>
											</tr>
											<tr>
												<th class="text-center bg-light border">판매기간</th>
												<td class="text-start"><?=date('Y-m-d H:i:s',$goods_option_data['start_date'])?> ~ <?=date('Y-m-d H:i:s',$goods_option_data['end_date'])?></td>
											</tr>
											<tr>
												<th class="text-center bg-light border">판매수량</th>
												<td class="text-start"><?=number_format($sales_total)?> </td>
											</tr>
										</tbody>
									</table>
								</div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
							<div class="card">
								<h5 class="card-header bg-secondary text-white">랜덤박스 구성정보</h5>
								<div class="card-body">
									
								</div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
						</div>
						<!-- end col -->

						<div class="col-9">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">일차별 판매추이</h5>
								<div class="card-body">
									<div dir="ltr">
										<div id="chart" class="apex-charts" data-colors="#6c757d"></div>
									</div>
								</div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
						</div>
						<!-- end col -->
					</div>
					<!-- end row -->   
					
					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body">
									<h4 class="header-title mb-4">시간대별 판매추이</h4>

									<div dir="ltr">
										<div class="line-container">
											<div id="line-chart"></div>
										</div>
									</div>

								</div> <!-- end card body-->
							</div> 
							
							<div class="card">
								<h5 class="card-header bg-secondary text-white">판매현황</h5>
								<div class="card-body p-0">
									<div class="row g-1">
									<?
										//echo json_encode($random_data[0]);
										//echo json_encode($chart_data);
										foreach($random_data as $key=>$value){
									?>
									<div class="col-1">
										<div class="card">
											<div class="card-body p-0">
												<table class="table table-centered table-bordered mb-0 table-sm caption-top">
													<caption class="py-1"><?=$key+1?>일차</caption>
													<thead class="table-dark font-13">
														<tr>
															<th class="text-center">시간대</th>
															<th class="text-center">수량</th>
														</tr>
													</thead>
													<tbody class="font-12">
													<?
														foreach($value['time_count'] as $sub_key=>$sub_value){
													?>
													<tr>
														<td class="text-center"><?=$sub_key-($key*24)?></td>
														<td class="text-end px-1"><?=number_format($sub_value['order_count'])?></td>
													</tr>
													<?
															$total_count[$key]+=$sub_value['order_count'];
														}
													?>
													</tbody>
													<tfoot class="font-13">
														<tr>
															<th class="text-center bg-light border">합계</th>
															<th class="text-end bg-light border"><?=number_format($total_count[$key])?></th>
														</tr>
													</tfoot>
												</table>
											</div>
											<!-- end card-body-->
										</div>
										<!-- end card-->
									</div>
									<?
										}
									?>
								</div>
							</div>
						</div>
					</div>
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<!-- third party:js -->
<script src="<?=$document_root?>/assets/js/vendor/apexcharts.min.js"></script>
<!-- third party end -->

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function() {
	var options = {
	  chart: {
		  height: 400,
		  type: 'area',
	  },
	  dataLabels: {
		  enabled: false
	  },
	xaxis: {
        categories: ["16", "17", "18", "19", "20", "21", "22","23","00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15"]
    },
	  series: [],
	  title: {
		  text: '<?=$goods_option_data['product_name']?> 일차별 판매추이',
	  },
	  noData: {
		text: 'Loading...'
	  }
	};

	var chart = new ApexCharts(
	  document.querySelector("#chart"),options
	);

	chart.render();

	var url = 'randombox_sales_json.php';

	var jsonData = JSON.stringify(<?=json_encode($chart_json)?>);
	var obj2=JSON.parse(jsonData);

	$.each(obj2,function(i){
		chart.appendSeries({
			name:(i+1)+"일차",
			data:obj2[i].data
		});
	});
});


</script>
</body>
</html>
