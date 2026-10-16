<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['stock'] = "active";
$sidebar_file = "sidebar_stock.php";

$page_title="Genba availability webhook log";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}


if($search_value){
	switch($search_key){
		case "search_sku":
			$where[] = " a.sku ='".$search_value."'";
		break;
		case "search_name":
			$where[] = " (b.item_name like '%".$search_value."%')";
		break;
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//$where[] = "assetType<>'임시코드' and assetType<>'랜덤박스'";



	//$orderby = "release_date asc,reg_date asc";
	$orderby = "reg_date desc";
	$adminStock= new AdminStock($conn);

	if(isset($asset_id) && $asset_id<>""){
		$where[] = " asset_id ='".$asset_id."'";
	}

	if(isset($asset_name) && $asset_name<>""){
		$where[] = " asset_name ='%".$asset_name."%'";
	}


	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	$genba_log = $adminStock->getGenbaAvaliabilityLog($page,$add_where,$orderby,$param,'30');

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$selected['search_key'][$search_key] = "selected";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Genba Webhok Log</a></li>
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
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<input type="hidden" id="page" name="page" value="<?=$page?>">
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_sku" <?=$selected['search_key']['search_sku']?>>sku</option>
												<option value="search_name" <?=$selected['search_key']['search_name']?>>name</option>
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="text-center">
											<button type="submit" class="btn btn-primary shadow-none"> 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<table class="table table-sm table-centered table-bordered mb-0">
							<colgroup>
								<col width="15%"/>
								<col width="15%"/>
								<col width="20%"/>
								<col width="8%"/>
								<col width="15%"/>
								<col width="10%"/>
							</colgroup>
							<thead class="table-dark font-13">
								<tr>
									<th class="text-center">transactionid</th>
									<th class="text-center">sku</th>
									<th class="text-center">name</th>
									<th class="text-center">Status</th>
									<th class="text-center">Message</th>
									<th class="text-center">날짜</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
						<?
							if($genba_log->success == true){
								$result = $genba_log->resultset->fetchAll();

								foreach($result as $value){
						?>
						<tr>
							<td class="text-center"><?=$value['transactionid']?></td>
							<td class="text-center"><?=$value['sku']?></td>
							<td class="text-start"><?=$value['item_name']?></td>
							<td class="text-center"><?=$value['status']?></td>
							<td class="text-center"><?=$value['message']?></td>
							<td class="text-center"><?=$value['reg_date']?></td>
						</tr>
						<?
								}
							}
						?>
						</tbody>
						</table>

						<div class="text-center mt-3"><?echo $genba_log->links_html;?></div>
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
			 }
		});
	});

	// 재고확인 동기화
	$('#btn_stock_batch').bind("click",function () {
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
			}
		});
	});

	$(function(){
		 $("#btn_goods_option_stock_download").bind("click",function(){
				var publisherCd = $("#btn_goods_option_stock_download").attr("data-publisher");
				var $form = $('<form></form>');
				$form.attr('action', 'goods_option_stock_download.php');
				$form.attr('method', 'post');
				$form.appendTo('body');
				var publisher = $('<input type="hidden" name="publisherCd" value="'+publisherCd+'">');
				$form.append(publisher);
				$form.submit();
		 });
	});
});
</script>
</body>
</html>
