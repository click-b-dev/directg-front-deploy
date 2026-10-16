<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Valutn 상품 조회";



$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$connectionGuid = filter_input(INPUT_GET, 'connectionGuid', FILTER_SANITIZE_STRING);
$productGUID = filter_input(INPUT_GET, 'productGUID', FILTER_SANITIZE_STRING);

if($page==""){
	$page=1;
}

$vaultn = new Vaultn();
$result = $vaultn->runConnectionProductRetrieve($connectionGuid,$productGUID);

//print_r($result);
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Valutn 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title">ConnectionProduct (Retrieve all products by connection)</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100 table-sm table-bordered caption-top" id="">
							<tbody>
								<tr>
									<th class="text-center font-12 bg-light">guid</th>
									<td class="text-start font-12"><?=$result->guid?></td>
								</tr>
								<tr>
									<th class="text-center font-12 bg-light">title</th>
									<td class="text-start font-12"><?=$result->title?></td>
								</tr>
								<tr>
									<th class="text-center font-12 bg-light">publisher</th>
									<td class="text-start font-12"><?=$result->publisher?></td>
								</tr>
								<tr>
									<th class="text-center font-12 bg-light">edition</th>
									<td class="text-start font-12"><?=$result->edition?></td>
								</tr>
								<tr>
									<th class="text-center font-12 bg-light">franchise</th>
									<td class="text-start font-12"><?=$result->franchise?></td>
								</tr>
								<tr>
									<th class="text-center font-12 bg-light">productType</th>
									<td class="text-start font-12"><?=$result->productType?></td>
								</tr>
								<tr>
									<th class="text-center font-12 bg-light">regions</th>
									<td class="text-start font-12">
										<table class="table table-centered">
										<thead>
											<tr>
												<th>RegionCode</th>
												<th>keyProvider</th>
												<th>sku</th>
												<th>prices</th>
												<th>agreements</th>
												<th>country</th>
												<th>salesCountries</th>
											</tr>
										</thead>
										<tbody>
										<?
										if(is_array($result->regions)){
											foreach($result->regions as $sub_key=>$sub_value){
										?>
										<tr>
											<td><?=$sub_value->code?></td>
											<td class="text-center"><?=$sub_value->skus['0']->keyProvider?></td>
											<td><?=$sub_value->skus['0']->sku?></td>
											<td>
												<ol>
												<?
												foreach($sub_value->prices as $prices){
														echo "<li>".$prices->countryCode."/".$prices->currencyCode."/".$prices->amount."/".$prices->purchasePrice."</li>";
												}
												?>
													</ol>
											</td>
											<td><?print_r($sub_value->agreements)?></td>
											<td>
													<ol>
												<?
												foreach($sub_value->regionCountries as $regionCountries){
														echo "<li>".$regionCountries->countryCode."/".$regionCountries->countryName."</li>";
												}
												?>
													</ol>
											</td>
											<td>
												<ol>
													<?
													foreach($sub_value->salesCountries as $salesCountries){
															echo "<li>".$salesCountries->countryCode."/".$salesCountries->countryName."</li>";
													}
													?>
												</ol>
											</td>
										</tr>
										<?
											}
										}
										?>
										</tbody>
										</table>
									</td>
								</tr>

							</tbody>
						</table>
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
</body>
</html>
