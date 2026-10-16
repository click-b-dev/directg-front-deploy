<?
ini_set( "display_errors", 1 );
error_reporting(E_CORE_ERROR | E_CORE_WARNING | E_COMPILE_ERROR | E_ERROR | E_PARSE | E_USER_ERROR | E_USER_WARNING);
header('Content-Type: text/html; charset=UTF-8');

include_once($_SERVER["DOCUMENT_ROOT"].'/_Admin_/lib/lib.php');

include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_toss.xml');
$logger = Logger::getLogger("pc");

$arr =
array(
	array('T1764795967792','이종혁'),
	array('T1764813986054','이선우'),
	array('T1764814194509','이선우'),
	array('T1764817029468','김태환'),
	array('T1764826312673','하태영'),
	array('T1764828078010','양주성'),
	array('T1764831678659','김시은'),
	array('T1764837492350','임채을'),
	array('T1764838380569','김현우'),
	array('T1764839031901','김강현'),
	array('T1764839839149','장성욱'),
	array('T1764840155636','aribono'),
	array('T1764841820555','안준영'),
	array('T1764849216853','양현덕'),
	array('T1764850465243','한용관'),
	array('T1764851228623','지우'),
	array('T1764851339273','karrt123'),
	array('T1764851951860','이승학'),
	array('T1764855345187','이준영'),
	array('T1764855767391','김나영'),
	array('T1764861404475','박강남'),
	array('T1764864595195','joonwoo69286928'),
	array('T1764891908849','김판기'),
	array('T1764896842722','서지혁'),
	array('T1764904348047','박홍근'),
	array('T1764904479913','이찬호'),
	array('T1764906638949','유정완'),
	array('T1764907258319','장재혁'),
	array('T1764909846859','김민찬'),
	array('T1764910241010','김상태'),
	array('T1764910352677','21682'),
	array('T1764915262153','안민성'),
	array('T1764916571352','이명주'),
	array('T1764916740427','강승권'),
	array('T1764926291961','박찬호'),
	array('T1764927050517','aribono'),
	array('T1764928363341','심재인'),
	array('T1764928762443','신교희'),
	array('T1764928862118','이호숙'),
	array('T1764928989456','이성진'),
	array('T1764931975953','서용현'),
	array('T1764932470975','임지민'),
	array('T1764933091318','hg0654'),
	array('T1764933702077','권용인'),
	array('T1764933807203','한단우'),
	array('T1764934311099','김성현'),
	array('T1764935328064','ekekdms02'),
	array('T1764936349038','유병하'),
	array('T1764936566766','이동현'),
	array('T1764936957364','황상필'),
	array('T1764937019838','박윤아'),
	array('T1764937634541','문석현'),
	array('T1764937867480','안상원'),
	array('T1764938730382','서영준'),
	array('T1764939258800','윤지훈'),
	array('T1764940747183','안준영'),
	array('T1764940886919','전재영'),
	array('T1764941416474','김종우'),
	array('T1764942059033','김민수'),
	array('T1764942497345','황수민'),
	array('T1764942768555','장욱현'),
	array('T1764945182334','강영희'),
	array('T1764947102839','김승태'),
	array('T1764947916830','나인성'),
	array('T1764947997373','이선제'),
	array('T1764948184186','9maria0531'),
	array('T1764949766487','최준열'),
	array('T1764949901006','강기율'),
	array('T1764950499957','이준한'),
	array('T1764950902431','이준한'),
	array('T1764950948853','윤찬수'),
	array('T1764955075259','조현서'),
	array('T1764955890325','홍지표'),
	array('T1764956724202','진영'),
	array('T1764961230180','김소연'),
	array('T1764973758142','임동규'),
	array('T1764974290322','최용환'),
	array('T1764979278022','이은택'),
	array('T1764979305684','김창건'),
	array('T1764979731292','송재원'),
	array('T1764980212283','서유민'),
	array('T1764982647765','강지수'),
	array('T1764983916290','송민구'),
	array('T1764984853962','gsinheon'),
	array('T1764984924612','김재민'),
	array('T1764987097342','김태후'),
	array('T1764987783931','최영숙'),
	array('T1764987831515','이재원'),
	array('T1764989516083','이도현'),
	array('T1764990734956','민경인'),
	array('T1764992525535','도현오'),
	array('T1764992545991','이선제'),
	array('T1764992984645','송인서'),
	array('T1764994284043','kimsh070519'),
	array('T1764994287804','이건희'),
	array('T1764994794141','허유진'),
	array('T1764997506747','김정환'),
	array('T1764998696593','jjih100623'),
	array('T1765003897272','정동학'),
	array('T1765005436938','김규영'),
	array('T1765006161262','RULIXIA'),
	array('T1765006476635','차노'),
	array('T1765007446116','윤성준'),
	array('T1765007643804','김병호'),
	array('T1765008911722','이준서'),
	array('T1765011526817','하성훈'),
	array('T1765012211435','조재훈'),
	array('T1765012645302','김한빈'),
	array('T1765017764614','장진영'),
	array('T1765019444803','김정재'),
	array('T1765019640609','조한수'),
	array('T1765020362206','안민성'),
	array('T1765022289237','천호철'),
	array('T1765022612626','정선교'),
	array('T1765022917204','정선교'),
	array('T1765022961510','김마리'),
	array('T1765025127678','오서준'),
	array('T1765025937743','구희수'),
	array('T1765028727843','이연욱'),
	array('T1765029785589','오세승'),
	array('T1765033615104','조경원'),
	array('T1765038729470','도정희'),
	array('T1765039840220','주명보'),
	array('T1765050587609','김강민'),
	array('T1765053437866','김태훈'),
	array('T1765054718089','손준혁'),
	array('T1765055417500','문장원'),
	array('T1765057440026','이석우'),
	array('T1765059552242','문장원'),
	array('T1765059955337','문장원'),
	array('T1765063282031','최승원'),
	array('T1765071846603','송재원'),
	array('T1765075230614','김혜은'),
	array('T1765079238712','박지성'),
	array('T1765086057164','유종원'),
	array('T1765086391989','임사빈'),
	array('T1765087280974','최니콜라스'),
	array('T1765087776046','김근영'),
	array('T1765095665346','하태영'),
	array('T1765095871322','김시우'),
	array('T1765098944026','엄유하'),
	array('T1765102076996','임기태'),
	array('T1765102593315','손승민'),
	array('T1765104326235','이규영'),
	array('T1765104658314','조영제'),
	array('T1765105928109','김강린'),
	array('T1765107117625','박준석'),
	array('T1765107879316','k6jk6j'),
	array('T1765107972020','jjih100623'),
	array('T1765108428262','조성호'),
	array('T1765109439825','송도영'),
	array('T1765109599024','김연희'),
	array('T1765111354852','이도원'),
	array('T1765112992682','최현수'),
	array('T1765117669650','허철욱'),
	array('T1765122161812','김정현'),
	array('T1765124404654','castropolise'),
	array('T1765139148179','장석환'),
	array('T1765154814655','유종윤'),
	array('T1765157806380','양승진'),
	array('T1765157923228','이찬민'),
	array('T1765163500283','박유석')
);
foreach($arr as $data){
	debug($data[0]);
	debug($data[1]);
}
try{
	$conn = new PDO($dsn,DB_USER,DB_PASSWORD);
	$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
	
	$conn_dgkr = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
	$conn_dgkr->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);

	foreach($arr as $data){
		$params = array(
			"settle_no"=>$data[0],
			"dlvtype"=>"01",
			"rcvdate"=>date('YmdHi'),
			"rcvname"=>$data[1],
			"rcvrelation"=>"본인"
		);
		$toss = new Tossadapter("");
		$res_data = $toss->regDelivery($params);
		$logger->info($res_data);
		print_r($res_data);
	}
}catch (PDOException $e){
	echo 'Error!: '.$e->getMessage();
	die();
}
?>