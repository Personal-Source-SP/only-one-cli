package wizard

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#7D56F4")).
			Padding(0, 1)

	headerStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#A0AEC0")).
			MarginBottom(1)

	activeSidebarStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(lipgloss.Color("#FFFFFF")).
				Background(lipgloss.Color("#5A67D8")).
				Padding(0, 1)

	inactiveSidebarStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#CBD5E0")).
				Padding(0, 1)

	sidebarPaneStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("#4A5568")).
				Padding(0, 1).
				Width(28).
				Height(14)

	listPaneStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("#4A5568")).
			Padding(0, 1).
			Width(58).
			Height(14)

	cursorItemStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#38B2AC"))

	modalStyle = lipgloss.NewStyle().
			Border(lipgloss.DoubleBorder()).
			BorderForeground(lipgloss.Color("#7D56F4")).
			Padding(1, 2).
			Width(64)

	footerStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#718096")).
			MarginTop(1)
)

type Model struct {
	workspaceDir string
	assetsDir    string
	items        []ResourceItem
	categories   []AssetCategory
	ideOptions   []IdeOption
	activeCatIdx int
	cursorIdx    int
	focusSidebar bool
	overwrite    bool
	showSummary  bool
	confirmed    bool
	quitting     bool
	width        int
	height       int
}

func New(workspaceDir string) Model {
	assetsDir := FindAssetsRoot(workspaceDir)
	items := ScanWorkspaceAssets(workspaceDir, assetsDir)
	cats := []AssetCategory{
		CategorySkills,
		CategoryRules,
		CategoryConfigs,
		CategoryPackages,
		CategoryCombos,
		CategoryMcps,
		CategoryIgnore,
	}

	ides := []IdeOption{
		{ID: "antigravity", Label: "Antigravity", Selected: true},
		{ID: "cursor", Label: "Cursor", Selected: false},
		{ID: "claude", Label: "Claude", Selected: false},
	}

	return Model{
		workspaceDir: workspaceDir,
		assetsDir:    assetsDir,
		items:        items,
		categories:   cats,
		ideOptions:   ides,
		focusSidebar: true,
	}
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) currentCategory() AssetCategory {
	if m.activeCatIdx >= 0 && m.activeCatIdx < len(m.categories) {
		return m.categories[m.activeCatIdx]
	}
	return CategorySkills
}

func (m Model) currentCategoryItems() []int {
	cat := m.currentCategory()
	var indices []int
	for i, item := range m.items {
		if item.Category == cat {
			indices = append(indices, i)
		}
	}
	return indices
}

func (m Model) categoryCounts(cat AssetCategory) (selected int, total int) {
	for _, item := range m.items {
		if item.Category == cat {
			total++
			if item.Selected {
				selected++
			}
		}
	}
	return
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		if m.showSummary {
			switch msg.String() {
			case "enter", "y":
				var selectedIdes []string
				for _, ide := range m.ideOptions {
					if ide.Selected {
						selectedIdes = append(selectedIdes, ide.ID)
					}
				}
				_ = InstallSelectedAssets(m.workspaceDir, m.assetsDir, m.items, selectedIdes, m.overwrite)
				m.confirmed = true
				return m, tea.Quit
			case "esc", "n", "q":
				m.showSummary = false
				return m, nil
			}
			return m, nil
		}

		switch msg.String() {
		case "ctrl+c", "q":
			m.quitting = true
			return m, tea.Quit

		case "tab":
			m.focusSidebar = !m.focusSidebar
			m.cursorIdx = 0

		case "up", "k":
			if m.focusSidebar {
				if m.activeCatIdx > 0 {
					m.activeCatIdx--
					m.cursorIdx = 0
				}
			} else {
				if m.cursorIdx > 0 {
					m.cursorIdx--
				}
			}

		case "down", "j":
			if m.focusSidebar {
				if m.activeCatIdx < len(m.categories)-1 {
					m.activeCatIdx++
					m.cursorIdx = 0
				}
			} else {
				items := m.currentCategoryItems()
				if m.cursorIdx < len(items)-1 {
					m.cursorIdx++
				}
			}

		case " ":
			if !m.focusSidebar {
				items := m.currentCategoryItems()
				if m.cursorIdx >= 0 && m.cursorIdx < len(items) {
					targetIdx := items[m.cursorIdx]
					m.items[targetIdx].Selected = !m.items[targetIdx].Selected
				}
			}

		case "enter":
			m.showSummary = true
		}
	}

	return m, nil
}

func (m Model) View() string {
	if m.quitting {
		return "\n  Quá trình khởi tạo đã được hủy bỏ.\n\n"
	}

	if m.confirmed {
		return "\n  ✨ Khởi tạo môi trường hoàn tất thành công!\n\n"
	}

	if m.showSummary {
		var summaryLines []string
		summaryLines = append(summaryLines, lipgloss.NewStyle().Bold(true).Render("XÁC NHẬN CÀI ĐẶT TÀI NGUYÊN"))
		summaryLines = append(summaryLines, "Các mục đã chọn sẽ được thiết lập vào workspace:\n")

		for _, cat := range m.categories {
			sel, total := m.categoryCounts(cat)
			if sel > 0 {
				summaryLines = append(summaryLines, fmt.Sprintf("  • %-10s : %d / %d mục", strings.ToUpper(string(cat)), sel, total))
			}
		}

		summaryLines = append(summaryLines, "\n[Enter / Y] Bắt đầu cài đặt   [Esc / N] Quay lại")
		return modalStyle.Render(strings.Join(summaryLines, "\n"))
	}

	// 1. Title & Header
	title := titleStyle.Render("ONLY-ONE SETUP WIZARD")
	header := headerStyle.Render("IDEs: [•] Antigravity  [ ] Cursor  [ ] Claude  |  Overwrite: [ ] No")

	// 2. Left Sidebar (Categories)
	var sidebarLines []string
	sidebarLines = append(sidebarLines, lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#ED8936")).Render("DANH MỤC"))
	for i, cat := range m.categories {
		sel, total := m.categoryCounts(cat)
		label := fmt.Sprintf("%s (%d/%d)", cat, sel, total)
		if i == m.activeCatIdx {
			if m.focusSidebar {
				sidebarLines = append(sidebarLines, activeSidebarStyle.Render("▶ "+label))
			} else {
				sidebarLines = append(sidebarLines, cursorItemStyle.Render("▷ "+label))
			}
		} else {
			sidebarLines = append(sidebarLines, inactiveSidebarStyle.Render("  "+label))
		}
	}
	sidebarView := sidebarPaneStyle.Render(strings.Join(sidebarLines, "\n"))

	// 3. Right Resource List
	var listLines []string
	catName := strings.ToUpper(string(m.currentCategory()))
	listLines = append(listLines, lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#4FD1C5")).Render("TÀI NGUYÊN: "+catName))

	itemIndices := m.currentCategoryItems()
	if len(itemIndices) == 0 {
		listLines = append(listLines, lipgloss.NewStyle().Foreground(lipgloss.Color("#718096")).Render("\n  (Chưa có tài nguyên nào trong mục này)"))
	} else {
		for i, idx := range itemIndices {
			item := m.items[idx]
			check := "[ ]"
			if item.Selected {
				check = "[x]"
			}

			cursor := "  "
			if !m.focusSidebar && i == m.cursorIdx {
				cursor = "▶ "
			}

			nameStr := fmt.Sprintf("%s%s %s", cursor, check, item.Name)
			if item.IsInstalled {
				nameStr += " (đã có)"
			}

			if !m.focusSidebar && i == m.cursorIdx {
				listLines = append(listLines, cursorItemStyle.Render(nameStr))
			} else {
				listLines = append(listLines, nameStr)
			}
		}
	}
	listView := listPaneStyle.Render(strings.Join(listLines, "\n"))

	// 4. Combine Two Columns
	centerBody := lipgloss.JoinHorizontal(lipgloss.Top, sidebarView, listView)

	// 5. Footer Navigation Help
	footer := footerStyle.Render("[Tab] Đổi khung  •  [↑/↓] Di chuyển  •  [Space] Chọn/Bỏ chọn  •  [Enter] Tiếp tục  •  [q] Thoát")

	return fmt.Sprintf("\n%s\n%s\n%s\n%s\n", title, header, centerBody, footer)
}
