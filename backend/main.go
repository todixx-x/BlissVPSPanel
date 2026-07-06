package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/websocket"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Stats struct {
	CPU     float64 `json:"cpu"`
	RAM     float64 `json:"ram"`
	Disk    float64 `json:"disk"`
	NetIn   uint64  `json:"net_in"`
	NetOut  uint64  `json:"net_out"`
	Time    string  `json:"time"`
}

func getStats() Stats {
	c, _ := cpu.Percent(time.Second, false)
	m, _ := mem.VirtualMemory()
	d, _ := disk.Usage("/")
	n, _ := net.IOCounters(false)

	cpuVal := 0.0
	if len(c) > 0 {
		cpuVal = c[0]
	}

	return Stats{
		CPU:    cpuVal,
		RAM:    m.UsedPercent,
		Disk:   d.UsedPercent,
		NetIn:  n[0].BytesRecv,
		NetOut: n[0].BytesSent,
		Time:   time.Now().Format("15:04:05"),
	}
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	for {
		stats := getStats()
		if err := conn.WriteJSON(stats); err != nil {
			break
		}
		time.Sleep(2 * time.Second)
	}
}

func main() {
	// Serve static frontend files
	fs := http.FileServer(http.Dir("../frontend/dist"))
	http.Handle("/", fs)

	// API Endpoints
	http.HandleFunc("/ws/stats", statsHandler)
	http.HandleFunc("/api/docker/list", dockerListHandler)
	http.HandleFunc("/api/docker/action", dockerActionHandler)
	http.HandleFunc("/ws/docker/logs", dockerLogsHandler)
	http.HandleFunc("/api/files/list", fileListHandler)
	http.HandleFunc("/api/files/read", fileReadHandler)
	http.HandleFunc("/api/files/write", fileWriteHandler)
	http.HandleFunc("/ws/terminal", terminalHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("BlissPanel starting on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
