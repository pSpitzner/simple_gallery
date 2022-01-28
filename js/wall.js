'use strict';
var $debug = null;
var $lastshown = null;
var $lastnum = 0;
var $lastintersect = null;
var $lazyLoadInstance = null;
var $bodyWrapScrollPos = null;
var $wallisvisible = false;

var trackscrolling = false;
var trackdelay;
var isScrolling;


// var cards = null;
// var card_ids = null;


// ------------------------------------------------------------------ //
// intersection observer
// ------------------------------------------------------------------ //

let observer = new IntersectionObserver(onIntersection, {
  root: null,
  rootMargin: '45%',
  threshold: .5
});

function onIntersection(entries) {
  // Loop through the entries
  entries.forEach(entry => {
    // Are we in viewport?
    // console.log("out: " + entry.target.id, entry.intersectionRatio);
    if (entry.intersectionRatio > 0.5) {
        // console.log("\tin: " + entry.target.id, entry.intersectionRatio);
        if (trackscrolling) {
            $lastshown = entry.target.id;
            $lastnum = card_ids.indexOf($lastshown);
        }
    }
  });
}

// -------------------------------------------------------------------------- //
// we have a horizontally scrolling wall that takes over the gallery (floats above)
// -------------------------------------------------------------------------- //

function open_wall($target) {
  let dummy = document.getElementById("transition-dummy");
  dummy.classList.toggle('fade');
  // the fade duration takes a while, let's not show the flickering
  setTimeout(function () {
    let wall = document.getElementById("wall");
    let main = document.getElementById("body-wrap");
    $bodyWrapScrollPos = window.pageYOffset || document.documentElement.scrollTop;
    $wallisvisible = true;
    wall.classList.toggle('hidden');
    main.classList.toggle('hidden');
    document.body.classList.toggle('bg-black')
    scroll_to($target, false);
    dummy.classList.toggle('fade');
  }, 150);
}

function close_wall() {
  let dummy = document.getElementById("transition-dummy");
  dummy.classList.toggle('fade');
  setTimeout(function () {
    let wall = document.getElementById("wall");
    let main = document.getElementById("body-wrap");
    document.body.classList.toggle('bg-black')
    $wallisvisible = false;
    wall.classList.toggle('hidden');
    main.classList.toggle('hidden');
    document.documentElement.scrollTop = document.body.scrollTop = $bodyWrapScrollPos;
    dummy.classList.toggle('fade');
  }, 150);
}

function stretch(caller) {
    let currentshown = $lastshown;
    let sw = document.getElementById("scrolling-wrapper");
    // sw.classList.toggle("stretched");
    if (sw.classList.contains("stretch_conti")) {
      // console.log("scrollmode (single image per page)");
      sw.classList.replace("stretch_conti", "stretch_single");
      caller.innerHTML=
        feather.icons['minimize'].toSvg();
      // avoid displacement bug by offsetting one pixel
      scroll_to(currentshown, false, 1);
    } else if (sw.classList.contains("stretch_padded")) {
      // console.log("scrollmode (continuous wall)");
      // sw.classList.remove("stretched2");
      sw.classList.replace("stretch_padded", "stretch_conti");
      caller.innerHTML=
        feather.icons['maximize'].toSvg();
    } else {
      // console.log("scrollmode stretched1 (padded wall)");
      sw.classList.replace("stretch_single", "stretch_padded");
      caller.innerHTML=
        feather.icons['columns'].toSvg();
    }
    scroll_to(currentshown, false, 0);

}

function num_bc(id) {
    return Math.max(0, Math.min(id, card_ids.length-1) );
}

function scroll_to(target=0, smooth=true, glitch_fix=0) {
    trackscrolling = false;
    var $thisshown = null;
    var $thisnum   = null;
    if (typeof target === 'string' || target instanceof String) {
        // console.log('scroll to string', target)
        $thisshown = target;
        $thisnum = card_ids.indexOf(target);
    } else {
        $thisnum = num_bc($lastnum+target);
        $thisshown = card_ids[$thisnum];
        // console.log('scroll to int', $lastnum, target)
    }
    // console.log($lastnum, $thisnum, $thisshown);
    let tar = document.getElementById($thisshown);
    // $debug = tar;
    let sw  = document.getElementById('scrolling-wrapper');

    // const y = tar.getBoundingClientRect().top + sw.pageYOffset;
    const x = tar.offsetLeft+ .5*tar.offsetWidth - .5*sw.offsetWidth + glitch_fix;
    // console.log($thisshown, x)

    sw.scrollTo({left: x, behavior: (smooth ? 'smooth':'auto') });
    // tar.scrollIntoView({behavior: 'smooth', inline: 'center'});

    $lastnum   = $thisnum;
    $lastshown = $thisshown;
    window.clearTimeout(trackdelay);
    trackdelay = setTimeout(function(){
        trackscrolling = true;
        // 1000 ms seems a bit long... but that's not even long enough for chrome
    }, 100);
}

// ------------------------------------------------------------------ //
// window load
// ------------------------------------------------------------------ //


window.onload = function () {
  // console.log("window onload");
  // enable lazy loading only after document was loaded
  // so that low res previews get fetched first.
  $lazyLoadInstance = new LazyLoad({
    container: document.getElementById("scrolling-wrapper"),
    elements_selector: ".lazy",
    // we do not want to load every image when scrolling over
    // otherwise we create a long loading queue
    load_delay: 150, // [ms] after coming to view
    callback_error: (img) => {
      console.log("failed to lazy load", img);
    },
    callback_loaded: (img) => {
      // livephoto.js
      // console.log(img);
      check_and_replace_with_live_photo(img);
    }
  });

  // Listen for scroll events to disable buttons
  document.getElementById('scrolling-wrapper').addEventListener('scroll', function (event) {
    if (!trackscrolling) return;
    document.getElementById('control-bar').classList.add('disabled');
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(function () {
      document.getElementById('control-bar').classList.remove('disabled');
    }, 150);
  }, false);

  // document.getElementById('scrolling-wrapper').addEventListener('touchstart', function (event) {
  //     document.getElementById('control-bar').classList.add('disabled');
  // }
  // document.getElementById('scrolling-wrapper').addEventListener('touchend', function (event) {
  //     document.getElementById('control-bar').classList.remove('disabled');
  // }

  // only make observer listen after cards were rendered to avoid
  // firing an event for every image
  cards.forEach(image => {
    observer.observe(image);
  });
};

// ------------------------------------------------------------------ //
// key controls and orientation changes
// ------------------------------------------------------------------ //

function keyhandler(keyEv) {
  var keyCode = null;
  if(!keyEv)keyEv=window.event;
  if(keyEv.which)
  {
    keyCode = keyEv.which;
  }
  else if(keyEv.keyCode)
  {
    keyCode = keyEv.keyCode;
  }

  // right
  if($wallisvisible && keyCode==39){
    scroll_to(+1);
    keyEv.preventDefault();}
  // left
  if($wallisvisible && keyCode==37){
    scroll_to(-1);
    keyEv.preventDefault();}
  // up
  if($wallisvisible && keyCode==38){
    // scroll_to(card_ids[0]);
    scroll_to(-1);
    keyEv.preventDefault();}
  // down
  if($wallisvisible && keyCode==40){
    // scroll_to(card_ids[card_ids.length - 1]);
    scroll_to(+1);
    keyEv.preventDefault();}
  // space
  if($wallisvisible && keyCode==32){
    scroll_to(+1);
    keyEv.preventDefault();
  }
  // esc
  if($wallisvisible && keyCode==27){
    close_wall();
    keyEv.preventDefault();
  }
}

document.onkeydown = keyhandler;

window.addEventListener("orientationchange", function() {
    scroll_to(0, false);
}, false);

window.addEventListener("resize", function() {
    scroll_to(0, false);
}, false);
