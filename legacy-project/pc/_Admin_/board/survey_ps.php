<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode                 = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx                  = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);
$subject              = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
$start_dt             = filter_input(INPUT_POST, 'start_dt', FILTER_SANITIZE_STRING);
$end_dt               = filter_input(INPUT_POST, 'end_dt', FILTER_SANITIZE_STRING);
$max_people           = filter_input(INPUT_POST, 'max_people', FILTER_SANITIZE_NUMBER_INT);
$max_people_val       = filter_input(INPUT_POST, 'max_people_val', FILTER_SANITIZE_NUMBER_INT);
$view_result          = filter_input(INPUT_POST, 'view_result', FILTER_SANITIZE_STRING);
$point                = filter_input(INPUT_POST, 'point', FILTER_SANITIZE_NUMBER_INT);
$flag                 = filter_input(INPUT_POST, 'flag', FILTER_SANITIZE_STRING);
$surveyQuestionIdx      = $_POST['surveyQuestionIdx'];
$surveyQuestionRequired = $_POST['surveyQuestionRequired'];
$surveyQuestionType     = $_POST['surveyQuestionType'];
$surveyQuestionTitle    = $_POST['surveyQuestionTitle'];
$surveyQuestionItem     = $_POST['surveyQuestionItem'];
$surveyQuestionEtc      = $_POST['surveyQuestionEtc'];

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    if ($mode != "register" && $mode != "update") {
        echo "<script>alert('잘못된 접근입니다.'); history.back();</script>";
        exit;
    }

    $AdminBoard = new AdminBoard($pdo);
    $survey_count = $AdminBoard->getSurveyCount($idx)['cnt'];

    // -----------------------------------------------------------------
    // 📂 파일 업로드 프로세스 시작
    // -----------------------------------------------------------------
    $bannerImage = null; // DB에 저장할 파일명 초기화
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/upload/banner/survey/'; // 저장할 절대경로

    // 만약 디렉토리가 없다면 자동 생성 (권한 0777)
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // 1. 기존 이미지 삭제 체크박스를 눌렀을 때 처리
    if (isset($_POST['delete_current_image']) && $_POST['delete_current_image'] === 'Y') {
        // 기존 파일명을 DB에서 조회하거나 hidden으로 받아와서 unlink()로 삭제 처리 가능
        unlink($_SERVER['DOCUMENT_ROOT'].$_POST['delete_current_image_url']);
        // 여기서는 로직 단순화를 위해 변수만 비워두고 트랜잭션 내 쿼리에서 제거합니다.
        $bannerImage = ''; 
    }

    // 2. 새로운 파일이 업로드되었는지 확인
    if (isset($_FILES['banner_image']) && $_FILES['banner_image']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['banner_image']['tmp_name'];
        $fileName = $_FILES['banner_image']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        // 보안 검증: 허용할 이미지 확장자 제한
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (in_array($fileExtension, $allowedExtensions)) {
            // 파일명 중복 방지를 위한 랜덤 파일명 생성 (예: banner_19_65a8b2c.png)
            $newFileName = 'banner_' . $surveyIdx . '_' . substr(md5(time() . $fileName), 0, 8) . '.' . $fileExtension;
            $destPath = $uploadDir . $newFileName;

            // 임시 디렉토리에서 실제 웹서버 저장 폴더로 파일 이동
            if (move_uploaded_file($fileTmpPath, $destPath)) {
                $bannerImage = $newFileName; // 업로드 성공 시 새 파일명 할당
            }
        } else {
            echo "<script>alert('허용되지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.'); history.back();</script>";
            exit;
        }
    }
    // -----------------------------------------------------------------

    $pdo->beginTransaction();

    if ($mode == "update") {
        $action = "수정";

        $qry = "UPDATE tbl_survey
                SET 
                    `subject`   = :subject, 
                    `start_dt`  = :start_dt, 
                    `end_dt`    = :end_dt,
                    `flag`      = :flag
                WHERE idx = :idx";
        
        $stmt = $pdo->prepare($qry);
        $stmt->execute([
            'subject' => $subject,
            'start_dt' => $start_dt,
            'end_dt' => $end_dt,
            'flag' => $flag,
            'idx' => $idx
        ]);
            
        $survey_idx = $idx;

        // 참여인원이 없는 경우만 수정로직 실행
        if ($survey_count == 0) {
            // delete후 insert 방식으로 update
            $qry = "DELETE FROM tbl_survey_question_item
                    WHERE survey_idx = :survey_idx";
                        
            $stmt = $pdo->prepare($qry);
            $stmt->execute(['survey_idx' => $survey_idx]);

            $qry = "DELETE FROM tbl_survey_question
                    WHERE survey_idx = :survey_idx";
                        
            $stmt = $pdo->prepare($qry);
            $stmt->execute(['survey_idx' => $survey_idx]);
        }
    } else {
        $action = "등록";

        // survey 등록
        $qry = "INSERT INTO tbl_survey
                SET
                    `idx`           = :idx,
                    `subject`       = :subject,
                    `start_dt`      = :start_dt,
                    `end_dt`        = :end_dt,
                    `max_people`    = :max_people,
                    `banner_image`  = NULL,
                    `view_result`   = :view_result,
                    `point`         = :point,
                    `flag`          = :flag,
                    `reg_dt`        = NOW()";
        $param = array(
            'idx'           => $idx,
            'subject'       => $subject,
            'start_dt'      => $start_dt,
            'end_dt'        => $end_dt,
            'max_people'    => ($max_people !== 0)?$max_people_val:$max_people,
            'view_result'   => $view_result,
            'point'         => $point,
            'flag'          => $flag
        );
        $stmt = $pdo->prepare($qry);
        $stmt->execute($param);

        $survey_idx = $pdo->lastInsertId();
    }

    // 파일 업로드 or 삭제
    if ($bannerImage !== null) {
        $qry = "UPDATE tbl_survey
                SET banner_image = :banner_image
                WHERE idx = :idx";
        $stmt = $pdo->prepare($qry);
        $stmt->execute([
            'banner_image' => ($bannerImage=="")?null:'/upload/banner/survey/'.$bannerImage,
            'idx' => $survey_idx
        ]);
    }

    // 참여인원이 있는 경우 마스터정보 수정로직만 실행하고 exit
    if ($survey_count) {
        echo "<script>alert('{$action} 되었습니다.')</script>";
        $pdo->commit();
        go('./survey_list.php');
        exit;
    }

    // survey_question(내용) 등록 (등록&수정 공통사용)
    if ($survey_idx) {
        foreach ($surveyQuestionIdx AS $key => $value) {
            $qry = "INSERT INTO tbl_survey_question
                    SET
                        `survey_idx`    = :survey_idx,
                        `number`        = :number,
                        `question`      = :question,
                        `type`          = :type,
                        `required`      = :required,
                        `etc`           = :etc,
                        `flag`          = 'Y'";
            $param = array(
                'survey_idx'    => $survey_idx,
                'number'        => $surveyQuestionIdx[$key],
                'question'      => $surveyQuestionTitle[$key],
                'type'          => $surveyQuestionType[$key],
                'required'      => $surveyQuestionRequired[$key]??'N',
                'etc'           => $surveyQuestionEtc[$key]??0
            );
            $stmt = $pdo->prepare($qry);
            $stmt->execute($param);

            $survey_question_idx = $pdo->lastInsertId();

            // survey_question_item 등록
            if (count($surveyQuestionItem[$key]??[]) && $survey_question_idx) {
                $num = 1;

                foreach ($surveyQuestionItem[$key] AS $item_key => $item_value) {
                    $qry = "INSERT INTO tbl_survey_question_item
                            SET
                                `survey_idx`    = :survey_idx,
                                `question_idx`  = :survey_question_idx,
                                `number`        = :number,
                                `item`          = :item,
                                `flag`          = 'Y'";
                    $param = array(
                        'survey_idx'            => $survey_idx,
                        'survey_question_idx'   => $survey_question_idx,
                        'number'                => $num,
                        'item'                  => $item_value
                    );
                    $stmt = $pdo->prepare($qry);
                    $stmt->execute($param);

                    $num++;
                }
            }
        }
    }

    echo "<script>alert('{$action} 되었습니다.')</script>";
    $pdo->commit();

    go('./survey_list.php');
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    // 🚨 트랜잭션 실패 시 방금 서버에 저장 시도했던 새 파일이 있다면 같이 지워주는 것이 매너입니다.
    if ($bannerImage && file_exists($uploadDir . $bannerImage)) {
        unlink($uploadDir . $bannerImage);
    }

    echo 'Error!: '.$e->getMessage();
    die();
}
?>