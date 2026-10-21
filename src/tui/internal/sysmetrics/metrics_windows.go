//go:build windows

package sysmetrics

import (
	"fmt"
	"unsafe"

	"golang.org/x/sys/windows"
)

var (
	modkernel32              = windows.NewLazySystemDLL("kernel32.dll")
	procGlobalMemoryStatusEx = modkernel32.NewProc("GlobalMemoryStatusEx")
	procGetTickCount64       = modkernel32.NewProc("GetTickCount64")
	procGetSystemTimes       = modkernel32.NewProc("GetSystemTimes")

	lastIdleTime   windows.Filetime
	lastKernelTime windows.Filetime
	lastUserTime   windows.Filetime
	hasLastTime    bool
)

type memoryStatusEx struct {
	Length               uint32
	MemoryLoad           uint32
	TotalPhys            uint64
	AvailPhys            uint64
	TotalPageFile        uint64
	AvailPageFile        uint64
	TotalVirtual         uint64
	AvailVirtual         uint64
	AvailExtendedVirtual uint64
}

func GetSystemMetrics() SystemMetrics {
	var mem memoryStatusEx
	mem.Length = uint32(unsafe.Sizeof(mem))
	_, _, _ = procGlobalMemoryStatusEx.Call(uintptr(unsafe.Pointer(&mem)))

	rTick, _, _ := procGetTickCount64.Call()
	uptimeMs := uint64(rTick)
	hours := uptimeMs / (1000 * 60 * 60)
	minutes := (uptimeMs / (1000 * 60)) % 60
	uptimeStr := fmt.Sprintf("%dh%02dm", hours, minutes)

	var idleTime, kernelTime, userTime windows.Filetime
	var cpuPercent float64
	rTimes, _, _ := procGetSystemTimes.Call(
		uintptr(unsafe.Pointer(&idleTime)),
		uintptr(unsafe.Pointer(&kernelTime)),
		uintptr(unsafe.Pointer(&userTime)),
	)
	if rTimes != 0 {
		if hasLastTime {
			idle := filetimeDiff(lastIdleTime, idleTime)
			kernel := filetimeDiff(lastKernelTime, kernelTime)
			user := filetimeDiff(lastUserTime, userTime)
			total := kernel + user
			if total > 0 {
				cpuPercent = float64(total-idle) * 100.0 / float64(total)
				if cpuPercent < 0 {
					cpuPercent = 0
				}
				if cpuPercent > 100 {
					cpuPercent = 100
				}
			}
		}
		lastIdleTime = idleTime
		lastKernelTime = kernelTime
		lastUserTime = userTime
		hasLastTime = true
	}

	return SystemMetrics{
		CPUPercent: cpuPercent,
		RAMPercent: int(mem.MemoryLoad),
		UptimeStr:  uptimeStr,
	}
}

func filetimeDiff(ft1, ft2 windows.Filetime) uint64 {
	t1 := (uint64(ft1.HighDateTime) << 32) | uint64(ft1.LowDateTime)
	t2 := (uint64(ft2.HighDateTime) << 32) | uint64(ft2.LowDateTime)
	if t2 > t1 {
		return t2 - t1
	}
	return 0
}
