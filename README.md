# A Simple Photo Gallery

So, you happen to have a webserver and sometimes want to share photos with friends?
Me too.

[Check out the demo](https://makeitso.one/photodemo/gallery.php?src=demo)

This is the idea:

- put the pictures on the webserver
- run a script to generate the needed folder structure and thumbnails
- share the link

## Folder structure
The php file assumes the following folder structure, which can be created by the `photo_thumbs.sh` script.

```
gallery.php
projects/
└─ my_project_name/
    ├─ orig (needed)
    ├─ lg (large images)
    ├─ md (medium thumbnails)
    └─ mov (optional, drop movies for live photos here)
```

The project name is passed to the php script as the `src` argument:
```
localhost/photos/gallery.php?src=my_project_name
```

To set this up:
clone the repo, create a project in `projects`, with a subfolder called `orig` that contains your full-size image files. Then:
```
photo_thumbs.sh ./projects/my_project_name
```

### Note:
Do not put shell scripts and gitfiles on your webshare, you have to clean up the repo after cloning.

### Live photos
To enable live-photos, add `.mov` files to the `mov` folder. The names need to match those of the photos in `orig`, minus extension.
Note that, although Apple says you can just export live photos from the macos photos app, the resulting files might be encoded with h265, which does not play well with any browser except safari. ffmpeg or handbrake can help (encode with h264).

## Dependencies

- [Imagemagick](https://imagemagick.org/index.php) to create thumbs
- zip to create downloadable bundles
- php to build the html depending on folder content


### Libraries used for web stuff

- [Apple LivePhotoKit JS](https://developer.apple.com/documentation/livephotoskitjs)
- [verlok/vanilla-lazyload](https://github.com/verlok/vanilla-lazyload)
- [Feather icons](https://feathericons.com/)
