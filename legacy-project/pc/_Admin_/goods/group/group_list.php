<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title="그룹 설정";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$adminGoods= new AdminGoods($conn);

	$group_list = $adminGoods->getGroupList();

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$type_label = array(
	"1"=>"프로모션",
	"2"=>"타임딜",
	"3"=>"프랜차이즈",
	"99"=>"기타"
);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">그룹 관리</a></li>
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

						<div class="float-end"><a href="./group_register.php" class="btn btn-primary shadow-none">그룹 등록</a></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">그룹 현황</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light font-14">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">구분</th>
												<th class="text-center">그룹명</th>
												<th class="text-center">시작</th>
												<th class="text-center">종료</th>
												<th class="text-center">사용여부</th>
												<th class="text-center">PC배너</th>
												<th class="text-center">모바일배너</th>
												<th class="text-center">수정</th>
											</tr>
										</thead>
										<tbody class="font-12">
										<?
											foreach($group_list as $value){
												if((strtotime(DATE("Y-m-d H:i:s")) > $value['start_date']) && (strtotime(DATE("Y-m-d H:i:s")) < $value['end_date'])){
													$time_color="text-primary";
												} else if(strtotime(DATE("Y-m-d H:i:s")) > $value['end_date']){
													$time_color="text-danger";
												} else {
													$time_color="";
												}
										?>
											<tr>
												<td class="text-center"><?=$value['idx']?></td>
												<td class="text-center"><?=$type_label[$value['type']]?></td>
												<td class="text-center"><a href="./group_view.php?idx=<?=$value['idx']?>"><?=$value['subject']?></a></td>
												<td class="text-center <?=$time_color?>"><?=DATE("Y-m-d H:i:s",$value['start_date'])?></td>
												<td class="text-center <?=$time_color?>"><?=DATE("Y-m-d H:i:s",$value['end_date'])?></td>
												<td class="text-center"><?=$value['use_flag']?></td>
												<td class="text-center"><?=$value['pc_banner_url']?"<a href='".$value['pc_banner_url']."' target='_blank'>링크</a>":"미등록"?></td>
												<td class="text-center"><?=$value['banner_url']?"<a href='".$value['banner_url']."' target='_blank'>링크</a>":"미등록"?></td>
												<td class="text-center"><a href="./group_register.php?idx=<?=$value['idx']?>" class="btn btn-primary">수정</a></td>
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
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
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
