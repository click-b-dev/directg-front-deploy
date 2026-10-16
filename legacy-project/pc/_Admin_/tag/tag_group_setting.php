<?
$sidebar_file = "sidebar_goods.php";
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	$topmenu['tag'] = "active";

	$page_title="TAG 그룹설정";
	
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	//스팀tag수
	$tag_group_non_data = $admin->getTagGroupNonList();

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">TAG 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row">
					<div class="col-8">
						<div class="card">
							<div class="table-responsive">
								<form class="form-horizontal">
								<table class="table table-centered w-100 table-bordered nowrap table-sm" id="">
									<thead class="table-light">
										<tr>
											<th class="text-center">번호</th>
											<th class="text-center">태그명(국문)</th>
											<th class="text-center">태그명(영문)</th>
											<th class="text-center">태그그룹</th>
											<th class="text-center">비고</th>
										</tr>
									</thead>
									<tbody>
									<?
										$num=1;
										foreach($tag_group_non_data as $key=>$value){
											//태그등록여부 체크
									?>
									<tr>
										<td class="text-center"><?=$num?></td>
										<td><?=$value['tag_name']?></td>
										<td><?=$value['tag_name_en']?></td>
										<td>
											<select name="tag_group_code[]" class="form-select">
												<option value="">:::TAG 그룹 선택:::</option>
												<option value="G0" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르</option>
												<option value="GT001" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 액션 태그</option>
												<option value="GT002" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 어드벤처 태그</option>
												<option value="GT003" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > RPG 태그</option>
												<option value="GT004" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 전략 태그</option>
												<option value="GT005" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 시뮬레이션 태그</option>
												<option value="GT006" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 스포츠 태그</option>
												<option value="GT007" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 캐주얼 태그</option>
												<option value="GT009" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 레이싱 태그</option>
												<option value="GT008" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임장르 > 인디 태그</option>
												<option value="C0001" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임카테고리 > 플레이어 수</option>
												<option value="C0002" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임카테고리 > 화면 및 디스플레이</option>
												<option value="C0003" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임카테고리 > VR 및 컨트롤러 지원</option>
												<option value="C0004" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임카테고리 > 게임 서비스 및 기능</option>
												<option value="C0005" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임카테고리 > 접근성 기능</option>
												<option value="T0001" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임태그 > 그래픽 스타일</option>
												<option value="T0002" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임태그 > 게임 시점</option>
												<option value="T0003" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임태그 > 게임 테마</option>
												<option value="T0004" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임태그 > 게임 기능/특징</option>
												<option value="T0005" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임태그 > 플레이 방식</option>
												<option value="T0006" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>게임태그 > 평가</option>
												<option value="P0001" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>PlayStation > VR 장비 및 액세서리</option>
												<option value="P0002" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>PlayStation > 디스플레이 연동 장비</option>
												<option value="P0003" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>PlayStation > 입력 및 제어 장비</option>
												<option value="P0004" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>PlayStation > 오디오 및 커뮤니케이션 장비</option>
												<option value="P0005" <?=$selected['tag_group_code'][$value['tag_group_code']]?>>PlayStation > 충전 및 거치 장비</option>
											</select>
										</td>
										<td class="text-center"><button class="btn btn-secondary btn-sm shadow-none btn_tag_group" type="button" data-num="<?=$value['idx']?>" data-mode="tag_group_config">TAG 그룹설정</button></td>
									</tr>
									<?
											$total_game+=$value['game_count'];
											$total_dlc+=$value['dlc_count'];
											$num++;
										}
									?>
									</tbody>
								</table>
								</form>
							</div>
						</div>
					</div>
				</div>
				<!-- end row -->
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_tag_group").bind("click",function(){
		var index = $(".btn_tag_group").index(this);
		var num = $(".btn_tag_group").eq(index).attr('data-num');
		var mode = $(".btn_tag_group").eq(index).attr('data-mode');
		var tag_group_code = $("select[name='tag_group_code[]']:eq("+index+") option:selected").val();
		console.log(mode);
		console.log(tag_group_code);
		
		//return;
		//return;
		$.ajax({
			 type: "POST",
			 url: "tag_group_ps.php",
			 data: {mode:mode,tag_group_code:tag_group_code,num:num},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert(data);
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
