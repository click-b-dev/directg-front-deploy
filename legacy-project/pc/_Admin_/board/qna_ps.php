<?php
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

use HTMLToMarkdown\HtmlConverter;

$mode  = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$idx   = filter_input(INPUT_POST, 'idx', FILTER_SANITIZE_NUMBER_INT);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_STRING);

$answer = htmlspecialchars($_POST['answer'],ENT_QUOTES);

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    switch ($mode) {
        case "update" :
            $query = "UPDATE tbl_qna SET
                        answer = :answer,
                        answer_dt = NOW(),
                        admin_id  = :admin_id,
                        is_answer = 'Y'
                        WHERE idx = :idx";
            $param = array(
                ":answer" => $answer,
                ":admin_id" => $_SESSION['admin']['admin_id'],
                ":idx" => $idx
            );
            $stmt = $pdo->prepare($query);
            $stmt->execute($param);

            echo "<script>alert('저장되었습니다.')</script>";
            go($_SERVER['HTTP_REFERER']);
            break;

        case "delete" :
            $idx_cnt = count($_POST['idx']);
            $idx = implode(",", $_POST['idx']);

            $query = "DELETE FROM tbl_qna WHERE FIND_IN_SET(idx, :idx)";
            $param = array(
                ":idx" => $idx
            );
            $stmt = $pdo->prepare($query);
            $stmt->execute($param);

            echo "<script>alert('{$idx_cnt} 개 삭제되었습니다.')</script>";
            go($_SERVER['HTTP_REFERER']);
            break;
        case "mail" :
            include_once ("{$_SERVER['DOCUMENT_ROOT']}/../conf/email/email_qna.php");
            $response = [];

            $qry = "SELECT 
                        tq.subject
                    FROM tbl_qna tq
                    WHERE tq.idx = :idx";
            $stmt = $pdo->prepare($qry);
            $params = array(
                ":idx" => $idx,
            );
            $stmt->execute($params);
            $data = $stmt->fetch();

            $mail = new DirectSendMail;
            $body = str_replace("[qna_title]", $data['subject'], $set['email']['body']);
            $result = json_decode($mail->sendMail($set['email']['subject'], $set['email']['senderMail'], $body, $email,"qna"));
            
            if ($result->status == "0") {
                $qry = "UPDATE tbl_qna 
                        SET
                            email_flag = 'Y',
                            email = :email
                        WHERE idx = :idx";
                $param = array(
                    ":idx" => $idx,
                    ":email" => $email
                );
                $stmt = $pdo->prepare($qry);
                $stmt->execute($param);

                $response = [
                    'success' => true,
                    'message' => "메일발송 성공"
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => "메일발송 실패"
                ];
            }

			echo json_encode($response);
            break;
    }
} catch (PDOException $e) {
    echo 'Error!: '.$e->getMessage();
    die();
}
?>