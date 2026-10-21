package taskscanner

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

func parseDateString(val interface{}) string {
	if val == nil {
		return ""
	}
	if s, ok := val.(string); ok {
		return s
	}
	if t, ok := val.(time.Time); ok {
		return t.Format("2006-01-02")
	}
	s := fmt.Sprintf("%v", val)
	if s == "<nil>" {
		return ""
	}
	return s
}

type TaskModel struct {
	Slug       string   `json:"slug"`
	FolderPath string   `json:"folderPath"`
	Status     string   `json:"status"`
	Title      string   `json:"title"`
	CreatedAt  string   `json:"createdAt"`
	Docs       []string `json:"docs"`
}

type TaskDoc struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type ColumnModel struct {
	ID    string      `json:"id"`
	Title string      `json:"title"`
	Tasks []TaskModel `json:"tasks"`
}

func ParseFrontmatter(content string) (map[string]interface{}, string) {
	data := make(map[string]interface{})
	parts := strings.SplitN(content, "---", 3)
	if len(parts) >= 3 {
		_ = yaml.Unmarshal([]byte(parts[1]), &data)
		return data, parts[2]
	}
	return data, content
}

func ScanTasks(workspaceDir string) ([]TaskModel, error) {
	tasksRoot := filepath.Join(workspaceDir, "only-one", "tasks")
	entries, err := os.ReadDir(tasksRoot)
	if err != nil {
		return []TaskModel{}, nil
	}

	var tasks []TaskModel
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		folder := filepath.Join(tasksRoot, e.Name())
		status := "concept"
		title := e.Name()
		createdAt := ""

		var docs []string
		for _, docName := range []string{"concept.md", "plan.md", "debug.md", "review.md"} {
			if _, err := os.Stat(filepath.Join(folder, docName)); err == nil {
				docs = append(docs, strings.TrimSuffix(docName, ".md"))
			}
		}

		for _, docName := range []string{"debug.md", "plan.md", "concept.md"} {
			docPath := filepath.Join(folder, docName)
			raw, err := os.ReadFile(docPath)
			if err == nil {
				fm, body := ParseFrontmatter(string(raw))
				if s, ok := fm["status"].(string); ok {
					s = strings.ToLower(s)
					if s == "plan" || s == "planned" {
						status = "plan"
					} else if s == "processing" || s == "in_progress" || s == "in-progress" || s == "debug" || s == "apply" {
						status = "processing"
					} else if s == "done" || s == "completed" || s == "fixed" || s == "resolved" {
						status = "done"
					}
				}
				if ca := parseDateString(fm["created_at"]); ca != "" {
					createdAt = ca
				} else if sa := parseDateString(fm["started_at"]); sa != "" {
					createdAt = sa
				}
				lines := strings.Split(body, "\n")
				for _, l := range lines {
					trimmed := strings.TrimSpace(l)
					if strings.HasPrefix(trimmed, "# ") {
						title = strings.TrimPrefix(trimmed, "# ")
						break
					}
				}
				break
			}
		}

		if createdAt == "" {
			if raw, err := os.ReadFile(filepath.Join(folder, "concept.md")); err == nil {
				fm, _ := ParseFrontmatter(string(raw))
				if ca := parseDateString(fm["created_at"]); ca != "" {
					createdAt = ca
				} else if sa := parseDateString(fm["started_at"]); sa != "" {
					createdAt = sa
				}
			}
		}

		if len(createdAt) >= 10 {
			createdAt = createdAt[:10]
		}

		tasks = append(tasks, TaskModel{
			Slug:       e.Name(),
			FolderPath: folder,
			Status:     status,
			Title:      title,
			CreatedAt:  createdAt,
			Docs:       docs,
		})
	}
	return tasks, nil
}

func GroupTasksByColumn(tasks []TaskModel) []ColumnModel {
	cols := []ColumnModel{
		{ID: "concept", Title: "CONCEPT", Tasks: []TaskModel{}},
		{ID: "plan", Title: "PLAN", Tasks: []TaskModel{}},
		{ID: "processing", Title: "PROCESSING", Tasks: []TaskModel{}},
		{ID: "done", Title: "DONE", Tasks: []TaskModel{}},
	}
	for _, t := range tasks {
		placed := false
		for i := range cols {
			if cols[i].ID == t.Status {
				cols[i].Tasks = append(cols[i].Tasks, t)
				placed = true
				break
			}
		}
		if !placed {
			cols[0].Tasks = append(cols[0].Tasks, t)
		}
	}
	return cols
}

func UpdateTaskStatus(folderPath, newStatus string) error {
	for _, docName := range []string{"debug.md", "plan.md", "concept.md"} {
		p := filepath.Join(folderPath, docName)
		raw, err := os.ReadFile(p)
		if err == nil {
			fm, body := ParseFrontmatter(string(raw))
			fm["status"] = newStatus
			out, err := yaml.Marshal(fm)
			if err == nil {
				newContent := "---\n" + string(out) + "---\n" + body
				return os.WriteFile(p, []byte(newContent), 0644)
			}
		}
	}
	return nil
}

func GetTaskDocs(folderPath string) []TaskDoc {
	var docs []TaskDoc
	for _, name := range []string{"concept.md", "plan.md", "debug.md", "review.md"} {
		p := filepath.Join(folderPath, name)
		content, err := os.ReadFile(p)
		if err == nil {
			docs = append(docs, TaskDoc{Name: name, Content: string(content)})
		}
	}
	return docs
}

func CleanCompletedTasks(workspaceDir string) (int, error) {
	tasks, err := ScanTasks(workspaceDir)
	if err != nil {
		return 0, err
	}
	archivesRoot := filepath.Join(workspaceDir, "only-one", "archives")
	_ = os.MkdirAll(archivesRoot, 0755)

	cleanedCount := 0
	for _, t := range tasks {
		if t.Status == "done" {
			dest := filepath.Join(archivesRoot, t.Slug)
			if err := os.Rename(t.FolderPath, dest); err == nil {
				cleanedCount++
			}
		}
	}
	return cleanedCount, nil
}
