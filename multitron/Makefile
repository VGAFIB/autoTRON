
# Config

OPTIMIZE = 0 # Optimization level (0 to 3)
DEBUG    = 1 # Compile for debugging (0 or 1)
PROFILE  = 0 # Compile for profile (0 or 1)
32BITS   = 0 # Produce 32 bits objects on 64 bits systems (0 or 1)

# Do not edit past this line

# The following two lines will detect all your players (files matching "AI*.cc")

PLAYERS_SRC = $(wildcard AI*.cc)
PLAYERS_OBJ = $(patsubst %.cc, %.o, $(PLAYERS_SRC))

# Flags

ifeq ($(strip $(PROFILE)),1)
	PROFILEFLAGS=-pg
endif
ifeq ($(strip $(DEBUG)),1)
	DEBUGFLAGS=-DDEBUG -g -rdynamic
endif
ifeq ($(strip $(32BITS)),1)
	ARCHFLAGS=-m32
endif

CXXFLAGS = -Wall -Wno-unused-variable -Wno-sign-compare $(ARCHFLAGS) $(PROFILEFLAGS) $(DEBUGFLAGS) -O$(strip $(OPTIMIZE)) -std=c++0x -pthread
LDFLAGS  = -lm $(ARCHFLAGS) $(PROFILEFLAGS) $(DEBUGFLAGS) -O$(strip $(OPTIM)) $(CXXFLAGS)

# Rules

all: Game 

clean:
	rm -rf Game SecGame *.o *.exe Makefile.deps
	rm -rf latex refman.pdf

Game: BackTrace.o Utils.o Board.o Action.o Player.o Registry.o Game.o Main.o $(PLAYERS_OBJ)
	$(CXX) $(LDFLAGS) $^ -o $@

SecGame: BackTrace.o Utils.o Board.o Action.o Player.o Registry.o SecGame.o SecMain.o
	$(CXX) $(LDFLAGS) $^ -o $@

%.exe: %.o BackTrace.o Utils.o Board.o Action.o Player.o Registry.o SecGame.o SecMain.o
	$(CXX) $(LDFLAGS)  $^ -o $@

#%.o: %.cc
	$(CXX) $(CXXFLAGS) $(CFLAGS) $< -c -o $@

obj:
	mkdir obj

Makefile.deps: *.cc
		$(CXX) $(CXXFLAGS) -MM *.cc > Makefile.deps

doxygen:
	doxygen
	cd latex && make
	cp latex/refman.pdf .

include Makefile.deps


