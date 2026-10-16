<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="카테고리 설정";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminGoods= new AdminGoods($conn);

	$category_list = $adminGoods->getCategoryList();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();  
}

$category_depth_label = array(
	"1"=>"대분류",
	"2"=>"중분류",
	"3"=>"소분류",
);

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
				
				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"></div>
						
						<div class="float-end"><button type="button" class="btn btn-primary shadow-none" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-whatever="@mdo">카테고리 등록</button></div>
					</div>
				</div>
				
				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">카테고리 현황</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light font-14">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">카테고리 분류</th>
												<th class="text-center">카테고리 코드</th>
												<th class="text-center">카테고리 이름</th>
												<th class="text-center">카테고리 전체경로</th>
												<th class="text-center">비고</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?

											$num=1;

											foreach($category_list as $value){
										?>
											<tr>
												<td class="text-center"><?=$num?></td>
												<td class="text-center"><?=$category_depth_label[$value['category_depth']]?></td>
												<td class="text-center"><?=$value['category_code']?></td>
												<td class="text-center"><?=$value['category_name']?></td>
												<td class="text-start">
												<?
													switch($value['category_depth']){
														case "1":
															echo $value['category_name'];
														break;
														case "2":
															$category_level1 = $adminGoods->getCategoryInfo(substr($value['category_code'],0,1),"1");
															$category_full = "";
															foreach($category_level1 as $sub_value){
																$category_full.=$sub_value['category_name']." > ";
															}
															
															echo $category_full.$value['category_name'];
														break;
														case "3":
															$category_level1 = $adminGoods->getCategoryInfo(substr($value['category_code'],0,1),"1");
															$category_level2 = $adminGoods->getCategoryInfo(substr($value['category_code'],0,2),"2");
															$category_full = "";
															
															foreach($category_level1 as $sub_value){
																$category_full.=$sub_value['category_name']." > ";
															}
															
															foreach($category_level2 as $sub_value){
																$category_full.=$sub_value['category_name']." > ";
															}
															
															echo $category_full.$value['category_name'];
														break;
													}
												?>
												</td>
												<td class="text-center">
												</td>
											</tr>
									<?		$num++;
											}
										?>
										</tbody>
									</table>
								</div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header bg-body text-white">
			<h1 class="modal-title fs-5" id="exampleModalLabel">카테고리 추가</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
			<form name="categoryfrm" method="post" action="category_ps.php">
				<input type="hidden" name="mode" value="register">
				<div class="row  mb-3">
					<label for="category_depth" class="col-sm-3 col-form-label font-14">카테고리 분류</label>
					<div class="col-sm-9">
						<select class="form-select" name="category_depth">
							<option>:::분류선택:::</option>
							<option value="1">대분류</option>
							<option value="2">중분류</option>
							<option value="3">소분류</option>
						</select>
					</div>
				</div>
				<div class="row  mb-3">
					<label for="category_code" class="col-sm-3 col-form-label font-14">카테고리 코드</label>
					<div class="col-sm-9">
						<input type="text" class="form-control" id="category_code" name="category_code">
					</div>
				</div>
				<div class="row  mb-3">
					<label for="category_name" class="col-sm-3 col-form-label font-14">카테고리 이름</label>
					<div class="col-sm-9">
						<input type="text" class="form-control" id="category_name" name="category_name">
					</div>
				</div>
			
			</div>
			<div class="modal-footer">
				<button type="submit" class="btn btn-primary shadow-none">카테고리 저장</button>
			</div>
			</form>
		</div>
	</div>
</div>

</body>
</html>
