<?php
	ini_set( "display_errors", 0 );
	include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib_kcp.php');
	header("Content-type: text/html; charset=utf-8");
    /* ============================================================================== */
    /* =   인증데이터 수신 및 복호화 페이지                                         = */
    /* = -------------------------------------------------------------------------- = */
    /* =   해당 페이지는 반드시 가맹점 서버에 업로드 되어야 하며                    = */ 
    /* =   가급적 수정없이 사용하시기 바랍니다.                                     = */
    /* ============================================================================== */

    /* ============================================================================== */
    /* =   라이브러리 파일 Include                                                  = */
    /* = -------------------------------------------------------------------------- = */

	require $_SERVER["DOCUMENT_ROOT"]."/member/kcpcert/lib/ct_cli_lib2.php";
	
	include_once($_SERVER["DOCUMENT_ROOT"].'/../log4php/vendor/autoload.php');
	require_once($_SERVER["DOCUMENT_ROOT"]."/../log4php/src/main/php/Logger.php");
	Logger::configure($_SERVER["DOCUMENT_ROOT"] .'/../log4php/config_kcpcert.xml');
	$logger = Logger::getLogger("response");
	
	define('KEY','01234567890123456789012345678901');
	define('KEY_128',substr(KEY,0,128/8));
	define('KEY_256',substr(KEY,0,256/8));
	$auth_arr=array();

	$logger->info($_POST);

    /* = -------------------------------------------------------------------------- = */
    /* =   라이브러리 파일 Include END                                               = */
    /* ============================================================================== */

    /* ============================================================================== */
    /* =   null 값을 처리하는 메소드                                                = */
    /* = -------------------------------------------------------------------------- = */
    function f_get_parm_str( $val )
    {
        if ( $val == null ) $val = "";
        if ( $val == ""   ) $val = "";
        return  $val;
    }
    /* ============================================================================== */

    $home_dir      = "/home/dgkrshop/www/pc/member/kcpcert"; // ct_cll 절대경로 ( bin 전까지 )
	$g_conf_ENC_KEY = "fcbdbdda3942161e7cb1c0c03c9a31a0b58e7a4eb945f7eb6620e39db6d90e32";

    $site_cd       = "";
    $ordr_idxx     = "";
    
    $cert_no       = "";
    $cert_enc_use  = "";
    $enc_info      = "";
    $enc_data      = "";
    $req_tx        = "";
    
    $enc_cert_data2 = "";
    $cert_info     = "";

    $tran_cd       = "";
    $res_cd        = "";
    $res_msg       = "";

    $dn_hash       = "";
	
	$sbParam  ="";
	/*------------------------------------------------------------------------*/
    /*  :: 전체 파라미터 남기기                                               */
    /*------------------------------------------------------------------------*/

    // request 로 넘어온 값 처리
    foreach($_POST as $nmParam => $valParam)
    {

        if ( $nmParam == "site_cd" )
        {
            $site_cd = f_get_parm_str ( $valParam );
        }

        if ( $nmParam == "ordr_idxx" )
        {
            $ordr_idxx = f_get_parm_str ( $valParam );
        }

        if ( $nmParam == "res_cd" )
        {
            $res_cd = f_get_parm_str ( $valParam );
        }

        if ( $nmParam == "cert_enc_use" )
        {
            $cert_enc_use = f_get_parm_str ( $valParam );
        }

        if ( $nmParam == "req_tx" )
        {
            $req_tx = f_get_parm_str ( $valParam );
        }

        if ( $nmParam == "cert_no" )
        {
            $cert_no = f_get_parm_str ( $valParam );
        }

        if ( $nmParam == "enc_cert_data2" )
        {
            $enc_cert_data2 = f_get_parm_str ( $valParam );
        }

        if ( $nmParam == "dn_hash" )
        {
            $dn_hash = f_get_parm_str ( $valParam );
        }
		
		if ( $nmParam == "param_opt_1") {
            $m_no = f_get_parm_str ( $valParam );
		}

        // 부모창으로 넘기는 form 데이터 생성 필드
        $sbParam .= "<input type='hidden' name='" . $nmParam . "' value='" . f_get_parm_str( $valParam ) . "'/>";
    }

    $ct_cert = new C_CT_CLI;
    $ct_cert->mf_clear();

    // 결과 처리

    if( $cert_enc_use == "Y" )
    {
        if( $res_cd == "0000" )
        {
            // dn_hash 검증
            // KCP 가 리턴해 드리는 dn_hash 와 사이트 코드, 주문번호 , 인증번호를 검증하여
            // 해당 데이터의 위변조를 방지합니다
             $veri_str = $site_cd.$ordr_idxx.$cert_no; // 사이트 코드 + 주문번호 + 인증거래번호

            if ( $ct_cert->check_valid_hash ( $home_dir ,$g_conf_ENC_KEY, $dn_hash , $veri_str ) != "1" )
            {
                // 검증 실패시 처리 영역

             //   echo "dn_hash 변조 위험있음";
                // 오류 처리 ( dn_hash 변조 위험있음)
            }

            // 가맹점 DB 처리 페이지 영역

          //  echo "========================= 리턴 데이터 ======================="       ."<br>";
        //    echo "사이트 코드            :" . $site_cd                                 ."<br>";
         //   echo "인증 번호              :" . $cert_no                                 ."<br>";
         //   echo "암호된 인증정보        :" . $enc_cert_data2                           ."<br>";
            
            // 인증데이터 복호화 함수
            // 해당 함수는 암호화된 enc_cert_data 를
            // site_cd 와 cert_no 를 가지고 복화화 하는 함수 입니다.
            // 정상적으로 복호화 된경우에만 인증데이터를 가져올수 있습니다.
            $opt = "1" ; // 복호화 인코딩 옵션 ( UTF - 8 사용시 "1" ) 
            $ct_cert->decrypt_enc_cert( $home_dir,$g_conf_ENC_KEY , $site_cd , $cert_no , $enc_cert_data2 , $opt );
            
         //   echo "========================= 복호화 데이터 ====================="       ."<br>";
        //    echo "복호화 이동통신사 코드 :" . $ct_cert->mf_get_key_value("comm_id"    )."<br>"; // 이동통신사 코드   
        //    echo "복호화 전화번호        :" . $ct_cert->mf_get_key_value("phone_no"   )."<br>"; // 전화번호          
         //   echo "복호화 이름            :" . $ct_cert->mf_get_key_value("user_name"  )."<br>"; // 이름              
         //   echo "복호화 생년월일        :" . $ct_cert->mf_get_key_value("birth_day"  )."<br>"; // 생년월일          
          //  echo "복호화 성별코드        :" . $ct_cert->mf_get_key_value("sex_code"   )."<br>"; // 성별코드          
         //   echo "복호화 내/외국인 정보  :" . $ct_cert->mf_get_key_value("local_code" )."<br>"; // 내/외국인 정보    
         //   echo "복호화 CI              :" . $ct_cert->mf_get_key_value("ci_url"         )."<br>"; // CI                
         //   echo "복호화 DI              :" . $ct_cert->mf_get_key_value("di_url"         )."<br>"; // DI 중복가입 확인값
        //    echo "복호화 WEB_SITEID      :" . $ct_cert->mf_get_key_value("web_siteid" )."<br>"; // WEB_SITEID
       //     echo "복호화 결과코드        :" . $ct_cert->mf_get_key_value("res_cd"     )."<br>"; // 암호화된 결과코드
       //     echo "복호화 결과메시지      :" . $ct_cert->mf_get_key_value("res_msg"    )."<br>"; // 암호화된 결과메시지
			
			$auth_arr["di_url"] = $ct_cert->mf_get_key_value("di_url");
			$auth_arr["user_name"] = $ct_cert->mf_get_key_value("user_name");
			$auth_arr["birth_day"] = $ct_cert->mf_get_key_value("birth_day");
			$auth_arr["phone_no"] = $ct_cert->mf_get_key_value("phone_no");
			$auth_arr["sex_code"] = $ct_cert->mf_get_key_value("sex_code");
			
			$logger->info($auth_arr);
			$auth_enc = openssl_encrypt(json_encode($auth_arr),"AES-128-CBC",KEY_128,0,KEY_128);
			
			try{
				$conn = new PDO($dsn_dgkr,DGKR_USER,DGKR_PASSWORD);
				$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

				$member = new Member($conn);
				
				$join_chk = $member->getMemberDupinfo($auth_arr["birth_day"],$auth_arr["user_name"],$auth_arr["di_url"]);
                $logger->info($join_chk);
				if($join_chk[0]>2){
					$error_code=1;
					$msg="이미 실명인증된 아이디가 있습니다.";
				} else {
					$member->updateMemberDupinfo($m_no,$auth_arr["user_name"],$auth_arr["birth_day"],$auth_arr["phone_no"],$auth_arr["di_url"],$auth_arr["sex_code"]);
					$error_code=0;
					$msg="본인인증에 성공하였습니다.";
					//$_SESSION['member']=array(
					//	"name"=>$auth_arr["user_name"],
					//	"hp"=>$auth_arr["phone_no"]
				//	);
				}
                $logger->info($msg);
			
			}catch (PDOException $e){
				echo 'Error!: '.$e->getMessage();
				die();
			}
        }
        else/*if( res_cd.equals( "0000" ) != true )*/
        {
            $logger->info("인증실패");
           // 인증실패
        }
    }
    else/*if( cert_enc_use.equals( "Y" ) != true )*/
    {
        $logger->info("암호화 인증 안함");
        // 암호화 인증 안함
    }

    $ct_cert->mf_clear();
?>



<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" >
    <head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>휴대폰 본인인증</title>
        <script type="text/javascript">
            window.onload=function()
            {
                try
                {
                    opener.auth_data( document.form_auth ); // 부모창으로 값 전달

                    window.close();// 팝업 닫기
                }
                catch(e)
                {
                    alert(e); // 정상적인 부모창의 iframe 를 못찾은 경우임
                }
            }
        </script>
    </head>
    <body oncontextmenu="return false;" ondragstart="return false;" onselectstart="return false;">
        <form name="form_auth" method="post">
			<?= $sbParam ?>
			<input type="hidden" name="name" value="<?=$auth_arr["user_name"]?>">
			<input type="hidden" name="birthday" value="<?=$auth_arr["birth_day"]?>">
			<input type="hidden" name="auth_enc" value="<?=$auth_enc?>">

			<input type="hidden" name="error_code" value="<?=$error_code?>">
			<input type="hidden" name="msg" value="<?=$msg?>">

		</form>
    </body>
</html>
