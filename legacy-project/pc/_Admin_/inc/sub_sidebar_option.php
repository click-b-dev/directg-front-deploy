<div class="nav flex-column nav-pills bg-nav-pills mb-2" id="v-pills-tab"aria-orientation="vertical">
	<a class="nav-link <?=$sub_sidebar_option['view']?> rounded-0 fw-500"  href="goods_option_view.php?product_code=<?=$product_code?>">
		<i class="mdi mdi-home-variant d-md-none d-block"></i>
		<span class="d-none d-md-block">상세보기</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_option['modify']?> rounded-0 fw-500"  href="goods_option_modify.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">기본정보 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_option['genre']?> rounded-0 fw-500"  href="goods_option_genre_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">장르 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_option['category']?> rounded-0 fw-500"  href="goods_option_category_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">카테고리 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_option['image']?> rounded-0 fw-500" href="goods_option_image_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">이미지 설정</span>
	</a>
	<?if($goods_option_data['game_type']=="dlc" || $goods_option_data['game_type']=="accessories"){?>
	<a class="nav-link <?=$sub_sidebar_option['screenshot']?> rounded-0 fw-500" href="goods_option_screenshot_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">옵션상품 스크린샷 설정</span>
	</a>
	<?}?>
	<a class="nav-link <?=$sub_sidebar_option['sales']?> rounded-0 fw-500" href="goods_option_sales_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">판매 설정</span>
	</a>
	<!-- <a class="nav-link <?=$sub_sidebar_option['description']?> rounded-0 fw-500" href="goods_option_description_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">상세설명 설정</span>
	</a> -->
		<a class="nav-link <?=$sub_sidebar_option['description_v2']?> rounded-0 fw-500" href="goods_option_description_register_v2.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">상세설명 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_option['package']?> rounded-0 fw-500" href="goods_option_package_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">구성정보 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_option['tag']?> rounded-0 fw-500" href="goods_option_tag_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">태그 설정</span>
	</a>
	<a class="nav-link <?=$sub_sidebar_option['repay']?> rounded-0 fw-500" href="goods_option_repay_register.php?product_code=<?=$product_code?>" >
		<i class="mdi mdi-account-circle d-md-none d-block"></i>
		<span class="d-none d-md-block">포인트 설정</span>
	</a>
</div>