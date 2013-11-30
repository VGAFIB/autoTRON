#include <algorithm>

#include "Board.hh"
#include "Action.hh"

#include <sstream>

#include <cctype>

using namespace std;

Board::Board (istream& is, bool secgame) {
    string s;

    //Version, compared part by part
    istringstream vs(version());
    while (!vs.eof()) {
        string v;
        vs >> v;
        is >> s;
        assert(s == v || s == "v1.0");
    };

    //Open map file for reading
    is >> s >> map_;
    assert(s == "map");
    ifstream mapfile((map_ + ".map").c_str());

    int n;
    mapfile >> s >> n;
    assert(s == "vertices");
    vertices_.resize(n);
	hack_guarro.resize(n);

    //Read neighbours from map file
    for (int i = 0; i < n; i++) {
        string line;
        mapfile >> std::ws; //Skip remaining whitespace, needed when switching from reading with ">>" to getline
        getline(mapfile, line);
        istringstream adjacent_list(line);
        int vertex;
        while (adjacent_list >> vertex) {
            vertices_[i].neighbours.push_back(vertex);
        }
    }

    //Read player spawn points from map file
    mapfile >> s >> n;
    assert(s == "spawn");
    spawn_vertices_.resize(n);
    for (int i = 0; i < n; i++) {
        int vertex;
        mapfile >> vertex;
        spawn_vertices_[i] = vertex;
    }

    //Read vertices with bonus items from map file (bonus will appear at the round (nb_rounds()/4)
    mapfile >> s >> n;
    assert(s == "bonus");
    bonus_vertices_.resize(n);
    for (int i = 0; i < n; i++) {
        int vertex;
        mapfile >> vertex;
        bonus_vertices_[i] = vertex;
    }

    is >> s >> nb_players_;
    assert(s == "nb_players");
    assert(nb_players_ >= 2);

    is >> s >> nb_bikes_;
    assert(s == "nb_bikes");
    assert(nb_bikes_ >= 1);

    assert(nb_bikes_ * nb_players_ <= 8); //9 is reserved and greater values would need to change some code: as we print chars now, 10 would be interpreted as 1 and 0.
    assert(nb_bikes_ * nb_players_ <= (int)spawn_vertices_.size());

    is >> s >> nb_rounds_;
    assert(s == "nb_rounds");
    assert(nb_rounds_ >= 1);

    is >> s >> bonus_round_;
    assert(s == "bonus_round");

    is >> s >> turbo_duration_;
    assert(s == "turbo_duration");
    assert(turbo_duration_ >= 0);

    is >> s >> ghost_duration_;
    assert(s == "ghost_duration");
    assert(ghost_duration_ >= 0);

    is >> s >> score_bonus_;
    assert(s == "score_bonus");
    assert(score_bonus_ >= 0);

    string ignore;
    is >> s >> ignore;
    assert(s == "secgame");
    secgame_ = secgame; //use given param

    names_ = vector<string>(nb_players_);
    is >> s;
    assert(s == "names");
    for (int pl = 0; pl < nb_players_; ++pl) {
        is >> names_[pl];
    }

    is >> s >> round_;
    if (s == "?") cerr << "ERROR: Number of names does not match number of players" << endl;
    assert(s == "round");
    assert(round_ < nb_rounds_);

    is >> s;
    assert(s == "score");
    score_ = vector<int>(nb_players_);
    for (int i = 0; i < nb_players_; ++i) {
        is >> score_[i];
    }

    is >> s;
    assert(s == "status");
    status_ = vector<double>(nb_players_);
    for (int i = 0; i < nb_players_; ++i) {
        is >> status_[i];
    }

    bikes_ = vector<Bike>(nb_players_ * nb_bikes_);

    if (round_ == -1) {
        round_ = 0;
        //Initialitze the vertices (note that neighbours are already initialized)
        for (int i = 0; i < (int)vertices_.size(); ++i) {
            Vertex& v = vertices_[i];
            v.id = i;
            v.bike = -1;
            v.wall = -1;
            v.bonus = None;
        }

        //Initialitze the bikes in the spawn points
        int k = 0;
        for (int i = 0; i < nb_bikes_; ++i) {
            for (int j = 0; j < nb_players_; ++j) {
                Bike& b = bikes_[k];
                b.id = k;
                b.player = j;
                b.vertex = spawn_vertices_[k];
                b.alive = true;
                b.bonus = None;
                b.turbo_duration = 0;
                b.ghost_duration = 0;
                vertices_[b.vertex].bike = b.id;
                vertices_[b.vertex].wall = b.id;
                k++;
            }
        }

    } else {

        //Read vertices
        for (int i = 0; i < (int)vertices_.size(); ++i) {
            Vertex& v = vertices_[i];
            v.id = i;
			char bonus;
            is >> v.bike >> bonus;
			v.bonus = char2bonus(bonus);
			for (int j = 0; j < (int)hack_guarro.size(); ++j) {
				is >> hack_guarro[i][j];
			}
			int endtoken;
			is >> endtoken;
			assert(endtoken == -9);
        }
		int endtoken;
		is >> endtoken;
		assert(endtoken == -9);

        //Read bikes
        for (int i = 0; i < (int)bikes_.size(); ++i) {
            Bike& b = bikes_[i];
            b.id = i;
            char bonus;
            is >> b.player >> bonus >> b.vertex >> b.turbo_duration >> b.ghost_duration >> b.alive;
            b.bonus = char2bonus(bonus);
            vertices_[b.vertex].bike = b.id;
        }


    }

    //cerr << "Board constructor ok" << endl;

}

void Board::print_preamble (ostream& os) const {
    os << version() << endl;
    os << "map " << map() << endl;
    os << "nb_players " << nb_players() << endl;
    os << "nb_bikes " << nb_bikes() << endl;
    os << "nb_rounds " << nb_rounds() << endl;
    os << "bonus_round " << bonus_round() << endl;
    os << "turbo_duration " << turbo_duration() << endl;
    os << "ghost_duration " << ghost_duration() << endl;
    os << "score_bonus " << score_bonus() << endl;
    os << "secgame " << (secgame()? "true":"false") << endl;
    os << "names";
    for (int player = 0; player < nb_players(); ++player) os << " " << names_[player];
    os << endl << endl;
}

void Board::print (ostream& os) const {
    os << endl;

    os << "round " << round() << endl;

    os << "score";
    for (int i = 0; i < nb_players(); ++i) os << " " << score_[i];
    os << endl;

    os << "status";
    for (int i = 0; i < nb_players(); ++i) os << " " << status_[i];
    os << endl;

    //Print vertices
    for (int i = 0; i < (int)vertices_.size(); ++i) {
        const Vertex& v = vertices_[i];
        os << v.wall << " " << bonus2char(v.bonus) << " ";
		for (int j = 0; j < (int)hack_guarro[i].size(); ++j) {
			os << hack_guarro[i][j] << " ";
		}
		os << -8 << " ";
    }	
	os << -9 << endl;
	
    //Print bikes
    for (int i = 0; i < (int)bikes_.size(); ++i) {
        const Bike& b = bikes_[i];
        os << b.player << " " << bonus2char(b.bonus) << " " << b.vertex << " " << b.turbo_duration << " " << b.ghost_duration << " " << b.alive << endl;
    }

}

Board Board::next (const vector<Action>& actions_commanded, Action& actions_done) const {
    // b will be the new board we shall return
    Board b = *this;
    b.nextNoCopy(actions_commanded, actions_done);
    return b;
}

void Board::nextNoCopy (const vector<Action>& actions_commanded, Action& actions_done) {

    // b will be the new board we shall return
    Board& b = *this;

    // increment the round
    ++b.round_;

    // randomize turns
    vector<int> turns(nb_players());
    for (int player = 0; player < nb_players(); ++player) {
        turns[player] = player;
    }
    random_shuffle(turns.begin(), turns.end());

    // move each unit
    vector<bool> moved(b.bikes_.size(), false);
    for (int turn = 0; turn < nb_players(); ++turn) {
        int player = turns[turn];
        queue<Movement> q = actions_commanded[player].q_;
        while (not q.empty()) {
            
            Movement m = q.front();
            q.pop();

            int id = m.unit_id;
            //cerr << "Moving bike " << id << endl;

            //Safety checks

            if (!bike_ok(id)) {
                cerr << "Bike id out of range. id=" << id << endl;
                continue;
            }

            Bike& bike = b.bikes_[id];

            if (bike.player != player) {
                cerr << "Trying to move an opponent bike! id=" << id << endl;
                continue;
            }

            int from = bike.vertex;
            int to = m.next_vertex;
            if (!is_neighbour(from, to)) {
                cerr << "Invalid move from vertex " << from << " to " << to << ". id=" << id << endl;
                continue;
            }

            if (!bike.alive) {
                cerr << "Trying to move a dead bike! id=" << id << endl;
                continue;
            }

            if (moved[id]) {
                cerr << "Bike already moved this round!. id=" << id << endl;
                continue;
            }

            if ((round()+1) % 2 && bike.turbo_duration <= 0) {
                cerr << "Only turbo bikes can move at odd rounds. id=" << id << endl;
            }

            //Ok, this is a valid action
            actions_done.q_.push(m);

            //Use items
            if (m.use_bonus) {
                switch (bike.bonus) {
                    case None:
                        cerr << "Bike " << id << " has no item to use!" << endl;
                        break;
                    case Ghost:
                        bike.ghost_duration = ghost_duration();
                        break;
                    case Turbo:
                        bike.turbo_duration = turbo_duration();
                        break;
                    default:
                        cerr << "Bike item not valid!" << endl;
                        assert(false);
                }
                bike.bonus = None;
            }

            Vertex& orig = b.vertices_[from];
            Vertex& dest = b.vertices_[to];

            //Perform movement
            bike.vertex = to;
            orig.bike = -1;
			
            if (dest.wall == -1) {
                //If there was no wall, create it
                dest.wall = bike.id;
				dest.bike = id;
            } else if (bike.ghost_duration <= 0) {
                //Stop here if there is a wall and we are not a ghost, so
                //the bike will explode later for not being marked as moved
                //cerr << "Kaboom! Bike " << id << " crashed!" << endl;
                continue;
            } else {
				b.hack_guarro[dest.id].push_back(bike.id);
			}

            //Pick up bonus
            if (dest.bonus != None) {
                if (dest.bonus == Points) {
                    b.score_[bike.player] += score_bonus();
                } else {
                    bike.bonus = dest.bonus;
                }
                dest.bonus = None;
            }

            moved[id] = true;

        }
    }

    //Destroy bikes that have not moved, grant points for each round your bikes are alive and decrease bonus duration
    for (int id = 0; id < (int)bikes_.size(); id++) {
        Bike& bike = b.bikes_[id];
        if (!bike.alive) {
            continue;
        }
        if ((round()+1) % 2 && bike.turbo_duration <= 0) {
            continue; //Non-turbo bikes didn't need to move this round
        }
        if (moved[id]) {
            if (bike.ghost_duration > 0) bike.ghost_duration--;
            if (bike.turbo_duration > 0) bike.turbo_duration--;
            b.score_[bike.player] += score_per_round_;
        } else {
            //cerr << "Destroying bike " << id << endl;
            bike.alive = false;
            bike.ghost_duration = 0;
            bike.turbo_duration = 0;
            //Remove the bike trail wall
            for (int i = 0; i < (int)b.vertices_.size(); ++i) {
                if (b.vertices_[i].wall == bike.id) {
					if (b.hack_guarro[i].empty()) {
						//bug fix: ghost bikes that have been in the same vertices as this bike should claim it as theirs
						b.vertices_[i].wall = -1;
					} else {
						b.vertices_[i].wall = b.hack_guarro[i][b.hack_guarro.size()-1];
						b.hack_guarro[i].pop_back();
					}
				}
            }

        }
    }

    //Spawn the bonus at round bonus_round_
    if (b.round_ == bonus_round_) {
        for (int i = 0; i < (int)b.bonus_vertices_.size(); i++) {
            int vertex = b.bonus_vertices_[i];
            if (b.vertices_[vertex].wall != -1) {
                continue; //Non empty vertex
            }
            Bonus bonus = static_cast<Bonus>(1 + (rand() % (BonusEnumSize-1)));
            b.vertices_[vertex].bonus = bonus;
        }
    }

    //return b;
}

