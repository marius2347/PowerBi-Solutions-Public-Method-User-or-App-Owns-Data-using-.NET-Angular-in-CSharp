using Azure.Core;
using Microsoft.Identity.Client;
using Microsoft.PowerBI.Api;
using Microsoft.PowerBI.Api.Models;

namespace PowerBiAppOwnsData.Server.Services
{
    public class PowerBiService
    {
        private readonly IConfiguration _config;

        public PowerBiService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<EmbedParams> GetEmbedTokenAsync()
        {
            var tenantId = _config["PowerBI:TenantId"];
            var clientId = _config["PowerBI:ClientId"];
            var clientSecret = _config["PowerBI:ClientSecret"];
            var workspaceId = Guid.Parse(_config["PowerBI:WorkspaceId"] ?? throw new InvalidOperationException("WorkspaceId not configured"));
            var reportId = Guid.Parse(_config["PowerBI:ReportId"] ?? throw new InvalidOperationException("ReportId not configured"));

            // authenticate as the Service Principal
            var authorityUrl = $"https://login.microsoftonline.com/{tenantId}";
            var app = ConfidentialClientApplicationBuilder.Create(clientId)
                .WithClientSecret(clientSecret)
                .WithAuthority(authorityUrl)
                .Build();

            var scopes = new[] { "https://analysis.windows.net/powerbi/api/.default" };
            var authResult = await app.AcquireTokenForClient(scopes).ExecuteAsync();

             // connect to Power BI using a custom TokenCredential
            var credential = new StaticTokenCredential(authResult.AccessToken, authResult.ExpiresOn);
            var client = new PowerBIClient(credential);

            // get the Report and Generate an Embed Token
            var report = await client.Reports.GetReportInGroupAsync(workspaceId, reportId);
            var tokenRequest = new GenerateTokenRequest
            {
                AccessLevel = TokenAccessLevel.View
            };
            var embedToken = await client.Reports.GenerateTokenInGroupAsync(workspaceId, reportId, tokenRequest);

            return new EmbedParams
            {
                EmbedToken = embedToken.Value.Token,
                EmbedUrl = report.Value.EmbedUrl,
                ReportId = report.Value.Id.ToString()
            };
        }
    }


    public class StaticTokenCredential : TokenCredential
    {
        private readonly AccessToken _accessToken;

        public StaticTokenCredential(string token, DateTimeOffset expiresOn)
        {
            _accessToken = new AccessToken(token, expiresOn);
        }

        public override AccessToken GetToken(TokenRequestContext requestContext, CancellationToken cancellationToken) => _accessToken;

        public override ValueTask<AccessToken> GetTokenAsync(TokenRequestContext requestContext, CancellationToken cancellationToken) => new(_accessToken);
    }

    public class EmbedParams
    {
        public required string EmbedToken { get; set; }
        public required string EmbedUrl { get; set; }
        public required string ReportId { get; set; }
    }
}