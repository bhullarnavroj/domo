import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const CONNECTORS_HOST = process.env.REPLIT_CONNECTORS_HOSTNAME;
const REPL_IDENTITY = process.env.REPL_IDENTITY;
const REPL_IDENTITY_KEY = process.env.REPL_IDENTITY_KEY;

if (!CONNECTORS_HOST || !REPL_IDENTITY) {
  console.error("Missing connector env vars");
  process.exit(1);
}

async function githubProxy(endpoint, options = {}) {
  const url = `https://${CONNECTORS_HOST}/proxy/github${endpoint}`;
  const headers = {
    "X-Replit-Identity": REPL_IDENTITY,
    "Content-Type": "application/json",
    "Accept": "application/vnd.github+json",
  };
  if (REPL_IDENTITY_KEY) {
    headers["X-Replit-Identity-Key"] = REPL_IDENTITY_KEY;
  }
  const resp = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch {
    return { status: resp.status, data: text };
  }
}

// Step 1: Get authenticated user
console.log("Getting GitHub user info...");
const userResult = await githubProxy("/user");
if (userResult.status !== 200) {
  console.error("Failed to get user:", JSON.stringify(userResult.data));
  process.exit(1);
}
const username = userResult.data.login;
console.log(`Authenticated as: ${username}`);

// Step 2: Create the repository
console.log("Creating repository 'domo'...");
const createResult = await githubProxy("/user/repos", {
  method: "POST",
  body: JSON.stringify({
    name: "domo",
    description: "Domo - Property Services Marketplace connecting property owners with service professionals",
    private: false,
    auto_init: false,
  }),
});

if (createResult.status === 201) {
  console.log(`Repository created: ${createResult.data.html_url}`);
} else if (createResult.status === 422 && createResult.data.errors?.[0]?.message?.includes("already exists")) {
  console.log(`Repository 'domo' already exists for ${username}, proceeding...`);
} else {
  console.error("Failed to create repo:", JSON.stringify(createResult.data));
  process.exit(1);
}

const repoUrl = `https://github.com/${username}/domo.git`;
console.log(`\nRepository URL: ${repoUrl}`);
console.log(`\nTo push the code, you need to run:`);
console.log(`  git remote add origin ${repoUrl}`);
console.log(`  git push -u origin main`);
console.log(`\nGitHub username: ${username}`);
console.log(`REPO_URL=${repoUrl}`);
console.log(`GITHUB_USERNAME=${username}`);
