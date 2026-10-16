	const countDownTimer = function (id, date) {
		var _vDate = new Date(date); // 전달 받은 일자
		var _second = 1000;
		var _minute = _second * 60;
		var _hour = _minute * 60;
		var _day = _hour * 24;
		var timer;

		function showRemaining() {
			var now = new Date();
			var distDt = _vDate - now;

			if (distDt < 0) {
				clearInterval(timer);
				document.getElementById(id).textContent = '프로모션 종료';
				//location.reload();
				return;
			}

			var days = Math.floor(distDt / _day);
			var hours = Math.floor((distDt % _day) / _hour);
			var minutes = Math.floor((distDt % _hour) / _minute);
			var seconds = Math.floor((distDt % _minute) / _second);

			document.getElementById("promotion_timer_hour").textContent = (days*24)+hours;
			document.getElementById("promotion_timer_minute").textContent = minutes.toString().length<2?'0'+minutes:minutes;
			document.getElementById("promotion_timer_second").textContent = seconds.toString().length<2?'0'+seconds:seconds;
		}

		timer = setInterval(showRemaining, 1000);
	}

	var promotion_end = "<?=$goods_product_chk['promotion_end']?>";

	if(promotion_end){
		countDownTimer('promotion_timer', promotion_end); // 2024년 4월 1일까지
	}

(function($) {
	$.timer_lib = {
		id:null,
		_vDate : null,
		_second : null,
		_minute : null,
		_hour : null,
		_day : null,
		timer : null,

		initialize : function(id,end_date){
			$.timer_lib.id=id;
			$.timer_lib._vDate = new Date(end_date);
			$.timer_lib._second = 1000;
			$.timer_lib._minute = $.timer_lib._second * 60;
			$.timer_lib._hour = $.timer_lib._minute * 60;
			$.timer_lib._day = $.timer_lib._hour * 24;
		},

		showRemaining : function(){
			var now = new Date();
			var distDt = $.timer_lib._vDate - now;

			if (distDt < 0) {
				clearInterval($.timer_lib.timer);
				document.getElementById($.timer_lib.id).textContent = '프로모션 종료';
				//location.reload();
				return;
			}

			var days = Math.floor(distDt / $.timer_lib._day);
			var hours = Math.floor((distDt % $.timer_lib._day) / $.timer_lib._hour);
			var minutes = Math.floor((distDt % $.timer_lib._hour) / $.timer_lib._minute);
			var seconds = Math.floor((distDt % $.timer_lib._minute) / $.timer_lib._second);

			document.getElementById("promotion_timer_hour").textContent = (days*24)+hours;
			document.getElementById("promotion_timer_minute").textContent = minutes.toString().length<2?'0'+minutes:minutes;
			document.getElementById("promotion_timer_second").textContent = seconds.toString().length<2?'0'+seconds:seconds;
		},

		countDownTimer:function(){
			$.timer_lib.timer = setInterval(showRemaining, 1000);
		}

		destroy : function(){
			$.timer_lib._vDate = null;
			$.timer_lib._second = null;
			$.timer_lib._minute = null;
			$.timer_lib._hour = null;
			$.timer_lib._day = null;
			$.timer_lib.timer = null;
		},

		isNotReady : function(obj, msg){
			if(obj == null){
				alert(msg);
				return false;
			}else{
				return true;
			}
		}
	};
})($);