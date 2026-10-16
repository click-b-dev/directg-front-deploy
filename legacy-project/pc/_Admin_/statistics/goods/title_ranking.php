<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$page_title="인기타이틀 순위";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

if($search_year==""){
	//$search_year = "2025";
}

if($search_month==""){
	$d = mktime(0,0,0, date("m"), 1, date("Y")); //이번달 1일
	$prev_month = strtotime("-1 month", $d); //한달전
	//$search_month = date('m',$prev_month);
}

$param ="";

$where = [];
//$where[] = " a.publisher is null ";

if(isset($search_year) && $search_year<>""){
	$where[] = "a.sales_year='".$search_year."'";
}

if(isset($search_month) && $search_month<>""){
	$where[] = "a.sales_month='".$search_month."'";
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";

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
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$admin= new Admin($conn); 

	$orderby = " (sum(a.total_price)+sum(a.dlc_price)) desc";

	$best_ranking = $admin->getTitleRanking($page,$add_where,$orderby,$param);

	//print_r($title_list);


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
<!-- Start Content-->
				<div class="container-fluid">
					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">상품 분석</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 
					<div class="row g-2">
						<div class="col-12">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">검색필터</h5>
								<div class="card-body py-2">
									<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
										<div class="row mb-2">
											<div class="col-lg-12">
												<div class="row">
													<label for="search_title_id" class="col-sm-2 col-form-label bg-light border">주문기간</label>
													<div class="col-sm-4">
														<div class="input-group">
															<select class="form-select me-2" id="search_year" name="search_year">
																<option value="">:::년:::</option>
																<?
																	for($i=2013;$i<=date('Y');$i++){
																?>
																<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
																<?
																	}
																?>
															</select>
															<select class="form-select" id="search_month" name="search_month">
																<option value="">:::월:::</option>
																<?
																	for($i=1;$i<=12;$i++){
																?>
																<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_month'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>월</option>
																<?
																	}
																?>
															</select>
														</div>
													</div>
													<div class="col-auto">
														<button class="input-group-text btn-primary shadow-none" type="submit">검 색</button>
													</div>
												</div>
											</div>
										</div>
									</form>
								</div>
							</div>
						</div>
					</div>
<button class="input-group-text btn-primary shadow-none" id="btn_best_save" type="button">인기타이틀 집계 저장</button>

					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body p-0">
									<div class="table-responsive">
										<table class="table table-bordered table-centered table-sm">
											<thead class="table-light font-13">
											<tr>
												<th class="text-center" style="width:50px">순위</th>
												<th class="text-center" style="width:50px">대표상품코드</th>
												<th class="text-center" style="width:300px">대표상품명</th>
												<th class="text-center" style="width:170px">퍼블리셔</th>
												<th class="text-center" style="width:80px">출시일</th>
												<th class="text-center" style="width:60px">Game <br/>주문수량</th>
												<th class="text-center" style="width:70px">Game <br/>주문금액</th>
												<th class="text-center" style="width:60px">DLC <br/>주문수량</th>
												<th class="text-center" style="width:70px">DLC <br/>주문금액</th>
												<th class="text-center" style="width:60px">합계 <br/>주문수량</th>
												<th class="text-center" style="width:70px">합계 <br/>주문금액</th>
											</tr>
											</thead>
											<tbody class="font-13">
											<?
												if($best_ranking->success == true){
													$result = $best_ranking->resultset->fetchAll();

													$ranking = 1;

													foreach($result as $value){
											?>
											<tr>
												<td class="text-center"><?=($page-1)*50+$ranking?></td>
												<td class="text-center"><?=$value['title_id']?></td>
												<td class=""><?=$value['title_name']?></td>
												<td class="text-center"><?=$value['publisher']?></td>
												<td class="text-center"><?=$value['release_date']?></td>
												
												<td class="text-end"><span class="num"><?=number_format($value['total_count'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['total_price'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['dlc_count'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['dlc_price'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['total_count']+$value['dlc_count'])?></span></td>
												<td class="text-end"><span class="num"><?=number_format($value['total_price']+$value['dlc_price'])?></span></td>
											</tr>
											<?		$ranking++;
													}
												}
											?>
											</tbody>
										</table>
									</div>

								</div>
								<!-- end card-body-->
							</div>
							<!-- end card-->
						</div>
						<!-- end col -->
					</div>
					<div class="text-center mt-3"><?echo $best_ranking->links_html;?></div>
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	//인기 타이틀 집계저장
	$("#btn_best_save").bind("click",function(){
		var search_year = $('select[name="search_year"] option:selected').val();
		var search_month = $('select[name="search_month"] option:selected').val();
		$.ajax({
			 type: "POST",
			 url: "title_order_ps.php",
			 data: {mode:"best_game_save",search_year:search_year,search_month:search_month},
			 success: function (data, status) {
				//location.reload();
				alert("집계가 완료되었습니다.");
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
