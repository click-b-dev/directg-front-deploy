<?

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "자료실 파일현황";
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

	$orderby = "deploy_date desc";

	$dataroom_file = $adminBoard->getDataroomList($page,$add_where,$orderby,$param);

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
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><?=number_format($dataroom_file->total_results)?> 개</div>
						<div class="float-end"><a href="<?=$document_root?>/board/dataroom_register.php" class="btn btn-danger shadow-none">자료실 파일 등록</a></div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
								<thead class="table-light font-14">
									<tr>
										<th class="text-center" style="width:50px">번호</th>
										<th class="text-center" style="width:130px">파일유형</th>
										<th class="text-center">제공 파일명</th>
										<th class="text-center" style="width:90px">암호화 여부</th>
										<th class="text-center" style="width:90px">암호화 방식</th>
										<th class="text-center" style="width:90px">제공조건</th>
										<th class="text-center" style="width:150px">배포일자</th>
										<th class="text-center" style="width:100px">다운로드 수</th>
										<th class="text-center" style="width:100px">비고</th>
									</tr>
								</thead>
								<tbody class="font-12">
								<?
								if($dataroom_file->success == true){
									$result = $dataroom_file->resultset->fetchAll();

									$num = 1;
									foreach($result as $value){
								?>
								<tr>
									<td class="text-center px-1"><?=$num+(($page-1)*30)?></td>
									<td class="text-center px-1"><?=($value['file_type']=="P")?"한글패치":"컨텐츠"?></td>
									<td class="text-start px-1"><?=$value['file_name']?></td>
									<td class="text-center px-1"><?=$value['is_encode']?></td>
									<td class="text-center px-1"><?=$value['encode_type']?></td>
									<td class="text-center px-1"><?=($value['is_free']=="Y")?"무료":"유료"?></td>
									<td class="text-center px-1"><?=$value['deploy_date']?></td>
									<td class="text-center px-1"><?=$value['total_download']?></td>
									<td class="text-center px-1">
										<a href="dataroom_view.php?idx=<?=$value['idx']?>" class="action-icon" title="상세보기"> <i class="mdi mdi-eye"></i></a>
										<a href="dataroom_register.php?mode=modify&idx=<?=$value['idx']?>" class="action-icon" title="수정"> <i class="mdi mdi-square-edit-outline"></i></a>
										<a href="<?=$value['file_url']?>" target="_blank" class="action-icon" title="다운로드"><i class="mdi mdi-download"></i></a>
									</td>
								</tr>
								<?
										$num++;
									}
								}
								?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?=$dataroom_file->links_html?></div>

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
