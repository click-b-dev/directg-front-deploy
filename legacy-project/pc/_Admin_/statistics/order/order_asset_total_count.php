<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['statistics'] = "active";
$page_title="Asset 누적 주문현황";

$publisherCd = filter_input(INPUT_GET, 'publisherCd', FILTER_SANITIZE_STRING);
$assetTypeCd = filter_input(INPUT_GET, 'assetTypeCd', FILTER_SANITIZE_STRING);
$productTypeCd = filter_input(INPUT_GET, 'productTypeCd', FILTER_SANITIZE_STRING);
$search_asset_name = filter_input(INPUT_GET, 'search_asset_name', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);


if(!$page){
	$page=1;
}

$where = [];

if(isset($search_asset_name) && $search_asset_name<>""){
	$where[] = " a.asset_name like '".$search_asset_name."%'";
}

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";



try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	
	$admin= new Admin($conn); 
	
	if(isset($publisherCd) && $publisherCd<>""){
		$where[] = " a.publisher ='".$admin->getAssetCodeInfo($publisherCd)."'";
	}
	
	if(isset($assetTypeCd) && $assetTypeCd<>""){
		$where[] = " a.assetType ='".$admin->getAssetCodeInfo($assetTypeCd)."'";
	}
	
	if(isset($productTypeCd) && $productTypeCd<>""){
		$where[] = " a.productType ='".$admin->getAssetCodeInfo($productTypeCd)."'";
	}
	
	foreach($where as $value){
		$add_where.= " and ".$value;
	}
	
	$asset_order_count = $admin->getOrderAssetTotalCount($page,$add_where,$orderby,$param,'30');
	
	$asset_publisher =$admin->getAssetCodeList('PUBL');
	$asset_type =$admin->getAssetCodeList('ASTP');
	$product_type =$admin->getAssetCodeList('PDTP');

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['publisherCd'][$publisherCd] ="selected";
$selected['assetTypeCd'][$assetTypeCd] ="selected";
$selected['productTypeCd'][$productTypeCd] ="selected";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Asset 주문 분석</a></li>
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
									<div class="col-lg-3">
										<div class="row">
											<label for="search_asset_name" class="col-sm-3 col-form-label bg-light border">Asset 이름</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_asset_name" name="search_asset_name" placeholder="Asset 이름" value="<?=$search_asset_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="publisherCd" class="col-sm-4 col-form-label bg-light border">Asset 공급처</label>
											<div class="col-sm-8">
												<select class="form-select" name="publisherCd" id="publisherCd">
												<option value="">::: Asset 공급처 선택 :::</option>
												<?
													foreach($asset_publisher as $value){
												?>
												<option value="<?=$value['code_id']?>" <?=$selected['publisherCd'][$value['code_id']]?>><?=$value['name']?></option>
												<?
													}
												?>
											</select>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="assetTypeCd" class="col-sm-4 col-form-label bg-light border">Asset 형식</label>
											<div class="col-sm-8">
												<select id="assetTypeCd" name="assetTypeCd" class="form-select">
													<option value="">::: Asset 형식 선택 :::</option>
													<?
														foreach($asset_type as $value){
													?>
													<option value="<?=$value['code_id']?>" <?=$selected['assetTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="productTypeCd" class="col-sm-4 col-form-label bg-light border">Asset 유형</label>
											<div class="col-sm-8">
												<select class="form-select" name="productTypeCd" id="productTypeCd">
												<option value="">::: Asset 유형 선택 :::</option>
												<?
													foreach($product_type as $value){
												?>
												<option value="<?=$value['code_id']?>" <?=$selected['productTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
												<?
													}
												?>
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
							</div> 
						</div> 
						
						<div class="d-flex flex-row justify-content-between mb-2">
							<div class="float-start"><? echo number_format($asset_order_count->total_results)?> 개</div>
						</div>
						
						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center">Asset Publisher</th>
										<th class="text-center">Asset ID</th>
										<th class="text-center">Asset Name</th>
										<th class="text-center">Product Type</th>
										<th class="text-center">Asset Type</th>
										<th class="text-center">Asset Platform</th>
										<th class="text-center">주문수량</th>
										<th class="text-center">재고수량</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?
									if($asset_order_count->success == true){
										$result = $asset_order_count->resultset->fetchAll();
										foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$value['publisher']?></td>
										<td class="text-center"><?=$value['asset_id']?></td>
										<td><?=$value['asset_name']?></td>
										<td class="text-center"><?=$value['productType']?></td>
										<td class="text-center"><?=$value['assetType']?></td>
										<td class="text-center"><?=$value['platform']?></td>
										<td class="text-end"><?=number_format($value['total_count'])?></td>
										<td class="text-end"><?=number_format($value['stock'])?></td>
									</tr>
								<?
											$total_count+=$value['total_count'];
											$total_stock+=$value['stock'];
										}
									}
								?>
								</tbody>
								<tfoot class="table-light">
									<tr>
										<th colspan="3" class="text-center">합계</th>
										<th class="text-end"></td>
										<th class="text-end"></td>
										<th class="text-end"></td>
										<th class="text-end"><?=number_format($total_count)?></th>
										<th class="text-end"><?=number_format($total_stock)?></td>
									</tr>
								</tfoot>
							</table>
						</div>
						<div class="text-center mt-3"><?echo $asset_order_count->links_html;?></div>
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_order_batch").bind("click",function(){
		var index = $(".btn_order_batch").index(this);
		var ord_ymd = $(".btn_order_batch").eq(index).attr("data-date");
		var search_year = $(".btn_order_batch").eq(index).attr("data-year");
		$.ajax({
			 type: "POST",
			 url: "order_count_batch.php",
			 data: {mode:"batch_day",search_year:search_year,ord_ymd:ord_ymd},
			 success: function (data, status) {
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
