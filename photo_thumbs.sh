if [[ -d $1 ]]; then
    CORRECT=false
    for directory in $1; do
        if [ -d "$directory"/orig ]; then
            CORRECT=true
            break
        fi
    done

    if ! $CORRECT; then
        echo "Full-resolution images need to be in a subdirectory 'orig'."
        echo "Did not find 'orig' in $1"
        exit 1
    fi

    NUM_FILES=$(find $1/orig/ -maxdepth 1 -type f | wc -l)
    echo "Creating additional structure in $1"
    echo "and thumbnails for $NUM_FILES files:"
    read -p "Continue (y/n)?" choice
    case "$choice" in
      y|Y ) echo "";;
      n|N ) echo "canceled"; exit 1;;
      * ) echo "canceled"; exit 1;;
    esac
elif [[ -f $1 ]]; then
    echo "$1 is a file, provide a directory"
    exit 1
else
    echo "$1 is not valid, provide a directory"
    exit 1
fi

OLD_PATH=${PWD}
BASE=$(basename "$1")
echo $OLD_PATH
echo $BASE


cd $1/..
cd $BASE
rm $BASE.zip > /dev/null 2>&1
rm $BASE_md.zip > /dev/null 2>&1
rm $BASE_lg.zip > /dev/null 2>&1
rm md/* > /dev/null 2>&1
rm lg/* > /dev/null 2>&1
mkdir lg > /dev/null 2>&1
mkdir md > /dev/null 2>&1
cd orig
echo "Creating Thumbnails"
mogrify -verbose -thumbnail 60000@ -quality 80 -interlace Line -format jpg -path ../md *
mogrify -verbose -interlace Line -resize 4000000@ -quality 85 -format jpg -path ../lg *

cd ../
echo "Creating downloadable zip files"
zip -jr ${BASE}.zip ./orig/
zip -jr ${BASE}_lg.zip ./lg/
zip -jr ${BASE}_md.zip ./md/

cd ./md/
IFS=$'\n'
filelist=$(ls)
for file in $filelist; do
    mv "$file" "$(echo "md_$file")"
done
