package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

// APIError adalah amplop error seragam untuk seluruh endpoint JSON.
// Fields hanya diisi untuk kegagalan validasi input.
type APIError struct {
	Error  string            `json:"error"`
	Fields map[string]string `json:"fields,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)

	if payload == nil {
		return
	}

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("Gagal menulis respons JSON: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, APIError{Error: message})
}

func writeFieldErrors(w http.ResponseWriter, status int, message string, fields map[string]string) {
	writeJSON(w, status, APIError{Error: message, Fields: fields})
}
