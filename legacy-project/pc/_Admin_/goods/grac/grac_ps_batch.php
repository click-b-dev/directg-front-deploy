<?
header('Content-Type: text/html; charset=UTF-8');
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

$mode = filter_input(INPUT_POST, 'mode', FILTER_SANITIZE_STRING);


try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	//게등위 게임3.0 API
	$ch = curl_init();
	$url = "https://www.grac.or.kr/WebService/GameSearchSvc.asmx/game?startdate=2025-10-23&enddate=2026-03-31&display=1000&pageno=1";
	curl_setopt($ch,CURLOPT_URL, $url);
	curl_setopt($ch,CURLOPT_POST, false);
	curl_setopt($ch, CURLOPT_SSLVERSION, '6');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$agents = array(
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
		'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.9) Gecko/20100508 SeaMonkey/2.0.4',
		'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; da-dk) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
	 
	);
	curl_setopt($ch,CURLOPT_USERAGENT,$agents[array_rand($agents)]);
	$response = curl_exec($ch);
	$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	print curl_error($ch);
	curl_close ($ch);
	$object = simplexml_load_string($response);
	
	echo $object->tcount."<br/>";

	foreach($object->item as $key=>$value){
		if($value->platform<>"모바일 게임"){
			$u_query = "insert into grac_entname set entname=:entname ON DUPLICATE KEY UPDATE batch_date=now()";
			$u_param = array(
				":entname"=>$value->entname,
			);
			$stmt = $conn->prepare($u_query);
			$stmt->execute($u_param);
			
			$query="insert into grac_list set gametitle=:gametitle,orgname=:orgname,entname=:entname,hoperate=:hoperate,givenrate=:givenrate,genre=:genre,rateno=:rateno,rateddate=:rateddate,descriptors=:descriptors,platform=:platform,cancelstatus=:cancelstatus,canceledddate=STR_TO_DATE(:canceledddate,'%Y-%-m-%d'),reg_date=now() ON DUPLICATE KEY UPDATE gametitle=:gametitle,orgname=:orgname,entname=:entname,hoperate=:hoperate,givenrate=:givenrate,genre=:genre,rateddate=:rateddate,descriptors=:descriptors,platform=:platform,cancelstatus=:cancelstatus,canceledddate=STR_TO_DATE(:canceledddate,'%Y-%-m-%d'),reg_date=now()";
			$params = array(
				":gametitle"=>$value->gametitle,
				":orgname"=>$value->orgname,
				":entname"=>$value->entname,
				":hoperate"=>$value->hoperate,
				":givenrate"=>$value->givenrate,
				":genre"=>$value->genre,
				":rateno"=>$value->rateno,
				":rateddate"=>$value->rateddate,
				":descriptors"=>$value->descriptors,
				":platform"=>$value->platform,
				":cancelstatus"=>$value->cancelstatus,
				":canceledddate"=>$value->canceledddate,
			);
			$stmt = $conn->prepare($query);
			//print_r($params);
			$stmt->execute($params);
			echo $value->gametitle."<br/>";
		}
		
	}
}catch (PDOException $e){  
	echo 'Error!: '.$e->getMessage();  
	die();  
}

?>