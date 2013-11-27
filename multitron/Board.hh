#ifndef Board_hh
#define Board_hh

#include "Utils.hh"

class Action;

using namespace std;

/*! \file
 * Contains the Board class itself and structs to represent all the elements 
 * that can be on the board.
 */ 

/**
 * Defines the collectable bonus that can be on a vertex
 */
enum Bonus {
	None = 0,
	Turbo, 
	Ghost, 
	Points,
	BonusEnumSize
};

/**
 * Describes a vertex in the board graph, and its contents
 */
struct Vertex {
	///The unique id for this vertex in the board
	int id;
	///The id of the bike in this vertex if present, -1 otherwise
	int bike;
	///Will be -1 if there is no wall or the id of the bike that created the wall otherwise. 
	///Pre-generated obstacles, if any, will be represented with a number greater than the number of bikes.
	int wall;
	///The bonus item that this vertex contains
	Bonus bonus;
	///The ids of the vertices that can be reached from this one
	vector<int> neighbours;
};

/**
 * Defines a bike on the board and its properties
 */
struct Bike {
	///The unique id for this bike in the board
	int id;
	///The id of the player that owns this bike
	int player;
	///The bonus item this bike collected, if any
	Bonus bonus;
	///The current position of this bike in the graph
	int vertex;
	///Number of rounds this unit can move in turbo mode
	int turbo_duration;
	///Number of rounds this bike can move in ghost mode
	int ghost_duration;
	///True until the bike crashes
	bool alive;
};

/**
 * Represents and manages the game board.
 */
class Board {
	
    // Game settings
    string map_;
	int nb_players_;
	int nb_bikes_;
    int nb_rounds_;
	int bonus_round_;
	int turbo_duration_;
	int ghost_duration_;
	int score_bonus_;
	static const int score_per_round_ = 10;
	vector<int> spawn_vertices_;
	vector<int> bonus_vertices_;
    vector<string> names_;
    bool secgame_;
	
    // Game state
    int round_;
    vector<Vertex> vertices_;
    vector<Bike> bikes_;
    vector<int> score_;
    vector<double> status_; // cpu status. <-1: dead, 0..1: %of cpu time limit

    /**
     * Construct a board by reading first round from a stream.
     */
    Board (istream& is, bool secgame);
    
    /**
     * Print the board to a stream.
     */
    void print (ostream& os) const;
    
    /**
     * Print the board preamble to a stream.
     */
    void print_preamble (ostream& os) const;

    /**
     * Computes the next board applying the given actions as to the current board.
     * actions_commanded: The actions of each player, indexed by player id.
	 * actions_done: The actual legal actions performed, in execution order (to be used by the game viewer).
	 * The const modifier helps to ensure that we modify the board we will return and not this one.
     */
    Board next (const vector<Action>& actions_commanded, Action& actions_done) const;
    void nextNoCopy (const vector<Action>& actions_commanded, Action& actions_done) ;

public:

    /**
     * Empty constructor.
     */
    Board ()
    {   }

    /**
     * Return a string with the game name and version
     */
    static string version () {
		return "tron3d v1.0";
	}
    
    /**
     * Returns the name of the map ("plane", "icosahedron"...)
     */
    inline string map () const {
        return map_;
    }

    /**
     * Returns the number of players in the game
     */
    inline int nb_players () const {
        return nb_players_;
    }
	
    /**
     * Returns the number of bikes per player
     */
    inline int nb_bikes () const {
        return nb_bikes_;
    }
	
    /**
     * Returns the number of rounds for the game
     */
    inline int nb_rounds () const {
        return nb_rounds_;
    }

	/**
     * Returns the round number when the bonus item will appear in the vertices given by bonus_vertices()
     */
    inline int 	bonus_round () const {
        return bonus_round_;
    }
	
	/**
     * Returns the duration of the turbo mode in rounds, when activated by a bike
     */
    inline int turbo_duration () const {
        return turbo_duration_;
    }

    /**
     * Returns the duration of the ghost mode in rounds, when activated by a bike
     */
    inline int ghost_duration () const {
        return ghost_duration_;
    }

    /**
     * Returns the extra points given by collecting the "Points" bonus item
     */
    inline int score_bonus () const {
        return score_bonus_;
    }

    /**
     * Returns the size of the board graph
     */
    inline int nb_vertices () const {
        return (int)vertices_.size();
    }

    /**
     * Returns the vertices where bonus items will appear
     */
    inline vector<int> bonus_vertices () const {
        return bonus_vertices_;
    }

    /**
     * Returns true when the game is running in a secure environment (i.e. the server)
     */
    bool secgame () const {
        return secgame_;
    }

    /**
     * Returns the current round.
     */
    inline int round () const {
        return round_;
    }

    /**
     * Return whether player is a valid player identifier.
     */
    inline bool player_ok (int player) const {
        return player >= 0 && player < nb_players();
    }

    /**
     * Return whether id is a valid bike identifier.
     */
    inline bool bike_ok (int id) const {
        return id >= 0 && id < (int)bikes_.size();
    }
  
    /**
     * Return whether id is a valid vertex identifier.
     */
    inline bool vertex_ok (int id) const {
        return id >= 0 && id < (int)vertices_.size();
    }

    /**
     * Returns whether vertex_b can be reached from vertex_a.
     * Does not take obstacles into account.
     */
    inline bool is_neighbour (int vertex_a, int vertex_b) const {
		const vector<int>& neighbours = vertices_[vertex_a].neighbours;
		for (int i = 0; i < (int)neighbours.size(); i++) {
			if (neighbours[i] == vertex_b) return true;
		}
        return false;
    }

    /**
     * Returns the current score of a player.
     */
    inline int score (int player) const {
        check(player_ok(player));
        return score_[player];
    }

    /**
     * Returns the percentage of cpu time used in the last round, in the 
     * range [0.0 - 1.0] or a value lesser than 0 if this player is dead. 
     * Note that this is only accessible if secgame() is true
     */
    inline double status (int player) {
        return status_[player];
    }

    /**
     * Returns the vertex v.
     */
    inline const Vertex& vertex (int v) const {
        check(vertex_ok(v));
        return vertices_[v];
    }

    /**
     * Returns the bike with identifier id.
     */
    inline const Bike& bike (int id)  {
        check(bike_ok(id));
        return bikes_[id];
    }
	
	/**
     * Returns the bikes of a certain player
     */
    inline vector<int> bikes (int player) const {
        vector<int> ret;
		for (int i = 0; i < (int)bikes_.size(); i++) {
			if (bikes_[i].player == player) {
				ret.push_back(i);
			}
		}
        return ret;
    }
	
    // Allow access to the private part of Board.
    friend class Game;
    friend class SecGame;

};


inline char bonus2char(Bonus b) {
	switch(b) {
		case None: return 'n';
		case Turbo: return 't';
		case Ghost: return 'g';
		case Points: return 'p';
		default: assert(false); return '!';
	}
}

inline Bonus char2bonus(char c) {
	switch(c) {
		case 'n': return None;
		case 't': return Turbo;
		case 'g': return Ghost;
		case 'p': return Points;
		default: {
            cerr << "Unexpected char: " << c << endl;
            assert(false);
            return None;
        }
	}
}


#endif
