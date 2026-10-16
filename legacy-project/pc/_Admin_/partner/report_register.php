<?
$sidebar_file = "sidebar_partner.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['partner'] = "active";

$page_title="리포트 생성";

$currency_converter = filter_input(INPUT_GET, 'currency_converter', FILTER_SANITIZE_STRING);
$account_fee = filter_input(INPUT_GET, 'account_fee', FILTER_VALIDATE_FLOAT);
$card_fee = filter_input(INPUT_GET, 'card_fee', FILTER_VALIDATE_FLOAT);
$mobile_fee = filter_input(INPUT_GET, 'mobile_fee', FILTER_VALIDATE_FLOAT);
$royalty = filter_input(INPUT_GET, 'royalty', FILTER_VALIDATE_FLOAT);
$royalty_info = filter_input(INPUT_GET, 'royalty_info', FILTER_SANITIZE_STRING);

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);
$publisher_code = filter_input(INPUT_GET, 'publisher_code', FILTER_SANITIZE_STRING);

$search_report_term = filter_input(INPUT_GET, 'search_report_term', FILTER_SANITIZE_STRING);
$search_month_term = filter_input(INPUT_GET, 'search_month_term', FILTER_SANITIZE_STRING);

if($search_year==""){
	$search_year = date("Y");
	$search_flag=false;
}else{
	$search_flag=true;
}

if(!$search_month && !$search_month_term){
	$search_month = date('m',strtotime('-1 month'));
	if($search_month=="12" && !$search_flag){
		$search_year=$search_year-1;
	}
}


if(!$search_report_term){
	$search_report_term = "M"; //기본값 월별검색
}

if($search_report_term=="T"){
	$search_month = $search_month_term;
}

if($search_report_term=="M"){//월별
	$search_date = $search_year."-".$search_month;

	$search_date_start = $search_date."-01";
	$search_date_end =  $search_date."-".date('t', strtotime($search_date_start));
	
	$sales_where = "and ord_ymd between '".$search_date_start."' and '".$search_date_end."'";
	$refund_where = "and date_format(canceldt,'%Y-%m') ='".$search_date."'";
}else{//분기별
	if(!$search_month_term){
		$search_month_term = ceil(date('m')/3);
	}
	
	$sales_where = "and year(ord_ymd) ='".$search_year."' and QUARTER(ord_ymd)='".$search_month_term."'";
	$refund_where = "and year(canceldt) ='".$search_year."' and QUARTER(canceldt)='".$search_month_term."'";
}


//26-04-13(월) 12:10 [이종석] 동기화 버튼 표시여부
if($search_report_term=="M"&& $publisher_code!=""&&$search_year!= ""&&$search_month!=""){
	$show_sync_btn = true;
} else {
	$show_sync_btn = false;
}


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminPartner= new AdminPartner($conn);
	
	if($publisher_code){
		$report_data = $adminPartner->setPartnerReport($publisher_code,$search_report_term,$sales_where,$refund_where);
		
		//파트너 PG fee 수수료
		$pg_fee_data = $adminPartner->getPartnerPGFee($publisher_code);
		
		if($pg_fee_data['account']){
			$account_fee = $pg_fee_data['account'];
		}
		
		if($pg_fee_data['credit_card']){
			$card_fee = $pg_fee_data['credit_card'];
		}
		
		if($pg_fee_data['mobile_payment']){
			$mobile_fee = $pg_fee_data['mobile_payment'];
		}
	}
	
	$publisher_data= $adminPartner->getPartnerListAll('');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_year'][$search_year] = "selected";
$selected['publisher_code'][$publisher_code] = "selected";
$selected['currency_converter'][$currency_converter] ="selected";

$checked['search_month'][$search_month] = "checked";
$checked['search_report_term'][$search_report_term] = "checked";
$checked['search_month_term'][$search_month_term] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">파트너</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">리포트 관리</a></li>
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
							<form class="form-horizontal" method="GET" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-3">
										<div class="row">
											<label for="search_report_term" class="col-sm-4 col-form-label-sm bg-light border font-14 px-1">리포트 주기</label>
											<div class="col-sm-8">
												<div class="form-check form-check-inline mt-1">
													<input type="radio" id="search_report_term_m" name="search_report_term" class="form-check-input" value="M" <?=$checked['search_report_term']['M']?>>
													<label class="form-check-label font-14" for="search_report_term_m">월별</label>
												</div>
												<div class="form-check form-check-inline mt-1">
													<input type="radio" id="search_report_term_t" name="search_report_term" class="form-check-input" value="T" <?=$checked['search_report_term']['T']?>>
													<label class="form-check-label font-14" for="search_report_term_t">분기별</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-9">
										<div class="row">
											<label for="search_date" class="col-sm-1 col-form-label-sm bg-light border font-14 px-1">기간검색</label>
											<div class="col-sm-2">
												<select class="form-select" id="search_year" name="search_year">
													<option value="">:::년도:::</option>
													<?
														for($i=2020;$i<=date('Y');$i++){
													?>
													<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
													<?
														}
													?>
												</select>
											</div>
											<div class="col-sm-9">
												<div class="input-group">
													
													<div id="choice_month">
													<?
														for($i=1;$i<=12;$i++){
													?>
														<input type="radio" class="btn-check" name="search_month" id="search_month_<?=$i?>" value="<?=sprintf('%02d',$i)?>" autocomplete="off" <?=$checked['search_month'][sprintf('%02d',$i)]?>>
														<label class="btn btn-sm btn-outline-secondary shadow-none font-14" for="search_month_<?=$i?>"><?=sprintf('%02d',$i)?>월</label>
													<?
														}
													?>
													</div>
													<div id="choice_month_term" style="display:none">
														<?
															for($i=1;$i<=4;$i++){
														?>
														<input type="radio" class="btn-check" name="search_month_term" id="search_month_term_<?=$i?>" value="<?=$i?>" autocomplete="off" <?=$checked['search_month_term'][$i]?>>
														<label class="btn btn-sm btn-outline-secondary shadow-none font-14" for="search_month_term_<?=$i?>"><?=$i?>분기</label>
														<?
															}
														?>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-4">
										<div class="row">
											<label for="publisher_code" class="col-sm-3 col-form-label-sm bg-light border font-14 px-1">파트너</label>
											<div class="col-sm-9">
												<select id="publisher_code" name="publisher_code" class="form-select select2" data-toggle="select2">
													<option value="">:::파트너 선택:::</option>
													<?
														foreach($publisher_data as $value){
													?>
													<option value="<?=$value['publisher_code']?>" <?=$selected['publisher_code'][$value['publisher_code']]?>><?=$value['publisher_name']?>  / <?=($value['report_term']=="T")?"Quarterly":"Monthly"?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-6">
										<div class="row">
											<label for="currency_converter" class="col-sm-2 col-form-label-sm bg-light border font-14 px-1">환율설정</label>
											<div class="col-sm-10">
												<div class="input-group row">
													<div class="col-4">
														<select class="form-select" name="currency_converter" id="currency_converter">
															<option value="USD" <?=$selected['currency_converter']['USD']?>>KRW 1 =&gt; USD</option>
															<option value="EUR" <?=$selected['currency_converter']['EUR']?>>KRW 1 =&gt; EUR</option>
															<option value="JPY" <?=$selected['currency_converter']['JPY']?>>KRW 1 =&gt; JPY</option>
														</select>
													</div>
													<div class="col-4">
														<input type="text" name="royalty" id="royalty" class="form-control" value="<?=$royalty?>">
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="col-6">
										<div class="row">
											<label for="royalty_info" class="col-sm-2 col-form-label-sm bg-light border font-14 px-1">환율기준참조</label>
											<div class="col-sm-4">
												<input type="text" name="royalty_info" id="royalty_info" class="form-control" value="<?=$royalty_info?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-12">
										<div class="row">
											<label for="pg_fee" class="col-sm-1 col-form-label-sm bg-light border font-14 px-1">결제수수료</label>
											<div class="col-sm-6">
												<div class="row">
													<div class="col-4">
														<div class="input-group">
															<div class="input-group-text font-14">Account</div>
															<input type="text" name="account_fee" id="account_fee" class="form-control" value="<?=$account_fee?>">
															<div class="input-group-text">%</div>
														</div>
													</div>
													<div class="col-4">
														<div class="input-group">
															<div class="input-group-text font-14">Credit Card</div>
															<input type="text" name="card_fee" id="card_fee" class="form-control" value="<?=$card_fee?>">
															<div class="input-group-text">%</div>
														</div>
													</div>
													<div class="col-4">
														<div class="input-group">
															<div class="input-group-text font-14">Mobile Payment</div>
															<input type="text" name="mobile_fee" id="mobile_fee" class="form-control" value="<?=$mobile_fee?>">
															<div class="input-group-text">%</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12 text-center">
										<button type="submit" class="btn btn-secondary shadow-none" id="">리포트 미리보기</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
						<div class="d-flex">
				<?php
					if($show_sync_btn){
				?>
							<div class=""><button type="button" class="btn btn-primary shadow-none border" id="btn_sales_sync">Sales list 동기화</button></div>
							<div class=""><button type="button" class="btn btn-primary shadow-none border" id="btn_refund_sync">Refund list 동기화</button></div>
				<?php
					}
				?>
						</div>
					<div class="float-end"><button type="button" class="btn btn-primary shadow-none border" id="btn_report">리포트 생성</button></div>
				</div>
				
				<div class="row g-2">
					<div class="col-12">
						<div class="table-responsive statistics-board mgt0" id="excelData">
							<table class="table table-rows table-bordered table-centered" id="listTable">
								<colgroup>
									<col width="5%"/>
									<col width="*"/>
									<col width="6%"/>
									<col width="4%"/>
									<col width="5%"/>
									<col width="7%"/>
									<col width="5%"/>
									<col width="7%"/>
									<col width="5%"/>
									<col width="5%"/>
									<col width="5%"/>
									<col width="5%"/>
									<col width="5%"/>
									<col width="7%"/>
									<col width="5%"/>
									<col width="5%"/>
								</colgroup>
								<thead class="table-light font-13">
									<tr class="nowrap text-center">
										<th class="bln">ITEM_ID</th>
										<th class="point1-line">Product</th>
										<th class="point1-line">Balence<br/>(%)</th>
										<th class="point1-line">rate</th>
										<th class="">Payment <br/>Gateway</th>
										<th class="point1-line">Publisher SRP<br/>(KRW)</th>
										<th class="point1-line">Sales Price<br/>(KRW)</th>
										<th class="point1-line">Publisher Price<br/>(KRW)</th>
										<th class="point1-line">Gross Units <br/>Sold</th>
										<th class="point1-line">Gross Sales<br/>(in VAT)</th>
										<th class="point1-line">Gross Sales<br/>(ex VAT)</th>
										<th class="point1-line">Payment <br/>Gateway FEE</th>
										<th class="point1-line">Net Sales<br/>(KRW)</th>
										<th class="point1-line">Revenue<br/>(%)</th>
										<th class="point1-line">Revenue Share<br/>(KRW)</th>
										<th class="point1-line">Edit</th>
									</tr>
								</thead>
								<tbody class="bg-white font-12">
									<?
										foreach($report_data as $value){
											switch($value['settlekind']){
												case "Account":
													$fee = $account_fee;
												break;
												case "Credit":
													$fee = $card_fee;
												break;
												case "Mobile":
													$fee = $mobile_fee;
												break;
											}

											$gross_sales_in_vat = $value['sum_settleprice'];
											$gross_sales_ex_vat = round($gross_sales_in_vat /1.1,0);
										
											$payment_fee = round(($gross_sales_ex_vat/100 * $fee),0);
											$net_sales = $gross_sales_ex_vat-$payment_fee;
											$product_ppr = $value['product_ppr'];
											

											if($value['product_srp']==$value['order_srp']){
												$product_name = $value['product_name_en'];
												$rate = "0";
											}else{
												if($value['product_srp']>0){
													$product_name = $value['product_name_en']."_".round(($value['product_srp']-$value['order_srp'])*100/$value['product_srp']);
													$rate = round(($value['product_srp']-$value['order_srp'])*100/$value['product_srp']);
												}
												
											}

											if($value['status']=='9'){
												$text_class="text-danger";
											}else{
												$text_class="";
											}

											if($value['product_rs']=="0"){
												$revenue_share = $value['cc'] *  (int)$product_ppr*(1-((int)$rate/100));
											}else{
												$revenue_share = round($net_sales/100*$value['product_rs']);
											}
										?>
									<tr class="nowrap text-right">
										<input type="hidden" name="platform_code[]" value="<?=$value['product_platform']?>">
										<td class="px-1 text-center"><span class="product_code dd <?=$text_class?>"><?=$value['product_code']?></span></td>
										<td class="px-1"><span class="product_nm_en <?=$text_class?>"><?=$value['product_name_en']?></span></td>
										<td class="px-1 text-center">
											<div class="input-group">
												<input type="text" name="balence[]" class="form-control text-end font-12 px-1" maxlength="2">
												<span class="input-group-text font-12" id="balence_percent">%</span>
											</div>
										</td>
										<td class="px-1 text-center"><span class="rate <?=$text_class?>"><?=$rate?></span>%</td>
										<td class="px-1 text-center"><span class="payment_gateway <?=$text_class?>"><?=$value['settlekind']?></span></td>
										<td class="px-1 text-center">
											<div class="form-inline">
												<input type="text" name="goods_srp[]" value="<?=number_format($value['product_srp'],0)?>" class="form-control text-end font-12">
												<input type="hidden" name="goods_ppr[]" value="<?=number_format($value['product_ppr'],0)?>" class="form-control text-end font-12">
											</div>
										</td>
										<td class="px-1 text-end"><span class="sales_price <?=$text_class?>"><?=number_format($value['price'],0)?></span></td>
										<td class="font-num text-center"><div class="form-inline"><input type="text" name="order_srp[]" value="<?=number_format($value['order_srp'],0)?>" class="form-control  text-end font-12 px-1"></div></td>
										<td class="px-1 text-end"><span class="gross_units_sold <?=$text_class?>"><?=number_format($value['cc'],0)?></span></td>
										<td class="px-1 text-end"><span class="gross_sales_in_vat <?=$text_class?>"><?=number_format($gross_sales_in_vat,0)?></span></td>
										<td class="px-1 text-end"><span class="gross_sales_ex_vat <?=$text_class?>"><?=number_format($gross_sales_ex_vat,0)?></span></td>
										<td class="px-1 text-end"><span class="payment_gateway_fee <?=$text_class?>"><?=number_format($payment_fee,0)?></span></td>
										<td class="px-1 text-end"><span class="net_sales <?=$text_class?>"><?=number_format($net_sales,0)?></span></td>
										<td class="px-1 text-center">
											<div class="input-group">
												<input type="text" name="revenue[]" value="<?=$value['product_rs']?>" class="form-control text-end font-12" maxlength="2">
												<span class="input-group-text font-12" id="revenue_percent">%</span>
											</div>
										</td>
										<td class="px-1 text-end"><span class="revenue_share <?=$text_class?>"><?=number_format($revenue_share,0)?></span></td>
										<td class="px-1 text-center"><button class="btn btn-sm btn_edit font-12" data-productcode="<?=$value['product_code']?>">수정</button></td>
									</tr>
									<?	$sum_cc += $value['cc'];
											$sum_gross_sales_in_vat +=$gross_sales_in_vat;
											$sum_gross_sales_ex_vat +=$gross_sales_ex_vat;
											$sum_payment_fee+=$payment_fee;
											$sum_net_sales+=$net_sales;
											$sum_revenue_share+=$revenue_share;
										}
									?>
								</tbody>
								<tfoot class="table-light font-13">
								<tr class="nowrap">
									<th colspan="8" class="font-num text-center total">total</th>
									<th class="text-end px-1"><?=number_format($sum_cc,0)?></th>
									<th class="text-end px-1"><?=number_format($sum_gross_sales_in_vat,0)?></th>
									<th class="text-end px-1"><?=number_format($sum_gross_sales_ex_vat,0)?></th>
									<th class="text-end px-1"><?=number_format($sum_payment_fee,0)?></th>
									<th class="text-end px-1"><?=number_format($sum_net_sales,0)?></th>
									<th class=""></th>
									<th class="text-end px-1"><?=number_format($sum_revenue_share,0)?></th>
									<th class=""></th>
								</tr>
								<tr>
									<td colspan="11"></td>
									<th class="text-end" colspan="3">Royalty payable (<?=$currency_converter?>)</th>
									<td class="text-end px-1"><span class="fw-bold"><?=$current_bul?> <?=number_format($sum_revenue_share*$royalty,2)?></span></td>
									<th class=""></th>
								</tr>
								</tfoot>
							</table>
						</div>
					</div>
				</div>
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	var report_term = "<?=$search_report_term?>";
	if(report_term=="M"){
		$("#choice_month_term").hide();
		$("#choice_month").show();
	}else{
		$("#choice_month_term").show();
		$("#choice_month").hide();
	}
	
	$("input[name='search_report_term']").bind("click",function(){
		 var search_report_term = $('input:radio[name="search_report_term"]:checked').val();
		 if(search_report_term=="M"){
			$("#choice_month_term").hide();
			$("#choice_month").show();
		 }else{
			$("#choice_month_term").show();
			$("#choice_month").hide();
		 }
	 });
	 
	 $("#btn_report").bind("click",function(){
		var $form = $('<form></form>');
		$form.attr('action', './report_ps.php');
		$form.attr('method', 'post');
		//$form.attr('target', 'ifrmProcess');
		$form.appendTo('body');

		var publisher = $('#publisher_code option:selected').text();
		var publisher_code = $('#publisher_code option:selected').val();
		var report_date = $('#report_date').val();
		var currency_converter = $('#currency_converter option:selected').val();
		var account_fee = $('#account_fee').val();
		var card_fee = $('#card_fee').val();
		var mobile_fee = $('#mobile_fee').val();
		var royalty = $("#royalty").val();
		var royalty_info = $("#royalty_info").val();
		var search_year = $('#search_year option:selected').val();
		var search_month = $('input:radio[name="search_month"]:checked').val();
		var search_month_term = $('input:radio[name="search_month_term"]:checked').val();
		var report_term = "<?=$search_report_term?>";
		var report_month = "";

		if(report_term=="T"){
			report_month = search_month_term;
		}else{
			report_month = search_month;
		}

		var listArray =[];
		var unit_sold;
		$('#listTable tbody tr').each(function(index,value){
			   listArray.push({
				"product_code" : $(".product_code").eq(index).text(),
				"product_nm_en" : $(".product_nm_en").eq(index).text(),
				"platform_code" : $("input[name='platform_code[]']").eq(index).val(),
				"balence" : $("input[name='balence[]']").eq(index).val(),
				"rate" : $(".rate").eq(index).text(),
				"payment_gateway" : $(".payment_gateway").eq(index).text(),
				"publisher_srp" : uncomma($("input[name='goods_srp[]']").eq(index).val()),
				"sales_price" : uncomma($(".sales_price").eq(index).text()),
				"publisher_price" : uncomma($("input[name='order_srp[]']").eq(index).val()),
				"product_cost" : uncomma($("input[name='goods_ppr[]']").eq(index).val()),
				"gross_units_sold" : uncomma($(".gross_units_sold").eq(index).text()),
				"gross_sales_in_vat" : uncomma($(".gross_sales_in_vat").eq(index).text()),
				"gross_sales_ex_vat" : uncomma($(".gross_sales_ex_vat").eq(index).text()),
				"payment_gateway_fee" :uncomma($(".payment_gateway_fee").eq(index).text()),
				"net_sales" : uncomma($(".net_sales").eq(index).text()),
				"revenue" : $("input[name='revenue[]']").eq(index).val(),
				"revenue_share" : uncomma($(".revenue_share").eq(index).text())
			  });
		});
		console.log(publisher_code);
		console.log(search_year);
		console.log(search_month);
		console.log(listArray);
		//return false;

		var mode = $('<input type="hidden" name="mode" value="report_register">');
		var report_term_input = $('<input type="hidden" name="report_term" value="'+report_term+'">');
		var currency_converter_input = $('<input type="hidden" name="currency_converter" value="'+currency_converter+'">');
		var account_fee_input = $('<input type="hidden" name="account_fee" value="'+account_fee+'">');
		var card_fee_input = $('<input type="hidden" name="card_fee" value="'+card_fee+'">');
		var mobile_fee_input = $('<input type="hidden" name="mobile_fee" value="'+mobile_fee+'">');
		var royalty_input = $('<input type="hidden" name="royalty" value="'+royalty+'">');
		var royalty_info_input = $('<input type="hidden" name="royalty_info" value="'+royalty_info+'">');
		var search_year = $('<input type="hidden" name="search_year" value="'+search_year+'">');
		var search_month = $('<input type="hidden" name="search_month" value="'+report_month+'">');

		var publisher_code = $('<input type="hidden" name="publisher_code" value="'+publisher_code+'">');
		var report_data = $('<textarea name="report_data" style="display:none">"'+JSON.stringify(listArray)+'"</textarea>');

		$form.append(mode).append(currency_converter_input).append(account_fee_input).append(card_fee_input).append(mobile_fee_input).append(royalty_input).append(royalty_info_input).append(search_year).append(search_month).append(publisher_code).append(report_data).append(report_term_input);
		$form.submit();
		//
		//return;
  });

	$("#btn_sales_sync").bind("click",function(){
		var publisher_code = $('#publisher_code option:selected').val();
		var search_year = $('#search_year option:selected').val();
		var search_month = $('input:radio[name="search_month"]:checked').val();

		if(!publisher_code){
			alert("파트너를 선택하세요.");
			return;
		}

		if(publisher_code!="" && search_year!="" && search_month!=""){
			$.ajax({
				 type: "POST",
				 url: "report_ps.php",
				 data: {mode:'report_batch',publisher_code:publisher_code,search_year:search_year,search_month:search_month},
				 success: function (data, status) {
					location.reload();
					//console.log(data);
					//alert(data);
					//location.href='sales_list.php?search_year='+search_year+"&search_month="+search_month+"&publisher_code="+publisher_code;
				 },
				error: function(data){
					alert(data);
				}
			});
		}
	});

	$("#btn_refund_sync").bind("click",function(){
		var publisher_code = $('#publisher_code option:selected').val();
		var search_year = $('#search_year option:selected').val();
		var search_month = $('input:radio[name="search_month"]:checked').val();

		if(!publisher_code){
			alert("퍼블리셔를 선택하세요.");
			return;
		}

		if(publisher_code!="" && search_year!="" && search_month!=""){
			$.ajax({
				 type: "POST",
				 url: "report_ps.php",
				 data: {mode:'refund_batch',publisher_code:publisher_code,search_year:search_year,search_month:search_month},
				 success: function (data, status) {
					location.reload();
					//console.log(data);
					//alert(data);
					//location.href='refund_list.php?search_year='+search_year+"&search_month="+search_month+"&publisher_code="+publisher_code;
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}
	});
	

	$(".btn_edit").bind("click",function(){
		var index = $(".btn_edit").index(this);
		var product_code =  $(".btn_edit").eq(index).attr("data-productcode");
		var revenue = $("input[name='revenue[]']").eq(index).val();
		var goods_srp = uncomma($("input[name='goods_srp[]']").eq(index).val());
		var publisher_price = uncomma($("input[name='order_srp[]']").eq(index).val());
		var sales_price = uncomma($(".sales_price").eq(index).text());

		$.ajax({
			 type: "POST",
			 url: "report_ps.php",
			 data: {mode:'revenue_edit',product_code:product_code,revenue:revenue,goods_srp:goods_srp,publisher_price:publisher_price,sales_price:sales_price},
			 success: function (data, status) {
				 // alert(data);
				 location.reload();
			 }
		});
	});
	
	function uncomma(str) {
		str = String(str);
		var minus = str.substring(0, 1);
		
		str = str.replace(/[^\d]+/g, '');
		
		if(minus == "-") str = "-"+str;
		
		return str;
	}
});
</script>
</body>
</html>