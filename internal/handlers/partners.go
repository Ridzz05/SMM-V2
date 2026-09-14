package handlers

import (
	"bytes"
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
		writeError(w, http.StatusRequestEntityTooLarge, "Ukuran berkas logo terlalu besar (maksimal 5 MB).")
		return
	}

	name := strings.TrimSpace(r.FormValue("name"))
	if name == "" {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Nama gym mitra wajib diisi.", map[string]string{
			"name": "Nama gym mitra wajib diisi.",
		})
		return
	}
	if len(name) > 120 {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Nama gym mitra terlalu panjang.", map[string]string{
			"name": "Nama gym mitra maksimal 120 karakter.",
		})
		return
	}

	file, header, err := r.FormFile("logo")
	if err != nil {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Berkas logo wajib diunggah.", map[string]string{
			"logo": "Berkas logo wajib diunggah.",
		})
		return
	}
	defer file.Close()

	if header.Size > maxLogoBytes {
		writeFieldErrors(w, http.StatusRequestEntityTooLarge, "Ukuran berkas logo terlalu besar.", map[string]string{
			"logo": "Ukuran berkas logo maksimal 5 MB.",
		})
		return
	}

	head := make([]byte, 512)
	n, err := io.ReadFull(file, head)
	if err != nil && err != io.ErrUnexpectedEOF && err != io.EOF {
		log.Printf("Gagal membaca berkas logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal membaca berkas logo.")
		return
	}
	head = head[:n]

	ext, ok := allowedLogoTypes[detectContentType(head)]
	if !ok {
		writeFieldErrors(w, http.StatusUnsupportedMediaType, "Format berkas tidak didukung.", map[string]string{
			"logo": "Gunakan berkas gambar PNG, JPG, atau WebP yang valid.",
		})
		return
	}

	targetDir := filepath.Join(h.UploadDir, "gym-partners")
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		log.Printf("Gagal membuat direktori upload: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menyiapkan direktori penyimpanan server.")
		return
	}

	filename := fmt.Sprintf("partner_%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(targetDir, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("Gagal menyimpan file logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menulis file logo ke server.")
		return
	}

	if _, err := io.Copy(dst, io.MultiReader(bytes.NewReader(head), file)); err != nil {
		dst.Close()
		os.Remove(filePath)
		log.Printf("Gagal copy isi file logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal mengunggah file.")
		return
	}

	if err := dst.Close(); err != nil {
		os.Remove(filePath)
		log.Printf("Gagal menutup file logo: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal menyimpan file logo.")
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
		writeError(w, http.StatusInternalServerError, "Gagal mencatat mitra ke database.")
		return
	}

	writeJSON(w, http.StatusCreated, messageResponse{
		Message: fmt.Sprintf("Logo mitra '%s' berhasil diterbitkan!", name),
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
		writeError(w, http.StatusInternalServerError, "Gagal menghapus mitra dari database.")
		return
	}

	if rel, ok := strings.CutPrefix(partner.LogoPath, "/uploads/"); ok && !strings.Contains(rel, "..") {
		if err := os.Remove(filepath.Join(h.UploadDir, filepath.FromSlash(rel))); err != nil && !os.IsNotExist(err) {
			log.Printf("Peringatan: gagal menghapus berkas logo %s: %v", partner.LogoPath, err)
		}
	}

	writeJSON(w, http.StatusOK, messageResponse{
		Message: fmt.Sprintf("Mitra '%s' berhasil dihapus.", partner.Name),
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
