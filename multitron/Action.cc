#include "Action.hh"
#include "Board.hh"

using namespace std;

Action::Action (istream& is) {

    // Warning: all read operations must be checked for SecGame.

    u_ = set<int>();
    q_ = queue<Movement>();

    int i;
    if (is >> i) {
        while (i != -1) {
            int v;
			bool b;
            if (is >> v >> b) {
                q_.push(Movement(i, v, b));
                u_.insert(i);
                if (!(is >> i)) {
					return;
                }
            } else {
                return;
            }
        }
    }
}

void Action::print (ostream& os) const {
    queue<Movement> qq = q_;
    while (not qq.empty()) {
        Movement m = qq.front(); qq.pop();
		//We should not print a -1
		if (m.unit_id == -1) m.unit_id = -99;
		if (m.next_vertex == -1) m.next_vertex = -99;
        os << m.unit_id << " " << m.next_vertex << " " << m.use_bonus << endl;
    }
    os << -1 << endl;
}

