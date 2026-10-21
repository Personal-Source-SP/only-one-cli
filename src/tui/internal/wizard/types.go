package wizard

type AssetCategory string

const (
	CategorySkills   AssetCategory = "skills"
	CategoryRules    AssetCategory = "rules"
	CategoryConfigs  AssetCategory = "configs"
	CategoryPackages AssetCategory = "packages"
	CategoryCombos   AssetCategory = "combos"
	CategoryMcps     AssetCategory = "mcps"
	CategoryShell    AssetCategory = "shell"
	CategoryIgnore   AssetCategory = "ignore"
)

type ResourceItem struct {
	ID          string
	Name        string
	Category    AssetCategory
	Description string
	Selected    bool
	IsInstalled bool
}

type IdeOption struct {
	ID       string
	Label    string
	Selected bool
}
