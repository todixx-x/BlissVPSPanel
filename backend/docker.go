package main

import (
	"context"
	"encoding/json"
	"io"
	"net/http"

	"github.com/docker/go-connections/nat"
	"github.com/moby/moby/api/types"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
)

func dockerListHandler(w http.ResponseWriter, r *http.Request) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cli.Close()

	containers, err := cli.ContainerList(context.Background(), container.ListOptions{All: true})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(containers)
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
		actionErr = cli.ContainerStart(ctx, id, container.StartOptions{})
	case "stop":
		actionErr = cli.ContainerStop(ctx, id, container.StopOptions{})
	case "restart":
		actionErr = cli.ContainerRestart(ctx, id, container.RestartOptions{})
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

	options := container.LogsOptions{ShowStdout: true, ShowStderr: true, Follow: true, Tail: "100"}
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
