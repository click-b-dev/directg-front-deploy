<?php
$sidebar_file = "sidebar_order.php";
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_key = filter_input(INPUT_GET, 'search_key', FILTER_SANITIZE_STRING);
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));
$search_start_date = filter_input(INPUT_GET, 'search_start_date', FILTER_SANITIZE_STRING);
$search_end_date = filter_input(INPUT_GET, 'search_end_date', FILTER_SANITIZE_STRING);
$date_label = filter_input(INPUT_GET, 'date_label', FILTER_SANITIZE_STRING);
$search_year = filter_input(INPUT_GET, 'search_year', FILTER_SANITIZE_NUMBER_INT);

$topmenu['order'] = "active";
$page_title = "과거주문 리스트";

if (!$page) {
    $page = 1;
}

$where = [];

//if ($search_start_date == "") {
//    // 당일
//    $d = mktime(0,0,0, date("m"), 1, date("Y"));
//    $search_start_date = date('Y-m-d');
//}
//
//if ($search_end_date == "") {
//    // 당일
//    $d = mktime(0,0,0, date("m"), 1, date("Y"));
//    $search_end_date = date('Y-m-d');
//}

// 무조건 $search_year 해당년도의 전체기간으로 처리
$search_start_date = "";
$search_end_date = "";
$date_label = "전체기간"; // date라벨도 초기화

if ($search_year == "") {
    $search_year = 2020; // 기본값
}

if ($search_value) {
    switch ($search_key) {
        case "search_settle_no":
            $where[] = "a.settle_no = '{$search_value}";
            break;
        case "search_ordno":
            $where[] = "b.ordno = '{$search_value}'";
            break;
        case "search_product_code":
            $where[] = "b.product_code = '{$search_value}'";
            break;
        case "search_m_id":
            $where[] = "a.email = '{$search_value}'";
            break;
    }

//    $search_start_date = "";
//    $search_end_date = "";
//    $date_label = "전체기간"; // date라벨도 초기화
//} else {
//    if ($date_label == "전체기간") {
//        $date_label = ""; // 검색키워드 지우고 다시 검색할때 date라벨도 기본값으로 초기화
//    }
//
//    if ($search_start_date) {
//        $where[] = " a.ord_ymd >= '{$search_start_date} 00:00:00'";
//    }
//
//    if ($search_end_date) {
//        $where[] = " a.ord_ymd <= '{$search_end_date} 23:59:59'";
//    }
}

foreach ($_GET as $key => $value) {
    if ($key <> "page" ) {
        if ($value <> "") {
            $param .= "&{$key}={$value}";
        }
    }
}

$add_where = "";

foreach ($where as $value) {
    $add_where .= " and {$value}";
}

$orderby = " a.ord_ymd DESC";

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminOrder = new AdminOrder($pdo);
    $order_list = $adminOrder->getOrderOldList($page, $add_where, $orderby, $param, $search_year);
} catch (PDOException $e) {
    echo "Error!: {$e->getMessage()}";
    die();
}

$selected['search_key'][$search_key] = "selected";
$selected['search_year'][$search_year] = "selected";

$settlekind2 = array(
    "000000"=>"현금",
    "SC0000"=>"무통장입금",
    "SC0010"=>"신용카드",
    "SC0030"=>"실시간 계좌이체",
    "SC0040"=>"가상계좌",
    "SC0060"=>"휴대폰",
    "DG0000"=>"전액할인",
    "PAYCO"=>"PAYCO",
    "samsung"=>"삼성페이",
    "naverpay"=>"네이버페이",
    "POINT"=>"네이버포인트"
);

$settleStatus2 = array(
    "0"=>"결제완료",
    "1"=>"결제대기",
    "2"=>"결제완료",
    "3"=>"결제실패",
    "9"=>"결제취소",
    "99"=>"주문취소"
);

//주문상태
$orderStatus = array(
    "0"=>"주문완료",
    "1"=>"주문대기",
    "2"=>"주문완료",
    "8"=>"취소요청",
    "9"=>"취소완료",
);
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
                                    <li class="breadcrumb-item"><a href="javascript: void(0);">주문</a></li>
                                    <li class="breadcrumb-item"><a href="javascript: void(0);">주문 관리</a></li>
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
                            <form id="search_form" class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                <input id="date_label" type="hidden" name="date_label" value="<?=$date_label?>">
                                <div class="row mb-2">
                                    <div class="col-lg-6">
                                        <div class="input-group row">
                                            <select class="form-select col-sm-3" name="search_key" id="search_key">
                                                <option value="search_ordno" <?=$selected['search_key']['search_ordno']?>>주문번호</option>
                                                <option value="search_settle_no" <?=$selected['search_key']['search_settle_no']?>>결제번호</option>

                                                <option value="search_m_id" <?=$selected['search_key']['search_m_id']?>>회원아이디</option>
                                                <option value="search_product_code" <?=$selected['search_key']['search_product_code']?>>옵션상품코드</option>
                                            </select>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-lg-12">
                                        <div class="row">
                                            <label for="search_payment_method" class="col-sm-1 col-form-label bg-light border">기간검색</label>
                                            <div class="col-sm-1">
                                                <select class=" form-control input-sm" id="search_year" name="search_year">
                                                    <option value="">::연도선택::</option>
                                                    <option value="2013" <?=$selected['search_year'][2013]?>>2013년</option>
                                                    <option value="2014" <?=$selected['search_year'][2014]?>>2014년</option>
                                                    <option value="2015" <?=$selected['search_year'][2015]?>>2015년</option>
                                                    <option value="2016" <?=$selected['search_year'][2016]?>>2016년</option>
                                                    <option value="2017" <?=$selected['search_year'][2017]?>>2017년</option>
                                                    <option value="2018" <?=$selected['search_year'][2018]?>>2018년</option>
                                                    <option value="2019" <?=$selected['search_year'][2019]?>>2019년</option>
                                                    <option value="2020" <?=$selected['search_year'][2020]?>>2020년</option>
                                                </select>
                                            </div>
                                            <div class="col-sm-2">
                                                <div id="reportrange" class="form-control" data-toggle="date-picker-range" data-target-display="#reportrange"  data-cancel-class="btn-light">
                                                    <i class="mdi mdi-calendar"></i>&nbsp;
                                                    <span id="reportrange"></span> <i class="mdi mdi-menu-down"></i>
                                                </div>
                                            </div>
                                            <div class="col-sm-4">
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="search_start_date" name="search_start_date" placeholder="시작일자" value="<?=$search_start_date?>" readonly onchange="endDateOpen()">
                                                    <span class="input-group-text">~</span>
                                                    <input type="text" class="form-control" id="search_end_date" name="search_end_date" placeholder="종료일자" value="<?=$search_end_date?>" readonly>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="float-end">
                                            <button type="submit" class="btn btn-primary shadow-none">주문내역 검색</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="d-flex flex-row justify-content-between mb-2">
                    <div class="float-start"><?=number_format($order_list->total_results)?> 개</div>
                    <div class="float-end"></div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <table class="table table-centered w-100  nowrap table-sm table-bordered border-light" id="" cellpadding="0" cellpadding="0">
                            <thead class="table-light font-13">
                            <tr>
                                <th class="text-center">번호</th>
                                <th class="text-center">주문일자</th>
                                <th class="text-center">결제번호</th>
                                <th class="text-center">주문번호</th>
                                <th class="text-center">회원아이디</th>
                                <th class="text-center">상품정보</th>
                                <th class="text-center">주문금액</th>
                                <th class="text-center">결제일자</th>
                                <th class="text-center">결제방법</th>
                                <th class="text-center">PG</th>
                                <th class="text-center">결제상태</th>
                                <th class="text-center">주문상태</th>
                                <th class="text-center">키확인</th>
                            </tr>
                            </thead>
                            <tbody class="bg-white font-12">
                            <?php
                            if ($order_list->success == true) {
                                $result = $order_list->resultset->fetchAll();

                                $num = 0;

                                foreach ($result as $value) {
                                    if ($value['order_system'] = "") {
                                        $order_system_error = "bg-danger";
                                    } else {
                                        $order_system_error = "";
                                    }
                            ?>
                                    <tr class="<?=$order_system_error?>">
                                        <td class="text-center <?=$order_system_error?>"><?=$order_list->total_results-($num+($page-1)*20)?></td>
                                        <td class="text-center"><?=$value['ord_ymd']?></td>
                                        <td class="text-center"><a href="./order_old_view.php?settle_no=<?=$value['settle_no']?>&search_year=<?=$search_year?>"><?=$value['settle_no']?></a></td>
                                        <td class="text-center"><?=$value['ordno']?></td>
                                        <td><?=$value['email']?></td>
                                        <td class="text-start">
                                            <?=$value['product_nm']?><br/>
                                            <?php
                                                if ($value['supp_cd']=="4" || $value['supp_cd']=="5") {
                                                    echo " <small class='label label-info'>번들</small>";

                                                }
//                                                if ($goods_gift > 0) {
//                                                    echo " <small class='label label-success'>사은품</small>";
//                                                }
                                            ?>
                                        </td>
                                        <td class="text-end"><?=number_format($value['tot_pay'])?></td>
                                        <td class="text-center">
                                            <?php
                                            if ($value['step'] <> '1') {
                                                echo $value['cdt'];
                                            }
                                            ?>
                                        </td>
                                        <td class="text-center"><?=$settlekind2[$value['settlekind']]?></td>
                                        <td class="text-center"><?=$value['pg_provider']?></td>
                                        <td class="text-center"><?=$settleStatus2[$value['step']]?></td>
                                        <td class="text-center"><?=$orderStatus[$value['status']]?></td>
                                        <td class="text-center"><?=($value['is_lic_actv']=="1")?"O":"X"?></td>
                                    </tr>
                            <?php
                                    $num++;
                                }
                            }
                            ?>
                            </tbody>
                        </table>
                        <div>
                            <form id="excel_form" action="./order_old_excel.php" method="POST">
                                <input type="hidden" name="excel_name" value="주문목록_<?=date('Ymd')?>">
                            </form>
                            <button type="button" class="btn btn-light shadow-none border" id="btn_excel_download">
                                <i class="mdi mdi-microsoft-excel font-16"></i> CSV 다운로드
                            </button>
                        </div>
                        <div class="text-center mt-3"><?=$order_list->links_html?></div>
                    </div> <!-- end col -->
                </div>
            </div> <!-- container -->
        </div> <!-- content -->
	</div><!-- /content-page -->
</div><!-- /wrapper -->
	<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>

<script type="text/javascript">
    $(function() {
        const targetInput1 = $('#search_start_date');
        const targetInput2 = $('#search_end_date');
        const searchStartDate = '<?=$search_start_date?>';
        const searchEndDate = '<?=$search_end_date?>';
        const date_label = $('#date_label').val();

        function cb(start, end, label) {
            // 라벨에 현재 선택한 text를 줌
            $('#reportrange span').html(label);
            $('#date_label').val(label); // 선택한 라벨을 필터 검색후에도 유지하기 위함
            $('#search_start_date').val(start.format('YYYY-MM-DD'));
            $('#search_end_date').val(end.format('YYYY-MM-DD'));

            if (label === '직접선택') {
                targetInput1.attr('type', 'date');
                targetInput2.attr('type', 'date');
                targetInput1.prop('readonly', false);
                targetInput2.prop('readonly', false);

                // 포커스를 주어 브라우저 기본 달력 유도 (또는 값 비우기)
                const rawInput = targetInput1[0]; // jQuery 객체를 순수 DOM으로 변환

                if (typeof rawInput.showPicker === 'function') {
                    rawInput.showPicker();
                } else {
                    // showPicker를 지원하지 않는 구형 브라우저 대응 (클릭 유도)
                    targetInput1.focus().click();
                }
            } else {
                targetInput1.attr('type', 'text');
                targetInput2.attr('type', 'text');
                targetInput1.prop('readonly', true);
                targetInput2.prop('readonly', true);
            }
        }

        $('#reportrange').daterangepicker({
            startDate: moment(searchStartDate),
            endDate: moment(searchEndDate),
            showCustomRangeLabel: false,
            autoUpdateInput: false,
            autoApply: false,
            ranges: {
                '전체기간': [moment(searchStartDate), moment(searchEndDate)],
                // '오늘': [moment(), moment()],
                // '어제': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                // '지난 7일': [moment().subtract(6, 'days'), moment()],
                // '지난 30일': [moment().subtract(29, 'days'), moment()],
                // '이번달': [moment().startOf('month'), moment().endOf('month')],
                // '지난달': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                // "직접선택": [null, null]
            }
        }, cb);

        // 생성될 시 현재 선택된 날짜 ranges 로 표기
        if (date_label) {
            $('#reportrange span').text('<?=$date_label?>');

            if (date_label == "직접선택") {
                targetInput1.attr('type', 'date');
                targetInput2.attr('type', 'date');
                targetInput1.prop('readonly', false);
                targetInput2.prop('readonly', false);
            }
        } else {
            $('#reportrange span').text('전체기간');
        }

        // 두 input의 값이 변경될 때마다 함수 실행
        $('#search_start_date, #search_end_date').on('change', function() {
            checkDateRange(this);
        });
    });

    function endDateOpen() {
        const targetInput2 = $('#search_end_date');

        const rawInput = targetInput2[0]; // jQuery 객체를 순수 DOM으로 변환

        if (typeof rawInput.showPicker === 'function') {
            rawInput.showPicker();
        } else {
            // showPicker를 지원하지 않는 구형 브라우저 대응 (클릭 유도)
            targetInput2.focus().click();
        }
    }

    // 날짜 차이를 체크하는 공통 함수
    function checkDateRange(element) {
        const start = $('#search_start_date').val();
        const end = $('#search_end_date').val();

        // 두 값이 모두 있을 때만 계산 실행
        if (start && end) {
            const startDate = moment(start);
            const endDate = moment(end);

            // 날짜 차이 계산 (단위: 일)
            const diffDays = endDate.diff(startDate, 'days');

            if (diffDays < 0) {
                alert("종료일이 시작일보다 빠를 수 없습니다.");
                $('#search_end_date').val(''); // 잘못된 값 초기화
                return false;
            }

            if (diffDays > 93) {
                alert("조회 기간은 최대 93일을 초과할 수 없습니다.\n현재 선택 기간: " + diffDays + "일");

                // 초과 시 처리 로직 (예: 종료일을 시작일 + 93일로 강제 조정하거나 초기화)
                if (element.id == "search_start_date") {
                    $('#search_start_date').val('');
                } else {
                    $('#search_end_date').val('');
                }

                return false;
            }
        }

        return true;
    }
</script>
<script type="text/javascript">
    $(document).ready(function(){
        $('#btn_excel_download').bind("click", function(){
            if (<?=$order_list->total_results?> > 0) {
                const excelForm = $('#excel_form');
                const searchForm = $('#search_form');

                excelForm.find('.temp-filter').remove();

                const formData = searchForm.serializeArray();

                excelForm.append($('<input>', {
                    type: 'hidden',
                    name: 'page',
                    value: '<?=$page?>>',
                    class: 'temp-filter' // 나중에 지우기 쉽게 클래스 지정
                }));

                $.each(formData, function(i, field) {
                    excelForm.append($('<input>', {
                        type: 'hidden',
                        name: field.name,
                        value: field.value,
                        class: 'temp-filter' // 나중에 지우기 쉽게 클래스 지정
                    }));
                });

                excelForm.submit();
            } else {
                alert('검색결과가 있는 경우만 가능합니다.');
            }
        })
    })
</script>
</body>
</html>