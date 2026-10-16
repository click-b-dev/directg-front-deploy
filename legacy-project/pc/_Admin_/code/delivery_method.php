<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="배송방법 설정";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	$delivery_method_list = $admin->getDeliveryMethodList();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}

?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<!-- Begin page -->
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">코드 관리</a></li>
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
						<table class="table table-centered mb-0 table-sm table-bordered">
						<thead class="table-dark font-13">
							<tr>
								<th class="text-center">배송방법코드</th>
								<th class="text-center">배송방법명</th>
								<th class="text-center">배송유형</th>
								<th class="text-center">기본 배송비</th>
								<th class="text-center">무료배송 조건금액</th>
								<th class="text-center">추적 가능 여부</th>
								<th class="text-center">평균 소요 기간</th>
								<th class="text-center">당일 발송 마감시간</th>
								<th class="text-center">도서산간 추가비 여부</th>
								<th class="text-center">반품 배송비</th>
								<th class="text-center">사용 여부</th>
							</tr>
						</thead>
						<tbody class="font-12 bg-white">
						<?
							foreach($delivery_method_list as $sub_key=>$sub_value){
						?>
							<tr>
								<td class="text-center"><?=$sub_value['DELIVERY_METHOD_ID']?></td>
								<td><?=$sub_value['METHOD_NAME']?></td>
								<td class="text-center"><?=$sub_value['DELIVERY_TYPE']?></td>
								<td class="text-end"><?=number_format($sub_value['BASE_FEE'],0)?>원</td>
								<td class="text-end"><?=number_format($sub_value['FREE_THRESHOLD'],0)?> 원</td>
								<td class="text-center"><?=$sub_value['IS_TRACKABLE']?></td>
								<td class="text-center"><?=$sub_value['EXPECTED_DAYS']?> 일</td>
								<td class="text-center"><?=$sub_value['CUT_OFF_TIME']?></td>
								<td class="text-center"><?=$sub_value['AREA_SURCHARGE_YN']?></td>
								<td class="text-end"><?=number_format($sub_value['RETURN_FEE'],0)?> 원</td>
								<td class="text-center"><?=$sub_value['USE_YN']?></td>
							</tr>
						<?
							}
						?>
						</tbody>
					</table>
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->   
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
