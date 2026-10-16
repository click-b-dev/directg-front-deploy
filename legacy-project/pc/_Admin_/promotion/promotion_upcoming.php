<?
$sidebar_file = "sidebar_promotion.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['promotion'] = "active";

$page_title="진행예정 프로모션";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);
$search_confirm = filter_input(INPUT_GET, 'search_confirm', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " (b.product_name like '%".$search_value."%' or b.product_name_en like '%".$search_value."%')";
		break;
		case "search_product_code":
			$where[] = " a.product_code ='".$search_value."'";
		break;
	}
}

if($search_confirm){
	$where[] = " a.confirm ='".$search_confirm."'";
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "a.promotion_start asc,a.promotion_end asc,b.product_name asc";

	$admin_promotion= new AdminPromotion($conn); 
	$adminGoods= new AdminGoods($conn); 

	$promotion_list = $admin_promotion->getPromotionListUpcoming($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_key'][$search_key] = "selected";
$checked['search_confirm'][$search_confirm] = "checked";
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>

<div class="content-page">
			<div class="content">
<!-- Start Content-->
				<div class="container-fluid">
					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">프로모션</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">할인 프로모션 관리</a></li>
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
							<h5 class="card-header bg-secondary text-white">프로모션 검색필터</h5>
							<div class="card-body">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row">
										<div class="col-lg-6 mb-2">
											<div class="input-group row">
												<select class="form-select col-sm-3" name="search_key" id="search_key">
													<option value="search_name" <?=$selected['search_key']['search_name']?>>옵션상품명</option>
													<option value="search_product_code" <?=$selected['search_key']['search_product_code']?>>옵션상품명코드</option>
												</select>
												<div class="col-sm-9">
													<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
												</div>
											</div>
										</div>
										<div class="col-lg-3">
											<div class="row">
												<label for="search_confirm" class="col-sm-4 col-form-label-sm bg-light border font-14 px-1">승인여부</label>
												<div class="col-sm-8">
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_confirm_y" name="search_confirm" class="form-check-input" value="Y" <?=$checked['search_confirm']['Y']?>>
														<label class="form-check-label font-14" for="search_confirm_y">예</label>
													</div>
													<div class="form-check form-check-inline mt-1">
														<input type="radio" id="search_confirm_n" name="search_confirm" class="form-check-input" value="N" <?=$checked['search_confirm']['N']?>>
														<label class="form-check-label font-14" for="search_confirm_n">아니오</label>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div class="row">
										<div class="col-lg-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					
					<div class="mb-2"><? echo number_format($promotion_list->total_results)?> 개</div>

					<div class="row">
						<div class="col-12">
							<div class="table-responsive">
								<table class="table table-centered dt-responsive nowrap table-sm table-bordered" id="">
									<thead class="table-light font-13">
										<tr>
											<th class="text-center">공급처</th>
											<th class="text-center">옵션상품코드</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center">SRP</th>
											<th class="text-center">프로모션<br/>SRP</th>
											<th class="text-center">프로모션<br/>할인률</th>
											<th class="text-center">프로모션 <br/> 할인 판매가</th>
											<th class="text-center" style="width:150px">시작일자</th>
											<th class="text-center" style="width:150px">종료일자</th>
											<th class="text-center" style="width:80px">승인상태</th>
											<th class="text-center" style="width:90px">삭제</th>
										</tr>
									</thead>
									<tbody class="font-12 bg-white">
								<?
									if($promotion_list->success == true){
										$result = $promotion_list->resultset->fetchAll();

										foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$adminGoods->getPublisherName($value['publisher_code'])?></td>
										<td class="text-center"><?=$value['product_code']?></td>
										<td><?=$value['product_name']?><br/>(<?=$value['product_name_en']?>)</td>
										<td class="text-end"><?=number_format($value['product_srp'],0)?> 원</td>
										<td class="text-end"><?=number_format($value['promotion_srp'],0)?> 원</td>
										<td class="text-end"><?=$value['discount_rate']?>%</td>
										<td class="text-end"><?=number_format($value['sale_price'])?> 원</td>
										<td class="text-center p-0"><span class="num"><?=$value['promotion_start']?></span></td>
										<td class="text-center p-0"><span class="num"><?=$value['promotion_end']?></span></td>
										<td class="text-center"><?=$value['confirm']?></td>
										<td class="text-center"><button class="btn btn_delete" data-idx="<?=$value['idx']?>" data-product="<?=$value['product_name']?>"><i class="mdi mdi-delete font-18"></i></button></td>
									</tr>
								<?
										}
									}
								?></tbody>
								</table>
							</div>

							<div class="text-center mt-3"><?echo $promotion_list->links_html;?></div>
						</div> <!-- end col -->
					</div>
					<!-- end row --> 
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_delete").bind("click",function(){
		var index = $(".btn_delete").index(this);
		var idx = $(".btn_delete").eq(index).attr("data-idx");
		var product_name = $(".btn_delete").eq(index).attr("data-product");
		if(confirm( product_name + " 할인 프로모션 일정을 삭제하시겠습니까?")){
			$.ajax({
				 type: "POST",
				 url: "promotion_ps.php",
				 data: {mode:"delete",idx:idx},
				 success: function (data, status) {
					location.relaod();
					//alert(data);
				 },
				error: function(data){
					 alert(data);
				 }
			});
		}
	});
});
</script>
</body>
</html>
