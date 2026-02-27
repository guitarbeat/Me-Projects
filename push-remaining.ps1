# Run this AFTER the first push completes and you've closed any other terminals
# that were running git (to release .git/index.lock).
# This commits and pushes: .gitignore update + nini.earth-main/ (without node_modules).

Set-Location $PSScriptRoot
if (Test-Path ".git\index.lock") {
    Write-Host "Removing stale .git/index.lock..."
    Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
}
git add -A
git status
git commit -m "Add nini.earth-main and update .gitignore"
git push origin main
Write-Host "Done. You can delete this folder and clone from: https://github.com/guitarbeat/Me-Projects"
