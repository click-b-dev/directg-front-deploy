<?
//Asset 관련 DB 처리 전용 클래스 (외부 API 호출은 Asset 클래스 사용)
class AdminAsset extends Pagination{
	private $_db;

	//클래스 생성자
	public function __construct(PDO $db){
		$this->_db = $db;
	}

	//Asset 다운로드 로그 조회 (반품/출고 키 다운로드 권한·상태 확인 — 레거시 directgames.tbl_asset_download_log)
	public function getAssetDownloadLog($po){
		$query = "select owner,is_finish,downloadLimit from directgames.tbl_asset_download_log where po=:po";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':po'=>$po
		);
		$stmt->execute($params);
		$data = $stmt->fetch();

		return $data;
	}

	//Asset 다운로드 횟수 차감 (다운로드 성공 시 1 차감 + 다운로드일시 갱신, 동시성 대비 downloadLimit>0 조건)
	public function setAssetDownloadDecrease($po){
		$query = "update directgames.tbl_asset_download_log set downloadLimit=downloadLimit-1,download_date=now() where po=:po and downloadLimit>0";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':po'=>$po
		);
		$stmt->execute($params);

		return $stmt->rowCount();
	}

	//다운로드용 Reserve 등록 로컬 기록 (asset.md 3.6 RETURN — directgames.tbl_asset_download_log INSERT)
	public function setAssetDownloadRegister($po,$asset_id,$owner,$qty,$pin,$download_limit,$download_expired_day){
		$query = "insert into directgames.tbl_asset_download_log set po=:po,asset_id=:asset_id,download_type='RETURN',owner=:owner,qty=:qty,pin=:pin,downloadLimit=:download_limit,downloadExpiredDay=:download_expired_day,reg_date=now()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':po'=>$po,
			':asset_id'=>$asset_id,
			':owner'=>$owner,
			':qty'=>$qty,
			':pin'=>$pin,
			':download_limit'=>$download_limit,
			':download_expired_day'=>$download_expired_day
		);
		$stmt->execute($params);

		return $stmt->rowCount();
	}

	//다운로드 Reserve finish 로컬 표시 (asset.md 3.8 — 키 삭제 후 is_finish='Y')
	public function setAssetDownloadFinish($po){
		$query = "update directgames.tbl_asset_download_log set is_finish='Y',finish_date=now() where po=:po";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':po'=>$po
		);
		$stmt->execute($params);

		return $stmt->rowCount();
	}

	//다운로드 Reserve 목록 (directgames.tbl_asset_download_log + dgkrshop.tbl_asset 조인, owner like 필터 + 페이징)
	public function getAssetDownloadList($owner_q,$page,$size){
		$where = "1=1";
		$params = array();
		if($owner_q !== ""){
			$where .= " and a.owner like :owner";
			$params[":owner"] = "%".$owner_q."%";
		}

		//총건수
		$cnt_stmt = $this->_db->prepare("select count(1) from directgames.tbl_asset_download_log a where ".$where);
		$cnt_stmt->execute($params);
		$total = (int)$cnt_stmt->fetchColumn();

		//페이징 기본값
		$size   = $size > 0 ? (int)$size : 30;
		$page   = $page > 0 ? (int)$page : 1;
		$offset = ($page - 1) * $size;

		//Asset 이름은 dgkrshop.tbl_asset 조인(동기화된 건만), 만료일시는 reg_date + 일수 계산
		$lst_stmt = $this->_db->prepare("select a.no, a.po, a.asset_id, b.asset_name, a.download_type, a.owner, a.qty, a.pin,
				a.downloadLimit, a.downloadExpiredDay, a.is_finish, a.finish_date, a.download_date, a.reg_date,
				DATE_ADD(a.reg_date, INTERVAL a.downloadExpiredDay DAY) as expired_dt
			from directgames.tbl_asset_download_log a
			left join dgkrshop.tbl_asset b on a.asset_id = b.asset_id
			where ".$where." order by a.no desc limit ".$offset.",".$size);
		$lst_stmt->execute($params);
		$rows = $lst_stmt->fetchAll(PDO::FETCH_ASSOC);

		return array(
			"content"       => $rows,
			"totalElements" => $total,
			"totalPages"    => $size > 0 ? (int)ceil($total / $size) : 0,
		);
	}

	//Asset 서버 상세(runAssetDetail) 응답 기준 tbl_asset INSERT/갱신 (권위 데이터 동기화)
	public function upsertAsset($asset_detail){
		if(empty($asset_detail->id)){
			return false;
		}
		$asset_name = isset($asset_detail->title) ? $asset_detail->title : ($asset_detail->name ?? '');
		$query = "insert into tbl_asset set asset_id=:asset_id,asset_name=:asset_name,productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,reg_date=:reg_date ON DUPLICATE KEY UPDATE asset_name=:asset_name,productType=:productType,assetType=:assetType,platform=:platform,publisher=:publisher,reg_date=:reg_date,update_dt=now()";
		$stmt = $this->_db->prepare($query);
		$params = array(
			':asset_id'=>$asset_detail->id,
			':asset_name'=>$asset_name,
			':productType'=>$asset_detail->productType,
			':assetType'=>$asset_detail->assetType,
			':platform'=>$asset_detail->platform,
			':publisher'=>$asset_detail->publisher,
			':reg_date'=>$asset_detail->regDt
		);
		$stmt->execute($params);

		return $stmt->rowCount();
	}
}
