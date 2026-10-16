<?php
header('Content-Type: application/json; charset=utf-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = $_POST['mode'];
$m_no = filter_var($_POST['m_no'], FILTER_VALIDATE_INT);

if (!$m_no) {
    echo "잘못된 요청입니다.";
    exit;
}

$pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

try {
    $pdo->beginTransaction();

    switch ($mode) {
        case "leave":
            $sql = "UPDATE tbl_member
                    SET
                        status = '1',
                        out_date = NOW() 
                    WHERE m_no = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no' => $m_no
            ]);

            $sql = "DELETE FROM sns_info
                    WHERE m_no = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no' => $m_no
            ]);

            $sql = "INSERT INTO tbl_log_hack 
                        (m_id, name, nickname, birth_day, ip, admin_id, regdt, reason, adminMemo)
                    SELECT
                        tm.m_id, tm.name, tm.nickname, tm.birth_day, tm.ip, :admin_id, NOW(), '', ''
                    FROM tbl_member tm
                    WHERE tm.m_no = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no' => $m_no,
                ":admin_id" => $_SESSION['admin']["admin_id"]
            ]);

            $pdo->commit();

            $response = [
                'success' => true
            ];
            echo json_encode($response);
            break;
        case "delete":
            $sql = "DELETE FROM sns_info
                    WHERE m_no = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no' => $m_no
            ]);

            $sql = "DELETE FROM tbl_member
                    WHERE m_no = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no' => $m_no
            ]);

            $pdo->commit();

            $response = [
                'success' => true
            ];
            echo json_encode($response);
            break;
        case "apply":
            $sql = "UPDATE tbl_member
                    SET status = 0
                    WHERE m_no = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no' => $m_no
            ]);

            $pdo->commit();

            $response = [
                'success' => true
            ];
            echo json_encode($response);
            break;
        case "authReset":
            $sql = "UPDATE tbl_member
                    SET
                        `is_auth`   = 'N',
                        `name`      = NULL,
                        `birth_day` = NULL,
                        `hp`        = NULL,
                        `dupinfo`   = NULL,
                        `sex`       = NULL,
                        `auth_type` = NULL
                    WHERE m_no = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no' => $m_no
            ]);

            $pdo->commit();

            $response = [
                'success' => true
            ];
            echo json_encode($response);
            break;
        default:
            echo "잘못된 요청입니다.";
            break;
    }
} catch (PDOException $e) {
    $pdo->rollBack();
    echo 'Error!: '.$e->getMessage();
    die();
}
?>