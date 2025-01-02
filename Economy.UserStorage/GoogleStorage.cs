using System.Net;
using Google;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Google.Apis.Upload;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Economy.UserStorage;

public class GoogleStorage(ILogger<GoogleStorage> logger, IGoogleAuthService googleAuthService, IOptions<GoogleStorageOptions> options)
{
    private const string Folder = "appDataFolder";
    private const string FileNameFormat = "user_data-{0}.bin";

    public static readonly string Scope = DriveService.Scope.DriveAppdata;

    public async Task StoreUserData(byte[] fileContent)
    {
        using var driveService = await CreateDriveService();

        try
        {
            var fileId = await GetExistingFileId(driveService);
            using var stream = new MemoryStream(fileContent);

            if (fileId == null)
            {
                var fileMetadata = new Google.Apis.Drive.v3.Data.File
                {
                    Name = GetFileName(),
                    MimeType = "application/octet-stream",
                    Parents =
                    [
                        Folder
                    ]
                };

                var request = driveService.Files.Create(
                    fileMetadata,
                    stream,
                    "application/octet-stream");

                request.Fields = "id";

                var result = await request.UploadAsync();
                result.ThrowOnFailure();
                logger.LogInformation("A new file uploaded to Google Drive with ID: {0}", request.ResponseBody.Id);
            }
            else
            {
                var request = await driveService.Files.Update(
                    new(),
                    fileId,
                    stream,
                    "application/octet-stream").UploadAsync();

                request.ThrowOnFailure();
                logger.LogInformation("The file updated in Google Drive with ID: {0}", fileId);
            }
        }
        catch (GoogleApiException e) when (e.HttpStatusCode == HttpStatusCode.Forbidden)
        {
            throw new InsufficientScopesException();
        }
        catch (GoogleApiException e) when (e.HttpStatusCode == HttpStatusCode.Unauthorized)
        {
            throw new ReauthenticationNeededException("Trying to access the google storage to retrieve the data.");
        }
    }

    private string GetFileName()
    {
        return string.Format(FileNameFormat, options.Value.TenantName);
    }

    private async Task<DriveService> CreateDriveService()
    {
        var accessToken = await googleAuthService.GetAccessTokenAsync();
        var credential = GoogleCredential.FromAccessToken(accessToken);
        var driveService = new DriveService(new()
        {
            HttpClientInitializer = credential,
            ApplicationName = options.Value.ApplicationName
        });

        return driveService;
    }

    public async Task<byte[]?> RetrieveUserData()
    {
        using var driveService = await CreateDriveService();

        try
        {
            var fileId = await GetExistingFileId(driveService);
            if (fileId == null)
            {
                return null;
            }

            using var stream = new MemoryStream();
            await driveService.Files.Get(fileId).DownloadAsync(stream);
            return stream.ToArray();
        }
        catch (GoogleApiException e) when (e.HttpStatusCode == HttpStatusCode.Forbidden)
        {
            throw new InsufficientScopesException();
        }
        catch (GoogleApiException e) when (e.HttpStatusCode == HttpStatusCode.Unauthorized)
        {
            throw new ReauthenticationNeededException("Trying to access the google storage to retrieve the data.");
        }
    }

    private async Task<string?> GetExistingFileId(DriveService driveService)
    {
        var request = driveService.Files.List();
        request.Q = $"name = '{GetFileName()}'";
        request.Spaces = Folder;
        request.Fields = "files(id)";
        var files = await request.ExecuteAsync();

        switch (files.Files.Count)
        {
            case 0:
                return null;
            case 1:
                return files.Files[0].Id;
            default:
                throw new("Multiple files found in Google Drive.");
        }
    }
}