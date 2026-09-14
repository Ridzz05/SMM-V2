package config

import (
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

	return &Config{
		Port:          port,
		DatabasePath:  envOr("DB_PATH", "database.sqlite"),
		UploadDir:     envOr("UPLOAD_DIR", "uploads"),
		SessionSecret: envOr("SESSION_SECRET", "smm-secret-key-fitos-enterprise-2026"),
		AdminEmail:    envOr("ADMIN_EMAIL", "admin@solusimitramandiri.com"),
		AdminPassword: envOr("ADMIN_PASSWORD", "admin123"),
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
