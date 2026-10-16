<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page         = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type  = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

$topmenu['promotion'] = "active";
$page_title = "오프라인 쿠폰 리스트";
$sidebar_file = "sidebar_promotion.php";

// 검색필터 페이지네이션 적용
foreach ($_GET as $key => $value) {
    if ($key <> "page") {
        if ($value <> "") {
            $param .= "&".$key."=".$value;
        }
    }
}

if (!$page) {
    $page = 1;
}

$where = [];
$add_where = "";

if ($search_value) {
    $where[] = " {$search_type} LIKE '%{$search_value}%'";
}

foreach ($where as $value) {
    $add_where .= " AND {$value}";
}

$orderby = " toc.sno DESC";

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminPromotion = new AdminPromotion($pdo);

    $offline_coupon_list = $AdminPromotion->getOfflineCouponList($page, $add_where, $orderby, $param);
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$code_type_arr = array(
    "DOWNLOAD"  => "다운로드",
    "STATIC"    => "지정코드",
    "DYNAMIC"   => "난수코드"
);

$status_arr = array(
    0 => "발급대기",
    1 => "발급중",
    2 => "일시정지",
    3 => "발급종료"
);

$selected['search_type'][$search_type] = "selected";
$param = $param."&page={$page}"; // 목록버튼 사용
$back_btn = urlencode(base64_encode(mb_substr($param, 1)));

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

                    <!-- 검색필터 start -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <h5 class="card-header bg-secondary text-white">검색필터</h5>
                                <div class="card-body">
                                    <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                        <div class="row mb-2">
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">검색어</label>
                                                    <div class="col-sm-3">
                                                        <select class="form-control" name="search_type" id="search_type">
                                                            <option value="toc.coupon_name" <?=$selected['search_type']['toc.coupon_name']?>>쿠폰명</option>
                                                            <option value="toc.partner" <?=$selected['search_type']['toc.partner']?>>사용처</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6">
                                                        <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                                    </div>
                                                </div>
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
                        </div>
                    </div>
                    <!-- 검색필터 end -->

                    <div class="d-flex flex-row justify-content-between mb-2">
                        <div class="float-start"><?=number_format($offline_coupon_list->total_results)?> 개</div>
                    </div>

                    <!-- 테이블 start -->
                    <div class="row">
                        <div class="col-12 table-responsive">
                            <table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                                <thead class="table-light font-13">
                                    <tr>
                                        <th class="text-center">번호</th>
                                        <th class="text-center">쿠폰명</th>
                                        <th class="text-center">등록일</th>
                                        <th class="text-center">사용처</th>
                                        <th class="text-center">사용기간</th>
                                        <th class="text-center">적립금</th>
                                        <th class="text-center">발급유형</th>
                                        <th class="text-center">발급수</th>
                                        <th class="text-center">사용수</th>
                                        <th class="text-center">발급상태</th>
                                        <th class="text-center">발급내역관리</th>
                                        <th class="text-center">코드</th>
                                        <th class="text-center">수정</th>
                                    </tr>
                                </thead>
                                <tbody class="font-12 bg-white">
                                <?php
                                if ($offline_coupon_list->success == true) {
                                    $result = $offline_coupon_list->resultset->fetchAll();
                                    $num = 0;

                                    foreach ($result as $value) {
                                ?>
                                    <tr>
                                        <td class="text-center"><?=$offline_coupon_list->total_results-($num+($page-1)*20)?></td>
                                        <td class="text-center"><?=$value['coupon_name']?></td>
                                        <td class="text-center"><?=$value['regdt']?></td>
                                        <td class="text-center"><?=$value['partner']?></td>
                                        <td class="text-center<?=($value['edate'] < date("Y-m-d H:i:s"))?" text-danger":""?>"><?=$value['sdate']?> ~ <?=$value['edate']?></td>
                                        <td class="text-center"><?=number_format($value['coupon_price'])?> <?=$value['currency']?></td>
                                        <td class="text-center"><?=$code_type_arr[$value['code_type']]?></td>
                                        <td class="text-end"><?=number_format($value['issueLimitCnt'])?></td>
                                        <td class="text-end"><?=$AdminPromotion->getOfflineCouponUseCount($value['sno'])?></td>
                                        <td class="text-center"><?=$status_arr[$value['status']]?></td>
                                        <td class="text-center">
                                            <a href="./offline_coupon_view.php?sno=<?=$value['sno']?>&param=<?=$back_btn?>" class="btn btn-outline-secondary btn-sm font-12">
                                                사용현황
                                            </a>
                                        </td>
                                        <td class="text-center">
                                            <a href="./offline_coupon_download.php?sno=<?=$value['sno']?>" target="_blank" class="btn btn-outline-secondary btn-sm font-12">다운로드</a>
                                        </td>
                                        <td class="text-center">
                                            <a href="./offline_coupon_register.php?sno=<?=$value['sno']?>&mode=update&param=<?=$back_btn?>" class="btn btn-outline-secondary btn-sm font-12">수정</a>
                                        </td>
                                    </tr>
                                <?php
                                        $num++;
                                    }
                                }
                                ?>
                                </tbody>
                            </table>
                            <div class="text-center mt-3"><?=$offline_coupon_list->links_html;?></div>
                        </div>
                    </div>
                    <!-- 테이블 end -->
                </div> <!-- container -->
            </div> <!-- content -->
        </div>
    </div> <!-- /wrapper -->
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
