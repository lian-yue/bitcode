package main

import (
	"log"
	"net/http"
)

func main() {
	server := &http.Server{
		Addr:    ":8080",
		Handler: http.FileServer(http.Dir("dist/")),
	}
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
