<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Genba 가격 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_product_id = filter_input(INPUT_GET, 'search_product_id', FILTER_SANITIZE_STRING);
$search_sku = filter_input(INPUT_GET, 'search_sku', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$param = "";

if($search_product_id){
	$where[] = " a.ProductID='".$search_product_id."'";
}

if($search_sku){
	$where[] = " b.Sku='".$search_sku."'";
}

if($search_name){
	$where[] = " b.Product Regexp '".$search_name."'";
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

	$orderby = "a.ReleaseDate desc,a.DigitalReleaseDate desc";

	$adminGoods= new AdminGoods($conn);

	$genba_price = $adminGoods->getGenbaPriceList($page,$add_where,$orderby,$param);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$checked['promotion_status'][$promotion_status] = "checked";

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
								<div class="row g-2">
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
									<div class="col-3">
										<div class="row g-2">
											<label for="search_name" class="col-3 col-form-label col-form-label-sm bg-light border">Product</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="Genba Product" value="<?=$search_name?>">
											</div>
										</div>
									</div>
									<div class="col-3">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">Genba 상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($genba_price->total_results)?> 개</div>

						<div class="float-end"><button type="button" class="btn btn-info btn-sm shadow-none" id="btn_genba_price_sync">Genba 가격 동기화</button></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Genba 가격 현황 [KRW]</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">Sku</th>
												<th class="text-center">Product</th>
												<th class="text-center">RegionCode</th>
												<th class="text-center">ReleaseDate</th>
												<th class="text-center">Srp</th>
												<th class="text-center">Wsp</th>
												<th class="text-center">IsPromotion</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($genba_price->success == true){
											$result = $genba_price->resultset->fetchAll();

											$num=0;

											foreach($result as $value){
										?>
											<tr>
												<td class="text-center"><?=$genba_price->total_results-($num+($page-1)*20)?></td>
												<td class="text-center"><?=$value['Sku']?></td>
												<td class="text-start"><?=$value['Product']?></td>
												<td class="text-center"><?=strtoupper($value['RegionCode'])?></td>
												<td class="text-center"><?=$value['ReleaseDate']?></td>
												<td class="text-end"><?=number_format($value['Srp'])?></td>
												<td class="text-end"><?=number_format($value['Wsp'],2)?></td>
												<td class="text-center"><?=$value['IsPromotion']?></td>
											</tr>
									<?		$num++;
											}
										}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $genba_price->links_html;?></div>
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
	$("#btn_genba_price_sync").bind("click",function(){
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"price"},
			 success: function (data, status) {
				alert(data);
				location.reload();

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
