<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$search_year  = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_STRING);
$search_month = filter_input(INPUT_GET, 'search_month', FILTER_SANITIZE_STRING);

$topmenu['china'] = "active";
$page_title = "중국 월별주문 현황";
$sidebar_file = "sidebar_china.php";

// 2016년 부터 현재기준 년도까지
$start_year = "2016";
$end_year = date('Y');

if (!$search_year) {
    $search_year = $end_year;
}

if (!$search_month) {
    $search_month = date('n');
}

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

    $order_titles = $China->getOrderByMonthTitles($search_year, $search_month);
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$selected['search_year'][$search_year] = "selected";
$selected['search_month'][$search_month] = "selected";

if (isset($_GET['mode']) && $_GET['mode'] === 'excel') {
    $filename = "통계_매출분석_결제수단별 매출통계_월.xls";
    header("Content-Type: application/vnd.ms-excel; charset=utf-8");
    header("Content-Disposition: attachment; filename={$filename}");
    header("Cache-Control: max-age=0");

    echo "\xEF\xBB\xBF";
?>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta http-equiv="Content-type" content="text/html;charset=utf-8" />
    <style>
        table, .table { 
            border-collapse: collapse !important; 
            font-family: 'Malgun Gothic', '맑은 고딕', sans-serif !important; 
            font-size: 10pt !important; 
            color: #000000 !important;
            width: auto !important; 
        }
        
        table th, table td, .table th, .table td, .table-bordered th, .table-bordered td { 
            border: 0.5pt solid #D9D9D9 !important; 
            padding: 5px 8px !important; 
            height: 24pt !important;
            background-image: none !important;
            background-color: #FFFFFF !important; /* 기본 바탕은 무조건 흰색 */
            color: #000000 !important;
        }
        
        thead tr th, tfoot tr th, .table-light, .table thead th, .table tfoot th { 
            background-color: #F2F2F2 !important; 
            background: #F2F2F2 !important;
            font-weight: bold !important; 
            text-align: center !important;
        }
        
        .text-center { text-align: center !important; }
        .text-start { text-align: left !important; }
        .text-end { 
            text-align: right !important; 
            mso-number-format:"\#\,\#\#0" !important; 
        }

        table td.zero-value, .table td.zero-value, .zero-value { 
            mso-number-format:"\#\,\#\#0\;\-\#\,\#\#0\;\[Color 16\]0" !important;
            color: #B0B0B0 !important; /* 혹시 모를 웹 뷰 대비 */
        }
        
        table td:first-child, .table td:first-child { width: 300px !important; text-align: left !important; }
        table td:nth-child(2), .table td:nth-child(2) { width: 70px !important; }
        table td:nth-child(3), .table td:nth-child(3) { width: 90px !important; }
    </style>
    </head>
    <body>
<?php include_table_template($search_year, $search_month, $target_name_arr, $order_titles, $China); ?>
    </body>
    </html>
<?php
    exit;
}

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

                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <h5 class="card-header bg-secondary text-white">검색필터</h5>
                                <div class="card-body">
                                    <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                        <div class="row mb-2">
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">기간</label>
                                                    <div class="col-sm-2">
                                                        <select class="form-control" name="search_year" id="search_year" onchange="this.form.submit()">
                                                        <?php for ($year = $start_year; $year <= $end_year; $year++) { ?>
                                                            <option value="<?=$year?>" <?=$selected['search_year'][$year]?>>
                                                                <?=$year?> 년
                                                            </option>
                                                        <?php } ?>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-2 ps-0">
                                                        <select class="form-control" name="search_month" id="search_month" onchange="this.form.submit()">
                                                        <?php for ($month = 1; $month <= 12; $month++) { ?>
                                                            <option value="<?=$month?>" <?=$selected['search_month'][$month]?>>
                                                                <?=$month?> 월
                                                            </option>
                                                        <?php } ?>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row d-none">
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
                            <?php include_table_template($search_year, $search_month, $target_name_arr, $order_titles, $China); ?>

                            <div class="mb-2">
                                <form id="excel_form" action="<?=$_SERVER['PHP_SELF']?>" method="GET">
                                    <input type="hidden" name="mode" value="excel">
                                    <input type="hidden" name="search_year" value="<?=$search_year?>">
                                    <input type="hidden" name="search_month" value="<?=$search_month?>">
                                </form>
                                <button type="button" class="btn btn-light shadow-none border" id="btn_excel_download">
                                    <i class="mdi mdi-microsoft-excel font-16"></i> CSV 다운로드
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
<script type="text/javascript">
    $(document).ready(function(){
        $('#btn_excel_download').bind("click", function(){
            // if (<?=$etc_answer_list->total_results?> > 0) {
            //     const excelForm = $('#excel_form');
               
            //     excelForm.submit();
            // } else {
            //     alert('검색결과가 있는 경우만 가능합니다.');
            // }
            const excelForm = $('#excel_form');
               
            excelForm.submit();
        })
    })
</script>

<?php
function include_table_template($search_year, $search_month, $target_name_arr, $order_titles, $China) {
?>
    <table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
        <thead class="table-light font-13">
            <tr>
                <th class="text-center"><?=$search_year?>년 <?=$search_month?>월</th>
                <th class="text-center" rowspan="2">플랫폼</th>
                <th class="text-center" rowspan="2">단가</th>
            <?php foreach ($target_name_arr as $name => $val) { ?>
                <th class="text-center" colspan="2"><?=$name?></th>
            <?php } ?>
                <th class="text-center" colspan="2">전체 합계</th>
            </tr>
            <tr>
                <th class="text-center">타이틀별</th>
            <?php foreach ($target_name_arr as $name => $val) { ?>
                <th class="text-center">수량</th>
                <th class="text-center">금액</th>
            <?php } ?>
                <th class="text-center">수량</th>
                <th class="text-center">합계 금액</th>
            </tr>
        </thead>
        <tbody class="font-12 bg-white">
        <?php
        $grand_total = array(
            'total_all_qty' => 0,
            'total_all_amount' => 0
        );

        foreach ($target_name_arr as $name => $val) {
            $grand_total["total_qty_{$name}"] = 0;
            $grand_total["total_amount_{$name}"] = 0;
        }
        ?>

        <?php foreach ($order_titles as $title) { ?>
            <tr>
                <td class="text-center"><?=$title['product_nm']?></td>
                <td class="text-center"><?=$title['platform']?></td>
                <td class="text-end"><?=number_format($title['price'])?></td>
            <?php
            $row_qty = 0;
            $row_amount = 0;

            foreach ($target_name_arr as $name => $val) {
                $target = $val[0];
                $amount = $China->getSalesByMonth($target, $search_year, $search_month, "AND tioi.product_nm = '{$title['product_nm']}' AND tioi.platform = '{$title['platform']}' AND tioi.price = '{$title['price']}'");

                $current_qty = $amount['qty'] ?? 0;
                $current_amount = $amount['amount'] ?? 0;

                $grand_total["total_qty_{$name}"] += $current_qty;
                $grand_total["total_amount_{$name}"] += $current_amount;

                $row_qty += $current_qty;
                $row_amount += $current_amount;
            ?>
                <td class="text-end <?=(!$current_qty)?"zero-value":""?>">
                    <?=number_format($current_qty)?>
                </td>
                <td class="text-end <?=(!$current_amount)?"zero-value":""?>">
                    <?=number_format($current_amount)?>
                </td>
            <?php
            }

            $grand_total['total_all_qty'] += $row_qty;
            $grand_total['total_all_amount'] += $row_amount;
            ?>
                <td class="text-end <?=(!$row_qty)?"zero-value":""?>"><?=number_format($row_qty)?></td>
                <td class="text-end <?=(!$row_amount)?"zero-value":""?>"><?=number_format($row_amount)?></td>
            </tr>
        <?php } ?>
        </tbody>
        
        <tfoot class="table-light font-13">
            <tr>
                <th class="text-center" colspan="3">총합계</th>
            <?php foreach ($target_name_arr as $name => $val) { ?>
                <th class="text-end <?=(!$grand_total["total_qty_{$name}"])?"zero-value":""?>">
                    <?=number_format($grand_total["total_qty_{$name}"])?>
                </th>
                <th class="text-end <?=(!$grand_total["total_amount_{$name}"])?"zero-value":""?>">
                    <?=number_format($grand_total["total_amount_{$name}"])?>
                </th>
            <?php } ?>
                <th class="text-end <?=(!$grand_total['total_all_qty'])?"zero-value":""?>">
                    <?=number_format($grand_total['total_all_qty'])?>
                </th>
                <th class="text-end <?=(!$grand_total['total_all_amount'])?"zero-value":""?>">
                    <?=number_format($grand_total['total_all_amount'])." 원"?>
                </th>
            </tr>
        </tfoot>
    </table>
<?php
}
?>