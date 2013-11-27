#ifndef Utils_hh
#define Utils_hh

#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
#include <map>
#include <set>
#include <queue>
#include <limits>
#include <cassert>
#include <cstdlib>
#include <cerrno>
#include <time.h>
#include <sys/time.h>
#include <sys/resource.h>

#include "BackTrace.hh"

using namespace std;




/**
 * Defines customized error macros.
 * (somehow adapted from err.h and error.h)
 */

#define myerror_at_line(status, error, file, line, ...) { fprintf(stderr, "Error at %s:%i: ", file, line); fprintf(stderr, __VA_ARGS__); if (error) perror(" errno"); fprintf(stderr, "\n"); exit(status); }
#define myerr(...) myerror_at_line(EXIT_FAILURE, errno, __FILE__, __LINE__, __VA_ARGS__)
#define myerrx(...) myerror_at_line(EXIT_FAILURE, 0, __FILE__, __LINE__, __VA_ARGS__)


/**
 * Hard assert.
 */
#define check(b) { if (not (b)) {BackTrace::print(); myerror_at_line(EXIT_FAILURE, errno, __FILE__, __LINE__, "Assertion `" #b "' failed in check()."); }}


/**
 * We use a macro to specifically indicate when something is unused,
 * thus the compiler doesn't cry when using NDEBUG.
 */

#define _unused(x) ((void)x)


/**
 * We use a macro to specifically indicate when some code is unreachable,
 * thus the compiler doesn't cry when using NDEBUG.
 */
#define _unreachable() { assert(0); myerrx("unreachable code reached."); }



/**
 * Defines an infinite for doubles.
 */
const double infinite = numeric_limits<double>::infinity();

/**
 * Defines maxint for ints.
 */
const int maxint = numeric_limits<int>::max();


/**
 * Conversion: string to int.
 */
inline int s2i (const string& s) {
    istringstream iss(s);
    int i;
    iss >> i;
    return i;
}


/**
 * Conversion: int to string
 */
inline string i2s (int i) {
    ostringstream oss;
    oss << i;
    return oss.str();
}


/**
 * Size as int.
 */
template <typename T>
inline int sze (T& x) {
    return int(x.size());
}



typedef unsigned int uint;



#endif
