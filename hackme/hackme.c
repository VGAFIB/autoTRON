#include<unistd.h>
#include<stdlib.h>
#include<stdio.h>
#include<error.h>
#include<sys/time.h> 
#include<sys/resource.h> 

void check(const char* what, int x)
{
	if(x != 0)
	{
		perror(what);
		exit(1);
	}
}

void mysetrlimit(int resource, int val)
{
	struct rlimit l;
	
	l.rlim_cur = val;
	l.rlim_max = val;
	
	check("setrlimit", setrlimit(resource, &l));
}

int main(int argc, char** argv)
{

	if (geteuid()) {
		fprintf(stderr, "The sandbox is not seteuid root, aborting\n");
		return EXIT_FAILURE;
	}

	if (!getuid()) {
		fprintf(stderr, "The sandbox is not designed to be run by root, aborting\n");
		return EXIT_FAILURE;
	}

  	mysetrlimit(RLIMIT_CPU, 10);
	mysetrlimit(RLIMIT_NOFILE, 10);	
	mysetrlimit(RLIMIT_NPROC, 10);
	mysetrlimit(RLIMIT_DATA, 128*1024*1024);
	mysetrlimit(RLIMIT_STACK, 16*1024*1024);
	
	//check("chroot", chroot("jail"));
	//check("chdir", chdir("/"));
	setuid(1002);
	setgid(1002);
	
	execvp(argv[1], argv+1);
	perror("execvp");
}

