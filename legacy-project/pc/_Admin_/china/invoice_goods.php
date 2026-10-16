<? 
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['china'] = "active";
$sidebar_file = "sidebar_china.php";

$page_title = "중국 결제 상품 리스트";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);

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



if($search_name){
	$where[] = " goods_nm like '%".$search_name."%'";
}

if($search_platform){
	$where[] = " platform ='".$search_platform."'";
}

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	//$orderby = "settle_no desc";

	$china= new China($conn); 
	$invoice_goods = $china->getChinaInvoiceGoods($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_platform'][$search_platform] = "selected";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">중국결제</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">중국 결제 관리</a></li>
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
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-label bg-light border">상품명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_name" name="search_name" placeholder="상품명" value="<?=$search_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_email" class="col-sm-3 col-form-label bg-light border">플랫폼</label>
											<div class="col-sm-9">
												<select class="form-select " id="search_platform" name="search_platform">
													<option value="" >::: 플랫폼 선택 :::</option>
													<option value="PS4" <?=$selected['search_platform']['PS4']?>>PS4</option>
													<option value="PS5" <?=$selected['search_platform']['PS5']?>>PS5</option>
													<option value="XB1" <?=$selected['search_platform']['XB1']?>>XB1</option>
													<option value="XBX" <?=$selected['search_platform']['XBX']?>>XBX</option>
													<option value="NSW" <?=$selected['search_platform']['NSW']?>>NSW</option>
													<option value="NSW" <?=$selected['search_platform']['NSW2']?>>NSW2</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($invoice_goods->total_results)?> 명</div>
					<div class="float-end"><button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#goods-modal">중국 결제 상품등록</button></div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center">번호</th>
									<th class="text-center">플랫폼</th>
									<th class="text-center">상품명</th>
									<th class="text-center">판매가</th>
									<th class="text-center">수정</th>
									<th class="text-center">삭제</th>
								</tr>
							</thead>
							<tbody class="bg-white font-12">
							<?
							if($invoice_goods->success == true){
								$result = $invoice_goods->resultset->fetchAll();
								
								$num = 0;

								foreach($result as $value){
							?>
								<tr>
									<td class="text-center"><?=$invoice_goods->total_results-($num+($page-1)*20)?></td>
									<td class="text-center"><?=$value['platform']?></td>
									<td class="text-start"><?=$value['goods_nm']?></td>
									<td class="text-end"><?=number_format($value['price'])?>원</td>
									<td class="text-center"><button type="button" class="btn btn-outline-dark btn-sm btn_modify" data-idx="<?=$value['idx']?>" data-platform="<?=$value['platform']?>" data-goodsnm="<?=$value['goods_nm']?>" data-price="<?=$value['price']?>">수정</button></td>
									<td class="text-center"><button type="button" class="btn btn-outline-danger btn-sm btn_delete" data-idx="<?=$value['idx']?>" data-platform="<?=$value['platform']?>" data-goodsnm="<?=$value['goods_nm']?>">삭제</button></td>
								</tr>
							<?		$num++;
									}
								}
							?>
							</tbody>
						</table>
						<div class="text-center mt-3 fs-5"><?echo $invoice_goods->links_html;?></div>
					</div> 
				</div>
					
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->

	<div id="goods-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h4 class="modal-title" id="goods-modalLabel">중국 결제 상품 등록</h4>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form id="goodsFrm" class="form-horizontal" method="POST" action="invoice_goods_ps.php" autocomplete="one-time-code">
						<input type="hidden" name="mode" value="register">
						<input type="hidden" name="idx" value="">
						<div class="row mb-3">
							<label for="email" class="col-2 form-label">* 플랫폼</label>
							<div class="col-10">
								<select class="form-select " id="platform" name="platform" required>
									<option value="" >::: 플랫폼 선택 :::</option>
									<option value="PS4" <?=$selected['platform']['PS4']?>>PS4</option>
									<option value="PS5" <?=$selected['platform']['PS5']?>>PS5</option>
									<option value="XB1" <?=$selected['platform']['XB1']?>>XB1</option>
									<option value="XBX" <?=$selected['platform']['XBX']?>>XBX</option>
									<option value="NSW" <?=$selected['platform']['NSW']?>>NSW</option>
									<option value="NSW" <?=$selected['platform']['NSW2']?>>NSW2</option>
								</select>
							</div>
						</div>
						
						<div class="row mb-3">
							<label for="goods_nm" class="col-2 form-label">* 상품명</label>
							<div class="col-10">
								<input class="form-control" type="text" id="goods_nm"  name="goods_nm" required value="" autocomplete="one-time-code">
							</div>
						</div>

						<div class="row mb-3">
							<label for="price" class="col-2 form-label">* 판매가</label>
							<div class="col-10">
								<div class="input-group">
									<input class="form-control" type="text" required id="price" name="price" value="" autocomplete="one-time-code">
									<label class="input-group-text" for="inputGroupSelect01">원</label>
								</div>
							</div>
						</div>

						<div class="row mb-3 text-center">
							<div class="col-12">
							<button class="btn btn-primary shadow-none" id="btn_goods_register"  type="button">중국 결제 상품 저장</button>
							</div>
						</div>
					</form>

				</div>
			</div>
		</div>
	</div>

</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$("#btn_goods_register").bind("click",function(){
		$.ajax({
			type: "POST",
			 url: "invoice_goods_ps.php",
			 data: $("#goodsFrm").serialize(),
			 success: function (data, status) {
				  alert(data);
				  window.location.reload();
				  //location.reload();
			 },
			error: function(data) {
				//에러코드
				alert(data);
				return false;
			}
		});
	});
	
	$('.btn_modify').bind("click",function () {
		var index = $('.btn_modify').index(this);
		var idx = $('.btn_modify').eq(index).attr("data-idx");
		var platform = $('.btn_modify').eq(index).attr("data-platform");
		var goods_nm = $('.btn_modify').eq(index).attr("data-goodsnm");
		var price = $('.btn_modify').eq(index).attr("data-price");
		$("#goods-modalLabel").text("중국 결제 상품 수정");
		$("#goods-modal input[name='mode']").val("modify");
		$("#goods-modal input[name='idx']").val(idx);
		$("#goods-modal select[name='platform']").val(platform);
		$("#goods-modal input[name='goods_nm']").val(goods_nm);
		$("#goods-modal input[name='price']").val(price);
		$("#goods-modal").modal('show');
	});
	
	$('.btn_delete').bind("click",function () {
		var index = $('.btn_delete').index(this);
		var idx = $('.btn_delete').eq(index).attr("data-idx");
		var platform = $('.btn_delete').eq(index).attr("data-platform");
		var goods_nm = $('.btn_delete').eq(index).attr("data-goodsnm");
		if(confirm("["+platform+"] "+ goods_nm +"을(를) 삭제하시겠습니까?")){
			$.ajax({
				type: "POST",
				 url: "invoice_goods_ps.php",
				 data: {mode:"delete",idx:idx},
				 success: function (data, status) {
					  alert(data);
					  window.location.reload();
					  //location.reload();
				 },
				error: function(data) {
					//에러코드
					alert(data);
					return false;
				}
			});
		}
	});
});
</script>
</body>
</html>
