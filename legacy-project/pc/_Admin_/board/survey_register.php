<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode  = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$idx   = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_STRING);
$param = filter_input(INPUT_GET, 'param', FILTER_SANITIZE_STRING);

if ($mode == "update") {
    $action = "수정";
} else {
    $action = "등록";
}

$topmenu['board'] = "active";
$page_title = "설문조사 {$action}";
$sidebar_file = "sidebar_board.php";

if (!$mode) {
    $mode = "register";
}

// 참여인원 있을시 수정불가 플래그
$isLocked = 0;

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $AdminBoard = new AdminBoard($pdo);

    if ($mode == "update") {
        $survey_info = $AdminBoard->getSurveyInfo($idx);
        $survey_count = $AdminBoard->getSurveyCount($idx)['cnt'];
        $survey_questions = json_decode($survey_info['question'] ?? '[]', true);

        if ($survey_count) {
            $isLocked = 1;
        }
    }
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}

$selected['flag'][$survey_info['flag']] = "checked";
$selected['max_people'][$survey_info['max_people']] = "checked";
$selected['view_result'][$survey_info['view_result']??"N"] = "checked";
$selected['flag'][$survey_info['flag']] = "selected";

$back_btn = "./survey_list.php".($param?"?".base64_decode($param):"");

include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_head.php');
?>
<style>
    .req_mark {
        color: red;
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
                    
                    <!-- start form -->
                    <form id="frm" name="frm" method="POST" action="./survey_ps.php" class="form-horizontal" enctype="multipart/form-data">
                        <input type="hidden" name="mode" value="<?=$mode?>">
                        <input type="hidden" name="idx" value="<?=$idx?>">

                        <div class="row">
                            <div class="col-8">
                                <div class="card border border-1">
                                    <div class="card-header bg-secondary text-white fw-bold font-15">기본설정</div>
                                    <div class="card-body">
                                        <div class="mb-2 row">
                                            <label for="banner_image" class="col-sm-2 col-form-label bg-light d-flex align-items-center">설문 배너 이미지</label>
                                            <div class="col-sm-6">
                                                <?php if (!empty($survey_info['banner_image'])) { ?>
                                                    <div class="mb-2 current-banner">
                                                        <img src="<?="https://directg.net".$survey_info['banner_image']?>" alt="배너" style="max-width: 300px; class="img-thumbnail d-block mb-1">
                                                        <div class="form-check">
                                                            <input class="form-check-input" type="checkbox" name="delete_current_image" value="Y" id="delImg">
                                                            <input type="hidden" name="delete_current_image_url" value="<?=$survey_info['banner_image']?>">
                                                            <label class="form-check-label small text-danger" for="delImg">기존 이미지 삭제</label>
                                                        </div>
                                                    </div>
                                                <?php } ?>

                                                <input type="file" class="form-control" id="banner_image" name="banner_image" accept="image/*">
                                                <div class="form-text small text-muted">추천 사이즈: 1200x400 (jpg, png, gif 형식만 가능)</div>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="subject" class="col-sm-2 col-form-label bg-light"><span class="req_mark">*</span> 설문 제목</label>
                                            <div class="col-sm-6">
                                                <input type="text" id="subject" name="subject" class="form-control" value="<?=$survey_info['subject']?>" required>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="start_dt" class="col-sm-2 col-form-label bg-light"><span class="req_mark">*</span> 설문 기간</label>
                                            <div class="col-sm-6">
                                                <div class="input-group">
                                                    <input type="datetime-local" id="start_dt" name="start_dt" class="form-control" value="<?=$survey_info['start_dt']?>" required>
                                                    <span class="input-group-text">~</span>
                                                    <input type="datetime-local" id="end_dt" name="end_dt" class="form-control" value="<?=$survey_info['end_dt']?>" required>
                                                    <button type="button" class="bg-transparent border-0" onclick="$('#start_dt').val('');$('#end_dt').val('')">
                                                        <i class="mdi mdi-delete-outline fs-4"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="max_people1" class="col-sm-2 col-form-label bg-light"><span class="req_mark">*</span> 참여 인원 제한</label>
                                            <div class="col-sm-6 mt-1 d-flex align-items-center">
                                                <div class="form-check form-check-inline mb-0">
                                                    <input type="radio" id="max_people1" name="max_people" class="form-check-input limit-radio" value="0" <?=$selected['max_people'][0]?> required <?=($survey_count > 0)?"disabled":""?>>
                                                    <label class="form-check-label" for="max_people1">무제한</label>
                                                </div>
                                                <div class="form-check form-check-inline d-inline-flex align-items-center gap-2">
                                                    <input type="radio" id="max_people2" name="max_people" class="form-check-input limit-radio" value="" <?=$selected['max_people'][($survey_info['max_people']!=0)?$survey_info['max_people']:""]?> required <?=($survey_count > 0)?"disabled":""?>>
                                                    <label class="form-check-label mb-0" for="max_people2">최대</label>
                                                    <input type="number" id="max_people3" name="max_people_val" class="form-control w-auto d-inline-block" style="max-width: 80px;" value="<?=$survey_info['max_people']?>" <?=($survey_count > 0)?"disabled":""?>>
                                                    <span class="text-center">명</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-2 row d-none">
                                            <label for="view_result1" class="col-sm-2 col-form-label bg-light"><span class="req_mark">*</span> 참여완료 시 결과보기</label>
                                            <div class="col-sm-6 mt-1">
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="view_result1" name="view_result" class="form-check-input" value="Y" <?=$selected['view_result']['Y']?> required <?=($mode=="update")?"disabled":""?>>
                                                    <label class="form-check-label" for="view_result1">제공</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input type="radio" id="view_result2" name="view_result" class="form-check-input" value="N" <?=$selected['view_result']['N']?> required <?=($mode=="update")?"disabled":""?>>
                                                    <label class="form-check-label" for="view_result2">미제공</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="point" class="col-sm-2 col-form-label bg-light">참여 포인트</label>
                                            <div class="col-sm-2">
                                                <input type="number" id="point" name="point" class="form-control" value="<?=$survey_info['point']?>" <?=($mode=="update")?"disabled":""?>>
                                            </div>
                                        </div>
                                        <div class="mb-2 row">
                                            <label for="point" class="col-sm-2 col-form-label bg-light">진행상태</label>
                                            <div class="col-sm-2">
                                                <select name="flag" class="form-select">
                                                    <option value="Y" <?=$selected['flag']['Y']?>>진행</option>
                                                    <option value="N" <?=$selected['flag']['N']?>>종료</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="card-header bg-secondary text-white fw-bold font-15">내용 설정</div>
                                    <div class="card-body <?=($survey_count > 0)?'disabled-target':''?>">
                                        <div class="mb-2 row">
                                            <label class="col-sm-2 col-form-label bg-light text-center fw-bold"><span class="text-danger">*</span> 설문항목</label>
                                            <div class="col-sm-10">
                                                <button type="button" class="btn btn-outline-secondary" onclick="addQuestion('multiple')">객관식 추가</button>
                                                <button type="button" class="btn btn-outline-secondary" onclick="addQuestion('subjective')">주관식 추가</button>
                                            </div>
                                        </div>

                                        <div id="surveyQuestionContainer" class="mt-3">
                                        <?php
                                        foreach ($survey_questions as $idx => $q) {
                                            $itemNum = $idx + 1;
                                            
                                            // 1. 객관식과 주관식 공통 타입 분기용 변수 지정
                                            $type = ($q['type'] === 'descript') ? 'sub' : 'obj';

                                            // 2. 객관식일 때 세부 보기(item) 코드를 먼저 조립
                                            $optionsHtml = '';
                                            if ($type === 'obj') {
                                                // 보기가 비어있는 경우 기본 2개 노출 처리 예외방어
                                                $items = $q['item'] ?? [['item' => ''], ['item' => '']];
                                                foreach ($items as $opt) {
                                                    $val = htmlspecialchars($opt['item']);
                                                    $optionsHtml .= "
                                                    <div class='d-flex align-items-center gap-2 mb-1'>
                                                        <input type='radio' disabled class='form-check-input'>
                                                        <input type='text' name='surveyQuestionItem[{$idx}][]' value='{$val}' class='form-control form-control-sm w-50' placeholder='옵션 입력' maxlength='50'>
                                                    </div>";
                                                }
                                            }

                                            // 3. 템플릿 파일을 읽어와 변수 처리된 컴포넌트로 렌더링
                                            ob_start();
                                            include './survey_template.php';
                                            $templateHtml = ob_get_clean();

                                            // 4. 치환 문자열 매핑
                                            $replaceMap = [
                                                '{{idx}}' => $idx,
                                                '{{itemNum}}' => $itemNum,
                                                '{{question_title}}' => htmlspecialchars($q['question']),
                                                '{{required_checked}}' => $q['required'] === 'Y' ? 'checked' : '',
                                                '{{type_radio_checked}}' => $q['type'] === 'radio' ? 'checked' : '',
                                                '{{type_checkbox_checked}}' => $q['type'] === 'checkbox' ? 'checked' : '',
                                                '{{options_html}}' => $optionsHtml
                                            ];

                                            echo str_replace(array_keys($replaceMap), array_values($replaceMap), $templateHtml);
                                        }
                                        ?>
                                        </div>
                                    </div>
                                    <!-- end card-body-->
                                </div>
                                <div class="col-2 mx-auto mb-2">
                                    <a href="<?=$back_btn?>" class="btn btn-secondary shadow-none">목록</a>
                                    <button type="submit" class="btn btn-primary shadow-none"><?=$action?></button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <!-- end form -->
                </div>
            </div>
            <!-- content -->
        </div>
    </div> <!-- /wrapper -->
<?php include_once($_SERVER['DOCUMENT_ROOT'].'/_Admin_/inc/admin_body_end.php'); ?>
</body>
</html>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
<template id="objTemplateStorage">
    <?php $type = 'obj'; include './survey_template.php'; ?>
</template>
<template id="subTemplateStorage">
    <?php $type = 'sub'; include './survey_template.php'; ?>
</template>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        // PHP에서 넘겨받은 잠금 여부 플래그 (참여자가 있으면 true)
        const isLocked = <?=$isLocked?>; 

        if (isLocked) {
            // 내용 설정의 card-body 영역 하나만 정확히 조준
            const targetContainer = document.querySelector('.card-body.disabled-target');
            
            if (targetContainer) {
                // 그 내부에 존재하는 모든 input, select, textarea, button, a 태그 수집
                const formElements = targetContainer.querySelectorAll('input, select, textarea, button, a');
                
                formElements.forEach(el => {
                    // 1. 일반 폼 요소 잠금
                    el.disabled = true;
                    
                    // 2. 링크(<a>) 태그 형태의 버튼이나 기능 무력화 및 투명도 조절
                    if (el.tagName === 'A') {
                        el.style.pointerEvents = 'none';
                        el.style.opacity = '0.5';
                    }
                    
                    // 3. 부트스트랩 버튼(btn) 클래스가 있으면 시각적으로도 먹통으로 보이게 보정
                    if (el.classList.contains('btn')) {
                        el.classList.add('disabled');
                        el.style.opacity = '0.6'; // 좀 더 어둡게 처리해서 잠긴 티 내기
                    }
                });
                
                alert("참여 대상이 존재하여 기본 설정 이외의 항목은 수정할 수 없습니다.");
            }
        }
    });

    let questionCount = <?= count($survey_questions ?? []) ?>;

    function addQuestion(type) {
        let template = '';
        let currentIdx = questionCount;
        let itemNum = currentIdx + 1;

        if (type === 'multiple') {
            // 객관식 추가 클릭 시
            template = document.getElementById('objTemplateStorage').innerHTML;
            
            // 초기 생성용 기본 빈 세부 항목(item) 2개 세팅
            let initialOptions = `
                <div class="d-flex align-items-center gap-2 mb-1">
                    <input type="radio" disabled class="form-check-input">
                    <input type="text" name="surveyQuestionItem[${currentIdx}][]" class="form-control form-control-sm w-50" placeholder="옵션 입력" maxlength="50">
                </div>
                <div class="d-flex align-items-center gap-2 mb-1">
                    <input type="radio" disabled class="form-check-input">
                    <input type="text" name="surveyQuestionItem[${currentIdx}][]" class="form-control form-control-sm w-50" placeholder="옵션 입력" maxlength="50">
                </div>
            `;
            
            template = template.replace(/{{options_html}}/g, initialOptions);
            template = template.replace(/{{type_radio_checked}}/g, 'checked'); // 라디오 기본 활성화
            template = template.replace(/{{type_checkbox_checked}}/g, '');
        } else if (type === 'subjective') {
            // 주관식 추가 클릭 시
            template = document.getElementById('subTemplateStorage').innerHTML;
        }

        // 공통 문자열 값 치환
        template = template.replace(/{{idx}}/g, currentIdx);
        template = template.replace(/{{itemNum}}/g, itemNum);
        template = template.replace(/{{question_title}}/g, '');
        template = template.replace(/{{required_checked}}/g, '');

        // 컨테이너 영역 끝자리에 추가 생성
        document.getElementById('surveyQuestionContainer').insertAdjacentHTML('beforeend', template);
        
        questionCount++;
    }

    // [참고] 보기를 동적으로 추가할 때도 부모의 qidx(문항 인덱스)를 찾아서 매칭하도록 갱신해야 합니다.
    function addOption(link) {
        const optionList = link.closest('.card-body').querySelector('.option-list');
        const qIdx = optionList.getAttribute('data-qidx'); // 해당 문항 번호 추출
        
        const newOption = document.createElement('div');
        newOption.className = "d-flex align-items-center gap-2 mb-1";
        newOption.innerHTML = `
            <input type="radio" disabled class="form-check-input">
            <input type="text" name="surveyQuestionItem[${qIdx}][]" class="form-control form-control-sm w-50" placeholder="옵션 입력" maxlength="50">
            <button type="button" class="btn-close btn-sm" style="font-size:10px" onclick="this.parentElement.remove()"></button>
        `;
        optionList.appendChild(newOption);
    }

    // 1. 문항 삭제 함수
    function deleteQuestion(btn) {
        if(confirm("이 문항을 삭제하시겠습니까?")) {
            const targetCard = btn.closest('.card.mb-3');
            targetCard.remove();
            reorderQuestions(); // 번호 재정렬
        }
    }

    // 3. 기타 의견 옵션 추가
    function addEtcOption(link) {
        const optionList = link.closest('.card-body').querySelector('.option-list');
        const qIdx = optionList.getAttribute('data-qidx'); // 해당 문항 번호 추출
        // 이미 기타 의견이 있는지 체크 후 생성
        if(optionList.querySelector('.etc-option')) {
            alert('기타의견은 하나만 추가할 수 있습니다.');
            return;
        }
        const newOption = document.createElement('div');
        newOption.className = "d-flex align-items-center gap-2 mb-1 etc-option";
        newOption.innerHTML = `
            <input type="radio" disabled class="form-check-input">
            <input type="hidden" name="surveyQuestionEtc[${qIdx}]" value="1">
            <input type="text" class="form-control form-control-sm w-50 bg-light" value="기타의견 (직접 입력)" readonly>
            <button type="button" class="btn-close btn-sm" style="font-size:10px" onclick="this.parentElement.remove()"></button>
        `;
        optionList.appendChild(newOption);
    }

    // 4. 문항 순서 재정렬 함수 (삭제/복사 시 순서 교정)
    function reorderQuestions() {
        const questions = document.querySelectorAll('#surveyQuestionContainer .card.mb-3');
        questionCount = 0;
        questions.forEach((card, idx) => {
            questionCount++;
            card.querySelector('.question-idx').innerText = questionCount;
            card.querySelector('.question-idx-val').value = questionCount-1;
        });
    }

    // 5. 위로 이동
    function moveUp(btn) {
        const card = btn.closest('.card.mb-3');
        const prev = card.previousElementSibling;
        if (prev) {
            card.parentNode.insertBefore(card, prev);
            reorderQuestions();
        }
    }

    // 6. 아래로 이동
    function moveDown(btn) {
        const card = btn.closest('.card.mb-3');
        const next = card.nextElementSibling;
        if (next) {
            card.parentNode.insertBefore(next, card);
            reorderQuestions();
        }
    }

    // 7. 문항 복사
    function cloneQuestion(btn) {
        const card = btn.closest('.card.mb-3');
        const clone = card.cloneNode(true);
        
        // 복사본 고유 ID 및 라디오 네임 충돌 방지 처리
        const newIdx = document.querySelectorAll('#surveyQuestionContainer .card.mb-3').length + 1;
        clone.id = `question_clone_${newIdx}`;
        
        // 복사한 카드 내부의 라디오 버튼 그룹명 변경 (그룹 분리용)
        const radios = clone.querySelectorAll('input[type="radio"]');
        radios.forEach(r => {
            if(r.name) r.name = r.name + "_clone";
        });

        card.parentNode.insertBefore(clone, card.nextSibling);
        reorderQuestions();
    }
</script>