<? 
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['china'] = "active";
$sidebar_file = "sidebar_china.php";

$page_title = "중국 결제요청 리스트";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_settle_no = filter_input(INPUT_GET, 'search_settle_no', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_email = filter_input(INPUT_GET, 'search_email', FILTER_SANITIZE_STRING);

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

if(!$search_year){
	$search_year = date('Y');
}

if($search_year){
	$start_date = $search_year."-01-01";
	$end_date = $search_year."-12-31";
	$add_where = "and ord_ymd between '".$start_date."' and '".$end_date."' ";
}

if($search_settle_no){
	$where[] = " settle_no ='".$search_settle_no."'";
}

if($search_name){
	$where[] = " name like '%".$search_name."%'";
}

if($search_email){
	$where[] = " email ='".$search_email."'";
}


$selected['search_year'][$search_year] = "selected";

foreach($where as $value){
	$add_where.= " and ".$value;
}

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "settle_no desc";
	

	$china= new China($conn); 
	$invoice_list = $china->getChinaInvoiceRequest($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}


/*
	$db_table = " tbl_invoice_order";
	$where[] = " step='1' and (flag='N' or flag is null) ";
	$orderby = " ord_ymd desc";
	//$orderby = " a.mem_srl asc";

	list ($total) = $db->fetch("select count(*) from tbl_invoice_order where step='1' and (flag='N' or flag is null)");

	if (!$_GET[page_num]) $_GET[page_num] = 20;

	$pg = new Page($_GET[page],$_GET[page_num]);
	$pg->field = " 
	*
	";

	$pg->setQuery($db_table,$where,$orderby);

	$pg->exec();

	$result = $db->query($pg->query);

	//echo $pg->query;
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
									<div class="col-lg-3">
										<div class="row">
											<label for="search_settle_no" class="col-sm-4 col-form-label bg-light border">결제번호</label>
											<div class="col-sm-8">
												<input type="text" class="form-control" id="search_settle_no" name="search_settle_no" placeholder="결제번호" value="<?=$search_settle_no?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-label bg-light border">주문자명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_name" name="search_name" placeholder="주문자명" value="<?=$search_name?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_email" class="col-sm-3 col-form-label bg-light border">주문자이메일</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_email" name="search_email" placeholder="주문자이메일" value="<?=$search_email?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-12">
										<div class="row">
											<label for="search_payment_method" class="col-sm-1 col-form-label bg-light border">연도</label>
											<div class="col-sm-3">
												<div class="input-group">
													<select class="form-select me-2" id="search_year" name="search_year">
														<option value="">:::년도:::</option>
														<?
															for($i=2016;$i<=date('Y');$i++){
														?>
														<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
														<?
															}
														?>
													</select>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">결제내역 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><? echo number_format($invoice_list->total_results)?> 개</div>
					<div class="float-end"></div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
							<thead class="table-light">
								<tr>
									<th class="text-center">번호</th>
									<th class="text-center">주문일자</th>
									<th class="text-center">결제번호</th>
									<th class="text-center">주문자명</th>
									<th class="text-center">주문자이메일</th>
									<th class="text-center">결제금액</th>
									<th class="text-center">결제일자</th>
									<th class="text-center">결제상태</th>
									<th class="text-center">수정</th>
									<th class="text-center">삭제</th>
									<!--<th class="text-center">메일전송</th>-->
								</tr>
							</thead>
							<tbody class="bg-white font-12">
							<?
							if($invoice_list->success == true){
								$result = $invoice_list->resultset->fetchAll();
								
								$num = 0;

								foreach($result as $value){
							?>
								<tr>
									<td class="text-center"><?=$invoice_list->total_results-($num+($page-1)*20)?></td>
									<td class="text-center"><?=$value['ord_ymd']?></td>
									<td class="text-center"><a href="invoice_view.php?settle_no=<?=$value['settle_no']?>"><?=$value['settle_no']?></a></td>
									<td class="text-center"><?=$value['name']?></td>
									<td class="text-center"><?=$value['email']?></td>
									<td class="text-end"><?=number_format($value['settle_price'])?></td>
									<td class="text-center"><?=$value['cdt']?></td>
									<td class="text-center">결제대기</td>
									<td class="text-center"><a href="invoice_modify.php?settle_no=<?=$value['settle_no']?>" class="btn btn-outline-secondary btn-sm">수정</a></td>
									<td class="text-center"><button type="button" class="btn btn-danger btn-sm shadow-none btn_delete" data-settleno="<?=$value['settle_no']?>">삭제</button></td>
									<!--<td class="text-center"><button type="button" class="btn btn-light btn-sm">메일전송</button></td>--->
								</tr>
							<?		$num++;
									}
								}
							?>
							</tbody>
						</table>
						<div class="text-center mt-3"><?echo $invoice_list->links_html;?></div>
					</div> <!-- end col -->
				</div>
					
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$('.btn_delete').bind("click",function () {
		var index = $('.btn_delete').index(this);
		var idx = $('.btn_delete').eq(index).attr("data-idx");
		var settle_no = $('.btn_delete').eq(index).attr("data-settleno");
		if(confirm("["+settle_no+"] "+"을(를) 삭제하시겠습니까?")){
			$.ajax({
				type: "POST",
				 url: "invoice_ps.php",
				 data: {mode:"invoice_delete",settle_no:settle_no},
				 success: function (data, status) {
					  //alert(data);
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
