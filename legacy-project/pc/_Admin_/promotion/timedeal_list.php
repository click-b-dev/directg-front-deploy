<?
$sidebar_file = "sidebar_promotion.php";
	$document_root= "/backend";
	$topmenu['promotion'] = "active";

	$page_title="타임딜 현황";

header('Content-Type: text/html; charset=UTF-8');

error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);

include_once($_SERVER['DOCUMENT_ROOT'].'/backend/conf/conf.php');
include_once($_SERVER['DOCUMENT_ROOT'].'/backend/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$where[] = "promotion_gubun='31'";

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn -> exec("set names utf8");

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

	$orderby = "promotion_start desc,promotion_end desc";

	$admin= new Admin($conn); 

	$promotion_list = $admin->getPromotionList($page,$add_where,$orderby,$param);

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">프로모션</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">타임딜 관리</a></li>
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
							<div class="mb-2"><? echo number_format($promotion_list->total_results)?> 개</div>

							<div class="table-responsive">
								<table class="table table-centered dt-responsive nowrap table-sm table-bordered" id="">
									<thead class="table-light">
										<tr>
											<th class="text-center">프로모션 유형</th>
											<th class="text-center">프로모션 구분</th>
											<th class="text-center">옵션상품코드</th>
											<th class="text-center">옵션상품명</th>
											<th class="text-center">준비수량</th>
											<th class="text-center">판매수량</th>
											<th class="text-center" style="width:150px">등록일</th>
											<th class="text-center" style="width:150px">시작일자</th>
											<th class="text-center" style="width:150px">종료일자</th>
											<th class="text-center" style="width:90px">비고</th>
										</tr>
									</thead>
									<tbody>
								<?
									if($promotion_list->success == true){
										$result = $promotion_list->resultset->fetchAll();

										foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$value['promotion_type']?></td>
										<td class="text-center"><?=$admin->getWeek(date('Y-m-d',strtotime($value['promotion_start'])))?>주차 타임딜</td>
										<td class="text-center"><?=$value['product_code']?></td>
										<td><?=$value['product_name']?></td>
										<td></td>
										<td></td>
										<td class="text-center p-0"><span class="num"><?=$value['reg_date']?></span></td>
										<td class="text-center p-0"><span class="num"><?=$value['promotion_start']?></span></td>
										<td class="text-center p-0"><span class="num"><?=$value['promotion_end']?></span></td>
										<td class="text-center">
											<a href="timedeal_register.php?mode=modify&idx=<?=$value['idx']?>&page=<?=$page?><?=$param?>" class="action-icon" title="프로모션 정보수정"> <i class="mdi mdi-square-edit-outline"></i></a>
										</td>
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

</body>
</html>
