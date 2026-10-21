package herdr

import (
	"os"
	"strings"
	"testing"
)

func TestIsSessionActive(t *testing.T) {
	orig := os.Getenv("HERDR_ENV")
	defer os.Setenv("HERDR_ENV", orig)

	os.Setenv("HERDR_ENV", "0")
	if IsSessionActive() {
		t.Errorf("expected IsSessionActive() to be false when HERDR_ENV is 0")
	}

	os.Setenv("HERDR_ENV", "1")
	if !IsSessionActive() {
		t.Errorf("expected IsSessionActive() to be true when HERDR_ENV is 1")
	}
}

func TestStripANSI(t *testing.T) {
	colored := "\x1b[32mHello World\x1b[0m"
	cleaned := stripANSI(colored)
	if cleaned != "Hello World" {
		t.Errorf("expected 'Hello World', got '%s'", cleaned)
	}
}

func TestCleanActionLine(t *testing.T) {
	mockTerminal := `
      ▄▀▀▄        Antigravity CLI 1.4.2
────────────────────────────────────────────────────────────
> /only-one-plan task.md
○ Thought for 35s
● Explored 2 files (plan.md, concept.md)
────────────────────────────────────────────────────────────
> 
? for shortcuts
`
	action := CleanActionLine(mockTerminal)
	if !strings.Contains(action, "Explored 2 files") && !strings.Contains(action, "Thought for 35s") {
		t.Errorf("expected meaningful action line, got: '%s'", action)
	}
}

