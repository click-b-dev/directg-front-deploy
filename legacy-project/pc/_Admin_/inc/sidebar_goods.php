<?php
	if($_SESSION['admin']['admin_level']=="1"){
		$product_viewer=true;
	} else {
		$product_viewer=false;
	}
?>

<link rel="stylesheet" href="https://icons.getbootstrap.kr/assets/font/bootstrap-icons.css">
<div class="leftside-menu">
	<!-- LOGO -->
<?php
	if($product_viewer){
?>
	<a href="#" class="logo text-center logo-light">
		<span class="logo-lg">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
		<span class="logo-sm">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
	</a>
<?php
	} else {
?>
	<a href="/_Admin_/main.php" class="logo text-center logo-light">
		<span class="logo-lg">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
		<span class="logo-sm">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
	</a>
<?php		
	}
?>	 
	<div class="h-100" id="leftside-menu-container" data-simplebar>
		<!--- Sidemenu -->
		<ul class="side-nav">
			<li class="side-nav-item">
				<a href="<?=$document_root?>/goods/dashboard_goods.php" class="side-nav-link">
					<i class="uil uil-dashboard font-22"></i>
					<span> 상품 대시보드 </span>
				</a>
			</li>
<?php
	if($product_viewer){
?>
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarTitle" aria-expanded="true" aria-controls="sidebarTitle" class="side-nav-link">
					<i class="uil-store"></i>
					<span>대표상품 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarTitle">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/title_list.php">디지털상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/accessories_list.php">실물상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/title_grac_chk.php">심의정보 등록확인</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarTitleImage" aria-expanded="true" aria-controls="sidebarTitleImage" class="side-nav-link">
					<i class="uil-store"></i>
					<span>대표상품 이미지 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarTitleImage">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/title_image_header_chk.php">Header 관리</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/title_image_small_capsule_chk.php">(미사용) Small capsule 관리</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/title_image_library_capsule_chk.php">Library capsule 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/title_image_vertical_capsule_chk.php">Vertical capsule 관리</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGoodsItem" aria-expanded="true" aria-controls="sidebarGoodsItem" class="side-nav-link">
					<i class="uil-store"></i>
					<span>옵션상품 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGoodsItem">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/goods_option_list.php">옵션상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_etc_list.php">실물상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_holomodels_list.php">홀로모델 옵션상품</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_option_end.php">판매종료 옵션상품</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGoodsOptionImage" aria-expanded="true" aria-controls="sidebarGoodsOptionImage" class="side-nav-link">
					<i class="uil-store"></i>
					<span>옵션상품 이미지 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGoodsOptionImage">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/goods_option_image_chk.php">Header 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_option_screenshot_chk.php">DLC 스크린샷 관리</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarSupply" aria-expanded="true" aria-controls="sidebarSupply" class="side-nav-link">
					<i class="uil-store"></i>
					<span>제공컨텐츠 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarSupply">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/supply_content.php">제공컨텐츠  현황</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/supply_content_register.php">제공 컨텐츠 등록</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/supply_content_member.php">회원별 제공 컨텐츠 조회</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPatch" aria-expanded="true" aria-controls="sidebarPatch" class="side-nav-link">
					<i class="uil-store"></i>
					<span>한글패치 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarPatch">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/korean_patch_auth.php">한글패치 인증정보 확인</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGrac" aria-expanded="true" aria-controls="sidebarGrac" class="side-nav-link">
					<i class="uil-store"></i>
					<span>심의정보 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGrac">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/grac/grac_list.php">심의정보 현황</a>
						</li>
					</ul>
				</div>
			</li>
			



			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarTag" aria-expanded="true" aria-controls="sidebarTag" class="side-nav-link">
					<i class="uil-store"></i>
					<span>TAG 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarTag">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/tag/tag_group_list.php">TAG 그룹현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/tag/tag_group_setting.php">TAG 그룹설정</a>
						</li>
					</ul>
				</div>
			</li>


			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarCode" aria-expanded="true" aria-controls="sidebarCode" class="side-nav-link">
					<i class="uil-store"></i>
					<span>코드 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarCode">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/code/platform_list.php">플랫폼 설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/code/publisher_list.php">공급처 설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/code/delivery_method.php">배송방법 설정</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGroup" aria-expanded="true" aria-controls="sidebarGroup" class="side-nav-link">
					<i class="uil-store"></i>
					<span>그룹 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGroup">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/group/group_list.php">그룹 현황</a>
						</li>
					</ul>
				</div>
			</li>
<?php
	} else {
?>
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarTitle" aria-expanded="true" aria-controls="sidebarTitle" class="side-nav-link">
					<i class="uil-store"></i>
					<span>대표상품 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarTitle">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/title_list.php">디지털상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/accessories_list.php">실물상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/title_grac_chk.php">심의정보 등록확인</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarTitleImage" aria-expanded="true" aria-controls="sidebarTitleImage" class="side-nav-link">
					<i class="uil-store"></i>
					<span>대표상품 이미지 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarTitleImage">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/title_image_header_chk.php">Header 관리</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/title_image_small_capsule_chk.php">(미사용) Small capsule 관리</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/title_image_library_capsule_chk.php">Library capsule 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/title_image_vertical_capsule_chk.php">Vertical capsule 관리</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGoodsItem" aria-expanded="true" aria-controls="sidebarGoodsItem" class="side-nav-link">
					<i class="uil-store"></i>
					<span>옵션상품 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGoodsItem">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/goods_option_list.php">옵션상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_etc_list.php">실물상품 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_holomodels_list.php">홀로모델 옵션상품</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_randombox_list.php">[X] Randombox 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_timedeal_list.php">[타임딜] 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_option_end.php">판매종료 옵션상품</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGoodsOptionImage" aria-expanded="true" aria-controls="sidebarGoodsOptionImage" class="side-nav-link">
					<i class="uil-store"></i>
					<span>옵션상품 이미지 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGoodsOptionImage">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/goods_option_image_chk.php">Header 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/goods_option_screenshot_chk.php">DLC 스크린샷 관리</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarSupply" aria-expanded="true" aria-controls="sidebarSupply" class="side-nav-link">
					<i class="uil-store"></i>
					<span>제공컨텐츠 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarSupply">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/supply_content.php">제공컨텐츠  현황</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/supply_content_register.php">제공 컨텐츠 등록</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/supply_content_member.php">회원별 제공 컨텐츠 조회</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/supply_content_download.php">제공컨텐츠 다운로드 현황</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPatch" aria-expanded="true" aria-controls="sidebarPatch" class="side-nav-link">
					<i class="uil-store"></i>
					<span>한글패치 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarPatch">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/korean_patch.php">한글패치 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/korean_patch_auth.php">한글패치 인증정보 확인</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGrac" aria-expanded="true" aria-controls="sidebarGrac" class="side-nav-link">
					<i class="uil-store"></i>
					<span>심의정보 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGrac">
					<ul class="side-nav-second-level">
						<!--
						<li>
							<a href="<?=$document_root?>/goods/grac/grac_batch.php">심의정보 동기화</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/grac/grac_list.php">심의정보 현황</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/grac/grac_register.php">심의정보 등록</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarYoutube" aria-expanded="true" aria-controls="sidebarYoutube" class="side-nav-link">
					<i class="bi bi-youtube"></i>
					<span>Youtube 동영상 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarYoutube">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/youtube/youtube_channel_list.php">Youtube 채널 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/youtube/youtube_video_list.php">Youtube 비디오 현황</a>
						</li>
					</ul>
				</div>
			</li>
			-->

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarSteam" aria-expanded="true" aria-controls="sidebarSteam" class="side-nav-link">
					<i class="bi bi-steam"></i>
					<span>Steam API </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarSteam">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/steam/steam_apps_list.php">스팀 Apps 검색</a>
						</li>
						<li>
							<a href="<?=$document_root?>/steam/steam_game_list.php">스팀 Game 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/steam/steam_dlc_list.php">스팀 DLC 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/steam/steam_package_list.php">스팀 Package 현황</a>
						</li>
						
						<li>
							<a href="<?=$document_root?>/steam/steam_review_list.php">스팀 평가 현황</a>
						</li>
						<!--<li>
							<a href="<?=$document_root?>/goods/steam_music_list.php">스팀 Music 현황</a>
						</li>-->
						<!--
						<li>
							<a href="<?=$document_root?>/steam/steam_tag_list.php">스팀 Tag 동기화</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/steam/steam_apps_list_all.php">스팀 Apps list</a>
						</li>
						<li>
							<a href="<?=$document_root?>/steam/steam_apps_comingsoon.php">스팀 Apps 출시예정작</a>
						</li>
						<li>
							<a href="<?=$document_root?>/steam/steam_apps_ranking.php">스팀 Apps 추천수 순위</a>
						</li>
					</ul>
				</div>
			</li>
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarZtorm" aria-expanded="true" aria-controls="sidebarZtorm" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Ztorm API</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarZtorm">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/ztorm/ztorm_ping.php">Ztorm 연결확인</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/ztorm/ztorm_publisher_list.php">Ztorm 퍼블리셔 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/ztorm/ztorm_catalogue.php">Ztorm 카탈로그 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/ztorm/ztorm_promotion.php">Ztorm 프로모션 현황</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGenba" aria-expanded="true" aria-controls="sidebarGenba" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Genba API</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGenba">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/genba/genba_ping.php">Genba 연결확인</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/genba/genba_cert.php">Genba 인증서 관리</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/genba/genba_publisher.php">Genba 퍼블리셔 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/genba/genba_title.php">Genba 타이틀 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/genba/genba_product_sync.php">Genba 카탈로그 현황</a>
						</li>
						<!--<li>
							<a href="<?=$document_root?>/goods/genba/genba_price_sync.php">Genba 가격 관리</a>
						</li>-->
						<li>
							<a href="<?=$document_root?>/goods/genba/genba_promotion_sync.php">Genba 프로모션 관리</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarVaultn" aria-expanded="true" aria-controls="sidebarVaultn" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Vaultn API</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarVaultn">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/vaultn/vaultn_ping.php">Vaultn 연결확인</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/vaultn/vaultn_cert.php">Vaultn 인증서 관리</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/vaultn/vaultn_connection.php">Valutn 퍼블리셔 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/vaultn/vaultn_catalogue.php">Valutn 카탈로그 현황</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/vaultn/vaultn_promotion.php">Valutn 프로모션 현황</a>
						</li>
						-->
					<!--	<li>
							<a href="<?=$document_root?>/goods/vaultn/vaultn_order.php">Valutn Order</a>
						</li>-->
						<!--
						<li>
							<a href="<?=$document_root?>/goods/vaultn/vaultn_stock.php">Valutn 재고현황</a>
						</li>
						-->
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPointNexus" aria-expanded="true" aria-controls="sidebarPointNexus" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>PointNexus API</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarPointNexus">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_ping.php">PointNexus 연결확인</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_catalogue.php">PointNexus Catalogue 조회</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_catalogue_sync.php">PointNexus Catalogue 동기화</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_product_type.php">PointNexus 상품타입 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_product.php">PointNexus 상품 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_partner.php">PointNexus 파트너 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_capsule.php">PointNexus 캡슐 조회</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_book_confirm.php">PointNexus Book Confirm</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_cancel_verify.php">PointNexus 취소 검증(cancel_pending)</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_activity_log.php">PointNexus 활동로그</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_promo.php">PointNexus 프로모션 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/goods/pointnexus/pointnexus_operation.php">PointNexus 조회</a>
						</li>
					</ul>
				</div>
			</li>

			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarEpic" aria-expanded="true" aria-controls="sidebarEpic" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>Epic API</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarEpic">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/epic/epic_stock_list.php">판매가능 상품현황</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPublisher" aria-expanded="true" aria-controls="sidebarPublisher" class="side-nav-link">
					<i class="uil-store"></i>
					<span>공급처 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarPublisher">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/publisher/publisher_list.php">공급처 코드관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/publisher/publisher_account_list.php">공급처 계정관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/publisher/publisher_pg_fee.php">공급처 PG수수료관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/publisher/publisher_email.php">공급처 알림 주소록</a>
						</li>
					</ul>
				</div>
			</li>
			
			-->


			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarTag" aria-expanded="true" aria-controls="sidebarTag" class="side-nav-link">
					<i class="uil-store"></i>
					<span>TAG 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarTag">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/tag/tag_group_list.php">TAG 그룹현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/tag/tag_group_setting.php">TAG 그룹설정</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/tag/tag_title_count.php">TAG별 대표상품현황</a>
						</li>-->
					</ul>
				</div>
			</li>


			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarCode" aria-expanded="true" aria-controls="sidebarCode" class="side-nav-link">
					<i class="uil-store"></i>
					<span>코드 관리 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarCode">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/code/platform_list.php">플랫폼 설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/code/publisher_list.php">공급처 설정</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/code/category_list.php">카테고리 설정</a>
						</li>
						-->
						<li>
							<a href="<?=$document_root?>/code/delivery_method.php">배송방법 설정</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/code/genre_list.php">게임장르 현황</a>
						</li>
						<li>
							<a href="<?=$document_root?>/code/category_list.php">카테고리 현황</a>
						</li>
						-->
						<!--
						<li>
							<a href="<?=$document_root?>/code/franchise_list.php">프랜차이즈 현황</a>
						</li>
						-->
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarGroup" aria-expanded="true" aria-controls="sidebarGroup" class="side-nav-link">
					<i class="uil-store"></i>
					<span>그룹 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse" id="sidebarGroup">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/goods/group/group_list.php">그룹 현황</a>
						</li>
					</ul>
				</div>
			</li>
<?php
	}
?>
		</ul>

		<!-- End Sidebar -->

		<div class="clearfix"></div>

	</div>
	<!-- Sidebar -left -->

</div>