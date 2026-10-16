<?
$sidebar_file = "sidebar_statistics.php";
ini_set( "display_errors", 1 );
$page_title="할인 프로모션 주문통계";
$topmenu['statistics'] = "active";

header('Content-Type: text/html; charset=UTF-8');

error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
$search_game_type = filter_input(INPUT_GET, 'search_game_type', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);
$search_supplier_code = filter_input(INPUT_GET, 'search_supplier_code', FILTER_SANITIZE_STRING);
$search_start = filter_input(INPUT_GET, 'search_start', FILTER_SANITIZE_STRING);
$search_end = filter_input(INPUT_GET, 'search_end', FILTER_SANITIZE_STRING);
$search_count_yn = filter_input(INPUT_GET, 'search_count_yn', FILTER_SANITIZE_STRING);

$page  = isset($page) ? (int) $page : 1;


$where = [];

//$where[] = "promotion_start<'".date('Y-m-d H:i:s')."' and promotion_end<'".date('Y-m-d H:i:s')."'";
$where[] = "promotion_end<'".date('Y-m-d H:i:s')."' ";


if(isset($search_game_type) && $search_game_type<>""){
	$where[] = " b.game_type ='".$search_game_type."'";
}

if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = "  (b.product_name like '%".$search_value."%' or b.product_name_en like '%".$search_value."%')";
		break;
		case "search_product_code":
			$where[] = " a.product_code ='".$search_value."'";
		break;
	}
}

if(isset($search_start) && $search_start<>""){
	$where[] = " a.promotion_start >='".$search_start."'";
}else{
	$search_start = "";
}

if(isset($search_end) && $search_end<>""){
	//날짜만 입력된 경우 해당일 끝(23:59:59)까지 포함
	$search_end_val = (strlen($search_end)<=10) ? $search_end." 23:59:59" : $search_end;
	$where[] = " a.promotion_end <='".$search_end_val."'";
}else{
	$search_end = "";
}

if(isset($search_supplier_code) && $search_supplier_code<>""){
	$where[] = " a.publisher_code ='".$search_supplier_code."'";
}

//집계 여부 (Y:집계됨=order_count 존재 / N:미집계=order_count NULL)
if($search_count_yn=="Y"){
	$where[] = " a.order_count is not null";
}else if($search_count_yn=="N"){
	$where[] = " a.order_count is null";
}

$checked['promotion_gubun'][$promotion_gubun]="checked";
$selected['search_year'][$search_year] = "selected";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

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

	$orderby = "a.promotion_end desc,a.promotion_start desc,a.publisher_code desc";

	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn);

	$promotion_history = $admin->getPromotionHistory($page,$add_where,$orderby,$param);

	//print_r($promotion_history);
	//공급처 목록
	$publisher_data= $admin->getSupplierList();

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_key'][$search_key]="selected";
$selected['search_supplier_code'][$search_supplier_code]="selected";
$selected['search_count_yn'][$search_count_yn]="selected";

$checked['search_game_type'][$search_game_type]="checked";
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
										<li class="breadcrumb-item"><a href="javascript: void(0);">프로모션 분석</a></li>
										<li class="breadcrumb-item active">할인 프로모션 주문통계</li>
									</ol>
								</div>
								<h4 class="page-title">할인 프로모션 주문통계</h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<div class="row g-2">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">할인 프로모션 검색필터</h5>
							<div class="card-body p-2">
								<form class="form-horizontal" method="GET" action="<?=$_SERVER['PHP_SELF']?>" id="searchFrm">
									<div class="row g-2 mb-2">
										<div class="col-lg-5 mb-2">
											<div class="input-group row g-2">
												<select class="form-select col-sm-3" name="search_key" id="search_key">
													<option value="search_name" <?=$selected['search_key']['search_name']?>>옵션상품명</option>
													<option value="search_product_code" <?=$selected['search_key']['search_product_code']?>>옵션상품명코드</option>
												</select>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
												</div>
											</div>
										</div>
										<div class="col-lg-3 mb-2">
											<div class="row">
												<label for="search_product_platform" class="col-sm-4 col-form-labe col-form-label-sm bg-light border">플랫폼</label>
												<div class="col-sm-8">
													<select id="search_product_platform" name="search_product_platform" class="form-select" >
														<option value="">:::선택:::</option>
														<option value="1" <?=$selected['search_product_platform']['1']?>>Steam</option>
														<option value="34" <?=$selected['search_product_platform']['34']?>>Epic</option>
														<option value="30" <?=$selected['search_product_platform']['30']?>>Ubisoft Connect</option>
														<option value="35" <?=$selected['search_product_platform']['35']?>>Rockstar Games Launcher</option>
														<option value="33" <?=$selected['search_product_platform']['33']?>>Bethesda</option>
														<option value="3" <?=$selected['search_product_platform']['3']?>>Orgin</option>
														<option value="32" <?=$selected['search_product_platform']['32']?>>기타</option>
													</select>
												</div>
											</div>
										</div>
										<div class="col-lg-4 mb-2">
											<div class="row">
												<label for="search_supplier_code" class="col-sm-4 col-form-labe col-form-label-sm bg-light border">공급처</label>
												<div class="col-sm-8">
													<select id="search_supplier_code" name="search_supplier_code" class="form-select select2" data-toggle="select2">
														<option value="">:::선택:::</option>
														<?
															foreach($publisher_data as $value){
														?>
														<option value="<?=$value['publisher_code']?>" <?=$selected['search_supplier_code'][$value['publisher_code']]?>><?=$value['publisher_name']?></option>
														<?
															}
														?>
													</select>
												</div>
											</div>
										</div>
									</div>
									<div class="row g-0 mb-2">
										<div class="col-lg-7">
											<div class="row">
												<label for="search_date" class="col-sm-2 col-form-label col-form-label-sm bg-light border">진행기간</label>
												<div class="col-sm-10 pt-1">
													<div class="row">
														<div class="col-sm-3"><input type="text" class="form-control" id="search_start" name="search_start" placeholder="시작일자" value="<?=$search_start?>">
														</div>
														~ 
														<div class="col-sm-3"><input type="text" class="form-control" id="search_end" name="search_end" placeholder="종료일자" value="<?=$search_end?>"></div>
													</div>
												</div>
											</div>
										</div>
										<div class="col-lg-5">
											<div class="row mb-2">
												<label for="search_game_type" class="col-sm-2 col-form-label col-form-label-sm bg-light border">옵션상품 구분</label>
												<div class="col-sm-10 pt-1">
													<div class="form-check form-check-inline">
														<input type="radio" id="search_game_type_game" name="search_game_type" class="form-check-input" value="game" <?=$checked['search_game_type']['game']?>>
														<label class="form-check-label" for="search_game_type_game">게임</label>
													</div>
													<div class="form-check form-check-inline">
														<input type="radio" id="search_game_type_dlc" name="search_game_type" class="form-check-input" value="dlc" <?=$checked['search_game_type']['dlc']?>>
														<label class="form-check-label" for="search_game_type_dlc">DLC</label>
													</div>
													<div class="form-check form-check-inline">
														<input type="radio" id="search_game_type_music" name="search_game_type" class="form-check-input" value="music" <?=$checked['search_game_type']['music']?>>
														<label class="form-check-label" for="search_game_type_music">사운드트랙</label>
													</div>
													<div class="form-check form-check-inline">
														<input type="radio" id="search_game_type_bundle" name="search_game_type" class="form-check-input" value="bundle" <?=$checked['search_game_type']['bundle']?>>
														<label class="form-check-label" for="search_game_type_bundle">번들</label>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="row g-0 mb-2">
										<div class="col-lg-7">
											<div class="row">
												<label for="search_count_yn" class="col-sm-2 col-form-label col-form-label-sm bg-light border">집계 여부</label>
												<div class="col-sm-10 pt-1">
													<div class="row">
														<div class="col-sm-3">
															<select id="search_count_yn" name="search_count_yn" class="form-select">
																<option value="">전체</option>
																<option value="Y" <?=$selected['search_count_yn']['Y']?>>집계됨</option>
																<option value="N" <?=$selected['search_count_yn']['N']?>>미집계</option>
															</select>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="row mb-2">
										<div class="col-lg-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">할인 프로모션 검색</button>
												<button type="reset" class="btn btn-secondary shadow-none">필터 초기화</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					
					<div class="row mb-2">
						<div class="col-12 d-flex justify-content-between align-items-center">
							<span>전체 : <? echo number_format($promotion_history->total_results)?> 건</span>
							<span>
								<span id="bulk_progress" class="text-primary me-2"></span>
								<button type="button" class="btn btn-primary btn-sm shadow-none" id="btn_selected_aggregate">선택 집계</button>
							</span>
						</div>
					</div>
					
					<p class="text-danger mb-1">※ 집계되지 않은 일평균 데이터는 우측 버튼 클릭하면 반영됩니다.</p>
					<p class="text-danger mb-1">※ 집계처리 후 주문취소 건은 반영되지 않은 데이터입니다.</p>
					
					<div class="table-responsive">
						<table class="table table-bordered table-centered w-100  nowrap table-sm">
							<colgroup>
								<col width="15%"/>
								<col width="6%"/>
								<col width="*"/>
								<col width="17%"/>
								<col width="6%"/>
								<col width="6%"/>
								<col width="6%"/>
								<col width="6%"/>
								<col width="5%"/>
								<col width="5%"/>
								<col width="8%"/>
							</colgroup>
							<thead class="table-dark font-13">
							<tr>
								<th class="text-center">공급처</th>
								<th class="text-center">옵션상품코드</th>
								<th class="text-center">옵션상품명</th>
								<th class="text-center">할인프로모션 진행기간</th>
								<th class="text-center">할인프로모션 <br/>진행일수</th>
								<th class="text-center">할인프로모션 <br/>할인가</th>
								<th class="text-center">할인프로모션 <br/>할인율</th>
								<th class="text-center">주문수량</th>
								<th class="text-center">주문금액</th>
								<th class="text-center">일평균</th>
								<th class="text-center">집계<br/><input type="checkbox" class="form-check-input mt-1" id="chk_agg_all" title="미집계 전체선택"></th>
							</tr>
							</thead>
							<tbody class="font-12 bg-white">
							<?
								if($promotion_history->success == true){
									$result = $promotion_history->resultset->fetchAll();

									foreach($result as $value){
										//프로모션 판매현황
										//$sales_data = $admin->getPromotionSales($value['product_code'],$value['promotion_start'],$value['promotion_end']);
										
										//진행예정 시작일> 현재시간 and  종료일 > 현재시간
										//진행중 시작일 <= 현재시간 and 종료일 >= 현재시간
										//종료 시작일 < 현재시간 and 종료일 < 현재시간
										if(strtotime($value['promotion_start'])>time() && strtotime($value['promotion_end'])>time()){
											//echo "진행예정";
											$tr_class="table-active";
											$promotion_status="C";
										}elseif(strtotime($value['promotion_start'])<=time() && strtotime($value['promotion_end'])>=time()){
											//echo "진행중";
											$tr_class="table-active";
											$promotion_status="I";
										}else{
											//echo "종료";
											$tr_class = "";
											$promotion_status="E";
										}
							?>
							<tr class="<?=$tr_class?> ">
								<td class="text-center"><?=$adminGoods->getPublisherName($value['publisher_code'])?></td>
								<td class="text-center"><a href="<?=$document_root?>/statistics/order/order_goods_count.php?search_product_code=<?=$value['product_code']?>&search_year=<?=date('Y',strtotime($value['promotion_start']))?>" target="_blank"><span class="num"><?=$value['product_code']?></span></a></td>
								<td class=""><a href="promotion_report.php?search_key=search_name&search_value=<?=urlencode($value['product_name'])?>"><?=$value['product_name']?></a></td>
								<td class="text-center p-0"><a href="promotion_report.php?search_start=<?=$value['promotion_start']?>&search_end=<?=$value['promotion_end']?>"><span class="num"><?=$value['promotion_start']?> ~ <?=$value['promotion_end']?></span></a></td>
								<td class="text-end">
									<?
										$date1 = strtotime($value['promotion_start']);
										$date2 = strtotime($value['promotion_end']);

										$diff =  $date2 - $date1;

										$event_term = $diff/(60*60)/24;
									?>
									<?=round($event_term,2)?> 일
								</td>
								<td class="text-end"><span class="num"><?=number_format($value['sale_price'])?></span></td>
								<td class="text-end"><span class="text-danger mdi mdi-arrow-down-bold"></span> <span class="text-danger num"><?=$value['discount_rate']?>%</span></td>
								<td class="text-end">
									<?
										if($value['order_count']){
											echo number_format($value['order_count']);
										}
									?>
								</td>
								<td class="text-end"><span class="num"><?=number_format($value['order_price'])?></span></td>
								<td class="text-end">
									<?	if($value['order_count']>0){
												echo round($value['order_count']/$event_term,1);
											}
									?>
								</td>
								<td class="text-center">
									<? if($promotion_status=="E"){?>
										<?if($value['order_count']==""){?>
										<?if(strtotime($value['promotion_end']) <= time()-(7*86400)){?>
											<input type="checkbox" class="form-check-input chk_agg" data-productcode="<?=$value['product_code']?>" data-start="<?=$value['promotion_start']?>" data-end="<?=$value['promotion_end']?>" data-saleprice="<?=$value['sale_price']?>">
										<?}?>
										<?}else{?>
										<button type="button" class="btn btn-secondary btn-sm shadow-none btn_promotion_count_all" data-productcode="<?=$value['product_code']?>" data-start="<?=$value['promotion_start']?>" data-end="<?=$value['promotion_end']?>" data-saleprice="<?=$value['sale_price']?>">재집계</button>
										<?}?>
									<?}?>
								</td>
							</tr>
							<?
									}
								}
							?>
							</tbody>
						</table>
					</div>

					<div class="text-center mt-3"><?echo $promotion_history->links_html;?></div>

				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_promotion_count_all").bind("click",function(){
		var index = $(".btn_promotion_count_all").index(this);
		var product_code = $(".btn_promotion_count_all").eq(index).attr("data-productcode");
		var promotion_start = $(".btn_promotion_count_all").eq(index).attr("data-start");
		var promotion_end =$(".btn_promotion_count_all").eq(index).attr("data-end");
		var sale_price = $(".btn_promotion_count_all").eq(index).attr("data-saleprice");
		$.ajax({
			 type: "POST",
			 url: "promotion_sales_batch.php",
			 data: {mode:"promotion_all_batch",product_code:product_code,promotion_start:promotion_start,promotion_end:promotion_end,sale_price:sale_price},
			 success: function (data) {
				//alert(data);
				location.reload();
				//
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//선택 집계 — 체크된 '미집계' 프로모션만 집계
	$("#btn_selected_aggregate").bind("click",function(){
		var products=[], starts=[], ends=[], prices=[];
		$(".chk_agg:checked").each(function(){
			products.push($(this).attr("data-productcode"));
			starts.push($(this).attr("data-start"));
			ends.push($(this).attr("data-end"));
			prices.push($(this).attr("data-saleprice"));
		});
		if(products.length == 0){ alert("집계할 항목을 선택하세요."); return; }
		if(!confirm(products.length + "건을 집계합니다. 계속할까요?")) return;

		var $btn = $(this).prop("disabled", true);
		$("#bulk_progress").text("집계 중...");
		$.ajax({
			type: "POST",
			url: "promotion_sales_batch.php",
			data: {mode:"promotion_selected_batch", products:products, starts:starts, ends:ends, prices:prices},
			dataType: "json",
			success: function(res){
				alert("집계 완료 : " + res.processed + "건");
				location.reload();
			},
			error: function(){
				$btn.prop("disabled", false);
				$("#bulk_progress").text("");
				alert("집계 중 오류가 발생했습니다.");
			}
		});
	});

	//집계열 헤더 체크박스 — 미집계 전체 선택/해제
	$("#chk_agg_all").change(function(){
		$(".chk_agg").prop("checked", $(this).prop("checked"));
	});
});
</script>
</body>
</html>
