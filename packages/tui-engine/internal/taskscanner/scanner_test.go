package taskscanner

import (
	"os"
	"path/filepath"
	"testing"
)

func TestParseFrontmatter(t *testing.T) {
	content := "---\nstatus: planned\ntitle: Test Task\n---\n# Test Task Heading\nSome body"
	fm, body := ParseFrontmatter(content)

	if status, ok := fm["status"].(string); !ok || status != "planned" {
		t.Errorf("expected status 'planned', got %v", fm["status"])
	}

	if body != "\n# Test Task Heading\nSome body" {
		t.Errorf("unexpected body: %q", body)
	}
}

func TestGroupTasksByColumn(t *testing.T) {
	tasks := []TaskModel{
		{Slug: "task-1", Status: "concept", Title: "Task 1"},
		{Slug: "task-2", Status: "plan", Title: "Task 2"},
		{Slug: "task-3", Status: "processing", Title: "Task 3"},
		{Slug: "task-4", Status: "done", Title: "Task 4"},
	}

	cols := GroupTasksByColumn(tasks)
	if len(cols) != 4 {
		t.Fatalf("expected 4 columns, got %d", len(cols))
	}

	for i, expectedID := range []string{"concept", "plan", "processing", "done"} {
		if cols[i].ID != expectedID {
			t.Errorf("column %d expected id %s, got %s", i, expectedID, cols[i].ID)
		}
		if len(cols[i].Tasks) != 1 {
			t.Errorf("column %s expected 1 task, got %d", expectedID, len(cols[i].Tasks))
		}
	}
}

func TestGetTaskDocs(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "task-doc-test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	conceptPath := filepath.Join(tmpDir, "concept.md")
	_ = os.WriteFile(conceptPath, []byte("# Concept Doc"), 0644)

	docs := GetTaskDocs(tmpDir)
	if len(docs) != 1 {
		t.Fatalf("expected 1 doc, got %d", len(docs))
	}
	if docs[0].Name != "concept.md" || docs[0].Content != "# Concept Doc" {
		t.Errorf("unexpected doc: %+v", docs[0])
	}
}

func TestCleanCompletedTasks(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "task-clean-test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	tasksDir := filepath.Join(tmpDir, "only-one", "tasks")
	doneTaskDir := filepath.Join(tasksDir, "done-task")
	_ = os.MkdirAll(doneTaskDir, 0755)
	_ = os.WriteFile(filepath.Join(doneTaskDir, "plan.md"), []byte("---\nstatus: done\n---\n# Done Task"), 0644)

	cleaned, err := CleanCompletedTasks(tmpDir)
	if err != nil {
		t.Fatalf("clean failed: %v", err)
	}
	if cleaned != 1 {
		t.Errorf("expected 1 cleaned task, got %d", cleaned)
	}

	// Verify moved to archives
	archivedPath := filepath.Join(tmpDir, "only-one", "archives", "done-task")
	if _, err := os.Stat(archivedPath); os.IsNotExist(err) {
		t.Errorf("expected task to be in archives at %s", archivedPath)
	}
}
