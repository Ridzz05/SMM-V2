package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/gorilla/sessions"

	"pt-solusi-mitra-mandiri/internal/config"
	"pt-solusi-mitra-mandiri/internal/database"
	"pt-solusi-mitra-mandiri/internal/handlers"
	"pt-solusi-mitra-mandiri/internal/middleware"
)

func main() {
	cfg := config.LoadConfig()

	// 1. Inisialisasi Database SQLite & Seeders
	db := database.InitDB(cfg)

	// 2. Inisialisasi Cookie Session Store
	sessionStore := sessions.NewCookieStore([]byte(cfg.SessionSecret))
	sessionStore.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 hari
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	// 3. Inisialisasi Handlers
	marketingHandler := handlers.NewMarketingHandler(db)
	authHandler := handlers.NewAuthHandler(db, sessionStore)
	partnersHandler := handlers.NewPartnersHandler(db, cfg.UploadDir)

	// Pastikan folder uploads ada
	if err := os.MkdirAll(filepath.Join(cfg.UploadDir, "gym-partners"), 0o755); err != nil {
		log.Fatalf("Gagal menyiapkan direktori upload: %v", err)
	}

	// 4. Inisialisasi Router Chi
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// Frontend Next.js mem-proxy seluruh permintaan API sehingga browser selalu
	// berada pada origin yang sama; CORS hanya diperlukan untuk pemakaian langsung.
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// 5. Static File Handlers (aset media dilayani Go, halaman dilayani Next.js)
	fileServer(r, "/uploads", http.Dir(cfg.UploadDir))
	fileServer(r, "/images", http.Dir("public/images"))
	fileServer(r, "/videos", http.Dir("public/videos"))

	// 6. Root mengarahkan ke frontend Next.js
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, cfg.PublicSiteURL, http.StatusTemporaryRedirect)
	})

	// 7. API JSON
	r.Route("/api", func(api chi.Router) {
		api.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Write([]byte(`{"status":"ok"}`))
		})

		api.Get("/landing", marketingHandler.Landing)
		api.Post("/demo-requests", marketingHandler.RequestDemo)

		api.Post("/admin/login", authHandler.LoginSubmit)
		api.Post("/admin/logout", authHandler.Logout)

		api.Group(func(admin chi.Router) {
			admin.Use(middleware.RequireAdminAuth(sessionStore))

			admin.Get("/admin/me", authHandler.Me)
			admin.Get("/admin/partners", partnersHandler.Index)
			admin.Post("/admin/partners", partnersHandler.Create)
			admin.Delete("/admin/partners/{id}", partnersHandler.Delete)
			admin.Patch("/admin/demo-requests/{id}", partnersHandler.UpdateDemoRequest)
		})
	})

	// 8. Jalankan Web Server Go
	addr := cfg.Port
	fmt.Println("==========================================================")
	fmt.Printf("🚀 API Go PT Solusi Mitra Mandiri berjalan di port %s\n", addr)
	fmt.Printf("🌐 Landing Page (Next.js): %s/\n", cfg.PublicSiteURL)
	fmt.Printf("🔐 Admin Portal          : %s/admin/login\n", cfg.PublicSiteURL)
	fmt.Println("==========================================================")

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server gagal berjalan: %v", err)
	}
}

// Helper untuk menyajikan direktori statis
func fileServer(r chi.Router, path string, root http.FileSystem) {
	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", http.StatusMovedPermanently).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := rctx.RoutePattern()
		if len(pathPrefix) > 1 && pathPrefix[len(pathPrefix)-1] == '*' {
			pathPrefix = pathPrefix[:len(pathPrefix)-1]
		}
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
