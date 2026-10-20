package herdr

import (
	"encoding/json"
	"os"
	"os/exec"
)

type PaneInfo struct {
	PaneID      string `json:"pane_id"`
	Agent       string `json:"agent"`
	AgentStatus string `json:"agent_status"`
	Title       string `json:"terminal_title_stripped"`
}

func IsSessionActive() bool {
	return os.Getenv("HERDR_ENV") == "1"
}

func PromptAgent(paneID, prompt string) error {
	cmd := exec.Command("herdr", "agent", "prompt", paneID, prompt)
	return cmd.Run()
}

func SplitAndRun(dir, cmdStr string) error {
	cmd := exec.Command("herdr", "pane", "split", "--current", "--direction", "right", "--cwd", dir, "--no-focus")
	return cmd.Run()
}

func ListPanes() []PaneInfo {
	if !IsSessionActive() {
		return nil
	}
	out, err := exec.Command("herdr", "pane", "list").Output()
	if err != nil {
		return nil
	}
	var resp struct {
		Result struct {
			Panes []PaneInfo `json:"panes"`
		} `json:"result"`
	}
	_ = json.Unmarshal(out, &resp)
	return resp.Result.Panes
}

func DispatchPrompt(paneID, cliTool, promptText string) error {
	if !IsSessionActive() {
		return nil
	}
	panes := ListPanes()
	for _, p := range panes {
		if p.PaneID == paneID {
			if p.AgentStatus == "unknown" || p.AgentStatus == "terminal" {
				_ = exec.Command("herdr", "agent", "start", "agy-worker", "--kind", cliTool, "--pane", paneID).Run()
			}
			return PromptAgent(paneID, promptText)
		}
	}
	// Fallback nếu pane chưa có: chia pane mới
	_ = exec.Command("herdr", "pane", "split", "--current", "--direction", "right", "--no-focus").Run()
	return nil
}
