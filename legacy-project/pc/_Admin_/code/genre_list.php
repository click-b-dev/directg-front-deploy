<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";
$page_title="장르 현황";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	$genre_list = $admin->getSteamGenreList();

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
					<div class="col-6">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">Steam 장르 현황</h5>
							<div class="card-body py-1 px-0">
								<table class="table table-centered mb-0 table-sm">
									<thead class="table-dark font-14">
										<tr>
											<th class="text-center">장르코드</th>
											<th class="text-center">장르명</th>
											<th class="text-center">대표상품수</th>
										</tr>
									</thead>
									<tbody class="font-13">
									<?
										foreach($genre_list as $sub_key=>$sub_value){
									?>
										<tr>
											<td class="text-center"><?=$sub_value['genres_id']?></td>
											<td><?=$sub_value['genres_name']?></td>
											<td class="text-center"><?=number_format($sub_value['genre_count'])?></td>
										</tr>
									<?
										}
									?>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div class="col-6">
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
