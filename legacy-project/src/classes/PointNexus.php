<?
class PointNexus {
	//운영 전환 단일 토글 — 결제 흐름/웹훅/어드민취소 등 mode 미지정 호출부의 공통 기본값.
	//운영 전환 시 이 한 줄만 'prod'로 바꾸면 모든 호출부에 일괄 적용됨.
	//(yjs 테스트 파일은 명시적으로 "test"를 넘기므로 이 토글과 무관하게 test 고정.
	// 어드민/API 콘솔은 셀렉터로 mode를 직접 넘기므로 영향 없음.)
	const DEFAULT_MODE = 'prod';

	private $mode;
	private $client_id;
	private $client_secret;
	private $base_url;
	private $auth_url;
	private $log_path;

	//$mode 미지정(null) 시 self::DEFAULT_MODE 사용 — 결제 흐름은 인자 없이 new PointNexus()로 호출
	public function __construct($mode = null) {
		$this->mode = ($mode !== null) ? $mode : self::DEFAULT_MODE;
		if($this->mode=="test"){
			$this->client_id     = 'OGYyNjIxODUtNTRhNi00NDhlLWE4YTUtNzY4ZTZjNmY3ZWNkOmEzY2U4ODJmLTUwNjktNGM5OS1hMWQxLWVmZjQyOWU5NTVlMzpiZGU3MWE1ZC1mZGUyLTRiYWMtODc3My04MjNmYzg2MDNiYWQ';
			$this->client_secret = 'a4be4a29c6824656a3749724dcf5ba10e99e9c0a430bb869380e26fc199055ac25b11520';
		}else{
			$this->client_id     = 'OGYyNjIxODUtNTRhNi00NDhlLWE4YTUtNzY4ZTZjNmY3ZWNkOmEzY2U4ODJmLTUwNjktNGM5OS1hMWQxLWVmZjQyOWU5NTVlMzphODY3MmRjOC1jODUwLTRjOTAtYTQzMC1lZjRlNTY3YWU4NDY';
			$this->client_secret = 'cc3ea76d271f15bd058288d75d2de77715e0605c510f033904131ec989b5a9e0028e86e4';
		}
		$this->base_url      = 'https://api.point.nexus/v1';
		$this->auth_url      = 'https://nexus.auth.encaps.io/oauth2/access_token';
		//log_path는 소스(__DIR__=src/classes) 기준으로 www/log/pointnexus 고정.
		//DOCUMENT_ROOT는 진입점(PC=www/pc, 모바일=www/mobile, CLI=빈값)마다 달라 로그가 엉뚱한 곳으로 새므로 쓰지 않음. 운영/테스트 서버 모두 호환.
		$this->log_path      = __DIR__.'/../../log/pointnexus/';
	}

	//현재 인스턴스의 mode 조회 (test|prod) — DB 기록·라우팅용
	public function getMode() {
		return $this->mode;
	}

	//OAuth2 액세스 토큰 발급 및 갱신 (만료 5분 전 선제 갱신)
	//토큰은 mode(test/prod)별로 별도 캐시 — 모드 전환 시 다른 모드의 토큰을 잘못 사용하는 것을 방지
	private function getAccessToken() {
		if (
			!empty($_SESSION['pointnexus'][$this->mode]['access_token']) &&
			!empty($_SESSION['pointnexus'][$this->mode]['expires_at']) &&
			$_SESSION['pointnexus'][$this->mode]['expires_at'] > time() + 300
		) {
			return $_SESSION['pointnexus'][$this->mode]['access_token'];
		}

		$ch = curl_init();
		curl_setopt_array($ch, array(
			CURLOPT_URL            => $this->auth_url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HEADER         => 1,
			CURLOPT_POST           => true,
			CURLOPT_POSTFIELDS     => http_build_query(array(
				'grant_type'    => 'client_credentials',
				'client_id'     => $this->client_id,
				'client_secret' => $this->client_secret,
			)),
			CURLOPT_HTTPHEADER     => array('Content-Type: application/x-www-form-urlencoded'),
			CURLOPT_TIMEOUT        => 30,
			CURLOPT_SSL_VERIFYPEER => false,
		));

		$result     = curl_exec($ch);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		$body = substr($result, $headerSize);
		$data = json_decode($body, true);

		if ($httpCode !== 200 || empty($data['success']) || empty($data['access_token'])) {
			$this->errorLog($body, 'getAccessToken', 'Auth');
			throw new Exception('PointNexus 토큰 발급 실패: ' . $body);
		}

		$_SESSION['pointnexus'][$this->mode]['access_token'] = $data['access_token'];
		$_SESSION['pointnexus'][$this->mode]['expires_at']   = time() + (int)$data['expires_in'];

		return $data['access_token'];
	}

	//[Authentication] GET /test — 인증 상태 및 환경(sandbox) 확인
	public function runTest() {
		$url    = $this->base_url . '/test';
		$result = $this->get($url, 'test', 'Auth');
		return json_decode($result);
	}

	//[ProductType] GET /productType — 현재 조직에 허용된 상품 타입 목록
	public function runProductType() {
		$url    = $this->base_url . '/productType';
		$result = $this->get($url, 'productType', 'ProductType');
		return json_decode($result);
	}

	//[Product] GET /product — 판매 가능한 상품 목록 조회
	//filters 예시: '[{"field":"type","op":"=","value":"sale"}]'
	public function runProduct($offset = 0, $limit = 50, $filters = '') {
		$params = array('offset' => $offset, 'limit' => $limit);
		if ($filters !== '') {
			$params['filters'] = $filters;
		}
		$url    = $this->base_url . '/product?' . http_build_query($params);
		$result = $this->get($url, 'product', 'Product');
		return json_decode($result);
	}

	//[Product] GET /product/{id} — 특정 상품 조회
	public function runProductRetrieve($id) {
		$url    = $this->base_url . '/product/' . $id;
		$result = $this->get($url, 'productRetrieve', 'Product');
		return json_decode($result);
	}

	//[Product] POST /product/{id}/check — 판매 가능 여부 사전 확인 (실제 키 발급 없음)
	//price: VAT포함 최소단위 정수 (예: 5990 = $59.90) / vat: VAT율*100 (예: 2000 = 20.00%)
	public function runProductCheck($id, $params) {
		$url  = $this->base_url . '/product/' . $id . '/check';
		$data = array(
			'currency'    => $params['currency'],
			'countryCode' => $params['countryCode'],
			'price'       => (int)$params['price'],
			'vat'         => (int)$params['vat'],
		);
		if (!empty($params['IP']))              $data['IP']              = $params['IP'];
		if (!empty($params['buyerCountry']))    $data['buyerCountry']    = $params['buyerCountry'];
		if (!empty($params['clientRequestID'])) $data['clientRequestID'] = $params['clientRequestID'];

		$result = $this->post($url, json_encode($data), 'productCheck', 'Product');
		return json_decode($result);
	}

	//[Product] POST /product/{id}/sell — 즉시 판매 (라이선스 키 발급)
	//Released SKU: 즉시 license.key 반환 / Preorder SKU: operationID 저장 후 reveal로 키 수령
	//응답의 operationID는 반드시 DB에 저장 필요
	public function runProductSell($id, $params) {
		$url  = $this->base_url . '/product/' . $id . '/sell';
		$data = array(
			'currency'    => $params['currency'],
			'countryCode' => $params['countryCode'],
			'price'       => (int)$params['price'],
			'vat'         => (int)$params['vat'],
		);
		if (!empty($params['IP']))              $data['IP']              = $params['IP'];
		if (!empty($params['buyerCountry']))    $data['buyerCountry']    = $params['buyerCountry'];
		if (!empty($params['clientRequestID'])) $data['clientRequestID'] = $params['clientRequestID'];

		$result = $this->post($url, json_encode($data), 'productSell', 'Product');
		return json_decode($result);
	}

	//[Product] POST /product/{id}/book — 예약 (결제 대기용 키 선점, 최대 14일 유효)
	//응답의 operationID는 반드시 DB에 저장 후 confirm 또는 cancel 호출 필요
	public function runProductBook($id, $params) {
		$url  = $this->base_url . '/product/' . $id . '/book';
		$data = array(
			'currency'    => $params['currency'],
			'countryCode' => $params['countryCode'],
			'price'       => (int)$params['price'],
			'vat'         => (int)$params['vat'],
		);
		if (!empty($params['IP']))              $data['IP']              = $params['IP'];
		if (!empty($params['buyerCountry']))    $data['buyerCountry']    = $params['buyerCountry'];
		if (!empty($params['clientRequestID'])) $data['clientRequestID'] = $params['clientRequestID'];

		$result = $this->post($url, json_encode($data), 'productBook', 'Product');
		return json_decode($result);
	}

	//[Operation] GET /operation/{id} — 오퍼레이션 조회
	public function runOperation($id) {
		$url    = $this->base_url . '/operation/' . $id;
		$result = $this->get($url, 'operation', 'Operation');
		return json_decode($result);
	}

	//[Operation] POST /operation/{id}/reveal — 프리오더 키 공개
	//400 응답 시 퍼블리셔 미출시 → 일정 간격으로 재시도 필요
	public function runOperationReveal($id) {
		$url    = $this->base_url . '/operation/' . $id . '/reveal';
		$result = $this->post($url, '', 'operationReveal', 'Operation');
		return json_decode($result);
	}

	//[Operation] POST /operation/{id}/cancel — 오퍼레이션 취소
	public function runOperationCancel($id) {
		$url    = $this->base_url . '/operation/' . $id . '/cancel';
		$result = $this->post($url, '', 'operationCancel', 'Operation');
		return json_decode($result);
	}

	//[Book] POST /book/{id}/confirm — 예약 확정 (결제 완료 후 실제 키 수령)
	//이미 confirm/cancel된 예약은 재확정 불가
	public function runBookConfirm($id) {
		$url    = $this->base_url . '/book/' . $id . '/confirm';
		$result = $this->post($url, '', 'bookConfirm', 'Book');
		return json_decode($result);
	}

	//[Book] POST /book/{id}/cancel — 예약 취소 (키 재고 반납)
	//이미 confirm/cancel된 예약은 재취소 불가
	public function runBookCancel($id) {
		$url    = $this->base_url . '/book/' . $id . '/cancel';
		$result = $this->post($url, '', 'bookCancel', 'Book');
		return json_decode($result);
	}

	//[Promo] GET /promo — 진행 중/예정 프로모션 캠페인 목록
	public function runPromo() {
		$url    = $this->base_url . '/promo';
		$result = $this->get($url, 'promo', 'Promo');
		return json_decode($result);
	}

	//[Promo] POST /promo — 필터링된 프로모션 캠페인 목록
	//params: endDate(string), startDate(string), productIDs(array), issuerIDs(array) - 모두 선택
	public function runPromoFilter($params = array()) {
		$url  = $this->base_url . '/promo';
		$data = array();
		if (!empty($params['endDate']))    $data['endDate']    = $params['endDate'];
		if (!empty($params['startDate']))  $data['startDate']  = $params['startDate'];
		if (!empty($params['productIDs'])) $data['productIDs'] = $params['productIDs'];
		if (!empty($params['issuerIDs']))  $data['issuerIDs']  = $params['issuerIDs'];

		$result = $this->post($url, json_encode($data), 'promoFilter', 'Promo');
		return json_decode($result);
	}

	//[Promo] GET /promo/{id} — 특정 프로모션 캠페인 조회
	public function runPromoRetrieve($id) {
		$url    = $this->base_url . '/promo/' . $id;
		$result = $this->get($url, 'promoRetrieve', 'Promo');
		return json_decode($result);
	}

	//[Partners] GET /partner — 파트너 목록 조회
	//persona: publisher | manufacturer | distributor | store | influencer | platform | trader
	public function runPartner($persona = '') {
		$url = $this->base_url . '/partner';
		if ($persona !== '') {
			$url .= '?persona=' . urlencode($persona);
		}
		$result = $this->get($url, 'partner', 'Partner');
		return json_decode($result);
	}

	//[Partners] GET /partner/{partnerID} — 특정 파트너 조회
	public function runPartnerRetrieve($partnerID) {
		$url    = $this->base_url . '/partner/' . $partnerID;
		$result = $this->get($url, 'partnerRetrieve', 'Partner');
		return json_decode($result);
	}

	//[Capsule] GET /capsule/{id} — 캡슐 조회 (id: hex 문자열)
	public function runCapsule($id) {
		$url    = $this->base_url . '/capsule/' . $id;
		$result = $this->get($url, 'capsule', 'Capsule');
		return json_decode($result);
	}

	//[ActivityLog] GET /activitylog — 활동 로그 목록 조회 (BI 연동용)
	//sort: createdAt | productID | type / sortDirection: ASC | DESC
	//filters 예시: '[{"field":"type","op":"=","value":"sale"}]'
	public function runActivityLog($offset = 0, $limit = 50, $sort = 'createdAt', $sortDirection = 'DESC', $filters = '') {
		$params = array(
			'offset'        => $offset,
			'limit'         => $limit,
			'sort'          => $sort,
			'sortDirection' => $sortDirection,
		);
		if ($filters !== '') {
			$params['filters'] = $filters;
		}
		$url    = $this->base_url . '/activitylog?' . http_build_query($params);
		$result = $this->get($url, 'activitylog', 'ActivityLog');
		return json_decode($result);
	}

	//[ActivityLog] GET /activitylog/{id} — 특정 활동 로그 조회
	public function runActivityLogRetrieve($id) {
		$url    = $this->base_url . '/activitylog/' . $id;
		$result = $this->get($url, 'activitylogRetrieve', 'ActivityLog');
		return json_decode($result);
	}

	//GET 공통 메서드
	public function get($url, $action, $group, $timeout = 60) {
		$token = $this->getAccessToken();

		$ch = curl_init();
		curl_setopt_array($ch, array(
			CURLOPT_URL            => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HEADER         => 1,
			CURLOPT_CUSTOMREQUEST  => 'GET',
			CURLOPT_TIMEOUT        => $timeout,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_HTTPHEADER     => array(
				'Authorization: Bearer ' . $token,
				'Accept: application/json',
				'Content-Type: application/json',
			),
		));

		$result     = curl_exec($ch);
		$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		curl_close($ch);

		$body = substr($result, $headerSize);

		if ($httpCode == 200) {
			$this->successLog($body, $action, $group);
		} else {
			$this->errorLog($body, $action, $group);
		}

		return $body;
	}

	//POST 공통 메서드
	public function post($url, $data_string, $action, $group, $timeout = 60) {
		$token = $this->getAccessToken();

		$ch = curl_init();
		curl_setopt_array($ch, array(
			CURLOPT_URL            => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HEADER         => 1,
			CURLOPT_CUSTOMREQUEST  => 'POST',
			CURLOPT_POST           => 1,
			CURLOPT_POSTFIELDS     => $data_string,
			CURLOPT_CONNECTTIMEOUT => $timeout,
			CURLOPT_TIMEOUT        => $timeout,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_HTTPHEADER     => array(
				'Authorization: Bearer ' . $token,
				'Accept: application/json',
				'Content-Type: application/json',
			),
		));

		$result     = curl_exec($ch);
		$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
		curl_close($ch);

		$body = substr($result, $headerSize);

		if ($httpCode == 200) {
			$this->successLog($body, $action, $group);
		} else {
			$this->errorLog($body, $action, $group);
		}

		return $body;
	}

	//로그 디렉토리 자동 생성 (테스트/신규 서버 대응)
	private function ensureLogDir() {
		if (!is_dir($this->log_path)) {
			@mkdir($this->log_path, 0755, true);
		}
	}

	public function errorLog($result, $action, $group) {
		$this->ensureLogDir();
		$log_file = $this->log_path . 'pointnexus_error_' . $action . '_' . date('Ymd');
		error_log("\r\n[" . date('Y.m.d H:i:s') . "] PointNexus API ERROR [" . $action . "] " . $result . "\n", 3, $log_file);
	}

	public function successLog($result, $action, $group) {
		$this->ensureLogDir();
		$log_file = $this->log_path . 'pointnexus_success_' . $action . '_' . date('Ymd');
		error_log("\r\n[" . date('Y.m.d H:i:s') . "] PointNexus API SUCCESS [" . $action . "] \n" . $result . "\n", 3, $log_file);
	}

	public function __destruct() {
	}
}
?>
