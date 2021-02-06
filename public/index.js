$(document).ready(function(){
    $('select').formSelect();
    $('.sidenav').sidenav(); 
    window.onresize = function(event) { 
        $('.sidenav').sidenav(); 
    }
    $('.tabs').tabs();
    $('.modal').modal();
    $('input#input_text, textarea#textarea2').characterCounter();
});

$(function () {

    $("#btn_fetch").click(function () {
        let v = document.getElementById('displayV');
        v.src = '';
        var url = $("#txt_url").val();

        var oThis = $(this);
        oThis.attr('disabled', true);

        $.get('video_info.php', {url: url}, function (data) {

            console.log(data);

            oThis.attr('disabled', false);

            var links = data['links'];
            var error = data['error'];

            if (error) {
                alert('Error: ' + error);
                return;
            }

            // first link with video
            var first = links.find(function (link) {
                return link['format'].indexOf('video') !== -1;
            });

            if (typeof first === 'undefined') {
                alert('No video found!');
                return;
            }

            var stream_url = 'stream.php?url=' + encodeURIComponent(first['url']);
            loadBuffer(stream_url);
            icon.innerText = 'pause';
        });

    });

});

var video = document.getElementById('displayV');
var ranger = document.getElementById('rangee');
var chSpeed = document.getElementById('chSpeed');
var icon = document.getElementById('pIcon');
var speed = document.getElementById('speed');
var audio = document.getElementById('audio');
audio.volume = 0.4;
var intervalRewind;

var lastBufferCheck = Date.now();
var buffers = {
    display:[],
    bu: []
};


function loadBuffer(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = function(oEvent) {

        var blob = new Blob([oEvent.target.response], {type: "video/mp4"});
        
        video.src = URL.createObjectURL(blob);
        chSpeed.value = -1;
        setTimeout(()=> {
            console.log(video.duration)
            video.currentTime = video.duration - 1;
            playV();

        }, 100);
    };
    
    xhr.onprogress = function(oEvent) {
    
        if (oEvent.lengthComputable) {
            var percentComplete = oEvent.loaded/oEvent.total;
            // do something with this
            document.getElementById('percent').style.width = percentComplete * 100 + '%';
        }
    }

    xhr.send();
}

function setRangeData(data) {
    ranger.value = data;
}

$(chSpeed).on("input", function() {
    changeSpeed(chSpeed.value, true);
});

$(ranger).on("input", function() {
    clearInterval(intervalRewind);
    var video = document.getElementById('displayV');
    video.pause();
    audio.pause();
});

$(ranger).bind("mouseup touchend", function() {
    var video = document.getElementById('displayV');
    let r = document.getElementById('rangee');

    video.currentTime = video.duration * (r.value / 100);
    ifPlay();
});

$(ranger).bind("mousedown touchstart", function() {
    var video = document.getElementById('displayV');
    //video.pause();
                audio.pause();
    $( video ).off( "timeupdate");
    video.currentTime = video.duration * (ranger.value / 100);
    clearInterval(intervalRewind);
    setTimeout(startRangeUpdate, 100);
});

$(video).on("loadeddata", function() {
    let loader = document.getElementById('loader');
    loader.style.display = "none";
    playV();
});

$(video).on("loadstart", function() {
    let loader = document.getElementById('loader');
    if(video.src != '') {
        loader.style.display = "block";
    }
    setRangeData(0);
});

$(video).on('play',function(){
    //video.playbackRate = 1.0;
    clearInterval(intervalRewind);
});

$(video).on('ended',function(){
    // this only happens when t=duration (not t==0)
    //video.playbackRate = 1.0;
    video.currentTime = 0.0;
    clearInterval(intervalRewind);
});

$(video).on('pause',function(){
    //video.playbackRate = 1.0;
    clearInterval(intervalRewind);
});

function startRangeUpdate() {
    $(video).on('timeupdate',function(){
        let vi = document.getElementById('displayV');
    
        setRangeData((vi.currentTime / vi.duration) * 100);
    });    
}

function playV() {
    let speedd = chSpeed.value;

    if(speedd >= 0){
        video.play();
    } else {
        icon.innerText = 'pause';
        changeSpeed(speedd);
    }
}

startRangeUpdate();

function rewind(rewindSpeed) {    
    if(icon.innerText == 'pause') {
        audio.playbackRate = Math.abs(rewindSpeed);
        audio.play();
        clearInterval(intervalRewind);
        var startSystemTime = new Date().getTime();
        var startVideoTime = video.currentTime;
        
        intervalRewind = setInterval(function(){
            video.playbackRate = 0;
            if(video.currentTime == 0){
                clearInterval(intervalRewind);
                video.pause();
                audio.pause();
                icon.innerText = 'play_arrow';
            } else {
                var elapsed = new Date().getTime()-startSystemTime;
                video.currentTime = Math.max(startVideoTime - elapsed*rewindSpeed/1000.0, 0);
            }
        }, 30);
    }
}

/**speed functions */
$("#speed0").click(function() {
    changeSpeed(0);
});

function ifPlay() {
    if(icon.innerText == 'play_arrow' || video.src == '') {
        video.pause();
        audio.pause();
    } else {
        playV();
    }
}

$("#speedpoint5").click(function() {
    changeSpeed(0.5);
});

function changeSpeed(val, isFromR=false) {

    if(val != 0) {
        if(!isFromR) {
            chSpeed.value = val;
        }
        speed.innerText = val;
    }

    if(val > 0) {
        if(val >=1) {
            clearInterval(intervalRewind);
            video.playbackRate = val;
        } else {
            clearInterval(intervalRewind);
            setTimeout(function() {
                video.playbackRate = val;
                console.log('delayed');
            }, 0);
        }

        ifPlay();
        audio.pause();
    } else if(val < 0) {
        rewind(-val);
    } else {
        if(!isFromR) {
            clearInterval(intervalRewind);

            if(icon.innerText == 'play_arrow' && video.src != '') {
                playV();
                icon.innerText = 'pause';
            } else {
                icon.innerText = 'play_arrow';
                video.pause();
                audio.pause();
            }
        }
    }
}



$("#speed1").click(function() {
    changeSpeed(1);
});
$("#speed2").click(function() {
    changeSpeed(2);
});
$("#speed3").click(function() {
    changeSpeed(3);
});
$("#speed-point5").click(function() {
    changeSpeed(-0.5);
});
$("#speed-1").click(function() {
    changeSpeed(-1);
});
$("#speed-2").click(function() {
    changeSpeed(-2);
});
$("#speed-3").click(function() {
    changeSpeed(-3);
});