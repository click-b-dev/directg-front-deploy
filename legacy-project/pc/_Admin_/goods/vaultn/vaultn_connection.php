<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Vaultn 퍼블리셔 현황";

$vaultn = new Vaultn();
$result = $vaultn->runConnections();
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
							<h4 class="page-title">Connection V2(Returns a collection of connections)</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<div class="table-responsive">
									<table class="table table-centered w-100 table-sm table-bordered" id="">
										<thead class="table-dark font-13">
											<tr>
												<th class="text-center" style="width: 270px;">connectionGuid<br/>(created)</th>
												<th class="text-center" style="width: 120px;">catalogSharingEnabled</th>
												<th class="text-center" style="">connectedOwner</th>
											</tr>
										</thead>
										<tbody>
										<?
											foreach($result as $value){
										?>
											<tr>
												<td class="text-center font-12"><a href="vaultn_connection_product.php?connectionGuid=<?=$value->guid?>"><?=$value->guid?></a><br/>(<?=$value->created?>)</td>
												<td class="text-center p-0 font-12"><?=$value->catalogSharingEnabled?></td>
												<td class="text-center p-1 font-12">
													<table class="table table-centered w-100 table-sm table-bordered" id="">
														<thead class="table-light font-12">
															<tr>
																<th class="text-center" style="width:200px">imageUrl</th>
																<th class="text-center">name</th>
																<th class="text-center">companyName</th>
																<th class="text-center">guid</th>
																<th class="text-center">country</th>
																<th class="text-center">timezone</th>
																<th class="text-center">defaultCurrencyCode</th>
															</tr>
														</thead>
														<tbody class="font-12">
														<tr>
															<td class="text-center"><img src="<?=$value->connectedOwner->imageUrl?>" class="img-thumbnail"></td>
															<td class="text-center"><?=$value->connectedOwner->name?></td>
															<td class="text-center"><?=$value->connectedOwner->companyName?></td>
															<td class="text-center"><?=$value->connectedOwner->guid?></td>
															<td class="text-center"><?=$value->connectedOwner->country?></td>
															<td class="text-center"><?=$value->connectedOwner->timezone?></td>
															<td class="text-center"><?=$value->connectedOwner->defaultCurrencyCode?></td>
														</tr>
														</tbody>
													</table>
												</td>
											</tr>
											<tr>
												<td colspan="3"><a href="vaultn_connection_promotion.php?connectionGuid=<?=$value->guid?>">프로모션 바로가기</a></td>
											</tr>
											<?
												}
											?>
										</tbody>
									</table>
								</div>
							</div>
							<!-- end card-body-->
						</div>
						<!-- end card-->
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
