package wizard

import (
	"io"
	"os"
	"path/filepath"
	"strings"
)

func InstallSelectedAssets(workspaceDir, assetsDir string, items []ResourceItem, ides []string, overwrite bool) error {
	for _, item := range items {
		if !item.Selected {
			continue
		}

		switch item.Category {
		case CategorySkills:
			src := filepath.Join(assetsDir, "agents", "skills", item.ID)
			dest := filepath.Join(workspaceDir, ".agents", "skills", item.ID)
			if !overwrite {
				if _, err := os.Stat(dest); err == nil {
					continue
				}
			}
			_ = os.MkdirAll(filepath.Dir(dest), 0o755)
			_ = copyDir(src, dest)

		case CategoryRules:
			src := filepath.Join(assetsDir, "agents", "rules", item.ID)
			// Install to .agents/rules by default
			dest := filepath.Join(workspaceDir, ".agents", "rules", item.ID)
			if overwrite || osIsNotExist(dest) {
				_ = os.MkdirAll(filepath.Dir(dest), 0o755)
				_ = copyFile(src, dest)
			}
			// Also copy to additional selected IDE paths if requested
			for _, ide := range ides {
				if ide == "cursor" {
					cDest := filepath.Join(workspaceDir, ".cursor", "rules", item.ID)
					if overwrite || osIsNotExist(cDest) {
						_ = os.MkdirAll(filepath.Dir(cDest), 0o755)
						_ = copyFile(src, cDest)
					}
				}
			}

		case CategoryConfigs:
			src := filepath.Join(assetsDir, "templates", "configs", item.ID)
			dest := filepath.Join(workspaceDir, item.Name)
			if overwrite || osIsNotExist(dest) {
				_ = os.MkdirAll(filepath.Dir(dest), 0o755)
				_ = copyFile(src, dest)
			}

		case CategoryIgnore:
			src := filepath.Join(assetsDir, "templates", "ignore", item.ID)
			destName := item.Name
			destPath := filepath.Join(workspaceDir, destName)
			if destName == ".gitignore" {
				_ = mergeGitIgnore(src, destPath)
			} else if overwrite || osIsNotExist(destPath) {
				_ = copyFile(src, destPath)
			}
		}
	}
	return nil
}

func osIsNotExist(path string) bool {
	_, err := os.Stat(path)
	return os.IsNotExist(err)
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		target := filepath.Join(dst, rel)
		if info.IsDir() {
			return os.MkdirAll(target, 0o755)
		}
		return copyFile(path, target)
	})
}

func mergeGitIgnore(srcTemplate, destFile string) error {
	tplBytes, err := os.ReadFile(srcTemplate)
	if err != nil {
		return err
	}
	tplContent := string(tplBytes)

	origBytes, err := os.ReadFile(destFile)
	if err != nil {
		// Dest file does not exist, simply write template
		return os.WriteFile(destFile, tplBytes, 0o644)
	}

	origContent := string(origBytes)
	origLines := strings.Split(origContent, "\n")
	existing := make(map[string]bool)
	for _, l := range origLines {
		t := strings.TrimSpace(l)
		if t != "" {
			existing[t] = true
		}
	}

	var toAppend []string
	tplLines := strings.Split(tplContent, "\n")
	for _, l := range tplLines {
		t := strings.TrimSpace(l)
		if t != "" && !strings.HasPrefix(t, "#") && !existing[t] {
			toAppend = append(toAppend, l)
		}
	}

	if len(toAppend) > 0 {
		newContent := strings.TrimRight(origContent, "\r\n") + "\n\n# AI & Only One Ignores\n" + strings.Join(toAppend, "\n") + "\n"
		return os.WriteFile(destFile, []byte(newContent), 0o644)
	}
	return nil
}
