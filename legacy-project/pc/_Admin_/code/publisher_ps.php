<?php
header('Content-Type: application/json; charset=utf-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);
$publisher_name = filter_input(INPUT_POST, 'publisher_name', FILTER_SANITIZE_STRING);
$publisher_link = filter_input(INPUT_POST, 'publisher_link', FILTER_SANITIZE_STRING);
$publisher_logo = filter_input(INPUT_POST, 'publisher_logo', FILTER_SANITIZE_STRING);

try {
    // 구디비
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    // 리뉴얼
    $pdo2 = new PDO($dsn, DB_USER, DB_PASSWORD);
	$pdo2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    switch ($mode) {
        case "register" :
            $response = [];

            // admin level체크
            if ($_SESSION['admin']['admin_level'] != "99") {
                $response = [
                    'success' => false,
                    'message' => '권한이 없습니다.'
                ];
                echo json_encode($response);
                exit;
            }

            $qry = "INSERT INTO tbl_publisher
                    SET
                        `publisher` = :publisher_name,
                        `flag` = 'Y'";
            $stmt = $pdo->prepare($qry);
            $stmt->execute([
                ':publisher_name' => $publisher_name
            ]);

            if ($stmt->rowCount() > 0) {
                // 공급처 등록 성공 시, 리뉴얼 DB에도 등록
                $qry = "INSERT INTO tbl_publisher
                        SET
                            `publisher_name` = :publisher_name,
                            `publisher_code` = :publisher_code,
                            `publisher_site` = :publisher_link,
                            `publisher_image` = :publisher_logo";
                $stmt = $pdo2->prepare($qry);
                $stmt->execute([
                    ':publisher_name' => $publisher_name,
                    ':publisher_code' => $pdo->lastInsertId(),
                    ':publisher_link' => $publisher_link,
                    ':publisher_logo' => $publisher_logo
                ]);
                
                $response = [
                    'success' => true,
                    'message' => '등록 성공'
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => '등록 실패'
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