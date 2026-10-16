<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page_title = "Ztorm 퍼블리셔별 상품동기화";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$mode ="";
//$ztorm = new Ztorm($mode);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">Ztorm 관리</a></li>
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
						<table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
						<thead class="table-light font-14">
							<tr>
								<th class="text-center">퍼블리셔번호</th>
								<th class="text-center">퍼블리셔명</th>
								<th class="text-center">상품수</th>
								<th class="text-center">동기화일자</th>
								<th class="text-center">동기화</th>
							</tr>
						</thead>
						<tbody class="font-13">
							<?
								//$result = $ztorm->runGetPublishers($page);

								//print_r($result);
							//	foreach($result->Value->Publisher as $value){
							?>
							<tr>
								<td class="text-center">475</td>
								<td class="text-start">Daedalic Entertainment</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<tr>
								<td class="text-center">921</td>
								<td class="text-start">Giants Software</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<tr>
								<td class="text-center">911</td>
								<td class="text-start">Starbreeze Publishing</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<tr>
								<td class="text-center">886</td>
								<td class="text-start">Tate Multimedia</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<tr>
								<td class="text-center">877</td>
								<td class="text-start">Secret Mode</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<tr>
								<td class="text-center">120</td>
								<td class="text-start">Taleworlds Entertainment</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<tr>
								<td class="text-center">531</td>
								<td class="text-start">Fulqrum Publishing</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<tr>
								<td class="text-center">15</td>
								<td class="text-start">Atari</td>
								<td class="text-center"></td>
								<td class="text-center"></td>
							</tr>
							<?
							//	}
							?>
						</tbody>
						</table>
					</div>
					<!-- end col -->
				</div>
				<!-- end row -->
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
