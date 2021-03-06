#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

int main()
{
    int i;
    char command[128], file[100];
    struct stat st;
    printf("--------------------------------------\n");
    printf("Welcome to dew, the file size utility.\n");
    printf("   I have written it from scratch.\n");
    printf("--------------------------------------\n\n");
    printf("Enter file name: ");
    scanf("%99s", file);
    for (i = 0; i < 100; i++) {
        if (file[i] == '\0') break;
        if (file[i] == '\'') {
            file[i] = '\0';
            break;
        }
    }
    snprintf(command, 128, "du -h '%s' 2> /dev/null", file);
    if(!stat(file, &st)) {
        if(system(command)) {
            fprintf(stderr, "Error\n");
            exit(1);
        }
    }
    else {
        fprintf(stderr, "Invalid file name\n");
        exit(1);
    }
    return 0;
}
