<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Genba 타이틀 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_product_id = filter_input(INPUT_GET, 'search_product_id', FILTER_SANITIZE_STRING);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$param = "";

$where[] = " a.is_krw='N'";

if($search_product_id){
	$where[] = "a.ProductID='".$search_product_id."'";
}

if($search_publisher){
	$where[] = "a.Publisher ='".$search_publisher."'";
}

if($search_name){
	$where[] = "a.Name Regexp '".$search_name."'";
}

foreach($_GET as $key=>$value){
	if($key<>"page" ){
		if($value<>""){
			$param.="&".$key."=".$value;
		}
	}
}

$add_where = "";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "date_format(a.batch_date,'%Y-%m-%d') desc,a.ReleaseDate desc,a.Publisher desc";

	$adminGoods= new AdminGoods($conn);

	$genba_product = $adminGoods->getGenbaTitleList($page,$add_where,$orderby,$param);

	$genba_publisher = $adminGoods->getGenbaTitlePublisher();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$checked['promotion_status'][$promotion_status] = "checked";
$selected['search_publisher'][$search_publisher] = "selected";

/*
Product live state. Possible values:
0 = NO_PRE_LIVE, Product has not been requested to be Approved yet;
1 = LIVE, Pre live check has been approved;
2 = PRE_LIVE_PENDING, Pre live check is in progress;
3 = NO_RELATIONSHIP, No relationship between etailer and publisher;
4 = DECLINED, Pre live has been declined
*/
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Genba 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-0">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-2">
									<div class="col-3">
										<div class="row g-2">
											<label for="search_product_id" class="col-3 col-form-label col-form-label-sm bg-light border">ProductID</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_product_id" name="search_product_id" placeholder="Genba ProductID" value="<?=$search_product_id?>">
											</div>
										</div>
									</div>
									<div class="col-3">
										<div class="row g-2">
											<label for="search_publisher" class="col-3 col-form-label col-form-label-sm bg-light border">Publisher</label>
											<div class="col-9">
												<select name="search_publisher" class="form-select">
													<option value="">:::선택:::</option>
												<?
													foreach($genba_publisher as $publisher){
												?>
													<option value="<?=$publisher['Publisher']?>" <?=$selected['search_publisher'][$publisher['Publisher']]?>><?=$publisher['Publisher']?></option>
												<?
													}
												?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-3">
										<div class="row g-2">
											<label for="search_name" class="col-3 col-form-label col-form-label-sm bg-light border">Name</label>
											<div class="col-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="Genba Name" value="<?=$search_name?>">
											</div>
										</div>
									</div>
									<div class="col-3">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">Genba 상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($genba_product->total_results)?> 개</div>

						<div class="float-end"><button type="button" class="btn btn-info btn-sm shadow-none" id="btn_genba_product_sync">Genba 상품 동기화</button></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Genba 상품 현황</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light font-14">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">ProductID</th>
												<th class="text-center">Name</th>
												<th class="text-center">Publisher</th>
												<th class="text-center">ReleaseDate</th>
												<th class="text-center">EtailerSplitPercentage</th>
												<th class="text-center">동기화날짜</th>
												<th class="text-center">가격업데이트</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
										if($genba_product->success == true){
											$result = $genba_product->resultset->fetchAll();

											$num=0;

											foreach($result as $value){
										?>
											<tr>
												<td class="text-center"><?=$genba_product->total_results-($num+($page-1)*50)?></td>
												<td class="text-center"><?=$value['ProductID']?></td>
												<td class="text-start"><?=$value['Name']?></td>
												<td class="text-start"><?=$value['Publisher']?></td>
												<td class="text-center"><?=date("Y-m-d H:i:s",strtotime('+9 hours',strtotime($value['ReleaseDate'])))?></td>
												<td class="text-center"><?=$value['EtailerSplitPercentage']?><br/>(<?=$value['is_krw']?>)</td>
												<td class="text-center"><?=$value['batch_date']?></td>
												<td class="text-center"><button type="button" class='btn btn-sm btn-info shadow-none btn_price_sync' data-productid="<?=$value['ProductID']?>">가격동기화</button></td>
											</tr>
									<?		$num++;
											}
										}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $genba_product->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
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

<script>
$(document).ready(function(){
	//개별 타이틀 가격 동기화
	$(".btn_price_sync").bind("click",function(){
		var index = $(".btn_price_sync").index(this);
		var productid = $(".btn_price_sync").eq(index).attr("data-productid");
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"price",productid:productid},
			 success: function (data, status) {
				alert(data);
				location.reload();

			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//상품동기화
	$("#btn_genba_product_sync").bind("click",function(){
		$.ajax({
			 type: "GET",
			 url: "genba_api.php",
			 data: {api_type:"product"},
			 success: function (data, status) {
				alert(data);
				location.reload();

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
