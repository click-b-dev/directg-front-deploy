<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title= "특전정보 관리";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);
$search_date_type = filter_input(INPUT_GET, 'search_date_type', FILTER_SANITIZE_STRING);
$search_date_start = filter_input(INPUT_GET, 'search_date_start', FILTER_SANITIZE_STRING);
$search_date_end = filter_input(INPUT_GET, 'search_date_end', FILTER_SANITIZE_STRING);
$bonus_status = filter_input(INPUT_GET, 'bonus_status', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

switch($search_type){
	case "bonus_name":
		$where[] = " bonus_name like '%".$search_value."%'";
	break;
}

$param = "";

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

	$orderby = "bonus_no desc";

	$admin= new Admin($conn); 

	$bonus_list = $admin->getBonusPageList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$selected['search_type'][$search_type] = "selected";
$checked['bonus_status'][$bonus_status] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">특전제공 관리</a></li>
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
						<div class="card-body p-3">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row g-0 mb-2">
									<div class="col-6">
										<div class="row g-2">
											<label for="search" class="col-2 col-form-label col-form-label-sm bg-light border">검색어</label>
											<div class="col-4">
												<select id="search_type" name="search_type" class="form-select">
													<option value="bonus_name" <?=$selected['search_type']['bonus_name']?>>특전명</option>
												</select>
											</div>
											<div class="col-6">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="" value="<?=$search_value?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">특전 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($bonus_list->total_results)?> 개</div>
						
						<div class="float-end"><a href="<?=$document_root?>/goods/bonus_register.php" class="btn btn-danger shadow-none">특전정보 등록</a></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">특전정보 리스트</h5>
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 nowrap table-sm table-bordered" id="">
										<thead class="table-light">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">특전 제공방식</th>
												<th class="text-center">특전명</th>
												<th class="text-center">특전 Assset</th>
												<th class="text-center">특전제공 상품수</th>
												<th class="text-center">비고</th>
											</tr>
										</thead>
										<tbody class="font-13">
										<?
										if($bonus_list->success == true){
											$result = $bonus_list->resultset->fetchAll();

											$num=1;

											foreach($result as $value){
												$bonus_asset = str_replace("&#34;",'"',htmlspecialchars_decode($value['bonus_asset']));
												$bonus_asset_list = json_decode($bonus_asset,true);
										?>
											<tr>
												<td class="text-center"><?=$num+($page-1)*20?></td>
												<td class="text-center">
													<?
														switch($value['bonus_delivery_type']){
															case "1":
																echo "특전key 포함";
															break;
															case "2":
																echo "별도key 제공";
															break;
															case "3":
																echo "다운로드 컨텐츠";
															break;
														}
													?>
												</td>
												<td><?=$value['bonus_name']?></td>
												<td class="text-start">
													<ul class="mb-0">
													<?
													if(is_array($bonus_asset_list)){
														foreach($bonus_asset_list  as $sub_value){
													?>
													<li><?=$sub_value['asset_platform']?> / <?=$sub_value['asset_id']?> / <?=$sub_value['asset_name']?></li>
													<?
														}
													}
													?>
													</ul>
												</td>
												<td></td>
												<td class="text-center table-action">
													<a href="<?=$document_root?>/goods/bonus_view.php?bonus_no=<?=$value['bonus_no']?>" class="action-icon" title="특전 상세보기"> <i class="mdi mdi-eye"></i></a>
													<a href="<?=$document_root?>/goods/bonus_register.php?mode=modify&bonus_no=<?=$value['bonus_no']?>" class="action-icon" title="특전 수정"> <i class="mdi mdi-square-edit-outline"></i></a>
													<a href="javascript:void(0);" class="action-icon" title="특전 삭제"> <i class="mdi mdi-delete"></i></a>
												</td>
											</tr>
									<?		$num++;
											}
										}
										?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $bonus_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div>
			<!-- container -->

		</div>
		<!-- content -->

	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
