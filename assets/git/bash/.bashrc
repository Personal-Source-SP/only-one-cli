# Git Bash Environment Configuration (.bashrc)
# Compatible with Git Bash on Windows & macOS

# --- Encoding & Language ---
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# --- Git Prompt Configuration ---
if [ -f /usr/share/git/completion/git-prompt.sh ]; then
    source /usr/share/git/completion/git-prompt.sh
elif [ -f "C:/Program Files/Git/etc/profile.d/git-prompt.sh" ]; then
    source "C:/Program Files/Git/etc/profile.d/git-prompt.sh"
fi

export PS1='\[\033[32m\]\u@\h \[\033[33m\]\w\[\033[36m\]$(__git_ps1 " (%s)")\[\033[0m\]\n$ '
