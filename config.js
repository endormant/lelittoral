// ====== EDIT THIS FILE ======
window.SITE = {
  name: "Le Littoral",
  tagline: "L’actualité de la côte",
  logo: "logo.png",
  discord: "", // Discord invite link (optional, adds a join box + footer link)
  footer: "Fresh perspectives on local news, stories and culture.",
  legal: "Le Littoral is a fictional news outlet for a Roblox roleplay. Not affiliated with any real companies or events.",
  // Your GitHub repo (needed so employees can publish from the website)
  repo: { owner: "endormant", name: "lelittoral", branch: "main" },
  teamTitle: "Meridia Group",
  teamSub: "The people leading our mission.",
  // Optional "parent company" box on the About page. Set to null to hide.
  parent: { title:"Meridia Group", text:"Holding company operating throughout various sectors in France.", link:"https://discord.gg/FT8Vw54PqS", label:"Discord" }, // e.g. { title:"A Company", text:"About them...", link:"https://...", label:"Visit" }
  categories: ["Local", "Politics", "Sports", "International", "Opinion"],
  // Employee accounts. id = Roblox user ID (the number in roblox.com/users/ID/profile).
  // The Roblox username and avatar headshot are fetched automatically from the ID.
  // Staff log in with their Roblox username + password. Use "password" (plain) or
  // "passwordHash" (SHA-256 hex, make one at  #/hash ).
  accounts: [
    { id: 1585967308, password: "lelittoral1", position: "Board of Directors" },
    { id: 1471875286, password: "lelittoral2", position: "Board of Directors" }
  ]
};
