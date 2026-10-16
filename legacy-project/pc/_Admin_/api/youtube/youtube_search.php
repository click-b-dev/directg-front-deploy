<?
ini_set("display_errors", 1);
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');
	
header("Content-Type:text/html; charset=utf-8"); 

$channelId = "UCZjWy6bpBcAKnB8ec3Lyn9Q";

$youtube = new Youtube(array('key' => 'AIzaSyAUTi2PPoqlt8jFEExUAmZmu5KOt19Y7-0'));

//$response = $youtube->searchChannelVideos('시노비',$channelId,'10','');

$videoId = "mtIprtpcsd0";
$response = $youtube->getVideoInfo($videoId);

print_r($response);
?>