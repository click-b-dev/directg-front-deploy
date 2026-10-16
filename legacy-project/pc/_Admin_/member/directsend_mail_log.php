<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$topmenu['member'] = "active";
$page_title = "자동메일발송 로그";
$sidebar_file = "sidebar_member.php";

$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$gubun = filter_input(INPUT_GET, 'gubun', FILTER_SANITIZE_STRING);
$failed = filter_input(INPUT_GET, 'failed', FILTER_SANITIZE_STRING);
$search_type    = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value   = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

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

if (!$gubun) {
    $gubun = "all";
}

if (!$result) {
    $result = "all";
}

if ($failed == "") {
    $failed = "all";
}

$where = [];
$add_where = "";

if ($gubun != "all") {
    $where[] = " tea.gubun = '{$gubun}'";
}

if ($failed != "all") {
    if ($failed == 1) {
        $where[] = " tea.failed IN(1, 4)";
    } else {
        $where[] = " tea.failed = '{$failed}'";
    }
}

if ($search_value) {
    $where[] = " tea.email = '{$search_value}'";
}

foreach ($where as $value) {
    $add_where .= " and {$value}";
}

$orderby = "tea.reg_date DESC";

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminV1 = new AdminV1($pdo);

    $mail_log_list = $adminV1->getDirectSendMailLog($page, $add_where, $orderby, $param);
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$gubun_arr = array(
    "join" => "가입인증",
    "password" => "비밀번호찾기",
    "qna" => "문의답변"
);

// State - 1 : 발송대기 / 2 : 성공 / 3 : 일시적 / 4 : 도메인에러 / 5 : 서버연결 / 6 : 메일박스 / 7 : 기타 / 8 : 수신거부
$state_arr = array (
    1 => "발송대기",
    2 => "성공",
    3 => "일시적",
    4 => "도메인에러",
    5 => "서버연결",
    6 => "메일박스",
    7 => "기타",
    8 => "수신거부"
);

$selected['gubun'][$gubun] = "checked";
$selected['failed'][$failed] = "checked";
$selected['search_type'][$search_type] = "selected";

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": false}'>
    <div class="wrapper">
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_start.php'); ?>
        <div class="content-page">
            <!-- Start Content-->
            <div class="content">
                <!-- start page title -->
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <div class="page-title-box">
                                <div class="page-title-right">
                                    <ol class="breadcrumb m-0">
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">홈</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">회원</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">자동메일 관리</a></li>
                                        <li class="breadcrumb-item active"><?=$page_title?></li>
                                    </ol>
                                </div>
                                <h4 class="page-title"><?=$page_title?></h4>
                            </div>
                        </div>
                    </div>     
                    <!-- end page title --> 

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
                                                            <option value="tea.email" <?=$selected['search_type']['tea.email']?>>발송대상</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6">
                                                        <input type="text" class="form-control" id="search_value" name="search_value" placeholder="검색어" value="<?=$search_value?>">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row mb-2">
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">발송구분</label>
                                                    <div class="col-sm-9 mt-1">
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="gubun1" name="gubun" class="form-check-input" value="" <?=$selected['gubun']['all']?>>
                                                            <label class="form-check-label" for="gubun1">전체</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="gubun2" name="gubun" class="form-check-input" value="join" <?=$selected['gubun']['join']?>>
                                                            <label class="form-check-label" for="gubun2">가입인증</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="gubun3" name="gubun" class="form-check-input" value="password" <?=$selected['gubun']['password']?>>
                                                            <label class="form-check-label" for="gubun3">비밀번호찾기</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="gubun4" name="gubun" class="form-check-input" value="qna" <?=$selected['gubun']['qna']?>>
                                                            <label class="form-check-label" for="gubun4">문의답변</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-3 col-form-label bg-light border">발송결과</label>
                                                    <div class="col-sm-9 mt-1">
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="failed1" name="failed" class="form-check-input" value="" <?=$selected['failed']['all']?>>
                                                            <label class="form-check-label" for="failed1">전체</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="failed2" name="failed" class="form-check-input" value="0" <?=$selected['failed'][0]?>>
                                                            <label class="form-check-label" for="failed2">성공</label>
                                                        </div>
                                                        <div class="form-check form-check-inline">
                                                            <input type="radio" id="failed3" name="failed" class="form-check-input" value="1" <?=$selected['failed'][1]?>>
                                                            <label class="form-check-label" for="failed3">실패</label>
                                                        </div>
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
                        <!-- end col -->
                    </div>
                    <!-- end row -->

                    <div class="d-flex flex-row justify-content-between mb-2">
                        <div class="float-start"><?=number_format($mail_log_list->total_results)?> 개</div>
                    </div>
                    
                    <div class="row">
                        <div class="col-12 table-responsive">
                            <table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                                <thead class="table-light font-13">
                                    <tr>
                                        <th class="text-center">번호</th>
                                        <th class="text-center">발송유형</th>
                                        <th class="text-center">발송구분</th>
                                        <th class="text-center">발송대상</th>
                                        <th class="text-center">발송일시</th>
                                        <th class="text-center">발송결과</th>
                                        <th class="text-center">발송실패</th>
                                        <th class="text-center">상태</th>
                                        <th class="text-center" style="width: 150px;">오류내용</th>
                                    </tr>
                                </thead>
                                <tbody class="font-12 bg-white">
                                <?php
                                if ($mail_log_list->success == true) {
                                    $result = $mail_log_list->resultset->fetchAll();
                                    $num = 0;

                                    foreach ($result as $value) {
                                        $member_tmp = $adminV1->getMemberInfo($value['m_no'])
                                ?>
                                    <tr>
                                        <td class="text-center"><?=$mail_log_list->total_results-($num+($page-1)*50)?></td>
                                        <td class="text-center">DirectSend API</td>
                                        <td class="text-center"><?=$gubun_arr[$value['gubun']]?></td>
                                        <td class="text-center"><?=$value['email']?></td>
                                        <td class="text-center"><?=$value['reg_date']?></td>
                                        <td class="text-center"><?=$value['result']?></td>
                                        <td class="text-center"><?=($value['failed'] != 0?"실패":"")?></td>
                                        <td class="text-center"><?=$state_arr[$value['state']]?></td>
                                        <td class="text-center"><?=$value['SmtpMsg']?></td>
                                    </tr>
                                <?php
                                        $num++;
                                    }
                                }
                                ?>
                                </tbody>
                            </table>
                            <div class="text-center mt-3"><?=$mail_log_list->links_html;?></div>
                        </div>
                    </div>
                </div> <!-- container -->
            </div> <!-- content -->
        </div><!-- /content-page -->
    </div><!-- /wrapper -->
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
