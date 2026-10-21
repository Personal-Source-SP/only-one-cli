package board

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
	"tui-engine/internal/config"
	"tui-engine/internal/herdr"
	"tui-engine/internal/quota"
	"tui-engine/internal/sysmetrics"
	"tui-engine/internal/taskscanner"

	"github.com/charmbracelet/glamour"
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
	paneNames      map[string]string
	viewerCache    map[int][]string
}

func fetchPanes() ([]string, map[string]string) {
	panes := []string{"auto"}
	names := map[string]string{"auto": "auto"}
	for _, p := range herdr.ListPanes() {
		panes = append(panes, p.PaneID)
		displayName := strings.TrimSpace(p.TabLabel)
		if displayName == "" {
			t := strings.TrimSpace(p.Title)
			lower := strings.ToLower(t)
			if !strings.HasSuffix(lower, "cmd.exe") && !strings.HasSuffix(lower, "pwsh.exe") && !strings.HasSuffix(lower, "bash.exe") && !strings.HasSuffix(lower, "powershell.exe") {
				displayName = t
			}
		}
		if displayName == "" {
			displayName = strings.TrimSpace(p.Agent)
		}
		if displayName == "" {
			displayName = p.PaneID
		}
		names[p.PaneID] = displayName
	}
	return panes, names
}

func New(workspaceDir string, initialTasks []taskscanner.TaskModel) Model {
	panes, names := fetchPanes()

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
		paneNames:      names,
		viewerCache:    make(map[int][]string),
	}
}

type tickMsg time.Time

func tickCmd() tea.Cmd {
	return tea.Tick(1*time.Second, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

func tasksDiffer(oldTasks, newTasks []taskscanner.TaskModel) bool {
	if len(oldTasks) != len(newTasks) {
		return true
	}
	for i := range oldTasks {
		if oldTasks[i].Slug != newTasks[i].Slug ||
			oldTasks[i].Status != newTasks[i].Status ||
			oldTasks[i].Title != newTasks[i].Title ||
			len(oldTasks[i].Docs) != len(newTasks[i].Docs) {
			return true
		}
	}
	return false
}

func (m Model) Init() tea.Cmd {
	return tickCmd()
}

func (m Model) getPaneDisplayName(paneID string) string {
	if name, ok := m.paneNames[paneID]; ok && name != "" {
		return name
	}
	return paneID
}

func (m *Model) dispatchCurrentTask(phase string) {
	currCol := m.columns[m.colIdx]
	currIdx := m.taskIndices[m.colIdx]
	if len(currCol.Tasks) == 0 || currIdx >= len(currCol.Tasks) {
		return
	}
	task := currCol.Tasks[currIdx]
	var docName string
	var route config.PhaseRoute
	switch phase {
	case "plan":
		docName = "plan.md"
		route = m.appConfig.AgentRouting.Plan
	case "apply":
		docName = "plan.md"
		route = m.appConfig.AgentRouting.Apply
	case "debug":
		docName = "debug.md"
		route = m.appConfig.AgentRouting.Debug
	}
	docPath := filepath.Join(task.FolderPath, docName)
	if _, err := os.Stat(docPath); os.IsNotExist(err) {
		docPath = filepath.Join(task.FolderPath, "concept.md")
	}
	rel, _ := filepath.Rel(m.workspaceDir, docPath)
	prompt := fmt.Sprintf("/only-one-%s %s", phase, filepath.ToSlash(rel))
	_ = herdr.DispatchPrompt(route.Pane, route.CLI, prompt)
	m.statusMsg = fmt.Sprintf("Đã dispatch %s tới pane [%s] bằng %s: %s", phase, m.getPaneDisplayName(route.Pane), route.CLI, prompt)
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
		m.viewerCache = make(map[int][]string)
	case tickMsg:
		tasks, _ := taskscanner.ScanTasks(m.workspaceDir)
		if tasksDiffer(m.tasks, tasks) {
			m.tasks = tasks
			m.columns = taskscanner.GroupTasksByColumn(tasks)
			for cIdx, col := range m.columns {
				if m.taskIndices[cIdx] >= len(col.Tasks) {
					if len(col.Tasks) > 0 {
						m.taskIndices[cIdx] = len(col.Tasks) - 1
					} else {
						m.taskIndices[cIdx] = 0
					}
				}
			}
		}
		return m, tickCmd()
	case tea.KeyMsg:
		key := msg.String()

		switch m.mode {
		case ModeViewer:
			switch key {
			case "esc", "q":
				m.mode = ModeBoard
				return m, nil
			case "1", "2", "3", "4", "5", "6", "7", "8", "9":
				idx := int(key[0] - '1')
				if idx >= 0 && idx < len(m.viewDocs) {
					m.activeDocIdx = idx
					m.viewerScroll = 0
				}
				return m, nil
			case "pgdown", "ctrl+d", "J":
				m.viewerScroll += (m.height - 8) / 2
				return m, nil
			case "pgup", "ctrl+u", "K":
				m.viewerScroll -= (m.height - 8) / 2
				if m.viewerScroll < 0 {
					m.viewerScroll = 0
				}
				return m, nil
			case "g", "home":
				m.viewerScroll = 0
				return m, nil
			case "G", "end":
				m.viewerScroll = 999999
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
			case "p":
				m.dispatchCurrentTask("plan")
				return m, nil
			case "a":
				m.dispatchCurrentTask("apply")
				return m, nil
			case "d":
				m.dispatchCurrentTask("debug")
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
				m.availablePanes, m.paneNames = fetchPanes()
			case "c":
				route := m.appConfig.AgentRouting.Clean
				prompt := "/only-one-clean"
				err := herdr.DispatchPrompt(route.Pane, route.CLI, prompt)
				if err != nil {
					m.statusMsg = fmt.Sprintf("Lỗi dispatch clean: %v", err)
				} else {
					m.statusMsg = fmt.Sprintf("Đã dispatch clean tới pane [%s] bằng %s: %s", m.getPaneDisplayName(route.Pane), route.CLI, prompt)
				}
			case "p":
				m.dispatchCurrentTask("plan")
			case "a":
				m.dispatchCurrentTask("apply")
			case "d":
				m.dispatchCurrentTask("debug")
			}
		}

	case tea.MouseMsg:
		switch msg.Button {
		case tea.MouseButtonWheelUp:
			if m.mode == ModeViewer {
				m.viewerScroll -= 3
				if m.viewerScroll < 0 {
					m.viewerScroll = 0
				}
			} else if m.mode == ModeBoard {
				if m.taskIndices[m.colIdx] > 0 {
					m.taskIndices[m.colIdx]--
				}
			}
			return m, nil
		case tea.MouseButtonWheelDown:
			if m.mode == ModeViewer {
				m.viewerScroll += 3
			} else if m.mode == ModeBoard {
				colTasks := m.columns[m.colIdx].Tasks
				if m.taskIndices[m.colIdx] < len(colTasks)-1 {
					m.taskIndices[m.colIdx]++
				}
			}
			return m, nil
		case tea.MouseButtonLeft:
			if m.mode == ModeBoard && msg.Action == tea.MouseActionPress {
				colWidth := (m.width - 6) / 4
				if colWidth > 0 {
					clickedCol := (msg.X - 2) / colWidth
					if clickedCol >= 0 && clickedCol < 4 {
						m.colIdx = clickedCol
					}
				}
			}
			return m, nil
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
		tabBar += style.Render(fmt.Sprintf("[%d: %s]", i+1, d.Name)) + " "
	}

	content := "(Tài liệu trống)"
	totalLines := 0
	percent := 0
	if len(m.viewDocs) > 0 && m.activeDocIdx < len(m.viewDocs) {
		if m.viewerCache == nil {
			m.viewerCache = make(map[int][]string)
		}
		lines, exists := m.viewerCache[m.activeDocIdx]
		if !exists {
			rendered := m.renderDocContent(m.viewDocs[m.activeDocIdx].Content, boxWidth-6)
			lines = strings.Split(rendered, "\n")
			m.viewerCache[m.activeDocIdx] = lines
		}
		totalLines = len(lines)
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
		if totalLines > 0 {
			percent = (start + 1) * 100 / totalLines
		}
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
		Render(fmt.Sprintf("[Tab/1-%d] Đổi file  [↑/↓/Lăn chuột/PgUp/PgDn] Cuộn  [p] Plan  [a] Apply  [d] Debug  [Esc/q] Đóng | Dòng %d/%d (%d%%)", len(m.viewDocs), m.viewerScroll+1, totalLines, percent))

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
		paneDisplay := m.paneNames[p.route.Pane]
		if paneDisplay == "" {
			paneDisplay = p.route.Pane
		}
		row := fmt.Sprintf("%s%-35s  Target Pane: [%-16s]  CLI Tool: [%-8s]", indicator, p.name, paneDisplay, p.route.CLI)
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

	sys := sysmetrics.GetSystemMetrics()
	qStats := quota.GetAgentQuota()
	agents := herdr.ListAgents()
	busyAgents := 0
	for _, a := range agents {
		if a.AgentStatus == "busy" {
			busyAgents++
		}
	}

	q5Color := "#00FF66"
	if qStats.Percent5h < 20 {
		q5Color = "#FF5555"
	} else if qStats.Percent5h < 50 {
		q5Color = "#FFCC00"
	}
	qWColor := "#00FF66"
	if qStats.PercentWeek < 20 {
		qWColor = "#FF5555"
	} else if qStats.PercentWeek < 50 {
		qWColor = "#FFCC00"
	}

	q5Styled := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color(q5Color)).Render(fmt.Sprintf("%d%% (%s)", qStats.Percent5h, qStats.ResetIn5h))
	qWStyled := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color(qWColor)).Render(fmt.Sprintf("%d%% (%s)", qStats.PercentWeek, qStats.ResetInWeek))

	row1 := fmt.Sprintf("🚀 ONLY-ONE ⚡ WORKFLOW BOARD (Go Native Engine)    %s    ⚡ CPU: %.1f%%  💾 RAM: %d%%  ⏱ Uptime: %s",
		herdrBadge, sys.CPUPercent, sys.RAMPercent, sys.UptimeStr)
	row2 := fmt.Sprintf("🤖 Agents: %d (%d busy)  │  ⏱ Quota (5h): %s  │  📅 Quota (Tuần): %s",
		len(agents), busyAgents, q5Styled, qWStyled)
	row3 := fmt.Sprintf("🏷️ Badges: %s   %s   %s   %s",
		lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#00FFFF")).Render("💡 [C] Concept"),
		lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#FFCC00")).Render("📋 [P] Plan"),
		lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#FF5555")).Render("🐛 [D] Debug"),
		lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#55FF55")).Render("🔍 [R] Review"),
	)

	headerBox := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#00FFFF")).
		Padding(0, 1).
		Width(boxWidth).
		Render(fmt.Sprintf("%s\n%s\n%s", row1, row2, row3))

	colWidth := (m.width - 8) / 4
	if colWidth < 22 {
		colWidth = 22
	}

	colHeight := m.height - 13
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
			maxCards := (colHeight - 4) / 5
			if maxCards < 1 {
				maxCards = 1
			}
			curTaskIdx := m.taskIndices[i]
			startIdx := 0
			if curTaskIdx >= maxCards {
				startIdx = curTaskIdx - maxCards + 1
			}
			endIdx := startIdx + maxCards
			if endIdx > len(col.Tasks) {
				endIdx = len(col.Tasks)
			}
			if startIdx > 0 {
				content += lipgloss.NewStyle().Faint(true).Foreground(lipgloss.Color("#00FFFF")).Render(fmt.Sprintf("  ▲ (+%d task phía trên)\n", startIdx))
			}
			cardWidth := colWidth - 4
			if cardWidth < 18 {
				cardWidth = 18
			}
			for tIdx := startIdx; tIdx < endIdx; tIdx++ {
				t := col.Tasks[tIdx]
				cardStyle := lipgloss.NewStyle().
					Border(lipgloss.RoundedBorder()).
					Padding(0, 1).
					MarginBottom(1).
					Width(cardWidth)
				if i == m.colIdx && tIdx == m.taskIndices[i] {
					cardStyle = cardStyle.
						BorderForeground(lipgloss.Color("#00FFFF")).
						Background(lipgloss.Color("#1A1A1A"))
				} else {
					cardStyle = cardStyle.
						BorderForeground(lipgloss.Color("#444444"))
				}
				headerText := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#FFFFFF")).Render(fmt.Sprintf("#%02d %s", tIdx+1, truncate(t.Slug, cardWidth-8)))
				titleText := lipgloss.NewStyle().Foreground(lipgloss.Color("#AAAAAA")).Render(truncate(t.Title, cardWidth-4))
				badges := ""
				for _, doc := range []struct{ tag, id, color string }{
					{"💡 [C]", "concept", "#00FFFF"},
					{"📋 [P]", "plan", "#FFCC00"},
					{"🐛 [D]", "debug", "#FF5555"},
					{"🔍 [R]", "review", "#55FF55"},
				} {
					for _, d := range t.Docs {
						if d == doc.id {
							badges += lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color(doc.color)).Render(doc.tag) + " "
							break
						}
					}
				}
				footerRow := strings.TrimSpace(badges)
				if t.CreatedAt != "" {
					dateStr := lipgloss.NewStyle().Faint(true).Render(t.CreatedAt)
					if footerRow != "" {
						footerRow = fmt.Sprintf("%s %s", footerRow, dateStr)
					} else {
						footerRow = dateStr
					}
				}
				cardContent := fmt.Sprintf("%s\n%s\n%s", headerText, titleText, footerRow)
				content += cardStyle.Render(cardContent) + "\n"
			}
			if endIdx < len(col.Tasks) {
				content += lipgloss.NewStyle().Faint(true).Foreground(lipgloss.Color("#00FFFF")).Render(fmt.Sprintf("  ▼ (+%d task phía dưới)\n", len(col.Tasks)-endIdx))
			}
		}
		cols[i] = colStyle.Render(content)
	}

	boardLayout := lipgloss.JoinHorizontal(lipgloss.Top, cols...)

	statusBar := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#00FFFF")).
		Padding(0, 1).
		Width(boxWidth).
		Render(fmt.Sprintf("⚡ TIẾN TRÌNH: %s", m.statusMsg))

	shortcutsBar := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#555555")).
		Padding(0, 1).
		Width(boxWidth).
		Render("[←/→] Cột  [↑/↓] Task  [Space/m] Chuyển Cột  [Enter] Doc  [p] Plan  [a] Apply  [d] Debug  [c] Clean  [s] Settings  [q] Thoát")

	return fmt.Sprintf("%s\n%s\n%s\n%s", headerBox, boardLayout, statusBar, shortcutsBar)
}

func truncate(s string, maxLen int) string {
	if maxLen <= 0 {
		return ""
	}
	runes := []rune(s)
	if len(runes) > maxLen {
		if maxLen > 3 {
			return string(runes[:maxLen-3]) + "..."
		}
		return string(runes[:maxLen])
	}
	return s
}

func (m *Model) renderDocContent(content string, width int) string {
	if width <= 20 {
		width = 80
	}
	// Tiền xử lý khối Mermaid sang khung sơ đồ ASCII
	processed := preprocessMermaidBlocks(content)
	r, err := glamour.NewTermRenderer(
		glamour.WithStandardStyle("dark"),
		glamour.WithWordWrap(width),
	)
	if err == nil {
		out, err := r.Render(processed)
		if err == nil {
			return out
		}
	}
	return processed
}

func preprocessMermaidBlocks(content string) string {
	if !strings.Contains(content, "```mermaid") {
		return content
	}
	return strings.ReplaceAll(content, "```mermaid", "```yaml\n# 📊 SƠ ĐỒ ĐỒ THỊ (MERMAID)")
}
