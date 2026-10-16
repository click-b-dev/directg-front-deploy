<?
ini_set( "display_errors", 1 );
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
header("Content-Type: text/plain; charset=utf-8"); 
// clean the output buffer
ob_end_clean();

/*
EP 버전 3.0

네이버지식쇼핑상품EP (Engine Page) 제작및연동가이드 (제휴사제공용)
http://join.shopping.naver.com/misc/download/ep_guide.nhn

Field                   Status  Notes
id                      필수    판매하는 상품의 유니크한 상품ID
title                   필수    실제 서비스에 반영될 상품명(Title)
price_pc                필수    상품가격
link                    필수    상품URL
image_link              필수    해당 상품의 이미지URL
category_name1          필수    카테고리명(대분류)
category_name2          권장    카테고리명(중분류)
category_name3          권장    카테고리명(소분류)
category_name4          권장    카테고리명(세분류)
model_number            권장    모델명
brand                   권장    브랜드
maker                   권장    제조사
origin                  권장    원산지
event_words             권장    이벤트
coupon                  권장    쿠폰
interest_free_event     권장    무이자
point                   권장    포인트
shipping                필수    배송료
adult					미성년자 구매불가 상품 여부
seller_id               권장    셀러 ID (오픈마켓에 한함)
class                   필수(요약)  I (신규상품) / U (업데이트 상품) / D (품절상품)
update_time             필수(요약)  상품정보 생성 시각
*/
/*
50005190	DOOM: The Dark Ages - Premium Edition
50005189	DOOM: The Dark Ages
50004959	Monster Hunter Wilds Premium Deluxe Edition
50005267	Monster Hunter Wilds Deluxe Edition
50005291	Monster Hunter Wilds
50005295	METAL GEAR SOLID Δ: SNAKE EATER Digital Deluxe Edition
50005294	METAL GEAR SOLID Δ: SNAKE EATER
50005160	The First Berserker: Khazan Deluxe Edition
50005159	The First Berserker: Khazan
50004360	Football Manager 2024
50004942	Like a Dragon: Pirate Yakuza in Hawaii Deluxe Edition
50004943	Two Point Museum
50004944	Two Point Museum Explorer edition
50004941	Like a Dragon: Pirate Yakuza in Hawaii
50004808	Metaphor: ReFantazio
50001835 Total War: THREE KINGDOMS
50005100 Kingdom Come: Deliverance II
50005101 Kingdom Come: Deliverance II Gold Edition
*/

$tab = "\t";

ob_start();

echo "id{$tab}title{$tab}normal_price{$tab}price_pc{$tab}link{$tab}mobile_link{$tab}image_link{$tab}category_name1{$tab}category_name2{$tab}category_name3{$tab}naver_category{$tab}shipping{$tab}adult{$tab}class{$tab}update_time";

$dsn = 'mysql:host='.DB_HOST.';dbname='.DB_DB.';port=3306;charset=utf8';
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$query = "select a.goods_code,a.goods_nm,a.consumer_price,a.price,a.category,a.flag,a.update_date,a.reg_date,a.age_limit,b.image_link from directgames.tbl_goods a inner join directgames.naver_ep_list b ON a.goods_code=b.goods_code";
	$stmt = $conn->prepare($query);
	$stmt->execute();
	$data = $stmt->fetchAll();
	
	//print_r($data);
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

foreach ($data as $row){
	// 배송비
	$shipping = "0";
	
	$category_label = array(
		"2"=>"액션",
		"3"=>"어드벤쳐",
		"4"=>"레이싱/스포츠",
		"5"=>"롤플레잉",
		"6"=>"슈팅/FPS",
		"7"=>"퍼즐",
		"8"=>"시뮬레이션",
		"9"=>"기타",
		"10"=>"전략",
		"11"=>"액션/RPG",
		"12"=>"액션/어드벤쳐",
		"13"=>"스포츠",
		"14"=>"슈팅/액션/RPG",
		"15"=>"액션/시뮬레이션",
		"16"=>"전략/시뮬레이션",
		"17"=>"캐주얼",
		"18"=>"리걸 서스펜스 액션",
	);
	
	//제휴사 카테고리명(대분류)
	$category_name1 = "게임";
	$category_name2 = "Steam";
	$category_name3 = $category_label[$row['category']];
	
	$image_link_array = array(
		"50001835"=>"https://image.directg.net/W806UUroEB",
		"50004360"=>"https://image.directg.net/e806UUrz5j",
		"50004808"=>"https://image.directg.net/d806UUrGms",
		"50004941"=>"https://image.directg.net/T806UUrOOW",
		"50004942"=>"https://image.directg.net/Q806UUrXpY",
		"50004943"=>"https://image.directg.net/g806UUw1B6",
		"50004944"=>"https://image.directg.net/j806UUwrVu",
		"50005291"=>"https://image.directg.net/B806UUEjno",
		"50005267"=>"https://image.directg.net/V806UUCIR0",
		"50004959"=>"https://image.directg.net/e806UUwO50",
		"50005100"=>"https://image.directg.net/t806UUx7fe",
		"50005101"=>"https://image.directg.net/T806UUxNwK",
		"50005159"=>"https://image.directg.net/H806UUA9uF",
		"50005160"=>"https://image.directg.net/X806UUAYix",
		"50005189"=>"https://image.directg.net/R806UUBrzC",
		"50005190"=>"https://image.directg.net/F806UUCmPI",
		"50005294"=>"https://image.directg.net/J806UUFv7b",
		"50005295"=>"https://image.directg.net/k806UUHoDD",
	);

    // 상품이미지
	/*
	if($row['domain']=="https://image.directg.net"){
		$image_link = $row['domain']."/upload/product/".$row['open_graph'];
	}else{
		$image_link =$row['domain']."/upload/product/".$row['open_graph'];
	}
	*/
	
	$image_link =$row['image_link'];

	$title = str_replace("[특전제공] ","",$row['goods_nm']);
    $pc_link = "https://directg.net/game/game_page.html?utm_source=naver&utm_medium=display&utm_content=naver_shopping&utm_campaign=product&product_code=".$row['goods_code'];
	$mobile_link = "https://m.directg.net/game/game_page.html?utm_source=naver&utm_medium=display&utm_content=naver_shopping&utm_campaign=product&product_code=".$row['goods_code'];

	// 상태
	
	switch($row['flag']){
		case "0":
			$class = 'U';
		break;
		case "1":
			$class = 'D';
		break;
		case "3":
			$class = 'D';
		break;
		case "4":
			$class = 'D';
		break;
	}

    if(substr($row['reg_date'], 0, 10) == date('Y-m-d') && $row['update_date'] >= $row['reg_date']){
		$class = 'I';
	}
	
	//미성년자 구매 불가 상품 여부
	if($row['age_limit']=="18"){
		$adult="Y";
	}else{
		$adult="N";
	}
	
	$normal_price = $row['consumer_price'];
	
	$naver_category = "50001735";
	
	//판매방식 구분 (예약구매)
	
	$product_flag = "";
	
	//브랜드
	$brand = "";
	
	//제조사
	$maker ="";
	
	//예약구매 주문마감일
	
	$preorder_settings="";

    echo "\n{$row['goods_sku']}{$tab}{$title}{$tab}{$normal_price}{$tab}{$row['price']}{$tab}{$pc_link}{$tab}{$mobile_link}{$tab}{$image_link}{$tab}{$category_name1}{$tab}{$category_name2}{$tab}{$category_name3}{$tab}{$naver_category}{$tab}{$shipping}{$tab}{$adult}{$tab}{$class}{$tab}{$row['update_date']}";
}

$content = ob_get_contents();
ob_end_clean();

echo $content;
?>