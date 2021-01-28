<?php

set_time_limit(0);

if(!file_exists("../vendor/autoload.php")) {
    require('../../../autoload.php');
} else {
    require('../vendor/autoload.php');
}

$url = isset($_GET['url']) ? $_GET['url'] : null;

if ($url == false) {
    die("No url provided");
}

$youtube = new \YouTube\YoutubeStreamer();
$youtube->stream($url);