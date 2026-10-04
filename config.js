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
  teamTitle: "Leadership",
  teamSub: "The people leading our mission.",
  // Optional "parent company" box on the About page. Set to null to hide.
  parent: { title:"Meridia Group", text:"Holding Company operating within france, in various sectors.", link:"https://discord.gg/FT8Vw54PqS", label:"Discord" }, // e.g. { title:"A Company", text:"About them...", link:"https://...", label:"Visit" }
  categories: ["Local", "Politics", "Sports", "Weather", "Opinion"],
  // Employee accounts. username = Roblox username (avatar is fetched automatically).
  // Use "password" (plain) or "passwordHash" (SHA-256 hex, make one at  #/hash ).
  accounts: [
    { username: "Endormicus", password: "lelittoral1", position: "Board of Directors" },
    { username: "enzurpIe", password: "lelittoral1", position: "Board of Directors" }
  ]
};
