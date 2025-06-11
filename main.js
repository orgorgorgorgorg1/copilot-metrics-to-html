import { Octokit }  from "@octokit/rest";

// Get GitHub token from environment (provided by GitHub workflow)
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error('Error: GITHUB_TOKEN environment variable not set');
  process.exit(1);
}

// Get organization name from environment
const organization = process.env.GITHUB_ORGANIZATION;
if (!organization) {
  console.error('Error: GITHUB_ORGANIZATION environment variable not set');
  process.exit(1);
}

// Get organization name from environment
const reponame = process.env.GITHUB_REPOSITORY;
if (!reponame) {
  console.error('Error: GITHUB_REPOSITORY environment variable not set');
  process.exit(1);
}

// Get organization name from environment
const branchname = process.env.GITHUB_BRANCH_NAME;
if (!branchname) {
  console.error('Error: BRANCH_NAME environment variable not set');
  process.exit(1);
}

const utctimestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `docs/copilot-metrics-${utctimestamp}.html`;

// Initialize GitHub API client
const octokit = new Octokit({
  auth: token
});

async function getOrganizationMetrics() {
  try {
    const response = await octokit.rest.copilot.copilotMetricsForOrganization({
      org: organization,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching organization metrics:', error);
  }
}

async function main() {
  console.log(`Fetching Copilot metrics for organization: ${organization}`);
  const result = await getOrganizationMetrics();
   // Create or update the file
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    branch: branchname,
    path: filename,
    message: "Create Copilot metrics HTML",
    content: Buffer.from(result).toString("base64"),
  });

  console.log(`HTML published to GitHub Pages: https://${owner}.github.io/${repo}/${filename}`);
}

main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});