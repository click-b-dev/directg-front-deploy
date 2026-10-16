<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page         = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_year  = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);

$topmenu['china'] = "active";
$page_title = "중국 누적매출 현황";
$sidebar_file = "sidebar_china.php";

// 2016년 부터 현재기준 년도까지
$start_year = "2016";
$end_year = date('Y');

// 매출대상 arr
$target_name_arr = [
    "중국 산시성" => [
        "510616056@qq.com"
    ],
    "중국 안후이성" => [
        "yu13705514354@hotmail.com"
    ],
    "중국 저장성" => [
        "2094609892@qq.com"
    ],
    "중국 허난성" => [
        "sihuanxiaomaibu@hotmail.com"
    ]
];

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $China = new China($pdo);
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$selected['search_year'][$search_year] = "selected";

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
<style>
    .zero-value { color: #C0C0C0; }
</style>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
    <div class="wrapper">
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
        <div class="content-page">
            <div class="content">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="page-title-box">
                                <div class="page-title-right">
                                    <ol class="breadcrumb m-0">
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">중국 결제</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">중국 결제 관리</a></li>
                                        <li class="breadcrumb-item active"><?=$page_title?></li>
                                    </ol>
                                </div>
                                <h4 class="page-title"><?=$page_title?></h4>
                            </div>
                        </div>
                    </div>

                    <div class="row d-none">
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
                                                        <select class="form-control" name="search_year" id="search_year">
                                                <?php for ($year = $start_year; $year <= $end_year; $year++) { ?>
                                                    <option value="<?=$year?>"><?=$year?> 년</option>
                                                <?php } ?>
                                                        </select>
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

                    <div class="row">
                        <div class="col-12 table-responsive">
                            <table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                                <thead class="table-light font-13">
                                    <tr>
                                        <th class="text-center">연도별 매출</th>
                                    <?php foreach ($target_name_arr as $name => $val) { ?>
                                        <th class="text-center"><?=$name?></th>
                                    <?php } ?>
                                        <th class="text-center">합계</th>
                                    </tr>
                                </thead>
                                <tbody class="font-12 bg-white">
                                <?php for ($year = $start_year; $year <= $end_year; $year++) { ?>
                                    <tr>
                                        <td class="text-center"><?=$year?>년</td>
                                    <?php
                                    foreach ($target_name_arr as $name => $val) {
                                        // 주문자(name), 해당년도 대상
                                        $target = $val[0];
                                        $amount = $China->getSalesByYear($target, $year)['amount'];

                                        // 전체연도(지역별) 총합
                                        $total["total_{$name}"][] = $amount;

                                        // 해당년도(전체지역) 총합
                                        $total["year_total_{$year}"][] = $amount;
                                    ?>
                                        <td class="text-end <?=(!$amount)?"zero-value":""?>">
                                            <?=number_format($amount)." 원"?>
                                        </td>
                                    <?php
                                    }

                                    // 전체연도(전체지역) 총합
                                    $total["total_all"][] = array_sum($total["year_total_{$year}"]);
                                    ?>
                                        <td class="text-end <?=(!array_sum($total["year_total_{$year}"]))?"zero-value":""?>">
                                            <?=number_format(array_sum($total["year_total_{$year}"]))." 원"?>
                                        </td>
                                    </tr>
                                <?php } ?>
                                </tbody>
                                <tfoot class="table-light font-13">
                                    <tr>
                                        <th class="text-center">누적 매출</th>
                                    <?php foreach ($target_name_arr as $name => $val) { ?>
                                        <th class="text-end <?=(!array_sum($total["total_{$name}"]))?"zero-value":""?>">
                                            <?=number_format(array_sum($total["total_{$name}"]))." 원"?>
                                        </th>
                                    <?php } ?>
                                        <th class="text-end <?=(!array_sum($total["total_all"]))?"zero-value":""?>">
                                            <?=number_format(array_sum($total["total_all"]))." 원"?>
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>