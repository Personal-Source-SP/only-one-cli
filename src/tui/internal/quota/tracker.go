package quota

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"sync"
	"time"
)

type QuotaStats struct {
	Percent5h   int
	ResetIn5h   string
	PercentWeek int
	ResetInWeek string
}

type agyUsageResponse struct {
	Command struct {
		Name string `json:"name"`
		Data struct {
			Groups []struct {
				Name    string `json:"name"`
				Buckets []struct {
					ID                string  `json:"id"`
					Window            string  `json:"window"`
					RemainingFraction float64 `json:"remaining_fraction"`
					ResetTime         string  `json:"reset_time"`
				} `json:"buckets"`
			} `json:"groups"`
		} `json:"data"`
	} `json:"command"`
}

var (
	cachedStats QuotaStats
	lastFetch   time.Time
	mu          sync.Mutex
	isFetching  bool
)

func formatRelativeTime(targetIso string) string {
	if targetIso == "" {
		return "--"
	}
	t, err := time.Parse(time.RFC3339, targetIso)
	if err != nil {
		return targetIso
	}
	rem := time.Until(t)
	if rem <= 0 {
		return "ngay bây giờ"
	}
	days := int(rem.Hours()) / 24
	hours := int(rem.Hours()) % 24
	mins := int(rem.Minutes()) % 60
	if days > 0 {
		return fmt.Sprintf("~%d ngày %dh", days, hours)
	}
	if hours > 0 {
		return fmt.Sprintf("~%dh%02dm", hours, mins)
	}
	return fmt.Sprintf("~%dm", mins)
}

func parseUsageOutput(data []byte) (QuotaStats, error) {
	var resp agyUsageResponse
	if err := json.Unmarshal(data, &resp); err != nil {
		return QuotaStats{}, err
	}
	stats := QuotaStats{
		Percent5h:   -1,
		PercentWeek: -1,
		ResetIn5h:   "--",
		ResetInWeek: "--",
	}
	for _, group := range resp.Command.Data.Groups {
		for _, b := range group.Buckets {
			if b.Window == "5h" && stats.Percent5h == -1 {
				stats.Percent5h = int(b.RemainingFraction * 100)
				stats.ResetIn5h = formatRelativeTime(b.ResetTime)
			}
			if b.Window == "weekly" && stats.PercentWeek == -1 {
				stats.PercentWeek = int(b.RemainingFraction * 100)
				stats.ResetInWeek = formatRelativeTime(b.ResetTime)
			}
		}
	}
	if stats.Percent5h == -1 {
		stats.Percent5h = 100
	}
	if stats.PercentWeek == -1 {
		stats.PercentWeek = 100
	}
	return stats, nil
}

func fetchRealQuota() {
	cmd := exec.Command("agy", "--output-format", "json", "--print", "/usage")
	out, err := cmd.Output()
	mu.Lock()
	defer mu.Unlock()
	isFetching = false
	if err != nil {
		return
	}
	if stats, parseErr := parseUsageOutput(out); parseErr == nil {
		cachedStats = stats
		lastFetch = time.Now()
	}
}

func GetAgentQuota() QuotaStats {
	mu.Lock()
	needFetch := time.Since(lastFetch) > 30*time.Second && !isFetching
	if needFetch {
		isFetching = true
		go fetchRealQuota()
	}
	cur := cachedStats
	hasData := cur.Percent5h != 0 || cur.PercentWeek != 0 || cur.ResetIn5h != ""
	mu.Unlock()

	if !hasData {
		fetchRealQuota()
		mu.Lock()
		cur = cachedStats
		mu.Unlock()
	}
	if cur.ResetIn5h == "" {
		cur.ResetIn5h = "--"
	}
	if cur.ResetInWeek == "" {
		cur.ResetInWeek = "--"
	}
	return cur
}
