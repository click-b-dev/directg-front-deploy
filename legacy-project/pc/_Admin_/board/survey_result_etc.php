<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$idx  = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING);

$topmenu['board'] = "active";
$page_title = "설문조사 '기타' 결과보기";
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

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminBoard = new AdminBoard($pdo);

    $etc_answer_list = $AdminBoard->getEtcAnswerList($idx, $page, $param);

    // 기타 답변 총인원
    $answerAllCount = $AdminBoard->getAnswerCount($idx, 100)['cnt'];
    $answerTrueCount = $etc_answer_list->total_results;

    if ($answerAllCount == 0) {
        $answerAllCount = $answerTrueCount;
    }
    
    // if (!$etc_answer_list->total_results) {
    //     echo "잘못된접근";
    //     exit;
    // }

    if ($etc_answer_list->success == true) {
        $result = $etc_answer_list->resultset->fetchAll();
    }
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

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

                    <div class="row">
                        <div class="col-8">
                            <div class="card border border-1">
                                <div class="card-header bg-secondary text-white fw-bold font-15">설문조사 요약</div>
                                <div class="card-body">
                                    <div class="mb-2 row">
                                        <label for="subject" class="col-sm-2 col-form-label bg-light">설문 제목</label>
                                        <div class="col-sm-10 d-flex align-items-center">
                                            <?=$result[0]['question']?>
                                        </div>
                                    </div>
                                    <div class="mb-2 row">
                                        <label for="subject" class="col-sm-2 col-form-label bg-light">내용 有 / 총 인원</label>
                                        <div class="col-sm-10 d-flex align-items-center">
                                            <?=$answerTrueCount." / ".$answerAllCount?> 명
                                        </div>
                                    </div>
                                </div>

                                <div class="card-header bg-secondary text-white fw-bold font-15">설문 응답결과</div>
                                <div class="card-body">
                                    <?php if ($result[0]['answer'] === NULL) { ?>
                                    <div class="mb-2">
                                        <form id="excel_form" action="./survey_result_etc_excel.php" method="POST">
                                            <input type="hidden" name="idx" value="<?=$idx?>">
                                        </form>
                                        <button type="button" class="btn btn-light shadow-none border" id="btn_excel_download">
                                            <i class="mdi mdi-microsoft-excel font-16"></i> CSV 다운로드
                                        </button>
                                    </div>
                                    <?php } ?>
                                    <table class="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
                                        <thead class="table-light font-13">
                                            <tr>
                                                <th class="text-center">번호</th>
                                                <th class="text-center">답변내용</th>
                                                <th class="text-center">답변회원ID</th>
                                            </tr>
                                        </thead>
                                        <tbody class="font-12 bg-white">
                                    <?php
                                        $num = 0;

                                        foreach ($result as $value) {
                                    ?>
                                            <tr>
                                                <td class="text-center"><?=$etc_answer_list->total_results-($num+($page-1)*50)?></td>
                                                <td class="text-center"><?=$value['answer_text']?></td>
                                                <td class="text-center"><?=$value['m_id']?></td>
                                            </tr>
                                    <?php
                                            $num++;
                                        }
                                    ?>
                                        </tbody>
                                    </table>
                                    <div class="text-center mt-3"><?=$etc_answer_list->links_html;?></div>
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
            if (<?=$etc_answer_list->total_results?> > 0) {
                const excelForm = $('#excel_form');
               
                excelForm.submit();
            } else {
                alert('검색결과가 있는 경우만 가능합니다.');
            }
        })
    })
</script>