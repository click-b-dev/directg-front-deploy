<?
$sidebar_file = "sidebar_goods.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page_title="스팀 DLC 현황";


$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$is_free = filter_input(INPUT_GET, 'is_free', FILTER_SANITIZE_STRING);


	if(!$page){
		$page=1;
	}

	$where = [];
	$param ="";

	$where[] = " find_in_set(app_type,'dlc,music') and is_free<>'Y'";

	if(isset($search_appid) && $search_appid<>""){
		$where[] = " steam_appid='".$search_appid."'";
	}

	if(isset($search_name) && $search_name<>""){
		$where[] = "name like '%".$search_name."%'";
	}

	if(isset($is_free) && $is_free<>""){
		$where[] = " is_free='".$is_free."'";
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}
		
	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	$orderby = "coming_soon desc,coming_soon_date desc,release_date desc,name desc";

	//$orderby = "batch_date desc,release_date desc";


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 

	$goods_list = $admin->getSteamAppDLC($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['is_free'][$is_free] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">스팀 동기화</a></li>
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
						<h5 class="card-header bg-secondary text-white">스팀 Apps 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row">
									<div class="col-2 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-5 col-form-label col-form-label-sm bg-light border">스팀 APPID</label>
											<div class="col-sm-7">
												<input type="text" class="form-control form-control-sm" id="search_appid" name="search_appid" placeholder="스팀 APPID" value="<?=$search_appid?>">
											</div>
										</div>
									</div>
									<div class="col-4 mb-2">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-label col-form-label-sm bg-light border">스팀 상품명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="스팀 상품명" value="<?=$search_name?>">
											</div>
										</div>
									</div>
									<div class="col-2 mb-2">
										<div class="row">
											<label for="is_free" class="col-sm-5 col-form-label col-form-label-sm bg-light border">무료여부</label>
											<div class="col-sm-7">
												<div class="form-check form-check-inline mt-1">
													<input type="checkbox" id="is_free" name="is_free" class="form-check-input" value="1" <?=$checked['is_free']['1']?>>
													<label class="form-check-label" for="is_free">무료제공</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-2 mb-2">
										<div class="row">
											<div class="col-lg-12">
												<div class="float-end">
													<button type="submit" class="btn btn-primary shadow-none">스팀 Apps 검색</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="mb-2"><? echo number_format($goods_list->total_results)?> 개</div>

				<div class="row">
					<div class="col-12">
						<div class="table-responsive">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-dark font-13">
									<tr>
										<th class="text-center">번호</th>
										<th class="text-center" style="width: 100px;">스팀<br/>APPID</th>
										<th class="text-center" style="width: 90px;">스팀유형</th>
										<th class="text-center">스팀 상품명</th>
										<th class="text-center" style="width: 100px;">출시여부</th>
										<th class="text-center" style="width: 120px;">출시일</th>
										<th class="text-center" style="width: 100px;">관련<br/>Package 수</th>
										<th class="text-center" style="width: 100px;">스팀<br/>초기가격</th>
										<th class="text-center" style="width: 100px;">스팀<br/>판매가</th>
										<th class="text-center" style="width: 100px;">옵션상품코드</th>
										<th class="text-center" style="width: 160px;">비고</th>
										<th class="text-center" style="width: 80px;">삭제</th>
									</tr>
								</thead>
								<tbody class="font-12">
							<?
								if($goods_list->success == true){
									$result = $goods_list->resultset->fetchAll();
									$num = 1;
									foreach($result as $value){
										$goods_option_info = $admin->getSteamAppChk($value['steam_appid']);
							?>
									<tr>
										<td class="text-center">
										<?
											if($value['consumer_price']>0){
												echo ($page-1)*50+$num++;
											}else{
												echo "-";
											}
										?>
										</td>
										<td class="text-center"><?=$value['steam_appid']?></td>
										<td class="text-center"><?=$value['app_type']?></td>
										<td>
											<p><?=$value['name']?></p>
											<?
												$supported_languages = explode(",",strip_tags($value['supported_languages']));
												
												//print_r($supported_languages);
												foreach($supported_languages as $sub_value){
													if(trim($sub_value)=="한국어"){
														echo "<span class='badge bg-secondary font-11 fw-normal'>인터페이스/자막</span>";
														$interface_korean = "Y";
													}

													if(trim($sub_value)=="한국어*"){
														echo "<span class='badge bg-secondary font-11 fw-normal'>인터페이스/자막</span> <span class='badge bg-secondary font-11 fw-normal'>음성</span>";
														$spoken_korean ="Y";
														$interface_korean = "Y";
													}
												}
											?><br/>
										<?
											$game_data = $admin->getSteamBasicGame($value['steam_appid']);
											$basic_game = $admin->getSteamAppinfo($game_data);
											echo "<span class='badge bg-info font-11'>기본게임</span> <span class=''>".$basic_game['name']." [".$game_data."] "."</span>";
										?>
										</td>
										<td class="text-center"><?=($value['coming_soon']=="1")?"<span class='text-danger'>출시예정</span>":"출시"?></td>
										<td class="text-center">
											<?//=($value['coming_soon'])?$value['coming_soon_date']:$value['release_date']?>
											<?=$value['release_date']?><br/>
											(<?=$value['coming_soon_date']?>)
										</td>
										<td  class="text-end">
										<?
											$package_data = $admin->getSteamPackage($value['steam_appid']);
											
											if(count($package_data)=="0"){
												echo "판매종료";
											}else{
												echo count($package_data);
											}
										?>
										</td>
										<td class="text-end">
										<?
											if($value["is_free"]=="1"){
												echo "무료";
											}else{
												echo number_format($value['consumer_price']/100);
											}
										?>
										</td>
										<td class="text-end">
										<?
											if($value["is_free"]=="1"){
												echo "-";
											}else{
												echo number_format($value['price']/100);
											}
										?>
										</td>
										<td class="text-center"><?=$goods_option_info['product_code']?></td>
										<td class="text-center">
										<button class="btn btn-sm btn-secondary shadow-none btn_steam_dlc" data-appid="<?=$value['steam_appid']?>"><?=$value['steam_appid']?> 동기화</button>
										<br/>(<?=$value['batch_date']?>)
										</td>
										<td class="text-center">
											<?if($goods_option_info['product_code']==""){?>
											<button class="btn btn-sm btn-danger shadow-none btn_steam_app_delete" data-appid="<?=$value['steam_appid']?>">삭제</button>
											<?}?>
										</td>
									</tr>
							<?
											//$num++;
										}
									}
								?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>

					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div> <!-- container -->

		</div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_steam_dlc").bind("click",function(){
		var index = $(".btn_steam_dlc").index(this);
		var appids = $(".btn_steam_dlc").eq(index).attr("data-appid");
		//var title_id = $(".btn_steam_dlc").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"dlc_sync",appids:appids},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert("완료");
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//태그 동기화
	$(".btn_steam_sync_tag").bind("click",function(){
		var index = $(".btn_steam_sync_tag").index(this);
		var appids = $(".btn_steam_sync_tag").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync_tag").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "./python/steam_app.py",
			 data: {appid:appids},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				$.ajax({
					 type: "POST",
					 url: "../tag/tag_ps.php",
					 data: {appid:appids},
					 success: function (data, status) {
						//location.href='ezwel_goods_list.php';
						location.reload();
						//alert(data);
					 },
					error: function(data){
						 alert(data);
					 }
				});
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(".btn_steam_app_delete").bind("click",function(){
		var index = $(".btn_steam_app_delete").index(this);
		var appids = $(".btn_steam_app_delete").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "steam_app_delete.php",
			 data: {mode:"dlc_sync",appids:appids},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				location.reload();
				//alert("완료");
				//alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});


	//게임설명 동기화
	$(".btn_steam_sync").bind("click",function(){
		var index = $(".btn_steam_sync").index(this);
		var appids = $(".btn_steam_sync").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"steam_sync",appids:appids,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				alert(data);
				location.reload();
				
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//게임설명 동기화
	$(".btn_steam_sync_desc").bind("click",function(){
		var index = $(".btn_steam_sync_desc").index(this);
		var appids = $(".btn_steam_sync_desc").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync_desc").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"steam_sync_desc",appids:appids,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//시스템요구사항 동기화
	$(".btn_steam_sync_system").bind("click",function(){
		var index = $(".btn_steam_sync_system").index(this);
		var appids = $(".btn_steam_sync_system").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync_system").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"steam_sync_system",appids:appids,title_id:title_id},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//헤더이미지 다운로드
	$(".btn_header_download").bind("click",function(){
		var index = $(".btn_header_download").index(this);
		var appid = $(".btn_header_download").eq(index).attr("data-appid");
		var image_type = $(".btn_header_download").eq(index).attr("data-type");
		$.ajax({
			 type: "GET",
			 url: "get_steam_image.php",
			 data: {mode:"header_download",appid:appid,image_type:image_type},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//썸네일 이미지 다운로드
	$(".btn_thumbnail_download").bind("click",function(){
		var index = $(".btn_thumbnail_download").index(this);
		var appid = $(".btn_thumbnail_download").eq(index).attr("data-appid");
		var image_type = $(".btn_thumbnail_download").eq(index).attr("data-type");
		$.ajax({
			 type: "GET",
			 url: "get_steam_image.php",
			 data: {mode:"thumbnail_download",appid:appid,image_type:image_type},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				alert(data);
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
