# Zsh Environment Configuration (.zshrc) - macOS

# --- PATH Setup ---
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# --- Git Prompt ---
autoload -Uz vcs_info
precmd() { vcs_info }
zstyle ':vcs_info:git:*' formats ' (%b)'
setopt PROMPT_SUBST
PROMPT='%F{green}%n@%m %F{cyan}%~%F{yellow}${vcs_info_msg_0_}%f %# '
