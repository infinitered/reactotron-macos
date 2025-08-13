#ifndef PROCESS_UTILS_H
#define PROCESS_UTILS_H

#include <stdio.h>

/**
 * Retrieves the PID of a process created by `popen`.
 *
 * @param pipe The FILE pointer returned by `popen`.
 * @return The PID of the child process, or -1 if an error occurs.
 */
pid_t _get_pid(FILE *pipe);

#endif // PROCESS_UTILS_H
