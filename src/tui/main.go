package main

import (
	"fmt"
	"os"
	"tui-engine/internal/board"
	"tui-engine/internal/taskscanner"
	"tui-engine/internal/wizard"

	tea "github.com/charmbracelet/bubbletea"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: only-one-ui <board|init> [options]")
		os.Exit(1)
	}

	mode := os.Args[1]
	cwd, err := os.Getwd()
	if err != nil {
		cwd = "."
	}

	switch mode {
	case "board":
		tasks, _ := taskscanner.ScanTasks(cwd)
		m := board.New(cwd, tasks)
		p := tea.NewProgram(m, tea.WithAltScreen(), tea.WithMouseCellMotion())
		if _, err := p.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Lỗi khi chạy board: %v\n", err)
			os.Exit(1)
		}
	case "init":
		m := wizard.New(cwd)
		p := tea.NewProgram(m, tea.WithAltScreen())
		if _, err := p.Run(); err != nil {
			fmt.Fprintf(os.Stderr, "Lỗi khi chạy init wizard: %v\n", err)
			os.Exit(1)
		}
	default:
		fmt.Fprintf(os.Stderr, "Unknown mode: %s\n", mode)
		os.Exit(1)
	}
}
