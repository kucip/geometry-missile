#! /bin/bash
echo "Size Report"
du -h -d 1 media

echo ""
echo "Promo"
du -h -s media/graphics/promo/

echo ""
echo "Graphics without promo"
du -h -s -I promo media/graphics/
echo ""
echo "Media without promo"
du -h -s -I promo media/

echo ""
echo "Audio MP3 Only"
du -h -s -I *.ogg media/audio

echo ""
echo "Audio OGG only"
du -h -s -I *.mp3 media/audio