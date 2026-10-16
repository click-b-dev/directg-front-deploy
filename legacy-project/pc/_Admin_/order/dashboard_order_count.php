<?
//============================================================
//주문 대시보드 — 카드 1개 건수 반환 JSON 엔드포인트
//대시보드 셸이 카드별로 개별 호출(?key=...) → 서버에서 병렬 처리
//무거운 집계 쿼리를 한 페이지 로드에 몰아서 순차 실행하지 않도록 분리
//============================================================
	header('Content-Type: application/json; charset=UTF-8');

	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');            //세션/인증/$dsn
	include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/order/dashboard_order_defs.php'); //dash_count / dash_sql_map

	//세션 락 해제 — 인증은 lib.php에서 이미 끝났으므로, 여러 카드 요청이 세션 락에 직렬화되지 않도록 즉시 닫음
	if(function_exists('session_status') && session_status() === PHP_SESSION_ACTIVE){
		session_write_close();
	}

	$group = isset($_GET['group']) ? $_GET['group'] : '';

	//그룹 조회 — 한 번의 GROUP BY 쿼리로 여러 버킷(bucket) 값을 동시 반환
	if($group !== ''){
		$gmap = dash_group_sql();
		if(!isset($gmap[$group])){
			echo json_encode(array('counts'=>null, 'error'=>'unknown group'));
			exit;
		}
		$counts = array();
		try{
			$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$stmt = $conn->query($gmap[$group]);
			while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
				if($row['bucket'] !== null && $row['bucket'] !== ''){
					$counts[$row['bucket']] = (int)$row['cnt'];
				}
			}
		}catch(PDOException $e){
			$counts = null;   //조회 실패 → 클라이언트에서 '-' 처리
		}
		echo json_encode(array('counts'=>$counts));
		exit;
	}

	//단일 키 조회
	$key = isset($_GET['key']) ? $_GET['key'] : '';
	$map = dash_sql_map();

	if(!isset($map[$key])){
		echo json_encode(array('count'=>null, 'error'=>'unknown key'));
		exit;
	}

	try{
		$conn = new PDO($dsn, DB_USER, DB_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		$count = dash_count($conn, $map[$key]);   //실패 시 null
	}catch(PDOException $e){
		$count = null;
	}

	echo json_encode(array('count'=>$count));
	exit;
?>
