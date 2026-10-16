<?
$sidebar_file = "sidebar_site.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

//관리자 계정 관리는 최고관리자(99)만 접근 가능
if($_SESSION['admin']['admin_level']<>"99"){
	msg("접근 권한이 없습니다.","/_Admin_/main.php");
	exit;
}

$topmenu['site'] = "active";
$page_title = "관리자 계정 관리";

$search_keyword = filter_input(INPUT_GET, 'search_keyword', FILTER_SANITIZE_STRING);

try{
	//tbl_admin 은 구 DB(directgames)에 있다. 메인 DB($dsn)가 아님에 주의
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$adminMember = new AdminMember($conn_dgkr);
	$admin_list = $adminMember->getAdminList($search_keyword);
	$level_list = AdminMember::adminLevelList();

	//아이디 중복 경고 — tbl_admin 에 UNIQUE 인덱스가 없어 과거 데이터에 중복이 있을 수 있다
	$id_count = array();
	foreach($admin_list as $row){
		$id_count[$row['admin_id']] = isset($id_count[$row['admin_id']]) ? $id_count[$row['admin_id']]+1 : 1;
	}

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
										<li class="breadcrumb-item"><a href="javascript: void(0);">사이트</a></li>
										<li class="breadcrumb-item active"><?=$page_title?></li>
									</ol>
								</div>
								<h4 class="page-title"><?=$page_title?></h4>
							</div>
						</div>
					</div>
					<!-- end page title -->

					<div class="card">
						<div class="card-body">
							<div class="row mb-3">
								<div class="col-md-6">
									<form method="get" action="admin_list.php" class="d-flex">
										<input type="text" class="form-control me-2" name="search_keyword" value="<?=htmlspecialchars($search_keyword)?>" placeholder="아이디 또는 이름">
										<button type="submit" class="btn btn-secondary text-nowrap">검색</button>
									</form>
								</div>
								<div class="col-md-6 text-end">
									<a href="admin_form.php" class="btn btn-primary">관리자 등록</a>
								</div>
							</div>

							<div class="table-responsive">
								<table class="table table-bordered table-hover mb-0">
									<thead class="table-light">
										<tr class="text-center">
											<th>번호</th>
											<th>아이디</th>
											<th>이름</th>
											<th>연락처</th>
											<th>권한</th>
											<th>상태</th>
											<th>최종 로그인</th>
											<th>관리</th>
										</tr>
									</thead>
									<tbody>
									<?
										if(count($admin_list)==0){
									?>
										<tr><td colspan="8" class="text-center py-4">등록된 관리자가 없습니다.</td></tr>
									<?
										}
										foreach($admin_list as $row){
									?>
										<tr class="text-center">
											<td><?=$row['idx']?></td>
											<td class="text-start">
												<?=htmlspecialchars($row['admin_id'])?>
												<?if($id_count[$row['admin_id']] > 1){?>
												<span class="badge bg-danger" title="같은 아이디가 2개 이상 등록되어 있습니다. 로그인 시 어느 계정으로 붙을지 불확실합니다.">아이디 중복</span>
												<?}?>
											</td>
											<td><?=htmlspecialchars($row['admin_name'])?></td>
											<td><?=htmlspecialchars($row['admin_hp'])?></td>
											<td>
												<?if($row['admin_level']=="99"){?>
												<span class="badge bg-danger"><?=AdminMember::adminLevelName($row['admin_level'])?></span>
												<?}else if($row['admin_level']=="1"){?>
												<span class="badge bg-secondary"><?=AdminMember::adminLevelName($row['admin_level'])?></span>
												<?}else{?>
												<span class="badge bg-info"><?=AdminMember::adminLevelName($row['admin_level'])?></span>
												<?}?>
											</td>
											<td>
												<?if($row['status']=="y"){?>
												<span class="text-success fw-bold">사용</span>
												<?}else{?>
												<span class="text-danger fw-bold">중지</span>
												<?}?>
											</td>
											<td><?=$row['login_date']?$row['login_date']:"-"?></td>
											<td>
												<a href="admin_form.php?idx=<?=$row['idx']?>" class="btn btn-sm btn-outline-primary">수정</a>
												<?if($row['admin_id']<>$_SESSION['admin']['admin_id']){?>
													<?if($row['status']=="y"){?>
													<button type="button" class="btn btn-sm btn-outline-danger btn_status" data-idx="<?=$row['idx']?>" data-status="0" data-adminid="<?=htmlspecialchars($row['admin_id'])?>">중지</button>
													<?}else{?>
													<button type="button" class="btn btn-sm btn-outline-success btn_status" data-idx="<?=$row['idx']?>" data-status="y" data-adminid="<?=htmlspecialchars($row['admin_id'])?>">사용</button>
													<?}?>
												<?}else{?>
												<span class="badge bg-light text-dark">본인</span>
												<?}?>
											</td>
										</tr>
									<?
										}
									?>
									</tbody>
								</table>
							</div>

							<div class="alert alert-secondary mt-3 mb-0">
								<div class="fw-bold mb-1">권한 안내</div>
								<div>· <span class="fw-bold">최고 관리자(99)</span> — 전체 기능. 퍼블리셔 코드 수정, 이 화면 접근 가능</div>
								<div>· <span class="fw-bold">일반 관리자(10)</span> — 기본 관리 기능</div>
								<div>· <span class="fw-bold">상품조회 전용(1)</span> — 로그인 시 디지털상품 목록으로 이동, 상단메뉴가 상품 관련으로 제한됨</div>
								<div class="mt-2">계정은 삭제하지 않고 <span class="fw-bold">중지</span>로 관리합니다. 중지된 계정은 로그인할 수 없습니다.</div>
							</div>
						</div>
					</div>

				</div>
			</div>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</div>

<script>
$(function(){
	//사용/중지 토글 — 마지막 최고관리자 중지는 서버(admin_ps.php)에서 막는다
	$(".btn_status").bind("click",function(){
		var idx = $(this).data("idx");
		var status = $(this).data("status");
		var admin_id = $(this).data("adminid");
		var label = (status=="y") ? "사용" : "중지";

		if(!confirm("["+admin_id+"] 계정을 "+label+" 상태로 변경하시겠습니까?")){ return; }

		$.ajax({
			type:"POST",
			url:"admin_ps.php",
			data:{mode:"status",idx:idx,status:status},
			success:function(d){
				if(d.trim()!=""){ alert(d.trim()); }
				location.reload();
			},
			error:function(d){ alert("처리 중 오류가 발생했습니다."); }
		});
	});
});
</script>
</body>
</html>
