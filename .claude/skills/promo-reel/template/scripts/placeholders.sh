#!/usr/bin/env bash
# Creates stand-in assets in public/ so the reel renders before real assets exist.
# Existing files are never overwritten.
set -euo pipefail
cd "$(dirname "$0")/../public"
mk() { [ -e "$1" ] || ffmpeg -v error -y "${@:2}" "$1"; }

# Transparent hero cut-out: three figures (tall one in the middle).
# (drawbox can't write alpha, so draw on green and key the green out.)
mk hero-cutout.png -f lavfi -i "color=c=0x00FF00:s=900x1300" -frames:v 1 -vf "\
drawbox=x=90:y=260:w=200:h=1000:color=0x1F2A44@1:t=fill,drawbox=x=140:y=150:w=100:h=110:color=0xE8C3A0@1:t=fill,\
drawbox=x=350:y=170:w=220:h=1100:color=0x1F2A44@1:t=fill,drawbox=x=410:y=50:w=100:h=120:color=0xE8C3A0@1:t=fill,\
drawbox=x=630:y=320:w=190:h=940:color=0x1F2A44@1:t=fill,drawbox=x=675:y=210:w=100:h=110:color=0xE8C3A0@1:t=fill,colorkey=0x00FF00:0.05:0,format=rgba"

photo() { mk "$1" -f lavfi -i "color=c=$2:s=1080x1920" -frames:v 1 -vf "drawbox=x=140:y=1150:w=800:h=420:color=0x8A8F98@1:t=fill"; }
photo paper-exam.jpg 0xC9CED6
photo computer-exam.jpg 0xB7BEC9
photo wide.jpg 0xAEB6C2
photo closeup.jpg 0x9EA7B4
photo teacher.jpg 0xBFC5CE

# Product site screenshot: four colour cards.
mk site.png -f lavfi -i "color=c=white:s=1600x1000" -frames:v 1 -vf "\
drawbox=x=0:y=0:w=400:h=1000:color=0xE53935@1:t=fill,drawbox=x=400:y=0:w=400:h=1000:color=0x2F5BEA@1:t=fill,\
drawbox=x=800:y=0:w=400:h=1000:color=0x34A853@1:t=fill,drawbox=x=1200:y=0:w=400:h=1000:color=0x7B3FE4@1:t=fill"

# Screen-recording stand-in.
mk screen-demo.mp4 -f lavfi -i "testsrc2=s=1080x1920:r=30:d=8" -pix_fmt yuv420p -c:v libx264 -crf 28
echo "placeholders ready in public/"
