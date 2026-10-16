<?php
// admin 세션체크
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$filename = "과거주문 리스트.csv";
//ini_set( "display_errors", 1 );
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '";');

$search_key = $_POST['search_key'];
$search_value = $_POST['search_value'];
$search_year = $_POST['search_year'];
$search_start_date = $_POST['search_start_date'];
$search_end_date = $_POST['search_end_date'];
$page = $_POST['page'];

$where = [];

if ($search_value) {
    switch ($search_key) {
        case "search_settle_no":
            $where[] = "a.settle_no = '{$search_value}";
            break;
        case "search_ordno":
            $where[] = "b.ordno = '{$search_value}'";
            break;
        case "search_product_code":
            $where[] = "b.product_code = '{$search_value}'";
            break;
        case "search_m_id":
            $where[] = "a.email = '{$search_value}'";
            break;
    }

    $search_start_date = "";
    $search_end_date = "";
} else {
    if ($search_start_date) {
        $where[] = " a.ord_ymd >= '{$search_start_date} 00:00:00'";
    }

    if ($search_end_date) {
        $where[] = " a.ord_ymd <= '{$search_end_date} 23:59:59'";
    }
}

//foreach ($_POST as $key => $value) {
//    if ($key <> "page" ) {
//        if ($value <> "") {
//            $param .= "&{$key}={$value}";
//        }
//    }
//}

$add_where = "";

foreach ($where as $value) {
    $add_where .= " and {$value}";
}

$orderby = " a.ord_ymd DESC";

$settlekind2 = array(
    "000000"=>"현금",
    "SC0000"=>"무통장입금",
    "SC0010"=>"신용카드",
    "SC0030"=>"실시간 계좌이체",
    "SC0040"=>"가상계좌",
    "SC0060"=>"휴대폰",
    "DG0000"=>"전액할인",
    "PAYCO"=>"PAYCO",
    "samsung"=>"삼성페이",
    "naverpay"=>"네이버페이",
    "POINT"=>"네이버포인트"
);

$settleStatus2 = array(
    "0"=>"결제완료",
    "1"=>"결제대기",
    "2"=>"결제완료",
    "3"=>"결제실패",
    "9"=>"결제취소",
    "99"=>"주문취소"
);

//주문상태
$orderStatus = array(
    "0"=>"주문완료",
    "1"=>"주문대기",
    "2"=>"주문완료",
    "8"=>"취소요청",
    "9"=>"취소완료",
);

try {
    $pdo = new PDO($dsn_dgkr, DGKR_USER, DGKR_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

    $adminOrder = new AdminOrder($pdo);
    $order_list = $adminOrder->getOrderOldList($page, $add_where, $orderby, $param = "", $search_year);
    $order_list = $order_list->resultset->fetchAll();
} catch (PDOException $e) {
    echo "Error!: {$e->getMessage()}";
    die();
}

$output = fopen('php://output', 'w');
echo "\xEF\xBB\xBF"; // 한글 깨짐 방지 BOM

fputcsv($output, array('주문일자','결제번호','주문번호','회원아이디','상품정보','주문금액','결제일자','결제방법','PG','결제상태','주문상태','키확인'));

foreach($order_list as $value){
    fputcsv($output, array(
        $value['ord_ymd'], "{$value['settle_no']}\t", $value['ordno'], $value['email'], $value['product_nm'], number_format($value['tot_pay']),
        ($value['step'] <> '1')?$value['cdt']:"", $settlekind2[$value['settlekind']], $value['pg_provider'], $settleStatus2[$value['step']],
        $orderStatus[$value['status']], ($value['is_lic_actv']=="1")?"O":"X"
    ));
}
fclose($output);
?>
