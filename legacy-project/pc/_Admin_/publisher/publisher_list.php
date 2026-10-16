<?
$sidebar_file = "sidebar_goods.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
$topmenu['goods'] = "active";

$page_title="공급처 현황";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];
$param = "";

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

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);
	
	$orderby = "publisher_name asc";

	$publisher_list = $admin->getPublisherList($page,$add_where,$orderby,$param);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">공급처 관리</a></li>
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
								<div class="row mb-2">
									<label for="search" class="col-2 col-form-label col-form-label-sm bg-light border">공급처명</label>
									<div class="col-4">
										<input type="text" class="form-control" id="search_value" name="search_value" placeholder="" value="<?=$search_value?>">
									</div>
									<div class="col-4"><button type="submit" class="btn btn-primary shadow-none">공급처 검색</button></div>
								</div>
							</form>
						</div>
					</div>
				</div>
				
				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($publisher_list->total_results)?> 개</div>
						
						<div class="float-end"><button type="button" class="btn btn-danger shadow-none" data-bs-toggle="modal" data-bs-target="#publisher-modal">공급처 등록</button></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="table-responsive bg-white mb-0">
							<table class="table table-centered w-100 nowrap table-sm table-bordered mb-0" id="">
								<thead class="table-light font-14">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center">공급처 코드</th>
										<th class="text-center">공급처명</th>
										<th class="text-center">대표상품수</th>
										<th class="text-center">옵션상품수</th>
									</tr>
								</thead>
								<tbody class="font-13">
								<?
								if($publisher_list->success == true){
									$result = $publisher_list->resultset->fetchAll();

									$num=1;

									foreach($result as $value){
								?>
									<tr>
										<td class="text-center"><?=$num+($page-1)*20?></td>
										<td class="text-center"><?=$value['publisher_code']?></td>
										<td><?=$value['publisher_name']?></td>
										<td class="text-start"></td>
										<td></td>
									</tr>
							<?		$num++;
									}
								}
								?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $publisher_list->links_html;?></div>
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->   
			</div> <!-- container -->
		</div> <!-- content -->
</div>
<div id="publisher-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-secondary">
					<h5 class="modal-title" id="publisherModalLabel">공급처 등록</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form method="post" action="publisher_ps.php" class="ps-3 pe-3" class="form-horizontal">
						<div class="mb-2 row">
							<label for="publisher_code" class="col-sm-3 col-form-label bg-light">공급처코드</label>
							<div class="col-sm-9">
								<input type="text" id="publisher_code" name="publisher_code" class="form-control"  value="" required>
							</div>
						</div>
						<div class="mb-2 row">
							<label for="publisher_name" class="col-sm-3 col-form-label bg-light">공급처명</label>
							<div class="col-sm-9">
								<input type="text" id="publisher_name" name="publisher_name" class="form-control"  value="" required>
							</div>
						</div>

						<div class="mb-2 text-center">
							<button class="btn btn-primary shadow-none" type="button" id="btn_publisher_register">공급처 등록</button>
						</div>
					</form>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->
	
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
