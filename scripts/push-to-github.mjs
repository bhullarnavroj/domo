import { execSync } from "child_process";

const token = process.env.GITHUB_TOKEN;
const username = "bhullarnavroj";
const repoName = "domo";

if (!token) {
  console.error("GITHUB_TOKEN not set");
  process.exit(1);
}

const remoteUrl = `https://${username}:${token}@github.com/${username}/${repoName}.git`;

try {
  const currentRemotes = execSync("git remote -v", { encoding: "utf-8" });
  if (currentRemotes.includes("github")) {
    execSync(`git remote set-url github "${remoteUrl}"`, { encoding: "utf-8" });
    console.log("Updated existing github remote");
  } else {
    execSync(`git remote add github "${remoteUrl}"`, { encoding: "utf-8" });
    console.log("Added github remote");
  }
} catch (e) {
  console.log("Remote setup note:", e.message?.substring(0, 100));
}

console.log("Pushing to GitHub...");
try {
  const result = execSync(`git push github main`, { encoding: "utf-8", stdio: "pipe" });
  console.log("Push successful!", result);
} catch (e) {
  console.log("Push output:", e.stdout);
  console.log("Push stderr:", e.stderr);
  if (e.stderr?.includes("Everything up-to-date") || e.stdout?.includes("Everything up-to-date")) {
    console.log("Already up to date!");
  } else {
    console.error("Push failed:", e.message?.substring(0, 200));
    process.exit(1);
  }
}

console.log(`\nSuccess! Repository available at: https://github.com/${username}/${repoName}`);
