// ====== EDIT THIS FILE ======
window.SITE = {
  name: "Le Littoral",
  tagline: "L’actualité de la côte",
  logo: "logo.png",
  discord: "", // Discord invite link (optional, adds a join box + footer link)
  footer: "Fresh perspectives on local news, stories and culture.",
  legal: "Le Littoral is a fictional news outlet for a Roblox roleplay. Not affiliated with any real companies or events.",
  // Your GitHub repo (needed so employees can publish from the website)
  repo: { owner: "YOUR_GITHUB_USERNAME", name: "YOUR_REPO_NAME", branch: "main" },
  teamTitle: "Leadership",
  teamSub: "The people leading our mission.",
  // Optional "parent company" box on the About page. Set to null to hide.
  parent: null, // e.g. { title:"A Company", text:"About them...", link:"https://...", label:"Visit" }
  categories: ["Local", "Politics", "Sports", "Weather", "Opinion"],
  // Employee accounts. username = Roblox username (avatar is fetched automatically).
  // Use "password" (plain) or "passwordHash" (SHA-256 hex, make one at  #/hash ).
  accounts: [
    { username: "Roblox", password: "change-me", position: "Editor-in-Chief" },
    { username: "builderman", password: "change-me-too", position: "Reporter" }
  ]
};
