<?php

$conf = require __DIR__.'/../app/config/db.include.php';
$conn_string = "host=%s port=%d dbname=%s user=%s password=%s";
$conn_string = sprintf($conn_string, $conf['host'], 5432, $conf['dbname'], $conf['user'], $conf['password']);

$GLOBALS['dbconn'] = pg_connect($conn_string) or die("Could not connect");

