# Git Aliases & Workflow Helpers
alias gps="git pull && git push"
alias gpf="git push --force"
alias gpl="git pull"
alias gcm="git commit -m"
alias gpo="git pull origin"
alias greset="git reset --soft"
alias gma="git merge --abort"
alias gbc="git checkout -b"
alias grevert="git reset --soft HEAD^"

# Squash merge with standard Git commit message
gsq() {
  local current_branch=$(git branch --show-current)

  git pull origin "$current_branch" && \
  git fetch origin "$1" && \
  git merge --squash "origin/$1" && \
  git commit -m "Merge branch '$1' into $current_branch"
}
