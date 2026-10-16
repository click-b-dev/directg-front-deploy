<?php
ini_set( "display_errors", 1 );
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$idx = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);
$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);

// 로그인체크
if ($_SESSION['member']["m_id"] == "") {
    if ($_SESSION['admin']['admin_id'] != '') {
        echo "<script>alert('관리자 미리보기 시에도 회원로그인이 필요합니다.');";
        echo "history.go(-1)</script>";
        exit;
    }

	echo "잘못된 접근입니다.";
	exit;
}

try {
	$pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	$Board = new Board($pdo);

    $survey_info = $Board->getSurveyInfo($idx);
    $survey_questions = json_decode($survey_info['question'] ?? '[]', true);
} catch (PDOException $e) {
	echo 'Error!: '.$e->getMessage();  
	die();  
}

// 조건 체크 (관리자는 테스트를 위해 통과처리)
if ($_SESSION['admin']['admin_id'] == '') {
    // 종료, 기간여부 체크
    if ($survey_info['flag'] != "Y" || ($survey_info['start_dt'] > date('Y-m-d H:i:s')) || ($survey_info['end_dt'] < date('Y-m-d H:i:s'))) {
        echo "<script>alert('종료된 설문입니다.');";
        echo "history.go(-1)</script>";
        exit;
    } else if (!$survey_info) {
        echo "잘못된 접근";
        exit;
    }

    // 참여인원 제한 체크
    if ($survey_info['max_people'] <= $survey_info['answer_cnt']) {
        echo "<script>alert('참여인원이 마감된 설문입니다.');";
        echo "history.go(-1)</script>";
        exit;
    }
}

// 참여이력 확인
$user_answer = $Board->getUserAnswerInfo($_SESSION['member']['m_id'], $idx);

if (count($user_answer)) {
    echo "이미 참여한 설문조사입니다.";
    exit;
}

switch ($mode) {
    case "register":
        // 답변 insert
        foreach ($_POST['answer'] as $key => $value) {
            // check box 인경우
            if (gettype($value) == "array") {
                foreach ($value as $key2 => $value2) {
                    if ($value2 == 100) {
                        // 기타답변
                        $qry = "INSERT INTO tbl_survey_answer
                                SET
                                    survey_idx   = :survey_idx,
                                    question_idx = :question_idx,
                                    m_id         = :m_id,
                                    answer       = :answer,
                                    answer_text  = :answer_text,
                                    reg_dt       = NOW()";
                        $param = array(
                            ":survey_idx" => $idx,
                            ":question_idx" => $key,
                            ":m_id" => $_SESSION['member']['m_id'],
                            ":answer" => $value2,
                            ":answer_text" => $_POST['answer_etc'][$key]
                        );
                    } else {
                        $qry = "INSERT INTO tbl_survey_answer
                                SET
                                    survey_idx   = :survey_idx,
                                    question_idx = :question_idx,
                                    m_id         = :m_id,
                                    answer       = :answer,
                                    reg_dt       = NOW()";
                        $param = array(
                            ":survey_idx" => $idx,
                            ":question_idx" => $key,
                            ":m_id" => $_SESSION['member']['m_id'],
                            ":answer" => $value2
                        );
                    }

                    $stmt = $pdo->prepare($qry);
                    $stmt->execute($param);
                }
            } else {
                // radio, textarea
                if ($value == 'answer_text') {
                    // 주관식(textarea)
                    $qry = "INSERT INTO tbl_survey_answer
                            SET
                                survey_idx   = :survey_idx,
                                question_idx = :question_idx,
                                m_id         = :m_id,
                                answer_text  = :answer_text,
                                reg_dt       = NOW()";
                    $param = array(
                        ":survey_idx" => $idx,
                        ":question_idx" => $key,
                        ":m_id" => $_SESSION['member']['m_id'],
                        ":answer_text" => $_POST['answer_text'][$key]
                    );
                } else {
                    $qry = "INSERT INTO tbl_survey_answer
                            SET
                                survey_idx   = :survey_idx,
                                question_idx = :question_idx,
                                m_id         = :m_id,
                                answer       = :answer,
                                reg_dt       = NOW()";
                    $param = array(
                        ":survey_idx" => $idx,
                        ":question_idx" => $key,
                        ":m_id" => $_SESSION['member']['m_id'],
                        ":answer" => $value
                    );
                }

                $stmt = $pdo->prepare($qry);
                $stmt->execute($param);
            }
        }

        // 답변완료후 포인트 지급
        if ($survey_info['point'] > 0){
            $m_no = $_SESSION['member']['m_no'];
            $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
	        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $licence = new Licence($pdo);
            $licence->setEmoney($m_no, "+", $survey_info['point'], "설문조사참여", "survey{$idx}{$m_no}", "settle_no");
        }

        echo "<script>
                alert('참여 완료되었습니다. 감사합니다.');
                location.href = './survey.html?idx={$idx}';
            </script>";

        break;
}
?>