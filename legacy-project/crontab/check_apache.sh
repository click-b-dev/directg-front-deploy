#!/bin/bash

MAX_CONNECTIONS=40
CURRENT_CONNECTIONS=$(netstat -an | grep :443 | grep ESTABLISHED | wc -l)
RECIPIENT_EMAIL="kch1012@h2int.com"

if [ "$CURRENT_CONNECTIONS" -gt "$MAX_CONNECTIONS" ]; then
    echo "경고: Apache 동시 접속자 수가 임계값 $MAX_CONNECTIONS 명을 초과했습니다. 현재 접속자 수: $CURRENT_CONNECTIONS 명" | mail -s "[ALERT] Apache Connection Overload" $RECIPIENT_EMAIL
fi
