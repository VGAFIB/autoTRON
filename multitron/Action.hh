#ifndef Action_hh
#define Action_hh

#include "Utils.hh"

using namespace std;

/*! \file
 * Contains the class Action and the struct Movement that it uses.
 */

/**
 * A movement defines to which vertex will a particular unit move
 */
struct Movement {
    int unit_id;
    int next_vertex;
	bool use_bonus;
	
	/**
     * Constructor, given only a unit id
     */
    Movement(int unit_id_) : unit_id(unit_id_), next_vertex(-99), use_bonus(false) { }
		
    /**
     * Constructor, given a unit id, the vertex to move to and whether 
	 * to use or not the item in the bike's inventory
     */
    Movement(int unit_id_, int next_vertex_, bool use_bonus_ = false) 
		: unit_id(unit_id_), next_vertex(next_vertex_), use_bonus(use_bonus_) { }
};

/**
 * Class that stores the actions requested by a player in a round.
 */

class Action {

    friend class Game;
    friend class SecGame;
    friend class Board;

    //Set of units that have already performed a movement
    set<int> u_;
    //List of movements to be performed this round
    queue<Movement> q_;

    //Read/write an action to/from a stream
    Action (istream& is);
    void print (ostream& os) const;

public:

    Action () { }

    /**
     * Adds a movement to the action list. Fails and returns false if a
     * movement is already present for this unit.
     */
    inline bool command (const Movement& m) {
        if (u_.find(m.unit_id) == u_.end()) {
            q_.push(m);
            u_.insert(m.unit_id);
            return true;
        } else {
            cerr << "warning: action already requested for unit " << m.unit_id << endl;
            return false;
        }
    }

};


#endif
