
#ifndef Player_hh
#define Player_hh

#include "Utils.hh"
#include "Board.hh"
#include "Action.hh"
#include "Registry.hh"

using namespace std;


/***
 * Abstract base class for players.
 * *
 * This class uses multiple inheritance from Board
 * and Action, so that their public operations can been used
 * from within Player.
 *
 * In order to create new players, inherit from this class
 * and register them. See the examples Null.cc and Demo.cc.
 */

class Player : public Board, public Action {

    friend class Game;
    friend class SecGame;

    int me_;

    inline void reset (int me, Board& board, Action& action) {
        me_ = me;
        *(Board*)this = board;
        *(Action*)this = action;
    }


public:

    /**
     * Return the number of my player.
     */

    inline int me () {
        return me_;
    }


    /**
     * My play intelligence.
     * Will have to be overwritten, thus declared virtual.
     */
    virtual void play () {
    };

};


#endif
