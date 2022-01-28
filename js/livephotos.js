'use strict';

function check_and_replace_with_live_photo(img) {
    // we call this when the lazy loading of an image is done.
    // hence, the full res photo is already cached and sizes are known.
    // only run if apples LivePhotosKit has been loaded
    if (typeof LivePhotosKit === 'undefined') return;
    // only convert to live photos if a video file exists
    if (!img.hasAttribute("lp_video_src")) return;

    let width = img.offsetWidth;
    let height = img.offsetHeight
    let aspect_ratio = width / height;

    let player = LivePhotosKit.Player();
    // when constructing the player, it needs to have non-zero size
    img.parentElement.insertAdjacentElement('beforeend', player);
    player.style.width = `${width}px`;
    player.style.height = `${height}px`;

    player.style.display='block';
    player.photoSrc = img.getAttribute("data-src");
    player.videoSrc = img.getAttribute("lp_video_src");

    // match the classes of the image
    player.classList.add("image-content", "lazy", "entered", "loaded");



    // // Listen to events the player emits.
    player.addEventListener('photoload', evt => {
        setTimeout(function () {
            // hack apples fixed-size styling to recover or flexible resizing
            player.style.removeProperty("width");
            player.style.height = "100%";
            player.style["aspect-ratio"] = aspect_ratio;

            player.children[1].style.width = "100%";
            player.children[1].style.height = "100%";
            player.children[1].children[0].style.width = "100%";
            player.children[1].children[0].style.height = "100%";

            img.remove();
        }, 50);
    });
    player.addEventListener('error', evt => console.log('player load error', evt));
    // player.addEventListener('ended', evt => console.log('player finished playing through', evt));
    player.playbackStyle = LivePhotosKit.PlaybackStyle.FULL;
}
