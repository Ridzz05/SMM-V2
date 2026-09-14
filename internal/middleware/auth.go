package middleware

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/sessions"
)

type contextKey string

const AdminContextKey = contextKey("admin_user")

type AdminSessionData struct {
	UserID uint
	Email  string
	Name   string
}

// RequireAdminAuth menolak permintaan tanpa sesi admin yang sah dengan
// respons 401 JSON, sehingga frontend dapat mengarahkan ulang ke halaman login.
func RequireAdminAuth(store *sessions.CookieStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			session, err := store.Get(r, "smm_admin_session")
			if err != nil || session.Values["authenticated"] != true {
				w.Header().Set("Content-Type", "application/json; charset=utf-8")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "Sesi admin tidak valid atau telah berakhir.",
				})
				return
			}

			userID, _ := session.Values["admin_id"].(uint)
			email, _ := session.Values["admin_email"].(string)
			name, _ := session.Values["admin_name"].(string)

			ctx := context.WithValue(r.Context(), AdminContextKey, AdminSessionData{
				UserID: userID,
				Email:  email,
				Name:   name,
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetAdminFromContext(r *http.Request) (AdminSessionData, bool) {
	admin, ok := r.Context().Value(AdminContextKey).(AdminSessionData)
	return admin, ok
}
