package wizard

import (
	"os"
	"path/filepath"
	"strings"
)

func FindAssetsRoot(cwd string) string {
	candidates := []string{
		filepath.Join(cwd, "assets"),
		filepath.Join(cwd, "..", "assets"),
		filepath.Join(cwd, "..", "..", "assets"),
	}

	// Also check executable directory
	if exePath, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exePath)
		candidates = append(candidates,
			filepath.Join(exeDir, "assets"),
			filepath.Join(exeDir, "..", "assets"),
		)
	}

	for _, c := range candidates {
		clean := filepath.Clean(c)
		if info, err := os.Stat(clean); err == nil && info.IsDir() {
			return clean
		}
	}
	return filepath.Join(cwd, "assets")
}

func ScanWorkspaceAssets(workspaceDir, assetsDir string) []ResourceItem {
	var items []ResourceItem

	// 1. Skills (assets/agents/skills)
	skillsDir := filepath.Join(assetsDir, "agents", "skills")
	if entries, err := os.ReadDir(skillsDir); err == nil {
		for _, e := range entries {
			if e.IsDir() {
				skillPath := filepath.Join(skillsDir, e.Name(), "SKILL.md")
				if _, err := os.Stat(skillPath); err == nil {
					dest := filepath.Join(workspaceDir, ".agents", "skills", e.Name())
					_, installed := os.Stat(dest)
					items = append(items, ResourceItem{
						ID:          e.Name(),
						Name:        e.Name(),
						Category:    CategorySkills,
						Description: "Custom AI agent skill package",
						Selected:    installed == nil || strings.HasPrefix(e.Name(), "only-one-"),
						IsInstalled: installed == nil,
					})
				}
			}
		}
	}

	// 2. Rules (assets/agents/rules)
	rulesDir := filepath.Join(assetsDir, "agents", "rules")
	if entries, err := os.ReadDir(rulesDir); err == nil {
		for _, e := range entries {
			if !e.IsDir() && strings.HasSuffix(e.Name(), ".md") {
				ruleName := strings.TrimSuffix(e.Name(), ".md")
				dest := filepath.Join(workspaceDir, ".agents", "rules", e.Name())
				_, installed := os.Stat(dest)
				items = append(items, ResourceItem{
					ID:          e.Name(),
					Name:        ruleName,
					Category:    CategoryRules,
					Description: "Architectural and workflow rule",
					Selected:    installed == nil || strings.HasPrefix(e.Name(), "0"),
					IsInstalled: installed == nil,
				})
			}
		}
	}

	// 3. Configs (assets/templates/configs)
	configsDir := filepath.Join(assetsDir, "templates", "configs")
	if entries, err := os.ReadDir(configsDir); err == nil {
		for _, e := range entries {
			if !e.IsDir() {
				dest := filepath.Join(workspaceDir, e.Name())
				_, installed := os.Stat(dest)
				items = append(items, ResourceItem{
					ID:          e.Name(),
					Name:        e.Name(),
					Category:    CategoryConfigs,
					Description: "Project configuration template",
					Selected:    installed == nil,
					IsInstalled: installed == nil,
				})
			}
		}
	}

	// 4. Ignore templates (assets/templates/ignore)
	ignoreDir := filepath.Join(assetsDir, "templates", "ignore")
	if entries, err := os.ReadDir(ignoreDir); err == nil {
		for _, e := range entries {
			if !e.IsDir() && strings.HasSuffix(e.Name(), ".ignore") {
				name := strings.TrimSuffix(e.Name(), ".ignore")
				dest := filepath.Join(workspaceDir, "."+name+"ignore")
				_, installed := os.Stat(dest)
				items = append(items, ResourceItem{
					ID:          e.Name(),
					Name:        "." + name + "ignore",
					Category:    CategoryIgnore,
					Description: "Ignore rules template for " + name,
					Selected:    true,
					IsInstalled: installed == nil,
				})
			}
		}
	}

	// 5. Combos (assets/agents/combos)
	combosDir := filepath.Join(assetsDir, "agents", "combos")
	if entries, err := os.ReadDir(combosDir); err == nil {
		for _, e := range entries {
			if e.IsDir() {
				items = append(items, ResourceItem{
					ID:          e.Name(),
					Name:        e.Name(),
					Category:    CategoryCombos,
					Description: "Preconfigured bundle of rules and skills",
					Selected:    false,
					IsInstalled: false,
				})
			}
		}
	}

	// 6. MCPs (assets/agents/mcps)
	mcpsDir := filepath.Join(assetsDir, "agents", "mcps")
	if entries, err := os.ReadDir(mcpsDir); err == nil {
		for _, e := range entries {
			if e.IsDir() {
				items = append(items, ResourceItem{
					ID:          e.Name(),
					Name:        e.Name(),
					Category:    CategoryMcps,
					Description: "Model Context Protocol server integration",
					Selected:    false,
					IsInstalled: false,
				})
			}
		}
	}

	return items
}
