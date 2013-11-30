#ifndef Game_hh
#define Game_hh

#include "Utils.hh"
#include "Board.hh"
#include "Action.hh"
#include "Player.hh"
#include "future"

using namespace std;


/**
 * Game class.
 */

class Game {

public:

	static void run (vector<string> names, istream& is, ostream& os, ostream& osdeb);
	static vector<pair<int, int> > multirun_thread (vector<string> names, Board b0, int count);
	static vector<pair<int, int> > multirun (vector<string> names, istream& is, int count);

};


#endif


