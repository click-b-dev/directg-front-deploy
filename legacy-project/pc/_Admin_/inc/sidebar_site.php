<link rel="stylesheet" href="https://icons.getbootstrap.kr/assets/font/bootstrap-icons.css">
<div class="leftside-menu">
	<!-- LOGO -->
	<a href="<?=$document_root?>/main.php" class="logo text-center logo-light">
		<span class="logo-lg">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="">
		</span>
		<span class="logo-sm">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="">
		</span>
	</a>

	<div class="h-100 border-secondary" id="leftside-menu-container" data-simplebar>
		<!--- Sidemenu -->
		<ul class="side-nav">
			<li class="side-nav-item">
				<a href="<?=$document_root?>/site/dg_operation_service.php" class="side-nav-link">
					<i class="uil uil-dashboard font-22"></i>
					<span>운영서비스 현황 </span>
				</a>
			</li>
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarSite" aria-expanded="true" aria-controls="sidebarSite" class="side-nav-link">
					<i class="uil uil-image font-22"></i>
					<span>사이트 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarSite">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/site/banner_list.php">메인배너 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/site/main_recommand.php">추천 및 특집 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/site/search_recommand.php">추천 검색어 관리</a>
						</li>
						<li>
							<a href="#">[X] 기획배너 관리</a>
						</li>
						<li>
							<a href="#">[X] 인기 게임 관리</a>
						</li>
					</ul>
				</div>
			</li>
			<?
				//관리자 계정 관리 — 최고관리자(99)에게만 메뉴를 노출한다.
				//페이지·처리 파일에서도 각각 권한을 다시 확인하므로 메뉴를 숨기는 것만으로 의존하지 않는다.
				if($_SESSION['admin']['admin_level']=="99"){
			?>
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarAdminAuth" aria-expanded="true" aria-controls="sidebarAdminAuth" class="side-nav-link">
					<i class="uil uil-users-alt font-22"></i>
					<span>권한 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarAdminAuth">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/site/admin_list.php">관리자 계정 관리</a>
						</li>
					</ul>
				</div>
			</li>
			<?
				}
			?>
			
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPolicyBasic" aria-expanded="true" aria-controls="sidebarPolicyBasic" class="side-nav-link">
					<i class="uil-store"></i>
					<span> 기본정책 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPolicyBasic">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/policy/basic/base_info.php">기본정보 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/basic/base_agreement.php">이용약관 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/basic/base_private.php">개인정보처리방침 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/basic/base_refund.php">환불정책 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/basic/base_youth.php">청소년보호정책 관리</a>
						</li>
							<li>
							<a href="<?=$document_root?>/policy/basic/base_guide_info.php">안내문구 관리</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPolicySystem" aria-expanded="true" aria-controls="sidebarPolicySystem" class="side-nav-link">
					<i class="uil-store"></i>
					<span> 시스템관리정책 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPolicySystem">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/policy/system/admin_list.php">운영자 계정 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/system/auth_list.php">운영자 사용권한 관리</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/system/menu_list.php">시스템 메뉴권한 관리</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPolicyGoods" aria-expanded="true" aria-controls="sidebarPolicyGoods" class="side-nav-link">
					<i class="uil-store"></i>
					<span> 상품관리정책 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPolicyGoods">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/policy/goods/goods_images_config.php">상품이미지 설정</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPolicyMember" aria-expanded="true" aria-controls="sidebarPolicyMember" class="side-nav-link">
					<i class="uil-store"></i>
					<span> 회원관리정책 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPolicyMember">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/policy/member/member_sleep_config.php">휴면 회원 정책 설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/member/join_auth_config.php">이메일 가입인증 유효기간</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/member/join_domain_config.php">회원가입 가능도메인</a>
						</li>
					</ul>
				</div>
			</li>
			-->
			<!--
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPolicyOrder" aria-expanded="true" aria-controls="sidebarPolicyOrder" class="side-nav-link">
					<i class="uil-store"></i>
					<span> 주문관리정책 </span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPolicyOrder">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/policy/order/order_setting.php">주문 설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/order/cart_setting.php">장바구니 설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/order/wishlist_setting.php">위시리스트 설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/policy/order/point_setting.php">포인트 설정</a>
						</li>
					</ul>
				</div>
			</li>
			-->
		</ul>

		<!-- End Sidebar -->

		<div class="clearfix"></div>

	</div>
	<!-- Sidebar -left -->

</div>