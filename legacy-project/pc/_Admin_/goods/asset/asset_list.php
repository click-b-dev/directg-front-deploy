<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$page_title = "Asset 현황";
$sidebar_file = "sidebar_stock.php";

$page          = filter_input(INPUT_GET, 'page',          FILTER_SANITIZE_NUMBER_INT);
$asset_id      = filter_input(INPUT_GET, 'asset_id',      FILTER_SANITIZE_STRING);
$searchValue   = filter_input(INPUT_GET, 'searchValue',   FILTER_SANITIZE_STRING);
$searchID      = filter_input(INPUT_GET, 'searchID',      FILTER_SANITIZE_STRING);
$productTypeCd = filter_input(INPUT_GET, 'productTypeCd', FILTER_SANITIZE_STRING);
$assetTypeCd   = filter_input(INPUT_GET, 'assetTypeCd',   FILTER_SANITIZE_STRING);
$platformCd    = filter_input(INPUT_GET, 'platformCd',    FILTER_SANITIZE_STRING);
$publisherCd   = filter_input(INPUT_GET, 'publisherCd',   FILTER_SANITIZE_STRING);

$selected['productTypeCd'][$productTypeCd] = "selected";
$selected['assetTypeCd'][$assetTypeCd]     = "selected";
$selected['platformCd'][$platformCd]       = "selected";
$selected['publisherCd'][$publisherCd]     = "selected";

if(!$page){ $page = 1; }

try{
	$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
	$admin = new Admin($conn);
	$asset_publisher = $admin->getAssetCodeList('PUBL');
	$asset_platform  = $admin->getAssetCodeList('PLFM');
	$product_type    = $admin->getAssetCodeList('PDTP');
	$asset_type      = $admin->getAssetCodeList('ASTP');
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Asset 관리</a></li>
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
						<h5 class="card-header bg-secondary text-white">Asset 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<input type="hidden" id="page" name="page" value="<?=$page?>">
								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="searchValue" class="col-sm-4 col-form-label bg-light border">Asset 이름</label>
											<div class="col-sm-8">
												<input type="text" class="form-control" id="searchValue" name="searchValue" placeholder="Asset 이름" value="<?=$searchValue?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="searchID" class="col-sm-4 col-form-label bg-light border">Asset ID</label>
											<div class="col-sm-8">
												<input type="text" class="form-control" id="searchID" name="searchID" placeholder="Asset ID" value="<?=$searchID?>">
											</div>
											<span class="text-danger">※ AssetID를 이름보다 우선검색</span>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="publisherCd" class="col-sm-4 col-form-label bg-light border">Asset 공급처</label>
											<div class="col-sm-8">
												<select class="form-select" name="publisherCd" id="publisherCd">
													<option value="">::: Asset 공급처 선택 :::</option>
													<? foreach($asset_publisher as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['publisherCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="productTypeCd" class="col-sm-4 col-form-label bg-light border">Asset 유형</label>
											<div class="col-sm-8">
												<select class="form-select" name="productTypeCd" id="productTypeCd">
													<option value="">::: Asset 유형 선택 :::</option>
													<? foreach($product_type as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['productTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="assetTypeCd" class="col-sm-4 col-form-label bg-light border">Asset 형식</label>
											<div class="col-sm-8">
												<select id="assetTypeCd" name="assetTypeCd" class="form-select">
													<option value="">::: Asset 형식 선택 :::</option>
													<? foreach($asset_type as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['assetTypeCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="platformCd" class="col-sm-4 col-form-label bg-light border">Asset 플랫폼</label>
											<div class="col-sm-8">
												<select id="platformCd" name="platformCd" class="form-select">
													<option value="">::: Asset 플랫폼 선택 :::</option>
													<? foreach($asset_platform as $value){ ?>
													<option value="<?=$value['code_id']?>" <?=$selected['platformCd'][$value['code_id']]?>><?=$value['name']?></option>
													<? } ?>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">Asset 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12 mb-1 font-12 text-muted">* 동기화 DB가 아닌 <strong>에셋 서버 실시간(API)</strong> 데이터입니다. 재고 수량은 [재고 관리(DB) &gt; Asset 재고현황]에서 확인하세요.</div>
				</div>

				<div class="row">
					<div class="col-12 mb-2">
						총 <strong id="total" class="text-danger"></strong> 개
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<table class="table table-centered nowrap table-sm table-bordered" id="asset_list">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center" style="width: 4%;">Asset<br/>ID</th>
										<th class="text-center" style="width: 25%;">Asset 이름</th>
										<th class="text-center" style="width: 6%;">Asset<br/>유형</th>
										<th class="text-center" style="width: 6%;">Asset<br/>형식</th>
										<th class="text-center" style="width: 7%;">Asset<br/>플랫폼</th>
										<th class="text-center" style="width: 9%;">Asset<br/>공급처</th>
										<th class="text-center" style="width: 7%;">Asset<br/>수정</th>
										<th class="text-center" style="width: 7%;">Asset<br/>삭제</th>
										<th class="text-center" style="width: 9%;">Asset 키<br/>사용현황</th>
										<th class="text-center" style="width: 8%;">Asset 키<br/>등록</th>
										<th class="text-center" style="width: 8%;">기초정보 등록</th>
									</tr>
								</thead>
								<tbody class="font-12">
								</tbody>
								</table>
								<div id="paging" class="text-center mt-3"></div>
							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="exampleModalLabel">Asset 키 등록</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<form name="assetFrm" id="assetFrm" method="post" action="asset_ps.php">
					<input type="hidden" name="mode" value="asset_item_register"/>
					<div class="mb-3">
						<label for="asset_id" class="col-form-label">Asset ID</label>
						<input type="text" class="form-control" id="asset_id" name="asset_id" readonly>
					</div>
					<div class="mb-3">
						<label for="asset_item" class="col-form-label">Asset 키</label>
						<textarea class="form-control" id="asset_item" name="asset_item" rows="20" required></textarea>
					</div>
				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-primary shadow-none" id="btn_asset_item_register">키 등록</button>
			</div>
		</div>
	</div>
</div>

<script>
$(document).ready(function () {
	var page          = $("#page").val();
	var name          = $("#searchValue").val();
	var productTypeCd = $("#productTypeCd option:selected").val();
	var assetTypeCd   = $("#assetTypeCd option:selected").val();
	var platformCd    = $("#platformCd option:selected").val();
	var publisherCd   = $("#publisherCd option:selected").val();
	var size          = 30;
	var assetid       = $("#searchID").val();

	getAssetList(page, size, name, productTypeCd, assetTypeCd, platformCd, publisherCd, assetid);

	//검색 제출 시 페이지를 1로 리셋 — 필터 변경 후 이전 페이지 번호가 남아 빈 목록이 뜨는 것 방지
	//(페이지네이션 링크는 폼이 아니라 직접 URL이라 영향 없음)
	$("#page").closest("form").on("submit", function(){
		$("#page").val(1);
	});

	$(document).on("click", ".btn_asset_item", function(){
		var asset_id = $(this).data("idx");
		location.href = "asset_item_list.php?asset_id=" + asset_id;
	});

	$(document).on("click", ".btn_asset_modify", function(){
		var asset_id = $(this).data("idx");
		location.href = "asset_modify.php?asset_id=" + asset_id;
	});

	$(document).on("click", ".btn_stock_basic", function(){
		var asset_id  = $(this).data("idx");
		var reg_date  = $(this).data("regdt");
		$.ajax({
			url: "asset_ps.php",
			type: "POST",
			dataType: "JSON",
			data: {mode:"asset_inventory_qty", method:"POST", asset_id:asset_id, reg_date:reg_date},
			success: function(data){ location.reload(); },
			error: function(){ alert("error"); }
		});
	});

	$(document).on("click", "#btn_asset_item_register", function(){
		$.ajax({
			url: "asset_ps.php",
			type: "POST",
			data: $("#assetFrm").serializeArray(),
			success: function(data){
				if(parseInt(data) > 0){
					//등록 후 새로고침하지 않음 — 입력한 키를 모달에 유지해 재확인 가능(의도)
					alert(data + "개 등록 완료");
				}else{
					alert("등록오류 (등록된 키 없음)");
				}
			},
			error: function(){ alert("error"); }
		});
	});

	$(document).on("click", ".btn_asset_delete", function(){
		var asset_id = $(this).data("idx");
		if(confirm("삭제하시겠습니까?")){
			$.ajax({
				url: "asset_ps.php",
				type: "POST",
				data: {mode:"assets_delete", asset_id:asset_id},
				success: function(data){ alert(data); location.reload(); }, //삭제 결과 표시 후 목록 갱신(하위 Item 존재 시 삭제 거부될 수 있음)
				error: function(){ alert("error"); }
			});
		}
	});

	const exampleModal = document.getElementById('exampleModal');
	if(exampleModal){
		exampleModal.addEventListener('show.bs.modal', function(event){
			const button     = event.relatedTarget;
			const asset_id   = button.getAttribute('data-idx');
			const asset_title = button.getAttribute('data-title');
			exampleModal.querySelector('.modal-title').textContent = asset_title;
			exampleModal.querySelector('.modal-body input[name="asset_id"]').value = asset_id;
			exampleModal.querySelector('.modal-body textarea[name="asset_item"]').value = ''; //다른 Asset로 다시 열 때 이전 키 잔존 방지
		});
	}
});

function getAssetList(page, size, name, productTypeCd, assetTypeCd, platformCd, publisherCd, assetid){
	var mode = (assetid > 0) ? "asset_search" : "asset_list";
	$.ajax({
		url: "asset_ps.php",
		type: "POST",
		dataType: "JSON",
		data: {mode:mode, method:"POST", page:page, size:size, name:name, productTypeCd:productTypeCd, assetTypeCd:assetTypeCd, platformCd:platformCd, publisherCd:publisherCd, asset_id:assetid},
		success: function(str){
			renderAssetTable(str.content);
			renderPaging({
				page         : page,
				totalPages   : str.totalPages,
				totalElements: str.totalElements,
				baseUrl      : 'asset_list.php',
				params       : {searchValue:name, publisherCd:publisherCd, productTypeCd:productTypeCd, assetTypeCd:assetTypeCd, platformCd:platformCd}
			});
		},
		error: function(){ alert("error"); }
	});
}

function renderAssetTable(list) {
	var html = '';
	$.each(list, function(i, v){
		var id    = escHtml(v.id);
		var title = escHtml(v.title);
		var regDt = escHtml(v.regDt);
		html += '<tr>';
		html += '<td class="text-center">' + id + '</td>';
		html += '<td class="text-start"><span class="eng font-12">' + title + '</span></td>';
		html += '<td class="text-center">' + escHtml(v.productType) + '</td>';
		html += '<td class="text-center">' + escHtml(v.assetType) + '</td>';
		html += '<td class="text-center"><span class="eng font-12">' + escHtml(v.platform) + '</span></td>';
		html += '<td class="text-center"><span class="eng font-12">' + escHtml(v.publisher) + '</span></td>';
		html += '<td class="text-center"><button type="button" class="btn btn-outline-warning btn-sm btn_asset_modify" data-idx="' + id + '">Asset 수정</button></td>';
		html += '<td class="text-center"><button type="button" class="btn btn-outline-danger btn-sm btn_asset_delete" data-idx="' + id + '">Asset 삭제</button></td>';
		html += '<td class="text-center"><button type="button" class="btn btn-outline-info btn-sm btn_asset_item" data-idx="' + id + '">키 사용현황</button></td>';
		html += '<td class="text-center"><button type="button" class="btn btn-outline-warning btn-sm btn_asset_item_register" data-bs-toggle="modal" data-bs-target="#exampleModal" data-idx="' + id + '" data-title="' + title + '">키 등록</button></td>';
		if(v.is_registered){
			html += '<td class="text-center">등록완료</td>';
		}else{
			html += '<td class="text-center"><button type="button" class="btn btn-outline-dark btn-sm btn_stock_basic" data-idx="' + id + '" data-regdt="' + regDt + '">기초정보등록</button></td>';
		}
		html += '</tr>';
	});
	$("#asset_list tbody").html(html);
}
</script>
</body>
</html>
