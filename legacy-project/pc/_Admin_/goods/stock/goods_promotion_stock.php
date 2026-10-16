<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title="할인 프로모션 재고현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$productTypeCd = filter_input(INPUT_GET, 'productTypeCd', FILTER_SANITIZE_STRING);
$assetTypeCd = filter_input(INPUT_GET, 'assetTypeCd', FILTER_SANITIZE_STRING);
$platformCd = filter_input(INPUT_GET, 'platformCd', FILTER_SANITIZE_STRING);
$publisherCd = filter_input(INPUT_GET, 'publisherCd', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);

$selected['productTypeCd'][$productTypeCd] ="selected";
$selected['assetTypeCd'][$assetTypeCd] ="selected";
$selected['platformCd'][$platformCd] ="selected";
$selected['publisherCd'][$publisherCd] ="selected";
$selected['search_key'][$search_key] ="selected";

if(!$page){
	$page=1;
}

$where = [];
$param = "";

if($search_key==""){
	$search_key="search_name";
}

if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " (a.product_name like '%".$search_value."%' or a.product_name_en like '%".$search_value."%')";
		break;
		case "search_product_code":
			$where[] = " a.product_code='".$search_value."'";
		break;
		case "search_asset_id":
			$where[] = " b.asset_id ='".$search_value."'";
		break;
		case "search_asset_name":
			$where[] = " b.asset_name like '%".$search_value."%'";
		break;
	}
}

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);
	$adminGoods= new AdminGoods($conn);

	$where[] = " a.status='0'";

	if(isset($publisherCd) && $publisherCd<>""){
		$where[] = " b.item_publisher ='".$admin->getAssetCodeInfo($publisherCd)."'";
	}

	if(isset($assetTypeCd) && $assetTypeCd<>""){
		$where[] = " b.item_type ='".$admin->getAssetCodeInfo($assetTypeCd)."'";
	}

	if(isset($productTypeCd) && $productTypeCd<>""){
		$where[] = " b.asset_type ='".$admin->getAssetCodeInfo($productTypeCd)."'";
	}

	if(isset($platformCd) && $platformCd<>""){
		$where[] = " b.item_platform ='".$admin->getAssetCodeInfo($platformCd)."'";
	}


	$orderby = "stock asc,item_name asc";

	$add_where = "";
	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	$goods_option_list = $adminGoods->getGoodsPromotionStockList($page,$add_where,$orderby,$param,'30');


	$asset_publisher =$admin->getAssetCodeList('PUBL');
	$asset_platform =$admin->getAssetCodeList('PLFM');
	$product_type =$admin->getAssetCodeList('PDTP');
	$asset_type =$admin->getAssetCodeList('ASTP');

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
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">재고관리</a></li>
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
						<h5 class="card-header bg-secondary text-white">할인 프로모션 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<input type="hidden" id="page" name="page" value="<?=$page?>">
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_name" <?=$selected['search_key']['search_name']?>>옵션상품명</option>
												<option value="search_product_code" <?=$selected['search_key']['search_product_code']?>>옵션상품명코드</option>
												<option value="search_asset_id" <?=$selected['search_key']['search_asset_id']?>>Asset ID</option>
												<option value="search_asset_name" <?=$selected['search_key']['search_asset_name']?>>Asset 이름</option>
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="publisherCd" class="col-sm-4 col-form-label bg-light border">Asset 공급처</label>
											<div class="col-sm-8">
												<select class="form-select select2" name="publisherCd" id="publisherCd" data-toggle="select2">
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
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="text-center">
											<button type="submit" class="btn btn-primary shadow-none">옵션상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12 mb-1 font-12">* 에셋 서버 실시간이 아닌 <strong>동기화된 재고</strong>입니다. [저재고 동기화]는 재고 30 미만 품목만 갱신합니다.</div>
				</div>

				<div class="row">
					<div class="col-12 mb-2">
						<div class="float-start">총 <strong id="total" class="text-danger"><? echo number_format($goods_option_list->total_results)?> </strong> 개</div>
						<div class="float-end">
							<button type="button" class="btn btn-danger btn-sm shadow-none" id="btn_stock_batch" title="재고 30 미만(저재고) 품목만 에셋 서버와 동기화합니다.">저재고 동기화</button>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-sm table-centered table-bordered mb-0">
							<colgroup>
								<col width="5%"/>
								<col width="15%"/>
								<col width="7%"/>
								<col width="20%"/>
								<col width="8%"/>
								<col width="8%"/>
								<col width="15%"/>
								<col width="6%"/>
								<col width="12%"/>
							</colgroup>
							<thead class="table-dark font-13">
								<tr>
									<th class="text-center">옵션상품코드</th>
									<th class="text-center">옵션상품명</th>
									<th class="text-center">Asset ID</th>
									<th class="text-center">Asset 이름</th>
									<th class="text-center">Asset 유형</th>
									<th class="text-center">Asset 플랫폼</th>
									<th class="text-center">Asset 공급처</th>
									<th class="text-center">재고</th>
									<th class="text-center">비고</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
						<?
							if($goods_option_list->success == true){
								$result = $goods_option_list->resultset->fetchAll();

								foreach($result as $value){
						?>
						<tr>
							<td class="text-center"><?=$value['product_code']?></td>
							<td>
								<?=$value['product_name']?>
								<?=$admin->getProductStatus($value['status'])?>

								<span class="badge bg-success font-11"><?=($value['soldout']=="Y"?"품절":"")?></span>
							</td>
							<td class="text-center"><?=$value['item_id']?></td>
							<td class="text-start"><?=$value['item_name']?></td>
							<td class="text-center"><?=$value['item_type']?></td>
							<td class="text-center"><?=$value['item_platform']?></td>
							<td class="text-center"><?=$value['item_publisher']?></td>
							<td class="text-end"><?=number_format($value['stock'])?></td>
							<td class="text-center">
								<?=$value['update_date']?><br/>
							<button type="button" class="btn btn-outline-dark btn-sm btn_stock_chk" data-idx="<?=$value['item_id']?>">재고확인</button>
							</td>
						</tr>
						<?
								}
							}
						?>
						</tbody>
						</table>

						<div class="text-center mt-3"><?echo $goods_option_list->links_html;?></div>
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->
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
$(document).ready(function () {
	$(".btn_stock_chk").bind("click",function(){
		LoadingOverlay("show");
		var index = $(".btn_stock_chk").index(this);
		var asset_id=$(".btn_stock_chk").eq(index).attr("data-idx");

		$.ajax({
			 type: "POST",
			 url: "asset_stock_ps.php",
			 data: {mode:"stock_chk",asset_id:asset_id},
			 success: function (data, status) {
				//alert(data);
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 },
			complete: function(){ LoadingOverlay("hide"); }
		});
	});

	// 저재고 동기화
	$('#btn_stock_batch').bind("click",function () {
		LoadingOverlay("show");
		$.ajax({
			'url': 'asset_stock_ps.php',
			'type': 'POST',
			'data':{mode:"stock_chk_batch",thr:"30"},
			'success': function (data) {
				//alert(data);
				location.reload();
			},
			'error':function(data){
				alert(data);
			},
			'complete':function(){ LoadingOverlay("hide"); }
		});
	});
});
</script>
</body>
</html>
