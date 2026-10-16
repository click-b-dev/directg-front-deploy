<?php
class Main{
	private $_db;
	private $_goods;
	private $_promotion;
	
	//클래스 생성자
	public function __construct(PDO $conn){
		$this->_db = $conn;
		$this->_goods = new Goods($conn);
		$this->_promotion = new Promotion($conn);
	}
	
	//메인배너
	public function getMainBanner(){
		$main_banner = array();
		$query = "select t.* from (
	select banner_pc,banner_mobile,banner_link,banner_target,product_code,banner_sort,banner_start,banner_end,banner_publisher,type,banner_title, show_prod_info, show_sale_info from tbl_main_banner where is_del='N' AND flag='Y' and bannerPeriodOutputFl='N' 
	union all 
	select banner_pc,banner_mobile,banner_link,banner_target,product_code,banner_sort,banner_start,banner_end,banner_publisher,type,banner_title, show_prod_info, show_sale_info from tbl_main_banner where is_del='N' AND flag='Y' and bannerPeriodOutputFl='Y' and banner_start<UNIX_TIMESTAMP() and banner_end>UNIX_TIMESTAMP()
	)as t order by t.banner_sort asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$list['main_banner_pc'] = $value['banner_pc'];
			$list['main_banner_mobile'] = $value['banner_mobile'];
			$list['main_banner_publisher'] = $value['banner_publisher'];
			$list['main_banner_link'] = $value['banner_link'];
			$list['main_banner_target'] = $value['banner_target'];
			$list['main_banner_type'] = $value['type'];
			$list['banner_title'] = $value['banner_title'];
			if($value['product_code']>0){
				$list['title_info'] = $this->_goods->getGoodsOptionTitleInfo($value['product_code']);
				$list['option_info'] = $this->_goods->getGoodsItemDetail($value['product_code']);
			}

			$list['show_prod_info'] = $value['show_prod_info'];
			$list['show_sale_info'] = $value['show_sale_info'];
			
			array_push($main_banner,$list);
			unset($list);
		}

		return $main_banner;
	}

	public function getMainBanner2(){
		$main_banner = array();
		$query = "select t.* from (
	select banner_pc,banner_mobile,banner_link,banner_target,product_code,banner_sort,banner_start,banner_end,banner_publisher,type,show_prod_info, show_sale_info from tbl_main_banner where idx='20' 
	union all 
	select banner_pc,banner_mobile,banner_link,banner_target,product_code,banner_sort,banner_start,banner_end,banner_publisher,type,show_prod_info, show_sale_info from tbl_main_banner where flag='Y' and bannerPeriodOutputFl='Y' and banner_start<UNIX_TIMESTAMP() and banner_end>UNIX_TIMESTAMP()
	)as t order by t.banner_sort asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$list['main_banner_pc'] = $value['banner_pc'];
			$list['main_banner_mobile'] = $value['banner_mobile'];
			$list['main_banner_publisher'] = $value['banner_publisher'];
			$list['main_banner_link'] = $value['banner_link'];
			$list['main_banner_target'] = $value['banner_target'];
			$list['main_banner_type'] = $value['type'];
			if($value['product_code']>0){
				$list['title_info'] = $this->_goods->getGoodsOptionTitleInfo($value['product_code']);
				$list['option_info'] = $this->_goods->getGoodsItemDetail($value['product_code']);
			}

			$list['show_prod_info'] = $value['show_prod_info'];
			$list['show_sale_info'] = $value['show_sale_info'];
			
			array_push($main_banner,$list);
			unset($list);
		}
		return $main_banner;
	}
	
	//공지사항
	public function getNoticeMain($num){
		$notice_list = array();
		$query = "select idx,subject,deploy_date,notice_type from tbl_notice where is_view='Y' order by is_notice desc,deploy_date desc limit $num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$list['idx'] = $value['idx'];
			$list['subject'] = $value['subject'];
			$list['notice_type'] = $value['notice_type'];
			$list['deploy_date'] = $value['deploy_date'];
			array_push($notice_list,$list);
		}

		return $notice_list;
	}
	
	//추천 및 특집 목록
	public function getMainRecommand(){
		$main_recommand = array();
		$query = "select idx,recommand_name,recommand_banner,recommand_goods_1,recommand_goods_2,recommand_goods_3,recommand_goods_4,recommand_banner_link,recommand_banner_target from tbl_main_recommand where is_del='N' and is_view='Y' and recommand_start<UNIX_TIMESTAMP() and recommand_end>UNIX_TIMESTAMP() order by recommand_sort asc";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		
		foreach($data as $key=>$value){
			$list['idx'] = $value['idx'];
			$list['recommand_name'] = $value['recommand_name'];
			$list['recommand_banner'] = $value['recommand_banner'];
			$list['recommand_banner_link'] = $value['recommand_banner_link'];
			$list['recommand_banner_target'] = $value['recommand_banner_target'];
			
			if($value['recommand_goods_1']){
				$recommand_goods[$key]['0']=$this->_goods->getGoodsItemDetail($value['recommand_goods_1']);
			}
			if($value['recommand_goods_2']){
				$recommand_goods[$key]['1']=$this->_goods->getGoodsItemDetail($value['recommand_goods_2']);
			}
			
			if($value['recommand_goods_3']){
				$recommand_goods[$key]['2']=$this->_goods->getGoodsItemDetail($value['recommand_goods_3']);
			}
			
			if($value['recommand_goods_4']){
				$recommand_goods[$key]['3']=$this->_goods->getGoodsItemDetail($value['recommand_goods_4']);
			}
			
			$list['recommand_goods'] = $recommand_goods[$key];
			
			array_push($main_recommand,$list);
		}

		return $main_recommand;
	}
	
	//추천 및 특집 타이틀 정보
	public function getRecommandTitle($title_id){
		$recommand_data = array();
		$list = array();
		
		//타이틀 정보조회
		$query = "select * from tbl_goods where title_id=:title_id";
		$stmt = $this->_db->prepare($query);
		$params = array(
			":title_id"=>$title_id
		);
		$stmt->execute($params);
		$data = $stmt->fetch();
		
		$recommand_data["title_sku"] = $data['sku'];
		$recommand_data["title_name"] = $data['title_name'];
		$recommand_data["title_main_capsule"] = "/upload/title/".$title_id."/capsule/capsule_616x353.jpg";
		
		//dlc정보조회
		$option_query = "select b.* from tbl_title_option a inner join tbl_goods_item b on a.product_code=b.product_code where a.title_id=:title_id and b.status='0' and b.soldout<>'Y' and b.game_type='dlc' order by b.release_date desc limit 4";
		$stmt = $this->_db->prepare($option_query);
		$params = array(
			':title_id'=>$title_id
		);

		$stmt->execute($params);
		$option_data = $stmt->fetchAll();
		
		foreach($option_data as $key=>$value){
			$list['product_code'] = $value['product_code'];
			$list['product_name'] = $value['product_name'];
			$list['goods_sku'] = $value['goods_sku'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			$list['domain'] = $value['domain'];
			$list['product_img'] = "/upload/product/".$value['product_code']."/header/header.jpg";
			$list['goods_sku'] = $value['goods_sku'];
			$list['promotion']=$this->_promotion->getPromotionGoodsPrice($value['product_code']);
			$list['product_platform'] = $value['product_platform'];
			
			$recommand_data["title_dlc"][] = $list;
		}
		
		return $recommand_data;
	}
	
	//추천 및 특집 관련상품
	public function getRecommandGoods($product_code_array){
		$recommand_data = array();
		$list = array();
		
		$placeholders = implode(',', array_fill(0, count($product_code_array), '?'));
		
		//echo $placeholders;
		
		//추천관련 상품정보조회
		
		$option_query = "select * from tbl_goods_item where is_view='Y' and product_code in ($placeholders) order by release_date desc";
		$stmt = $this->_db->prepare($option_query);
		$stmt->execute($product_code_array);
		$option_data = $stmt->fetchAll();
		
		foreach($option_data as $key=>$value){
			$title_info = $this->_goods->getGoodsOptionTitleInfo($value['product_code']);
			$list['title_sku']= $title_info['sku'];
			$list['title_name']= $title_info['title_name'];
			$list['product_code'] = $value['product_code'];
			$list['product_name'] = $value['product_name'];
			$list['goods_sku'] = $value['goods_sku'];
			$list['status'] = $value['status'];
			$list['soldout'] = $value['soldout'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			$list['domain'] = $value['domain'];
			$list['product_img'] = "/upload/product/".$value['product_code']."/header/header.jpg";
			$list['promotion']=$this->_promotion->getPromotionGoodsPrice($value['product_code']);
			$list['game_type']=$value['game_type'];
			$list['display_type']=$value['display_type'];
			$list['spoken_korean']=$value['spoken_korean'];
			$list['interface_korean']=$value['interface_korean'];
			$list['exclusive_korean']=$value['exclusive_korean'];
			$list['is_bonus']=$value['is_bonus'];
			$list['is_preorder']=$value['is_preorder'];
			$list['delivery_type']=$value['delivery_type'];
			$list['product_platform']=$value['product_platform'];
			$list['is_naverpay_coupon']=$value['is_naverpay_coupon'];
			$recommand_data[] = $list;
		}
		
		
		return $recommand_data;
	}

	//인기타이틀 
	public function getBestTitle($list_num){
		$title_list = array();
		$list = array();
		
		//$sales_date = $this->getBestTitleConfig();

		$query = "select b.* from tbl_title_best a inner join tbl_goods b on a.title_id=b.title_id where b.sales_status='S' and b.is_view='Y' and a.ranking is not null order by a.ranking asc limit $list_num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		
		foreach($data as $key=>$value){
			$list['title_id'] =$value['title_id'];
			$list['title_name'] =$value['title_name'];
			$list['release_date'] =$value['release_date'];
			$list['domain'] =$value['domain'];
			$list['sku'] =$value['sku'];
			
			array_push($title_list,$list);
		}
		return $title_list;
	}
	
	//인기타이틀 최신집계설정
	public function getBestTitleConfig(){
		$query = "select max(sales_date) from tbl_best_title_config";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetch();
		
		$sales_date = array(
			"sales_year"=>substr($data['0'],0,4),
			"sales_month"=>substr($data['0'],4,2),
		);
		
		return $sales_date;
	}

	//인기게임
	public function getBestGame($list_num){
		$goods_list = array();
		$list = array();

		$query = "select a.title_id,a.title_name,a.title_name_en,a.publisher_code,a.release_date,a.domain,c.consumer_price,c.price,c.discount,a.sku from tbl_goods a inner join tbl_goods_option b on a.title_id=b.title_id inner join tbl_goods_item c on c.product_code=b.product_code inner join tbl_sales_ranking d on d.product_code=c.product_code where a.is_view='Y' and  a.release_date<date_format(now(),'%y-%m-%d') and c.status='0' and c.is_view='Y' and c.game_type='game' group by a.title_id order by d.total_count desc limit $list_num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$list['title_id'] =$value['title_id'];
			$list['title_name'] =$value['title_name'];
			$list['title_name_en'] =$value['title_name_en'];
			$list['publisher_code'] =$value['publisher_code'];
			$list['publisher'] =$this->_goods->getPublisher($value['publisher_code']);
			$list['release_date'] =$value['release_date'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			//$list['price_info'] =$this->_goods->getBasicGamePrice($value['title_id']);
			$list['domain'] =$value['domain'];
			$list['sku'] =$value['sku'];
			array_push($goods_list,$list);
		}
		return $goods_list;
	}

	//신규게임목록
	public function getNewGame($list_num){
		$goods_list = array();
		$list = array();
		$promotion_data = array();

		$query = "select a.title_id,a.sku,c.publisher_code,c.release_date,c.consumer_price,c.price,c.discount,c.product_platform,c.goods_sku,c.product_name,c.is_bonus,c.is_preorder,c.product_code,c.game_type,c.delivery_type,c.display_type,c.domain,c.is_preorder,c.spoken_korean,c.interface_korean,c.exclusive_korean,c.soldout,c.is_naverpay_coupon from tbl_goods a inner join tbl_title_option b on a.title_id=b.title_id inner join tbl_goods_item c on b.product_code=c.product_code where c.is_view='Y' and c.status='0' and c.game_type='game' and c.display_type='basic' order by c.idx desc limit $list_num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$list['title_id'] =$value['title_id'];
			$list['sku'] =$value['sku'];
			$list['product_name'] =$value['product_name'];
			$list['publisher_code'] =$value['publisher_code'];
			$list['publisher'] =$this->_goods->getPublisher($value['publisher_code']);
			$list['release_date'] =$value['release_date'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			$list['platform_code'] =$value['product_platform'];
			$list['product_platform'] =$value['product_platform'];
			$list['domain'] =$value['domain'];
			$list['goods_sku'] =$value['goods_sku'];
			$list['is_bonus'] =$value['is_bonus'];
			$list['is_preorder'] =$value['is_preorder'];
			$list['promotion']=$this->_promotion->getPromotionGoodsPrice($value['product_code']);
			$list['game_type'] =$value['game_type'];
			$list['delivery_type'] =$value['delivery_type'];
			$list['spoken_korean'] =$value['spoken_korean'];
			$list['interface_korean'] =$value['interface_korean'];
			$list['exclusive_korean'] =$value['exclusive_korean'];
			$list['product_code'] =$value['product_code'];
			$list['display_type'] =$value['display_type'];
			$list['is_naverpay_coupon'] =$value['is_naverpay_coupon'];
			$list['soldout'] =$value['soldout'];
			
			array_push($goods_list,$list);
		}
		return $goods_list;
	}

	//음성 한국어지원
	public function getGoodsSpokenKorean($list_num){
		$goods_list = array();
		$list = array();
			
		$query = "select a.title_id,a.sku,a.title_name,a.title_name_en,a.publisher_code,a.release_date,c.domain,c.goods_sku,c.consumer_price,c.price,c.discount,a.interface_korean,a.spoken_korean,a.exclusive_korean,c.game_type,c.bundle_type,c.is_bonus,c.product_code,c.product_name,c.delivery_type,c.display_type,c.product_platform,c.soldout,c.is_naverpay_coupon,c.is_preorder from tbl_goods a inner join tbl_title_option b on a.title_id=b.title_id inner join tbl_goods_item c on c.product_code=b.product_code where a.is_view='Y' and  a.release_date<date_format(now(),'%y-%m-%d') and c.status='0' and c.is_view='Y' and a.spoken_korean='Y' group by a.title_id order by a.release_date desc limit $list_num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$title_info = $this->_goods->getGoodsOptionTitleInfo($value['product_code']);
			$list['sku'] =$title_info['sku'];
			$list['title_id'] =$value['title_id'];
			$list['title_name'] =$value['title_name'];
			$list['title_name_en'] =$value['title_name_en'];
			$list['publisher_code'] =$value['publisher_code'];
			$list['publisher'] =$this->_goods->getPublisher($value['publisher_code']);
			$list['release_date'] =$value['release_date'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			$list['promotion']=$this->_promotion->getPromotionGoodsPrice($value['product_code']);
			$list['spoken_korean'] =$value['spoken_korean'];
			$list['interface_korean'] =$value['interface_korean'];
			$list['exclusive_korean'] =$value['exclusive_korean'];
			$list['game_type'] =$value['game_type'];
			$list['bundle_type'] =$value['bundle_type'];
			$list['domain'] =$value['domain'];
			$list['is_bonus'] =$value['is_bonus'];
			$list['product_code'] =$value['product_code'];
			$list['product_name'] =$value['product_name'];
			$list['delivery_type'] =$value['delivery_type'];
			$list['display_type'] =$value['display_type'];
			$list['product_platform'] =$value['product_platform'];
			$list['is_naverpay_coupon'] =$value['is_naverpay_coupon'];
			$list['soldout'] =$value['soldout'];
			$list['is_preorder'] =$value['is_preorder'];
			$list['goods_sku'] =$value['goods_sku'];

			array_push($goods_list,$list);
		}
		return $goods_list;
	}

	//독점 한국어지원
	public function getGoodsExclusiveKorean($list_num){
		$goods_list = array();
		$list = array();

		$query = "select a.title_id,a.sku,a.title_name,a.title_name_en,a.publisher_code,a.release_date,c.domain,c.goods_sku,c.consumer_price,c.price,c.discount,a.interface_korean,a.spoken_korean,a.exclusive_korean,c.game_type,c.bundle_type,c.is_bonus,c.product_code,c.product_name,c.delivery_type,c.display_type,c.product_platform,c.soldout,c.is_naverpay_coupon from tbl_goods a inner join tbl_title_option b on a.title_id=b.title_id inner join tbl_goods_item c on c.product_code=b.product_code where a.is_view='Y' and  a.release_date<date_format(now(),'%y-%m-%d') and c.status='0' and c.is_view='Y' and a.exclusive_korean='Y' group by a.title_id order by a.release_date desc limit $list_num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$list['sku'] =$value['sku'];
			$list['title_id'] =$value['title_id'];
			$list['title_name'] =$value['title_name'];
			$list['title_name_en'] =$value['title_name_en'];
			$list['publisher_code'] =$value['publisher_code'];
			$list['publisher'] =$this->_goods->getPublisher($value['publisher_code']);
			$list['release_date'] =$value['release_date'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			$list['spoken_korean'] =$value['spoken_korean'];
			$list['interface_korean'] =$value['interface_korean'];
			$list['exclusive_korean'] =$value['exclusive_korean'];
			$list['game_type'] =$value['game_type'];
			$list['bundle_type'] =$value['bundle_type'];
			$list['domain'] =$value['domain'];
			$list['promotion']=$this->_promotion->getPromotionGoodsPrice($value['product_code']);
			$list['is_bonus'] =$value['is_bonus'];
			$list['product_code'] =$value['product_code'];
			$list['product_name'] =$value['product_name'];
			$list['delivery_type'] =$value['delivery_type'];
			$list['display_type'] =$value['display_type'];
			$list['product_platform'] =$value['product_platform'];
			$list['is_naverpay_coupon'] =$value['is_naverpay_coupon'];
			$list['goods_sku'] =$value['goods_sku'];
			$list['soldout'] =$value['soldout'];
			array_push($goods_list,$list);
		}
		return $goods_list;
	}

	public function getGoodsKorean($list_num){
		$goods_list = array();
		$list = array();

		$query = "select a.title_id,a.sku,a.title_name,a.title_name_en,a.publisher_code,a.release_date,a.domain,c.consumer_price,c.price,c.discount,a.interface_korean,a.spoken_korean,a.exclusive_korean,c.soldout,c.is_naverpay_coupon from tbl_goods a inner join tbl_title_option b on a.title_id=b.title_id inner join tbl_goods_item c on c.product_code=b.product_code where a.is_view='Y' and  a.release_date<date_format(now(),'%y-%m-%d') and c.status='0' and c.is_view='Y' and find_in_set(c.product_type,'1') and (a.interface_korean='Y' or a.spoken_korean='Y') group by a.title_id order by a.release_date desc limit $list_num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$list['sku'] =$value['sku'];
			$list['title_id'] =$value['title_id'];
			$list['title_name'] =$value['title_name'];
			$list['title_name_en'] =$value['title_name_en'];
			$list['publisher_code'] =$value['publisher_code'];
			$list['publisher'] =$this->_goods->getPublisher($value['publisher_code']);
			$list['release_date'] =$value['release_date'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			//$list['price_info'] =$this->_goods->getBasicGamePrice($value['title_id']);
			$list['spoken_korean'] =$value['spoken_korean'];
			$list['interface_korean'] =$value['interface_korean'];
			$list['exclusive_korean'] =$value['exclusive_korean'];
			$list['domain'] =$value['domain'];
			$list['is_naverpay_coupon'] =$value['is_naverpay_coupon'];
			$list['soldout'] =$value['soldout'];
			array_push($goods_list,$list);
		}
		return $goods_list;
	}


	//예약판매
	public function getGoodsPreorder($list_num){
		$goods_list = array();
		$list = array();

		$query = "select product_code,product_name,consumer_price,price,discount,domain,goods_sku,game_type,release_date,is_preorder,is_bonus,delivery_type,spoken_korean,interface_korean,exclusive_korean,display_type,product_platform,is_naverpay_coupon,soldout from tbl_goods_item where is_view='Y' and is_preorder='Y' and status='0' and find_in_set(game_type,'game,dlc') and find_in_set(display_type,'basic,dlc') order by release_date asc  limit $list_num";
		$stmt = $this->_db->prepare($query);
		$stmt->execute();
		$data = $stmt->fetchAll();
		foreach($data as $key=>$value){
			$title_info = $this->_goods->getGoodsOptionTitleInfo($value['product_code']);
			$list['sku'] =$title_info['sku'];
			$list['product_code'] =$value['product_code'];
			$list['product_name'] =$value['product_name'];
			$list['release_date'] =$value['release_date'];
			$list['consumer_price'] =$value['consumer_price'];
			$list['price'] =$value['price'];
			$list['discount'] =$value['discount'];
			//$list['price_info'] =$this->_goods->getBasicGamePrice($value['title_id']);
			$list['domain'] =$value['domain'];
			$list['goods_sku'] =$value['goods_sku'];
			$list['game_type'] =$value['game_type'];
			$list['is_preorder'] =$value['is_preorder'];
			$list['is_bonus'] =$value['is_bonus'];
			$list['spoken_korean'] =$value['spoken_korean'];
			$list['interface_korean'] =$value['interface_korean'];
			$list['exclusive_korean'] =$value['exclusive_korean'];
			$list['display_type'] =$value['display_type'];
			$list['promotion']=$this->_promotion->getPromotionGoodsPrice($value['product_code']);
			$list['delivery_type'] =$value['delivery_type'];
			$list['product_platform'] =$value['product_platform'];
			$list['is_naverpay_coupon'] =$value['is_naverpay_coupon'];
			$list['soldout'] =$value['soldout'];
			
			
			array_push($goods_list,$list);
		}
		return $goods_list;
	}

	//기타배너

	//클래스 소멸자
	public function __destruct() {
		$this->_db=null;
		$this->_goods=null;
		$this->_promotion=null;
	}
}
?>