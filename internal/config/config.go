package config

import (
	"log"
	"os"
	"strings"
)

type Config struct {
	Port           string
	DatabasePath   string
	UploadDir      string
	SessionSecret  string
	AdminEmail     string
	AdminPassword  string
	PublicSiteURL  string
	AllowedOrigins []string
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if port[0] != ':' {
		port = ":" + port
	}

	// Cookie sesi ditandatangani dengan kunci ini. Nilai bawaan yang ikut
	// ter-commit membuat siapa pun yang membaca repositori bisa menempa cookie
	// admin, jadi server menolak start tanpa kunci yang diberikan operator.
	sessionSecret := os.Getenv("SESSION_SECRET")
	if sessionSecret == "" {
		log.Fatal("SESSION_SECRET belum disetel. Bangkitkan dengan `openssl rand -base64 48` lalu ekspor sebelum menjalankan server.")
	}

	return &Config{
		Port:          port,
		DatabasePath:  envOr("DB_PATH", "database.sqlite"),
		UploadDir:     envOr("UPLOAD_DIR", "uploads"),
		SessionSecret: sessionSecret,
		AdminEmail:    envOr("ADMIN_EMAIL", "admin@solusimitramandiri.com"),
		// Sengaja tanpa nilai bawaan: akun admin hanya di-seed bila operator
		// menyetel kata sandinya sendiri.
		AdminPassword: os.Getenv("ADMIN_PASSWORD"),
		// Frontend Next.js adalah satu-satunya pintu masuk pengunjung; root API
		// mengarahkan ke sana agar tidak ada dua halaman publik yang berbeda.
		PublicSiteURL:  envOr("PUBLIC_SITE_URL", "http://localhost:3000"),
		AllowedOrigins: splitOrigins(envOr("ALLOWED_ORIGINS", "http://localhost:3000")),
	}
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func splitOrigins(raw string) []string {
	origins := []string{}
	for _, origin := range strings.Split(raw, ",") {
		if trimmed := strings.TrimSpace(origin); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}
