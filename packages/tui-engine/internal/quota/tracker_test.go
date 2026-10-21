package quota

import (
	"testing"
)

func TestParseUsageOutput(t *testing.T) {
	mockJSON := `{
		"command": {
			"name": "usage",
			"data": {
				"groups": [
					{
						"name": "Gemini Models",
						"buckets": [
							{
								"id": "gemini-weekly",
								"name": "Weekly Limit Remaining",
								"window": "weekly",
								"remaining_fraction": 0.7435,
								"reset_time": "2026-10-27T02:22:08Z"
							},
							{
								"id": "gemini-5h",
								"name": "Five Hour Limit Remaining",
								"window": "5h",
								"remaining_fraction": 0.8622,
								"reset_time": "2026-10-21T06:29:33Z"
							}
						]
					}
				]
			}
		}
	}`

	stats, err := parseUsageOutput([]byte(mockJSON))
	if err != nil {
		t.Fatalf("unexpected parse error: %v", err)
	}
	if stats.Percent5h != 86 {
		t.Errorf("expected Percent5h=86, got %d", stats.Percent5h)
	}
	if stats.PercentWeek != 74 {
		t.Errorf("expected PercentWeek=74, got %d", stats.PercentWeek)
	}
	if stats.ResetIn5h == "" || stats.ResetIn5h == "--" {
		t.Errorf("expected valid ResetIn5h, got %s", stats.ResetIn5h)
	}
}

func TestFormatRelativeTime(t *testing.T) {
	if res := formatRelativeTime(""); res != "--" {
		t.Errorf("expected '--', got '%s'", res)
	}
	if res := formatRelativeTime("invalid-date"); res != "invalid-date" {
		t.Errorf("expected fallback to input string, got '%s'", res)
	}
}
