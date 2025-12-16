#!/bin/bash
# Simple script to concatenate a specified list of CSS files
# and remove CSS comments (for a bit less weight and a bit more opacity).
# If you want a more complete solution, look at build systems,
# CSS compressors (such as YUI-Compressor), CSS pre-processors, etc.

TEMP="temp.css"
SOURCES=(
    "main.css"
    "settings/ad/mobile/preroll/themes/light/ad.css"
    "settings/ad/mobile/header/themes/light/ad.css"
    "settings/ad/mobile/footer/themes/light/ad.css"
    "settings/ad/mobile/end/themes/light/ad.css"
    "settings/debug/debug.css"
)

rm $TEMP;
touch $TEMP;
echo >> $TEMP;

# Append CSS together
for s in ${SOURCES[*]}
do
    echo "Processing " $s;
    # Not sure how robust this is...
    sed -e 's@/\*.*\*/@@g' -e '/\/\*/,/\*\//d' -e '/^$/d' $s >> $TEMP;
done
