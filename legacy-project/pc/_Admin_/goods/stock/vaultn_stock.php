<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title = "Vaultn 재고확인";

//전체 재고를 한 번에 로드 → 필터/정렬/페이지네이션은 클라이언트(JS)에서 처리
$vaultn = new Vaultn();
$result = $vaultn->runVaultnStockAll();

//Vaultn sku(=tbl_goods_item_delivery.item_id, order_system=8)를 판매중인 옵션상품 매핑을 1쿼리로 선로드
$sku_map = array();
try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$stmt = $conn->query("select b.item_id as sku, a.product_code, a.product_name, a.soldout, a.status from tbl_goods_item_delivery b inner join tbl_goods_item a on a.product_code=b.product_code where b.order_system='8' and a.status<>'3'");
	foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row){
		$sku_map[$row['sku']][] = $row;
	}
}catch(PDOException $e){
	$sku_map = array();
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Vaultn 재고</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<!-- 검색필터 -->
				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<div class="row align-items-center">
								<div class="col-lg-4">
									<div class="input-group">
										<span class="input-group-text">검색</span>
										<input type="text" class="form-control" id="searchInput" placeholder="sku 또는 title 검색" autocomplete="off">
										<button type="button" class="btn btn-outline-secondary" id="searchClear">초기화</button>
									</div>
								</div>
								<div class="col-lg-3">
									<div class="input-group">
										<span class="input-group-text">구분</span>
										<select class="form-select" id="mappedFilter">
											<option value="all">전체</option>
											<option value="mapped" selected>등록상품만</option>
											<option value="unmapped">미등록만</option>
										</select>
									</div>
								</div>
								<div class="col-lg-3">
									<div class="input-group">
										<span class="input-group-text">정렬</span>
										<select class="form-select" id="sortOrder">
											<option value="stock_asc" selected>재고 적은순</option>
											<option value="stock_desc">재고 많은순</option>
											<option value="default">기본순</option>
										</select>
									</div>
								</div>
								<div class="col-lg-2">
									<div class="input-group">
										<span class="input-group-text">페이지당</span>
										<select class="form-select" id="pageSize">
											<option value="30">30</option>
											<option value="50" selected>50</option>
											<option value="100">100</option>
											<option value="9999">전체</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="mb-2">
							전체: <b><?=number_format($result->recordCount)?></b>
							<?if(isset($result->loadedCount) && $result->loadedCount < $result->recordCount){?>
								<span class="text-danger">(로드됨 <?=number_format($result->loadedCount)?> — 일부만 조회됨)</span>
							<?}?>
							/ 검색결과: <b id="resultCount">0</b>
						</div>
						<div class="table-responsive">
							<table class="table table-centered table-sm table-bordered caption-top text-nowrap" id="vaultnStockTable">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center">sku</th>
										<th class="text-center">title</th>
										<th class="text-center" title="ownedUnits: 내 재고">owned</th>
										<th class="text-center" title="totalAvailableUnits: 내 재고 + 커넥션 공유 합">total</th>
										<th class="text-center">connections</th>
									</tr>
								</thead>
								<tbody class="font-12" id="vaultnStockBody">
							<?
								if(!empty($result->stockLevelInformation) && is_array($result->stockLevelInformation)){
									foreach($result->stockLevelInformation as $sub_value){
										$opt_list = isset($sku_map[$sub_value->sku]) ? $sku_map[$sub_value->sku] : array();
										$opt_srch = "";
										foreach($opt_list as $opt){ $opt_srch .= " ".$opt['product_code']." ".$opt['product_name']; }
										$srch = strtolower($sub_value->sku.' '.$sub_value->title.$opt_srch);
										//재고 0 && 판매중(status=0)·미품절(soldout<>Y) 옵션상품 존재 → 위험(살 수 있는데 재고 없음)
										$is_zero = ((int)$sub_value->totalAvailableUnits === 0);
										$has_selling = false;
										$has_soldout = false; //품절(soldout=Y) 옵션상품 존재 → 정렬 최우선 키
										foreach($opt_list as $opt){
											if($opt['status']==='0' && $opt['soldout']!=='Y'){ $has_selling = true; }
											if($opt['soldout']==='Y'){ $has_soldout = true; }
										}
										$row_cls = ($is_zero && $has_selling) ? ' class="table-danger"' : '';
							?>
							<tr<?=$row_cls?> data-search="<?=htmlspecialchars($srch, ENT_QUOTES)?>" data-total="<?=(int)$sub_value->totalAvailableUnits?>" data-mapped="<?=(count($opt_list)>0?'1':'0')?>" data-soldout="<?=($has_soldout?'1':'0')?>">
								<td><?=$sub_value->sku?></td>
								<td>
									<?=$sub_value->title?>
									<?foreach($opt_list as $opt){?>
										<div class="small">
											(<a href="<?=$document_root?>/goods/goods_option_sales_register.php?product_code=<?=$opt['product_code']?>" target="_blank"><?=$opt['product_code']?></a> <?=htmlspecialchars($opt['product_name'])?>)
											<?if($opt['soldout']=='Y'){?><span class="badge bg-danger">품절</span><?}else{?><span class="badge bg-success">판매중</span><?}?>
										</div>
									<?}?>
								</td>
								<td class="text-center"><?=$sub_value->ownedUnits?></td>
								<td class="text-end"><?=number_format($sub_value->totalAvailableUnits)?></td>
								<td>
								<?
									if(is_array($sub_value->connections) && count($sub_value->connections) > 0){
								?>
									<table class="table table-bordered table-sm mb-0 text-nowrap">
										<thead class="table-light font-12">
										<tr>
											<th>connectionGuid</th>
											<th>connectionName</th>
											<th>reservedUnits</th>
											<th>networkUnits</th>
											<th title="커넥션 1건 기준 가용: reservedUnits + networkUnits">total</th>
										</tr>
										</thead>
										<tbody class="font-12">
									<?
											foreach($sub_value->connections as $connections){
									?>
										<tr>
											<td><?=$connections->connectionGuid?></td>
											<td class="text-center"><?=$connections->connectionName?></td>
											<td class="text-end"><?=number_format($connections->reservedUnits)?></td>
											<td class="text-end"><?=number_format($connections->networkUnits)?></td>
											<td class="text-end"><?=number_format($connections->totalAvailableUnits)?></td>
										</tr>
									<?
										}
									?>
										</tbody>
										</table>
									<?
									}else{
									?>
										<span class="text-muted">—</span>
									<?
									}
									?>
								</td>
							</tr>
							<?
									}
								}
							?>
								</tbody>
							</table>
						</div>

						<!-- 페이지네이션 (숫자 10개 블록) -->
						<nav>
							<ul class="pagination justify-content-center flex-wrap mt-3 mb-0" id="pgList"></ul>
						</nav>
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
	var tbody = document.getElementById('vaultnStockBody');
	var $rows = $('#vaultnStockBody > tr');
	var rows = $rows.toArray();
	var curPage = 1;
	var BLOCK = 10; //페이지 번호 블록 크기

	function filtered(){
		var q = ($('#searchInput').val() || '').trim().toLowerCase();
		var mf = $('#mappedFilter').val();
		return rows.filter(function(r){
			if(q !== '' && (r.getAttribute('data-search') || '').indexOf(q) === -1){ return false; }
			if(mf === 'mapped' && r.getAttribute('data-mapped') !== '1'){ return false; }
			if(mf === 'unmapped' && r.getAttribute('data-mapped') !== '0'){ return false; }
			return true;
		});
	}

	function totOf(r){ return parseInt(r.getAttribute('data-total'), 10) || 0; }
	function soldoutOf(r){ return r.getAttribute('data-soldout') === '1' ? 0 : 1; } //0=품절 → 최우선(앞)

	function sorted(list){
		var mode = $('#sortOrder').val();
		//1순위: 품절상태 최우선(품절이면서 입고된 상품이 뒤로 밀리지 않게) → 2순위: 선택한 정렬
		return list.slice().sort(function(a, b){
			var sd = soldoutOf(a) - soldoutOf(b);
			if(sd !== 0){ return sd; }
			if(mode === 'stock_asc'){ return totOf(a) - totOf(b); }
			if(mode === 'stock_desc'){ return totOf(b) - totOf(a); }
			return 0;
		});
	}

	function pageItem(label, page, opts){
		opts = opts || {};
		var li = '<li class="page-item' + (opts.active ? ' active' : '') + (opts.disabled ? ' disabled' : '') + '">';
		var attr = (!opts.disabled && page) ? ' data-page="' + page + '"' : '';
		li += '<a class="page-link" href="javascript:void(0);"' + attr + '>' + label + '</a></li>';
		return li;
	}

	function buildPager(totalPages){
		var blockStart = Math.floor((curPage - 1) / BLOCK) * BLOCK + 1;
		var blockEnd = Math.min(blockStart + BLOCK - 1, totalPages);
		var html = '';
		html += pageItem('&laquo;', 1, {disabled: curPage <= 1});
		html += pageItem('&lsaquo;', curPage - 1, {disabled: curPage <= 1});
		for(var p = blockStart; p <= blockEnd; p++){
			html += pageItem(String(p), p, {active: p === curPage});
		}
		html += pageItem('&rsaquo;', curPage + 1, {disabled: curPage >= totalPages});
		html += pageItem('&raquo;', totalPages, {disabled: curPage >= totalPages});
		$('#pgList').html(html);
	}

	function render(){
		var list = sorted(filtered());
		var size = parseInt($('#pageSize').val(), 10) || 50;
		var totalPages = Math.max(1, Math.ceil(list.length / size));
		if(curPage > totalPages){ curPage = totalPages; }
		if(curPage < 1){ curPage = 1; }
		var start = (curPage - 1) * size;
		var end = start + size;

		//정렬/필터 순서대로 DOM 재배치 → 화면 표시와 페이징이 정렬순서와 일치
		list.forEach(function(r){ tbody.appendChild(r); });

		$rows.hide();
		$(list.slice(start, end)).show();

		$('#resultCount').text(list.length);
		buildPager(totalPages);
	}

	$('#searchInput').on('input', function(){ curPage = 1; render(); });
	$('#mappedFilter').on('change', function(){ curPage = 1; render(); });
	$('#sortOrder').on('change', function(){ curPage = 1; render(); });
	$('#pageSize').on('change', function(){ curPage = 1; render(); });
	$('#searchClear').on('click', function(){ $('#searchInput').val(''); curPage = 1; render(); });
	$('#pgList').on('click', 'a[data-page]', function(){
		var p = parseInt($(this).attr('data-page'), 10);
		if(!isNaN(p)){ curPage = p; render(); }
	});

	render();
});
</script>
</body>
</html>
