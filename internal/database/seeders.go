package database

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"pt-solusi-mitra-mandiri/internal/config"
	"pt-solusi-mitra-mandiri/internal/models"
)

func SeedDefaults(db *gorm.DB, cfg *config.Config) {
	// 1. Seed Admin User
	var count int64
	db.Model(&models.User{}).Where("email = ?", cfg.AdminEmail).Count(&count)
	if count == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Peringatan: Gagal hash password admin: %v", err)
		} else {
			admin := models.User{
				Name:         "Platform Administrator",
				Email:        cfg.AdminEmail,
				PasswordHash: string(hash),
				IsAdmin:      true,
			}
			if err := db.Create(&admin).Error; err != nil {
				log.Printf("Gagal membuat user admin default: %v", err)
			} else {
				log.Printf("Admin default berhasil dibuat: %s", cfg.AdminEmail)
			}
		}
	}

	// 2. Seed Co-Founders jika tabel masih kosong
	var founderCount int64
	db.Model(&models.CompanyFounder{}).Count(&founderCount)
	if founderCount == 0 {
		founders := []models.CompanyFounder{
			{
				Name:          "Andi Adellia",
				Role:          "Director of Product Development",
				ImagePath:     "/images/founders/founder-1.webp",
				Description:   "Memimpin visi strategis dan peta jalan pengembangan ekosistem ERP yang holistik. Berfokus pada automasi alur kerja operasional fasilitas kebugaran.",
				OrderPosition: 1,
				IsActive:      true,
			},
			{
				Name:          "Jonathan Immanuel Alexander",
				Role:          "Chief Technology Officer (CTO)",
				ImagePath:     "/images/founders/founder-2.webp",
				Description:   "Arsitek utama di balik integrasi mutakhir infrastruktur berbasis kecerdasan buatan, Edge AI Biometrics, dan komputasi awan berkinerja tinggi.",
				OrderPosition: 2,
				IsActive:      true,
			},
		}

		for _, f := range founders {
			if err := db.Create(&f).Error; err != nil {
				log.Printf("Gagal menambahkan founder %s: %v", f.Name, err)
			}
		}
		log.Println("Data default co-founders berhasil di-seed.")
	}

	// 3. Seed mitra gym placeholder jika tabel masih kosong. Logo di
	// public/images/partners sudah dinormalkan menjadi kanvas persegi 512 px
	// agar seluruh petak tampil dengan bobot visual yang sama.
	var partnerCount int64
	db.Model(&models.GymPartner{}).Count(&partnerCount)
	if partnerCount == 0 {
		partners := []models.GymPartner{
			{Name: "FitDay Pilates", LogoPath: "/images/partners/fitday-pilates.webp", IsActive: true},
			{Name: "FitDay Studio", LogoPath: "/images/partners/fitday-studio.webp", IsActive: true},
			{Name: "Loyal Fitness", LogoPath: "/images/partners/loyal-fitness.webp", IsActive: true},
			{Name: "The Box Private Gym", LogoPath: "/images/partners/the-box-private-gym.webp", IsActive: true},
			{Name: "The Box Physio", LogoPath: "/images/partners/the-box-physio.webp", IsActive: true},
		}

		// Halaman publik mengurutkan mitra dari yang terbaru, jadi cap waktu
		// ditulis menurun agar urutan tampil sama dengan urutan di atas.
		base := time.Now()
		for i := range partners {
			partners[i].CreatedAt = base.Add(-time.Duration(i) * time.Second)
			if err := db.Create(&partners[i]).Error; err != nil {
				log.Printf("Gagal menambahkan mitra %s: %v", partners[i].Name, err)
			}
		}
		log.Println("Data default mitra gym berhasil di-seed.")
	}
}
