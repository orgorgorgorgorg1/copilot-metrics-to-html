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


// Get a list of report files in docs/reports/ from the repo
async function getReportsList() {
  try {
    const res = await octokit.repos.getContent({
      owner,
      repo,
      path: "docs/reports",
      ref: branchname,
    });
    // Only include .html files
    return res.data
      .filter(item => item.type === "file" && item.name.endsWith(".html"))
      .map(item => item.name)
      .sort()
      .reverse(); // newest first
  } catch (error) {
    console.error('Error fetching reports list:', error);
    return [];
  }
}

// Generate index.html content with links to all reports
function generateIndexHtml(reportFiles) {
  let html = `<html><body>
    <h2>Available Reports</h2>
    <ul>
  `;
  if (reportFiles.length === 0) {
    html += "<li>No reports available.</li>";
  } else {
    for (const file of reportFiles) {
      html += `<li><a href="reports/${file}">${file}</a></li>`;
    }
  }
  html += `
    </ul>
  </body></html>`;
  return html;
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

// Helper to get file sha if it exists
async function getFileSha(path) {
  try {
    const res = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branchname,
    });
    return res.data.sha;
  } catch (error) {
    // If file does not exist, return undefined
    if (error.status === 404) return undefined;
    throw error;
  }
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
    path: `docs/reports/${filename}`,
    message: "Create Copilot metrics HTML",
    content: Buffer.from(htmlContent).toString("base64"),
  });

  console.log(`HTML published to GitHub Pages: https://${owner}.github.io/${repo}/reports/${filename}`);

  //generate the index file
   // Get updated list of reports and generate index.html
  const reportFiles = await getReportsList();
  const indexHtml = generateIndexHtml(reportFiles);
  const indexSha = await getFileSha("docs/index.html");

  // Create or update index.html
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    branch: branchname,
    path: `docs/index.html`,
    message: "Update reports index.html",
    content: Buffer.from(indexHtml).toString("base64"),
    sha: indexSha, // Include sha to update existing file
  });
}

main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});