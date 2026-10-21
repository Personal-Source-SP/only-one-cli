package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type CleanPolicy struct {
	Enabled        bool   `json:"enabled"`
	Trigger        string `json:"trigger"`
	ThresholdCount int    `json:"thresholdCount"`
}

type PhaseRoute struct {
	Pane string `json:"pane"`
	CLI  string `json:"cli"`
}

type AgentRouting struct {
	Concept PhaseRoute `json:"concept"`
	Plan    PhaseRoute `json:"plan"`
	Apply   PhaseRoute `json:"apply"`
	Debug   PhaseRoute `json:"debug"`
	Review  PhaseRoute `json:"review"`
	Clean   PhaseRoute `json:"clean"`
}

type GlobalConfig struct {
	SchemaVersion int          `json:"schemaVersion"`
	CleanPolicy   CleanPolicy  `json:"cleanPolicy"`
	AgentRouting  AgentRouting `json:"agentRouting"`
}

func DefaultConfig() GlobalConfig {
	return GlobalConfig{
		SchemaVersion: 1,
		CleanPolicy: CleanPolicy{
			Enabled:        true,
			Trigger:        "threshold",
			ThresholdCount: 5,
		},
		AgentRouting: AgentRouting{
			Concept: PhaseRoute{Pane: "auto", CLI: "agy"},
			Plan:    PhaseRoute{Pane: "auto", CLI: "agy"},
			Apply:   PhaseRoute{Pane: "auto", CLI: "codex"},
			Debug:   PhaseRoute{Pane: "auto", CLI: "claude"},
			Review:  PhaseRoute{Pane: "auto", CLI: "claude"},
			Clean:   PhaseRoute{Pane: "auto", CLI: "agy"},
		},
	}
}

func GetConfigPath() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".only-one", "config.json")
}

func LoadConfig() GlobalConfig {
	p := GetConfigPath()
	raw, err := os.ReadFile(p)
	if err != nil {
		return DefaultConfig()
	}
	var cfg GlobalConfig
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return DefaultConfig()
	}
	return cfg
}

func SaveConfig(cfg GlobalConfig) error {
	p := GetConfigPath()
	_ = os.MkdirAll(filepath.Dir(p), 0755)
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, data, 0644)
}
