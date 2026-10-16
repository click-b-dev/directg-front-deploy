<?
$page_title="연관상품";
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file="sidebar_goods.php";

$title_id = filter_input(INPUT_GET, 'title_id', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	//대표상품 기본정보
	$title_info = $admin->getTitle($title_id);

	//대표상품 기본게임 옵션 리스트
	$option_game = $admin->getTitleGameList($title_id);

	//비슷한 게임찾기(같은 장르)
	$same_genre = $admin->getRelatedTitleSearch($title_id,$title_info['developer'],$title_info['genre'],'1');

	//비슷한 게임찾기(같은 개발사)
	$same_developer = $admin->getRelatedTitleSearch($title_id,$title_info['developer'],$title_info['genre'],'2');

	/*
	A. 기준일 = 오늘-1일: 예판 시작일 ~ 기준일까지의 누적 판매량
	B. D-DAY = 출시일: 기준일+1일 ~ 출시일까지의 누적 판매량 = 출시일까지의 전체 누적판매량 - B
	C. D+10: D+1일 ~ D+10까지의 누적판매량 = D+10까지의 전체 누적판매량 - (A+B)
	D. D+30: D+11일 ~ D+30까지의 누적판매량 = D+30까지의 전체 누적판매량 - (A+B+C)
	E. 합계: D+30까지의 전체 누적판매량
	*/

	if($title_info['release_date']>date('Y-m-d')){
		$basic_date_config = "오늘 -1일";
		$basic_date =date('Y-m-d',strtotime("-1 days"));
	}else{
		$basic_date_config = "출시일";
		$basic_date = $title_info['release_date'];
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">대표상품 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$title_info['title_name']?> <small>(<?=$title_info['title_name_en']?>)</small></h4>
						</div>
					</div>
				</div>     
				<!-- end page title -->
				
							<div class="row">
					<div class="col-2 mb-2 mb-sm-0">
						<div class="nav flex-column nav-pills bg-nav-pills mb-2" id="v-pills-tab"aria-orientation="vertical">
							<a class="nav-link rounded-0 fw-500 " id="v-pills-home-tab"  href="title_view.php?title_id=<?=$title_id?>">
								<i class="mdi mdi-home-variant d-md-none d-block"></i>
								<span class="d-none d-md-block">상세보기</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-profile-tab" href="title_modify.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-account-circle d-md-none d-block"></i>
								<span class="d-none d-md-block">기본정보 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_grac_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">심의정보 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_tag_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">태그정보 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_media_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">동영상 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_screenshot_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">스크린샷 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_image_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">이미지 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_description_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">상세설명 설정</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_option_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">관련상품 설정</span>
							</a>
							<a class="nav-link active rounded-0" id="v-pills-settings-tab"  href="title_related.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">연관상품</span>
							</a>
								<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_tag_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">Steam 정보</span>
							</a>
							<a class="nav-link rounded-0 fw-500" id="v-pills-settings-tab"  href="title_tag_register.php?title_id=<?=$title_id?>" >
								<i class="mdi mdi-settings-outline d-md-none d-block"></i>
								<span class="d-none d-md-block">메타크리틱 설정</span>
							</a>
						</div>
					</div>
					<div class="col-10">
						<div class="card">
							<h5 class="card-header bg-secondary text-white">대표상품 기본정보</h5>
							<div class="card-body py-2">
								<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
									<div class="row mb-2">
										<label for="search_title_name" class="col-sm-2 col-form-label col-form-label-sm bg-light border">대표상품명</label>
										<div class="col-sm-4">
											<?=$title_info['title_name']?> (<?=$title_info['title_name_en']?>)
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_publisher" class="col-sm-2 col-form-label col-form-label-sm bg-light border">대표상품 퍼블리셔</label>
										<div class="col-sm-4">
											<?=$title_info['publisher']?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_developer" class="col-sm-2 col-form-label col-form-label-sm bg-light border">대표상품 개발사</label>
										<div class="col-sm-4">
											<?=$title_info['developer']?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_developer" class="col-sm-2 col-form-label col-form-label-sm bg-light border">대표상품 장르</label>
										<div class="col-sm-10">
											<?
												$title_genre = explode(",",$title_info['genre']);
												foreach($title_genre as $genre){
													echo "<span class='badge bg-primary font-13 fw-normal me-2 mb-1'>".$admin->getTagName($genre)."</span>";
												}
											?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_developer" class="col-sm-2 col-form-label col-form-label-sm bg-light border">대표상품 카테고리</label>
										<div class="col-sm-10">
											<?
											$title_category = explode(",",$title_info['category']);
											foreach($title_category as $category){
												echo "<span class='badge bg-info font-13 fw-normal me-2 mb-1'>".$admin->getTagName($category)."</span>";
											}
											?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_developer" class="col-sm-2 col-form-label col-form-label-sm bg-light border">대표상품 태그</label>
										<div class="col-sm-10">
											<?
													$title_tag_list = explode(",",$title_info['tags']);
													foreach($title_tag_list as $tag){
														switch(substr($tag,0,1)){
															case "G": //장르
																$tag_style="bg-primary text-light";
															break;
															case "M"://분위기, 배경
																$tag_style="bg-success text-light";
															break;
															case "T"://테마
																$tag_style="bg-info text-light";
															break;
															case "V"://시점
																$tag_style="bg-warning text-light";
															break;
															case "A"://평가
																$tag_style="bg-secondary text-light";
															break;
															case "F"://기능
																$tag_style="bg-dark text-light";
															break;
															default:
																$tag_style="bg-secondary text-light";
															break;
														}
														
														echo "<span class='badge ".$tag_style." font-13 fw-normal me-1 mb-1'>".$admin->getTagName($tag)."</span>";
													}
												?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_developer" class="col-sm-2 col-form-label col-form-label-sm bg-light border">한국어지원</label>
										<div class="col-sm-4">
											<?
												if($title_info['interface_korean']=="Y"){
													echo "<span class='badge bg-secondary text-light font-12 fw-normal mb-1'>인터페이스/자막</span> ";
												}
											?>

											<?
												if($title_info['spoken_korean']=="Y"){
													echo "<span class='badge bg-secondary text-light font-12 fw-normal mb-1'>음성</span> ";
												}
											?>

											<?
												if($title_info['exclusive_korean']=="Y"){
													echo "<span class='badge bg-info text-light font-12 fw-normal mb-1'>독점 한국어</span> ";
												}
											?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_release_date" class="col-sm-2 col-form-label col-form-label-sm bg-light border">출시일</label>
										<div class="col-sm-2">
											<?=$title_info['release_date']?>
										</div>
									</div>
									<div class="row mb-2">
										<label for="search_release_date" class="col-sm-2 col-form-label col-form-label-sm bg-light border">기준일</label>
										<div class="col-sm-4">
											<?=$basic_date?>
										</div>
									</div>

									<div class="row">
										<div class="col-lg-12">
											<div class="float-end">
												<button type="submit" class="btn btn-primary shadow-none">검색</button>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
						
						<div class="card">
							<h5 class="card-header bg-secondary text-white">관련 옵션상품</h5>
							<div class="card-body p-0">
								<table class="table table-bordered table-centered mb-0 table-sm">
									<colgroup>
										<col/>
										<col width="50%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center" rowspan="2">옵션상품번호</th>
											<th class="text-center" rowspan="2">옵션상품명</th>
											<th class="text-center" rowspan="2">출시일</th>
											<th class="text-center">예약판매</th>
											<th class="text-center" colspan="3">일반판매</th>
											<th class="text-center"  rowspan="2">합계</th>
										</tr>
										<tr>
											<th class="text-center">[<?=$basic_date?>]</th>
											<th class="text-center">[D-Day]</th>
											<th class="text-center">[D+10]</th>
											<th class="text-center">[D+30]</th>
										</tr>
									</thead>
									<tbody class="font-13">
									<?
										$preorder_count = 0;
										$order_day_0 = 0;
										$order_day_10 = 0;
										$order_day_30 = 0;
										$preorder_total = 0;
										$order_day_0_total=0;
										$order_day_10_total=0;
										$order_day_30_total = 0;
										foreach($option_game as $sub_value){
											$preorder_count = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("-1days", strtotime($sub_value['release_date']))));
											$order_day_0 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+0days", strtotime($sub_value['release_date']))));
											$order_day_10 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+10days", strtotime($sub_value['release_date']))));
											$order_day_30 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+30days", strtotime($sub_value['release_date']))));
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-end"><?=number_format($preorder_count)?><br/>(<?=date("Y-m-d",strtotime("-1days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_0-$preorder_count)?><br/>(<?=date("Y-m-d",strtotime("+0days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_10-$order_day_0)?><br/>(<?=date("Y-m-d",strtotime("+10days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_30-$order_day_10)?><br/>(<?=date("Y-m-d",strtotime("+30days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_30)?></td>
										</tr>
											<?
												$preorder_total+=$preorder_count;
												$order_day_0_total+=$order_day_0-$preorder_count;
												$order_day_10_total+=$order_day_10-$order_day_0;
												$order_day_30_total+=$order_day_30-$order_day_10;
											}
										?>
									</tbody>
									<tfoot class="table-light">
									<tr>
										<th colspan="3" class="text-center">합계</th>
										<th class="text-end"><?=number_format($preorder_total)?></th>
										<th class="text-end"><?=number_format($order_day_0_total)?></th>
										<th class="text-end"><?=number_format($order_day_10_total)?></th>
										<th class="text-end"><?=number_format($order_day_30_total)?></th>
										<th class="text-end"><?=number_format($preorder_total+$order_day_0_total+$order_day_10_total+$order_day_30_total)?></th>
									</tr>
									</tfoot>
								</table>
							</div>
						</div>
						
						<div class="card">
							<h5 class="card-header bg-secondary text-white">같은 개발사</h5>
							<div class="card-body p-2">
								<?
									foreach($same_developer as $value){
								?>
								<table class="table table-bordered table-centered mb-0 table-sm caption-top">
									<caption>[<?=$value['title_id']?>] <?=$value['title_name']?></caption>
									<colgroup>
										<col/>
										<col width="50%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center" rowspan="2">옵션상품번호</th>
											<th class="text-center" rowspan="2">옵션상품명</th>
											<th class="text-center" rowspan="2">출시일</th>
											<th class="text-center">예약판매</th>
											<th class="text-center" colspan="3">일반판매</th>
											<th class="text-center"  rowspan="2">합계</th>
										</tr>
										<tr>
											<th class="text-center">[<?=$value['release_date']?>]</th>
											<th class="text-center">[D-Day]</th>
											<th class="text-center">[D+10]</th>
											<th class="text-center">[D+30]</th>
										</tr>
									</thead>
									<tbody class="font-13">
									<?
										//관련 옵션상품
										$option_list = $admin->getTitleGameList($value['title_id']);
										$preorder_count = 0;
										$order_day_0 = 0;
										$order_day_10 = 0;
										$order_day_30 = 0;
										$order_total = 0;

										$preorder_total = 0;
										$order_day_0_total=0;
										$order_day_10_total=0;
										$order_day_30_total = 0;
										foreach($option_list as $sub_value){
											$preorder_count = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("-1days", strtotime($sub_value['release_date']))));
											$order_day_0 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+0days", strtotime($sub_value['release_date']))));
											$order_day_10 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+10days", strtotime($sub_value['release_date']))));
											$order_day_30 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+30days", strtotime($sub_value['release_date']))));
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-end"><?=number_format($preorder_count)?><br/>(<?=date("Y-m-d",strtotime("-1days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_0-$preorder_count)?><br/>(<?=date("Y-m-d",strtotime("+0days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_10-$order_day_0)?><br/>(<?=date("Y-m-d",strtotime("+10days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_30-$order_day_10)?><br/>(<?=date("Y-m-d",strtotime("+30days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_30)?></td>
										</tr>
										<?
												$preorder_total+=$preorder_count;
												$order_day_0_total+=$order_day_0-$preorder_count;
												$order_day_10_total+=$order_day_10-$order_day_0;
												$order_day_30_total+=$order_day_30-$order_day_10;
											}
										?>
									</tbody>
									<tfoot class="table-light">
									<tr>
										<th colspan="3" class="text-center">합계</th>
										<th class="text-end"><?=number_format($preorder_total)?></th>
										<th class="text-end"><?=number_format($order_day_0_total)?></th>
										<th class="text-end"><?=number_format($order_day_10_total)?></th>
										<th class="text-end"><?=number_format($order_day_30_total)?></th>
										<th class="text-end"><?=number_format($preorder_total+$order_day_0_total+$order_day_10_total+$order_day_30_total)?></th>
									</tr>
									</tfoot>
								</table>
								<?
								}
								?>
							</div>
						</div>
						
						<div class="card">
							<h5 class="card-header bg-secondary text-white">같은 장르 타이틀</h5>
							<div class="card-body p-2">
								<?
									foreach($same_genre as $value){
										//예약판매기간
								?>
								<table class="table table-bordered table-centered mb-0 table-sm caption-top">
									<caption>[<?=$value['title_id']?>] <?=$value['title_name']?></caption>
									<colgroup>
										<col/>
										<col width="50%"/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
										<col/>
									</colgroup>
									<thead class="table-light font-13">
										<tr>
											<th class="text-center" rowspan="2">옵션상품번호</th>
											<th class="text-center" rowspan="2">옵션상품명</th>
											<th class="text-center" rowspan="2">출시일</th>
											<th class="text-center">예약판매</th>
											<th class="text-center" colspan="3">일반판매</th>
											<th class="text-center"  rowspan="2">합계</th>
										</tr>
										<tr>
											<th class="text-center">[<?=$value['release_date']?>]</th>
											<th class="text-center">[D-Day]</th>
											<th class="text-center">[D+10]</th>
											<th class="text-center">[D+30]</th>
										</tr>
									</thead>
									<tbody class="font-13">
									<?
										//관련 옵션상품
										$option_list = $admin->getTitleGameList($value['title_id']);
										$preorder_count = 0;
										$order_day_0 = 0;
										$order_day_10 = 0;
										$order_day_30 = 0;
										$order_total = 0;
										$preorder_total = 0;
										$order_day_0_total=0;
										$order_day_10_total=0;
										$order_day_30_total = 0;
										foreach($option_list as $sub_value){
											$preorder_count = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("-1days", strtotime($sub_value['release_date']))));
											$order_day_0 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+0days", strtotime($sub_value['release_date']))));
											$order_day_10 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+10days", strtotime($sub_value['release_date']))));
											$order_day_30 = $admin->getGoodsOptionSalesCount($sub_value['product_code'],date("Y-m-d",strtotime("+30days", strtotime($sub_value['release_date']))));
									?>
										<tr>
											<td class="text-center"><?=$sub_value['product_code']?></td>
											<td><?=$sub_value['product_name']?></td>
											<td class="text-center"><?=substr($sub_value['release_date'],0,10)?></td>
											<td class="text-end"><?=number_format($preorder_count)?><br/>(<?=date("Y-m-d",strtotime("-1days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_0-$preorder_count)?><br/>(<?=date("Y-m-d",strtotime("+0days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_10-$order_day_0)?><br/>(<?=date("Y-m-d",strtotime("+10days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_30-$order_day_10)?><br/>(<?=date("Y-m-d",strtotime("+30days", strtotime($sub_value['release_date'])))?>)</td>
											<td class="text-end"><?=number_format($order_day_30)?></td>
										</tr>
										<?
												$preorder_total+=$preorder_count;
												$order_day_0_total+=$order_day_0-$preorder_count;
												$order_day_10_total+=$order_day_10-$order_day_0;
												$order_day_30_total+=$order_day_30-$order_day_10;
											}
										?>
									</tbody>
									<tfoot class="table-light">
									<tr>
										<th colspan="3" class="text-center">합계</th>
										<th class="text-end"><?=number_format($preorder_total)?></th>
										<th class="text-end"><?=number_format($order_day_0_total)?></th>
										<th class="text-end"><?=number_format($order_day_10_total)?></th>
										<th class="text-end"><?=number_format($order_day_30_total)?></th>
										<th class="text-end"><?=number_format($preorder_total+$order_day_0_total+$order_day_10_total+$order_day_30_total)?></th>
									</tr>
									</tfoot>
								</table>
								<?
								}
								?>
							</div>
						</div>
					</div>
				</div>
			</div> 
			<!-- container -->

		</div> 
		<!-- content -->

	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
<script>

$(document).ready(function(){
	 $("form").submit(function(event) {
		 var dec = 0;
		$('input[name="game_rate[]"]').each(function(index, item){
			if($(this).prop('checked')){
				dec +=parseInt($(this).val());
			}
		});
		console.log(dec.toString(2));
		$("#game_rate_text").val(dec.toString(2));
		//return false;
	});
});

</script>

</body>
</html>
