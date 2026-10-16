<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="이벤트 - 옵션상품 통계";

$event_no = filter_input(INPUT_GET, 'event_no', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminGoods= new AdminGoods($conn);
	$adminOrder= new AdminOrder($conn);
	$parsedown= new Parsedown();
	
	//이벤트 정보조회
	$event_query="select * from tbl_event where idx=:event_no";
	$params = array(
			":event_no"=>$event_no,
		);
	$stmt = $conn->prepare($event_query);
	$stmt->execute($params);
	$event_data = $stmt->fetch();
	
	//이벤트 관련상품
	$event_goods_query="select b.product_code, b.product_name,b.supplier_code,b.game_type,b.release_date from tbl_event_goods a inner join tbl_goods_item b on a.product_code=b.product_code where a.event_no=:event_no";
	$params = array(
			":event_no"=>$event_no,
		);
	$stmt = $conn->prepare($event_goods_query);
	$stmt->execute($params);
	$event_goods_data = $stmt->fetchAll();

	if($event_no){
		$query = "select b.supplier_code,b.game_type,b.release_date,a.product_code,a.product_name,sum(a.sales_count)as total_count,sum(a.sales_count*a.unit_price)as total_price from tbl_sales a inner join tbl_goods_item b on a.product_code=b.product_code where a.ord_ymd between :start_date and :end_date and b.supplier_code=:supplier_code ".$add_where." group by a.product_code order by sum(a.sales_count) desc,sum(a.sales_count*a.unit_price) desc";
		$params = array(
			":start_date"=>$search_start_date,
			":end_date"=>$search_end_date,
			":supplier_code"=>$search_supplier_code,
		);
		//$stmt = $conn->prepare($query);
		//$stmt->execute($params);
		//$sales_data = $stmt->fetchAll();
	}

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_supplier_code'][$search_supplier_code] = "selected";
$checked['search_game_type'][$search_game_type] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">이벤트 분석</a></li>
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
						<h5 class="card-header bg-secondary text-white">이벤트 정보</h5>
						<div class="card-body p-0">
							<div class="card mb-0 rounded-0">
								<div class="row g-0">
									<div class="col-md-4">
										<img src="<?=$event_data['event_banner']?>" class="img-fluid rounded-0 h-100">
									</div>
									<div class="col-md-8">
										<div class="card-body">
											<h4 class="card-title mb-3"><?=$event_data['subject']?></h4>
											<div class="event_contents"><?=$parsedown->text(htmlspecialchars_decode($event_data['contents'],ENT_NOQUOTES))?></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				* 이벤트 판매현황 (기간: <?=date('Y-m-d H:i:s',$event_data['start_date'])?> ~ <?=date('Y-m-d H:i:s',$event_data['end_date'])?>)
				<div class="row">
					<div class="col-12">
						<div class="table-responsive">
							<?if($event_data['event_gubun']=="1" || $event_data['event_gubun']=="4" || $event_data['event_gubun']=="9"){?>
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">퍼블리셔명</th>
										<th class="text-center">옵션상품유형</th>
										<th class="text-center">옵션상품코드</th>
										<th class="text-center">옵션상품명</th>
										<th class="text-center">출시일</th>
										<th class="text-center">주문수량</th>
										<th class="text-center">주문합계</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
									<?
										foreach($event_goods_data as $value){
											$event_goods_order = $adminOrder->getEventGoodsOrderCount($value['product_code'],date('Y-m-d H:i:s',$event_data['start_date']),date('Y-m-d H:i:s',$event_data['end_date']));
									?>
									<tr>
										<td class="text-center"><?=$adminGoods->getPublisherName($value['supplier_code'])?></td>
										<td class="text-center"><?=$value['game_type']?></td>
										<td class="text-center"><?=$value['product_code']?></td>
										<td><span class="product_name"><?=$value['product_name']?></span></td>
										<td class="text-center"><?=substr($value['release_date'],0,10)?></td>
										<td class="text-end"><span class="total_count"><?=number_format($event_goods_order['order_count'])?></span></td>
										<td class="text-end"><span class='total_price'><?=number_format($event_goods_order['order_price'])?></span></td>
									</tr>
									<?
											$total_count+=$event_goods_order['order_count'];
											$total_price+=$event_goods_order['order_price'];
										}
									?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="2" class="text-center">합계</th>
										<th></th>
										<th></th>
										<th></th>
										<th class="text-end"><span id="total_count"><?=number_format($total_count)?></span></th>
										<th class="text-end"><span id="total_price"><?=number_format($total_price)?></span></th>
									</tr>
								</tfoot>
							</table>
							<?}?>
							<?if($event_data['event_gubun']=="2"){?>
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">즉시할인 결제건수</th>
										<th class="text-center">즉시할인 합계</th>
										<th class="text-center">이벤트 기간내 결제합계</th>
										<th class="text-center">즉시할인 금액비율</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
									<?
										$event_order = $adminOrder->getEventNaverpayCount(date('Y-m-d H:i:s',$event_data['start_date']),date('Y-m-d H:i:s',$event_data['end_date']));
										if($event_order['event_count']>0){
									?>
									<tr>
										<td class="text-end"><?=number_format($event_order['event_count'])?></td>
										<td class="text-end"><?=number_format($event_order['event_discount'])?> 원</td>
										<td class="text-end"><?=number_format($event_order['total_amount'])?> 원</td>
										<td class="text-end"><?=round($event_order['event_discount']*100/$event_order['total_amount'],2)?> %</td>
									</tr>
									<?
										}
									?>
								</tbody>
							</table>
							<?}?>
							<?if($event_data['event_gubun']=="3"){?>
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm" id="">
								<colgroup>
									<col width="20%"/>
									<col width="20%"/>
									<col width="20%"/>
									<col width="20%"/>
									<col width="20%"/>
								</colgroup>
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">즉시할인</th>
										<th class="text-center">즉시할인 건수</th>
										<th class="text-center">즉시할인 합계</th>
										<th class="text-center">즉시할인 결제금액 합계</th>
										<th class="text-center">즉시할인 평균 결제금액</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
									<?
										$event_order = $adminOrder->getEventTossCount(date('Y-m-d H:i:s',$event_data['start_date']),date('Y-m-d H:i:s',$event_data['end_date']));
										$total_event_count = 0;
										foreach($event_order as $value){
									?>
									<tr>
										<td class="text-end"><?=number_format($value['coupon_mny'])?> 원</td>
										<td class="text-end"><?=number_format($value['event_count'])?></td>
										<td class="text-end"><?=number_format($value['event_discount'])?> 원</td>
										<td class="text-end"><?=number_format($value['total_amount'])?> 원</td>
										<td class="text-end"><?=number_format($value['total_amount']/$value['event_count'])?> 원</td>
									</tr>
									<?
											$total_event_count+=$value['event_count'];
											$total_event_discount+=$value['event_discount'];
											$total_price+=$value['total_amount'];
										}
									?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th class="text-end">즉시할인 평균: <?=($total_event_count>0)?number_format(round(($total_event_discount/$total_event_count))):""?> 원</th>
										<th class="text-end">즉시할인 건수 합계: <?=number_format($total_event_count)?></th>
										<th class="text-end"><?=number_format($total_event_discount)?> 원</th>
										<th class="text-end"><?=number_format($total_price)?> 원</th>
										<th class="text-end">건당 결제평균: <?=($total_event_count>0)?number_format(round(($total_price/$total_event_count))):""?> 원</th>
									</tr>
								</tfoot>
							</table>
							<?}?>
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
