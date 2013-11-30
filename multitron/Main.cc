#include "Game.hh"
#include "Registry.hh"

#include <fstream>
#include <getopt.h>
#include<iomanip>

using namespace std;



void help (int argc, char** argv) {
    cout << "Usage: " << argv[0] << " [options] player1 player2 ... [< start.cnf] [> game.br] " << endl;
    cout << "Available options:" << endl;
    cout << "--seed=seed\t-s seed\t\tset random seed (default: time)" << endl;
    cout << "--input=file\t-i input\tset input file (default: stdin)" << endl;
    cout << "--output=file\t-o output\tset output file (default: stdout)" << endl;
    cout << "--list\t\t-l\t\tlist registered players" << endl;
    cout << "--version\t-v\t\tprint version" << endl;
    cout << "--help\t\t-h\t\tprint help" << endl;
}


void version () {
    cout << Board::version() << endl;
    cout << "compiled " << __TIME__ << " " << __DATE__ << endl;
}

/*
var barChartData = {
            labels : ["AIDummy.o","AIDummy.o","AIDummy.o","AIDummy.o"],
            datasets : [
                {
                    fillColor : "5cb85c",
                    strokeColor : "5cb85c",
                    dtmanata : [25,27,21,27]
                }
            ]
            
        }
*/

string score_to_JSON(vector<string> &names, vector<int> &scores) {
    string json = "{";
    json += "labels : [";
    for (int i = 0; i < int(names.size()); ++i) {
        json += i != 0 ? "," : ""; 
        json += "\"";
        json += names[i];
        json += "\"";
    }
    json += "],";
    json += " datasets : [{ fillColor : \"5cb85c\", strokeColor : \"5cb85c\",";
    json += " data : [";
    for (int i = 0; i < int(scores.size()); ++i) {
        json += i != 0 ? "," : ""; 
        ostringstream convert;
        convert << scores[i];
        json += convert.str();
    }
    json += "] }]}";
    return json;
}


int main (int argc, char** argv) {

    if (argc == 1) {
        help(argc, argv);
        return EXIT_SUCCESS;
    }

    struct option long_options[] = {
        {"seed",           required_argument,  0, 's'},
        {"input",          required_argument,  0, 'i'},
        {"output",         required_argument,  0, 'o'},
        {"list",           no_argument,        0, 'l'},
        {"version",        no_argument,        0, 'v'},
        {"help",           no_argument,        0, 'h'},
        {0, 0, 0, 0}
    };

    char* ifile = 0;
    char* ofile = 0;
    int seed = -1;
    vector<string> names;

    while (true) {
        int option_index = 0;
        int c = getopt_long(
            argc, argv,
            "s:i:o:lvh",
            long_options, &option_index
        );

        if (c == -1) break;

        switch (c) {

            case 's':
                seed = s2i(optarg);
                break;

            case 'i':
                ifile = optarg;
                break;

            case 'o':
                ofile = optarg;
                break;

            case 'l':
                Registry::print_players(cout);
                return EXIT_SUCCESS;

            case 'v':
                version();
                return EXIT_SUCCESS;

            case 'h':
                help(argc, argv);
                return EXIT_SUCCESS;

            default:
                return EXIT_FAILURE;
    }   }

    while (optind < argc) {
        names.push_back(argv[optind++]);
    }

    if (seed < 0) seed = time(0);    
    srand(seed);

    istream* is = ifile ? new ifstream(ifile) : &cin ;
    ostream* os = ofile ? new ofstream(ofile) : &cout;
	ostream* osdeb = new ofstream((string(ofile)+".dbg").c_str());
	bool multi = true;

    if(multi)
    {
cout << "{data : [";
	vector<pair<int, int> > scores = Game::multirun(names, *is, 100);
	//cout<<"     Name    Score  Victories"<<endl;
	//cout<<"================================"<<endl;
	vector<int> points;
	vector<int> wins;
	for (pair<int,int> p : scores) {
		points.push_back(p.first);
		wins.push_back(p.second);
	}
	cout << "{";
        cout << "scores : " <<  score_to_JSON(names,points) << "," << endl;
        cout << "wins : " << score_to_JSON(names,wins) << endl;
	cout << "}";
        //for(int i = 0; i < scores.size(); i++)
	//	cout<<setw(10)<<names[i]<<": "<<setw(5)<<scores[i].first<<" "<<setw(3)<<scores[i].second<<endl;
	cout << "]}";
    }
    else
		Game::run(names, *is, *os, *osdeb);

    if (ifile) delete is;
    if (ofile) delete os;
	delete osdeb;
}

