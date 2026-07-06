package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/moby/moby/client"
)

func dockerListHandler(w http.ResponseWriter, r *http.Request) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cli.Close()

	result, err := cli.ContainerList(context.Background(), client.ContainerListOptions{All: true})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(result.Items)
}

func dockerActionHandler(w http.ResponseWriter, r *http.Request) {
	action := r.URL.Query().Get("action")
	id := r.URL.Query().Get("id")

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cli.Close()

	ctx := context.Background()
	var actionErr error

	switch action {
	case "start":
		_, actionErr = cli.ContainerStart(ctx, id, client.ContainerStartOptions{})
	case "stop":
		_, actionErr = cli.ContainerStop(ctx, id, client.ContainerStopOptions{})
	case "restart":
		_, actionErr = cli.ContainerRestart(ctx, id, client.ContainerRestartOptions{})
	}

	if actionErr != nil {
		http.Error(w, actionErr.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func dockerLogsHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return
	}
	defer cli.Close()

	options := client.ContainerLogsOptions{ShowStdout: true, ShowStderr: true, Follow: true, Tail: "100"}
	out, err := cli.ContainerLogs(context.Background(), id, options)
	if err != nil {
		return
	}
	defer out.Close()

	buf := make([]byte, 1024)
	for {
		n, err := out.Read(buf)
		if n > 0 {
			if err := conn.WriteMessage(websocket.TextMessage, buf[:n]); err != nil {
				break
			}
		}
		if err != nil {
			break
		}
	}
}
