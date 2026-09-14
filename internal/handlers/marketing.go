package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"net/mail"
	"strings"

	"gorm.io/gorm"

	"pt-solusi-mitra-mandiri/internal/models"
)

type MarketingHandler struct {
	DB *gorm.DB
}

func NewMarketingHandler(db *gorm.DB) *MarketingHandler {
	return &MarketingHandler{DB: db}
}

type LandingResponse struct {
	Founders []models.CompanyFounder `json:"founders"`
	Partners []models.GymPartner     `json:"partners"`
}

// Landing menyajikan seluruh data dinamis halaman publik dalam satu payload.
func (h *MarketingHandler) Landing(w http.ResponseWriter, r *http.Request) {
	founders := []models.CompanyFounder{}
	if err := h.DB.Where("is_active = ?", true).Order("order_position asc").Find(&founders).Error; err != nil {
		log.Printf("Gagal memuat founders: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal memuat data halaman.")
		return
	}

	partners := []models.GymPartner{}
	if err := h.DB.Where("is_active = ?", true).Order("created_at desc").Find(&partners).Error; err != nil {
		log.Printf("Gagal memuat mitra gym: %v", err)
		writeError(w, http.StatusInternalServerError, "Gagal memuat data halaman.")
		return
	}

	writeJSON(w, http.StatusOK, LandingResponse{Founders: founders, Partners: partners})
}

type demoRequestPayload struct {
	CompanyName string `json:"company_name"`
	PicName     string `json:"pic_name"`
	PhoneNumber string `json:"phone_number"`
	Email       string `json:"email"`
	Notes       string `json:"notes"`
}

type messageResponse struct {
	Message string `json:"message"`
}

func (h *MarketingHandler) RequestDemo(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)

	var payload demoRequestPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "Format permintaan tidak valid.")
		return
	}

	payload.CompanyName = strings.TrimSpace(payload.CompanyName)
	payload.PicName = strings.TrimSpace(payload.PicName)
	payload.PhoneNumber = strings.TrimSpace(payload.PhoneNumber)
	payload.Email = strings.TrimSpace(payload.Email)
	payload.Notes = strings.TrimSpace(payload.Notes)

	fields := map[string]string{}
	if payload.CompanyName == "" {
		fields["company_name"] = "Nama perusahaan atau gym wajib diisi."
	} else if len(payload.CompanyName) > 255 {
		fields["company_name"] = "Nama perusahaan maksimal 255 karakter."
	}

	if payload.PicName == "" {
		fields["pic_name"] = "Nama penanggung jawab wajib diisi."
	} else if len(payload.PicName) > 255 {
		fields["pic_name"] = "Nama penanggung jawab maksimal 255 karakter."
	}

	if payload.PhoneNumber == "" {
		fields["phone_number"] = "Nomor telepon atau WhatsApp wajib diisi."
	} else if len(payload.PhoneNumber) > 50 {
		fields["phone_number"] = "Nomor telepon maksimal 50 karakter."
	}

	if payload.Email == "" {
		fields["email"] = "Alamat email wajib diisi."
	} else if len(payload.Email) > 255 {
		fields["email"] = "Alamat email maksimal 255 karakter."
	} else if _, err := mail.ParseAddress(payload.Email); err != nil {
		fields["email"] = "Format alamat email tidak valid."
	}

	if len(fields) > 0 {
		writeFieldErrors(w, http.StatusUnprocessableEntity, "Mohon lengkapi data yang ditandai.", fields)
		return
	}

	demoReq := models.B2BDemoRequest{
		CompanyName: payload.CompanyName,
		PicName:     payload.PicName,
		PhoneNumber: payload.PhoneNumber,
		Email:       payload.Email,
		Notes:       payload.Notes,
		Status:      "pending",
	}

	if err := h.DB.Create(&demoReq).Error; err != nil {
		log.Printf("Gagal menyimpan demo request: %v", err)
		writeError(w, http.StatusInternalServerError, "Terjadi kesalahan sistem saat menyimpan pengajuan demo.")
		return
	}

	writeJSON(w, http.StatusCreated, messageResponse{
		Message: "Permintaan demo berhasil dikirim! Tim sales PT Solusi Mitra Mandiri akan segera menghubungi Anda.",
	})
}
