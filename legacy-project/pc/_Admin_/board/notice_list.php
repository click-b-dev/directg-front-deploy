<?

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "공지사항 목록";
$sidebar_file = "sidebar_board.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_title = filter_input(INPUT_GET, 'search_title', FILTER_SANITIZE_STRING);
$search_notice_type = filter_input(INPUT_GET, 'search_notice_type', FILTER_SANITIZE_STRING);
$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if($search_title){
	$where[]=" subject like '%".$search_title."%'";
}

if($search_notice_type){
	$where[]=" notice_type='".$search_notice_type."'";
}

if($search_is_view != ''){
	if($search_is_view == 'Y'){
		$where[]=" is_view='Y'";
	}else{
		$where[]=" (is_view <> 'Y' or is_view is null)";
	}
}

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

	$notice_list = $adminBoard->getNoticeList($page,$add_where,$orderby,$param);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$gubun_array = array(
	"1"=>"제품코드(키) 발송",
	"2"=>"프로모션/이벤트",
	"3"=>"상품 출시/판매",
	"4"=>"기타",
);

$checked['search_notice_type'][$search_notice_type]="checked";
$checked['search_is_view'][$search_is_view]="checked";
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
							<h4 class="page-title">공지사항 목록</h4>
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
											<label for="search_title_id" class="col-sm-3 col-form-label bg-light border">구분</label>
											<div class="col-sm-9">
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_notice_type_1" name="search_notice_type" class="form-check-input" value="1" <?=$checked['search_notice_type']['1']?>>
													<label class="form-check-label" for="search_notice_type_1">제품코드(키) 발송</label>
												</div>
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_notice_type_2" name="search_notice_type" class="form-check-input" value="2" <?=$checked['search_notice_type']['2']?>>
													<label class="form-check-label" for="search_notice_type_2">프로모션</label>
												</div>
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_notice_type_3" name="search_notice_type" class="form-check-input" value="3" <?=$checked['search_notice_type']['3']?>>
													<label class="form-check-label" for="search_notice_type_3">상품 출시/판매</label>
												</div>
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_notice_type_4" name="search_notice_type" class="form-check-input" value="4" <?=$checked['search_notice_type']['4']?>>
													<label class="form-check-label" for="search_notice_type_4">기타</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_title" class="col-sm-3 col-form-label bg-light border">제목</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_title" name="search_title" placeholder="제목검색" value="<?=$search_title?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-5">
										<div class="row">
											<label class="col-sm-3 col-form-label bg-light border">노출여부</label>
											<div class="col-sm-9">
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_is_view_all" name="search_is_view" class="form-check-input" value="" <?=$checked['search_is_view']['']?>>
													<label class="form-check-label" for="search_is_view_all">전체</label>
												</div>
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_is_view_y" name="search_is_view" class="form-check-input" value="Y" <?=$checked['search_is_view']['Y']?>>
													<label class="form-check-label" for="search_is_view_y">노출</label>
												</div>
												<div class="form-check form-check-inline mt-2">
													<input type="radio" id="search_is_view_n" name="search_is_view" class="form-check-input" value="N" <?=$checked['search_is_view']['N']?>>
													<label class="form-check-label" for="search_is_view_n">미노출</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">공지사항 검색</button>
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
							<div class="float-start"><?=number_format($notice_list->total_results)?> 개</div>
						</div>

						<div class="table-responsive">
							<table class="table table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
								<thead class="table-light font-13">
									<tr>
										<th class="text-center all" style="width:20px">
											<div class="form-check text-center">
												<input type="checkbox" class="form-check-input" id="customCheck1">
												<label class="form-check-label" for="customCheck1">&nbsp;</label>
											</div>
										</th>
										<th class="text-center" style="width:70px">고유번호</th>
										<th class="text-center" style="width:130px">구분</th>
										<th class="text-center">제목</th>
										<th class="text-center" style="width:150px">작성일자<br/>(수정일자)</th>
										<th class="text-center" style="width:150px">배포일자</th>
										<th class="text-center" style="width:90px">노출</th>
										<th class="text-center" style="width:90px">조회수</th>
										<th class="text-center" style="width:100px">비고</th>
									</tr>
								</thead>
								<tbody class="font-12 bg-white">
								<?
								if($notice_list->success == true){
									$result = $notice_list->resultset->fetchAll();

									$num = $notice_list->total_results;
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
									<td class="text-center px-1"><?=$gubun_array[$value['notice_type']]?></td>
									<td class="text-start px-1"><?if($value['is_notice']=="Y"){?><span class="badge badge-outline-danger">공지</span><?}?> <?=$value['subject']?></td>
									<td class="text-center px-1"><?=$value['reg_date']?></td>
									<td class="text-center px-1"><?=$value['deploy_date']?></td>
									<td class="text-center px-1"><?=$value['is_view']=='Y'?'O':'X'?></td>
									<td class="text-center px-1"><?=number_format($value['hit'])?></td>
									<td class="text-center px-1">
										<a href="notice_view.php?idx=<?=$value['idx']?>" class="action-icon"> <i class="mdi mdi-eye"></i></a>
										<a href="notice_register.php?mode=modify&idx=<?=$value['idx']?>" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
										<a href="javascript:void(0)" class="action-icon btn_delete" data-idx="<?=$value['idx']?>"><i class="mdi mdi-delete"></i></a>
									</td>
								</tr>
								<?
										$num--;
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
	$(".btn_delete").bind("click",function(){
		var index = $(".btn_delete").index(this);
		var idx = $(".btn_delete").eq(index).attr("data-idx");
		if(confirm("정말로 삭제하시겠습니까?")){
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
		}
	});
});
</script>
</body>
</html>
