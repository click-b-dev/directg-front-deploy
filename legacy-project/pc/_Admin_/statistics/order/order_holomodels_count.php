<?php
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 0 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['statistics'] = "active";
$page_title="홀로 모델 주문현황";

$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

if($search_year==""){
	$search_year = date('Y');
}

if($search_month==""){
	$search_month =date('m');
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";

if(!$page){
	$page=1;
}

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 
	
	if($search_year==""){
		$search_year = date("Y");
		$start_date = $search_year."-01-01";
	}
	
	if($search_year==""){
		$search_year = date("Y");
		$start_date = $search_year."-01-01";
		$last_day = date("t", mktime(0, 0, 1, $search_month, 1, $search_year));
		$end_date = $search_year."-".$search_month."-".$last_day;
	}else{
		if($search_month==""){
			$start_date = $search_year."-01-01";
			$last_day = date("t", mktime(0, 0, 1, 12, 1, $search_year));
			$end_date = $search_year."-12-".$last_day;
		}else{
			$start_date = $search_year."-".$search_month."-01";
			$last_day = date("t", mktime(0, 0, 1, $search_month, 1, $search_year));
			$end_date = $search_year."-".$search_month."-".$last_day;
		}
	}

	$sales_title = $admin->getHolomodelsSalesCount($start_date,$end_date);

	// 합계 계산
	$total_sales_count  = 0;
	$total_sales_amount = 0;
	foreach($sales_title as $row){
		$total_sales_count  += $row['sales_count'];
		$total_sales_amount += $row['sales_amount'];
	}

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
					<!-- page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">통계</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">주문분석</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>

					<!-- 검색필터 -->
					<div class="row g-2">
						<div class="col-12">
							<div class="card">
								<h5 class="card-header bg-secondary text-white">검색필터</h5>
								<div class="card-body py-2">
									<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
										<div class="row mb-2">
											<div class="col-lg-12">
												<div class="row">
													<label class="col-sm-1 col-form-label bg-light border">주문기간</label>
													<div class="col-sm-3">
														<div class="input-group">
															<select class="form-select me-2" name="search_year">
																<option value="">:::년:::</option>
																<?php for($i=2013; $i<=date('Y'); $i++): ?>
																<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?>년</option>
																<?php endfor; ?>
															</select>
															<select class="form-select" name="search_month">
																<option value="">:::월:::</option>
																<?php for($i=1; $i<=12; $i++): ?>
																<option value="<?=sprintf('%02d',$i)?>" <?=$selected['search_month'][sprintf('%02d',$i)]?>><?=sprintf('%02d',$i)?>월</option>
																<?php endfor; ?>
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

					<!-- 통계 요약 카드 -->
					<?php
						if(!empty($sales_title)){
					?>
					<div class="row g-2 mb-2">
						<div class="col-md-3">
							<div class="card mb-0">
								<div class="card-body py-2 px-3">
									<p class="text-muted mb-1 font-13">총 상품 수</p>
									<h4 class="mb-0 num"><?=number_format(count($sales_title))?> <small class="text-muted fw-normal font-13">개</small></h4>
								</div>
							</div>
						</div>
						<div class="col-md-3">
							<div class="card mb-0">
								<div class="card-body py-2 px-3">
									<p class="text-muted mb-1 font-13">총 판매 수량</p>
									<h4 class="mb-0 num"><?=number_format($total_sales_count)?> <small class="text-muted fw-normal font-13">건</small></h4>
								</div>
							</div>
						</div>
						<div class="col-md-3">
							<div class="card mb-0">
								<div class="card-body py-2 px-3">
									<p class="text-muted mb-1 font-13">총 판매 금액</p>
									<h4 class="mb-0 num"><?=number_format($total_sales_amount)?> <small class="text-muted fw-normal font-13">원</small></h4>
								</div>
							</div>
						</div>
					</div>
					<?php
						}
					?>

					<!-- 결과 테이블 -->
					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body p-0">
									<div class="table-responsive">
										<table class="table table-centered table-hover table-striped mb-0">
											<thead class="table-dark">
												<tr>
													<th class="text-center" style="width:50px;">No.</th>
													<th>상품코드</th>
													<th>상품명</th>
													<th class="text-end">판매 수량</th>
													<th class="text-end">판매 금액</th>
												</tr>
											</thead>
											<tbody>
											<?php
												if(empty($sales_title)){
											?>
												<tr>
													<td colspan="6" class="text-center py-4 text-muted">조회된 데이터가 없습니다.</td>
												</tr>
											<?php
												} else {
													foreach($sales_title as $i => $row){
												?>
												<tr>
													<td class="text-center text-muted"><?=$i+1?></td>
													<td><span><?=$row['product_code']?></span></td>
													<td><?=$row['product_name']?></td>
													<td class="text-end num"><?=number_format($row['sales_count'])?></td>
													<td class="text-end num"><?=number_format($row['sales_amount'])?>원</td>
												</tr>
											<?php
													}
												}
											?>
											</tbody>
											<?php
												if(!empty($sales_title)){
											?>
											<tfoot class="table-secondary fw-bold">
												<tr>
													<td colspan="3" class="text-end">합 계</td>
													<td class="text-end num"><?=number_format($total_sales_count)?></td>
													<td class="text-end num"><?=number_format($total_sales_amount)?>원</td>
												</tr>
											</tfoot>
											<?php
												}
											?>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>
</div>
	</div>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>