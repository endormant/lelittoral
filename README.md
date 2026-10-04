# News site (GitHub Pages)

## Setup
1. Create a GitHub repo, upload everything in this folder to the root.
2. Settings > Pages > Deploy from branch `main` / root. Your site appears at `https://USER.github.io/REPO/`.
3. Edit `config.js`: site name, categories, repo owner/name, and employee accounts
   (username = Roblox username, plus password and position).
4. Log in at `#/login`, then publish. The first time you publish, paste a GitHub token.

## GitHub token (each employee)
- Add each employee to the repo as a collaborator (Settings > Collaborators).
- They create a fine-grained token (GitHub > Settings > Developer settings > Fine-grained tokens)
  limited to this repo with **Contents: Read and write**.
- The site stores it in that browser only. Changes go live about a minute after publishing.

## Security note
The site is static, so the username/password check only controls who sees the dashboard.
The GitHub token is what actually protects publishing. Prefer `passwordHash`
(make one at `#/hash`) over plain passwords, since `config.js` is public.

## Roblox avatars
Fetched from Roblox via the roproxy.com mirror (Roblox's own API blocks browser requests).
