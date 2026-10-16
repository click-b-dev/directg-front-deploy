<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['board'] = "active";
$page_title = "자주묻는질문 목록";
$sidebar_file = "sidebar_board.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_item_cd = filter_input(INPUT_GET, 'search_item_cd', FILTER_SANITIZE_STRING);
$search_subject = filter_input(INPUT_GET, 'search_subject', FILTER_SANITIZE_STRING);

if(!$page){
	$page=1;
}

$where = [];

if(isset($search_item_cd) && $search_item_cd<>"" && $search_item_cd<>"all"){
	$where[] = " faq_type ='".$search_item_cd."'";
}

if($search_subject){
	$where[]=" question like '%".$search_subject."%'";
}


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$adminBoard= new AdminBoard($conn);
	$parsedown= new Parsedown();

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

	$orderby = "idx desc";

	$faq_list = $adminBoard->getFaqList($page,$add_where,$orderby,$param);

}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}

$faq_type_label = array(
	"M01"=>"계정, 회원",
	"M02"=>"포인트",
	"O01"=>"주문, 결제",
	"O02"=>"제품 코드(키)",
	"O03"=>"취소, 환불",
	"O04"=>"가격",
	"O05"=>"할인",
	"G01"=>"상품",
	"G02"=>"구성, DLC",
	"G03"=>"특전",
	"G04"=>"한글",
	"S01"=>"이용방법",
	"S02"=>"게임 등록",
	"S03"=>"게임 설치",
	"S04"=>"게임 실행",
	"E01"=>"기타"
);

$checked['search_item_cd'][$search_item_cd] = "checked";
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
									<li class="breadcrumb-item"><a href="javascript: void(0);">게시판</a></li>
									<li class="breadcrumb-item"><a href="javascript: void(0);">자주묻는질문 관리</a></li>
									<li class="breadcrumb-item active">자주묻는질문 목록</li>
								</ol>
							</div>
							<h4 class="page-title">자주묻는질문 목록</h4>
						</div>
					</div>
				</div>
				<!-- end page title -->

				<div class="row g-2">
					<div class="card">
						<h5 class="card-header bg-secondary text-white">검색필터</h5>
						<div class="card-body">
							<form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
								<div class="row mb-2">
									<label for="search_title_id" class="col-sm-1 col-form-label bg-light border text-center">구분</label>
									<div class="col-sm-11">
										<div class="btn-group" role="group" aria-label="Basic radio toggle button group">
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_all" autocomplete="off" value="all" <?=$checked['search_item_cd']['all']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_all">전체</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_2" autocomplete="off" value="M01" <?=$checked['search_item_cd']['M01']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_2">계정, 회원</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_16" autocomplete="off" value="M02" <?=$checked['search_item_cd']['M02']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_16">포인트</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_1" autocomplete="off" value="S01" <?=$checked['search_item_cd']['S01']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_1">이용방법</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_6" autocomplete="off" value="S02" <?=$checked['search_item_cd']['S02']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_6">게임 등록</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_10" autocomplete="off" value="S03" <?=$checked['search_item_cd']['S03']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_10">게임 설치</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_9" autocomplete="off" value="S04" <?=$checked['search_item_cd']['S04']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_9">게임 실행</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_13" autocomplete="off" value="G01" <?=$checked['search_item_cd']['G01']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_13">상품</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_7" autocomplete="off" value="G02" <?=$checked['search_item_cd']['G02']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_7">구성, DLC</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_8" autocomplete="off" value="G03" <?=$checked['search_item_cd']['G03']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_8">특전</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_11" autocomplete="off" value="G04" <?=$checked['search_item_cd']['G04']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_11">한글</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_3" autocomplete="off" value="O01" <?=$checked['search_item_cd']['O01']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_3">주문, 결제</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_5" autocomplete="off" value="O02" <?=$checked['search_item_cd']['O02']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_5">제품 코드(키)</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_4" autocomplete="off" value="O03" <?=$checked['search_item_cd']['O03']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_4">취소, 환불</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_12" autocomplete="off" value="O04" <?=$checked['search_item_cd']['O04']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_12">가격</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_14" autocomplete="off" value="O05" <?=$checked['search_item_cd']['O05']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_14">할인</label>
											<input type="radio" class="btn-check" name="search_item_cd" id="item_cd_15" autocomplete="off" value="E01" <?=$checked['search_item_cd']['E01']?>><label class="btn btn-outline-primary shadow-none" for="item_cd_15">기타</label>
										</div>
									</div>
								</div>
								<div class="row mb-2">
									<label for="search_subject" class="col-sm-1 col-form-label bg-light border text-center">질문검색</label>
									<div class="col-sm-4">
										<input type="text" class="form-control" id="search_subject" name="search_subject" placeholder="검색어" value="<?=$search_subject?>">
									</div>
								</div>

								<div class="row">
									<div class="col-lg-12">
										<div class="float-end">
											<button type="submit" class="btn btn-primary btn-sm shadow-none">자주묻는질문 검색</button>
										</div>
									</div>
								</div>

							</form>
						</div>
					</div>
				</div>

				<div class="d-flex flex-row justify-content-between mb-2">
					<div class="float-start"><?=number_format($faq_list->total_results)?> 개</div>
					<div class="float-end"></div>
				</div>

				<div class="row">
					<div class="col-12">
						<div class="card">
							<div class="card-body p-0">
								<div class="table-responsive">
									<table class="table table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
										<thead class="table-light font-14">
											<tr>
												<th class="all" style="width: 20px;">
													<div class="form-check">
														<input type="checkbox" class="form-check-input" id="customCheck1">
														<label class="form-check-label" for="customCheck1">&nbsp;</label>
													</div>
												</th>
												<th class="text-center" style="width:50px">번호</th>
												<th class="text-center" style="width:100px">구분</th>
												<th class="text-center">내용</th>
												<th class="text-center" style="width:80px">비고</th>
											</tr>
										</thead>
										<tbody class="font-14">
										<?
										if($faq_list->success == true){
											$result = $faq_list->resultset->fetchAll();

											foreach($result as $value){
										?>
											<tr>
												<td class="text-center">
													<div class="form-check">
														<input type="checkbox" class="form-check-input" id="idx<?=$value['idx']?>" name="idx" value="<?=$value['idx']?>">
														<label class="form-check-label" for="idx">&nbsp;</label>
													</div>
												</td>
												<td class="text-center px-1"><?=$value['idx']?></td>
												<td class="text-center px-1"><?=$faq_type_label[$value['faq_type']]?></td>
												<td class="text-start px-1">
													<div class="card">
														<div class="card-header p-1 ps-2"><strong class="pe-2">[질문]</strong> <?=$value['question']?></div>
														<div class="card-body p-1">
															<div class="d-flex flex-row align-items-start">
																<div class="p-1" style="min-width:50px"><strong>[답변]</strong></div>
																<div class="p-1"><?=$parsedown->text($value['answer'])?></div>
															</div>
														</div>
													</div>
												</td>
												<td class="text-center px-1">
													<a href="faq_register.php?mode=modify&idx=<?=$value['idx']?>" class="action-icon"> <i class="mdi mdi-square-edit-outline"></i></a>
												</td>
											</tr>
											<?
													}
												}
											?>
										</tbody>
									</table>
								</div>

								<div class="text-center mt-3"><?=$faq_list->links_html?></div>

							</div>
						</div>
					</div>
				</div>

			</div><!-- /container-fluid -->
		</div><!-- /content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

</body>
</html>
