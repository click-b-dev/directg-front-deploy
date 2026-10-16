<?php
require_once 'vendor/autoload.php';
use GeoIp2\Database\Reader;

// This reader object should be reused across lookups as creation of it is
// expensive.
$reader = new Reader('GeoLite2-Country.mmdb');

//print_r($reader);

$record = $reader->country('158.247.230.235');

echo $record->country->isoCode;
?>