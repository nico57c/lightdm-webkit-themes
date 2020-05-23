#!/bin/bash

CurrentDir=`dirname $0`
InstallDir="$1"
LightdmThemeImages="$2"
WallpaperDir="$3"
FilePrefix="$4"
ServiceUser="$5"
ServiceMountDrive="$6"
SedCharacterSep="+"

echo "--------------"
echo "  Parameters  "
echo "--------------"
echo " - 1 - installation directory ..................... : $InstallDir"
echo " - 2 - lightdm theme images directory ............. : $LightdmThemeImages"
echo " - 3 - wallpapers directory ....................... : $WallpaperDir"
echo " - 4 - wallpapers files prefix .................... : $FilePrefix"
echo " - 5 - user will execute service .................. : $ServiceUser"
echo " - 6 - partition path of wallpapers directory ..... : $ServiceMountDrive"
echo "--------------"
echo ""
echo "--------------"
echo "    Notice    "
echo "--------------"
echo "  \`sed\` command line use '$SedCharacterSep', not allowed in parameters"
echo "--------------"

if [[ "$1" == "help" || "$1" == "--help" || "$6" == "" ]]; then
  exit
fi

if [ -d "$InstallDir" ]; then

  cp $CurrentDir/* $InstallDir
  
  # Customize lightdm_custom.service
  echo "1/4 Customize lightdm_custom.service."
  sed -i "s+__user__+$ServiceUser+g" $InstallDir/lightdm_wallpaper.service
  sed -i "s+__drivedir__+$ServiceMountDrive+g" $InstallDir/lightdm_wallpaper.service
  sed -i "s+__installdir__+$InstallDir+g" $InstallDir/lightdm_wallpaper.service
  sed -i "s+__fileprefix__+$FilePrefix+g" $InstallDir/lightdm_wallpaper.service
  
  # Customize wallpaper rotate script 
  echo "2/4 Customize wallpaper rotate script"
  sed -i "s+__user__+$ServiceUser+g" $InstallDir/wallpaper_rotate.sh
  sed -i "s+__drivedir__+$ServiceMountDrive+g" $InstallDir/wallpaper_rotate.sh
  sed -i "s+__installdir__+$InstallDir+g" $InstallDir/wallpaper_rotate.sh
  sed -i "s+__fileprefix__+$FilePrefix+g" $InstallDir/wallpaper_rotate.sh
  
  echo "3/4 Create symbolic link to wallpaper directory"
  ln -s $WallpaperDir  $InstallDir/wallpapers

  echo "4/4 Create symbolic link to images directory of lightdm theme"
  ln -s $LightdmThemeImages $InstallDir/images

  echo ""
  echo ""
  echo "----------------------"
  echo " Service installation "
  echo "----------------------"
  echo "-- system service active on system boot --"
  echo " systemctl enable $InstallDir/lightdm_wallpaper.service"
  echo " systemctl enable $InstallDir/lightdm_wallpaper.timer"
  echo " systemctl start $InstallDir/lightdm_wallpaper"
  echo "----------------------"
  echo "-- user service active on users login --"
  echo " systemctl --global enable $InstallDir/lightdm_wallpaper.service"
  echo " systemctl --global enable $InstallDir/lightdm_wallpaper.timer"
  echo " systemctl --global start $InstallDir/lightdm_wallpaper"
  echo "----------------------"

else
  echo "Install directory does not exists."
fi

