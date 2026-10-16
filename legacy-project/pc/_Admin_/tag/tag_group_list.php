<?
$sidebar_file = "sidebar_goods.php";
	header('Content-Type: text/html; charset=UTF-8');
	ini_set( "display_errors", 1 );
	error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

	$topmenu['tag'] = "active";

	$page_title="TAG 그룹현황";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$admin= new Admin($conn);

	//스팀tag수
	$category_depth1 = $admin->getTagGroupList("1");

	$tag_group_array =array();

	$group_code=array(
		"G"=>"장르",
		"P"=>"플레이어 지원",
		"M"=>"분위기/세계관",
		"T"=>"테마/주제",
		"F"=>"기능/콘텐츠",
		"V"=>"시점/그래픽",
		"A"=>"평가",
		"E"=>"기타",
	);

	//exit;

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
					<div class="col-12">
						<table class="table table-bordered">
							<colgroup>
								<col width="10%"/>
								<col width="*"/>
							</colgroup>
						<tbody>
							<?
								foreach($category_depth1 as $key=>$value){
							?>
							<tr>
								<th class='table-active text-center border'>[<?=$value['tags_group_code']?>] <br/><?=$value['tags_group_name']?><br/><?=$value['idx']?></th>
								<td class='p-2'>
									<div class="row g-2">
										<?
											$tag_group_array = $admin->getTagGroupList("2",$value['idx']);
											foreach($tag_group_array as $sub_key=>$sub_value){
										?>
										<div class="col-3">
											<div class="accordion " id="category_<?=$sub_value['idx']?>">
												<div class="accordion-item">
													<h2 class="accordion-header">
														<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse<?=$sub_value['tags_group_code']?>" aria-expanded="false" aria-controls="flush-collapse<?=$sub_value['tags_group_code']?>">[<?=$sub_value['tags_group_code']?>] <?=$sub_value['tags_group_name']?></button>
													</h2>
													<div id="flush-collapse<?=$sub_value['tags_group_code']?>" class="accordion-collapse collapse" data-bs-parent="#category_<?=$sub_value['idx']?>">
														<div class="accordion-body p-0">
															<ul class="list-group">
															<?
																$tag_list = $admin->getTagGroupTagList($sub_value['tags_group_code']);
																foreach($tag_list as $tag){
															?>
																<li class="list-group-item d-flex justify-content-between align-items-center" id="tooltip-container<?=$tag['tag_code']?>">
																	[<?=$tag['tag_code']?>] <?=$tag['tag_name']?>
																	
																</li>
															<?
																}
															?>
															</ul>
														</div>
													</div>
												</div>
											</div>
										</div>
										<?
											}
										?>
										</div>
									</td>
								</tr>
							<?
								}
							?>
							</tbody>
						</table>
					</div>
				</div>
			</div> <!-- container -->
		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_tag_delete").bind("click",function(){
		var index = $(".btn_tag_delete").index(this);
		var tag_name = $(".btn_tag_delete").eq(index).attr('data-tag');
		var mode = $(".btn_tag_delete").eq(index).attr('data-mode');
		
		//return;
		//return;
		$.ajax({
			 type: "POST",
			 url: "tag_group_ps.php",
			 data: {mode:mode,tag_name:tag_name},
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
