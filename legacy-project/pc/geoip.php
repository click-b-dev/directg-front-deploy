<?php
ini_set( "display_errors", 1 );
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE);
include_once($_SERVER['DOCUMENT_ROOT'].'/lib/lib.php');
include_once($_SERVER["DOCUMENT_ROOT"].'/../geoip2/vendor/autoload.php');

use GeoIp2\Database\Reader;

$reader = new Reader('/home/dgkrshop/www/geoip2/GeoLite2-Country.mmdb');

//print_r($reader);

$record = $reader->country('112.216.231.146');

echo $record->country->isoCode;
?>