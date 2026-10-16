<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$idx  = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);
$search_value = filter_input(INPUT_GET, 'search_value', FILTER_SANITIZE_STRING);

$topmenu['board'] = "active";
$page_title = "설문조사 '사용자별' 결과보기";
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

$add_where = "";

if ($search_value != '') {
    $add_where .= " AND tsa.m_id = '{$search_value}'";
}

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminBoard = new AdminBoard($pdo);

    $survey_info = $AdminBoard->getSurveyInfo($idx);
    $survey_count = $AdminBoard->getSurveyCount($idx)['cnt'];
    $survey_questions = json_decode($survey_info['question'] ?? '[]', true);

    $user_answer_list = $AdminBoard->getUserAnswerList($idx, $page, $param, $add_where);

    if (!$survey_info) {
        echo "잘못된접근";
        exit;
    }

    if ($user_answer_list->success == true) {
        $result = $user_answer_list->resultset->fetchAll();
    }
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
<style>
    /* 1. 테이블 전체 레이아웃 및 폰트 다듬기 */
    .table-centered {
        table-layout: fixed !important; /* 컬럼 너비를 고정하여 내용에 의해 찌그러지는 것 방지 */
        width: 100% !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        letter-spacing: -0.02em;
    }

    /* 2. 헤더(Thead) 스타일링 - 조금 더 차분하고 고급스러운 톤으로 변경 */
    .table-centered thead.table-light {
        background-color: #f8f9fa !important;
        border-bottom: 2px solid #e9ecef !important;
    }

    .table-centered thead th {
        padding: 12px 8px !important;
        vertical-align: middle !important;
        color: #495057 !important;
        font-weight: 600 !important;
    }

    /* 헤더 버튼 스타일 세밀 조정 (설문 문항 버블) */
    .table-centered thead th .btn-outline-secondary {
        border-color: #dee2e6 !important;
        background-color: #ffffff !important;
        color: #495057 !important;
        padding: 4px 10px !important;
        border-radius: 4px !important;
        font-weight: 500 !important;
        white-space: nowrap !important;
        transition: all 0.2s;
    }

    .table-centered thead th .btn-outline-secondary:hover {
        background-color: #e9ecef !important;
        border-color: #ced4da !important;
        color: #212529 !important;
    }

    /* 3. 컬럼별 너비(Width) 밸런스 조정 (12개 문항 분배) */
    .table-centered th:nth-child(1),
    .table-centered td:nth-child(1) { width: 60px !important; } /* 번호 */

    .table-centered th:nth-child(2),
    .table-centered td:nth-child(2) { width: 160px !important; } /* 회원ID */

    /* 1번~12번 문항 컬럼 유연하면서도 최소 크기 확보 */
    .table-centered th:not(:nth-child(1)):not(:nth-child(2)),
    .table-centered td:not(:nth-child(1)):not(:nth-child(2)) {
        min-width: 140px !important;
    }

    /* 4. 본문 데이터 셀(Td) 스타일링 */
    .table-centered tbody td {
        padding: 12px 10px !important;
        vertical-align: middle !important; /* 상하 가운데 정렬 필수 */
        color: #495057 !important;
        border-color: #f1f3f5 !important; /* 부드러운 그리드 라인 */
        line-height: 1.5 !important;
    }

    /* 5. 복수 응답 등 줄바꿈(<br>) 처리된 텍스트 왼쪽 정렬 및 깔끔하게 정돈 */
    .table-centered tbody td {
        text-align: left !important; /* 기본적으로 내용이 긴 설문은 좌측 정렬이 훨씬 깔끔합니다 */
    }
    /* 단, 번호와 이메일 ID는 가운데 정렬 유지 */
    .table-centered tbody td:nth-child(1),
    .table-centered tbody td:nth-child(2) {
        text-align: center !important;
    }

    /* 주관식 답변(예: "할인을 자주해주세요!") 텍스트가 너무 튄다면 부드럽게 */
    .table-centered tbody td:not(:nth-child(1)):not(:nth-child(2)) {
        font-weight: 400 !important;
        word-break: keep-all !important; /* 단어 단위 줄바꿈으로 깔끔하게 */
    }

    /* 6. 행 마우스 오버 효과 강화 */
    .table-hover tbody tr:hover {
        background-color: #fdfdfd !important;
        box-shadow: inset 1px 0 0 #3b71ca; /* 마우스 올린 행 좌측에 포인트 선 */
    }
    .table-container {
        width: 100%;       /* 컨테이너는 화면 너비에 맞춤 */
        overflow-x: auto;  /* 내용이 넘칠 때만 가로 스크롤바 생성 */
        white-space: nowrap; /* 텍스트가 임의로 줄바꿈되는 것을 방지 */
    }

    .table-container table {
  width: max-content;      /* 1. 테이블 너비를 내부 콘텐츠의 최대 크기에 맞춤 */
  table-layout: auto !important; /* 2. 브라우저가 콘텐츠 양에 따라 열 너비를 자동으로 계산 */
}

.table-container th, 
.table-container td {
  /* 3. 글자가 좁아서 밑으로 떨어지는 것을 절대 방지 */
  white-space: nowrap !important; 
  
  /* 4. (선택) 각 칸의 최소 너비를 보장하고 싶다면 지정 (예: 100px) */
  min-width: 100px; 
}
</style>
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

                    <div class="row">
                        <div class="col-12">
                            <div class="card border border-1">
                                <div class="card-header bg-secondary text-white fw-bold font-15">설문조사 요약</div>
                                <div class="card-body">
                                    <div class="mb-2 row">
                                        <label for="subject" class="col-sm-2 col-form-label bg-light">설문 제목</label>
                                        <div class="col-sm-10 d-flex align-items-center">
                                            <?=$survey_info['subject']?>
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="subject" class="col-sm-2 col-form-label bg-light">설문 기간</label>
                                        <div class="col-sm-10 d-flex align-items-center">
                                            <?=$survey_info['start_dt']?> ~ <?=$survey_info['end_dt']?>
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="subject" class="col-sm-2 col-form-label bg-light">참여제한</label>
                                        <div class="col-sm-10 d-flex align-items-center">
                                            <?=($survey_info['max_people']!=0)?$survey_info['max_people']." 명":"없음"?>
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="subject" class="col-sm-2 col-form-label bg-light">참여자현황</label>
                                        <div class="col-sm-10 d-flex align-items-center">
                                            총 <?=$survey_count?> 명 (총 지급 포인트 <?=number_format($survey_count*$survey_info['point'])?>)
                                        </div>
                                    </div>
                                </div>

                                <div class="card-header bg-secondary text-white fw-bold font-15">설문 응답결과</div>
                                <div class="card-body">
                                    <form class="form-horizontal" method="get" action="<?=$_SERVER['PHP_SELF']?>">
                                        <input type="hidden" name="idx" value="<?=$idx?>">
                                        <div class="row mb-2">
                                            <div class="col-lg-6">
                                                <div class="input-group row">
                                                    <label for="" class="col-sm-2 col-form-label bg-light border">검색어</label>
                                                    <div class="col-sm-6">
                                                        <input type="text" class="form-control" id="search_value" name="search_value" placeholder="회원ID" value="<?=$search_value?>">
                                                    </div>
                                                    <div class="col-sm-2 ps-0">
                                                        <button type="submit" class="btn btn-primary shadow-none">검색</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                               
                                    <div class="table-container">
                                        <table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                                            <thead class="table-light font-13">
                                                <tr>
                                                    <th class="text-center">번호</th>
                                                    <th class="text-center">회원ID</th>
                                        <?php
                                            foreach ($survey_questions AS $questions) {
                                                $itemNum = $questions['number'] + 1;
                                        ?>
                                                    <th class="text-center">
                                                        <button type="button" class="btn btn-outline-secondary btn-sm font-12"
                                                                data-bs-toggle="tooltip" data-bs-placement="top"
                                                                data-bs-custom-class="custom-tooltip"
                                                                data-bs-title="<?=$questions['question']?>">
                                                        <?=$itemNum?>번 문항
                                                        </button>
                                                    </th>
                                        <?php
                                                if ($questions['etc']) {
                                        ?>
                                                    <th class="text-center">
                                                        <button type="button" class="btn btn-outline-secondary btn-sm font-12"
                                                                data-bs-toggle="tooltip" data-bs-placement="top"
                                                                data-bs-custom-class="custom-tooltip"
                                                                data-bs-title="<?=$questions['question']?>">
                                                        <?=$itemNum?>번 문항 '기타'
                                                        </button>
                                                    </th>
                                        <?php
                                                }
                                            }
                                        ?>
                                                </tr>
                                            </thead>
                                            <tbody class="font-12 bg-white">
                                        <?php
                                            $num = 0;

                                            foreach ($result as $value) {
                                        ?>
                                                <tr>
                                                    <td class="text-center"><?=$user_answer_list->total_results-($num+($page-1)*50)?></td>
                                                    <td class="text-center"><?=$value['m_id']?></td>
                                                    <!-- 문항별 답변가져오기 -->
                                        <?php
                                                foreach ($survey_questions as $q) {
                                                    $user_answer = $AdminBoard->getUserAnswerInfo($q['idx'], $value['m_id'], "")[0];

                                                    if ($q['type'] == 'descript') {
                                                        $user_answer = $user_answer['answer_text'];
                                                    } else {
                                                        $user_answer = $user_answer['answer'];
                                                    }
                                        ?>
                                                    <td class="text-center"><?=$user_answer?></td>
                                        <?php
                                                    if ($q['etc']) {
                                                        // 기타의견 추가로
                                                        $user_answer = $AdminBoard->getUserAnswerInfo($q['idx'], $value['m_id'], "AND tsa.answer = 100")[0];
                                                        $user_answer = $user_answer['answer_text'];
                                        ?>
                                                    <td class="text-center"><?=$user_answer?></td>
                                        <?php
                                                    }
                                                }
                                        ?>
                                                </tr>
                                        <?php
                                                $num++;
                                            }
                                        ?>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="text-center mt-3"><?=$user_answer_list->links_html;?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- End content -->
        </div>
    </div>
    <?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
<script type="text/javascript">
    $(document).ready(function(){
        $('#btn_excel_download').bind("click", function(){
            if (<?=$user_answer_list->total_results?> > 0) {
                const excelForm = $('#excel_form');
                // const searchForm = $('#search_form');

                // excelForm.find('.temp-filter').remove();

                // const formData = searchForm.serializeArray();

                // excelForm.append($('<input>', {
                //     type: 'hidden',
                //     name: 'page',
                //     value: '<?=$page?>>',
                //     class: 'temp-filter' // 나중에 지우기 쉽게 클래스 지정
                // }));

                // $.each(formData, function(i, field) {
                //     excelForm.append($('<input>', {
                //         type: 'hidden',
                //         name: field.name,
                //         value: field.value,
                //         class: 'temp-filter' // 나중에 지우기 쉽게 클래스 지정
                //     }));
                // });

                excelForm.submit();
            } else {
                alert('검색결과가 있는 경우만 가능합니다.');
            }
        })
    })
</script>