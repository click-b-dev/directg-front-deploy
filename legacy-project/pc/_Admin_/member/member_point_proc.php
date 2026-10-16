<?php
header('Content-Type: application/json; charset=utf-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$m_no       = filter_var($_POST['m_no'], FILTER_VALIDATE_INT);
$point_type = filter_var($_POST['point_type'], FILTER_SANITIZE_STRING);
$point      = filter_var($_POST['point'], FILTER_VALIDATE_INT);
$memo_type  = filter_var($_POST['memo_type'], FILTER_SANITIZE_STRING);
$memo       = filter_var($_POST['memo'], FILTER_SANITIZE_STRING);

if (!$m_no) {
    echo "잘못된 요청입니다.";
    exit;
}

switch ($memo_type) {
    case "discount":
        $memo = "상품구매 시 포인트 사용";
        break;
    case "repay":
        $memo = "상품구매 시 포인트 지급";
        break;
    case "refound":
        $memo = "상품주문 취소시 사용포인트 환불";
        break;
    case "add_member_level":
        $memo = "회원등급에 따른 추가포인트 지급";
        break;
    case "renewal":
        $memo = "리뉴얼 기념 포인트 지급";
        break;
    case "change":
        $memo = "차액보정";
        break;
    case "reward":
        $memo = "스펠포스 3 소울 하베스트 출시 기념";
        break;
    case "reward2":
        $memo = "시스템 장애로 인한 주문 오류 보상 지급";
        break;
    case "reward3":
        $memo = "이스 9: 몬스트룸 녹스 차액 보정";
        break;
    case "mobile_refund1":
        $memo = "휴대폰결제 부분취소";
        break;
    case "mobile_refund2":
        $memo = "휴대폰결제 익월취소";
        break;
}

$pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

try {
    $pdo->beginTransaction();

    switch ($point_type) {
        case "add":
            $sql = "INSERT INTO tbl_emoney_log
                    SET
                        m_no        = :m_no,
                        emoney_type = :point_type,
                        emoney      = :point,
                        regdt       = NOW(),
                        memo        = :memo,
                        admin_id    = :admin_id,
                        amt_delta   = :point,
                        ordno       = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no'         => $m_no,
                ':point_type'   => '+',
                ':point'        => $point,
                ':memo'         => $memo,
                ':admin_id'     => $_SESSION['admin']["admin_id"],
                ':amt_delta'    => $point,
                ':ordno'        => $m_no
            ]);

            $pdo->commit();

            $response = [
                'success' => true,
                'message' => "포인트 지급완료"
            ];
            echo json_encode($response);
            break;
        case "sub":
            $sql = "INSERT INTO tbl_emoney_log
                    SET
                        m_no        = :m_no,
                        emoney_type = :point_type,
                        emoney      = :point,
                        regdt       = NOW(),
                        memo        = :memo,
                        admin_id    = :admin_id,
                        amt_delta   = -ABS(:point),
                        ordno       = :m_no";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':m_no'         => $m_no,
                ':point_type'   => '-',
                ':point'        => $point,
                ':memo'         => $memo,
                ':admin_id'     => $_SESSION['admin']["admin_id"],
                ':amt_delta'    => $point,
                ':ordno'        => $m_no
            ]);

            $pdo->commit();

            $response = [
                'success' => true,
                'message' => "포인트 차감완료"
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