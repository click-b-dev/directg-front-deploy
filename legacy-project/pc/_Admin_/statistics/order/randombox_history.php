<?
$sidebar_file = "sidebar_statistics.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	$topmenu['statistics'] = "active";

	$page_title="랜덤박스 진행이력";

	$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);


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

	$where[] = " find_in_set(game_type,'randombox')";
		
	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$orderby = "product_code desc";

	$admin= new Admin($conn); 
	$per_page = "30";
	$goods_option_list = $admin->getGoodsOptionList($page,$add_where,$orderby,$param,$per_page);

	$checked['search_status'][$search_status] = "checked";

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">랜덤박스 분석</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>     
					<!-- end page title --> 

					<div class="row">
						<div class="col-12">
							<div class="card">
								<div class="card-body">
									<div class="table-responsive">
										<table class="table table-bordered table-centered w-100  nowrap table-sm">
											<thead class="table-dark">
											<tr>
												<th class="text-center">옵션상품코드</th>
												<th class="text-center">옵션상품명</th>
												<th class="text-center">판매금액</th>
												<th class="text-center">시작일자</th>
												<th class="text-center">종료일자</th>
												<th class="text-center">판매 리포트</th>
											</tr>
											</thead>
											<tbody>
											<?
												if($goods_option_list->success == true){
													$result = $goods_option_list->resultset->fetchAll();

													foreach($result as $value){
											?>
											<tr>
												<td class="text-center"><?=$value['product_code']?></td>
												<td><?=$value['product_name']?></td>
												<td class="text-end"><?=number_format($value['price'])?>원</td>
												<td class="text-center"><?=date('Y-m-d H:i:s',$value['start_date'])?></td>
												<td class="text-center"><?=date('Y-m-d H:i:s',$value['end_date'])?></td>
												<td class="text-center"><a href="randombox_report.php?product_code=<?=$value['product_code']?>" class="btn btn-outline-secondary btn-sm">바로가기</a></td>
											</tr>
											<?
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
					<!-- end row -->   
				</div> <!-- container -->
			</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
