package board

import (
	"strings"
	"testing"
	"time"
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

func TestGetPaneDisplayName(t *testing.T) {
	m := New(".", nil)
	m.paneNames = map[string]string{
		"w4:p7": "pm",
	}
	if m.getPaneDisplayName("w4:p7") != "pm" {
		t.Errorf("expected 'pm', got %s", m.getPaneDisplayName("w4:p7"))
	}
	if m.getPaneDisplayName("unknown") != "unknown" {
		t.Errorf("expected 'unknown', got %s", m.getPaneDisplayName("unknown"))
	}
}

func TestViewerNumericTabsAndScroll(t *testing.T) {
	m := New(".", nil)
	m.mode = ModeViewer
	m.viewDocs = []taskscanner.TaskDoc{
		{Name: "concept.md", Content: "# Concept\nLine 1\nLine 2"},
		{Name: "plan.md", Content: "# Plan\nLine A\nLine B"},
	}
	newM, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'2'}})
	if newM.(Model).activeDocIdx != 1 {
		t.Errorf("expected activeDocIdx 1 after key '2', got %d", newM.(Model).activeDocIdx)
	}
}

func TestTasksDifferAndTick(t *testing.T) {
	oldTasks := []taskscanner.TaskModel{
		{Slug: "task-1", Status: "concept", Title: "Task 1"},
	}
	newTasks := []taskscanner.TaskModel{
		{Slug: "task-1", Status: "plan", Title: "Task 1"},
	}
	if !tasksDiffer(oldTasks, newTasks) {
		t.Errorf("expected tasksDiffer to be true when status changed")
	}
	if tasksDiffer(oldTasks, oldTasks) {
		t.Errorf("expected tasksDiffer to be false for identical tasks")
	}
	m := New(".", oldTasks)
	cmd := m.Init()
	if cmd == nil {
		t.Errorf("expected Init to return non-nil tickCmd")
	}
}

func TestMouseWheelScrolling(t *testing.T) {
	m := New(".", nil)
	m.mode = ModeViewer
	m.viewerScroll = 10
	wheelUpM, _ := m.Update(tea.MouseMsg{Button: tea.MouseButtonWheelUp})
	if wheelUpM.(Model).viewerScroll != 7 {
		t.Errorf("expected viewerScroll 7 after wheel up, got %d", wheelUpM.(Model).viewerScroll)
	}
	wheelDownM, _ := wheelUpM.Update(tea.MouseMsg{Button: tea.MouseButtonWheelDown})
	if wheelDownM.(Model).viewerScroll != 10 {
		t.Errorf("expected viewerScroll 10 after wheel down, got %d", wheelDownM.(Model).viewerScroll)
	}
}

func TestHeaderStreamlinedMetricsAndBadges(t *testing.T) {
	m := New(".", nil)
	viewStr := m.View()
	if !strings.Contains(viewStr, "🏷️ Badges:") {
		t.Errorf("expected header to contain '🏷️ Badges:', view output:\n%s", viewStr)
	}
	if !strings.Contains(viewStr, "Quota (5h)") {
		t.Errorf("expected header to contain 'Quota (5h)', view output:\n%s", viewStr)
	}
}

func TestTaskCardStreamlinedTwoLines(t *testing.T) {
	m := New(".", nil)
	m.tasks = []taskscanner.TaskModel{
		{
			Slug:       "test-slug",
			Title:      "Long Description That Should Not Appear On Card",
			Status:     "concept",
			FolderPath: ".",
			CreatedAt:  "2026-10-21",
		},
	}
	m.columns = taskscanner.GroupTasksByColumn(m.tasks)
	viewStr := m.View()
	if strings.Contains(viewStr, "Long Description That Should Not Appear On Card") {
		t.Errorf("expected card to NOT contain task description title")
	}
}

func TestMultiLineProgressRendering(t *testing.T) {
	m := New(".", nil)
	m.activeTasks["w4:p1"] = &ActiveTaskProgress{
		TaskSlug:  "test-task",
		Phase:     "plan",
		PaneID:    "w4:p1",
		StartTime: time.Now(),
		IsActive:  true,
		LastLog:   "● Running go test...",
	}
	viewStr := m.View()
	if !strings.Contains(viewStr, "⚡ TIẾN TRÌNH") {
		t.Errorf("expected view to contain '⚡ TIẾN TRÌNH'")
	}
	if !strings.Contains(viewStr, "test-task") {
		t.Errorf("expected view to contain active task slug 'test-task'")
	}
}
