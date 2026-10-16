<?php
/* ============================================================================== */
/* =   KCP 본인확인 V2 암호화 헬퍼 (KCP 제공 샘플 기준)                            = */
/* = -------------------------------------------------------------------------- = */
/* =   PBKDF2(SHA-256) 로 키/IV 파생 후 AES-256-CBC 로 요청 JSON 을 암복호화      = */
/* ============================================================================== */
class Crypto
{
    private static $a = "c2hhMjU2";                 // base64("sha256")
    private static $b = 10000;                      // pbkdf2 iterations
    private static $c = 32;                          // key length
    private static $d = "QUVTLTI1Ni1DQkM=";        // base64("AES-256-CBC")

    private static function x($p, $s)
    {
        return hash_pbkdf2(base64_decode(self::$a), $p, $s, self::$b, self::$c, true);
    }

    private static function y($d, $k, $i)
    {
        return openssl_encrypt($d, base64_decode(self::$d), $k, OPENSSL_RAW_DATA, $i);
    }

    private static function z($d, $k, $i)
    {
        return openssl_decrypt($d, base64_decode(self::$d), $k, OPENSSL_RAW_DATA, $i);
    }

    public static function encryptJson($data, $key, $site)
    {
        $s = random_bytes(16);

        $k = self::x($key, $s);
        $v = self::x($site, $s);

        $i = substr($v, 0, 16);

        $e = self::y($data, $k, $i);

        return [
            "encData" => base64_encode($e),
            "rv"      => base64_encode($s)
        ];
    }

    public static function decryptJson($enc, $rv, $key, $site)
    {
        $s = base64_decode($rv);

        $k = self::x($key, $s);
        $v = self::x($site, $s);

        $i = substr($v, 0, 16);

        return self::z(base64_decode($enc), $k, $i);
    }
}
