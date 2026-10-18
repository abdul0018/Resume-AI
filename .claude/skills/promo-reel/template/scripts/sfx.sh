#!/usr/bin/env bash
# Synthesizes the reel's sound effects into public/sfx/ (no downloads, no licences needed).
set -euo pipefail
cd "$(dirname "$0")/../public" && mkdir -p sfx && cd sfx
mk() { local out=$1; shift; ffmpeg -v error -y "$@" -ar 44100 -ac 2 "$out"; }
# pop: short pitch-dropping blip (text / tags appearing)
mk pop.wav -f lavfi -i "aevalsrc='0.7*sin(2*PI*(500+900*exp(-t*40))*t)*exp(-t*28)':d=0.14"
# whoosh: band-passed noise swelling into the cut (peak at 0.3 s)
mk whoosh.wav -f lavfi -i "anoisesrc=d=0.45:c=pink:a=0.9" -af "highpass=f=500,lowpass=f=4500,volume='if(lt(t,0.3),pow(t/0.3,2),max(0,(0.45-t)/0.15))':eval=frame,volume=1.6"
# impact: sub boom + click (punch words)
mk impact.wav -f lavfi -i "aevalsrc='0.95*sin(2*PI*(48+90*exp(-t*18))*t)*exp(-t*4.5)+0.25*(random(0)*2-1)*exp(-t*60)':d=0.9"
# tick: clock tick
mk tick.wav -f lavfi -i "aevalsrc='0.6*sin(2*PI*2600*t)*exp(-t*260)+0.3*sin(2*PI*1300*t)*exp(-t*200)':d=0.05"
# riser: noise + rising tone over 1 s (into the CTA keyword)
mk riser.wav -f lavfi -i "aevalsrc='(0.25*sin(2*PI*(200*t+300*t*t)*1)+0.2*(random(0)*2-1))*pow(t,2)':d=1.0" -af "highpass=f=150,volume=1.4"
# ding: bright bell (CTA keyword lands)
mk ding.wav -f lavfi -i "aevalsrc='(0.5*sin(2*PI*1318*t)+0.3*sin(2*PI*2637*t)+0.15*sin(2*PI*3951*t))*exp(-t*3.2)':d=1.3"
# key: keyboard click (comment typing)
mk key.wav -f lavfi -i "aevalsrc='0.55*(random(0)*2-1)*exp(-t*350)+0.3*sin(2*PI*1800*t)*exp(-t*300)':d=0.04" -af "highpass=f=1200"
# scratch: quick marker swipe (strikethrough)
mk scratch.wav -f lavfi -i "anoisesrc=d=0.22:c=white:a=0.6" -af "bandpass=f=2500:width_type=h:w=1800,afade=t=in:d=0.08,afade=t=out:st=0.12:d=0.1,volume=1.5"
# scribble: ballpoint on paper, rhythmic strokes (checklist style; trimmed per written word)
mk scribble.wav -f lavfi -i "anoisesrc=d=3:c=pink:a=0.8" -af "highpass=f=1800,lowpass=f=7000,volume='0.25+0.75*pow(abs(sin(2*PI*5.5*t+sin(2*PI*1.3*t))),1.5)':eval=frame,volume=1.6"
# chime: soft magic sparkle (orange accents in the story style)
mk chime.wav -f lavfi -i "aevalsrc='0.28*sin(2*PI*1568*t)*exp(-t*5)+0.24*sin(2*PI*2093*t)*exp(-(t-0.06)*5)*gt(t,0.06)+0.2*sin(2*PI*2637*t)*exp(-(t-0.12)*5)*gt(t,0.12)+0.14*sin(2*PI*3136*t)*exp(-(t-0.18)*5)*gt(t,0.18)':d=1.2" -af "aecho=0.8:0.5:60:0.3,volume=2.6"
echo "sfx ready in public/sfx/"
