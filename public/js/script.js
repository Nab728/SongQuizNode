let songs;
var prevSongs = [];
let score = 0;
let songIndex = 0;
let access_token = "BQACNkJ6Wx1UKKTn_A74QQCZsqPD3Yni6rHo_bysqkrdyBQthVj4WClyZpsyO9BZVNXN4K2otUDeRQJeMzr5gWTXI65DHQB1FZ7fqzodIi3b7FQDlpa1e2J0orzBIFi7k9FnQqc1e1sf5Qix4-cE6DdLih8VWJcQVbhFm00oYYQIErSBCFVWBnDq_XDzlb1DpJNviA0Ip4eaDTjzq9UWxFZ4XXVO4qrD";
let xhr;
var title;
var time;
let clickedOnIframe = false;
//load youtube api
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//youtbe player variables
var player;
var isWorking = false;
var done = false;


document.addEventListener('DOMContentLoaded', function(){
        fetch("js/topHits2020.json")           
        .then((result) => {
            return result.json()
        }).then((data) => {
            songs = data.items 
            //console.log(data); 
            
    });
    document.querySelector("#form").addEventListener('submit', function(e) {
        let answer = document.querySelector("#songTitle").value;
        titleAns = formatString(title);
        if (answer.toLowerCase().trim() == titleAns.toLowerCase().trim())
        {
            score++;
            let textBox = document.querySelector(".score");
            textBox.innerHTML = "Score : " + score;
            document.getElementById("songTitle").value = ""; 
        }
        document.querySelector("#answer").innerHTML = "Answer: " + titleAns.trim();
        
        document.getElementById("submit").style.display = "none";
        nextSong();
        e.preventDefault();
    });
});


function formatString(s)
{
    if(s != undefined)
    {
        let parenthesis = s.indexOf("(");
        if (parenthesis != -1)
        {
            s = s.substring(0, parenthesis);
        }
        let dash = s.indexOf("-");
        if (dash != -1)
        {
            s = s.substring(0, dash);
        }
    }
    
    return s;
}
//access_token can expire so be careful
// ok so XMLHTTPRequest only works if you have an onload otherwise you can only call it once
function callApi(str, callback)
{
    str = str.replaceAll(" ", "%20");
    xhr = new XMLHttpRequest();
    xhr.open("GET", 'https://api.spotify.com/v1/search?q=' + str + '&type=track', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token); 
    xhr.onload = callback;
    console.log("Hello");
    xhr.send();
   
}
function checkTitle(answer)
{
    callApi(answer, processRequest);
}

function processRequest() 
{  
    if (xhr.readyState == 4 && xhr.status == 200) 
    {
        var response = JSON.parse(xhr.responseText);
        var result = response["tracks"]["items"][0];
        // console.log(response["tracks"]);
        // console.log("Xhr: " + result["name"]);
        // console.log(result["artists"][0]["name"])
        let seconds = Math.floor(result["duration_ms"] / 1000.0);
        // answers =             
        // {
        //     "title": result["name"],
        //     "artist": result["artists"][0]["name"],
        //     "duration": seconds
        // }
        
        title  = result["name"];
        time = seconds;
        console.log("Current ans is " + title);
    }
    else
    {
        alert("Error replace you access_token");
    }
}
function replay()
{ 
    var videoPlayer = document.querySelector('#video-container');
    videoPlayer.src = videoPlayer.src;
}
function chooseSong()
{
    //console.log(songs.length);
    let index = Math.floor(Math.random() * songs.length); 
    while (prevSongs.includes(index))
    {
        index = Math.floor(Math.random() * songs.length);
        //console.log("While loop song chosen is " + index);
    }
    prevSongs.push(index);
    if (prevSongs.length >= 10)
    {
        // removes first element from the array
        prevSongs.shift();
    }
    return index;
}
let firstTime = true;
function onYouTubeIframeAPIReady() 
{
    isWorking = true;
    //console.log("Youtube iframe works");
    if (firstTime && songs != null)
    { 
        startSongPlayer();
        firstTime = false;
        
    }
    
}
function createPlayer(id)
{
    if (isWorking)
    {
        if (player != undefined)
        {
            player.destroy();
        }
        player = new YT.Player("video-container", {
        height: 300,
        width: 300,
        videoId: id,
        playerVars: {
            'playsinline': 1
            },
            events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
            }
        });
        
    }
    
}
let start;
function startSongPlayer()
{ 
    songIndex = chooseSong();
    //console.log(songIndex);
    checkTitle(songs[songIndex].snippet.title);
    //console.log("After is " + title);
    //time is undefined in the beginning for some reason but it still works so ig that's ok
    if (time == undefined)
    {
        time = 100;
    }
    //console.log(songs[songIndex].snippet.title);
    //0 to length of the song - 20 seconds (so we don't play the end of the song)
    start = Math.floor(Math.random() * (time - 20));
    createPlayer(songs[songIndex].snippet.resourceId.videoId, start);
}
//set start of clip and play the video
function onPlayerReady(event) 
{  
    player.seekTo(start);
    event.target.playVideo();
}
//if playing make the video disappear
function onPlayerStateChange(event) {
    if(event.data == YT.PlayerState.PLAYING)
    {
       document.querySelector('.wrapper').style.pointerEvents = "none";
       document.querySelector('.wrapper').style.display = "none";
        if (!done)
        {
            setTimeout(stopVideo, 10000);
            done = true;
        }
    }
}
function stopVideo() {
    player.stopVideo();
}
function nextSong()
{
    startSongPlayer();
    titleAns = formatString(title);
    document.querySelector("#answer").innerHTML = "Answer: " + titleAns.trim();
    setTimeout(function()
    {
        document.querySelector(".wrapper").style.display = "block";
    }, 500);
    setTimeout(function(){
        document.getElementById("submit").style.display = "block";
        
    }, 2000);
    document.querySelector(".wrapper").style.pointerEvents = "all";
    document.getElementById("songTitle").value = ""; 
    setTimeout(function(){
        document.querySelector("#answer").innerHTML = "";
        
    }, 2000);
    // console.log(songs[songIndex].snippet.title);
}

