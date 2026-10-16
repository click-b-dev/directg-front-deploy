<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "상품 대시보드";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin = new Admin($conn);
	$admin_goods = new AdminGoods($conn);

	//---------------------------------------------------------------
	// 1. 재고 알림 (Asset 기준, 재고 대시보드 메서드 재사용 + 추가)
	//---------------------------------------------------------------
	//1-1. 판매중(status=0) & 품절(soldout=Y) — 전체 (오더시스템 포함)
	$selling_soldout = $conn->query("select a.product_code,a.product_name,b.order_system,b.item_id,
			(select count(*) from tbl_promotion_schedule p where p.product_code=a.product_code and p.confirm='Y' and p.promotion_start<=now() and p.promotion_end>=now()) as promo_active
		from tbl_goods_item a left join tbl_goods_item_delivery b on a.product_code=b.product_code
		where a.status='0' and a.soldout='Y'
		order by promo_active desc, b.order_system asc, a.product_code asc")->fetchAll();

	//1-2. Asset 재고 있는데 품절 처리됨 (soldout=Y, stock>0) — 품절 해제 후보. 판매종료(status=3) 제외
	$stock_soldout = $conn->query("select a.product_code,a.product_name,a.status,b.item_id,b.item_name,b.item_publisher,b.stock,
			(select count(*) from tbl_promotion_schedule p where p.product_code=a.product_code and p.confirm='Y' and p.promotion_start<=now() and p.promotion_end>=now()) as promo_active
		from tbl_goods_item a inner join tbl_goods_item_delivery b on a.product_code=b.product_code
		where a.soldout='Y' and b.order_system='1' and a.status<>'3' and cast(b.stock as unsigned)>0
		order by cast(b.stock as unsigned) desc limit 100")->fetchAll();

	//---------------------------------------------------------------
	// 2. 등록 품질 점검
	//---------------------------------------------------------------
	//판매중인데 판매가 미설정 (무료상품 제외)
	$issue_price = $conn->query("select product_code,product_name from tbl_goods_item
		where status='0' and is_free<>'Y' and (price is null or price=0)
		order by product_code desc limit 100")->fetchAll();
	//판매중 디지털인데 배송시스템(order_system) 미설정 (무료상품 제외)
	$issue_delivery = $conn->query("select a.product_code,a.product_name,a.game_type
		from tbl_goods_item a left join tbl_goods_item_delivery b on a.product_code=b.product_code
		where a.status='0' and a.option_type='digital' and a.is_free<>'Y'
		and (b.order_system is null or b.order_system='')
		order by a.product_code desc limit 100")->fetchAll();

	//---------------------------------------------------------------
	// 3. 프로모션 / 일정
	//---------------------------------------------------------------
	$promo_active = $conn->query("select count(distinct product_code) as cnt from tbl_promotion_schedule
		where confirm='Y' and promotion_start<=now() and promotion_end>=now()")->fetch();
	$promo_upcoming = $conn->query("select count(distinct product_code) as cnt from tbl_promotion_schedule
		where confirm='Y' and promotion_start>now()")->fetch();
	$promo_ending = $conn->query("select count(distinct product_code) as cnt from tbl_promotion_schedule
		where confirm='Y' and promotion_start<=now() and promotion_end between now() and date_add(now(),interval 7 day)")->fetch();
	//프로모션 진행중인데 판매중이 아닌 상품 (status<>0) — 점검 필요
	$promo_notselling = $conn->query("select distinct a.product_code,b.product_name,b.status
		from tbl_promotion_schedule a inner join tbl_goods_item b on a.product_code=b.product_code
		where a.confirm='Y' and a.promotion_start<=now() and a.promotion_end>=now() and b.status<>'0'
		order by a.product_code asc")->fetchAll();
	//출시 임박 예약구매 (판매중 & 예약구매)
	$preorder_list = $conn->query("select a.product_code,a.product_name,a.release_date,a.delivery_date,b.order_system
		from tbl_goods_item a left join tbl_goods_item_delivery b on a.product_code=b.product_code
		where a.status='0' and a.is_preorder='Y'
		order by a.release_date asc limit 30")->fetchAll();

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
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<!-- ====================== 1. 재고 알림 ====================== -->
				<div class="row">
					<div class="col-12">
						<div class="d-flex justify-content-between align-items-center mb-1">
							<h5 class="mb-0"><i class="mdi mdi-package-variant"></i> 재고 알림 <span class="font-12 fw-normal text-muted">(판매종료 제외 · 자동 품절 안 함 · 오른쪽 재고 카드는 Asset 기준)</span></h5>
							<a href="<?=$document_root?>/goods/stock/dashboard_stock.php" class="btn btn-sm btn-dark shadow-none">재고 대시보드</a>
						</div>
					</div>
					<!-- 1-1. 판매중 & 품절 (오더시스템 포함) -->
					<div class="col-lg-6">
						<div class="card border-warning">
							<div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">판매중 &amp; 품절</h5>
								<span class="badge bg-dark text-white"><?=number_format(count($selling_soldout))?> 건</span>
							</div>
							<div class="card-body p-1">
								<table class="table table-sm table-bordered mb-0">
									<thead class="table-light font-12"><tr><th class="text-center">옵션상품코드</th><th>옵션상품명</th><th class="text-center">오더시스템</th></tr></thead>
									<tbody class="font-12">
									<? if($selling_soldout){ foreach(array_slice($selling_soldout,0,15) as $row){ $os=$admin->getOrderSystem($row['order_system']); if(!$os){ $os=($row['order_system']!==null && $row['order_system']!=='')?$row['order_system']:'-'; } $pa=((int)$row['promo_active']>0); ?>
										<tr<?=$pa?' class="table-danger"':''?>>
											<td class="text-center"><a href="<?=goods_link($row['product_code'])?>" target="_blank"><?=$row['product_code']?></a></td>
											<td><?=$row['product_name']?><?=$pa?' <span class="badge bg-danger">프로모션중</span>':''?></td>
											<td class="text-center"><? $sc=stock_check_link($row['order_system'],$row['item_id']); if($sc){ ?><a href="<?=$sc?>" target="_blank" title="재고체크"><?=$os?></a><? }else{ ?><?=$os?><? } ?></td>
										</tr>
									<? } }else{ ?>
										<tr><td colspan="3" class="text-center text-muted py-2">해당 항목이 없습니다.</td></tr>
									<? } ?>
									</tbody>
								</table>
								<? if(count($selling_soldout) > 15){ ?><p class="font-12 text-muted mt-1 mb-0">외 <?=number_format(count($selling_soldout)-15)?>건 더 있음</p><? } ?>
							</div>
						</div>
					</div>
					<!-- 1-2. 재고 있는데 품절 처리됨 (해제 후보) -->
					<div class="col-lg-6">
						<div class="card border-primary">
							<div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">재고 있는데 품절 처리됨</h5>
								<span class="badge bg-light text-dark"><?=number_format(count($stock_soldout))?> 건</span>
							</div>
							<div class="card-body p-1">
								<p class="font-12 text-muted px-1 mb-1">재고가 있으므로 <b>품절 해제 후보</b></p>
								<table class="table table-sm table-bordered mb-0">
									<thead class="table-light font-12"><tr><th class="text-center text-nowrap">옵션상품코드</th><th>옵션상품명</th><th>Asset</th><th class="text-center">재고</th></tr></thead>
									<tbody class="font-12">
									<? if($stock_soldout){ foreach(array_slice($stock_soldout,0,15) as $row){ $pa=((int)$row['promo_active']>0); ?>
										<tr class="table-info">
											<td class="text-center"><a href="<?=goods_link($row['product_code'])?>" target="_blank"><?=$row['product_code']?></a></td>
											<td><?=$row['product_name']?><?=$pa?' <span class="badge bg-danger">프로모션중</span>':''?></td>
											<td><a href="<?=asset_link($row['item_id'])?>" target="_blank">[<?=$row['item_id']?>]</a> <?=$row['item_name']?></td>
											<td class="text-center fw-bold"><?=number_format($row['stock'])?></td>
										</tr>
									<? } }else{ ?>
										<tr><td colspan="4" class="text-center text-muted py-2">해당 항목이 없습니다.</td></tr>
									<? } ?>
									</tbody>
								</table>
								<? if(count($stock_soldout) > 15){ ?><p class="font-12 text-muted mt-1 mb-0">외 <?=number_format(count($stock_soldout)-15)?>건 더 있음</p><? } ?>
							</div>
						</div>
					</div>
				</div>

				<!-- ====================== 2. 등록 품질 점검 ====================== -->
				<div class="row">
					<div class="col-lg-6">
						<div class="card">
							<div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">판매중 · 판매가 미설정</h5>
								<span class="badge bg-light text-dark"><?=number_format(count($issue_price))?> 건</span>
							</div>
							<div class="card-body p-1">
								<table class="table table-sm table-bordered mb-0">
									<thead class="table-light font-12"><tr><th class="text-center">옵션상품코드</th><th>옵션상품명</th></tr></thead>
									<tbody class="font-12">
									<? if($issue_price){ foreach(array_slice($issue_price,0,12) as $row){ ?>
										<tr>
											<td class="text-center"><a href="<?=goods_link($row['product_code'])?>" target="_blank"><?=$row['product_code']?></a></td>
											<td><?=$row['product_name']?></td>
										</tr>
									<? } }else{ ?>
										<tr><td colspan="2" class="text-center text-muted py-2">해당 항목이 없습니다.</td></tr>
									<? } ?>
									</tbody>
								</table>
								<? if(count($issue_price) > 12){ ?><p class="font-12 text-muted mt-1 mb-0">외 <?=number_format(count($issue_price)-12)?>건 더 있음 (상위 100건 기준)</p><? } ?>
							</div>
						</div>
					</div>
					<div class="col-lg-6">
						<div class="card">
							<div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">판매중 디지털 · 배송시스템 미설정</h5>
								<span class="badge bg-light text-dark"><?=number_format(count($issue_delivery))?> 건</span>
							</div>
							<div class="card-body p-1">
								<table class="table table-sm table-bordered mb-0">
									<thead class="table-light font-12"><tr><th class="text-center">옵션상품코드</th><th>옵션상품명</th><th class="text-center">유형</th></tr></thead>
									<tbody class="font-12">
									<? if($issue_delivery){ foreach(array_slice($issue_delivery,0,12) as $row){ ?>
										<tr>
											<td class="text-center"><a href="<?=goods_link($row['product_code'])?>" target="_blank"><?=$row['product_code']?></a></td>
											<td><?=$row['product_name']?></td>
											<td class="text-center"><? $admin_goods->getGoodsOptionGameType($row['game_type']); ?></td>
										</tr>
									<? } }else{ ?>
										<tr><td colspan="3" class="text-center text-muted py-2">해당 항목이 없습니다.</td></tr>
									<? } ?>
									</tbody>
								</table>
								<? if(count($issue_delivery) > 12){ ?><p class="font-12 text-muted mt-1 mb-0">외 <?=number_format(count($issue_delivery)-12)?>건 더 있음 (상위 100건 기준)</p><? } ?>
							</div>
						</div>
					</div>
				</div>

				<!-- ====================== 3. 프로모션 / 일정 ====================== -->
				<div class="row">
					<div class="col-lg-6">
						<div class="card h-100">
							<div class="card-header bg-success text-white">
								<h5 class="card-title mb-0">프로모션 현황</h5>
							</div>
							<div class="card-body p-2">
								<div class="row text-center g-2">
									<div class="col-4">
										<div class="border rounded py-3">
											<div class="font-12 text-muted mb-1">진행예정</div>
											<h3 class="mb-0 text-primary"><?=number_format($promo_upcoming['cnt'])?></h3>
										</div>
									</div>
									<div class="col-4">
										<div class="border rounded py-3 bg-light">
											<div class="font-12 text-muted mb-1">진행중</div>
											<h3 class="mb-0 text-success"><?=number_format($promo_active['cnt'])?></h3>
										</div>
									</div>
									<div class="col-4">
										<div class="border rounded py-3">
											<div class="font-12 text-muted mb-1">종료예정 <span class="font-11">(7일내)</span></div>
											<h3 class="mb-0 text-danger"><?=number_format($promo_ending['cnt'])?></h3>
										</div>
									</div>
								</div>
								<? if($promo_notselling){ ?>
								<div class="mt-2">
									<p class="font-12 fw-bold text-danger mb-1">⚠ 프로모션 진행중인데 판매중 아님 (<?=count($promo_notselling)?>)</p>
									<table class="table table-sm table-bordered mb-0">
										<thead class="table-light font-12"><tr><th class="text-center">옵션상품코드</th><th>옵션상품명</th><th class="text-center">상태</th></tr></thead>
										<tbody class="font-12">
										<? foreach($promo_notselling as $row){ ?>
											<tr class="table-warning">
												<td class="text-center"><a href="<?=goods_link($row['product_code'])?>" target="_blank"><?=$row['product_code']?></a></td>
												<td><?=$row['product_name']?></td>
												<td class="text-center"><?=$admin->getProductStatus($row['status'])?></td>
											</tr>
										<? } ?>
										</tbody>
									</table>
								</div>
								<? } ?>
							</div>
						</div>
					</div>
					<div class="col-lg-6">
						<div class="card h-100">
							<div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
								<h5 class="card-title mb-0">예약구매 (출시 임박순)</h5>
								<span class="badge bg-light text-dark"><?=number_format(count($preorder_list))?> 건</span>
							</div>
							<div class="card-body p-1">
								<table class="table table-sm table-bordered mb-0">
									<thead class="table-light font-12"><tr><th>옵션상품명</th><th class="text-center">출시일</th><th class="text-center">배송시스템</th></tr></thead>
									<tbody class="font-12">
									<? if($preorder_list){ foreach($preorder_list as $row){ $os=$admin->getOrderSystem($row['order_system']); if(!$os){ $os=($row['order_system']!==null && $row['order_system']!=='')?$row['order_system']:'-'; } ?>
										<tr>
											<td><a href="<?=goods_link($row['product_code'])?>" target="_blank"><?=$row['product_name']?></a></td>
											<td class="text-center text-nowrap"><?=substr($row['release_date'],0,10)?></td>
												<td class="text-center"><?=$os?></td>
										</tr>
									<? } }else{ ?>
										<tr><td colspan="3" class="text-center text-muted py-2">없음</td></tr>
									<? } ?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
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
