#include "Game.hh"
#include "Registry.hh"
#include<thread>
#include <future>

using namespace std;

#define num_threads 4

vector<pair<int, int> > Game::multirun_thread (vector<string> names, Board b0, int count)
{
	if (int(names.size()) != b0.nb_players()) {
		cerr << "fatal: wrong number of players." << endl;
		exit(EXIT_FAILURE);
	}

	vector<pair<int, int> > scores (b0.nb_players());

	for(int k = 0; k < count; k++)
	{
		vector<Player*> players;
		for (int player = 0; player < b0.nb_players(); ++player) {
			string name = names[player];
			players.push_back(Registry::new_player(name));
			b0.names_[player] = name;
		}

		Board b1 = b0;
		for (int round = 1; round <= b0.nb_rounds(); ++round) {
			vector<Action> actions;
			for (int player = 0; player < b0.nb_players(); ++player) {
				Action a;
				players[player]->reset(player, b1, a);
				players[player]->play();
				actions.push_back(*players[player]);
			}
			Action actions_done;
			b1.nextNoCopy(actions, actions_done);
		}

		int winner = 0;
		for(int j = 0; j < scores.size(); j++)
		{
			scores[j].first += b1.score_[j];
			if(b1.score_[j] > b1.score_[winner])
				winner = j;
		}
		scores[winner].second++;

		for (int player = 0; player < b0.nb_players(); ++player)
			delete players[player];
	}

	return scores;
}

vector<pair<int, int> > Game::multirun (vector<string> names, istream& is, int count)
{
//	cout<<"Running with "<<num_threads<<" threads..."<<endl<<flush;

	Board b0(is, false);

	vector<pair<int, int> > res(names.size());

	future<vector<pair<int, int> > > futures[num_threads];
	/*
	std::thread threads[num_threads];

	for (int i = 0; i < num_threads; ++i)
	{
		promise<vector<pair<int, int> > > p;
		futures[i] = p.get_future();

		threads[i] = std::thread(multirun_thread, std::ref(futures[i]), names, b0, count/num_threads);
	}

	for (int i = 0; i < num_threads; ++i)
		threads[i].join();
*/

	for (int i = 0; i < num_threads; ++i)
		futures[i] = std::async(std::launch::async, multirun_thread, names, b0, count/num_threads);


	for (int i = 0; i < num_threads; ++i) {
		vector<pair<int, int> > v = futures[i].get();
		for(int j = 0; j < names.size(); j++) {
			res[j].first += v[j].first;
			res[j].second += v[j].second;
		}
	}

/*
*/
	return res;
}

void Game::run (vector<string> names, istream& is, ostream& os) {
	cerr << "info: loading game" << endl;
	Board b0(is, false);
	cerr << "info: loaded game" << endl;

	if (int(names.size()) != b0.nb_players()) {
		cerr << "fatal: wrong number of players." << endl;
		exit(EXIT_FAILURE);
	}

	vector<Player*> players;
	for (int player = 0; player < b0.nb_players(); ++player) {
		string name = names[player];
		cerr << "info: loading player " << name << endl;
		players.push_back(Registry::new_player(name));
		b0.names_[player] = name;
	}
	cerr << "info: players loaded" << endl;

	// ofstream ofs("/tmp/debug.txt");

	b0.print_preamble(os);
	b0.print(os);

	// b0.print_debug(ofs);

	Board b1 = b0;
	for (int round = 1; round <= b0.nb_rounds(); ++round) {
		cerr << "info: start round " << round << endl;
		os << "actions" << endl;
		vector<Action> actions;
		for (int player = 0; player < b0.nb_players(); ++player) {
			cerr << "info:     start player " << player << endl;
			Action a;
			players[player]->reset(player, b1, a);
			players[player]->play();
			actions.push_back(*players[player]);

			os << player << endl;
			Action(*players[player]).print(os);
			cerr << "info:     end player " << player << endl;
		}
		Action actions_done;
		cerr << "info: updating board" << endl;
		Board b2 = b1.next(actions, actions_done);
		os << endl << "movements" << endl;
		actions_done.print(os);
		b2.print(os);
		// b2.print_debug(ofs);
		b1 = b2;
		cerr << "info: end round " << round << endl;
	}
	cerr << "info: game finished" << endl;
}


