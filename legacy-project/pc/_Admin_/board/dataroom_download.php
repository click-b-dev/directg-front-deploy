<?

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "공지사항 목록";
$sidebar_file = "sidebar_board.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

$start_date = date('Y-m-d');
$end_date = date("Y-m-d", strtotime($treatDateEnd.' -0day'));


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminBoard= new AdminBoard($conn);

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

	$orderby = "b.idx desc";

	$download_list = $adminBoard->getDataroomDownloadList($page,$add_where,$orderby,$param);

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

				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">게시판</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">자료실 관리</a></li>
									<li class="breadcrumb-item active">자료실 다운로드현황</li>
								</ol>
							</div>
							<h4 class="page-title">자료실 다운로드현황</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-5">
										<div class="row">
											<label for="search_title_name" class="col-sm-3 col-form-label bg-light border">제목</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_title_name" name="search_title_name" placeholder="제목검색" value="<?=$search_title_name?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">다운로드현황 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="d-flex flex-row justify-content-between mb-2">
							<div class="float-start"><?=number_format($download_list->total_results)?> 개</div>
						</div>

						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-sm" id="">
								<thead class="table-light">
									<tr>
										<th class="text-center" style="width:120px">회원번호</th>
										<th class="text-center" style="width:200px">ID</th>
										<th class="text-center">파일명</th>
										<th class="text-center" style="width:90px">다운로드 수</th>
									</tr>
								</thead>
								<tbody>
								<?
								if($download_list->success == true){
									$result = $download_list->resultset->fetchAll();

									foreach($result as $value){
								?>
								<tr>
									<td class="text-center px-1"><?=$value['m_no']?></td>
									<td class=" px-1"><?=$value['m_id']?></td>
									<td class="text-center px-1"><?=$value['file_name']?></td>
									<td class="text-center px-1"><?=number_format($value['download_count'])?></td>
								</tr>
								<?
										}
									}
								?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?=$download_list->links_html?></div>

					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_delete").bind("click",function(){
		var index = $(".btn_delete").index(this);
		var idx = $(".btn_delete").eq(index).attr("data-idx");
		$.ajax({
			 type: "POST",
			 url: "notice_ps.php",
			 data: {mode:"delete",idx:idx},
			 success: function (data, status) {
				location.reload();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
});
</script>
</body>
</html>
