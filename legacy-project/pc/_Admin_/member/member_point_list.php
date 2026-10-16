<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
$topmenu['member'] = "active";
$page_title = "포인트 지급/차감 내역";

$page           = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type    = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value   = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));
$emoney_type    = filter_input(INPUT_GET, 'emoney_type', FILTER_SANITIZE_STRING);

$pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

$adminV1 = new AdminV1($pdo);

if (!$page) {
    $page = 1;
}

if ($emoney_type == "") {
    $emoney_type = "all";
}

// 필터 selected
$selected['search_type'][$search_type] = "selected";
$selected['emoney_type'][$emoney_type] = "checked";

// filter
$where = [];

if ($emoney_type != "all") {
    $where[] = " tel.emoney_type = '{$emoney_type}'";
}

if ($search_value) {
    $search_m_no = $adminV1->getMemberNo($search_value);
    $where[] = " tel.m_no = '{$search_m_no['m_no']}'";
}

// 검색필터 페이지네이션 적용
foreach ($_GET as $key => $value) {
    if ($key <> "page") {
        if ($value <> "") {
            $param .= "&".$key."=".$value;
        }
    }
}

$add_where = "";

foreach ($where as $value) {
    $add_where .= " and {$value}";
}

$orderby = "tel.sno DESC";

try {
    $member_list = $adminV1->getMemberPointList($page, $add_where, $orderby, $param);

    $query = "SELECT COUNT(1) AS cnt FROM tbl_emoney_log WHERE m_no IS NOT NULL";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $cnt = $stmt->fetchAll();
    $all_cnt = $cnt[0]['cnt'];
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$member_level_arr = array(
    1 => "일반",
    2 => "정회원",
    3 => "VIP"
);
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8" />
    <title><?=$page_title?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="" name="description" />
    <meta content="" name="author" />
    <!-- App favicon -->
    <link rel="shortcut icon" href="/favicon.ico">

    <!-- App css -->
    <link href="<?=$document_root?>/assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <link href="<?=$document_root?>/assets/css/app.min.css?<?=time()?>" rel="stylesheet" type="text/css" id="light-style" />
    <link href="<?=$document_root?>/assets/css/app-dark.min.css" rel="stylesheet" type="text/css" id="dark-style" />

    <style>
        .table-responsive table tr:hover{
            background-color:#FFF0F0;
        }
    </style>
</head>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
	<!-- Begin page -->
	<div class="wrapper">
		<!-- ========== Left Sidebar Start ========== -->
		<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/sidebar_member.php');?>
		<!-- Left Sidebar End -->


		<!-- Start Page Content here -->
		<!-- ============================================================== -->

		<div class="content-page">
			<div class="content">
				<!-- Topbar Start -->
				<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/topbar.php');?>
				<!-- end Topbar -->

				<!-- Start Content-->
				<div class="container-fluid">
					<!-- start page title -->
					<div class="row">
						<div class="col-12">
							<div class="page-title-box">
								<div class="page-title-right">
									<ol class="breadcrumb m-0">
										<li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">회원</a></li>
										<li class="breadcrumb-item"><a href="javascript: void(0);">회원관리</a></li>
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
                            <h5 class="card-header bg-secondary text-white">검색필터</h5>
                            <div class="card-body py-2">
                                <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                    <div class="row mb-2">
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">검색어</label>
                                                <div class="col-sm-3">
                                                    <select class="form-control" name="search_type" id="search_type">
                                                        <option value="tm.m_id" <?=$selected['search_type']['tm.m_id']?>>아이디</option>
                                                    </select>
                                                </div>
                                                <div class="col-sm-6">
                                                    <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-lg-6">
                                            <div class="input-group row">
                                                <label for="" class="col-sm-3 col-form-label bg-light border">지급/차감구분</label>
                                                <div class="col-sm-6 mt-1">
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="emoney_type1" name="emoney_type" class="form-check-input" value="all" <?=$selected['emoney_type']['all']?>>
                                                        <label class="form-check-label" for="emoney_type1">전체</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="emoney_type2" name="emoney_type" class="form-check-input" value="+" <?=$selected['emoney_type']['+']?>>
                                                        <label class="form-check-label" for="emoney_type2">지급</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input type="radio" id="emoney_type3" name="emoney_type" class="form-check-input" value="-" <?=$selected['emoney_type']['-']?>>
                                                        <label class="form-check-label" for="emoney_type3">차감</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div class="float-end">
                                                <button type="submit" class="btn btn-primary shadow-none">회원 검색</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex flex-row justify-content-between mb-2">
                        <div class="float-start">검색 : <?=number_format($member_list->total_results)?>건 / 전체 : <?=number_format($all_cnt)?> 건</div>
                    </div>

					<div class="row">
                        <div class="col-12 table-responsive">
                            <table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
                                <thead class="table-light font-13">
                                <tr>
                                    <th class="text-center">번호</th>
                                    <th class="text-center">아이디</th>
                                    <th class="text-center">회원등급</th>
                                    <th class="text-center">구분</th>
                                    <th class="text-center">지급/차감액</th>
                                    <th class="text-center">지급/차감일</th>
                                    <th class="text-center">처리자</th>
                                    <th class="text-center">사유</th>
                                </tr>
                                </thead>
                                <tbody class="font-12 bg-white">
                                <?php
                                if ($member_list->success == true) {
                                    $result = $member_list->resultset->fetchAll();
                                    $num = 0;
                                    foreach ($result as $value) {
                                        $member_tmp = $adminV1->getMemberInfo($value['m_no'])
                                ?>
                                        <tr>
                                            <td class="text-center"><?=$member_list->total_results-($num+($page-1)*50)?></td>
                                            <td class="text-center">
                                                <a href="./member_point_form.php?search_type=tm.m_id&search_value=<?=$member_tmp['m_id']?>"><?=$member_tmp['m_id']?></a>
                                            </td>
                                            <td class="text-center"><?=$member_level_arr[$member_tmp['mem_level']]?></td>
                                            <td class="text-center"><?=$value['emoney_type']=="+"?'<strong class="text-primary">지급</strong>':'<strong class="text-danger">차감</strong>'?></td>
                                            <td class="text-center"><?=number_format($value['emoney'])." 원"?></td>
                                            <td class="text-center"><?=$value['regdt']?></td>
                                            <td class="text-center"><?=$value['admin_id']?></td>
                                            <td class="text-center"><?=$value['memo']?></td>
                                        </tr>
                                <?php
                                        $num++;
                                    }
                                }
                                ?>
                                </tbody>
                            </table>
                            <div class="text-center mt-3"><?=$member_list->links_html?></div>
                        </div>
					</div>
					<!-- end row -->   
				</div> 
				<!-- container -->
			</div> 
			<!-- content -->
			<!-- Footer Start -->
			<? include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/footer.php');?>
			<!-- end Footer -->
		</div>
		<!-- ============================================================== -->
		<!-- End Page content -->
	</div>
	<!-- END wrapper -->

<!-- bundle -->
<script src="<?=$document_root?>/assets/js/vendor.min.js"></script>
<script src="<?=$document_root?>/assets/js/app.min.js"></script>

</body>
</html>
