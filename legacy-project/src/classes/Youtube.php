<?
class Youtube{
	protected $youtube_key;
	
	public $APIs = array(
        'videos.list' => 'https://www.googleapis.com/youtube/v3/videos',
        'search.list' => 'https://www.googleapis.com/youtube/v3/search',
        'channels.list' => 'https://www.googleapis.com/youtube/v3/channels',
        'playlists.list' => 'https://www.googleapis.com/youtube/v3/playlists',
        'playlistItems.list' => 'https://www.googleapis.com/youtube/v3/playlistItems',
        'activities' => 'https://www.googleapis.com/youtube/v3/activities',
    );
	
	public $page_info = array();
	
	protected $sslPath = null;
	protected $referer;
	
	public function __construct($params = array(), $sslPath = null){
		$this->setApiKey($params['key']);
		 
		 if (array_key_exists('referer', $params)) {
            $this->setReferer($params['referer']);
        }

        if (array_key_exists('apis', $params)) {
            $this->setAPIs($params['apis']);
        }

        if ($sslPath !== null) {
            $this->sslPath = $sslPath;
        }
	}
	
	public function getYoutubeSearch($channelId){
		$url ="https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=100&type=video&key=".$this->youtube_key."&regionCode=KR&videoEmbeddable=true&channelId=".$channelId;

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt($ch, CURLOPT_SSLVERSION, '6');
		curl_setopt($ch, CURLOPT_COOKIE, '' );
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
		$response = curl_exec($ch);
		$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		$data = json_decode($response, true);
		
		echo $status_code;
		
		return $data;
		
		if($status_code == 200) {
			print_r($data);
		} else {
			//echo "Error 코드:".$data['resultcode'];
			//echo "Error 내용:".$data['message'];
			print_r($data);
		}
	}
	
	 public function setAPIs(array $APIs){
        $this->APIs = $APIs;
    }

	
	public function setApiKey($apiKey){
        $this->youtube_key = $apiKey;
    }
	
	public function setReferer($referer){
        $this->referer = $referer;
    }
	
	 public function getChannelById($id, $optionalParams = false){
        $API_URL = $this->getApi('channels.list');
        $params = array(
            'id' => $id,
            'part' => 'id,snippet,contentDetails,statistics'
        );
        if ($optionalParams) {
            $params = array_merge($params, $optionalParams);
        }
        $apiData = $this->api_get($API_URL, $params);
        return $this->decodeSingle($apiData);
    }
	
	public function getVideoInfo($vId){
        $API_URL = $this->getApi('videos.list');
        $params = array(
            'id' => $vId,
            'part' => 'id, snippet, contentDetails, player, statistics, status'
        );

        $apiData = $this->api_get($API_URL, $params);
        return $this->decodeSingle($apiData);
    }
	
	public function searchChannelVideos($q, $channelId, $maxResults = 50, $order = null,$nextPageToken){
        $params = array(
            'q' => $q,
            'type' => 'video',
            'channelId' => $channelId,
            'part' => 'id, snippet',
            'maxResults' => $maxResults,
			'regionCode' => 'KR',
			'type' => 'video',
        );
        if (!empty($order)) {
            $params['order'] = $order;
        }
		
		if (!empty($nextPageToken)) {
            $params['pageToken'] = $nextPageToken;
        }
		
        return $this->searchAdvanced($params);
    }
	
	public function searchAdvanced($params, $pageInfo = false){
        $API_URL = $this->getApi('search.list');

        if (empty($params) || !isset($params['q'])) {
            throw new \InvalidArgumentException('at least the Search query must be supplied');
        }

        $apiData = $this->api_get($API_URL, $params);

        if ($pageInfo) {
            return array(
                'results' => $this->decodeList($apiData),
                'info'    => $this->page_info
            );
        } else {
            return $this->decodeList($apiData);
        }
    }

	
	public function getApi($name){
        return $this->APIs[$name];
    }
	
	public function decodeSingle(&$apiData){
        $resObj = json_decode($apiData);
        if (isset($resObj->error)) {
            $msg = "Error " . $resObj->error->code . " " . $resObj->error->message;
            if (isset($resObj->error->errors[0])) {
                $msg .= " : " . $resObj->error->errors[0]->reason;
            }
            throw new \Exception($msg, $resObj->error->code);
        } else {
            if(!property_exists($resObj, 'items')){
                return false;
            }
            $itemsArray = $resObj->items;
            if (!is_array($itemsArray) || count($itemsArray) == 0) {
                return false;
            } else {
                return $itemsArray[0];
            }
        }
    }
	
	public function decodeList(&$apiData){
        $resObj = json_decode($apiData);
        if (isset($resObj->error)) {
            $msg = "Error " . $resObj->error->code . " " . $resObj->error->message;
            if (isset($resObj->error->errors[0])) {
                $msg .= " : " . $resObj->error->errors[0]->reason;
            }
            throw new \Exception($msg, $resObj->error->code);
        } else {
            $this->page_info = array(
                'resultsPerPage' => $resObj->pageInfo->resultsPerPage,
                'totalResults'   => isset($resObj->pageInfo->totalResults) ? $resObj->pageInfo->totalResults : null,
                'kind'           => $resObj->kind,
                'etag'           => $resObj->etag,
                'prevPageToken'     => null,
                'nextPageToken'     => null
            );
			
            if (isset($resObj->prevPageToken)) {
                $this->page_info['prevPageToken'] = $resObj->prevPageToken;
            }
            if (isset($resObj->nextPageToken)) {
                $this->page_info['nextPageToken'] = $resObj->nextPageToken;
            }
			
			echo $resObj->nextPageToken."<br/>";
            $itemsArray = $resObj->items;
            if (!is_array($itemsArray) || count($itemsArray) == 0) {
                return false;
            } else {
                return $itemsArray;
            }
        }
    }
	
	public function api_get($url, $params){
        //set the youtube key
        $params['key'] = $this->youtube_key;

        //boilerplates for CURL
        $tuCurl = curl_init();
        if ($this->sslPath !== null) {
            curl_setopt($tuCurl, CURLOPT_SSL_VERIFYPEER, false);
        }
        curl_setopt($tuCurl, CURLOPT_URL, $url . (strpos($url, '?') === false ? '?' : '') . http_build_query($params));
        if ($this->referer !== null) {
            curl_setopt($tuCurl, CURLOPT_REFERER, $this->referer);
        }
        curl_setopt($tuCurl, CURLOPT_RETURNTRANSFER, 1);
        $tuData = curl_exec($tuCurl);
        if (curl_errno($tuCurl)) {
            throw new \Exception('Curl Error : ' . curl_error($tuCurl), curl_errno($tuCurl));
        }
        return $tuData;
    }
	
	 public function paginateResults($params, $token = null)
    {
        if (!is_null($token)) {
            $params['pageToken'] = $token;
        }
        return $this->searchAdvanced($params, true);
    }


	
	public function __destruct() {
	}
}
?>