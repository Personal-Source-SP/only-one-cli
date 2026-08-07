# SSH & Identity Switcher Aliases
alias ghpersonal="ssh-add -D && ssh-add ~/.ssh/id_ed25519"
alias ghzdn="ssh-add -D && ssh-add ~/.ssh/id_ed25519-kiem-zodinet"

alias activepersonal="ghpersonal && git config --local user.name kiem.nguyen --replace-all && git config --local user.email nguyenhaanhkiem@gmail.com --replace-all"
alias activezodinet="ghzdn && git config --local user.name kiem.nguyen --replace-all && git config --local user.email kiem.nguyen@zodinet.com --replace-all"
