<?

$sidebar_file = "sidebar_goods.php";
$page_title = "스팀 Apps 검색";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_publisher = filter_input(INPUT_GET, 'search_publisher', FILTER_SANITIZE_STRING);
$search_developer = filter_input(INPUT_GET, 'search_developer', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_NUMBER_INT);
$search_app_type = filter_input(INPUT_GET, 'search_app_type', FILTER_SANITIZE_STRING);
$is_free = filter_input(INPUT_GET, 'is_free', FILTER_SANITIZE_STRING);
$supported_languages = filter_input(INPUT_GET, 'supported_languages', FILTER_SANITIZE_STRING);

	if(!$page){
		$page=1;
	}

	$param ="";

	$where = [];
//	$where[] = " a.coming_soon_date is null";

	//$where[] = " (a.coming_soon_date<>'출시 예정 게임' and a.coming_soon_date<>'발표 예정' and a.coming_soon_date<>'')";
	//$where[] = " MATCH(a.publisher) AGAINST('-Paradox Interactive' IN BOOLEAN MODE)";

	if(isset($search_appid) && $search_appid<>""){
		$where[] = "a.appid='".$search_appid."'";
	}

	if(isset($search_name) && $search_name<>""){
		$where[] = "a.name REGEXP '".$search_name."'";
	}

	if(isset($is_free) && $is_free<>""){
		$where[] = " is_free='".$is_free."'";
	}
	
	if(isset($search_developer) && $search_developer<>""){
		$where[] = " a.developer REGEXP '".$search_developer."'";
	}
	
	if(isset($supported_languages) && $supported_languages<>""){
		$where[] = " a.supported_languages REGEXP'".$supported_languages."'";
	}

	if(isset($search_app_type) && $search_app_type<>"all"){
		$where[] = " app_type='".$search_app_type."'";
		if($search_app_type<>'game'){
		//$where[] = " batch_date is null";
		}
	}else{
		$search_app_type = "all";
	}


if(isset($search_publisher) && $search_publisher<>""){
	$publisher_text = explode(' ',$search_publisher);
	$search_publisher_label = implode(" ",$publisher_text);
	$search_publisher_label = "".$search_publisher_label;

	if(strlen($search_publisher)<3){
		//$where[] = " a.publisher like'".$search_publisher."%'";
	}else{
		//$where[] = " MATCH(a.publisher) AGAINST('".$search_publisher_label."' IN BOOLEAN MODE)";
	}
	
	$where[] = " a.publisher like'".$search_publisher."%'";

}


if(isset($search_year) && $search_year<>""){
	$where[] = " date_format(a.release_date,'%Y') ='".$search_year."'";
}

$selected['search_year'][$search_year] = "selected";


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

	//echo $add_where;

	$orderby = "a.coming_soon desc,a.release_date desc,a.batch_date desc";
	//$orderby = "a.appid desc";
	//$orderby = "a.recommendations desc,a.coming_soon desc,a.release_date desc";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn); 

	$app_list = $admin->getSteamListAll($page,$add_where,$orderby,$param);

	if(isset($search_app_type) && $search_app_type<>"all"){
		$query = "select publisher,count(*)as cc from steam_app_list where publisher<>'' and app_type='".$search_app_type."' group by publisher having count(*)>'5' order by count(*) desc";
	}else{
		$query = "select publisher,count(*)as cc from steam_app_list where publisher<>'' group by publisher having count(*)>'10' order by count(*) desc";
	}

	$stmt = $conn->prepare($query);
	$stmt->execute();
	$publisher_list = $stmt->fetchAll();

	$selected['search_publisher'][$search_publisher] = "selected";
	$checked['search_app_type'][$search_app_type] = "checked";

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
									<div class="col-md-2">
										<div class="row">
											<label for="search_year" class="col-sm-5 col-form-label col-form-label-sm bg-light border">스팀 출시연도</label>
											<div class="col-sm-7">
												<select class="form-select" id="search_year" name="search_year">
													<option value="">::선택::</option>
													<? for($i=2005;$i<=date('Y');$i++){?>
													<option value="<?=$i?>" <?=$selected['search_year'][$i]?>><?=$i?></option>
													<?}?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-4 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-4 col-form-label col-form-label-sm bg-light border">퍼블리셔</label>
											<div class="col-sm-8">
												<select id="search_publisher" name="search_publisher" class="form-select">
													<option value="">:::선택:::</option>
													<?
														foreach($publisher_list as $sub_value){
															$publisher_name = strip_tags(htmlspecialchars_decode($sub_value['publisher_name']));
													?>
													<option value="<?=$sub_value['publisher']?>" <?=$selected['search_publisher'][$sub_value['publisher']]?>><?=$sub_value['publisher']?> [<?=$sub_value['cc']?>]</option>
													<?
														}
													?>
												</select>
											</div>
										</div>
									</div>
									<div class="col-md-2 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-5 col-form-label col-form-label-sm bg-light border">스팀 APPID</label>
											<div class="col-sm-7">
												<input type="text" class="form-control form-control-sm" id="search_appid" name="search_appid" placeholder="스팀 APPID" value="<?=$search_appid?>">
											</div>
										</div>
									</div>
									<div class="col-md-4 mb-2">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-label col-form-label-sm bg-light border">스팀 상품명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="스팀 상품명" value="<?=$search_name?>">
											</div>
										</div>
									</div>
								</div>
								
								<div class="row">
									<div class="col-4 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-3 col-form-label col-form-label-sm bg-light border">스팀 APP TYPE</label>
											<div class="col-sm-9 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_app_type_all" name="search_app_type" class="form-check-input" value="all" <?=$checked['search_app_type']['all']?>>
													<label class="form-check-label" for="search_app_type_all">전체</label>
												</div>
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
											<label for="is_free" class="col-sm-5 col-form-label col-form-label-sm bg-light border">무료여부</label>
											<div class="col-sm-7">
												<div class="form-check form-check-inline mt-1">
													<input type="checkbox" id="is_free" name="is_free" class="form-check-input" value="1" <?=$checked['is_free']['1']?>>
													<label class="form-check-label" for="is_free">무료제공</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-3 mb-2">
										<div class="row">
											<label for="supported_languages" class="col-sm-4 col-form-label col-form-label-sm bg-light border">지원언어</label>
											<div class="col-sm-8">
												<input type="text" class="form-control form-control-sm" id="supported_languages" name="supported_languages" placeholder="" value="<?=$supported_languages?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-md12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">스팀 Apps 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body">

								<? echo number_format($app_list->total_results)?> 개
		
								<div class="table-responsive">
									<table class="table table-centered nowrap table-sm table-bordered" id="">
										<thead class="table-dark font-14">
											<tr>
												<th class="text-center" style="width: 100px;">스팀<br/>APPID</th>
												<th class="text-center">스팀 상품명</th>
												<th class="text-center" style="width: 100px;">스팀유형</th>
												<th class="text-center" style="width: 130px;">출시일</th>
												<th class="text-center" style="width: 100px;">스팀<br/>초기가격</th>
												<th class="text-center" style="width: 100px;">스팀<br/>판매가</th>
												<th class="text-center" style="width: 130px;">비고</th>
											</tr>
										</thead>
										<tbody class="font-13">
									<?
										if($app_list->success == true){
											$result = $app_list->resultset->fetchAll();

											foreach($result as $value){
												if($value['app_type']=="game"){
													$is_game = "Y";
													$rowspan="2";
												}else{
													$is_game = "N";
													$rowspan="2";
												}
									?>
											<tr class="app_<?=$value['appid']?>">
												<td class="text-center"><?=$value['appid']?></td>
												<td><?=$value['name']?></td>
												<td class="text-center"><?=$value['app_type']?></td>
												<td class="text-center"><?=($value['coming_soon'])?$value['coming_soon_date']:$value['release_date']?><br/>(<?=$value['release_date']?>)</td>
												<td class="text-end"><?=($value['is_free']=="1")?"":number_format($value['consumer_price']/100)?></td>
												<td class="text-end"><?=($value['is_free']=="1")?"무료":number_format($value['price']/100)?></td>
												<td class="text-center"><button class="btn btn-info btn-sm shadow-none btn_steam_sync" data-appid="<?=$value['appid']?>" >스팀 업데이트</button></td>
											</tr>
											<?if($value['app_type']<>'game'){?>
										<tr class="app_<?=$value['appid']?>">
											<th class="text-center bg-light">기본게임</th>
											<td colspan="6">
											<?
											
												$game_data = $admin->getSteamBasicGameAll($value['appid']);

												echo "[".$game_data."] ";
												$basic_game = $admin->getSteamAppinfoAll($game_data);
												echo $basic_game['name'];
											?>
											</td>
										</tr>
										<?}?>
											<tr class="app_<?=$value['appid']?>">
												<td colspan="7">
													<table class="table table-centered table-sm mb-0">
														<tbody class="font-13">
														<tr>
															<th class="bg-light text-center" style="width:100px">개발사</th>
															<td>
																<?
																	if($value['appid']>0){
																		$developer_data = $admin->getSteamDeveloper($value['appid']);
																		echo $developer_data['developer'];
																	}
																?>
															</td>
															<th class="bg-light text-center">퍼블리셔</th>
															<td><?=$value['publisher']?>
															</td>
															<th class="bg-light text-center">추천수</th>
															<td class="text-end"><?=number_format($value['recommendations'])?></td>
														</tr>
														<tr>
															<th class="bg-light text-center">지원언어</th>
															<td colspan="3"><?=str_replace('*음성이 지원되는 언어','',strip_tags(htmlspecialchars_decode($value['supported_languages']),''))?></td>
															<th class="bg-light text-center">한국어 지원</th>
															<td>
															<?
																
																$steam_support_language = explode(",",strip_tags($value['supported_languages']));
																$steam_support_language = str_replace('*음성이 지원되는 언어','',$steam_support_language);
																
																//print_r($steam_support_language);
																$interface_korean = "N";
																$spoken_korean ="N";

																foreach($steam_support_language as $language){
																	$language = str_replace('*음성이 지원되는 언어','',$language);
																	//echo $language."<br/>";
																	//echo $language."<br/>";
																	if(strpos($language, "한국어")!== false){
																		echo "<span class='badge bg-info text-light font-12 fw-normal '>인터페이스/자막</span> ";
																		$interface_korean = "Y";
																	}
																	
																	if(strpos($language, "한국어*")!== false){
																		echo "<span class='badge bg-info text-light font-12 fw-normal '>음성</span>";
																		$spoken_korean ="Y";
																		$interface_korean = "Y";
																	}
																}
															?>
															</td>
														</tr>
														<tr>
															<th class="bg-light text-center">동기화일자</th>
															<td colspan="4"><?=$value['batch_date']?></td>
															<td colspan="2"><?=date('Y-m-d H:i:s',$value['last_modified'])?></td>
														</tr>
														</tbody>
													</table>
												</td>
											</tr>
											<tr class="app_<?=$value['appid']?>">
												<th class="text-center bg-light">Package</th>
												<td colspan="6">
												<?
													$count = 0;
													if($value['appid']>0){
														$package_data = $admin->getSteamPackageAll($value['appid']);

														//print_r($package_data);

														foreach($package_data as $package){
															if($package['package_name']){
																echo "[".$package['packageid']."] ".$package['package_name']." / ".$package['package_release']." / ".$package['package_coming_soon']." / ".number_format($package['price_initial']/100)."<br/>";
															}else{
													?>
													<button class="btn btn-sm btn-secondary btn_steam_package shadow-none" data-packageid="<?=$package['packageid']?>" data-appid="<?=$value['appid']?>"><?=$package['packageid']?> 동기화</button>
													<?
															}
															$count++;
														}
													}
												?>
												</td>
											</tr>
										<? if($is_game=="Y"){?>
											<tr class="app_<?=$value['appid']?>">
												<th class="text-center bg-light">DLC</th>
												<td colspan="6">
												<?
													if($value['appid']>0){
														$dlc_data = $admin->getSteamDLCAll($value['appid']);
														foreach($dlc_data as $dlc){
															$dlc_name= $admin->getSteamAppinfoAll($dlc['dlc_appid']);
															if($dlc_name){
																echo "<p>[".$dlc['dlc_appid']."] ".$dlc_name['name'];
																echo " <button class='btn btn-sm btn-light btn_dlc_delete shadow-none border' data-appid='".$dlc['dlc_appid']."' >삭제</button></p>";
															}else{
													?>
													<button class="btn btn-sm btn-secondary btn_steam_sync shadow-none" data-appid="<?=$dlc['dlc_appid']?>" ><?=$dlc['dlc_appid']?> 동기화</button>
													<?
															}
															$count++;
														}

														//if($count=="0" || ($interface_korean<>"Y" && $spoken_korean<>"Y") || $value['publisher']=="Hede"){
													?>
													<button class="btn btn-sm btn-light btn_app_delete shadow-none border" data-appid="<?=$value['appid']?>" >삭제</button>
													<?
													//	}
													}
												?>
												</td>
											</tr>
										<?}else{?>
										<tr class="app_<?=$value['appid']?>">
											<td><button class="btn btn-sm btn-light btn_app_delete shadow-none border" data-appid="<?=$value['appid']?>" >삭제</button></td>
										</tr>
										<?}?>
											<?}?>
										<?}?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $app_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
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
	$(".btn_steam_package").bind("click",function(){
		var index = $(".btn_steam_package").index(this);
		var packageids = $(".btn_steam_package").eq(index).attr("data-packageid");
		var appid = $(".btn_steam_package").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "get_steam_package_info_all.php",
			 data: {mode:"steam_sync",packageids:packageids,appid:appid},
			 success: function (data, status) {
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
		$.ajax({
			 type: "GET",
			 url: "get_steam_app_info.php",
			 data: {mode:"steam_sync",appids:appids},
			 success: function (data, status) {
				location.reload();
				alert(data);
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});

	//앱삭제
	$(".btn_app_delete").bind("click",function(){
		var index = $(".btn_app_delete").index(this);
		var appids = $(".btn_app_delete").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "steam_app_delete.php",
			 data: {appids:appids},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				//alert(data);
				$(".app_"+appids).remove();
			 },
			error: function(data){
				 alert(data);
			 }
		});
	});
	
	$(".btn_dlc_delete").bind("click",function(){
		var index = $(".btn_dlc_delete").index(this);
		var appids = $(".btn_dlc_delete").eq(index).attr("data-appid");
		$.ajax({
			 type: "GET",
			 url: "steam_app_delete.php",
			 data: {appids:appids},
			 success: function (data, status) {
				//location.href='ezwel_goods_list.php';
				//location.reload();
				//alert(data);
				$(".btn_dlc_delete").eq(index).parent().remove();
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
