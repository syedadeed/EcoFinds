package main

import (
	"fmt"
	"log"
	"net/http"
)

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}
	username := r.FormValue("username")
	password := r.FormValue("password")
	fmt.Printf("Received login - Username: %s, Password: %s\n", username, password)
	fmt.Fprintf(w, "Login received for user: %s\n", username)
}

func main() {
	http.HandleFunc("/login", loginHandler)
	port := ":8001"
	fmt.Printf("Server running on port %s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
