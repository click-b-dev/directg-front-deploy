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
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);

	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminBoard= new AdminBoard($conn_dgkr);

	$add_where = " and is_chk='N'";

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

	$orderby = "idx desc";

	$notice_list = $adminBoard->getNoticeList($page,$add_where,$orderby,$param);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">공지사항 관리</a></li>
									<li class="breadcrumb-item active">공지사항 목록</li>
								</ol>
							</div>
							<h4 class="page-title">[DGKR] 공지사항 목록</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row">
					<div class="col-12">
						<div class="d-flex flex-row justify-content-between mb-2">
							<div class="float-start"><?=number_format($notice_list->total_results)?> 개</div>
							<div class="float-end"><span class="badge badge-primary-lighten font-13">공지</span>:페이지 고정노출 ,<span class="badge badge-danger-lighten font-13">프로모션</span>, <span class="badge badge-success-lighten font-13">제품코드(키) 발송</span>, <span class="badge badge-info-lighten font-13">상품 출시/판매</span></div>
						</div>

						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-sm" id="">
								<thead class="table-light font-14">
									<tr>
										<th class="all" style="width: 20px;">
											<div class="form-check">
												<input type="checkbox" class="form-check-input" id="customCheck1">
												<label class="form-check-label" for="customCheck1">&nbsp;</label>
											</div>
										</th>
										<th class="text-center" style="width:50px">번호</th>
										<th class="text-center" style="width:70px">구분</th>
										<th class="text-center">제목</th>
										<th class="text-center" style="width:150px">작성일자<br/>(수정일자)</th>
										<th class="text-center" style="width:90px">배포일자</th>
										<th class="text-center" style="width:90px">노출여부</th>
										<th class="text-center" style="width:90px">조회수</th>
										<th class="text-center" style="width:120px">등록</th>
										<th class="text-center" style="width:100px">비고</th>
									</tr>
								</thead>
								<tbody class="font-14">
								<?
								if($notice_list->success == true){
									$result = $notice_list->resultset->fetchAll();

									foreach($result as $value){
								?>
									<tr>
										<td class="text-center">
											<div class="form-check">
												<input type="checkbox" class="form-check-input" id="idx<?=$value['idx']?>" name="idx" value="<?=$value['idx']?>">
												<label class="form-check-label" for="idx">&nbsp;</label>
											</div>
										</td>
										<td class="text-center px-1"><?=$value['idx']?></td>
										<td class="text-center px-1"><?=$value['category']?></td>
										<td class="text-start px-1"><?=$value['subject']?></td>
										<td class="text-center px-1"><?=$value['reg_date']?></td>
										<td class="text-center px-1"></td>
										<td class="text-center px-1"><?=$value['flag']=='1'?'노출':'X'?></td>
										<td class="text-center px-1"><?=number_format($value['hit'])?></td>
										<td class="text-center px-1"><button type="button" class="btn btn-outline-primary btn-sm btn_copy" data-idx="<?=$value['idx']?>">게시물복사</button></td>
										<td class="text-center px-1">
											<a href="notice_view.php?idx=<?=$value['idx']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
											<a href="notice_register.php?mode=modify&idx=<?=$value['idx']?>" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
										</td>
									</tr>
								<?
										}
									}
								?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?=$notice_list->links_html?></div>

					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_copy").bind("click",function(){
		var index = $(".btn_copy").index(this);
		var idx = $(".btn_copy").eq(index).attr("data-idx");
		$.ajax({
			 type: "POST",
			 url: "notice_ps.php",
			 data: {mode:"copy",idx:idx},
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
