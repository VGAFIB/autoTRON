#!/bin/bash

export PATH=$PATH

NAME=`date | md5sum`
echo $NAME


cd multitron
g++ -o Game_$NAME -O3 -pthread -std=c++11 BackTrace.o Utils.o Board.o Action.o Player.o Registry.o Game.o Main.o ../upload/AI$1.o ../upload/AI$2.o ../upload/AI$3.o ../upload/AI$4.o

./Game_$NAME $1 $2 $3 $4 -i ../maps/$5.gam -o test.t3d

rm Game_$NAME
