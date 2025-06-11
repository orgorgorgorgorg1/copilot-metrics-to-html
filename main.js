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
const filename = `copilot-metrics-${utctimestamp}.html`;

const [owner, repo] = reponame.split("/");


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

// Convert JSON to a simple HTML table (replace with your preferred HTML)
function jsonToHtmlTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return "<html><body><h2>No data available</h2></body></html>";
  }
  let html = "<html><body>";
  data.forEach((item, idx) => {
    html += `<h2>Metrics for ${item.date || "Item " + (idx + 1)}</h2><table border="1">`;
    for (const key in item) {
      html += `<tr><td>${key}</td><td>${JSON.stringify(item[key])}</td></tr>`;
    }
    html += "</table>";
  });
  html += "</body></html>";
  return html;
}

async function main() {
  console.log(`Fetching Copilot metrics for organization: ${organization}`);
  const result = await getOrganizationMetrics();
  const htmlContent = jsonToHtmlTable(result);

   // Create or update the file
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    branch: branchname,
    path: `docs/${filename}`,
    message: "Create Copilot metrics HTML",
    content: Buffer.from(htmlContent).toString("base64"),
  });

  console.log(`HTML published to GitHub Pages: https://${owner}.github.io/${repo}/${filename}`);
}

main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});