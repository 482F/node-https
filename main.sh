#/bin/bash

set -ue -o pipefail

SCRIPT_DIR=$(cd $(dirname "${0}"); pwd)
HTTP_JS="${SCRIPT_DIR}/http.js"
SCNAME="node-http"

start(){
    screen -AmdS ${SCNAME} node "${HTTP_JS}" "${@}"
}

stop(){
    pid=$(pgrep -f "AmdS ${SCNAME}")
    kill "${pid}"
}

attach(){
    screen -r "${SCNAME}"
}


case "${1}" in
start)
    shift
    start "${@}"
    ;;
stop)
    stop
    ;;
reload)
    stop || true
    shift
    start "${@}"
    ;;
attach)
    attach
    ;;
*)
    ;;
esac
