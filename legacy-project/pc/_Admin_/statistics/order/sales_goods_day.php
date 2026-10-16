<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="기간별 주문통계";

$search_start_date = filter_input(INPUT_POST, 'search_start_date', FILTER_SANITIZE_STRING);
$search_end_date = filter_input(INPUT_POST, 'search_end_date', FILTER_SANITIZE_STRING);

if($search_start_date==""){
	$search_start_date = date('Y-m-d');
}

if($search_end_date==""){
	$search_end_date = date('Y-m-d');
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$adminGoods= new AdminGoods($conn); 

	$query = "select COALESCE(a.supplier_code,b.supplier_code)as supplier_code,a.product_code,a.product_name,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where a.ord_ymd between :start_date and :end_date group by a.product_code,COALESCE(a.supplier_code,b.supplier_code) order by sum(a.sales_count) desc,sum(a.sales_count*a.unit_price) desc";
	$params = array(
		":start_date"=>$search_start_date,
		":end_date"=>$search_end_date,
	);
	$stmt = $conn->prepare($query);
	$stmt->execute($params);
	$sales_data = $stmt->fetchAll();

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

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="POST" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-12">
										<div class="row">
											<label for="reportrange" class="col-sm-1 col-form-label bg-light border">기간검색</label>
											<div class="col-sm-2">
												<div id="reportrange" class="form-control" data-toggle="date-picker-range" data-target-display="#reportrange"  data-cancel-class="btn-light">
													<i class="mdi mdi-calendar"></i>&nbsp;
													<span id="reportrange"></span> <i class="mdi mdi-menu-down"></i>
												</div>
											</div>
											<div class="col-sm-4">
												<div class="input-group">
													<input type="text" class="form-control" id="search_start_date" name="search_start_date" placeholder="시작일자" value="<?=$search_start_date?>" readonly>
													<span class="input-group-text">~</span>
													<input type="text" class="form-control" id="search_end_date" name="search_end_date" placeholder="종료일자" value="<?=$search_end_date?>" readonly>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none" id="btn_search">검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				(검색기간: <?=$search_start_date?> ~ <?=$search_end_date?>)
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm">
							<colgroup>
								<col width="18%"/>
								<col width="18%"/>
								<col width="16%"/>
								<col width="16%"/>
								<col width="16%"/>
								<col width="16%"/>
							</colgroup>
							<thead class="table-light font-14">
								<tr>
									<th class="text-center">총 주문수량</th>
									<th class="text-center">총 주문금액</th>
									<th class="text-center">최대 주문수량</th>
									<th class="text-center">최대 주문금액</th>
									<th class="text-center">최소 주문수량</th>
									<th class="text-center">최소 주문금액</th>
								</tr>
							</thead>
							<tbody class="bg-white">
								<tr>
									<td class="text-end"><span id="totalSaleCount" class="fw-bold"></span></td>
									<td class="text-end"><span id="totalSalePrice" class="fw-bold"></span> 원</td>
									<td class="text-end">
										<span id="maxSaleCount" class="fw-bold"></span><br/>
										<span id="maxSaleCountProduct" class="font-12"></span>
									</td>
									<td class="text-end">
										<span id="maxSalePrice" class="fw-bold"></span> 원<br/>
										<span id="maxSaleProduct" class="font-12"></span>
									</td>
									<td class="text-end">
										<span id="minSaleCount" class="fw-bold"></span><br/>
										<span id="minSaleCountProduct" class="font-12"></span>
									</td>
									<td class="text-end">
										<span id="minSalePrice" class="fw-bold"></span> 원<br/>
										<span id="minSalePriceProduct" class="font-12"></span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-striped table-sm" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">퍼블리셔명</th>
										<th class="text-center">옵션상품코드</th>
										<th class="text-center">옵션상품명</th>
										<th class="text-center">주문수량</th>
										<th class="text-center">주문합계</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
									<?
										foreach($sales_data as $value){
									?>
									<tr>
										<td class="text-center"><?=$adminGoods->getPublisherNameFallback($value['supplier_code'])?></td>
										<td class="text-center"><?=$value['product_code']?></td>
										<td><span class="product_name"><?=$value['product_name']?></span></td>
										<td class="text-end"><span class="total_count"><?=number_format($value['total_count'])?></span></td>
										<td class="text-end"><span class='total_price'><?=number_format($value['total_price'])?></span></td>
									</tr>
									<?
											$total_count+=$value['total_count'];
											$total_price+=$value['total_price'];
										}
									?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="2" class="text-center">합계</th>
										<th></th>
										<th class="text-end"><span id="total_count"><?=number_format($total_count)?></span></th>
										<th class="text-end"><span id="total_price"><?=number_format($total_price)?></span></th>
									</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</div>
				<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<script src="https://cdn.jsdelivr.net/npm/jquery-number/jquery.number.min.js"></script>

	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script type="text/javascript">
$(function() {
	var start =  "<?=$search_start_date?>";
	var end =  "<?=$search_end_date?>";
	
	function cb(start, end) {
		console.log(start);
		console.log(end);
		const start_date = dateFormat(new Date(start));
		const end_date = dateFormat(new Date(end));
		
		console.log(start_date);
		console.log(end_date);
		
		$('#reportrange span').html(start_date + ' - ' + end_date);
		$('#search_start_date').val(start_date);
		$('#search_end_date').val(end_date);
	}
	
    $('#reportrange').daterangepicker({
		locale: {
			'format': "YYYY-MM-DD",
			'separator': " - ",
			'weekLabel': "W",
			'customRangeLabel': "기간선택 (최대90일)",
			'daysOfWeek': ["일", "월", "화", "수", "목", "금", "토"],
            'monthNames': ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
		},
        startDate: start,
        endDate: end,
		maxSpan: {
			'days': 90
		},
        ranges: {
           '오늘': [moment(), moment()],
           '어제': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           '지난 7일': [moment().subtract(6, 'days'), moment()],
           '지난 30일': [moment().subtract(29, 'days'), moment()],
           '이번달': [moment().startOf('month'), moment().endOf('month')],
           '지난달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);
   cb(start, end);
});

$(document).ready(function(){
	//최대주문금액
	function getMaxPrice(){
		 var n="0";
		 var index=0;
		 var tmp="";
		
		 for(var i=0; i<$('.total_price').length; i++){
			  tmp = Number($('.total_price').eq(i).text().replace(/,/g, ""));
			  if(i==0){
					n=tmp;
			  }else{
					if(tmp>n){
						n=tmp;
						index = i;
					}
			  }
		 }
			
		$('#maxSalePrice').text($.number(n));
		$('#maxSaleProduct').text($('.product_name').eq(index).text());
	}
	
	//최대주문수량
	function getMaxCount(){
		 var n="0";
		 var index=0;
		 var tmp="";
		
		 for(var i=0; i<$('.total_count').length; i++){
			  tmp = Number($('.total_count').eq(i).text().replace(/,/g, ""));
			  if(i==0){
					n=tmp;
			  }else{
					if(tmp>n){
						n=tmp;
						index = i;
					}
			  }
		 }
			
		$('#maxSaleCount').text($.number(n));
		$('#maxSaleCountProduct').text($('.product_name').eq(index).text());
	}

	//최소주문금액
	function getMinPrice(){
		 var n="0";
		 var index=0;
		 var tmp="";
		 for(var i=0; i<$('.total_price').length; i++){
			tmp = Number($('.total_price').eq(i).text().replace(/,/g, ""));
			if(i==0){ 
				n=tmp;
			}else{
				if(tmp<n){
					n=tmp;
					index = i;
				}
			}
		 }

		$('#minSalePrice').text($.number(n));
		$('#minSalePriceProduct').text($('.product_name').eq(index).text());
	}
	
	function getMinCount(){
		 var n="0";
		 var index=0;
		 var tmp="";
		 for(var i=0; i<$('.total_count').length; i++){
			tmp = Number($('.total_count').eq(i).text().replace(/,/g, ""));
			if(i==0){ 
				n=tmp;
			}else{
				if(tmp<n){
					n=tmp;
					index = i;
				}
			}
		 }

		$('#minSaleCount').text($.number(n));
		$('#minSaleCountProduct').text($('.product_name').eq(index).text());
	}

	getMaxPrice();
	getMaxCount();
	getMinPrice();
	getMinCount();
	
	$('#totalSalePrice').text($('#total_price').text());
	$('#totalSaleCount').text($('#total_count').text());
});

function dateFormat(date) {
	let dateFormat2 = date.getFullYear() +'-' + (date.getMonth() + 1).toString().padStart(2, '0')+'-' + date.getDate().toString().padStart(2, '0');
	return dateFormat2;
}
</script>
</body>
</html>
