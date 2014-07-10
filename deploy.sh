#!/bin/sh

echo "Building the site"
grunt build_all

echo "Copying dist to ~/lasperduta.com.dist"
cp -r dist ~/lasperduta.com.dist

echo "Switching to gh_pages"
git checkout gh-pages

echo "Copying new files here"
rm -rf
cp -r ~/lasperduta.com.dist/ .

echo "Cleaning up ~/lasperduta.com.dist"
rm -rf ~/lasperduta.com.dist

echo "Committing!"
git commit -m "$1"

echo "Switching back to master"
git checkout master