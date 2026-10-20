package board

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"tui-engine/internal/config"
	"tui-engine/internal/herdr"
	"tui-engine/internal/taskscanner"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type ViewMode int

const (
	ModeBoard ViewMode = iota
	ModeViewer
	ModeSettings
)

type Model struct {
	workspaceDir   string
	tasks          []taskscanner.TaskModel
	columns        []taskscanner.ColumnModel
	colIdx         int
	taskIndices    map[int]int
	width          int
	height         int
	statusMsg      string
	mode           ViewMode
	viewDocs       []taskscanner.TaskDoc
	activeDocIdx   int
	viewerScroll   int
	appConfig      config.GlobalConfig
	settingsIdx    int
	availablePanes []string
}

func New(workspaceDir string, initialTasks []taskscanner.TaskModel) Model {
	panes := []string{"auto"}
	for _, p := range herdr.ListPanes() {
		panes = append(panes, p.PaneID)
	}

	return Model{
		workspaceDir:   workspaceDir,
		tasks:          initialTasks,
		columns:        taskscanner.GroupTasksByColumn(initialTasks),
		colIdx:         0,
		taskIndices:    map[int]int{0: 0, 1: 0, 2: 0, 3: 0},
		width:          100,
		height:         30,
		statusMsg:      "Sẵn sàng.",
		mode:           ModeBoard,
		appConfig:      config.LoadConfig(),
		settingsIdx:    0,
		availablePanes: panes,
	}
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m *Model) getPhaseRoute(idx int) *config.PhaseRoute {
	switch idx {
	case 0:
		return &m.appConfig.AgentRouting.Concept
	case 1:
		return &m.appConfig.AgentRouting.Plan
	case 2:
		return &m.appConfig.AgentRouting.Apply
	case 3:
		return &m.appConfig.AgentRouting.Debug
	case 4:
		return &m.appConfig.AgentRouting.Review
	case 5:
		return &m.appConfig.AgentRouting.Clean
	default:
		return nil
	}
}

func (m *Model) cyclePane(delta int) {
	if len(m.availablePanes) == 0 {
		m.availablePanes = []string{"auto"}
	}
	route := m.getPhaseRoute(m.settingsIdx)
	if route == nil {
		return
	}
	curIdx := 0
	for i, p := range m.availablePanes {
		if p == route.Pane {
			curIdx = i
			break
		}
	}
	nextIdx := (curIdx + delta + len(m.availablePanes)) % len(m.availablePanes)
	route.Pane = m.availablePanes[nextIdx]
}

func (m *Model) cycleCLI() {
	tools := []string{"agy", "claude", "codex", "opendev", "gemini"}
	route := m.getPhaseRoute(m.settingsIdx)
	if route == nil {
		if m.settingsIdx == 6 {
			m.appConfig.CleanPolicy.Enabled = !m.appConfig.CleanPolicy.Enabled
		}
		return
	}
	curIdx := 0
	for i, t := range tools {
		if t == route.CLI {
			curIdx = i
			break
		}
	}
	nextIdx := (curIdx + 1) % len(tools)
	route.CLI = tools[nextIdx]
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
	case tea.KeyMsg:
		key := msg.String()

		switch m.mode {
		case ModeViewer:
			switch key {
			case "esc", "q":
				m.mode = ModeBoard
				return m, nil
			case "tab":
				if len(m.viewDocs) > 0 {
					m.activeDocIdx = (m.activeDocIdx + 1) % len(m.viewDocs)
					m.viewerScroll = 0
				}
				return m, nil
			case "shift+tab":
				if len(m.viewDocs) > 0 {
					m.activeDocIdx = (m.activeDocIdx - 1 + len(m.viewDocs)) % len(m.viewDocs)
					m.viewerScroll = 0
				}
				return m, nil
			case "up", "k":
				if m.viewerScroll > 0 {
					m.viewerScroll--
				}
				return m, nil
			case "down", "j":
				m.viewerScroll++
				return m, nil
			}

		case ModeSettings:
			switch key {
			case "esc", "q":
				_ = config.SaveConfig(m.appConfig)
				m.mode = ModeBoard
				m.statusMsg = "Đã lưu cài đặt cấu hình."
				return m, nil
			case "up", "k":
				if m.settingsIdx > 0 {
					m.settingsIdx--
				}
				return m, nil
			case "down", "j":
				if m.settingsIdx < 6 {
					m.settingsIdx++
				}
				return m, nil
			case "left", "h":
				m.cyclePane(-1)
				return m, nil
			case "right", "l":
				m.cyclePane(1)
				return m, nil
			case " ", "enter":
				m.cycleCLI()
				return m, nil
			}

		case ModeBoard:
			switch key {
			case "ctrl+c", "q":
				return m, tea.Quit
			case "left", "h":
				if m.colIdx > 0 {
					m.colIdx--
				}
			case "right", "l":
				if m.colIdx < len(m.columns)-1 {
					m.colIdx++
				}
			case "up", "k":
				if m.taskIndices[m.colIdx] > 0 {
					m.taskIndices[m.colIdx]--
				}
			case "down", "j":
				colTasks := m.columns[m.colIdx].Tasks
				if m.taskIndices[m.colIdx] < len(colTasks)-1 {
					m.taskIndices[m.colIdx]++
				}
			case "r":
				tasks, _ := taskscanner.ScanTasks(m.workspaceDir)
				m.tasks = tasks
				m.columns = taskscanner.GroupTasksByColumn(tasks)
				m.statusMsg = fmt.Sprintf("Đã nạp lại %d task.", len(tasks))
			case "m", " ":
				currCol := m.columns[m.colIdx]
				currIdx := m.taskIndices[m.colIdx]
				if len(currCol.Tasks) > 0 && currIdx < len(currCol.Tasks) {
					task := currCol.Tasks[currIdx]
					nextStatus := "concept"
					if currCol.ID == "concept" {
						nextStatus = "plan"
					} else if currCol.ID == "plan" {
						nextStatus = "processing"
					} else if currCol.ID == "processing" {
						nextStatus = "done"
					}
					_ = taskscanner.UpdateTaskStatus(task.FolderPath, nextStatus)
					tasks, _ := taskscanner.ScanTasks(m.workspaceDir)
					m.tasks = tasks
					m.columns = taskscanner.GroupTasksByColumn(tasks)
					m.statusMsg = fmt.Sprintf("Đã chuyển task %s sang %s.", task.Slug, nextStatus)
				}
			case "enter":
				currCol := m.columns[m.colIdx]
				currIdx := m.taskIndices[m.colIdx]
				if len(currCol.Tasks) > 0 && currIdx < len(currCol.Tasks) {
					task := currCol.Tasks[currIdx]
					docs := taskscanner.GetTaskDocs(task.FolderPath)
					if len(docs) > 0 {
						m.viewDocs = docs
						m.activeDocIdx = 0
						m.viewerScroll = 0
						m.mode = ModeViewer
					} else {
						m.statusMsg = "Không tìm thấy tài liệu markdown trong task này."
					}
				}
			case "s":
				m.mode = ModeSettings
				m.settingsIdx = 0
				panes := []string{"auto"}
				for _, p := range herdr.ListPanes() {
					panes = append(panes, p.PaneID)
				}
				m.availablePanes = panes
			case "c":
				count, err := taskscanner.CleanCompletedTasks(m.workspaceDir)
				if err != nil {
					m.statusMsg = fmt.Sprintf("Lỗi dọn dẹp task: %v", err)
				} else {
					tasks, _ := taskscanner.ScanTasks(m.workspaceDir)
					m.tasks = tasks
					m.columns = taskscanner.GroupTasksByColumn(tasks)
					m.statusMsg = fmt.Sprintf("Đã dọn dẹp %d task hoàn thành vào archives.", count)
				}
			case "p":
				currCol := m.columns[m.colIdx]
				currIdx := m.taskIndices[m.colIdx]
				if len(currCol.Tasks) > 0 && currIdx < len(currCol.Tasks) {
					task := currCol.Tasks[currIdx]
					docPath := filepath.Join(task.FolderPath, "plan.md")
					if _, err := os.Stat(docPath); os.IsNotExist(err) {
						docPath = filepath.Join(task.FolderPath, "concept.md")
					}
					rel, _ := filepath.Rel(m.workspaceDir, docPath)
					rel = filepath.ToSlash(rel)
					prompt := fmt.Sprintf("/only-one-plan %s", rel)
					route := m.appConfig.AgentRouting.Plan
					_ = herdr.DispatchPrompt(route.Pane, route.CLI, prompt)
					m.statusMsg = fmt.Sprintf("Đã dispatch plan tới pane [%s] bằng %s: %s", route.Pane, route.CLI, prompt)
				}
			case "a":
				currCol := m.columns[m.colIdx]
				currIdx := m.taskIndices[m.colIdx]
				if len(currCol.Tasks) > 0 && currIdx < len(currCol.Tasks) {
					task := currCol.Tasks[currIdx]
					docPath := filepath.Join(task.FolderPath, "plan.md")
					if _, err := os.Stat(docPath); os.IsNotExist(err) {
						docPath = filepath.Join(task.FolderPath, "debug.md")
					}
					rel, _ := filepath.Rel(m.workspaceDir, docPath)
					rel = filepath.ToSlash(rel)
					prompt := fmt.Sprintf("/only-one-apply %s", rel)
					route := m.appConfig.AgentRouting.Apply
					_ = herdr.DispatchPrompt(route.Pane, route.CLI, prompt)
					m.statusMsg = fmt.Sprintf("Đã dispatch apply tới pane [%s] bằng %s: %s", route.Pane, route.CLI, prompt)
				}
			case "d":
				currCol := m.columns[m.colIdx]
				currIdx := m.taskIndices[m.colIdx]
				if len(currCol.Tasks) > 0 && currIdx < len(currCol.Tasks) {
					task := currCol.Tasks[currIdx]
					docPath := filepath.Join(task.FolderPath, "debug.md")
					if _, err := os.Stat(docPath); os.IsNotExist(err) {
						docPath = filepath.Join(task.FolderPath, "plan.md")
					}
					rel, _ := filepath.Rel(m.workspaceDir, docPath)
					rel = filepath.ToSlash(rel)
					prompt := fmt.Sprintf("/only-one-debug %s", rel)
					route := m.appConfig.AgentRouting.Debug
					_ = herdr.DispatchPrompt(route.Pane, route.CLI, prompt)
					m.statusMsg = fmt.Sprintf("Đã dispatch debug tới pane [%s] bằng %s: %s", route.Pane, route.CLI, prompt)
				}
			}
		}

	case tea.MouseMsg:
		if m.mode == ModeBoard && msg.Button == tea.MouseButtonLeft && msg.Action == tea.MouseActionPress {
			colWidth := (m.width - 6) / 4
			if colWidth > 0 {
				clickedCol := (msg.X - 2) / colWidth
				if clickedCol >= 0 && clickedCol < 4 {
					m.colIdx = clickedCol
				}
			}
		}
	}
	return m, nil
}

func (m Model) renderViewer() string {
	boxWidth := m.width - 2
	if boxWidth < 20 {
		boxWidth = 80
	}
	boxHeight := m.height - 8
	if boxHeight < 10 {
		boxHeight = 15
	}

	tabBar := ""
	for i, d := range m.viewDocs {
		style := lipgloss.NewStyle().Padding(0, 1)
		if i == m.activeDocIdx {
			style = style.Bold(true).Foreground(lipgloss.Color("#00FFFF")).Background(lipgloss.Color("#333333"))
		} else {
			style = style.Foreground(lipgloss.Color("#888888"))
		}
		tabBar += style.Render(fmt.Sprintf("[%s]", d.Name)) + " "
	}

	content := "(Tài liệu trống)"
	if len(m.viewDocs) > 0 && m.activeDocIdx < len(m.viewDocs) {
		lines := strings.Split(m.viewDocs[m.activeDocIdx].Content, "\n")
		start := m.viewerScroll
		if start >= len(lines) {
			start = len(lines) - 1
		}
		if start < 0 {
			start = 0
		}
		end := start + boxHeight
		if end > len(lines) {
			end = len(lines)
		}
		content = strings.Join(lines[start:end], "\n")
	}

	header := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#00FFFF")).
		Padding(0, 1).
		Width(boxWidth).
		Render(fmt.Sprintf("📖 MARKDOWN VIEWER | %s", tabBar))

	body := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#555555")).
		Padding(0, 1).
		Width(boxWidth).
		Height(boxHeight).
		Render(content)

	footer := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#555555")).
		Padding(0, 1).
		Width(boxWidth).
		Render("[Tab] Đổi file  [↑/↓/j/k] Cuộn  [Esc/q] Quay lại bảng Kanban")

	return fmt.Sprintf("%s\n%s\n%s", header, body, footer)
}

func (m Model) renderSettings() string {
	boxWidth := m.width - 2
	if boxWidth < 20 {
		boxWidth = 80
	}

	header := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#00FFFF")).
		Padding(0, 1).
		Width(boxWidth).
		Render("⚙️ CẤU HÌNH HỆ THỐNG ONLY-ONE (Agent Routing & Clean Policy)")

	phases := []struct {
		name  string
		route config.PhaseRoute
	}{
		{"Concept Phase (/only-one-idea)", m.appConfig.AgentRouting.Concept},
		{"Plan Phase    (/only-one-plan)", m.appConfig.AgentRouting.Plan},
		{"Apply Phase   (/only-one-apply)", m.appConfig.AgentRouting.Apply},
		{"Debug Phase   (/only-one-debug)", m.appConfig.AgentRouting.Debug},
		{"Review Phase  (/only-one-review)", m.appConfig.AgentRouting.Review},
		{"Clean Phase   (/only-one-clean)", m.appConfig.AgentRouting.Clean},
	}

	lines := []string{}
	for i, p := range phases {
		indicator := "  "
		style := lipgloss.NewStyle().Padding(0, 1)
		if i == m.settingsIdx {
			indicator = "► "
			style = style.Bold(true).Foreground(lipgloss.Color("#00FFFF")).Background(lipgloss.Color("#222222"))
		}
		row := fmt.Sprintf("%s%-35s  Target Pane: [%-8s]  CLI Tool: [%-8s]", indicator, p.name, p.route.Pane, p.route.CLI)
		lines = append(lines, style.Render(row))
	}

	// Clean policy row
	cleanIndicator := "  "
	cleanStyle := lipgloss.NewStyle().Padding(0, 1)
	if m.settingsIdx == 6 {
		cleanIndicator = "► "
		cleanStyle = cleanStyle.Bold(true).Foreground(lipgloss.Color("#00FFFF")).Background(lipgloss.Color("#222222"))
	}
	cleanStatus := "BẬT"
	if !m.appConfig.CleanPolicy.Enabled {
		cleanStatus = "TẮT"
	}
	cleanRow := fmt.Sprintf("%sClean Policy (Auto-archive)          Trạng thái: [%-8s]  Ngưỡng: [%d tasks]", cleanIndicator, cleanStatus, m.appConfig.CleanPolicy.ThresholdCount)
	lines = append(lines, cleanStyle.Render(cleanRow))

	body := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#555555")).
		Padding(1, 1).
		Width(boxWidth).
		Render(strings.Join(lines, "\n\n"))

	footer := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#555555")).
		Padding(0, 1).
		Width(boxWidth).
		Render("[↑/↓] Chọn cấu hình  [←/→] Đổi Target Pane  [Space/Enter] Đổi CLI/Bật-tắt  [Esc/q] Lưu & Quay lại")

	return fmt.Sprintf("%s\n%s\n%s", header, body, footer)
}

func (m Model) View() string {
	if m.mode == ModeViewer {
		return m.renderViewer()
	}
	if m.mode == ModeSettings {
		return m.renderSettings()
	}

	herdrBadge := lipgloss.NewStyle().Foreground(lipgloss.Color("#7F7F7F")).Render("[HERDR: OFF]")
	if herdr.IsSessionActive() {
		herdrBadge = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#00FF66")).Render("[HERDR: CONNECTED]")
	}

	boxWidth := m.width - 2
	if boxWidth < 20 {
		boxWidth = 80
	}

	headerBox := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#00FFFF")).
		Padding(0, 1).
		Width(boxWidth).
		Render(fmt.Sprintf("🚀 ONLY-ONE ⚡ WORKFLOW BOARD (Go Native Engine)\nWorkspace: %s  %s  Total: %d Tasks", m.workspaceDir, herdrBadge, len(m.tasks)))

	colWidth := (m.width - 8) / 4
	if colWidth < 22 {
		colWidth = 22
	}

	colHeight := m.height - 10
	if colHeight < 10 {
		colHeight = 15
	}

	cols := make([]string, len(m.columns))
	for i, col := range m.columns {
		borderColor := "#333333"
		titleColor := "#888888"
		if i == m.colIdx {
			borderColor = "#00FFFF"
			titleColor = "#00FFFF"
		}

		colStyle := lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color(borderColor)).
			Padding(0, 1).
			Width(colWidth).
			Height(colHeight)

		headerText := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color(titleColor)).Render(fmt.Sprintf("%s (%d)", col.Title, len(col.Tasks)))
		content := headerText + "\n\n"

		if len(col.Tasks) == 0 {
			content += lipgloss.NewStyle().Faint(true).Render("(Trống)")
		} else {
			for tIdx, t := range col.Tasks {
				cardStyle := lipgloss.NewStyle().Padding(0, 1).MarginBottom(1)
				if i == m.colIdx && tIdx == m.taskIndices[i] {
					cardStyle = cardStyle.
						Border(lipgloss.NormalBorder(), false, false, false, true).
						BorderForeground(lipgloss.Color("#FF007F")).
						Background(lipgloss.Color("#222222"))
				} else {
					cardStyle = cardStyle.
						Border(lipgloss.NormalBorder(), false, false, false, true).
						BorderForeground(lipgloss.Color("#444444"))
				}
				cardContent := fmt.Sprintf("%s\n%s", lipgloss.NewStyle().Bold(true).Render(t.Slug), lipgloss.NewStyle().Foreground(lipgloss.Color("#AAAAAA")).Render(t.Title))
				content += cardStyle.Render(cardContent) + "\n"
			}
		}
		cols[i] = colStyle.Render(content)
	}

	boardLayout := lipgloss.JoinHorizontal(lipgloss.Top, cols...)

	footer := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#555555")).
		Padding(0, 1).
		Width(boxWidth).
		Render(fmt.Sprintf("[←/→] Cột  [↑/↓] Task  [Space/m] Chuyển Cột  [Enter] Xem Doc  [p] Plan  [a] Apply  [d] Debug  [c] Clean  [s] Settings  [q] Thoát | ℹ %s", m.statusMsg))

	return fmt.Sprintf("%s\n%s\n%s", headerBox, boardLayout, footer)
}
