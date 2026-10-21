//go:build !windows

package sysmetrics

func GetSystemMetrics() SystemMetrics {
	return SystemMetrics{
		CPUPercent: 5.0,
		RAMPercent: 40,
		UptimeStr:  "2h30m",
	}
}
