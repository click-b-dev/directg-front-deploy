<?
$page_title="디지털상품 목록";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file="sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_SPECIAL_CHARS);

$search_is_view = filter_input(INPUT_GET, 'search_is_view', FILTER_SANITIZE_STRING);
$search_sales_status = filter_input(INPUT_GET, 'search_sales_status', FILTER_SANITIZE_STRING);
$search_interface_korean = filter_input(INPUT_GET, 'search_interface_korean', FILTER_SANITIZE_STRING);
$search_spoken_korean = filter_input(INPUT_GET, 'search_spoken_korean', FILTER_SANITIZE_STRING);
$search_exclusive_korean = filter_input(INPUT_GET, 'search_exclusive_korean', FILTER_SANITIZE_STRING);
$search_subtitle_korean = filter_input(INPUT_GET, 'search_subtitle_korean', FILTER_SANITIZE_STRING);

$search_age_limit = filter_input(INPUT_GET, 'search_age_limit', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];
$param = "";

$where[]=" title_code='33'";

if($search_key==""){
	$search_key="search_name";
}

if($search_value){
	switch($search_key){
		case "search_name":
			$where[] = " (title_name like '%".$search_value."%' or title_name_en like '%".$search_value."%')";
		break;
		case "search_title_id":
			$where[] = " title_id ='".$search_value."'";
		break;
		case "search_title_sku":
			$where[] = " sku ='".$search_value."'";
		break;
		case "search_publisher":
			$where[] = " publisher like '%".$search_value."%'";
		break;
		case "search_developer":
			$where[] = " developer like '%".$search_value."%'";
		break;
	}
}


if(isset($search_sales_status) && $search_sales_status<>""){
	$where[] = "sales_status ='".$search_sales_status."'";
}


if(isset($search_is_view) && $search_is_view<>""){
	if($search_is_view<>"all"){
		$where[] = "is_view ='".$search_is_view."'";
	}
}else{
//	$where[] = "is_view ='Y'";
	$search_is_view = "all";
}

if(isset($search_interface_korean) && $search_interface_korean<>""){
	$where[] = "interface_korean ='".$search_interface_korean."'";
}

if(isset($search_spoken_korean) && $search_spoken_korean<>""){
	$where[] = "spoken_korean ='".$search_spoken_korean."'";
}

if(isset($search_exclusive_korean) && $search_exclusive_korean<>""){
	$where[] = "exclusive_korean ='".$search_exclusive_korean."'";
}

if(isset($search_subtitle_korean) && $search_subtitle_korean<>""){
	$where[] = "subtitle_korean ='".$search_subtitle_korean."'";
}

if(isset($search_age_limit) && $search_age_limit<>""){
	$where[] = " age_limit='".$search_age_limit."'";
}

//배열 변수 초기화
$checked['search_is_view'] = array ('all' => null, 'Y' => null,'N'=>null);
$checked['search_age_limit'] = array ('10' => null, '12' => null,'15'=>null,'18'=>null);
$checked['search_sales_status'] = array ('C' => null, 'S' => null,'E'=>null);
$checked['search_spoken_korean'] = array ('Y' => null, 'N' => null);
$checked['search_interface_korean'] = array ('Y' => null, 'N' => null);
$checked['search_exclusive_korean'] = array ('Y' => null, 'N' => null);
$checked['search_subtitle_korean'] = array ('Y' => null, 'N' => null);

$checked['search_is_view'][$search_is_view] = "checked";
$checked['search_sales_status'][$search_sales_status] = "checked";
$checked['search_age_limit'][$search_age_limit]="checked";
$checked['search_spoken_korean'][$search_spoken_korean]="checked";
$checked['search_interface_korean'][$search_interface_korean]="checked";
$checked['search_exclusive_korean'][$search_exclusive_korean]="checked";
$checked['search_subtitle_korean'][$search_subtitle_korean]="checked";

$selected['search_key'][$search_key]="selected";

//$where[] = " game_rate is null";

try{  
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$add_where = "";


	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" && $key<>"title_id"){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "title_id desc";

	$admin= new Admin($conn); 
	$adminGoods= new AdminGoods($conn); 

	$goods_list = $admin->getGoodsList($page,$add_where,$orderby,$param);

	$result = [];
	$count_map = $grac_map = $steam_chk_map = $franchise_map = $tag_map = [];

	if ($goods_list->success == true) {
		$result = $goods_list->resultset->fetchAll();

		if ($result) {
			$title_ids = array_column($result, 'title_id');
			$id_in = implode(',', array_map('intval', $title_ids));

			// 상품 유형별 카운트 일괄조회 (18×N 쿼리 → 쿼리 1개)
			$cnt_rows = $conn->query("
				SELECT a.title_id,
					SUM(b.status='9' AND b.game_type='game'       AND b.display_type='basic')             AS game_9,
					SUM(b.status='0' AND b.game_type='game'       AND b.display_type='basic')             AS game_0,
					SUM(b.status='3' AND b.game_type='game'       AND b.display_type='basic')             AS game_3,
					SUM(b.status='9' AND b.game_type='game'       AND b.display_type='edition')           AS edition_9,
					SUM(b.status='0' AND b.game_type='game'       AND b.display_type='edition')           AS edition_0,
					SUM(b.status='3' AND b.game_type='game'       AND b.display_type='edition')           AS edition_3,
					SUM(b.status='9' AND b.game_type='dlc'        AND b.display_type='dlc')              AS dlc_9,
					SUM(b.status='0' AND b.game_type='dlc'        AND b.display_type='dlc')              AS dlc_0,
					SUM(b.status='3' AND b.game_type='dlc'        AND b.display_type='dlc')              AS dlc_3,
					SUM(b.status='9' AND b.game_type='holomodels' AND b.display_type='holomodels')        AS holo_9,
					SUM(b.status='0' AND b.game_type='holomodels' AND b.display_type='holomodels')        AS holo_0,
					SUM(b.status='3' AND b.game_type='holomodels' AND b.display_type='holomodels')        AS holo_3,
					SUM(b.status='9' AND b.game_type='holomodels' AND b.display_type='holomodelsedition') AS holo_edition_9,
					SUM(b.status='0' AND b.game_type='holomodels' AND b.display_type='holomodelsedition') AS holo_edition_0,
					SUM(b.status='3' AND b.game_type='holomodels' AND b.display_type='holomodelsedition') AS holo_edition_3,
					SUM(b.status='9' AND b.game_type='holomodels' AND b.display_type='holomodelsdlc')    AS holo_dlc_9,
					SUM(b.status='0' AND b.game_type='holomodels' AND b.display_type='holomodelsdlc')    AS holo_dlc_0,
					SUM(b.status='3' AND b.game_type='holomodels' AND b.display_type='holomodelsdlc')    AS holo_dlc_3
				FROM tbl_title_option a
				INNER JOIN tbl_goods_item b ON a.product_code = b.product_code
				WHERE a.title_id IN ($id_in)
				GROUP BY a.title_id
			")->fetchAll();
			foreach ($cnt_rows as $row) {
				$count_map[$row['title_id']] = $row;
			}

			// GRAC 데이터 일괄조회
			$ratenos = array_unique(array_filter(array_column($result, 'rateno')));
			if ($ratenos) {
				$rateno_in = implode(',', array_map('intval', $ratenos));
				$grac_rows = $conn->query("SELECT rateno,orgname,entname,givenrate,rateddate,descriptors FROM grac_list WHERE rateno IN ($rateno_in)")->fetchAll();
				foreach ($grac_rows as $row) {
					$grac_map[$row['rateno']] = $row;
				}
			}

			// Steam 등록여부 일괄조회
			$steam_rows = $conn->query("SELECT title_id,steam_appid FROM steam_game WHERE title_id IN ($id_in) AND app_type='game'")->fetchAll();
			foreach ($steam_rows as $row) {
				$steam_chk_map[$row['title_id']] = $row['steam_appid'];
			}

			// 프랜차이즈명 일괄조회
			$franchise_idxs = array_unique(array_filter(array_column($result, 'franchise_idx')));
			if ($franchise_idxs) {
				$fran_in = implode(',', array_map('intval', $franchise_idxs));
				$fran_rows = $conn->query("SELECT idx,franchise_name FROM tbl_franchise WHERE idx IN ($fran_in)")->fetchAll();
				foreach ($fran_rows as $row) {
					$franchise_map[$row['idx']] = $row['franchise_name'];
				}
			}

			// 태그명 일괄조회
			$tag_codes = [];
			foreach ($result as $row) {
				foreach (explode(',', $row['genre'])    as $t) { if ($t !== '') $tag_codes[] = (int)$t; }
				foreach (explode(',', $row['category']) as $t) { if ($t !== '') $tag_codes[] = (int)$t; }
			}
			$tag_codes = array_unique(array_filter($tag_codes));
			if ($tag_codes) {
				$tag_in = implode(',', $tag_codes);
				$tag_rows = $conn->query("SELECT tag_code,tag_name FROM tbl_tags WHERE tag_code IN ($tag_in)")->fetchAll();
				foreach ($tag_rows as $row) {
					$tag_map[$row['tag_code']] = $row['tag_name'];
				}
			}
		}
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
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>     
				<!-- end page title --> 

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">대표상품 검색필터</h5>
						<div class="card-body py-2">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-6">
										<div class="input-group row">
											<select class="form-select col-sm-3" name="search_key" id="search_key">
												<option value="search_name" <?=$selected['search_key']['search_name']?>>대표상품명</option>
												<option value="search_title_id" <?=$selected['search_key']['search_title_id']?>>대표상품코드</option>
												<option value="search_title_sku" <?=$selected['search_key']['search_title_sku']?>>대표상품sku</option>
												<option value="search_publisher" <?=$selected['search_key']['search_publisher']?>>퍼블리셔</option>
												<option value="search_developer" <?=$selected['search_key']['search_developer']?>>개발사</option>
											</select>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
											</div>
										</div>
									</div>
									<div class="col-lg-6">
										<div class="row">
											<h6 class="col-sm-2 col-form-label col-form-label-sm bg-light border">심의등급</h6>
											<div class="col-sm-10 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_10" name="search_age_limit" class="form-check-input" value="10" <?=$checked['search_age_limit']['10']?>>
													<label class="form-check-label" for="search_age_limit_10"><span class='badge bg-success font-13 fw-normal'>전체이용가</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_12" name="search_age_limit" class="form-check-input" value="12" <?=$checked['search_age_limit']['12']?>>
													<label class="form-check-label" for="search_age_limit_12"><span class='badge bg-primary font-13 fw-normal'>12세이용가</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_15" name="search_age_limit" class="form-check-input" value="15" <?=$checked['search_age_limit']['15']?>>
													<label class="form-check-label" for="search_age_limit_15"><span class='badge bg-warning font-13 fw-normal'>15세이용가</span></label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_age_limit_19" name="search_age_limit" class="form-check-input" value="19" <?=$checked['search_age_limit']['19']?>>
													<label class="form-check-label" for="search_age_limit_19"><span class='badge bg-danger font-13 fw-normal'>청소년이용불가</span></label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-4">
										<div class="row">
											<label for="search_is_view" class="col-sm-4 col-form-label col-form-label-sm bg-light border">게임 페이지 노출</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_all" name="search_is_view" class="form-check-input" value="all" <?=$checked['search_is_view']['all']?>>
													<label class="form-check-label" for="search_is_view_all">전체</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_y" name="search_is_view" class="form-check-input" value="Y" <?=$checked['search_is_view']['Y']?>>
													<label class="form-check-label" for="search_is_view_y">진열함</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_is_view_n" name="search_is_view" class="form-check-input" value="N" <?=$checked['search_is_view']['N']?>>
													<label class="form-check-label" for="search_is_view_n">진열안함</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_sales_status" class="col-sm-4 col-form-label col-form-label-sm bg-light border">판매상태</label>
											<div class="col-sm-8 pt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_sales_status_c" name="search_sales_status" class="form-check-input" value="C" <?=$checked['search_sales_status']['C']?>>
													<label class="form-check-label" for="search_sales_status_c">판매예정</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_sales_status_s" name="search_sales_status" class="form-check-input" value="S" <?=$checked['search_sales_status']['S']?>>
													<label class="form-check-label" for="search_sales_status_s">판매중</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_sales_status_e" name="search_sales_status" class="form-check-input" value="E" <?=$checked['search_sales_status']['E']?>>
													<label class="form-check-label" for="search_sales_status_e">판매종료</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-3">
										<div class="row">
											<label for="search_interface_korean" class="col-sm-5 col-form-label col-form-label-sm bg-light border">인터페이스 한국어</label>
											<div class="col-sm-7 mt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_interface_korean_y" name="search_interface_korean" class="form-check-input" value="Y" <?=$checked['search_interface_korean']['Y']?>>
													<label class="form-check-label" for="search_interface_korean_y">지원</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_interface_korean_n" name="search_interface_korean" class="form-check-input" value="N" <?=$checked['search_interface_korean']['N']?>>
													<label class="form-check-label" for="search_interface_korean_n">미지원</label>
												</div>
												
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_subtitle_korean" class="col-sm-4 col-form-label col-form-label-sm bg-light border">자막 한국어</label>
											<div class="col-sm-8 mt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_subtitle_korean_y" name="search_subtitle_korean" class="form-check-input" value="Y" <?=$checked['search_subtitle_korean']['Y']?>>
													<label class="form-check-label" for="search_subtitle_korean_y">지원</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_subtitle_korean_n" name="search_subtitle_korean" class="form-check-input" value="N" <?=$checked['search_subtitle_korean']['N']?>>
													<label class="form-check-label" for="search_subtitle_korean_n">미지원</label>
												</div>
												
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_spoken_korean" class="col-sm-3 col-form-label col-form-label-sm bg-light border">음성 한글</label>
											<div class="col-sm-9 mt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_spoken_korean_y" name="search_spoken_korean" class="form-check-input" value="Y" <?=$checked['search_spoken_korean']['Y']?>>
													<label class="form-check-label" for="search_spoken_korean_y">지원</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_spoken_korean_n" name="search_spoken_korean" class="form-check-input" value="N" <?=$checked['search_spoken_korean']['N']?>>
													<label class="form-check-label" for="search_spoken_korean_n">미지원</label>
												</div>
												
											</div>
										</div>
									</div>
									<div class="col-lg-3">
										<div class="row">
											<label for="search_exclusive_korean" class="col-sm-3 col-form-label col-form-label-sm bg-light border">독점 한국어</label>
											<div class="col-sm-9 mt-1">
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_exclusive_korean_y" name="search_exclusive_korean" class="form-check-input" value="Y" <?=$checked['search_exclusive_korean']['Y']?>>
													<label class="form-check-label" for="search_exclusive_korean_y">지원</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="checkbox" id="search_exclusive_korean_n" name="search_exclusive_korean" class="form-check-input" value="N" <?=$checked['search_exclusive_korean']['N']?>>
													<label class="form-check-label" for="search_exclusive_korean_n">미지원</label>
												</div>
												
											</div>
										</div>
									</div>

								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary shadow-none">대표상품 검색</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>

				<div class="row mb-2">
					<div class="col-12">
						<div class="float-start"><? echo number_format($goods_list->total_results)?> 개</div>
						
						<div class="float-end"><a href="<?=$document_root?>/goods/title_register.php" class="btn btn-danger shadow-none">대표상품 등록</a></div>
					</div>
				</div>
				
				<?
					if ($result) {
						foreach($result as $value){
							$c = $count_map[$value['title_id']] ?? [];
				?>
				<div class="card">
					<div class="card-header p-2">
						<div class="dropdown card-widgets">
							<a href="#" class="dropdown-toggle arrow-none" data-bs-toggle="dropdown" aria-expanded="false">
								<i class="dripicons-dots-3"></i>
							</a>
							<div class="dropdown-menu dropdown-menu-end" style="">
								<a href="<?=$document_root?>/goods/title_view.php?title_id=<?=$value['title_id']?>" class="dropdown-item"><i class="mdi mdi-18px mdi-eye me-1"></i>자세히보기</a>
								<a href="<?=$document_root?>/goods/title_modify.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>기본정보 설정</a>
								<a href="<?=$document_root?>/goods/title_grac_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>심의정보 설정</a>
								<a href="<?=$document_root?>/goods/title_tag_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-tag me-1"></i>태그정보 설정</a>
								<a href="<?=$document_root?>/goods/title_media_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>동영상 설정</a>
								<a href="<?=$document_root?>/goods/title_screenshot_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>스크린샷 설정</a>
								<a href="<?=$document_root?>/goods/title_image_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-image me-1"></i>이미지 설정</a>
								<a href="<?=$document_root?>/goods/title_description_register_v2.php?mode=modify&title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-alert-box me-1"></i>상세설명 설정</a>
								<a href="<?=$document_root?>/goods/title_option_register.php?title_id=<?=$value['title_id']?>&page=<?=$page?><?=$param?>" class="dropdown-item"><i class="mdi mdi-18px mdi-pencil me-1"></i>관련상품 설정</a>
								
							</div>
						</div>
						<div class="d-flex align-items-start">
							<div class="w-100 overflow-hidden">
								<h5 class="card-title"><?=$value['title_name']?> <small  class="card-subtitle text-muted fw-normal">(<?=$value['title_name_en']?>)</small> <span class="text-muted">[<?=$value['sku']?>]</span></h5>
							</div>
						</div>
					</div>
					<div class="card-body p-0">
						<div class="title-container">
							<div class="title-a">
								<img src="/upload/title/<?=$value['title_id']?>/header/<?=$value['title_id']?>.jpg?t=<?=time()?>" class="">
								<div class="p-2">
									<table class="table table-centered table-sm table-bordered border caption-top mb-1">
										<caption class="py-1">대표상품 기본정보</caption>
										<tbody class="font-13">
										<tr>
											<th class="table-light" style="width:100px">대표상품번호</th>
											<td><?=$value['title_id']?></td>
										</tr>
										<tr>
											<th class="table-light">퍼블리셔</th>
											<td><?=$value['publisher']?></td>
										</tr>
										<tr>
											<th class="table-light" style="width:80px">개발사</th>
											<td><?=$value['developer']?></td>
										</tr>
										<tr>
											<th class="table-light">출시일</th>
											<td>
												<?=$value['release_date']?>
											</td>
										</tr>
										<tr>
											<th class="table-light" style="width:80px">한국어지원</th>
											<td>
												<?
													if($value['interface_korean']=="Y"){
														echo "<span class='badge bg-secondary text-light font-12 fw-normal mb-1'>인터페이스</span> ";
													}
												?>
													
												<?
													if($value['subtitle_korean']=="Y"){
														echo "<span class='badge bg-secondary text-light font-12 fw-normal mb-1'>자막</span> ";
													}
												?>

												<?
													if($value['spoken_korean']=="Y"){
														echo "<span class='badge bg-secondary text-light font-12 fw-normal mb-1'>음성</span> ";
													}
												?>

												<?
													if($value['exclusive_korean']=="Y"){
														echo "<span class='badge bg-info text-light font-12 fw-normal mb-1'>독점 한국어</span> ";
													}
												?>
											</td>
										</tr>
										</tbody>
									</table>
							
									<table class="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
										<caption class="py-1">대표상품 진열정보</caption>
										<tbody class="font-13">
										<tr>
											<th class="table-light" style="width:100px">진열상태</th>
											<td><?=$value['is_view']?></td>
										</tr>
										<tr>
											<th class="table-light">판매상태</th>
											<td>
												<?

													switch($value['sales_status']){
														case "C":
															echo "[판매예정]";
														break;
														case "S":
															echo "[판매중]";
														break;
														case "E":
															echo "[판매종료]";
														break;
													}
												?>
											</td>
										</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div class="title-b">
								<div class="p-2">
									<table class="table table-centered w-100 nowrap table-sm table-bordered border caption-top mb-1">
										<caption class="py-1">관련상품정보</caption>
										<thead class="table-secondary font-13">
										<tr>
											<th class="text-center">옵션구분</th>
											<th class="text-center">판매예정</th>
											<th class="text-center">판매중</th>
											<th class="text-center">판매종료</th>
										</tr>
										</thead>
										<tbody>
											<tr>
												<th class="bg-light">기본게임</th>
												<td class="text-center"><?=number_format($c['game_9'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['game_0'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['game_3'] ?? 0)?></td>
											</tr>
											<tr>
												<th class="bg-light">에디션</th>
												<td class="text-center"><?=number_format($c['edition_9'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['edition_0'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['edition_3'] ?? 0)?></td>
											</tr>
											<tr>
												<th class="bg-light">DLC</th>
												<td class="text-center"><?=number_format($c['dlc_9'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['dlc_0'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['dlc_3'] ?? 0)?></td>
											</tr>
											<tr>
												<th class="bg-light">홀로모델</th>
												<td class="text-center"><?=number_format($c['holo_9'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['holo_0'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['holo_3'] ?? 0)?></td>
											</tr>
											<tr>
												<th class="bg-light">홀로모델 에디션</th>
												<td class="text-center"><?=number_format($c['holo_edition_9'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['holo_edition_0'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['holo_edition_3'] ?? 0)?></td>
											</tr>
											<tr>
												<th class="bg-light">홀로모델 DLC</th>
												<td class="text-center"><?=number_format($c['holo_dlc_9'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['holo_dlc_0'] ?? 0)?></td>
												<td class="text-center"><?=number_format($c['holo_dlc_3'] ?? 0)?></td>
											</tr>
										</tbody>
									</table>
								</div>
								
							</div>
							<div class="title-c">
								<?
									$grac_data = $value['rateno']
										? ($grac_map[$value['rateno']] ?? ['orgname'=>null,'entname'=>null,'rateddate'=>null,'givenrate'=>null,'descriptors'=>null])
										: ['orgname'=>null,'entname'=>null,'rateddate'=>null,'givenrate'=>null,'descriptors'=>null];
								?>
								<div class="p-2">
									<table class="table table-centered nowrap table-sm table-bordered border caption-top">
										<caption class="py-1">대표상품 심의정보</caption>
										<tbody class="font-13">
										<tr>
											<th class="table-light" style="width:100px">등급분류기관</th>
											<td><?=$grac_data['orgname']?></td>
										</tr>
										<tr>
											<th class="table-light">심의업체명</th>
											<td><?=$grac_data['entname']?></td>
										</tr>
										<tr>
											<th class="table-light">등급분류일자</th>
											<td><?=$grac_data['rateddate']?></td>
										</tr>
										<tr>
											<th class="table-light">결정등급</th>
											<td><?=$grac_data['givenrate']?></td>
										</tr>
										<tr>
											<th class="table-light">내용정보표시</th>
											<td><?=$grac_data['descriptors']?></td>
										</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div class="title-d">
								<div class="p-2">
									<table class="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
										<caption class="py-1">대표상품 부가정보</caption>
										<tbody class="font-13">
										<tr>
											<th class="table-light" style="width:100px;">Steam Appid</th>
											<td>
												<?=$value['steam_appid']?>
												<?
													if($value['steam_appid']>0 && !isset($steam_chk_map[$value['title_id']])){
												?>
													<button class="btn btn-sm btn-secondary shadow-none btn_steam_sync" data-appid="<?=$value['steam_appid']?>" data-titleid="<?=$value['title_id']?>">스팀 동기화</button>
												<?
													}
												?>
											</td>
										</tr>
										<?if($value['franchise_idx']>0){?>
										<tr>
											<th class="table-light" style="width:80px">프랜차이즈</th>
											<td><?=$franchise_map[$value['franchise_idx']] ?? ''?></td>
										</tr>
										<?}?>
										<tr>
											<th class="table-light" style="width:80px">제 3자 DRM</th>
											<td><?=$value['drm_notice']?></td>
										</tr>
										<tr>
											<th class="table-light" style="width:80px">타사 계정</th>
											<td><?=$value['ext_user_account_notice']?></td>
										</tr>
											<tr>
											<th class="table-light" style="width:80px">조회수</th>
											<td><?=number_format($value['hit'])?></td>
										</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div class="title-tag">
								<div class="p-2">
									<table class="table table-centered nowrap table-sm table-bordered border caption-top mb-0">
										<caption class="py-1">대표상품 태그정보</caption>
										<tbody class="font-13">
										<tr>
												<th class="table-light">대표장르</th>
												<td>
													<?
													foreach(explode(",",$value['genre']) as $genre){
														if($genre !== '') echo "<span class='badge bg-primary font-13 fw-normal me-2 mb-1'>".($tag_map[$genre] ?? '')."</span>";
													}
													?>
												</td>
											</tr>
											<tr>
												<th class="table-light">카테고리</th>
												<td>
													<?
													foreach(explode(",",$value['category']) as $category){
														if($category !== '') echo "<span class='badge bg-info font-13 fw-normal me-2 mb-1'>".($tag_map[$category] ?? '')."</span>";
													}
													?>
												</td>
										</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
				<?
						}
					}
				?>

				<div class="text-center mt-3"><?echo $goods_list->links_html;?></div>
				
			</div> <!-- container -->

		</div> <!-- content -->


	</div>

</div>
<!-- END wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<!-- third party js -->
<script src="<?=$document_root?>/assets/js/vendor/jquery.dataTables.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.bootstrap5.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.responsive.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/responsive.bootstrap5.min.js"></script>
<script src="<?=$document_root?>/assets/js/vendor/dataTables.checkboxes.min.js"></script>

<!-- third party js ends -->

<script>
$(document).ready(function(){
	$(".btn_steam_sync").bind("click",function(){
		var index = $(".btn_steam_sync").index(this);
		var appids = $(".btn_steam_sync").eq(index).attr("data-appid");
		var title_id = $(".btn_steam_sync").eq(index).attr("data-titleid");
		$.ajax({
			 type: "GET",
			 url: "../steam/get_steam_game_info.php",
			 data: {mode:"steam_sync",appids:appids,title_id:title_id},
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
