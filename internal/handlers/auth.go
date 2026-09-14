package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"pt-solusi-mitra-mandiri/internal/middleware"
	"pt-solusi-mitra-mandiri/internal/models"
)

// dummyHash dipakai saat email tidak ditemukan agar waktu respons login tetap
// seragam dan tidak membocorkan keberadaan akun.
var dummyHash = func() []byte {
	hash, err := bcrypt.GenerateFromPassword([]byte("smm-dummy-password"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Gagal menyiapkan dummy hash: %v", err)
	}
	return hash
}()

type AuthHandler struct {
	DB    *gorm.DB
	Store *sessions.CookieStore
}

func NewAuthHandler(db *gorm.DB, store *sessions.CookieStore) *AuthHandler {
	return &AuthHandler{DB: db, Store: store}
}

type AdminIdentity struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type adminResponse struct {
	Admin AdminIdentity `json:"admin"`
}

type loginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) LoginSubmit(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)

	var payload loginPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "Format permintaan tidak valid.")
		return
	}

	email := strings.TrimSpace(payload.Email)
	password := payload.Password

	fields := map[string]string{}
	if email == "" {
		fields["email"] = "Alamat email wajib diisi."
	}
	if password == "" {
		fields["password"] = "Kata sandi wajib diisi."
	}
	if len(fields) > 0 {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Email dan kata sandi wajib diisi.", fields)
		return
	}

	const invalidCredentials = "Email atau kata sandi admin tidak sesuai."

	var user models.User
	if err := h.DB.Where("email = ? AND is_admin = ?", email, true).First(&user).Error; err != nil {
		bcrypt.CompareHashAndPassword(dummyHash, []byte(password))
		writeError(w, http.StatusUnauthorized, invalidCredentials)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		writeError(w, http.StatusUnauthorized, invalidCredentials)
		return
	}

	session, err := h.Store.Get(r, "smm_admin_session")
	if err != nil {
		log.Printf("Gagal membuka sesi admin: %v", err)
	}
	session.Values["authenticated"] = true
	session.Values["admin_id"] = user.ID
	session.Values["admin_email"] = user.Email
	session.Values["admin_name"] = user.Name

	if err := session.Save(r, w); err != nil {
		log.Printf("Gagal menyimpan sesi admin: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal membuat sesi login.")
		return
	}

	writeJSON(w, http.StatusOK, adminResponse{Admin: AdminIdentity{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}})
}

// Me mengembalikan identitas admin dari sesi aktif; dipakai frontend untuk
// menentukan status login tanpa harus menebak dari kode status endpoint lain.
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	admin, ok := middleware.GetAdminFromContext(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Sesi admin tidak valid atau telah berakhir.")
		return
	}

	writeJSON(w, http.StatusOK, adminResponse{Admin: AdminIdentity{
		ID:    admin.UserID,
		Name:  admin.Name,
		Email: admin.Email,
	}})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "smm_admin_session")
	if err != nil {
		log.Printf("Gagal membuka sesi admin: %v", err)
	}
	session.Options.MaxAge = -1
	session.Values["authenticated"] = false

	if err := session.Save(r, w); err != nil {
		log.Printf("Gagal menghapus sesi admin: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal mengakhiri sesi.")
		return
	}

	writeJSON(w, http.StatusOK, messageResponse{Message: "Sesi admin berhasil diakhiri."})
}
