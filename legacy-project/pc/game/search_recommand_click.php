<?
//추천검색어 클릭수 집계 후 목적지로 redirect
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');

$idx = filter_input(INPUT_GET, 'idx', FILTER_SANITIZE_NUMBER_INT);

$dest = "/index.html";

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$goods = new Goods($conn);

	if($idx>0){
		$row = $goods->getSearchRecommand($idx);

		if($row && $row['is_del']=='N'){
			//클릭수 증가
			$goods->updateSearchRecommandClick($idx);

			//목적지: link_url 있으면 그곳, 없으면 검색결과
			if($row['link_url']){
				$dest = $row['link_url'];
			}else{
				$dest = "/game/game_search_thumb.html?q=".urlencode($row['keyword']);
			}
		}
	}
}catch (PDOException $e){
	$dest = "/index.html";
}

header("Location: ".$dest);
exit;
?>
