<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page  = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
$sno   = filter_input(INPUT_GET, 'sno', FILTER_SANITIZE_STRING);
$param = filter_input(INPUT_GET, 'param', FILTER_SANITIZE_STRING);
$searchTitle = filter_input(INPUT_GET, 'searchTitle', FILTER_SANITIZE_STRING);

$topmenu['promotion'] = "active";
$page_title = "오프라인 쿠폰 상세";
$sidebar_file = "sidebar_promotion.php";

// 검색필터 페이지네이션 적용
foreach ($_GET as $key => $value) {
    if ($key <> "page") {
        if ($value <> "") {
            $param2 .= "&".$key."=".$value;
        }
    }
}

if (!$page) {
    $page = 1;
}

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminPromotion = new AdminPromotion($pdo);

    $offline_coupon_info = $AdminPromotion->getOfflineCouponInfo($sno);
    
    $add_where = "AND top.coupon_sno = {$sno} AND top.flag = 'Y'";
    
    if ($searchTitle != "") {
        $add_where .= " AND tod.m_id = '{$searchTitle}'";
    }

    $orderby = "tod.regdt DESC";

    $code_used_list = $AdminPromotion->getCouponCodeUsedList($page, $add_where, $orderby, $param2);
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$back_btn = "./offline_coupon_list.php".($param?"?".base64_decode($param):"");

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
    <div class="wrapper">
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
        <div class="content-page">
            <!-- Start Content-->
            <div class="content">
                <div class="container-fluid">
                    <!-- start page title -->
                    <div class="row">
                        <div class="col-12">
                            <div class="page-title-box">
                                <div class="page-title-right">
                                    <ol class="breadcrumb m-0">
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">프로모션</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">오프라인 쿠폰 관리</a></li>
                                        <li class="breadcrumb-item active"><?=$page_title?></li>
                                    </ol>
                                </div>
                                <h4 class="page-title"><?=$page_title?></h4>
                            </div>
                        </div>
                    </div>
                    <!-- end page title -->

                    <div class="row">
                        <div class="col-8">
                            <div class="card border border-1">
                                <div class="card-header bg-secondary text-white fw-bold font-15">오프라인 쿠폰 기본정보</div>
                                <div class="card-body">
                                    <div class="mb-2 row">
                                        <label for="coupon_name" class="col-sm-2 col-form-label bg-light">* 쿠폰명</label>
                                        <div class="col-sm-6 d-flex align-items-center">
                                            <?=$offline_coupon_info['coupon_name']?>
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="reason" class="col-sm-2 col-form-label bg-light">* 쿠폰 사유</label>
                                        <div class="col-sm-6 d-flex align-items-center">
                                            <?=$offline_coupon_info['reason']?>
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="issueLimitCnt" class="col-sm-2 col-form-label bg-light">* 쿠폰 발행 수량</label>
                                        <div class="col-sm-6 d-flex align-items-center">
                                            <?=$offline_coupon_info['issueLimitCnt']?> 장
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="sdate" class="col-sm-2 col-form-label bg-light">* 쿠폰 사용기간</label>
                                        <div class="col-sm-6 d-flex align-items-center">
                                            <?=$offline_coupon_info['sdate']?> ~ <?=$offline_coupon_info['edate']?>
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="partner" class="col-sm-2 col-form-label bg-light">* 쿠폰 사용처</label>
                                        <div class="col-sm-6 d-flex align-items-center">
                                            <?=$offline_coupon_info['partner']?>
                                        </div>
                                    </div>
                                </div>
                                <!-- end card-body-->
                            </div>
                        </div>
                    </div>
                    
                    <div class="page-title-box">
                        <h4 class="page-title fs-5 lh-1">오프라인 쿠폰 사용현황</h4>
                    </div>

                    <div class="row" style="margin: 10px 0 10px 0;">
                        <form method="get" action="<?=$_SERVER['PHP_SELF']?>" style="padding-left: 0px; display: flex; align-items: center; gap: 5px;">
                            <input type="hidden" name="sno" value="<?=$sno?>">
                            <input type="hidden" name="param" value="<?=$param?>">
                            <input type="text" class="form-control" id="searchTitle" name="searchTitle" placeholder="회원아이디" value="<?=$searchTitle?>" style="width: 200px;display: inline-block;">
                            <button type="submit" class="btn btn-primary shadow-none">검색</button>
                        </form>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <div class="d-flex flex-row justify-content-between mb-2">
                                <div class="float-start"><?=number_format($code_used_list->total_results)?> 건</div>
                            </div>

                            <div class="table-responsive">
                                <table class="table table-hover table-centered w-100 dt-responsive nowrap table-sm table-bordered" id="">
								    <thead class="table-light font-13">
    									<tr>
                                            <th class="text-center">번호</th>
                                            <th class="text-center">쿠폰번호</th>
                                            <th class="text-center">아이디</th>
                                            <th class="text-center">사용일자</th>
                                        </tr>
                                    </thead>
                                    <tbody class="font-12 bg-white">
                                    <?php
                                    if ($code_used_list->success == true) {
                                        $result = $code_used_list->resultset->fetchAll();
                                        $num = 0;

                                        foreach ($result AS $value) {
                                    ?>
                                        <tr>
                                            <td class="text-center"><?=$code_used_list->total_results-($num+($page-1)*20)?></td>
                                            <td class="text-center"><?=$value['number']?></td>
                                            <td class="text-center"><?=$value['m_id']?></td>
                                            <td class="text-center"><?=$value['regdt']?></td>
                                        </tr>
                                    <?php
                                            $num++;
                                        }
                                    }
                                    ?>
                                    </tbody>
                                </table>
                                <div class="text-center mt-3"><?=$code_used_list->links_html;?></div>
                            </div>
                        </div>
                    </div>

                    <div class="col-2 mx-auto mb-2">
                        <a href="<?=$back_btn?>" class="btn btn-secondary shadow-none">목록</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>