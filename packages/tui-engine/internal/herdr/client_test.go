package herdr

import (
	"os"
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
