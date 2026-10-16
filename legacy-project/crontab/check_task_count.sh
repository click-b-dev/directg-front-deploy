#!/bin/bash
CONN_COUNT=$(ss -tn state established | grep ':443' | wc -l)
FPM_COUNT=$(ps aux | grep php-fpm | grep -v grep | wc -l)
MEM=$(free -m | awk 'NR==2{print $3}')
echo -e "$(date) / https: $CONN_COUNT / fpm: $FPM_COUNT / mem: ${MEM}MB" >> /home/dgkrshop/www/log/apache/task_count.txt