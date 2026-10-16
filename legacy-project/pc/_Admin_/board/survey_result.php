<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);

$topmenu['board'] = "active";
$page_title = "설문조사 결과보기";
$sidebar_file = "sidebar_board.php";

$add_where = "";
$orderby = " ts.idx DESC";

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminBoard = new AdminBoard($pdo);

    $survey_info = $AdminBoard->getSurveyInfo($idx);
    $survey_count = $AdminBoard->getSurveyCount($idx)['cnt'];
    $survey_questions = json_decode($survey_info['question'] ?? '[]', true);
    
    if (!$survey_info) {
        echo "잘못된접근";
        exit;
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

                                <div class="card-header bg-secondary text-white fw-bold font-15">설문 상세결과
                                    <a href="./survey_result_user.php?idx=<?=$idx?>" target="_blank" class="btn btn-primary shadow-none btn-sm font-12 ms-1">계정별 결과</a>
                                </div>
                                <div class="card-body">
                                    <?php
                                        foreach ($survey_questions AS $questions) {
                                            $itemNum = $questions['number'] + 1;
                                    ?>
                                    <div class="mb-2 row">
                                        <label for="subject" class="col-sm-12 col-form-label bg-light"><?="{$itemNum}. {$questions['question']}"?></label>
                                        <div class="m-1">
                                        <?php
                                            if ($questions['type'] == "descript") {
                                        ?>
                                                <a href="./survey_result_etc.php?idx=<?=$questions['idx']?>" target="_blank" class="btn btn-outline-secondary btn-sm font-12">답변 보기</a>
                                        <?php
                                            } else {
                                        ?>
                                            
                                        <?php
                                                $items = $questions['item'];

                                                foreach ($items AS $item) {
                                                    $answerCount = $AdminBoard->getAnswerCount($questions['idx'], $item['number'])['cnt'];
                                                    echo "{$item['number']}. {$item['item']} - {$answerCount} 명<br>";
                                                }

                                                if ($questions['etc']) {
                                                    $answerCount = $AdminBoard->getAnswerCount($questions['idx'], 100)['cnt'];
                                                    echo "기타 - {$answerCount} 명 <a href=\"./survey_result_etc.php?idx={$questions['idx']}\" class=\"btn btn-outline-secondary btn-sm font-12\" target=\"_blank\">답변 보기</a>";
                                                }
                                            }
                                        ?>
                                        </div>
                                    </div>
                                    <?php
                                        }
                                    ?>
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