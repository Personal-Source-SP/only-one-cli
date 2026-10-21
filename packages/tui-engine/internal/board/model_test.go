package board

import (
	"strings"
	"testing"
	"tui-engine/internal/taskscanner"

	tea "github.com/charmbracelet/bubbletea"
)

func TestBoardModelNavigation(t *testing.T) {
	tasks := []taskscanner.TaskModel{
		{Slug: "task-1", Status: "concept", Title: "Task 1"},
		{Slug: "task-2", Status: "plan", Title: "Task 2"},
	}

	m := New(".", tasks)

	if m.colIdx != 0 {
		t.Errorf("expected initial colIdx 0, got %d", m.colIdx)
	}

	// Navigate right
	newM, _ := m.Update(tea.KeyMsg{Type: tea.KeyRight})
	boardM := newM.(Model)
	if boardM.colIdx != 1 {
		t.Errorf("expected colIdx 1 after right key, got %d", boardM.colIdx)
	}

	// Navigate left
	newM2, _ := boardM.Update(tea.KeyMsg{Type: tea.KeyLeft})
	boardM2 := newM2.(Model)
	if boardM2.colIdx != 0 {
		t.Errorf("expected colIdx 0 after left key, got %d", boardM2.colIdx)
	}
}

func TestBoardModelView(t *testing.T) {
	tasks := []taskscanner.TaskModel{
		{Slug: "task-1", Status: "concept", Title: "Task 1"},
	}

	m := New(".", tasks)
	viewStr := m.View()

	if len(viewStr) == 0 {
		t.Errorf("expected non-empty view string")
	}
}

func TestSettingsModeToggle(t *testing.T) {
	m := New(".", nil)

	// Press 's' to enter settings
	newM, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'s'}})
	settingsM := newM.(Model)
	if settingsM.mode != ModeSettings {
		t.Errorf("expected ModeSettings, got %v", settingsM.mode)
	}

	// View settings
	settingsView := settingsM.View()
	if len(settingsView) == 0 {
		t.Errorf("expected non-empty settings view")
	}

	// Press 'esc' to return to board
	backM, _ := settingsM.Update(tea.KeyMsg{Type: tea.KeyEsc})
	if backM.(Model).mode != ModeBoard {
		t.Errorf("expected ModeBoard after Esc, got %v", backM.(Model).mode)
	}
}

func TestViewerModeToggle(t *testing.T) {
	m := New(".", nil)
	m.mode = ModeViewer
	m.viewDocs = []taskscanner.TaskDoc{
		{Name: "concept.md", Content: "# Concept\nContent line 1\nContent line 2"},
		{Name: "plan.md", Content: "# Plan\nPlan content"},
	}

	viewStr := m.View()
	if len(viewStr) == 0 {
		t.Errorf("expected non-empty viewer view")
	}

	// Tab to switch file
	tabM, _ := m.Update(tea.KeyMsg{Type: tea.KeyTab})
	if tabM.(Model).activeDocIdx != 1 {
		t.Errorf("expected activeDocIdx 1 after tab, got %d", tabM.(Model).activeDocIdx)
	}

	// Esc to return
	escM, _ := tabM.Update(tea.KeyMsg{Type: tea.KeyEsc})
	if escM.(Model).mode != ModeBoard {
		t.Errorf("expected ModeBoard after Esc, got %v", escM.(Model).mode)
	}
}

func TestKeyCDispatchClean(t *testing.T) {
	m := New(".", nil)
	newM, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'c'}})
	boardM := newM.(Model)
	if !strings.Contains(boardM.statusMsg, "dispatch clean") {
		t.Errorf("expected dispatch clean status message, got: %s", boardM.statusMsg)
	}
}

func TestSettingsPaneDisplayName(t *testing.T) {
	m := New(".", nil)
	m.appConfig.AgentRouting.Concept.Pane = "test-pane"
	m.paneNames = map[string]string{
		"test-pane": "Friendly Worker",
	}
	m.mode = ModeSettings
	viewStr := m.View()
	if !strings.Contains(viewStr, "Friendly Worker") {
		t.Errorf("expected friendly pane name 'Friendly Worker' in settings view")
	}
}
