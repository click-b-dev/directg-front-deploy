<?
	ini_set( "display_errors", 1 );
	header('Content-Type: application/json');
	$json_data = array();
	$sitemap = array();
	
	$sitemap['0']=array("id"=>"menu_01","title"=>"홈","url"=>"https://m.directg.net/index.php","depth"=>"1");
	$sitemap['1']=array("id"=>"menu_02","title"=>"서비스소개","url"=>"https://m.directg.net/service/service.html","depth"=>"1");
	$sitemap['2']=array(
		"id"=>"menu_03",
		"title"=>"할인 프로모션",
		"url"=>"#",
		"depth"=>"1",
		"children"=>array(
				"0"=>array("title"=>"할인진행중","url"=>"https://m.directg.net/promotion/promotion_ing_thumb.html"),
				"1"=>array("title"=>"주말특가 프로모션","url"=>"https://m.directg.net/promotion/promotion_weekend.html"),
				"2"=>array("title"=>"대규모 프로모션","url"=>"https://m.directg.net/promotion/promotion_season.html"),
			)
	);
	$sitemap['3']=array("id"=>"menu_04","title"=>"이벤트","url"=>"https://m.directg.net/event/event.html","depth"=>"1");
	$sitemap['4']=array("id"=>"menu_05","title"=>"공지사항","url"=>"https://m.directg.net/board/notice.html","depth"=>"1");
	$sitemap['5']=array("id"=>"menu_06","title"=>"모든게임","url"=>"https://m.directg.net/game/game_thumb.html","depth"=>"1");
	$sitemap['6']=array("id"=>"menu_07","title"=>"PS액세서리","url"=>"https://m.directg.net/game/goods_thumb.html","depth"=>"1");
	$sitemap['7']=array("id"=>"menu_08","title"=>"예약구매","url"=>"https://m.directg.net/game/game_preorder.html","depth"=>"1");
	$sitemap['8']=array(
		"id"=>"menu_09",
		"title"=>"플랫폼별",
		"url"=>"#",
		"depth"=>"1",
		"children"=>array(
				"0"=>array("title"=>"Steam","url"=>"https://m.directg.net/game/game_platform_thumb.html?platform=1"),
				"1"=>array("title"=>"Epic Games","url"=>"https://m.directg.net/game/game_platform_thumb.html?platform=34"),
				"2"=>array("title"=>"Rockstar Games","url"=>"https://m.directg.net/game/game_platform_thumb.html?platform=35"),
			)
	);
	
	$sitemap['9']=array(
		"id"=>"menu_10",
		"title"=>"장르별",
		"url"=>"#",
		"depth"=>"1",
		"children"=>array(
				"0"=>array("title"=>"액션","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=001"),
				"1"=>array("title"=>"어드벤처","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0002"),
				"2"=>array("title"=>"RPG","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0003"),
				"3"=>array("title"=>"전략","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0004"),
				"4"=>array("title"=>"시뮬레이션","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0005"),
				"5"=>array("title"=>"스포츠","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0006"),
				"6"=>array("title"=>"레이싱","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0010"),
				"7"=>array("title"=>"캐주얼","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0007"),
				"8"=>array("title"=>"인디","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0008"),
				"9"=>array("title"=>"앞서 해보기","url"=>"https://m.directg.net/game/game_genre_thumb.html?genre_code=G0009"),
			)
	);
	
	$sitemap['10']=array(
		"id"=>"menu_11",
		"title"=>"퍼블리셔별",
		"url"=>"#",
		"depth"=>"1",
		"children"=>array(
				"0"=>array("title"=>"2K","url"=>"https://m.directg.net/game/publisher_2k_thumb.html"),
				"1"=>array("title"=>"SEGA","url"=>"https://m.directg.net/game/publisher_sega_thumb.html"),
				"2"=>array("title"=>"Capcom","url"=>"https://m.directg.net/game/publisher_capcom_thumb.html"),
				"3"=>array("title"=>"Paradox Interactive","url"=>"https://m.directg.net/game/publisher_paradox_thumb.html"),
				"4"=>array("title"=>"PlayStation PC LLC","url"=>"https://m.directg.net/game/publisher_playstation_thumb.html"),
				"5"=>array("title"=>"NEOWIZ","url"=>"https://m.directg.net/game/publisher_neowiz_thumb.html"),
				"6"=>array("title"=>"Arc System Works","url"=>"https://m.directg.net/game/publisher_asw_thumb.html"),
				"7"=>array("title"=>"THQ Nordic","url"=>"https://m.directg.net/game/publisher_thq_thumb.html"),
				"8"=>array("title"=>"505 Games","url"=>"https://m.directg.net/game/publisher_505_games_thumb.html"),
				"9"=>array("title"=>"Focus Entertainment","url"=>"https://m.directg.net/game/publisher_focus_thumb.html"),
				"10"=>array("title"=>"Hooded Horse","url"=>"https://m.directg.net/game/publisher_hooded_horse_thumb.html"),
				"11"=>array("title"=>"Clouded Leopard Entertainment","url"=>"https://m.directg.net/game/publisher_clouded_leopard_thumb.html"),
			)
	);

	$json_data = array(
		"sitemap"=>$sitemap,
	);
?>
<?echo json_encode($json_data);?>