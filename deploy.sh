#!/bin/sh

echo "Building the site"
grunt build_all

echo "Copying dist to ~/lasperduta.com.dist"
cp -r dist ~/lasperduta.com.dist

echo "Switching to gh_pages"
git checkout gh-pages

rm -rf
cp -r ~/lasperduta.com.dist/ .

rm -rf ~/lasperduta.com.dist
git commit -m "$1"
git checkout master