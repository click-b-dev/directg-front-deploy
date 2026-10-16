<style>
.side-nav .side-nav-link{
	padding-left:20px;
}

.side-nav-second-level li a{
	padding-left:40px;
}
</style>

<div class="leftside-menu">
	<!-- LOGO -->
	<a href="/_Admin_/main.php" class="logo text-center logo-light">
		<span class="logo-lg">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
		<span class="logo-sm">
			<img src="<?=$document_root?>/assets/images/H2_DG_BI_nm_160x37.png" alt="로고" >
		</span>
	</a>

	<div class="h-100" id="leftside-menu-container" data-simplebar>
		<!--- Sidemenu -->
		<ul class="side-nav">
			<li class="side-nav-item">
				<a href="<?=$document_root?>/promotion/dashboard_promotion.php" class="side-nav-link">
					<i class="uil uil-dashboard font-22"></i>
					<span> 프로모션 대시보드 </span>
				</a>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPromotion" aria-expanded="true" aria-controls="sidebarPromotion" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>할인 프로모션 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPromotion">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/promotion/promotion_ready.php">승인대기 할인 프로모션</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/promotion_ing.php">진행중인 할인 프로모션</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/promotion_upcoming.php">진행예정 할인 프로모션</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/promotion_end.php">종료된 할인 프로모션</a>
						</li>
						<!--
						<li>
							<a href="<?=$document_root?>/promotion/promotion_register.php">할인 프로모션 등록</a>
						</li>
						-->
						<!--
						<li>
							<a href="<?=$document_root?>/promotion/promotion_list.php">프로모션 동기화</a>
						</li>
						-->
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPromotionWeekend" aria-expanded="true" aria-controls="sidebarPromotionWeekend" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>주말특가 프로모션 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPromotionWeekend">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/promotion/promotion_weekend.php">주말특가 프로모션 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/promotion_weekend_register.php">주말특가 프로모션 등록</a>
						</li>
					</ul>
				</div>
			</li>
			
			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarPromotionSeason" aria-expanded="true" aria-controls="sidebarPromotionSeason" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>대규모 프로모션 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarPromotionSeason">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/promotion/promotion_season.php">대규모 프로모션 목록</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/promotion_season_register.php">대규모 프로모션 등록</a>
						</li>
					</ul>
				</div>
			</li>

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarTimedeal" aria-expanded="true" aria-controls="sidebarTimedeal" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>타임딜 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarTimedeal">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/promotion/timedeal_list.php">[X] 타임딜 현황</a>
						</li>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/timedeal_register.php">[X] 타임딜 등록</a>
						</li>
					</ul>
				</div>
			</li>

	<!--		<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarCoupon" aria-expanded="true" aria-controls="sidebarCoupon" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>쿠폰 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarCoupon">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/promotion/coupon_config.php">쿠폰 기본설정</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/coupon_list.php">쿠폰 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/coupon_register.php">쿠폰 등록</a>
						</li>
					</ul>
				</div>
			</li>-->

			<li class="side-nav-item">
				<a data-bs-toggle="collapse" href="#sidebarCouponOffline" aria-expanded="true" aria-controls="sidebarCouponOffline" class="side-nav-link">
					<i class="uil-shop"></i>
					<span>오프라인 쿠폰 관리</span>
					<span class="menu-arrow"></span>
				</a>
				<div class="collapse show" id="sidebarCouponOffline">
					<ul class="side-nav-second-level">
						<li>
							<a href="<?=$document_root?>/promotion/offline_coupon_list.php">오프라인 쿠폰 리스트</a>
						</li>
						<li>
							<a href="<?=$document_root?>/promotion/offline_coupon_register.php">오프라인 쿠폰 등록</a>
						</li>
						<li class="d-none">
							<a href="<?=$document_root?>/promotion/offline_coupon_view.php">오프라인 쿠폰 상세</a>
						</li>
					</ul>
				</div>
			</li>

		</ul>
	</div>
</div>