<?
	function getBearerToken() {
		$headers = null;
		if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
			$headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
		} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
			// 일부 서버 환경(예: cPanel)에서 필요할 수 있습니다.
			$headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
		} elseif (function_exists('apache_request_headers')) {
			$requestHeaders = apache_request_headers();
			// 헤더 이름은 대소문자를 구분하지 않을 수 있으므로 확인이 필요합니다.
			$headers = isset($requestHeaders['Authorization']) ? trim($requestHeaders['Authorization']) : (isset($requestHeaders['authorization']) ? trim($requestHeaders['authorization']) : null);
		}

		// "Bearer " 문자열이 포함되어 있는지 확인하고 토큰만 추출합니다.
		if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
			return $matches[1];
		}

		return null; // 토큰이 없거나 형식이 잘못된 경우
	}
	
	function setBearerToken(){
		$bytes = random_bytes(32);
		$token = base64_encode($bytes);
		return $token;
	}
?>