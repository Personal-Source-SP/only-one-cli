package wizard

import (
	"os"
	"path/filepath"
	"testing"
)

func TestWizardScannerAndModel(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "only-one-wizard-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	assetsDir := filepath.Join(tempDir, "assets")
	skillsDir := filepath.Join(assetsDir, "agents", "skills", "test-skill")
	_ = os.MkdirAll(skillsDir, 0o755)
	_ = os.WriteFile(filepath.Join(skillsDir, "SKILL.md"), []byte("# Test Skill"), 0o644)

	workspaceDir := filepath.Join(tempDir, "workspace")
	_ = os.MkdirAll(workspaceDir, 0o755)

	items := ScanWorkspaceAssets(workspaceDir, assetsDir)
	if len(items) == 0 {
		t.Fatalf("Expected at least 1 scanned item, got 0")
	}

	found := false
	for _, it := range items {
		if it.ID == "test-skill" && it.Category == CategorySkills {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("Expected to find 'test-skill' in scanned items")
	}

	m := New(workspaceDir)
	if m.focusSidebar != true {
		t.Errorf("Expected initial focus to be sidebar")
	}
}
