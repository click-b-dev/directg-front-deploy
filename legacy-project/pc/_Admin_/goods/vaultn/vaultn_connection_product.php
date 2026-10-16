<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Vaultn 카탈로그 동기화";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$connectionGuid = filter_input(INPUT_GET, 'connectionGuid', FILTER_SANITIZE_STRING);

if($page==""){
	$page=1;
}

$vaultn = new Vaultn();
$result = $vaultn->runConnectionProduct($connectionGuid,$page);

// 페이징 계산
$pageSize = 20;
$totalCount = $result->count;
$totalPages = (int)ceil($totalCount / $pageSize);

// 표시할 페이지 범위 (앞뒤 5페이지)
$startPage = max(1, $page - 5);
$endPage   = min($totalPages, $page + 5);

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
							<h4 class="page-title">ConnectionProduct v3 (Retrieve all products by connection)</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div>총: <?=number_format($result->count)?></div>

						<div class="d-flex flex-row mb-3">
							<?
								for($i=1;$i<=ceil($result->count/20);$i++){
									echo "<div class='pe-3'><button class='btn btn-outline-secondary btn-sm btn_vaultn_sync' data-page='".$i."' data-connectionGuid='".$connectionGuid."'>".$i." 동기화</button></div>";
								}
							?>
						</div>
						<div class="table-responsive">
							<?
								$num=1;
								foreach($result->payload as $key=>$value){
									//print_r($value);
							?>
							<table class="table table-centered w-100 table-sm table-bordered caption-top" id="">
								<tbody class="table-light">
									<tr>
										<th class="table-dark text-center font-12">guid</th>
										<td class="text-start font-12"><?=$value->guid?></td>
									</tr>
									<tr>
										<th class="table-dark text-center font-12">title</th>
										<td class="text-start font-12"><?=$value->title?></td>
									</tr>
									<tr>
										<th class="table-dark text-center font-12">publisher</th>
										<td class="text-start font-12"><?=$value->publisher?></td>
									</tr>
									<tr>
										<th class="table-dark text-center font-12">edition</th>
										<td class="text-start font-12"><?=$value->edition?></td>
									</tr>
									<tr>
										<th class="table-dark text-center font-12">franchise</th>
										<td class="text-start font-12"><?=$value->franchise?></td>
									</tr>
									<tr>
										<th class="table-dark text-center font-12">productType</th>
										<td class="text-start font-12"><?=$value->productType?></td>
									</tr>
									<tr>
										<th class="table-dark text-center font-12">skus</th>
										<td class="text-start font-12">
											<?
												foreach($value->skus as $skus){
											?>
											<table class="table table-centered w-100 table-sm table-bordered">
												<tbody class="table-light">
												<tr>
													<th class="table-dark">sku</th>
													<td><?=$skus->sku?></td>
												</tr>
												<tr>
													<th class="table-dark">provider</th>
													<td><?=$skus->provider?></td>
												</tr>
												<tr>
													<th class="table-dark">regionCode</th>
													<td><?=$skus->regionCode?></td>
												</tr>
												<tr>
													<th class="table-dark">prices</th>
													<td>
														<?
															foreach($skus->prices as $prices){
														?>
														<table class="table table-centered w-100 table-sm table-bordered">
															<tbody class="table-light">
															<tr>
																<th class="table-dark">priceListGuid</th>
																<td><?=$prices->priceListGuid?></td>
															</tr>
															<tr>
																<th class="table-dark">srp</th>
																<td><?=$prices->srp?></td>
															</tr>
															<tr>
																<th class="table-dark">purchasePrice</th>
																<td><?=$prices->purchasePrice?></td>
															</tr>
															<tr>
																<th class="table-dark">priceListVAT</th>
																<td><?=$prices->priceListVAT?></td>
															</tr>
															<tr>
																<th class="table-dark">currencyCode</th>
																<td><?=$prices->currencyCode?></td>
															</tr>
															<tr>
																<th class="table-dark">pricePoint</th>
																<td><?=$prices->pricePoint?></td>
															</tr>
															<tr>
																<th class="table-dark">isActivePromotion</th>
																<td><?=$prices->isActivePromotion?></td>
															</tr>
															<tr>
																<th class="table-dark">promotionDetails</th>
																<td>
																	<?
																		foreach($prices->promotionDetails as $promotions){
																	?>
																	<table class="table table-centered w-100 table-sm table-bordered">
																		<tbody class="table-light">
																		<tr>
																			<th class="table-dark">promotionGuid</th>
																			<td><?=$promotions->promotionGuid?></td>
																		</tr>
																		<tr>
																			<th class="table-dark">promotionName</th>
																			<td><?=$promotions->promotionName?></td>
																		</tr>
																		<tr>
																			<th class="table-dark">startDate</th>
																			<td><?=$promotions->startDate?></td>
																		</tr>
																		<tr>
																			<th class="table-dark">endDate</th>
																			<td><?=$promotions->endDate?></td>
																		</tr>
																		<tr>
																			<th class="table-dark">discountedSrp</th>
																			<td><?=$promotions->discountedSrp?></td>
																		</tr>
																		<tr>
																			<th class="table-dark">discountedPurchasePrice</th>
																			<td><?=$promotions->discountedPurchasePrice?></td>
																		</tr>
																		<tr>
																			<th class="table-dark">discountType</th>
																			<td><?=$promotions->discountType?></td>
																		</tr>
																		<tr>
																			<th class="table-dark">discount</th>
																			<td><?=$promotions->discount?></td>
																		</tr>
																			<tr>
																			<th class="table-dark">discountCurrencyCode</th>
																			<td><?=$promotions->discountCurrencyCode?></td>
																		</tr>
																		</tbody>
																	</table>
																	<?
																		}
																	?>
																</td>
															</tr>
															</tbody>
														</table>
														<?}?>
													</td>
												</tr>
												</tbody>
												</table>
											<?
												}
											?>
										</td>
									</tr>
								</tbody>
							</table>
							<?
									$num++;
								}
							?>
						</div>
						<!-- 페이징 -->
						<nav class="mt-3">
							<ul class="pagination pagination-sm justify-content-center flex-wrap">

								<!-- 처음 -->
								<li class="page-item <?= ($page <= 1) ? 'disabled' : '' ?>">
									<a class="page-link" href="?connectionGuid=<?= urlencode($connectionGuid) ?>&page=1">«</a>
								</li>

								<!-- 이전 -->
								<li class="page-item <?= ($page <= 1) ? 'disabled' : '' ?>">
									<a class="page-link" href="?connectionGuid=<?= urlencode($connectionGuid) ?>&page=<?= $page - 1 ?>">‹</a>
								</li>

								<!-- 페이지 번호 -->
								<?php for ($i = $startPage; $i <= $endPage; $i++): ?>
								<li class="page-item <?= ($i == $page) ? 'active' : '' ?>">
									<a class="page-link" href="?connectionGuid=<?= urlencode($connectionGuid) ?>&page=<?= $i ?>"><?= $i ?></a>
								</li>
								<?php endfor; ?>

								<!-- 다음 -->
								<li class="page-item <?= ($page >= $totalPages) ? 'disabled' : '' ?>">
									<a class="page-link" href="?connectionGuid=<?= urlencode($connectionGuid) ?>&page=<?= $page + 1 ?>">›</a>
								</li>

								<!-- 끝 -->
								<li class="page-item <?= ($page >= $totalPages) ? 'disabled' : '' ?>">
									<a class="page-link" href="?connectionGuid=<?= urlencode($connectionGuid) ?>&page=<?= $totalPages ?>">»</a>
								</li>
							</ul>
						</nav>
						<!-- 페이징 끝 -->

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
$(document).ready(function(){
	$(".btn_vaultn_sync").bind("click",function(){
		var index = $(".btn_vaultn_sync").index(this);
		var page = $(".btn_vaultn_sync").eq(index).attr("data-page");
		var connectionGuid = $(".btn_vaultn_sync").eq(index).attr("data-connectionGuid");
		$.ajax({
			 type: "POST",
			 url: "vaultn_sync_batch.php",
			 data: {page:page,connectionGuid:connectionGuid},
			 success: function (data, status) {
				//location.reload();
				console.log(connectionGuid);
				console.log(page);
				console.log(data);
				alert(data);
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
