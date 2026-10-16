<?
$sidebar_file = "sidebar_goods.php";
$page_title = "스팀 Apps 검색";
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_title_id = filter_input(INPUT_GET, 'search_title_id', FILTER_SANITIZE_STRING);
$search_app_type = filter_input(INPUT_GET, 'search_app_type', FILTER_SANITIZE_STRING);
$drm_notice = filter_input(INPUT_GET, 'drm_notice', FILTER_SANITIZE_STRING);
$ext_user_account_notice = filter_input(INPUT_GET, 'ext_user_account_notice', FILTER_SANITIZE_STRING);


	if(!$page){
		$page=1;
	}

	$where = [];
	$param ="";

	//$where[] = " publisher is null";

	if(isset($search_appid) && $search_appid<>""){
		$where[] = " steam_appid='".$search_appid."'";
	}

	if(isset($ext_user_account_notice) && $ext_user_account_notice<>""){
		$where[] = " ext_user_account_notice is not null";
	}

	if(isset($drm_notice) && $drm_notice<>""){
		$where[] = " drm_notice is not null";
	}

	if(isset($search_name) && $search_name<>""){
		$where[] = "name like '%".$search_name."%'";
	}

	if(isset($search_app_type) && $search_app_type<>"all"){
		$where[] = " app_type='".$search_app_type."'";
		if($search_app_type<>'game'){
		//$where[] = " batch_date is null";
		}
	}else{
		$search_app_type = "all";
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

	$orderby = "release_date desc";
	//$orderby = "batch_date asc";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 

	$goods_list = $admin->getSteamList($page,$add_where,$orderby,$param);

}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

$checked['search_app_type'][$search_app_type] = "checked";
$checked['ext_user_account_notice'][$ext_user_account_notice] = "checked";
$checked['drm_notice'][$drm_notice] = "checked";
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
									<li class="breadcrumb-item active">스팀 Apps 검색</li>
								</ol>
							</div>
							<h4 class="page-title">스팀 Apps 검색</h4>
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
									<div class="col-4 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">스팀 APP TYPE</label>
											<div class="col-sm-9 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_app_type_game" name="search_app_type" class="form-check-input" value="game" <?=$checked['search_app_type']['game']?>>
													<label class="form-check-label" for="search_app_type_game">Game</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_app_type_dlc" name="search_app_type" class="form-check-input" value="dlc" <?=$checked['search_app_type']['dlc']?>>
													<label class="form-check-label" for="search_app_type_dlc">DLC</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_app_type_music" name="search_app_type" class="form-check-input" value="music" <?=$checked['search_app_type']['music']?>>
													<label class="form-check-label" for="search_app_type_music">Music</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-2 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-5 col-form-labe col-form-label-sm bg-light border">스팀 APPID</label>
											<div class="col-sm-7">
												<input type="text" class="form-control form-control-sm" id="search_appid" name="search_appid" placeholder="스팀 APPID" value="<?=$search_appid?>">
											</div>
										</div>
									</div>
									<div class="col-4 mb-2">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">스팀 상품명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="스팀 상품명" value="<?=$search_name?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-2 mb-2">
										<div class="row">
											<label for="drm_notice" class="col-sm-5 col-form-labe col-form-label-sm bg-light border">제 3자 DRM</label>
											<div class="col-sm-7 mt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="drm_notice" name="drm_notice" class="form-check-input" value="Y" <?=$checked['drm_notice']['Y']?>>
													<label class="form-check-label" for="drm_notice">있음</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-2 mb-2">
										<div class="row">
											<label for="ext_user_account_notice" class="col-sm-5 col-form-labe col-form-label-sm bg-light border">타사 계정</label>
											<div class="col-sm-7 mt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="ext_user_account_notice" name="ext_user_account_notice" class="form-check-input" value="Y" <?=$checked['ext_user_account_notice']['Y']?>>
													<label class="form-check-label" for="ext_user_account_notice">있음</label>
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
				
				<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#app-modal">Steam App추가</button>

				<div class="mb-2"><? echo number_format($goods_list->total_results)?> 개</div>

				<div class="row">
					<div class="col-12">
						<div class="table-responsive">
							<table class="table table-centered nowrap table-sm table-bordered" id="">
								<thead class="table-dark">
									<tr>
										<th class="text-center" style="width: 100px;">스팀<br/>APPID</th>
										<th class="text-center" style="width: 100px;">스팀유형</th>
										<th class="text-center">스팀 상품명</th>
										<th class="text-center" style="width: 130px;">출시일</th>
										<th class="text-center" style="width: 100px;">스팀<br/>초기가격</th>
										<th class="text-center" style="width: 100px;">스팀<br/>판매가</th>
										<th class="text-center" style="width: 100px;">대표상품코드</th>
									</tr>
								</thead>
								<tbody>
							<?
								if($goods_list->success == true){
									$result = $goods_list->resultset->fetchAll();

									foreach($result as $value){
										if($value['app_type']=="game"){
											$is_game = "Y";
										}else{
											$is_game = "N";
										}
							?>
									<tr>
										<td class="text-center"><?=$value['steam_appid']?></td>
										<td class="text-center"><?=$value['app_type']?></td>
										<td><?=$value['name']?></td>
										<td class="text-center">
											<?=($value['coming_soon'])?$value['coming_soon_date']:$value['release_date']?>
										</td>
										<td class="text-end"><?=number_format($value['consumer_price']/100)?></td>
										<td class="text-end"><?=number_format($value['price']/100)?></td>
										<td class="text-center"><?=$value['title_id']?></td>
									</tr>
									<?if($value['app_type']<>'game'){?>
									<tr>
										<th class="text-center bg-light">기본게임</th>
										<td colspan="6">
										<?
											$game_data = $admin->getSteamBasicGame($value['steam_appid']);
											echo "[".$game_data."] ";
											$basic_game = $admin->getSteamAppinfo($game_data);
											echo $basic_game['name'];
										?>
										</td>
									</tr>
									<?}?>
									<tr>
										<th class="text-center bg-light">개발사</th>
										<td colspan="6"><?=$value['developer']?></td>
									</tr>
									<tr>
										<th class="text-center bg-light">퍼블리셔</th>
										<td colspan="6"><?=$value['publisher']?></td>
									</tr>
									<tr>
										<th class="text-center bg-light">제 3자 DRM	</th>
										<td colspan="6"><?=$value['drm_notice']?></td>
									</tr>
									<tr>
										<th class="text-center bg-light">타사 계정</th>
										<td colspan="6"><?=$value['ext_user_account_notice']?></td>
									</tr>
									<tr>
										<th class="text-center bg-light">동기화일자</th>
										<td colspan="6"><?=$value['batch_date']?></td>
									</tr>
									<tr>
										<th class="text-center bg-light">한국어지원</th>
										<td colspan="6">
											<?	 //echo $value['genre'];
												$supported_languages = explode(",",strip_tags($value['supported_languages']));
												
												//print_r($supported_languages);
												foreach($supported_languages as $sub_value){
													if(trim($sub_value)=="한국어"){
														echo "<span class='badge bg-secondary font-13 fw-normal'>인터페이스/자막</span>";
														$interface_korean = "Y";
													}

													if(trim($sub_value)=="한국어*"){
														echo "<span class='badge bg-secondary font-13 fw-normal'>인터페이스/자막</span> <span class='badge bg-secondary font-13 fw-normal'>음성</span>";
														$spoken_korean ="Y";
														$interface_korean = "Y";
													}
													//echo "<span class='badge bg-secondary font-13 fw-normal'>".$sub_value."</span> ";
												}
											?>
										</td>
									</tr>
									<tr>
										<th class="text-center bg-light">장르</th>
										<td colspan="7">
											<?	 //echo $value['genre'];
												$genre_list = explode(",",$value['genre']);
												foreach($genre_list as $sub_value){
													echo "<span class='badge bg-secondary font-13 fw-normal'>".$sub_value."</span> ";
												}
											?>
										</td>
									</tr>
									<tr>
										<th class="text-center bg-light">카테고리</th>
										<td colspan="7">
											<?// echo $value['category'];
												$category_list = explode(",",$value['category']);
												foreach($category_list as $sub_value){
												echo "<span class='badge bg-secondary font-13 fw-normal'>".$sub_value."</span> ";
												}
											?>
										</td>
									</tr>
									<tr class="">
										<th  class="text-center bg-light">태그(국문)</th>
										<td colspan="7">
											<?
												$tag_data = $admin->getSteamTagList_ko($value['steam_appid']);
												foreach($tag_data as $sub_key=>$sub_value){
													echo "<span class='badge bg-dark font-13 fw-normal'>[".$sub_key."] ".$sub_value."</span> ";
												}
											?>
										</td>
									</tr>
									<tr>
										<th  class="text-center bg-light">리뷰</th>
										<td colspan="7" class="">
											<button class="btn btn-sm btn-secondary shadow-none btn_review_steam_all" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">구매 평가 동기화</button>
										</td>
									</tr>
									<tr>
										<td colspan="8" class="">
											<button class="btn btn-info btn-sm shadow-none btn_steam_sync" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">스팀 동기화</button>
											<!--
											<button class="btn btn-sm btn-secondary shadow-none btn_steam_sync_desc" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">게임설명 동기화</button>
											<button class="btn btn-sm btn-success shadow-none btn_steam_sync_about_the_game" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">게임정보 동기화</button>
											<button class="btn btn-sm btn-secondary shadow-none btn_steam_sync_system" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">시스템요구사항 동기화</button>
											-->
											<button class="btn btn-sm btn-secondary shadow-none btn_steam_sync_genre" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">장르 동기화</button>
											<button class="btn btn-sm btn-secondary shadow-none btn_steam_sync_category" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">카테고리 동기화</button>
											<button class="btn btn-sm btn-secondary shadow-none btn_steam_sync_tag" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">TAG 동기화</button>
										</td>
									</tr>
									<tr>
										<td colspan="8">
											<?
												$review_data = $admin->getSteamReview($value['steam_appid']);
												if(count($review_data)>0){
											?>
											<table class="table table-centered table-sm table-bordered caption-top">
												<caption class="py-1">리뷰 현황</caption>
												<thead class="table-light font-13">
												<tr>
													<th class="text-center">language</th>
													<th class="text-center">purchase_type</th>
													<th class="text-center">review_score</td>
													<th class="text-center">review_score_desc</td>
													<th class="text-center">긍정 리뷰수</th>
													<th class="text-center">부정 리뷰수</th>
													<th class="text-center">전체 리뷰수</th>
												</tr>
												</thead>
												<tbody class="font-12">
												<?
													foreach($review_data as $review){
														if($review['total_reviews']>0){
												?>
												<tr>
													<td class="text-center"><?=$review['language']?></td>
													<td class="text-center"><?=$review['purchase_type']?></td>
													<td class="text-end"><?=$review['review_score']?></td>
													<td class="text-center"><?=$review['review_score_desc']?></td>
													<td class="text-end"><?=number_format($review['total_positive'])?><br/>(<?=round($review['total_positive']*100/$review['total_reviews'],2)?>%)</td>
													<td class="text-end"><?=number_format($review['total_negative'])?><br/>(<?=round($review['total_negative']*100/$review['total_reviews'],2)?>%)</td>
													<td class="text-end"><?=number_format($review['total_reviews'])?></td>
												</tr>
												<?	}
													}
												?>
												</tbody>
											</table>
											<?
												}
											?>
										</td>
									</tr>
									
									<tr>
										<td colspan="8">
											<?
												$package_data = $admin->getSteamPackage($value['steam_appid']);
												if(count($package_data)>0){
											?>
											<table class="table table-centered table-sm table-bordered caption-top">
											<caption class="py-1">Pakcage 현황</caption>
											<thead class="table-light font-13">
											<tr>
												<th class="text-center">번호</th>
												<th class="text-center">packageid</th>
												<th class="text-center">package_name</th>
												<th class="text-center">출시여부<br/>(출시일)</td>
												<th class="text-center">initial</th>
												<th class="text-center">final</th>
												<th class="text-center">individual</th>
												<th class="text-center">옵션상품코드</th>
												<th class="text-center">비고</th>
											</tr>
											</thead>
											<tbody class="font-12">
											<?
												$package_no =1;
												foreach($package_data as $package){
											?>
											<tr>
												<td class="text-center"><?=$package_no++?></td>
												<td class="text-center"><?=$package['packageid']?></td>
												<td><?=$package['package_name']?></td>
												<td class="text-center">
													<?=($package['package_coming_soon']=="1")?"예약판매":"일반판매"?>
													</br>(<?=$package['package_release']?>)
												</td>
												<td class="text-end"><?=number_format($package['price_initial']/100)?></td>
												<td class="text-end">
													<?=number_format($package['price_final']/100)?>
													<br/>( <?=$package['discount_percent']?>% )
												</td>
												<td class="text-end"><?=number_format($package['price_individual']/100)?></td>
												<td class="text-center"></td>
												<td class="text-center">
												<?if($package['package_coming_soon']<>"1"){?>
												<button class="btn btn-sm btn-secondary shadow-none btn_steam_package" data-packageid="<?=$package['packageid']?>" data-appid="<?=$value['steam_appid']?>">패키지 정보 동기화</button>
												<?}?>
												</td>
												
											</tr>
											<?
												}
											?>
											</tbody>
											</table>
											<?
												}
											?>
										</td>
									</tr>
								
								<? if($is_game=="Y"){?>
									<tr>
										<td colspan="8">
											<?
												$dlc_data = $admin->getSteamDLCList($value['steam_appid']);
												if(count($dlc_data)>0){
											?>
											<table class="table table-centered table-sm table-bordered caption-top">
												<caption class="py-1">DLC 현황</caption>
												<thead class="table-light font-13">
												<tr>
													<th class="text-center">번호</th>
													<th class="text-center">appid</th>
													<th class="text-center">app_name</th>
													<th class="text-center">app_type</th>
													<th class="text-center">출시여부<br/>(출시일)</td>
													<th class="text-center">initial</th>
													<th class="text-center">final</th>
													<th class="text-center">비고</th>
													<th class="text-center">삭제</th>
												</tr>
												</thead>
												<tbody class="font-12">
												<?
													$dlc_no =1;
													foreach($dlc_data as $dlc){
												?>
												<tr>
													<td class="text-center">
														<?
															if($dlc['consumer_price']>0){ echo $dlc_no++;}else{echo "-";}
														?>
													</td>
													<td class="text-center"><?=$dlc['dlc_appid']?></td>
													<td><?=$dlc['name']?></td>
													<td class="text-center"><?=$dlc['app_type']?></td>
													<td class="text-center">
														<?
															if($dlc['coming_soon']=="1"){
																echo "출시예정";
														?>
														</br>(<?=$dlc['coming_soon_date']?>)
														<?
															}else{
																echo "출시";
														?>
														</br>(<?=$dlc['release_date']?>)
														<?
															}
														?>
														
													</td>
													<td class="text-end">
														<?
															if($dlc['is_free']=="1"){
																echo "무료";
															}else{
																if($dlc['consumer_price']>0){
																	
														?>
														<?=number_format($dlc['consumer_price']/100)?>
														<?	
																}else{
																	if($dlc['coming_soon']=="1"){
																		echo "판매예정";
																	}else{
																		echo "판매중지";
																	}
																	
																}
															}
														?>
													</td>
													<td class="text-end">
														<?
															if($dlc['is_free']=="1"){
																echo "-";
															}else{
																if($dlc['price']>0){
														?>
														<?=number_format($dlc['price']/100)?>
														<?
																}else{
																	echo "-";
																}
															}
														?>
													</td>
													<td class="text-center">
													<?if($dlc['coming_soon']<>"1"){?>
													<button class="btn btn-sm btn-secondary shadow-none btn_steam_dlc" data-appid="<?=$dlc['dlc_appid']?>">DLC 정보 동기화</button>
													<?}?>
													</td>
													<td class="text-center"><button class="btn btn-sm btn-danger shadow-none btn_steam_app_delete" data-appid="<?=$dlc['dlc_appid']?>">삭제</button></td>
													
												</tr>
												<?
														
													}
												?>
												</tbody>
											</table>
											<?
												}
											?>
										</td>
									</tr>
								<?}?>
							
									<?}?>
								<?}?>
								</tbody>
							</table>
						</div>

						<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>

					</div> <!-- end col -->
				</div>
				<!-- end row -->   
				
			</div> <!-- container -->

		</div> <!-- content -->
</div>
	
	<div id="app-modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header modal-colored-header bg-primary">
					<h5 class="modal-title" id="topModalLabel">Steam App 등록</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
				</div>
				<div class="modal-body">
					<form method="get" action="get_steam_game_info.php" class="ps-3 pe-3" class="form-horizontal">
						<div class="mb-2 row">
							<label for="product_code" class="col-sm-3 col-form-label bg-light">appid</label>
							<div class="col-sm-9">
								<input type="text" id="appids" name="appids" class="form-control"  value="" required>
							</div>
						</div>

						<div class="mb-2 text-center">
							<button class="btn btn-primary shadow-none" type="button" id="btn_app_register">Steam App 등록</button>
						</div>
					</form>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script>
$(document).ready(function(){
	$(".btn_steam_package").bind("click",function(){
		var index = $(".btn_steam_package").index(this);
		var packageids = $(".btn_steam_package").eq(index).attr("data-packageid");
		var appid = $(".btn_steam_package").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_package_info.php",
			 data: {mode:"steam_sync",packageids:packageids,appid:appid},
			 success: function (data, status) {
				alert(data);
				location.reload();
				//alert("완료");
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	$(".btn_steam_dlc").bind("click",function(){
		var index = $(".btn_steam_dlc").index(this);
		var appids = $(".btn_steam_dlc").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_dlc").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"dlc_sync",appids:appids,title_id:title_id},
			 success: function (data, status) {
				  alert(data);
				location.reload();
				//alert("완료");
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	//Steam App등록
	$("#btn_app_register").bind("click",function(){
		var appids = $("input[name='appids']").val();
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"steam_sync",appids:appids},
			 success: function (data, status) {
				alert(data);
				//alert("완료");
				location.reload();
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
				 alert(data);
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
	
	//리뷰 동기화 - steam 전체
	$(".btn_review_steam_all").bind("click",function(){
		var index = $(".btn_review_steam_all").index(this);
		var appids = $(".btn_review_steam_all").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_review.php",
			 data: {purchase_type:"all",appids:appids,language:"all"},
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
	
	//리뷰 동기화 - steam 구매 전체
	$(".btn_review_steam").bind("click",function(){
		var index = $(".btn_review_steam").index(this);
		var appids = $(".btn_review_steam").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_review.php",
			 data: {purchase_type:"steam",appids:appids,language:"all"},
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
	
	//리뷰 동기화 - non-steam 구매 전체
	$(".btn_review_non_steam").bind("click",function(){
		var index = $(".btn_review_non_steam").index(this);
		var appids = $(".btn_review_non_steam").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_review.php",
			 data: {purchase_type:"non_steam_purchase",appids:appids,language:"all"},
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
	
	//리뷰 동기화 - steam 구매 대한민국
	$(".btn_review_steam_kr").bind("click",function(){
		var index = $(".btn_review_steam_kr").index(this);
		var appids = $(".btn_review_steam_kr").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_review.php",
			 data: {purchase_type:"steam",appids:appids,language:"koreana"},
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
	
	//리뷰 동기화 - non-steam 구매 대한민국
	$(".btn_review_non_steam_kr").bind("click",function(){
		var index = $(".btn_review_non_steam_kr").index(this);
		var appids = $(".btn_review_non_steam_kr").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_review.php",
			 data: {purchase_type:"non_steam_purchase",appids:appids,language:"koreana"},
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
	
	//게임정보 동기화 (btn_steam_sync_about_the_game)
	$(".btn_steam_sync_about_the_game").bind("click",function(){
		var index = $(".btn_steam_sync_about_the_game").index(this);
		var appids = $(".btn_steam_sync_about_the_game").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync_about_the_game").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_game_info.php",
			 data: {mode:"about_the_game_sync",appids:appids,title_id:title_id},
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
});
</script>
</body>
</html>
