#!/bin/bash
LS_OUTPUT=$(ss -tn state established | grep ':443' | wc -l)

echo -e "$(date) / https-connection: $LS_OUTPUT" >> /home/dgkrshop/www/log/apache/max_connection.txt