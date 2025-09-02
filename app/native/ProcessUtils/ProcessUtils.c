#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>

/**
 * Retrieves the PID of a process created by `popen`.
 *
 * @param pipe The FILE pointer returned by `popen`.
 * @return The PID of the child process, or -1 if an error occurs.
 */
pid_t _get_pid(FILE *pipe) {
    if (!pipe) {
        fprintf(stderr, "Invalid pipe.\n");
        return -1;
    }

    // Get the file descriptor from the FILE pointer
    int fd = fileno(pipe);
    if (fd == -1) {
        perror("fileno");
        return -1;
    }

    // Use /proc/self/fd to find the PID of the child process
    char fdPath[64];
    snprintf(fdPath, sizeof(fdPath), "/proc/self/fd/%d", fd);

    char targetPath[1024];
    ssize_t len = readlink(fdPath, targetPath, sizeof(targetPath) - 1);
    if (len == -1) {
        perror("readlink");
        return -1;
    }
    targetPath[len] = '\0'; // Null-terminate the string

    // Extract the PID from the target path
    if (strncmp(targetPath, "/proc/", 6) == 0) {
        char *pidStart = targetPath + 6; // Skip "/proc/"
        char *pidEnd = strchr(pidStart, '/');
        if (pidEnd) {
            *pidEnd = '\0'; // Null-terminate the PID string
            return (pid_t)atoi(pidStart);
        }
    }

    fprintf(stderr, "Failed to parse PID from target path: %s\n", targetPath);
    return -1;
}
