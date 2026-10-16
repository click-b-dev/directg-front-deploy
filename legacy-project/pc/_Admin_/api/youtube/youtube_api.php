<?
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
header("Content-Type:text/html; charset=utf-8"); 

$mode = filter_input(INPUT_GET, 'mode', FILTER_SANITIZE_STRING);
$channelId = filter_input(INPUT_GET, 'channelId', FILTER_SANITIZE_STRING);
$videoId = filter_input(INPUT_GET, 'videoId', FILTER_SANITIZE_STRING);
$q = filter_input(INPUT_GET, 'q', FILTER_SANITIZE_STRING);
$token = filter_input(INPUT_GET, 'token', FILTER_SANITIZE_STRING);

$youtube = new Youtube(array('key' => 'AIzaSyAUTi2PPoqlt8jFEExUAmZmu5KOt19Y7-0'));

try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
	switch($mode){
		case "search_video":
			if($channelId){
				$response = $youtube->searchChannelVideos('',$channelId,'50','date',$token);
				//print_r($response);
				//exit;
				foreach($response as $value){
					$video_query = "insert into youtube_video set etag=:etag,videoId=:videoId,publishedAt=:publishedAt,channelId=:channelId,title=:title,thumbnails=:thumbnails,channelTitle=:channelTitle,batch_date=now() ON DUPLICATE KEY UPDATE title=:title,batch_date=now()";
					$stmt = $conn->prepare($video_query);
					$params = array(
						":etag"=>$value->etag,
						":videoId"=>$value->id->videoId,
						":publishedAt"=>strtotime($value->snippet->publishedAt),
						":channelId"=>$value->snippet->channelId,
						":title"=>$value->snippet->title,
						":thumbnails"=>$value->snippet->thumbnails->default->url,
						":channelTitle"=>$value->snippet->channelTitle,
					);
					$stmt->execute($params);
					
					print_r($params);
				}
			}
		break;
		case "channel_info":
			if($channelId){
				$response = $youtube->getChannelById($channelId);
				//print_r($response);
				$c_query = "update youtube_channel set customUrl=:customUrl,thumbnails=:thumbnails,viewCount=:viewCount,subscriberCount=:subscriberCount,videoCount=:videoCount where channelId=:channelId";
				$stmt = $conn->prepare($c_query);
				$params = array(
					":customUrl"=>$response->snippet->customUrl,
					":thumbnails"=>$response->snippet->thumbnails->default->url,
					":viewCount"=>$response->statistics->viewCount,
					":subscriberCount"=>$response->statistics->subscriberCount,
					":videoCount"=>$response->statistics->videoCount,
					":channelId"=>$response->id,
				);
				$stmt->execute($params);
				print_r($params);
			}
		break;
		case "video_info":
			if($videoId){
				$response = $youtube->getVideoInfo($videoId);
				
				
				print_r($response->contentDetails);
				//$channelId = $response->snippet->channelId;
				//$channelTitle = $response->snippet->channelTitle;
				
				$c_query = "insert into youtube_channel set channelId=:channelId,channelTitle=:channelTitle,reg_date=now() ON DUPLICATE KEY UPDATE channelTitle=:channelTitle,reg_date=now()";
				$stmt = $conn->prepare($c_query);
				$params = array(
					":channelId"=>$response->snippet->channelId,
					":channelTitle"=>$response->snippet->channelTitle,
				);
				$stmt->execute($params);
				
				$video_query = "insert into youtube_video set etag=:etag,videoId=:videoId,publishedAt=:publishedAt,channelId=:channelId,title=:title,thumbnails=:thumbnails,channelTitle=:channelTitle,categoryId=:categoryId,defaultAudioLanguage=:defaultAudioLanguage,embeddable=:embeddable,publicStatsViewable=:publicStatsViewable,viewCount=:viewCount,likeCount=:likeCount,player=:player,batch_date=now() ON DUPLICATE KEY UPDATE title=:title,embeddable=:embeddable,publicStatsViewable=:publicStatsViewable,viewCount=:viewCount,likeCount=:likeCount,batch_date=now()";
				$stmt = $conn->prepare($video_query);
				$params = array(
					":etag"=>$response->etag,
					":videoId"=>$response->id,
					":publishedAt"=>strtotime($response->snippet->publishedAt),
					":channelId"=>$response->snippet->channelId,
					":title"=>$response->snippet->title,
					":thumbnails"=>$response->snippet->thumbnails->default->url,
					":channelTitle"=>$response->snippet->channelTitle,
					":categoryId"=>$response->snippet->categoryId,
					":defaultAudioLanguage"=>$response->snippet->localized->defaultAudioLanguage,
					":embeddable"=>$response->status->embeddable,
					":publicStatsViewable"=>$response->status->publicStatsViewable,
					":viewCount"=>$response->statistics->viewCount,
					":likeCount"=>$response->statistics->likeCount,
					":player"=>$response->player->embedHtml,
				);
				$stmt->execute($params);
				print_r($params);
				
			}
		break;
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>