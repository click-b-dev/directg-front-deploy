<?
	include_once($_SERVER["DOCUMENT_ROOT"]."/../mobile/lib/api_func.php");
	
	$token = getBearerToken();
	
	$json_data = array();
	$category_data = array();
	
	if ($token=="8QzsjYk6GwmQRee99xDqef8u2P/t60uW4qSV2XxHUsU="){
		$is_auth= "Y";
	} else {
		$is_auth= "N";
		$error_message="접근권한이 없습니다.";
	}
	
	
	
	
	$category_list['C0001']['0']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001001", "category_name"=>"싱글 플레이어");
	$category_list['C0001']['1']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001002", "category_name"=>"멀티플레이어");
	$category_list['C0001']['2']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001003", "category_name"=>"온라인 PvP");
	$category_list['C0001']['3']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001004", "category_name"=>"온라인 협동");
	$category_list['C0001']['4']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001005", "category_name"=>"LAN PvP");
	$category_list['C0001']['5']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001006", "category_name"=>"LAN 협동");
	$category_list['C0001']['6']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001007", "category_name"=>"협동");
	$category_list['C0001']['7']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001008", "category_name"=>"MMO");
	$category_list['C0001']['8']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001009", "category_name"=>"플랫폼간 멀티플레이");
	$category_list['C0001']['9']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001011", "category_name"=>"4인 로컬 플레이");
	$category_list['C0001']['10']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001012", "category_name"=>"로컬 멀티플레이어");
	$category_list['C0001']['11']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001013", "category_name"=>"비동기 멀티플레이어");
	$category_list['C0001']['12']=array("category_group_code"=>"C0001","category_group_name"=>"플레이어 수","category_code"=>"C0001014", "category_name"=>"대규모 멀티플레이어");
	
	$category_list['C0002']['0']=array("category_group_code"=>"C0002","category_group_name"=>"화면 및 디스플레이","category_code"=>"C0002001", "category_name"=>"HDR 사용 가능");
	$category_list['C0002']['1']=array("category_group_code"=>"C0002","category_group_name"=>"화면 및 디스플레이","category_code"=>"C0002002", "category_name"=>"스크린 공유 및 분할 PvP");
	$category_list['C0002']['2']=array("category_group_code"=>"C0002","category_group_name"=>"화면 및 디스플레이","category_code"=>"C0002003", "category_name"=>"스크린 공유 및 분할 협동");
	$category_list['C0002']['3']=array("category_group_code"=>"C0002","category_group_name"=>"화면 및 디스플레이","category_code"=>"C0002004", "category_name"=>"공유/분할 화면");
	
	$category_list['C0003']['0']=array("category_group_code"=>"C0003","category_group_name"=>"VR 및 컨트롤러 지원","category_code"=>"C0003001", "category_name"=>"VR 전용");
	$category_list['C0003']['1']=array("category_group_code"=>"C0003","category_group_name"=>"VR 및 컨트롤러 지원","category_code"=>"C0003002", "category_name"=>"VR 지원");
	$category_list['C0003']['2']=array("category_group_code"=>"C0003","category_group_name"=>"VR 및 컨트롤러 지원","category_code"=>"C0003003", "category_name"=>"추적되는 컨트롤러 지원");
	$category_list['C0003']['3']=array("category_group_code"=>"C0003","category_group_name"=>"VR 및 컨트롤러 지원","category_code"=>"C0003004", "category_name"=>"컨트롤러 완벽 지원");
	$category_list['C0003']['4']=array("category_group_code"=>"C0003","category_group_name"=>"VR 및 컨트롤러 지원","category_code"=>"C0003005", "category_name"=>"컨트롤러 일부 지원");
	
	$category_list['C0004']['0']=array("category_group_code"=>"C0004","category_group_name"=>"게임 서비스 및 기능","category_code"=>"C0004001", "category_name"=>"코멘터리 제공");
	$category_list['C0004']['1']=array("category_group_code"=>"C0004","category_group_name"=>"게임 서비스 및 기능","category_code"=>"C0004002", "category_name"=>"추가적인 고품질 오디오");
	$category_list['C0004']['2']=array("category_group_code"=>"C0004","category_group_name"=>"게임 서비스 및 기능","category_code"=>"C0004003", "category_name"=>"레벨 에디터 포함");
	$category_list['C0004']['3']=array("category_group_code"=>"C0004","category_group_name"=>"게임 서비스 및 기능","category_code"=>"C0004004", "category_name"=>"다운로드 가능한 콘텐츠");
	
	$category_list['C0005']['0']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005001", "category_name"=>"텍스트 크기 조절");
	$category_list['C0005']['1']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005002", "category_name"=>"자막 옵션");
	$category_list['C0005']['2']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005003", "category_name"=>"색상 대체");
	$category_list['C0005']['3']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005004", "category_name"=>"카메라 움직임 조정");
	$category_list['C0005']['4']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005005", "category_name"=>"음량 개별 조정");
	$category_list['C0005']['5']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005006", "category_name"=>"스테레오 사운드");
	$category_list['C0005']['6']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005007", "category_name"=>"서라운드 사운드");
	$category_list['C0005']['7']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005008", "category_name"=>"게임 메뉴 음성 안내");
	$category_list['C0005']['8']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005009", "category_name"=>"타임 이벤트 없이 플레이 가능");
	$category_list['C0005']['9']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005010", "category_name"=>"텍스트 채팅 음성 변환");
	$category_list['C0005']['10']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005011", "category_name"=>"키보드 전용 옵션");
	$category_list['C0005']['11']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005012", "category_name"=>"마우스 전용 옵션");
	$category_list['C0005']['12']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005013", "category_name"=>"터치 전용 옵션");
	$category_list['C0005']['13']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005014", "category_name"=>"난이도 조정");
	$category_list['C0005']['14']=array("category_group_code"=>"C0005","category_group_name"=>"접근성 기능","category_code"=>"C0005015", "category_name"=>"수시 저장");
	
	$category_list['P0003']['0']=array("category_group_code"=>"P0003","category_group_name"=>"PS액세서리","category_code"=>"P0003001", "category_name"=>"무선 컨트롤러");
	$category_list['P0003']['1']=array("category_group_code"=>"P0003","category_group_name"=>"PS액세서리","category_code"=>"P0003002", "category_name"=>"고급 컨트롤러");
	
	$category_list['R0001']['0']=array("category_group_code"=>"R0001","category_group_name"=>"Razer (레이저)","category_code"=>"R0001001", "category_name"=>"게임패드/컨트롤러");
	$category_list['R0001']['1']=array("category_group_code"=>"R0001","category_group_name"=>"Razer (레이저)","category_code"=>"R0001002", "category_name"=>"마우스");
	$category_list['R0001']['2']=array("category_group_code"=>"R0001","category_group_name"=>"Razer (레이저)","category_code"=>"R0002002", "category_name"=>"마이크");
	$category_list['R0001']['3']=array("category_group_code"=>"R0001","category_group_name"=>"Razer (레이저)","category_code"=>"R0002001", "category_name"=>"헤드셋/이어폰");
	
	$category_data['category'] = $category_list;

	if($is_auth=="N"){
		$json_data = array(
			"status"=>"error",
			"code"=>"Access Denied",
			"message"=>$error_message,
		);
		
		echo json_encode($json_data);
	}else{
		$json_data = array(
				"status"=>"success",
				"data"=>$category_data,
			);
			
			echo json_encode($json_data);
	}
?>