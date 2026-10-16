<?
$page_title="심의정보 등록";

header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['goods'] = "active";
$sidebar_file = "sidebar_goods.php";

$rateno = filter_input(INPUT_GET, 'rateno', FILTER_SANITIZE_STRING);

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);

	if($rateno){
		$mode= "modify";
		$query="select * from grac_list where rateno=:rateno";
		$stmt = $conn->prepare($query);
		$params = array(
			":rateno"=>$rateno
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

	}else{
		$mode= "register";
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
			<div class="container-fluid">
				<!-- start page title -->
				<div class="row">
					<div class="col-12">
						<div class="page-title-box">
							<div class="page-title-right">
								<ol class="breadcrumb m-0">
									<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">상품</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">심의정보 관리</a></li>
									<li class="breadcrumb-item active"><?=$page_title?></li>
								</ol>
							</div>
							<h4 class="page-title"><?=$page_title?></h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<form id="frm" name="frm" method="post" action="grac_ps.php" class="">
					<input type="hidden" name="mode" value="<?=$mode?>">
					<input type="hidden" name="idx" value="<?=$idx?>">
					<div class="row">
						<div class="col-8">
							<div class="card">
								<div class="card-body">
									<div class="row mb-3">
										<label for="rateno" class="col-2 col-form-label bg-light">등급분류번호</label>
										<div class="col-4">
											<input type="text" class="form-control" id="rateno" name="rateno" placeholder="" value="">
										</div>
									</div>
									<div class="row mb-3">
										<label for="gametitle" class="col-2 col-form-label bg-light">게임물명</label>
										<div class="col-10">
											<input type="text" class="form-control" id="gametitle" name="gametitle" placeholder="" value="">
										</div>
									</div>
									<div class="row mb-3">
										<label for="rateddate" class="col-2 col-form-label bg-light">등급분류일자</label>
										<div class="col-4">
											<input type="text" class="form-control" id="rateddate" name="rateddate" placeholder="" value="">
										</div>
									</div>
									<div class="row mb-3">
										<label for="orgname" class="col-2 col-form-label bg-light">등급분류기관</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="orgname_1" name="orgname" class="form-check-input" value="게임물관리위원회">
												<label class="form-check-label" for="orgname_1">게임물관리위원회</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="orgname_2" name="orgname" class="form-check-input" value="게임콘텐츠등급분류위원회">
												<label class="form-check-label" for="orgname_2">게임콘텐츠등급분류위원회</label>
											</div>
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="orgname_3" name="orgname" class="form-check-input" value="자체등급분류사업자" checked>
												<label class="form-check-label" for="orgname_3">자체등급분류사업자</label>
											</div>
										</div>
									</div>
									<div class="row mb-3">
										<label for="entname" class="col-2 col-form-label bg-light">심의업체명</label>
										<div class="col-10">
											<div class="form-check form-check-inline">
												<input type="radio" id="entname3" name="entname" class="form-check-input" value="소니인터렉티브엔터테인먼트코리아" <?=$checked['entname']['소니인터렉티브엔터테인먼트코리아']?>>
												<label class="form-check-label" for="entname3">㈜소니인터랙티브엔터테인먼트코리아</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="entname4" name="entname" class="form-check-input" value="한국마이크로소프트" <?=$checked['entname']['한국마이크로소프트']?>>
												<label class="form-check-label" for="entname4">한국마이크로소프트 유한회사</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="entname7" name="entname" class="form-check-input" value="오큘러스" <?=$checked['entname']['오큘러스']?>>
												<label class="form-check-label" for="entname7">오큘러스브이알코리아 유한회사</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="entname8" name="entname" class="form-check-input" value="에픽게임즈코리아" <?=$checked['entname']['에픽게임즈코리아']?>>
												<label class="form-check-label" for="entname8">에픽게임즈코리아 유한회사</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="entname9" name="entname" class="form-check-input" value="한국닌텐도" <?=$checked['entname']['한국닌텐도']?>>
												<label class="form-check-label" for="entname9">한국닌텐도주식회사</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="entname10" name="entname" class="form-check-input" value="스마일게이트홀딩스" <?=$checked['entname']['스마일게이트홀딩스']?>>
												<label class="form-check-label" for="entname10">스마일게이트홀딩스</label>
											</div>
										</div>
									</div>
									<div class="row mb-3">
										<label for="platform" class="col-2 col-form-label bg-light">게임플랫폼</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="platform" name="platform" class="form-check-input" value="PC/온라인 게임" checked>
												<label class="form-check-label" for="platform">PC/온라인 게임</label>
											</div>
										</div>
									</div>

									<div class="row mb-3">
										<label for="givenrate" class="col-2 col-form-label bg-light">결정등급</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-1">
												<input type="radio" id="givenrate1" name="givenrate" class="form-check-input" value="전체이용가" <?=$checked['givenrate']['전체이용가']?>>
												<label class="form-check-label" for="givenrate1">전체이용가</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="givenrate2" name="givenrate" class="form-check-input" value="12세이용가" <?=$checked['givenrate']['12세이용가']?>>
												<label class="form-check-label" for="givenrate2">12세이용가</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="givenrate3" name="givenrate" class="form-check-input" value="15세이용가" <?=$checked['givenrate']['15세이용가']?>>
												<label class="form-check-label" for="givenrate3">15세이용가</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="givenrate4" name="givenrate" class="form-check-input" value="청소년이용불가" <?=$checked['givenrate']['청소년이용불가']?>>
												<label class="form-check-label" for="givenrate4">청소년이용불가</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="givenrate5" name="givenrate" class="form-check-input" value="등급거부" <?=$checked['givenrate']['등급거부']?>>
												<label class="form-check-label" for="givenrate5">등급거부</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="radio" id="givenrate6" name="givenrate" class="form-check-input" value="등급취소" <?=$checked['givenrate']['등급취소']?>>
												<label class="form-check-label" for="givenrate6">등급취소</label>
											</div>
										</div>
									</div>
									<div class="row mb-3">
										<label for="special_asset_id" class="col-2 col-form-label bg-light">내용정보표시</label>
										<div class="col-10">
											<div class="form-check form-check-inline mt-1">
												<input type="checkbox" id="descriptors1" name="descriptors[]" class="form-check-input" value="선정성" <?=$checked['descriptors']['선정성']?>>
												<label class="form-check-label" for="descriptors1">선정성</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="checkbox" id="descriptors2" name="descriptors[]" class="form-check-input" value="폭력성" <?=$checked['descriptors']['폭력성']?>>
												<label class="form-check-label" for="descriptors2">폭력성</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="checkbox" id="descriptors3" name="descriptors[]" class="form-check-input" value="공포" <?=$checked['descriptors']['공포']?>>
												<label class="form-check-label" for="descriptors3">공포</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="checkbox" id="descriptors4" name="descriptors[]" class="form-check-input" value="언어의부적절성" <?=$checked['descriptors']['언어의부적절성']?>>
												<label class="form-check-label" for="descriptors4">언어의부적절성</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="checkbox" id="descriptors5" name="descriptors[]" class="form-check-input" value="약물" <?=$checked['descriptors']['약물']?>>
												<label class="form-check-label" for="descriptors5">약물</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="checkbox" id="descriptors6" name="descriptors[]" class="form-check-input" value="범죄" <?=$checked['descriptors']['범죄']?>>
												<label class="form-check-label" for="descriptors6">범죄</label>
											</div>
											<div class="form-check form-check-inline">
												<input type="checkbox" id="descriptors7" name="descriptors[]" class="form-check-input" value="사행성" <?=$checked['descriptors']['사행성']?>>
												<label class="form-check-label" for="descriptors7">사행성</label>
											</div>
										</div>
									</div>

								</div>
								<!-- end card-body-->
								<div class="card-footer">
									<div class="float-end">
									<button type="submit" class="btn btn-primary">저장</button>
									</div>
								</div>
							</div>
							<!-- end card-->
						</div>
					</div>
				</form>

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
