<?
$sidebar_file = "sidebar_goods.php";
$page_title = "스팀 출시예정 App";
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
ini_set("display_errors", 1);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

header("Content-Type:text/html; charset=utf-8");
	
$topmenu['goods'] = "active";
/*
출시일하고 평가도 필요합니다. 오래된 게임이지만 평가가 좋고 평가수가 많은 것(매우긍정적이상, 1,000개 이상의 평가), 평가와 관계 없이 최근 1년이내 출시나 출시 예정인 타이틀
*/

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_appid = filter_input(INPUT_GET, 'search_appid', FILTER_SANITIZE_STRING);
$search_name = filter_input(INPUT_GET, 'search_name', FILTER_SANITIZE_STRING);
$search_title_id = filter_input(INPUT_GET, 'search_title_id', FILTER_SANITIZE_STRING);

	if(!$page){
		$page=1;
	}

	$where = [];
	$param ="";


	//$where[] = " coming_soon_date<>'발표 예정'";

	if(isset($search_appid) && $search_appid<>""){
		$where[] = " appid='".$search_appid."'";
	}

	if(isset($search_name) && $search_name<>""){
		$where[] = "name like '%".$search_name."%'";
	}

	if(isset($search_title_id) && $search_title_id<>""){
		$where[] = " title_id='".$search_title_id."'";
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}
		
	$add_where = "";


try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	//퍼블리셔별 대표상품현황
	$title_publisher_data= $admin->getTitlePublisherCount();

	$publisher_list = [];
	foreach($title_publisher_data as $title_publisher){
		//if(strpos($title_publisher["publisher"],"'")) { 
			//$publisher_list[]=str_replace("'","",$title_publisher["publisher"]);
		//	echo $title_publisher["publisher"];
		//} else {
			//$tmp = explode(", ",$title_publisher["publisher"]);
			
			foreach($tmp as $sub){
				if($sub<>"LLC" && $sub<>"INC" && $sub<>"XD"&& $sub<>"Games"){
				//	$publisher_list[]=addslashes(str_replace("'","",trim($sub)));
					echo $sub."\n";
				}
			}

			if(strpos($title_publisher["publisher"],"'")){
				//echo $title_publisher["publisher"];
				//$publisher_list[]=addslashes($title_publisher["publisher"]);
			//	$publisher_list[]=str_replace("'","",$title_publisher["publisher"]);
			}else{
			//	$publisher_list[]=addslashes($title_publisher["publisher"]);
			}
			//$publisher_list[]=addslashes(str_replace("'","",$title_publisher["publisher"]));
		//}
		//echo $title_publisher["publisher"]."\n";
	}

	//echo count($publisher_list);


	//$where[] = " a.publisher REGEXP '".implode("|",$publisher_list)."'";
	$where[] = "a.publisher REGEXP 'Paradox Interactive|NEOWIZ|Deep Silver|2K|KONAMI|505 Games|Nacon|Focus Entertainment|DotEmu|Green Man Gaming|Kalypso Media|Cygames, Inc.|PID Games|Curve Games|Hooded Horse|Marvelous|Clouded Leopard|Rockstar Games|Shiro Games|THQ Nordic|CI Games|Red Hook Studios|Aspyr Media|Toplitz Productions|Wired Productions|SNK CORPORATION|Lightning Games|NIS America, Inc.|Original Fire Games|City Connection|Samurai Punk|ALLAF GAMES|D3PUBLISHER|Modus Games|HEYBOX|Versus Evil|CFK Co., Ltd.|Defiant Development|Merge Games|Grey Box|G-MODE|Arc System Works|MediBang|Haemimont Games|Maple Whispering Limited|Gearbox Publishing|Eleventh Hour Games|Funcom|inXile Entertainment|Arc Games|Com2us Holdings|Amanita Design|WayForward|Graffiti Games|MINTROCKET|Playstack|Anima Project|Frozenbyte|Pathea Games|Skybound Games|Square Enix|Bethesda Softworks|Playtonic Friends|NEXON|GRAVITY|SEGA|Capcom|GSC Game World|Cube Game|Silver Lining Interactive|United Label|Assemble Entertainment|Chimera Entertainment|Palmsoft|Goblinz Publishing|Lince Works|Raccoon Logic Studios Inc.|Super Rare Originals|505 Pulse|Urnique Studio|34BigThings srl|HitGrab|Outright Games Ltd.|Saber Interactive|Serenity Forge|Yooreka Studio|ZA/UM|ESDigital Games|Phiphen Games|Top Hat Studios, Inc.|Devolver Digital|tinyBuild|indie.io|Daedalic Entertainment|PQube|Raw Fury|Team17|Frontier Developments|Techland|Atari|HandyGames|11 bit studios|Giants Software|Private Division|PlayWay S.A|Exkee|Fatshark|Firestoke|Fireshine Games|VOID Interactive|Tuxedo Labs|Triternion|Akupara Games|Dear Villagers|qureate|Alawar|Intragames|Coatsink|101XP|Big Fan Games|Crytivo|Flashbulb|GrabTheGames|Hello Games|Secret Mode|CyberConnect2|Frontier|Tate Multimedia|Aspyr|Headup|SOEDESCO|Secret Mode|All in! Games|Snapshot Games Inc.|Sloclap|Skystone Games|Squanch Games, Inc.|Leonardo Interactive|Aerosoft GmbH|Bedtime Digital Games|Buff Studio|Dear Villagers|Digital Happiness|META Publishing|KMBOX'";
	//print_r($where);
	//exit;

	//$where[] = " MATCH(a.publisher) AGAINST('SEGA* CAPCOM* Paradox* THQ* Square* Focus* GSC* Iceberg* Daedalic* Devolver* Gearbox* Fulqrum* 2K* tinyBuild* Nacon* XSEED* Microids* Bethesda* 505* Team17* Kalypso* NIS* Deep Silver* PQube* Atari* Funcom* KONAMI* Marvelous* NEOWIZ* Versus* Activision* 11 bit* PlayStation* Hooded* ARC SYSTEM WORKS* CFK* Freedom* CITY* Curve* tinyBuild* Kalypso* Clouded* D3PUBLISHER* Daedalic* Capcom* Humble* Maximum* Wired* Graffiti* Private* HandyGames* Graffiti* Outright* Merge* Fireshine* Rockstar* Amanita* Microids* Headup* Frontier* Goblinz* HOOK* Aspyr* Science* Kepler* indie.io*' IN BOOLEAN MODE)";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	

	$orderby = "sort asc,a.coming_soon_date asc,a.release_date asc,a.batch_date asc";

	$app_list = $admin->getSteamComingSoon($page,$add_where,$orderby,$param);

	//print_r($app_list);

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
									<li class="breadcrumb-item"><a href="javascript: void(0);">스팀 동기화</a></li>
									<li class="breadcrumb-item active">스팀 출시예정 App</li>
								</ol>
							</div>
							<h4 class="page-title">스팀 출시예정 App</h4>
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
									<div class="col-lg-2 mb-2">
										<div class="row">
											<label for="search_appid" class="col-sm-5 col-form-labe col-form-label-sm bg-light border">스팀 APPID</label>
											<div class="col-sm-7">
												<input type="text" class="form-control form-control-sm" id="search_appid" name="search_appid" placeholder="스팀 APPID" value="<?=$search_appid?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5 mb-2">
										<div class="row">
											<label for="search_name" class="col-sm-3 col-form-labe col-form-label-sm bg-light border">스팀 상품명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control form-control-sm" id="search_name" name="search_name" placeholder="스팀 상품명" value="<?=$search_name?>">
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">스팀 Apps 검색</button>
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
										<thead class="table-dark">
											<tr>
												<th class="text-center" style="width: 100px;">스팀<br/>APPID</th>
												<th class="text-center">스팀 상품명</th>
												<th class="text-center" style="width: 100px;">스팀유형</th>
												<th class="text-center" style="width: 130px;">출시예정일</th>
												<th class="text-center" style="width: 100px;">스팀<br/>초기가격</th>
												<th class="text-center" style="width: 100px;">스팀<br/>판매가</th>
												<th class="text-center" style="width: 130px;">비고</th>
											</tr>
										</thead>
										<tbody class="font-13">
									<?
										if($app_list->success == true){
											$result = $app_list->resultset->fetchAll();

											//print_r(stripslashes($result));

											foreach($result as $value){
												if($value['app_type']=="game"){
													$is_game = "Y";
													$rowspan="2";
												}else{
													$is_game = "N";
													$rowspan="2";
												}
									?>
											<tr>
												<td class="text-center"><?=$value['appid']?></td>
												<td><?=$value['name']?></td>
												<td class="text-center"><?=$value['app_type']?></td>
												<td class="text-center"><?=($value['coming_soon'])?$value['coming_soon_date']:$value['release_date']?></td>
												<td class="text-end"><?=number_format($value['consumer_price']/100)?></td>
												<td class="text-end"><?=number_format($value['price']/100)?></td>
												<td class="text-center"><button class="btn btn-info btn-sm shadow-none btn_steam_sync" data-appid="<?=$value['appid']?>" >스팀 업데이트</button></td>
											</tr>
											<tr>
												<td colspan="7">
													<table class="table table-centered table-sm mb-0">
													<tbody class="font-13">
													<tr>
														<th class="bg-light">개발사</th>
														<td>
															<?
																if($value['appid']>0){
																	$developer_data = $admin->getSteamDeveloper($value['appid']);
																	echo $developer_data['developer'];
																}
															?>
														</td>
														<th class="bg-light">퍼블리셔</th>
														<td><?=$value['publisher']?></td>
														<th class="bg-light">추천수</th>
														<td><?=$value['recommendations']?></td>
													</tr>
													<tr>
														<th class="bg-light">지원언어</th>
														<td colspan="5">
														<?=str_replace('*음성이 지원되는 언어','',strip_tags($value['supported_languages']))?>
														</td>
													</tr>
													<tr>
														<th class="bg-light">한국어 지원</th>
														<td colspan="3">
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
														<?//=$value['supported_languages']?>
														</td>
														<th class="bg-light">업데이트 날짜</th>
														<td><?=$value['batch_date']?></td>
													</tr>
													</tbody>
													</table>
												</td>
											</tr>
											<tr>
												<th class="text-center bg-light">Package</th>
												<td colspan="6">
												<?
													if($value['appid']>0){
														$package_data = $admin->getSteamPackageAll($value['appid']);

														foreach($package_data as $package){
															if($package['package_name']){
																echo "[".$package['packageid']."] ".$package['package_name']." / ".$package['package_release']." / ".$package['package_comming_soon']."<br/>";
															}else{
													?>
													<button class="btn btn-sm btn-secondary btn_steam_package shadow-none" data-packageid="<?=$package['packageid']?>" data-appid="<?=$value['appid']?>"><?=$package['packageid']?> 동기화</button>
													<?
															}
														}
													}
												?>
												</td>
											</tr>
										<? if($is_game=="Y"){?>
											<tr>
												<th class="text-center bg-light">DLC</th>
												<td colspan="6">
												<?
													if($value['appid']>0){
														$dlc_data = $admin->getSteamDLCAll($value['appid']);
														foreach($dlc_data as $dlc){
															$dlc_name= $admin->getSteamAppinfoAll($dlc['dlc_appid']);
															if($dlc_name){
																echo "[".$dlc['dlc_appid']."] ".$dlc_name['name']."<br/>";
															}else{
													?>
													<button class="btn btn-sm btn-secondary btn_steam_sync shadow-none" data-appid="<?=$dlc['dlc_appid']?>" ><?=$dlc['dlc_appid']?> 동기화</button>
													<?
															}
														}
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
<!-- third party js -->
<script src="<?=$document_root?>/assets/js/vendor/jquery.dataTables.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.bootstrap5.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.responsive.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/responsive.bootstrap5.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.checkboxes.min.js"></script>

<!-- third party js ends -->

<!-- demo app -->
<script src="<?=$document_root?>/assets/js/pages/demo.products.js?1"></script>
<!-- end demo js-->

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
		$.ajax({
			 type: "GET",
			 url: "get_steam_app_info.php",
			 data: {mode:"steam_sync",appids:appids},
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
