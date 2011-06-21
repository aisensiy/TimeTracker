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
cp -r background.html popup.html manifest.json css/ js/ icon.png $distdir'/'