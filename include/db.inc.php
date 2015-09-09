<?php


$conn_string = "host=we12s007.ugent.be port=5432 dbname=search user=search_website password=PH5se8GeeR4GFZ6Q";

$GLOBALS['dbconn'] = pg_connect($conn_string) or die("Could not connect");

