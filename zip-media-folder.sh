#! /bin/bash
# Usage: zip-media-folder.sh en  : en = English
# Will zip media folder to media.zip, into _factory/localization/en/media.zip

CURRENT_DIRECTORY=${PWD##*/}

# Remove current zip file
rm ../$CURRENT_DIRECTORY/_factory/localization/$1/media.zip

# Making dir
mkdir ../$CURRENT_DIRECTORY/_factory/localization/$1

# Build zip (need to make more efficient file)
zip -9 -r ../$CURRENT_DIRECTORY/_factory/localization/$1/media.zip ../$CURRENT_DIRECTORY/media -x "*.zip*" -x "*.git*" -x "*.psd*" -x "*.xcf*" -x "*.aif*" -x "*.tiff*" -x "*.au*" -x "*.txt*" -x "*.bat*" -x "*.jar*" -x "*.py*" -x "*.sh*" -x "*.php*" -x "*.htaccess" -x "*.DS_Store"