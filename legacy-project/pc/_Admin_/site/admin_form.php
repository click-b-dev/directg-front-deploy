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

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_NUMBER_INT);

//idx 가 있으면 수정, 없으면 등록
$is_modify = ($idx<>"");
$page_title = $is_modify ? "관리자 수정" : "관리자 등록";

try{
	//tbl_admin 은 구 DB(directgames)에 있다
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$adminMember = new AdminMember($conn_dgkr);
	$level_list = AdminMember::adminLevelList();

	$data = array('admin_id'=>'', 'admin_name'=>'', 'admin_hp'=>'', 'admin_level'=>10, 'status'=>'y');

	if($is_modify){
		$data = $adminMember->getAdmin($idx);
		if(!$data){
			msg("존재하지 않는 관리자입니다.","admin_list.php");
			exit;
		}
	}

	//본인 계정을 수정 중인지 — 본인은 권한/상태를 바꾸지 못하게 막는다(스스로 잠기는 사고 방지)
	$is_self = ($is_modify && $data['admin_id']==$_SESSION['admin']['admin_id']);

	//드롭다운에서 선택할 권한값.
	//과거 데이터에는 admin_level 이 NULL 인 계정이 있는데, 그대로 두면 일치하는 option 이 없어
	//브라우저가 첫 항목(상품조회 전용)을 고르고 저장 시 조용히 강등된다. 일반 관리자로 기본 선택시킨다.
	$selected_level = (int)$data['admin_level'];
	if(!isset($level_list[$selected_level])){
		$selected_level = 10;
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
										<li class="breadcrumb-item"><a href="admin_list.php">관리자 계정 관리</a></li>
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
							<form name="adminFrm" id="adminFrm" method="post" action="admin_ps.php">
							<input type="hidden" name="mode" value="<?=$is_modify?"modify":"register"?>">
							<input type="hidden" name="idx" value="<?=$idx?>">

							<div class="row mb-3">
								<label class="col-sm-2 col-form-label">아이디 <span class="text-danger">*</span></label>
								<div class="col-sm-5">
									<?if($is_modify){?>
									<input type="text" class="form-control" value="<?=htmlspecialchars($data['admin_id'])?>" readonly>
									<div class="form-text">아이디는 변경할 수 없습니다.</div>
									<?}else{?>
									<input type="text" class="form-control" name="admin_id" id="admin_id" value="" maxlength="50" required>
									<div class="form-text">영문/숫자 조합을 권장합니다. 중복된 아이디는 등록할 수 없습니다.</div>
									<?}?>
								</div>
							</div>

							<div class="row mb-3">
								<label class="col-sm-2 col-form-label">비밀번호 <?if(!$is_modify){?><span class="text-danger">*</span><?}?></label>
								<div class="col-sm-5">
									<input type="password" class="form-control" name="admin_pwd" id="admin_pwd" value="" maxlength="50" autocomplete="new-password" <?=$is_modify?"":"required"?>>
									<?if($is_modify){?>
									<div class="form-text">변경할 때만 입력하세요. <span class="fw-bold">비워두면 기존 비밀번호가 유지됩니다.</span></div>
									<?}?>
								</div>
							</div>

							<div class="row mb-3">
								<label class="col-sm-2 col-form-label">이름 <span class="text-danger">*</span></label>
								<div class="col-sm-5">
									<input type="text" class="form-control" name="admin_name" id="admin_name" value="<?=htmlspecialchars($data['admin_name'])?>" maxlength="30" required>
								</div>
							</div>

							<div class="row mb-3">
								<label class="col-sm-2 col-form-label">연락처</label>
								<div class="col-sm-5">
									<input type="text" class="form-control" name="admin_hp" id="admin_hp" value="<?=htmlspecialchars($data['admin_hp'])?>" maxlength="15" placeholder="010-0000-0000">
								</div>
							</div>

							<div class="row mb-3">
								<label class="col-sm-2 col-form-label">권한 <span class="text-danger">*</span></label>
								<div class="col-sm-5">
									<select class="form-select" name="admin_level" id="admin_level" <?=$is_self?"disabled":""?>>
									<?
										foreach($level_list as $level_value=>$level_name){
									?>
										<option value="<?=$level_value?>" <?=($selected_level==$level_value)?"selected":""?>><?=$level_name?> (<?=$level_value?>)</option>
									<?
										}
									?>
									</select>
									<?if($is_self){?>
									<input type="hidden" name="admin_level" value="<?=$selected_level?>">
									<div class="form-text text-danger">본인 계정의 권한은 변경할 수 없습니다. 다른 최고관리자에게 요청하세요.</div>
									<?}?>
									<?if($is_modify && !isset($level_list[(int)$data['admin_level']])){?>
									<div class="form-text text-danger">현재 권한값이 <span class="fw-bold"><?=AdminMember::adminLevelName($data['admin_level'])?></span> 입니다. 저장하면 위에 선택된 등급으로 변경됩니다.</div>
									<?}?>
								</div>
							</div>

							<div class="row mb-3">
								<label class="col-sm-2 col-form-label">상태 <span class="text-danger">*</span></label>
								<div class="col-sm-5">
									<select class="form-select" name="status" id="status" <?=$is_self?"disabled":""?>>
										<option value="y" <?=($data['status']=="y")?"selected":""?>>사용</option>
										<option value="0" <?=($data['status']<>"y")?"selected":""?>>중지</option>
									</select>
									<?if($is_self){?>
									<input type="hidden" name="status" value="<?=htmlspecialchars($data['status'])?>">
									<div class="form-text text-danger">본인 계정의 상태는 변경할 수 없습니다.</div>
									<?}else{?>
									<div class="form-text">중지된 계정은 로그인할 수 없습니다.</div>
									<?}?>
								</div>
							</div>

							<?if($is_modify){?>
							<div class="row mb-3">
								<label class="col-sm-2 col-form-label">최종 로그인</label>
								<div class="col-sm-5">
									<div class="form-control-plaintext"><?=$data['login_date']?$data['login_date']." (".htmlspecialchars($data['ip']).")":"기록 없음"?></div>
								</div>
							</div>
							<?}?>

							<div class="text-center mt-4">
								<a href="admin_list.php" class="btn btn-secondary">목록</a>
								<button type="submit" class="btn btn-primary" id="btn_submit"><?=$is_modify?"수정":"등록"?></button>
							</div>
							</form>
						</div>
					</div>

				</div>
			</div>
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</div>

<script>
$(function(){
	$("#adminFrm").bind("submit",function(){
		var admin_name = $("#admin_name").val().replace(/\s/g,"");
		if(admin_name==""){
			alert("이름을 입력해주세요.");
			return false;
		}

	<?if(!$is_modify){?>
		var admin_id = $("#admin_id").val().replace(/\s/g,"");
		if(admin_id==""){
			alert("아이디를 입력해주세요.");
			return false;
		}
		if($("#admin_pwd").val()==""){
			alert("비밀번호를 입력해주세요.");
			return false;
		}
	<?}?>

		//최고관리자 권한 부여는 되돌리기 어려우므로 한 번 더 확인
		if($("#admin_level").val()=="99"){
			if(!confirm("최고 관리자 권한을 부여합니다.\n전체 기능과 관리자 계정 관리까지 사용할 수 있습니다.\n계속하시겠습니까?")){
				return false;
			}
		}
		return true;
	});
});
</script>
</body>
</html>
