<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Genba 상품 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_product_id = filter_input(INPUT_GET, 'search_product_id', FILTER_SANITIZE_STRING);
$search_sku = filter_input(INPUT_GET, 'search_sku', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);
$PreLiveState = filter_input(INPUT_GET, 'PreLiveState', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

if($PreLiveState==""){
	//$PreLiveState="1";
}

$where = [];

$param = "";

if($search_product_id){
	$where[] = " a.ProductID='".$search_product_id."'";
}

if($search_sku){
	$where[] = " a.Sku='".$search_sku."'";
}

if($search_name){
	$where[] = " a.Name Regexp '".$search_name."'";
}

if($search_publisher<>""){
	$where[] = " a.publisher Regexp '".$search_publisher."'";
}

if($PreLiveState<>""){
	$where[] = " a.PreLiveState='".$PreLiveState."'";
}


foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "DigitalReleaseDate desc,ReleaseDate desc";

	$adminGoods= new AdminGoods($conn);

	$genba_product = $adminGoods->getGenbaProductList($page,$add_where,$orderby,$param);

	$genba_publisher = $adminGoods->getGenbaTitlePublisher();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$checked['PreLiveState'][$PreLiveState] = "checked";

/*
Product live state. Possible values:
0 = NO_PRE_LIVE, Product has not been requested to be Approved yet;
1 = LIVE, Pre live check has been approved;
2 = PRE_LIVE_PENDING, Pre live check is in progress;
3 = NO_RELATIONSHIP, No relationship between etailer and publisher;
4 = DECLINED, Pre live has been declined
*/
$PreLiveStateLabel = array(
	"0"=>"NO_PRE_LIVE",
	"1"=>"LIVE",
	"2"=>"PRE_LIVE_PENDING",
	"3"=>"NO_RELATIONSHIP",
	"4"=>"DECLINED",
);

$selected['search_publisher'][$search_publisher] = "selected";
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">Genba 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2 mb-2">
									<div class="col-3">
										<div class="row g-2">
											<label for="search_product_id" class="col-3 col-form-label col-form-label-sm bg-light border">ProductID</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_product_id" name="search_product_id" placeholder="Genba ProductID" value="<?=$search_product_id?>">
											</div>
										</div>
									</div>
									<div class="col-3">
										<div class="row g-2">
											<label for="search_sku" class="col-3 col-form-label col-form-label-sm bg-light border">Sku</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_sku" name="search_sku" placeholder="Genba Sku" value="<?=$search_sku?>">
											</div>
										</div>
									</div>
									<div class="col-6">
										<div class="row g-2">
											<label for="search_name" class="col-3 col-form-label col-form-label-sm bg-light border">Name</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="Genba Name" value="<?=$search_name?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row g-2 mb-2">
									<div class="col-8">
										<div class="row g-2">
											<label for="search_appid" class="col-sm-2 col-form-label col-form-label-sm bg-light border">PreLiveState</label>
											<div class="col-sm-10 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="PreLiveState_0" name="PreLiveState" class="form-check-input" value="0" <?=$checked['PreLiveState']['0']?>>
													<label class="form-check-label" for="PreLiveState_0">NO_PRE_LIVE</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="PreLiveState_1" name="PreLiveState" class="form-check-input" value="1" <?=$checked['PreLiveState']['1']?>>
													<label class="form-check-label" for="PreLiveState_1">LIVE</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="PreLiveState_2" name="PreLiveState" class="form-check-input" value="2" <?=$checked['PreLiveState']['2']?>>
													<label class="form-check-label" for="PreLiveState_2">PRE_LIVE_PENDING</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="PreLiveState_3" name="PreLiveState" class="form-check-input" value="3" <?=$checked['PreLiveState']['3']?>>
													<label class="form-check-label" for="PreLiveState_3">NO_RELATIONSHIP</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="PreLiveState_4" name="PreLiveState" class="form-check-input" value="4" <?=$checked['PreLiveState']['4']?>>
													<label class="form-check-label" for="PreLiveState_4">DECLINED</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-4">
										<div class="row g-2">
											<label for="search_publisher" class="col-3 col-form-label col-form-label-sm bg-light border">Publisher</label>
											<div class="col-9">
												<select name="search_publisher" class="form-select">
													<option value="">:::선택:::</option>
												<?
													foreach($genba_publisher as $publisher){
												?>
													<option value="<?=$publisher['Publisher']?>" <?=$selected['search_publisher'][$publisher['Publisher']]?>><?=$publisher['Publisher']?></option>
												<?
													}
												?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row g-0 mt-1">
									<div class="col-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary btn-sm shadow-none">Genba 상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($genba_product->total_results)?> 개</div>

						<div class="float-end"><button type="button" class="btn btn-info btn-sm shadow-none" id="btn_genba_product_sync">Genba 상품 동기화</button></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Genba 상품 현황</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light font-12">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">ProductID<br/>(Sku)</th>
												<th class="text-center">Name</th>
												<th class="text-center">ReleaseDate<br/>(DigitalReleaseDate)<br/>(EndDate)</th>
												<th class="text-center">PreReleaseDate</th>
												<th class="text-center">Srp</th>
												<th class="text-center">Wsp</th>
												<th class="text-center">EtailerSplit<br/>Percentage</th>
												<th class="text-center">PreLive<br/>State</th>
												<th class="text-center">가격업데이트</th>
												<th class="text-center">동기화</th>
												<th class="text-center">재고확인</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($genba_product->success == true){
											$result = $genba_product->resultset->fetchAll();

											$num=0;

											foreach($result as $value){
												if(strpos($value['BlacklistCountryCodes'],"KR")>0){
													$tr_class="text-danger";
												}else{
													$tr_class="";
												}

												if(strtotime($value['EndDate'])>0){
													$tr_class="text-danger";
												}else{
													$tr_class="";
												}
										?>
											<tr class="<?=$tr_class?>">
												<td class="text-center"><?=$genba_product->total_results-($num+($page-1)*50)?></td>
												<td class="text-center font-12"><?=$value['ProductID']?><br/>(<?=$value['Sku']?>)</td>
												<td class="text-start">
													<?=$value['Name']?>
													<?=$value['IsBundle']?><br/>
													<span class="badge bg-secondary text-light font-12"><?=$value['Publisher']?></span>
													<span class="badge bg-secondary text-light font-12"><?=strtoupper($value['RegionCode'])?></span>
												</td>
												<td class="text-center font-11">
											<?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['ReleaseDate'])))?><br/>
											(<?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['DigitalReleaseDate'])))?>)<br/>
											(<?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['EndDate'])))?>)
											</td>
												<td class="text-center font-11">
													<?if($value['PreReleaseDate']<>'1970-01-01 09:00:00'){?>
													<?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['PreReleaseDate'])))?>
													<?}?>
													<?if($value['PreReleaseDate']<>'1970-01-01 09:00:00' && strtotime('+9 hours',strtotime($value['PreReleaseDate']))-strtotime(date('Y-m-d H:i:s'))<0 && strtotime('+9 hours',strtotime($value['DigitalReleaseDate']))-strtotime(date('Y-m-d H:i:s'))>0){?>
													<br/>(예약판매가능)
													<?}?>
												</td>
												<td class="text-end font-11"><?=number_format($value['Srp'])?></td>
												<td class="text-end font-11"><?=number_format($value['Wsp'],2)?></td>
												<td class="text-end font-11"><?=$value['EtailerSplitPercentage']?></td>
												<td class="text-center font-11">
												<?
														switch($value['PreLiveState']){
															case "0": //NO_PRE_LIVE
																echo $PreLiveStateLabel[$value['PreLiveState']];
																echo "<br/><button type='button' class='btn btn-secondary btn-sm shadow-none btn_prelive_request' data-sku='".$value['Sku']."'>pre-live 요청</button>";
															break;
															case "1": //LIVE
																echo $PreLiveStateLabel[$value['PreLiveState']];
															break;
															case "2": //PRE_LIVE_PENDING
																echo $PreLiveStateLabel[$value['PreLiveState']];
															break;
														}
												?>
												</td>
												<td class="text-center"><button type="button" class='btn btn-sm btn-info shadow-none btn_price_sync font-12' data-productid="<?=$value['ProductID']?>">가격동기화</button></td>
												<td class="text-center"><button type="button" class='btn btn-sm btn-primary shadow-none btn_product_sync font-12' data-sku="<?=$value['Sku']?>">동기화</button></td>
												<td class="text-center">
													<?=($value['StockStatus']=="0"?"<span class='text-danger fw-bold'>품절</span>":"")?><br/>
													<button type="button" class='btn btn-sm btn-success shadow-none btn_stock_sync font-12' data-sku="<?=$value['Sku']?>">재고확인</button>
												</td>
											</tr>
									<?		$num++;
											}
										}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $genba_product->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$("#btn_genba_product_sync").bind("click",function(){
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"product"},
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//개별상품 동기화
	$(".btn_product_sync").bind("click",function(){
		var index = $(".btn_product_sync").index(this);
		var sku = $(".btn_product_sync").eq(index).attr("data-sku");
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"product_sync",sku:sku},
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//개별 타이틀 가격 동기화
	$(".btn_price_sync").bind("click",function(){
		var index = $(".btn_price_sync").index(this);
		var productid = $(".btn_price_sync").eq(index).attr("data-productid");
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"price",productid:productid},
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//재고확인
	$(".btn_stock_sync").bind("click",function(){
		var index = $(".btn_stock_sync").index(this);
		var sku = $(".btn_stock_sync").eq(index).attr("data-sku");
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"stock",sku:sku},
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//pre-live 요청
	$(".btn_prelive_request").bind("click",function(){
		var index = $(".btn_prelive_request").index(this);
		var sku = $(".btn_prelive_request").eq(index).attr("data-sku");
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"prelive",sku:sku},
			 success: function (data, status) {
				alert(data);
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
