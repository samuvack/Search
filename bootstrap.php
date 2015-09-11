<?php
define('APP_DEBUG', true);
$website = require_once __DIR__.'/app/app.php';
$website->run();
