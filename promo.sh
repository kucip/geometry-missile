#! /bin/bash

if [ ! -f ./promo.zip ]; 
then
    echo "File not found!"
else
echo "File exist. Removing"
rm ./promo.zip
fi

zip -r ./promo.zip ./media/graphics/promo

