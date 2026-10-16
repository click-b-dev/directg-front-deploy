<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$page         = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_type  = filter_input(INPUT_GET, 'search_type', FILTER_SANITIZE_STRING);
$search_value = trim(filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING));

$topmenu['board'] = "active";
$page_title = "설문조사 목록";
$sidebar_file = "sidebar_board.php";

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

$orderby = " ts.idx DESC";

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminBoard = new AdminBoard($pdo);

    $survey_list = $AdminBoard->getSurveyList($page, $add_where, $orderby, $param);
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

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
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">게시판</a></li>
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">설문조사 관리</a></li>
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
                                                            <option value="ts.subject" <?=$selected['search_type']['ts.subject']?>>제목</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-sm-6 ps-0">
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
                        <div class="float-start"><?=number_format($survey_list->total_results)?> 개</div>
                        <div class="float-end">
                            <a href="./survey_register.php" class="btn btn-danger">설문조사 등록</a>
                        </div>
                    </div>

                    <!-- 테이블 start -->
                    <div class="row">
                        <div class="col-12 table-responsive">
                            <table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                                <thead class="table-light font-13">
                                    <tr>
                                        <th class="text-center">번호</th>
                                        <th class="text-center">이미지</th>
                                        <th class="text-center">설문제목</th>
                                        <th class="text-center">등록일</th>
                                        <th class="text-center">진행기간</th>
                                        <th class="text-center">참여대상</th>
                                        <th class="text-center">진행상태</th>
                                        <th class="text-center">미리보기</th>
                                        <th class="text-center">결과보기</th>
                                        <th class="text-center">수정</th>
                                    </tr>
                                </thead>
                                <tbody class="font-12 bg-white">
                                <?php
                                if ($survey_list->success == true) {
                                    $result = $survey_list->resultset->fetchAll();
                                    $num = 0;

                                    // 미리보기 가능한 시간 (현재 시간 + 1시간)
                                    $validUntil = time() + 3600; 
                                    $secretKey = 'admin-survey'; // 이 키만 알고 있으면 됩니다.

                                    foreach ($result as $value) {
                                ?>
                                    <tr>
                                        <td class="text-center"><?=$survey_list->total_results-($num+($page-1)*20)?></td>
                                        <td class="text-center">
                                            <?php if (!empty($value['banner_image'])) { ?>
                                                <img src="<?="https://directg.net".$value['banner_image']?>" alt="배너" style="max-width: 100px;">
                                            <?php } ?>
                                        </td>
                                        <td class="text-center"><?=$value['subject']?></td>
                                        <td class="text-center"><?=$value['reg_dt']?></td>
                                        <td class="text-center <?=($value['end_dt'] < date("Y-m-d H:i:s") || $value['start_dt'] > date("Y-m-d H:i:s"))?"text-danger":""?>">
                                            <?=$value['start_dt']?> ~ <?=$value['end_dt']?>
                                        </td>
                                        <td class="text-center">
                                            <?=$AdminBoard->getSurveyCount($value['idx'])['cnt']?> / <?=($value['max_people']==0)?"무제한":$value['max_people']?>
                                        </td>
                                        <td class="text-center"><b><?=(($value['flag']=='Y')?'진행':'종료')?></b></td>
                                        <td class="text-center">
                                            <a href="/event/survey.html?idx=<?=$value['idx']?>" target="_blank" class="btn btn-outline-secondary btn-sm font-12">PC</a>
                                            <a href="<?=$_SERVER['REQUEST_SCHEME']?>://m.<?=$_SERVER['HTTP_HOST']?>/event/survey.html?idx=<?=$value['idx']?>&expires=<?=$validUntil?>&key=<?=$secretKey?>" target="_blank" class="btn btn-outline-secondary btn-sm font-12">MOBILE</a>
                                        </td>
                                        <td class="text-center">
                                            <a href="./survey_result.php?idx=<?=$value['idx']?>" target="_blank" class="btn btn-outline-secondary btn-sm font-12">결과보기</a>
                                        </td>
                                        <td class="text-center">
                                            <a href="./survey_register.php?idx=<?=$value['idx']?>&mode=update&param=<?=$back_btn?>" class="btn btn-outline-secondary btn-sm font-12">수정</a>
                                        </td>
                                    </tr>
                                <?php
                                        $num++;
                                    }
                                }
                                ?>
                                </tbody>
                            </table>
                            <div class="text-center mt-3"><?=$survey_list->links_html;?></div>
                        </div>
                    </div>
                    <!-- 테이블 end -->
                </div>
            </div>
            <!-- End content -->
        </div>
    </div>
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>