<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Valutn 카탈로그 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_product_id = filter_input(INPUT_GET, 'search_product_id', FILTER_SANITIZE_STRING);
$search_sku = filter_input(INPUT_GET, 'search_sku', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_product_id){
	$where[] = " productGUID='".$search_product_id."'";
}

if($search_sku){
	$where[] = " sku='".$search_sku."'";
}

if($search_name){
	$where[] = " title  like '%".$search_name."%'";
}

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

//$where[] = " find_in_set(status,'0,1,9')";

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$orderby = "(reservedUnits+networkUnits) asc";

	$adminGoods= new AdminGoods($conn);

	$vaultn_product = $adminGoods->getVaultnProductList($page,$add_where,$orderby,$param);


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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">Vaultn 관리</a></li>
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
						<div class="d-flex flex-row justify-content-between mb-2">
							<div class="float-start"><? echo number_format($vaultn_product->total_results)?> 개</div>
						</div>
					</div>
				</div>

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
												<input type="text" class="form-control form-control-sm" id="search_product_id" name="search_product_id" placeholder="Vaultn ProductID" value="<?=$search_product_id?>">
											</div>
										</div>
									</div>
									<div class="col-3">
										<div class="row g-2">
											<label for="search_sku" class="col-3 col-form-label col-form-label-sm bg-light border">Sku</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_sku" name="search_sku" placeholder="Vaultn Sku" value="<?=$search_sku?>">
											</div>
										</div>
									</div>
									<div class="col-6">
										<div class="row g-2">
											<label for="search_name" class="col-3 col-form-label col-form-label-sm bg-light border">title</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="Valutn Name" value="<?=$search_name?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row g-0 mt-1">
									<div class="col-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary btn-sm shadow-none">Valutn 상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Vaultn Product</h5>
								<div class="table-responsive">
									<table class="table table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
										<thead class="table-light font-14">
											<tr>
												<th class="text-center">No</th>
												<th class="text-center">publisher</th>
												<th class="text-center">productGUID<br/>(sku)</th>
												<th class="text-center">title</th>
												<th class="text-center">provider</th>
												<th class="text-center">regionCode</th>
												<th class="text-center">srp</th>
												<th class="text-center">purchasePrice</th>
												<th class="text-center">stock</th>
												<th class="text-center">동기화날짜</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($vaultn_product->success == true){
											$result = $vaultn_product->resultset->fetchAll();

											$num =0;
											foreach($result as $value){
										?>
											<tr>
												<td class="text-center"><?=$vaultn_product->total_results-($num+($page-1)*30)?></td>
												<td class="text-center"><?=$value['publisher']?></td>
												<td><?=$value['productGUID']?><br/>(<?=$value['sku']?>)</td>
												<td class="text-start"><?=$value['title']?></td>
												<td class="text-center"><?=$value['provider']?></td>
												<td class="text-center"><?=$value['regionCode']?></td>
												<td class="text-end"><?=number_format($value['srp'])?></td>
												<td class="text-end"><?=number_format($value['purchasePrice'],2)?></td>
												<td class="text-end"><?=number_format($value['reservedUnits'])?><br/>(<?=number_format($value['networkUnits'])?>)</td>
												<td class="text-center"><?=$value['batch_date']?><br/>(<?=$value['update_date']?>)</td>
											</tr>
											<?
														$num++;
													}
												}
											?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $vaultn_product->links_html;?></div>
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
</body>
</html>
