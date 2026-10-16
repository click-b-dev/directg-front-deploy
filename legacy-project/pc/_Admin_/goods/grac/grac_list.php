<?
/*
원스토어 ONES
카카오게임즈 KAGA
삼성 갤럭시스토어 SECL
마이크로소프트 MSFT → PC 출시 가능
소니 SSCP (IARC PS Store) / SIEK (자체신청) → 리테일 출시 가능
닌텐도 NTDO → 리테일 출시 가능
구글 플레이스토어 GOOG
오큘러스 OCUL
에픽 EPIC → PC 출시 가능
애플 AAPL
*/

$page_title = "심의정보 현황";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_rateno = filter_input(INPUT_GET, 'search_rateno', FILTER_SANITIZE_STRING);
$search_gametitle = filter_input(INPUT_GET, 'search_gametitle', FILTER_SANITIZE_STRING);
$search_entname = filter_input(INPUT_GET, 'search_entname', FILTER_SANITIZE_STRING);
$search_platform = filter_input(INPUT_GET, 'search_platform', FILTER_SANITIZE_STRING);
$search_orgname = filter_input(INPUT_GET, 'search_orgname', FILTER_SANITIZE_STRING);
$search_givenrate = filter_input(INPUT_GET, 'search_givenrate', FILTER_SANITIZE_STRING);

$checked['search_platform'][$search_platform]="checked";
$checked['search_orgname'][$search_orgname]="checked";
$checked['search_givenrate'][$search_givenrate]="checked";

if(!$page){
	$page=1;
}

$where = [];
$param = "";

if(isset($search_rateno) && $search_rateno<>""){
	$where[] = " rateno like '".$search_rateno."%'";
}

if(isset($search_platform) && $search_platform<>"" && $search_platform<>"all"){
	$where[] = " platform ='".$search_platform."'";
}

if(isset($search_gametitle) && $search_gametitle<>""){
	$where[] = " gametitle like '%".$search_gametitle."%'";
}

if(isset($search_entname) && $search_entname<>""){
	$where[] = " entname like '%".$search_entname."%'";
}

if(isset($search_orgname) && $search_orgname<>"" && $search_orgname<>"all"){
	$where[] = " orgname ='".$search_orgname."'";
}

if(isset($search_givenrate) && $search_givenrate<>"" && $search_givenrate<>"all"){
	$where[] = " givenrate ='".$search_givenrate."'";
}


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	$admin= new Admin($conn);

	$add_where = "";

	foreach($where as $value){
		$add_where.= " and ".$value;
	}

	foreach($_GET as $key=>$value){
		if($key<>"page" ){
			if($value<>""){
				$param.="&".$key."=".$value;
			}
		}
	}

	$orderby = "rateddate desc";

	//게등의 심의신청자 리스트
	$grac_list = $admin->getGRACList($page,$add_where,$orderby,$param);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php'); ?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
<style>
label {
	font-weight: 500;
}

.col-form-label {
	font-size: 0.875rem;
}
</style>
<div class="wrapper">
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
	<div class="content-page">
		<div class="content">
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품관리</a></li>
									<li class="breadcrumb-item active">심의정보 리스트</li>
								</ol>
							</div>
							<h4 class="page-title">심의정보 리스트</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">심의정보 검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<div class="col-lg-3">
										<div class="row">
											<label for="search_rateno" class="col-sm-4 col-form-label bg-light border">등급분류번호</label>
											<div class="col-sm-8">
												<input type="text" class="form-control" id="search_rateno" name="search_rateno" placeholder="등급분류번호" value="<?=$search_rateno?>">
											</div>
										</div>
									</div>
									<div class="col-lg-5">
										<div class="row">
											<label for="search_gametitle" class="col-sm-3 col-form-label bg-light border">게임물명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_gametitle" name="search_gametitle" placeholder="게임물명" value="<?=$search_gametitle?>">
											</div>
										</div>
									</div>
									<div class="col-lg-4">
										<div class="row">
											<label for="search_entname" class="col-sm-3 col-form-label bg-light border">신청자(업체)명</label>
											<div class="col-sm-9">
												<input type="text" class="form-control" id="search_entname" name="search_entname" placeholder="신청자(업체)명" value="<?=$search_entname?>">
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-lg-12">
										<div class="row">
											<label for="search_orgname" class="col-sm-1 col-form-label bg-light border">등급분류기관</label>
											<div class="col-sm-11 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_orgname_1" name="search_orgname" class="form-check-input" value="게임물관리위원회" <?=$checked['search_orgname']['게임물관리위원회']?>>
													<label class="form-check-label" for="search_orgname_1">게임물관리위원회</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_orgname_2" name="search_orgname" class="form-check-input" value="게임콘텐츠등급분류위원회" <?=$checked['search_orgname']['게임콘텐츠등급분류위원회']?>>
													<label class="form-check-label" for="search_orgname_2">게임콘텐츠등급분류위원회</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_orgname_3" name="search_orgname" class="form-check-input" value="자체등급분류사업자" <?=$checked['search_orgname']['자체등급분류사업자']?>>
													<label class="form-check-label" for="search_orgname_3">자체등급분류사업자</label>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="row mb-2">
									<div class="col-lg-12">
										<div class="row">
											<label for="search_givenrate" class="col-sm-1 col-form-label bg-light border">결정등급</label>
											<div class="col-sm-11 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_givenrate_all" name="search_givenrate" class="form-check-input" value="all" <?=$checked['search_givenrate']['all']?>>
													<label class="form-check-label" for="search_givenrate_all">전체</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_givenrate_1" name="search_givenrate" class="form-check-input" value="전체이용가" <?=$checked['search_givenrate']['전체이용가']?>>
													<label class="form-check-label" for="search_givenrate_1">전체이용가</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_givenrate_2" name="search_givenrate" class="form-check-input" value="12세이용가" <?=$checked['search_givenrate']['12세이용가']?>>
													<label class="form-check-label" for="search_givenrate_2">12세이용가</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_givenrate_3" name="search_givenrate" class="form-check-input" value="15세이용가" <?=$checked['search_givenrate']['15세이용가']?>>
													<label class="form-check-label" for="search_givenrate_3">15세이용가</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_givenrate_4" name="search_givenrate" class="form-check-input" value="청소년이용불가" <?=$checked['search_givenrate']['청소년이용불가']?>>
													<label class="form-check-label" for="search_givenrate_4">청소년이용불가</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_givenrate_5" name="search_givenrate" class="form-check-input" value="등급거부" <?=$checked['search_givenrate']['등급거부']?>>
													<label class="form-check-label" for="search_givenrate_5">등급거부</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<div class="col-lg-12">
										<div class="row">
											<label for="search_platform" class="col-sm-1 col-form-label bg-light border">플랫폼</label>
											<div class="col-sm-11 mt-1">
												<div class="form-check form-check-inline">
													<input type="radio" id="search_platform_all" name="search_platform" class="form-check-input" value="all" <?=$checked['search_platform']['all']?>>
													<label class="form-check-label" for="search_platform_all">전체</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_platform_1" name="search_platform" class="form-check-input" value="PC/온라인 게임" <?=$checked['search_platform']['PC/온라인 게임']?>>
													<label class="form-check-label" for="search_platform_1">PC/온라인 게임</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_platform_2" name="search_platform" class="form-check-input" value="비디오 게임" <?=$checked['search_platform']['비디오 게임']?>>
													<label class="form-check-label" for="search_platform_2">비디오 게임</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_platform_3" name="search_platform" class="form-check-input" value="모바일 게임" <?=$checked['search_platform']['모바일 게임']?>>
													<label class="form-check-label" for="search_platform_3">모바일 게임</label>
												</div>
												<div class="form-check form-check-inline">
													<input type="radio" id="search_platform_7" name="search_platform" class="form-check-input" value="아케이드 게임" <?=$checked['search_platform']['아케이드 게임']?>>
													<label class="form-check-label" for="search_platform_7">아케이드 게임</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary">심의 검색</button>
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
								<? echo number_format($grac_list->total_results)?> 개
								<div class="table-responsive">
									<table class="table table-centered w-100 table-sm table-bordered" id="">
										<thead class="table-light font-14">
											<tr>
												<th class="text-center" style="width: 150px;">등급분류번호</th>
												<th class="text-center">게임물명</th>
												<th class="text-center" style="width: 160px;">등급분류기관</th>
												<th class="text-center" style="width: 230px;">심의업체명</th>
												<th class="text-center" style="width: 110px;">결정등급</th>
												<th class="text-center" style="width: 100px;">등급분류일자</th>
												<th class="text-center" style="width: 80px;">비고</th>
											</tr>
										</thead>
										<tbody>
										<?
										if($grac_list->success == true){
											$result = $grac_list->resultset->fetchAll();
											foreach($result as $value){
										?>
											<tr>
												<td class="text-center p-0 font-13"><?=$value['rateno']?></td>
												<td class="font-13"><?=$value['gametitle']?></td>
												<td class="text-center p-0 font-13"><?=$value['orgname']?></td>
												<td class="text-center p-0 font-13"><?=$value['entname']?></td>
												<td class="text-center font-13"><?=$value['givenrate']?></td>
												<td class="text-center font-13"><?=$value['rateddate']?></td>
												<td class="text-center table-action"></td>
											</tr>
											<tr class="">
												<th class="text-center bg-light">내용정보표시</th>
												<td><?=$value['descriptors']?></td>
												<th class="text-center bg-light">게임플랫폼</th>
												<td><?=$value['platform']?></td>
												<td colspan="3" class="text-center"><?=$value['reg_date']?></td>
											</tr>
											<?
												}
											}
											?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?echo $grac_list->links_html;?></div>
							</div> <!-- end card-body-->
						</div> <!-- end card-->
					</div> <!-- end col -->
				</div>
				<!-- end row -->
			</div>
			<!-- /container-fluid -->
		</div>
		<!-- /content -->
	</div>
	<!-- /content-page -->
</div>
<!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
