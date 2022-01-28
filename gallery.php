<!-- to create thumbnails -->
<!-- mogrify -verbose -thumbnail 60000@ -interlace Line -format jpg -path ../md * -->
<!-- mogrify -verbose -interlace Line -format jpg *.jpg -->

<?php
  $src_is_valid = false;
  // load possible input argument
  if (isset($_REQUEST["src"])) $src_arg = $_REQUEST["src"];
  chdir('projects');
  $src_subdirs = glob('*' , GLOB_ONLYDIR);
  for ($i=0; $i < count($src_subdirs); $i++) {
    if ($src_arg == $src_subdirs[$i]) $src_is_valid = true;
  }
  if (count($src_subdirs) == 0) {
    echo 'No input folder present, aborting';
    exit;
  }
  if (!$src_is_valid || count($src_subdirs) == 1 && !isset($_REQUEST["src"])) {
    echo '<script type="text/javascript">
            window.location = "?src=demo"
          </script>';
    exit;
  }

  // set tab title
  ob_start();
  include("header.html");
  $buffer=ob_get_contents();
  ob_end_clean();
  $title = "Photos: ".$src_arg;
  $buffer = preg_replace('/(<title>)(.*?)(<\/title>)/i', '$1' . $title . '$3', $buffer);
  echo $buffer;
?>
<body class="bg-gray">

<div id="body-wrap" class="bg-gray">
    <div class="header">
        <h1><?php echo $src_arg?></h1>
        <?php
            foreach (array("_lg.zip", ".zip") as &$suffix) {
                $filename = $src_arg."/".$src_arg.$suffix;
                if (file_exists($filename)){
                echo '
                <div class="download-button-flex">
                <a href="./projects/'.$filename.'" type="button" class="download-button">
                Download ('.ceil(filesize($filename)/1024/1024).'MB)</a>
                </div>
                ';
                }
            }
        ?>
    </div>


    <div class="gallery">
        <?php
            chdir($src_arg);
            chdir('lg');
            $i = 0;
            $max = count(glob("*"));
            $files = glob("*");
            natsort($files);
            foreach ($files as $filename) {
                $i++;
                $lg = './projects/'.$src_arg.'/lg/'.$filename;
                $md = './projects/'.$src_arg.'/md/md_'.$filename;
                $id = basename($filename, '.jpg');
                $id = basename($id, '.gif');
                $id = basename($id, '.png');
                $id = "wall_".$id;
                echo '
                <div
                    onclick="open_wall(\''.$id.'\')"
                    class="gallery-item">
                    <img class=""
                        src="'.$md.'"
                        alt="'.$filename.'"></img>
                </div>
              ';
            }
        ?>

        <a  id="github-href"
            href="https://github.com/pSpitzner/simple_gallery"
            class="gallery-item control clickable">
            <div>
                <span id="github-feather" data-feather="github" ></span>
                <div id="github-text">Source on Github</div>
            </div>
        </a>
    </div>
</div>

<div id="wall" class="hidden bg-black">

    <div id="scrolling-wrapper" class="stretch_single">
        <!-- <div class="safe-area-inset-left"></div> -->


        <?php
            $load_live_photo_js=false;
            $i = 0;
            // we are still in the 'lg' subdirectory
            $max = count(glob("*"));
            $files = glob("*");
            chdir('../..');
            natsort($files);
            foreach ($files as $filename) {
                $i++;
                $lg = $src_arg.'/lg/'.$filename;
                $md = $src_arg.'/md/md_'.$filename;
                // build element DOM id: cut off extensions, start with default 'jpg'
                $id = basename($filename, '.jpg');
                $id = basename($id, '.gif');
                $id = basename($id, '.png');
                $id = "wall_".$id;

                // apple live_photos. if needed, we can construct the player
                // check for .mov file matching the current photo basename
                $mov = $src_arg.'/mov/'.basename($filename, '.jpg').'.mov';

                echo '
                <div class="card ';
                if ($i == 1) echo 'safe-area-inset-left';
                elseif ($i == $max) echo 'safe-area-inset-right';
                echo '" ';

                // so this is cool. by setting the aspect ratio of the img before
                // it gets loaded, we can now reserve the space and no dom shifting
                // will occur.
                // https://www.andreaverlicchi.eu/aspect-ratio-modern-reserve-space-lazy-images-async-content-responsive-design/

                list($width, $height, $type, $attr) = getimagesize($lg);


                echo 'id="'.$id.'">
                    <div class="card-image">
                    <img
                    class="image-content lazy"
                    data-src="./projects/'.$lg.'"
                    src="./projects/'.$md.'"
                    alt="'.$filename.'"
                    style="aspect-ratio: '.($width/$height).';"';
                if (file_exists($mov)) {
                    echo 'lp_video_src="./projects/'.$mov.'"';
                    $load_live_photo_js=true;
                }
                echo '></img></div></div>';

            }
        ?>
    </div>

    <div id="control-bar">
        <button id="control-left" class="control control-bar-button mr-a clickable svg-shadow" onclick="scroll_to(-1)">
            <span class = "" data-feather="arrow-left" ></span>
        </button>
        <!-- <span id="printf" class="control control-bar-button ml-a clickable svg-shadow">
            0000
        </span> -->
        <button id="control-wall" class="control control-bar-button ml-a  clickable svg-shadow" role="button" onclick="close_wall()">
            <span class = "" data-feather="x" ></span>
        </button>
        <button id="control-stretch" class="control control-bar-button mr-a clickable svg-shadow" role="button" onclick="stretch(this)">
            <span class = "" data-feather="minimize" ></span>
        </button>
        <button id="control-right" class="control control-bar-button ml-a clickable svg-shadow" onclick="scroll_to(+1)">
            <span  data-feather="arrow-right" ></span>
        </button>
    </div>
</div>

<div id="transition-dummy" class="">
</div>


<script>
  // we want some inits to be ready before all thumbs are loaded, so that the
  // wall could open right away
  // console.log("DOM ready");
  const cards = document.querySelectorAll('#scrolling-wrapper .card');
  const card_ids = Array.from(cards, x => x.id);
  feather.replace();
</script>

</body>


<script src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.5.0/dist/lazyload.min.js"></script>

<?php
    if ($load_live_photo_js) {
        echo '<script src="https://cdn.apple-livephotoskit.com/lpk/1/livephotoskit.js"></script>';
    }
?>

<script src="./js/livephotos.js"></script>
