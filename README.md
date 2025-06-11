
# Enable GH Pages
Enable GitHub Pages in the repository settings to host the documentation.
Set source: Deploy from Branch

Choose a branch (e.g. main) and for folder set /docs to publish the documentation. If docs directory does not exist, create it with a placeholder index.html file.

# Copilot Metrics API
To access this endpoint, the Copilot Metrics API access policy must be enabled for the organization. Only organization owners and owners and billing managers of the parent enterprise can view Copilot metrics.

# Token
Solution requires OAuth personal access tokens (classic) with manage_billing:copilot, read:org, or read:enterprise scopes to use this endpoint for Copilot metrics.

Solution requires repo scope to use to write files to the repository.



