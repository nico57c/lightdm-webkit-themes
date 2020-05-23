#!/bin/bash

echo "Lightdm Wallpaper service starting..."
echo ""

if [ -f __installdir__/current_wallpaper ]; then

  wallpaperMax=`ls -1 __installdir__/wallpapers | wc -l`
  
  wallpaperNumber=`head -c 4 __installdir__/current_wallpaper`
  wallpaperNumber=$((0+$wallpaperNumber))

  echo "- numbers of wallpapers : $wallpaperMax"
  echo "- current index : $wallpaperNumber"

  if [ "$wallpaperNumber" -gt "$wallpaperMax" ]; then
    wallpaperNumber="1"
  fi

  rm __installdir__/images/wallpaper.jpg
  cp __installdir__/wallpapers/__fileprefix__$wallpaperNumber.jpg __installdir__/images/wallpaper.jpg
  echo $(($wallpaperNumber+1)) > __installdir__/current_wallpaper 

else
	echo "ISSUE __installdir__/current_wallpaper file not found"
fi

exit 0 
