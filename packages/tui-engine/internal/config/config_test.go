package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig()
	if cfg.SchemaVersion != 1 {
		t.Errorf("expected schemaVersion 1, got %d", cfg.SchemaVersion)
	}
	if !cfg.CleanPolicy.Enabled {
		t.Errorf("expected cleanPolicy.enabled true")
	}
	if cfg.AgentRouting.Concept.CLI != "agy" {
		t.Errorf("expected Concept CLI 'agy', got %s", cfg.AgentRouting.Concept.CLI)
	}
}

func TestSaveAndLoadConfig(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "only-one-cfg-test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	origHome := os.Getenv("USERPROFILE")
	if origHome == "" {
		origHome = os.Getenv("HOME")
	}
	defer os.Setenv("USERPROFILE", origHome)

	os.Setenv("USERPROFILE", tmpDir)
	os.Setenv("HOME", tmpDir)

	cfg := DefaultConfig()
	cfg.CleanPolicy.ThresholdCount = 10
	if err := SaveConfig(cfg); err != nil {
		t.Fatalf("failed to save config: %v", err)
	}

	loaded := LoadConfig()
	if loaded.CleanPolicy.ThresholdCount != 10 {
		t.Errorf("expected ThresholdCount 10, got %d", loaded.CleanPolicy.ThresholdCount)
	}

	// Verify file location
	expectedPath := filepath.Join(tmpDir, ".only-one", "config.json")
	if _, err := os.Stat(expectedPath); os.IsNotExist(err) {
		t.Errorf("expected config file at %s", expectedPath)
	}
}
