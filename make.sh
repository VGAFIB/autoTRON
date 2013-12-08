#!/bin/bash -e

export PATH=$PATH
NAME=`date | md5sum | awk '{print $1}'`

cd multitron
g++ -o Game_$NAME -O3 -pthread -std=c++11 BackTrace.o Utils.o Board.o Action.o Player.o Registry.o Game.o Main.o ../upload/AI${1}.o ../upload/AI${2}.o ../upload/AI${3}.o ../upload/AI${4}.o

timeout 10s ../hackme/hackme ./Game_$NAME $1 $2 $3 $4 -i ../maps/${5} -o test.t3d

rm Game_$NAME
