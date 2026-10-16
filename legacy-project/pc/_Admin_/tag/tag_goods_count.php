<?
$sidebar_file = "sidebar_goods.php";
	error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);
	$document_root= "/backend";
	$topmenu['tag'] = "active";

	$page_title="TAG별 옵션상품현황";
	
	header('Content-Type: text/html; charset=UTF-8');

	include_once($_SERVER['DOCUMENT_ROOT'].'/backend/conf/conf.php');
	include_once($_SERVER['DOCUMENT_ROOT'].'/backend/lib/lib.php');

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	//스팀tag수
	$steam_tag_data = $admin->getSteamTagCount_v2();

	$app_tag_count = array();

	foreach($steam_tag_data as $key=>$value){
		$chkTagCode = $admin->getTagGroupCode($value['tag_name']);
		$chkTagCount = $admin->chkTag($value['tag_name_ko']);
		//if(!$chkTagCode){
		//	if($chkTagCount=="0"){
				$app_tag_count[$value['tag_name']]['tag_name']=$value['tag_name'];
				$app_tag_count[$value['tag_name']]['tag_name_ko']=$value['tag_name_ko'];
				//$app_tag_count[$value['tag_name']]['tag_name_ko']=$value['tag_name_ko'];
				switch($value['app_type']){
					case "game":
						$app_tag_count[$value['tag_name']]['game_count']=$value['cc'];
					break;
					case "dlc":
						$app_tag_count[$value['tag_name']]['dlc_count']+=$value['cc'];
					break;
					case "music":
						$app_tag_count[$value['tag_name']]['dlc_count']+=$value['cc'];
					break;
				}
		//	}
		//}
	}

	//print_r($app_tag_count);

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
											<th class="text-center">태그명(영문)</th>
											<th class="text-center">태그명(국문)</th>
											<th class="text-center">Game 태그수</th>
											<th class="text-center">DLC 태그수</th>
											<th class="text-center">합계</th>
											<th class="text-center">TAG 정보수정</th>
											<th class="text-center">TAG 사용</th>
										</tr>
									</thead>
									<tbody>
									<?
										$num=1;
										foreach($app_tag_count as $key=>$value){
											//태그등록여부 체크
									?>
									<tr>
										<td class="text-center"><?=$num?></td>
										<td><?=$value['tag_name']?><input type="hidden" class="form-control" name="tag_name_en[]" value="<?=$value['tag_name']?>"></td>
										<td><input type="text" class="form-control" name="tag_name[]" value="<?=$value['tag_name_ko']?>"></td>
										<td class="text-end"><?=number_format($value['game_count'])?></td>
										<td class="text-end"><?=number_format($value['dlc_count'])?></td>
										<td class="text-end"><?=number_format($value['game_count']+$value['dlc_count'])?></td>
										<td class="text-center"><button class="btn btn-warning text-white btn-sm shadow-none btn_tag_modify" type="button" data-num="<?=$value['idx']?>" data-mode="tag_modify">TAG명(국문) 수정</button></td>
										<td class="text-center"><button class="btn btn-secondary btn-sm shadow-none btn_tag_register" type="button" data-num="<?=$value['idx']?>" data-mode="tag_register">TAG 사용 등록</button></td>
									</tr>
									<?
											$total_game+=$value['game_count'];
											$total_dlc+=$value['dlc_count'];
											$num++;
										}
									?>
									</tbody>
									<tfoot class="table-light">
									<tr>
										<th class="text-center" colspan="3">합계</th>
										<th class="text-end"><?=number_format($total_game)?></th>
										<th class="text-end"><?=number_format($total_dlc)?></th>
										<th class="text-end"><?=number_format($total_game+$total_dlc)?></th>
										<th class="text-end"></th>
										<th class="text-end"></th>
									</tr>
									</tfoot>
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
	$(".btn_tag_register").bind("click",function(){
		var index = $(".btn_tag_register").index(this);
		var num = $(".btn_tag_register").eq(index).attr('data-num');
		var mode = $(".btn_tag_register").eq(index).attr('data-mode');
		var tag_name = $("input[name='tag_name[]']").eq(index).val();
		var tag_name_en = $("input[name='tag_name_en[]']").eq(index).val();
		
		$.ajax({
			 type: "POST",
			 url: "tag_group_ps.php",
			 data: {mode:mode,tag_name:tag_name,tag_name_en:tag_name_en},
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
