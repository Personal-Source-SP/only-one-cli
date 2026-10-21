package sysmetrics

import "testing"

func TestGetSystemMetrics(t *testing.T) {
	metrics := GetSystemMetrics()
	if metrics.RAMPercent < 0 || metrics.RAMPercent > 100 {
		t.Errorf("RAMPercent out of range [0, 100]: %d", metrics.RAMPercent)
	}
	if metrics.UptimeStr == "" {
		t.Errorf("expected non-empty UptimeStr")
	}
}
