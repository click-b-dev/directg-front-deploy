<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
include_once(__DIR__.'/../pointnexus/_inc.php');   //PointNexus 헬퍼(pn_default_mode 등)

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";
$page_title = "PointNexus 재고확인";

$mode = pn_default_mode();   //PointNexus::DEFAULT_MODE

//매핑된(order_system='10') 판매중(status<>'3') PointNexus 카탈로그만 — 재고 모니터링 대상
try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$stmt = $conn->prepare("select a.productID, a.genericName, a.edition, a.platform, a.publisher,
			count(distinct b.product_code) as map_cnt,
			group_concat(distinct c.product_name order by c.product_name separator ' | ') as mapped_names
		from pointnexus_catalogue a
		inner join tbl_goods_item_delivery b on b.item_id=a.productID and b.order_system='10'
		inner join tbl_goods_item c on c.product_code=b.product_code and c.status<>'3'
		where a.mode=:mode
		group by a.productID
		order by a.genericName asc");
	$stmt->execute(array(':mode'=>$mode));
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
}catch(PDOException $e){
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">PointNexus 재고</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?> <small class="text-muted">매핑·판매중 상품 기준</small></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">
								<div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
									<div>매핑된 판매중 <b class="text-primary"><?=number_format(count($rows))?></b>개 <span class="text-muted font-12">(mode: <?=htmlspecialchars($mode)?>)</span></div>
									<? if($rows){ ?><button type="button" id="btn-check-all" class="btn btn-sm btn-info shadow-none"><i class="mdi mdi-package-variant-closed"></i> 전체 재고 조회</button><? } ?>
								</div>

								<div class="table-responsive">
									<table class="table table-sm table-bordered table-hover align-middle mb-0">
										<thead class="table-light font-13">
											<tr>
												<th class="text-center">#</th>
												<th>상품</th>
												<th class="text-center">플랫폼</th>
												<th class="text-center">퍼블리셔</th>
												<th>매핑 옵션상품</th>
												<th class="text-center">productID</th>
												<th class="text-center">재고</th>
											</tr>
										</thead>
										<tbody class="font-13">
										<? if($rows){ $i=1; foreach($rows as $r){ $pid=$r['productID']; ?>
											<tr>
												<td class="text-center text-muted"><?=$i++?></td>
												<td><?=htmlspecialchars($r['genericName'])?><? if($r['edition']!=""){ ?> <span class="badge bg-secondary fw-normal"><?=htmlspecialchars($r['edition'])?></span><? } ?></td>
												<td class="text-center"><?=htmlspecialchars($r['platform'])?></td>
												<td class="text-center"><?=htmlspecialchars($r['publisher'])?></td>
												<td class="font-12"><?=htmlspecialchars($r['mapped_names'])?><? if($r['map_cnt']>1){ ?> <span class="text-muted">(<?=$r['map_cnt']?>개 옵션)</span><? } ?></td>
												<td class="text-center font-12"><?=htmlspecialchars($pid)?></td>
												<td class="text-center text-nowrap">
													<button type="button" class="btn btn-sm btn-outline-info shadow-none btn-stock-check" data-id="<?=htmlspecialchars($pid)?>" data-mode="<?=htmlspecialchars($mode)?>"><i class="mdi mdi-package-variant-closed"></i> 조회</button>
													<span class="stock-result ms-1"></span>
												</td>
											</tr>
										<? } }else{ ?>
											<tr><td colspan="7" class="text-center text-muted py-3">매핑된 판매중 PointNexus 상품이 없습니다.</td></tr>
										<? } ?>
										</tbody>
									</table>
								</div>

								<p class="font-12 mt-2 mb-0">※ 재고는 각 행의 [조회] 또는 [전체 재고 조회] 클릭 시 PointNexus API로 실시간 조회됩니다(총 수량 · 변이 개수). 벌크 재고 API가 없어 상품별 개별 호출입니다.</p>
							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(function(){
	//재고 지연조회 — goods/pointnexus/pointnexus_stock_check.php 재사용(GET /product/{id}의 stock)
	function checkStock($btn){
		var $result = $btn.siblings('.stock-result');
		$btn.prop('disabled', true);
		$result.text('조회중…');
		return $.ajax({
			url: '../pointnexus/pointnexus_stock_check.php',
			type: 'GET',
			dataType: 'json',
			data: { id: $btn.data('id'), mode: $btn.data('mode') }
		}).then(function(res){
			$btn.prop('disabled', false);
			if(res && res.success){
				var cls  = res.total_qty > 0 ? 'bg-success' : 'bg-danger';
				var html = '<span class="badge '+cls+'">총 '+Number(res.total_qty).toLocaleString()+'개</span>';
				if(res.variants && res.variants.length > 1){
					html += ' <span class="badge bg-light text-dark border">변이 '+res.variants.length+'</span>';
				}
				$result.html(html);
			} else {
				$result.empty().append($('<span class="text-danger">').text(res && res.error ? res.error : '조회 실패'));
			}
		}, function(){
			$btn.prop('disabled', false);
			$result.empty().append($('<span class="text-danger">').text('조회 실패'));
		});
	}

	//행별 조회
	$(document).on('click', '.btn-stock-check', function(){ checkStock($(this)); });

	//전체 조회 — API 부하를 줄이기 위해 순차 호출(한 건 끝나면 다음)
	$('#btn-check-all').on('click', function(){
		var $b = $(this);
		var $all = $('.btn-stock-check');
		var i = 0;
		$b.prop('disabled', true).text('전체 조회중…');
		(function next(){
			if(i >= $all.length){ $b.prop('disabled', false).html('<i class="mdi mdi-package-variant-closed"></i> 전체 재고 조회'); return; }
			checkStock($all.eq(i)).always(function(){ i++; next(); });
		})();
	});
});
</script>
</body>
</html>
