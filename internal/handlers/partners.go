package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"

	"pt-solusi-mitra-mandiri/internal/models"
)

const (
	maxLogoBytes    = 5 << 20
	maxRequestBytes = maxLogoBytes + (1 << 20)
)

// allowedLogoTypes memetakan hasil deteksi konten ke ekstensi yang diizinkan.
// Ekstensi nama berkas saja tidak cukup: berkas HTML/SVG yang di-rename menjadi
// .png akan tersaji sebagai halaman aktif dari folder /uploads.
var allowedLogoTypes = map[string]string{
	"image/png":  ".png",
	"image/jpeg": ".jpg",
	"image/webp": ".webp",
}

type PartnersHandler struct {
	DB        *gorm.DB
	UploadDir string
}

func NewPartnersHandler(db *gorm.DB, uploadDir string) *PartnersHandler {
	return &PartnersHandler{DB: db, UploadDir: uploadDir}
}

type PartnersResponse struct {
	Partners     []models.GymPartner     `json:"partners"`
	DemoRequests []models.B2BDemoRequest `json:"demoRequests"`
}

func (h *PartnersHandler) Index(w http.ResponseWriter, r *http.Request) {
	partners := []models.GymPartner{}
	if err := h.DB.Order("created_at desc").Find(&partners).Error; err != nil {
		log.Printf("Gagal memuat mitra gym: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal memuat daftar mitra gym.")
		return
	}

	demoRequests := []models.B2BDemoRequest{}
	if err := h.DB.Order("created_at desc").Find(&demoRequests).Error; err != nil {
		log.Printf("Gagal memuat permintaan demo: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal memuat daftar permintaan demo.")
		return
	}

	writeJSON(w, http.StatusOK, PartnersResponse{Partners: partners, DemoRequests: demoRequests})
}

func (h *PartnersHandler) Create(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)

	if err := r.ParseMultipartForm(maxRequestBytes); err != nil {
		writeError(w, http.StatusRequestEntityTooLarge, "Logo terlalu besar. Maksimal 5 MB — coba perkecil dulu gambarnya.")
		return
	}

	name := strings.TrimSpace(r.FormValue("name"))
	if name == "" {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Nama gym mitra belum diisi.", map[string]string{
			"name": "Isi dulu nama gym mitra.",
		})
		return
	}
	if len(name) > 120 {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Nama gym mitra terlalu panjang.", map[string]string{
			"name": "Nama gym mitra terlalu panjang (maksimal 120 huruf).",
		})
		return
	}

	file, header, err := r.FormFile("logo")
	if err != nil {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Berkas logo belum dipilih.", map[string]string{
			"logo": "Pilih dulu berkas logo yang mau diunggah.",
		})
		return
	}
	defer file.Close()

	if header.Size > maxLogoBytes {
		writeFieldErrors(w, http.StatusRequestEntityTooLarge, "Ukuran logo melebihi batas.", map[string]string{
			"logo": "Logo terlalu besar. Maksimal 5 MB — coba perkecil dulu gambarnya.",
		})
		return
	}

	head := make([]byte, 512)
	n, err := io.ReadFull(file, head)
	if err != nil && err != io.ErrUnexpectedEOF && err != io.EOF {
		log.Printf("Gagal membaca berkas logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Berkas logo tidak bisa dibaca. Coba unggah ulang.")
		return
	}
	head = head[:n]

	ext, ok := allowedLogoTypes[detectContentType(head)]
	if !ok {
		writeFieldErrors(w, http.StatusUnsupportedMediaType, "Berkas ini bukan gambar yang didukung.", map[string]string{
			"logo": "Pakai berkas gambar PNG, JPG, atau WebP.",
		})
		return
	}

	targetDir := filepath.Join(h.UploadDir, "gym-partners")
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		log.Printf("Gagal membuat direktori upload: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menyiapkan tempat penyimpanan logo. Coba lagi.")
		return
	}

	filename := fmt.Sprintf("partner_%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(targetDir, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("Gagal menyimpan file logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menyimpan logo. Coba unggah ulang.")
		return
	}

	if _, err := io.Copy(dst, io.MultiReader(bytes.NewReader(head), file)); err != nil {
		dst.Close()
		os.Remove(filePath)
		log.Printf("Gagal copy isi file logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Unggahan logo terputus. Periksa koneksi lalu coba lagi.")
		return
	}

	if err := dst.Close(); err != nil {
		os.Remove(filePath)
		log.Printf("Gagal menutup file logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menyimpan logo. Coba unggah ulang.")
		return
	}

	partner := models.GymPartner{
		Name:     name,
		LogoPath: fmt.Sprintf("/uploads/gym-partners/%s", filename),
		IsActive: true,
	}

	if err := h.DB.Create(&partner).Error; err != nil {
		os.Remove(filePath)
		log.Printf("Gagal menyimpan data partner ke DB: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menyimpan data mitra. Coba unggah ulang.")
		return
	}

	writeJSON(w, http.StatusCreated, messageResponse{
		Message: fmt.Sprintf("Logo %s sudah tayang di halaman publik.", name),
	})
}

func (h *PartnersHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID mitra tidak valid.")
		return
	}

	var partner models.GymPartner
	if err := h.DB.First(&partner, uint(id)).Error; err != nil {
		writeError(w, http.StatusNotFound, "Mitra tidak ditemukan.")
		return
	}

	if err := h.DB.Delete(&partner).Error; err != nil {
		log.Printf("Gagal menghapus mitra dari DB: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menghapus mitra. Coba lagi.")
		return
	}

	if rel, ok := strings.CutPrefix(partner.LogoPath, "/uploads/"); ok && !strings.Contains(rel, "..") {
		if err := os.Remove(filepath.Join(h.UploadDir, filepath.FromSlash(rel))); err != nil && !os.IsNotExist(err) {
			log.Printf("Peringatan: gagal menghapus berkas logo %s: %v", partner.LogoPath, err)
		}
	}

	writeJSON(w, http.StatusOK, messageResponse{
		Message: fmt.Sprintf("Mitra %s sudah dihapus dari daftar.", partner.Name),
	})
}

type UpdateDemoRequestInput struct {
	Status string `json:"status"`
	Notes  string `json:"notes"`
}

func (h *PartnersHandler) UpdateDemoRequest(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 32)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID permintaan demo tidak valid.")
		return
	}

	var req models.B2BDemoRequest
	if err := h.DB.First(&req, uint(id)).Error; err != nil {
		writeError(w, http.StatusNotFound, "Permintaan demo tidak ditemukan.")
		return
	}

	var input UpdateDemoRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Format JSON tidak valid.")
		return
	}

	updates := map[string]interface{}{}
	if input.Status != "" {
		allowedStatuses := map[string]bool{
			"pending":   true,
			"contacted": true,
			"scheduled": true,
			"completed": true,
			"cancelled": true,
		}
		if !allowedStatuses[input.Status] {
			writeError(w, http.StatusBadRequest, "Status tidak valid. Pilihan: pending, contacted, scheduled, completed, cancelled.")
			return
		}
		updates["status"] = input.Status
		req.Status = input.Status
	}

	if input.Notes != "" {
		updates["notes"] = input.Notes
		req.Notes = input.Notes
	}

	if len(updates) > 0 {
		if err := h.DB.Model(&req).Updates(updates).Error; err != nil {
			log.Printf("Gagal memperbarui status permintaan demo: %v", err)
			writeError(w, http.StatusInternalServerError, "Gagal menyimpan perubahan. Silakan coba lagi.")
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message":     "Perubahan sudah disimpan.",
		"demoRequest": req,
	})
}
// detectContentType membungkus http.DetectContentType agar teks biasa yang
// dikirim tanpa header tetap tertolak alih-alih dianggap gambar.
func detectContentType(head []byte) string {
	if len(head) == 0 {
		return ""
	}
	return http.DetectContentType(head)
}
