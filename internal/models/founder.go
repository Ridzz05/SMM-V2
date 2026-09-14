package models

import (
	"time"
)

type CompanyFounder struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:255;not null" json:"name"`
	Role          string    `gorm:"size:255;not null" json:"role"`
	ImagePath     string    `gorm:"size:500;not null" json:"image_path"`
	Description   string    `gorm:"type:text;not null" json:"description"`
	OrderPosition int       `gorm:"default:0" json:"order_position"`
	IsActive      bool      `gorm:"default:true" json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
