<?
	if($_SESSION['member']["m_id"]==""){
	echo "로그인 이후에 이용이 가능합니다.";
	header( 'Location: https://m.directg.net/member/login.html' );
	exit;
}
?>