#!/bin/bash
#this is a script to deploy the chrome extension

if [ "$1" != "" ];then
	distdir=$1
else
	distdir='dist'
fi
[ ! -d "$distdir" ] && echo -e "$distdir does not exists. \n" && exit 1
echo $distdir"/"
rm -r $distdir
mkdir $distdir
cp -r background.html popup.html manifest.json css/ js/ icon.png icon48.png $distdir'/'
rm domain_time_tracker.zip
cd $distdir && zip -r domain_time_tracker.zip * && mv domain_time_tracker.zip ../
