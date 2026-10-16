<?
	### 관리자(_Admin_) 전용 공통 함수
	### lib.php 에서 include. 루트 /lib/lib_func.php 의 msg/go/arr_sort/get_client_ip_env/debug 는 이미 로드되므로 여기서 재정의하지 않는다.

//디렉토리 재귀 삭제
function rmdir_all($delete_path) {
	$dirs = dir($delete_path);

	while(false !== ($entry = $dirs->read())) {
		if(($entry != '.') && ($entry != '..')) {
			if(is_dir($delete_path.'/'.$entry)) {
				rmdir_all($delete_path.'/'.$entry);
			} else {
				@unlink($delete_path.'/'.$entry);
			}
		}
	}

	$dirs->close();
	@rmdir($delete_path);
}

/* ------- 관리자 페이지 이동 링크 ------- */

//옵션상품 상세(수정) 링크
function goods_link($product_code){
	return '/_Admin_/goods/goods_option_view.php?product_code='.urlencode($product_code);
}

//에셋 ID(item_id) -> 옵션상품 재고현황 Asset ID 검색 링크
function asset_link($item_id){
	return '/_Admin_/goods/stock/goods_option_stock.php?search_key=search_asset_id&search_value='.urlencode($item_id);
}

//Asset 재고현황 페이지 링크 (asset_id 파라미터로 검색)
function asset_stock_link($asset_id){
	return '/_Admin_/goods/stock/asset_stock.php?asset_id='.urlencode($asset_id);
}

//회원 상세 링크
function member_link($m_no){
	return '/_Admin_/member/member_view.php?m_no='.urlencode($m_no);
}

//오더시스템별 재고체크 페이지 링크 (배송상품 item_id 기준). 링크 대상 없으면 '' 반환
function stock_check_link($order_system,$item_id){
	if($item_id===null || $item_id===''){ return ''; }
	switch($order_system){
		case '1':  return asset_stock_link($item_id);                                                       //Asset
		case '8':  return '/_Admin_/goods/vaultn/vaultn_catalogue.php?search_sku='.urlencode($item_id);      //Vaultn
		case '9':  return '/_Admin_/goods/genba/genba_product_sync.php?search_sku='.urlencode($item_id);     //Genba
		case '10': return '/_Admin_/goods/pointnexus/pointnexus_catalogue.php?keyword='.urlencode($item_id); //PointNexus
	}
	return ''; //Ztorm(2) 등은 재고체크 페이지 없음
}

/* ------- 표시(뱃지/포맷) 헬퍼 ------- */

//품절여부 badge (품절이면 뱃지, 아니면 빈 문자열)
function soldout_badge($soldout){
	if($soldout === 'Y'){
		return '<span class="badge bg-secondary">품절</span>';
	}
	return '';
}

//백분율 ($n/$d*100, 소수1자리. $d<=0이면 0)
function pct($n,$d){ return ($d>0) ? round($n/$d*100,1) : 0; }
?>
