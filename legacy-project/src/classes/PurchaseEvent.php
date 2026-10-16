<?
class PurchaseEvent{
	protected $db;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->db = $db;
	}

	//이벤트별 남은 사은품 수량
	public function eventGiftStock($event_no){
		$query = "select count(*) from directgames.tbl_event_lottery_item WHERE m_no is null and event_no=:event_no";
		$stmt = $this->db->prepare($query);
		$params = array(
			":event_no"=>$event_no,
		);
		$stmt->execute($params);
		$data=  $stmt->fetch();

		return $data['0'];
	}

	//이벤트 상품 구매 및 활성화 체크
	public function chkEventOrderGoods($event_no,$m_no){
		switch($event_no){
			case "6": //메탈 슬러그 택틱스 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code='50005021' and a.ord_ymd between '2024-07-01' and '2024-12-12'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "7": //센고쿠 다이너스티 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code='50004834' and a.ord_ymd between '2024-07-01' and '2024-12-12'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "8": //스토커 2: 초르노빌의 심장부 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50004544','50004545','50004546') and a.ord_ymd between '2024-01-01' and '2024-12-12'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "11": //킹덤 컴 딜리버런스 2 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50005100','50005101') and a.ord_ymd between '2024-01-01' and '2025-03-14' and b.reg_date<'2025-03-14 11:00:00'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
			case "12": //시드 마이어의 문명 7 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50004895','50004896','50004897','50004898','50004899','50004900') and a.ord_ymd between '2024-01-01' and '2025-03-14' and b.reg_date<'2025-03-14 11:00:00'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
			case "13": //용과 같이8 외전 파이리츠 인 하와이 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50004941','50004942','50005219') and a.ord_ymd between '2024-01-01' and '2025-03-14' and b.reg_date<'2025-03-14 11:00:00'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
			case "14": //몬스터 헌터 와일즈 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50004957','50004958','50004959') and a.ord_ymd between '2024-01-01' and '2025-03-14' and b.reg_date<'2025-03-14 11:00:00'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
			case "16": //드래곤킨: 더 배니쉬드 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code='50005288' and a.ord_ymd between '2025-01-01' and '2025-04-07'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "17": //WWE 2K25 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50005210','50005211','50005212') and a.ord_ymd between '2025-01-01' and '2025-04-07'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "18": //킬링 플로어 3 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code='50005215' and a.ord_ymd between '2025-01-01' and '2025-04-07'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "19": //퍼스트 버서커: 카잔 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50005159','50005160') and a.ord_ymd between '2025-01-01' and '2025-04-07'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "22": //더 라스트 오브 어스 파트 2 리마스터드
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code='50005209' and a.ord_ymd between '2025-01-01' and '2025-05-07'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "23": //코만도스: 오리진스 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50005330','50005331') and a.ord_ymd between '2025-01-01' and '2025-05-07'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "24": //스노우 브라더스 2 스페셜 리마스터드
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code='50005329' and a.ord_ymd between '2025-01-01' and '2025-05-07'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}

				return $event_result;
			break;
			case "26": //주말한정! 다이렉트 게임즈 인기 타이틀 X 네이버페이 포인트 이벤트 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50005291','50005101','50004942') and a.ord_ymd between '2025-04-11' and '2025-04-14'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
			case "28": //4월 4주 주말한정! 다이렉트 게임즈 인기 타이틀 X 네이버페이 포인트 이벤트 구매여부 체크
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50005291','50005101','50005159','50005160','50005330','50005331','50005354') and a.ord_ymd between '2025-04-25' and '2025-04-28'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
			case "31": //2025 가정의달 프로모션 #03 인기 타이틀 구매 이벤트
				$query = "select count(*) from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.m_no=:m_no and b.product_code in ('50005291','50005101','50005160','50005330','50005331','50005354','50005190') and a.ord_ymd between '2025-04-30' and '2025-05-19'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']>0){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
		}
	}
	
	//DGKR 리뉴얼 이벤트 상품 구매 및 활성화 체크
	public function chkEventOrderGoods_v2($event_no,$m_no){
		switch($event_no){
			case "38": // <풋볼 매니저 2024> & <풋볼 매니저 26> 구매하기 이벤트
				$query = "select count(distinct b.product_code) from tbl_order a inner join tbl_order_item b on a.settle_no=b.settle_no where a.step='2' and b.status='2' and b.is_actv='1' and a.m_no=:m_no and b.product_code in ('50004360','60000076') and a.ord_ymd between '2023-09-14' and '2025-11-05'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$chk_event=  $stmt->fetch();

				if($chk_event['0']=="2"){
					$event_result="1";
				}else{
					$event_result="0";
				}
				return $event_result;
			break;
		}
	}

	//이벤트 사은품 지급여부 체크
	public function chkEventGiftConfirm($event_no,$m_no){
		$query = "select count(*) from directgames.tbl_event_lottery_item WHERE m_no=:m_no and event_no=:event_no";
		$params = array(
			":m_no"=>$m_no,
			":event_no"=>$event_no,
		);
		$stmt = $this->db->prepare($query);
		$stmt->execute($params);
		$data=  $stmt->fetch();

		if($data['0']>0){
			$gift_confirm="N"; //이미 수령
		}else{
			$gift_confirm="Y"; //수령가능
		}

		return $gift_confirm;
	}

	//랜덤게임 추출
	public function getGiftGameRandom($event_no){
		$query="SELECT event_no,item_code,item_name,gift_group FROM directgames.tbl_event_lottery_item WHERE  m_no is null and event_no=:event_no ORDER BY RAND() limit 1";
		$params = array(
			":event_no" => $event_no,
		);
		$stmt = $this->db->prepare($query);
		$result = $stmt->execute($params);
		$random_game = $stmt->fetch();

		return $random_game;
	}

	//사은품 할당처리
	public function setGiftGameRandom($m_no,$m_id,$member_data,$gift_item){
		$u_query="update directgames.tbl_event_lottery_item set m_no=:m_no,m_id=:m_id,name=:name,birth_day=:birth_day,hp=:hp,lottery_date=now(),lottery_status='Y' where m_no is null and event_no=:event_no and item_code=:item_code order by idx asc limit 1";
		$params = array(
			":m_no" => $m_no,
			":m_id" => $m_id,
			":name" => $member_data['name'],
			":birth_day" => $member_data['birth_day'],
			":hp" => $member_data['hp'],
			":event_no" => $gift_item['event_no'],
			":item_code" => $gift_item['item_code'],
		);
		$stmt = $this->db->prepare($u_query);
		$result = $stmt->execute($params);
	}

	//사은품 정보 확인
	public function getGiftInfo($gift_no){
		$query = "select idx,title,gift_nm,asset_id from directgames.tbl_event_gift WHERE idx=:idx";
		$stmt = $this->db->prepare($query);
		$params = array(
			":idx"=>$gift_no,
		);
		$stmt->execute($params);
		$data=  $stmt->fetch();

		return $data;
	}

	//포인트 사은품 지급처리
	public function setEventPointSend($m_no,$event_no,$point,$gift_info){
		$point_query = "insert into directgames.tbl_emoney_log set m_no=:m_no,ordno=:ordno,emoney_type='+',emoney=:emoney,amt_delta=:amt_delta,memo=:memo,regdt=now()";
		$params = array(
			":m_no" => $m_no,
			":ordno" => "event_".$m_no."_".$event_no,
			":emoney" => $point,
			":amt_delta" => $point,
			":memo" => $gift_info['title'],
		);
		$stmt = $this->db->prepare($point_query);
		$result = $stmt->execute($params);
	}

	//랜덤게임 사은품 지급처리
	public function setEventGiftSend($m_id,$random_game,$gift_info){
		$gift_query = "insert into directgames.tbl_event_gift_member set m_id=:m_id,asset_id=:asset_id,reg_date=now(),gift_nm=:gift_nm,status='0',parent_idx=:parent_idx";
		$params = array(
			":m_id" => $m_id,
			":gift_nm" => $random_game['item_name'],
			":asset_id" => $gift_info['asset_id'],
			":parent_idx" => $gift_info['idx'],
		);
		$stmt = $this->db->prepare($gift_query);
		$result = $stmt->execute($params);
	}

	//이벤트 당첨 지급이력 추가
	public function setEventGiftMemberLog($m_no,$m_id,$event_no,$member_data){
		$query="insert into directgames.tbl_event_lottery_log set event_no=:event_no,m_no=:m_no,m_id=:m_id,name=:name,birth_day=:birth_day,hp=:hp,lottery_date=now(),lottery_status='Y'";
		$params = array(
			":event_no"=>$event_no,
			":m_no" => $m_no,
			":m_id" => $m_id,
			":name" => $member_data['name'],
			":birth_day" => $member_data['birth_day'],
			":hp" => $member_data['hp'],
		);
		$stmt = $this->db->prepare($query);
		$result = $stmt->execute($params);
	}
	
	//이벤트 참여여부 확인 
	public function chkEventMemberLog($event_no,$m_no){
		$query = "select count(*) from directgames.tbl_event_log WHERE m_no=:m_no and event_no=:event_no";
		$params = array(
			":m_no"=>$m_no,
			":event_no"=>$event_no,
		);
		$stmt = $this->db->prepare($query);
		$stmt->execute($params);
		$data=  $stmt->fetch();

		if($data['0']>0){
			$chk_event_member="Y"; //이미 참여완료
		}else{
			$chk_event_member="N"; //미참여
		}

		return $chk_event_member;
	}
	
	//이벤트 참여이력 추가
	public function setEventMemberLog($m_no,$m_id,$event_no,$member_data){
		$query="insert into directgames.tbl_event_log set event_no=:event_no,m_no=:m_no,m_id=:m_id,reg_date=now()";
		$params = array(
			":event_no"=>$event_no,
			":m_no" => $m_no,
			":m_id" => $m_id,
		);
		$stmt = $this->db->prepare($query);
		$result = $stmt->execute($params);
	}
	
	//이벤트 기간내 주문실적 확인
	public function chkEventOrderPrice($m_no){
		$query = "select sum(b.tot_pay)as event_price from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.ord_ymd between '2024-12-19' and '2025-01-06' and b.reg_date>'2024-12-19 16:00:00' and b.reg_date<'2025-01-06 16:00:00'  and a.m_no=:m_no";
		$stmt = $this->db->prepare($query);
		$params = array(
			":m_no"=>$m_no,
		);
		$stmt->execute($params);
		$data=  $stmt->fetch();
		
		return $data['event_price'];
	}
	
	//이벤트 기간내 주문실적 확인
	public function chkEventOrderPrice_v2($m_no){
		$query = "select sum(b.tot_pay)as event_price from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.ord_ymd between '2025-03-27' and '2025-03-31' and a.m_no=:m_no";
		$stmt = $this->db->prepare($query);
		$params = array(
			":m_no"=>$m_no,
		);
		$stmt->execute($params);
		$data=  $stmt->fetch();
		
		return $data['event_price'];
	}
	
	//이벤트 기간내 주문실적 확인
	public function chkEventOrderPrice_v3($event_no,$m_no){
		switch($event_no){
			case "27": 
				$query = "select sum(b.tot_pay)as event_price from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.ord_ymd between '2025-04-18' and '2025-04-21' and a.m_no=:m_no";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$data=  $stmt->fetch();
				
				return $data['event_price'];
			break;
			case "29":
				$query = "select sum(b.tot_pay)as event_price from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.ord_ymd between '2025-04-30' and '2025-05-19' and a.m_no=:m_no and b.product_code<>'50005379'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$data=  $stmt->fetch();
				
				return $data['event_price'];
			break;
			case "30":
				$query = "select sum(event_price)as total_event_price from directgames.tbl_event_price where m_no=:m_no and event_no='30' and ord_ymd between '2025-04-30' and '2025-05-19' group by m_no";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$data=  $stmt->fetch();
				
				return $data['total_event_price'];
			break;
			case "34": //다이렉트 게임즈 2025 여름 프로모션 #01 1만원 이상 구매
				$query = "select sum(b.tot_pay)as event_price from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.ord_ymd between '2025-06-26' and '2025-07-14' and a.m_no=:m_no and b.product_code<>'50005520'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$data=  $stmt->fetch();
				
				return $data['event_price'];
			break;
			case "35": //다이렉트 게임즈 2025 여름 프로모션 #02 5만원 이상 구매
				$query = "select sum(b.tot_pay)as event_price from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.ord_ymd between '2025-06-26' and '2025-07-14' and a.m_no=:m_no and b.product_code<>'50005520'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$data=  $stmt->fetch();
				
				return $data['event_price'];
			break;
			case "36": //다이렉트 게임즈 2025 여름 프로모션 #03 10만원 이상 구매
				$query = "select sum(b.tot_pay)as event_price from directgames.tbl_order a inner join directgames.tbl_order_item b on a.id=b.order_id where a.step='2' and b.status='2' and b.is_lic_actv='1' and a.ord_ymd between '2025-06-26' and '2025-07-14' and a.m_no=:m_no and b.product_code<>'50005520'";
				$stmt = $this->db->prepare($query);
				$params = array(
					":m_no"=>$m_no,
				);
				$stmt->execute($params);
				$data=  $stmt->fetch();
				
				return $data['event_price'];
			break;
		}
	}

	//클래스 소멸자
	public function __destruct() {
		$this->db = null;
	}
}
?>