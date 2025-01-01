using Markdig;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Economy.Web.Pages;

public class FaqModel(ILogger<FaqModel> logger, IHostEnvironment hostEnvironment) : PageModel
{
    public FaqNode Root { get; } = new("Root");
    public string? HtmlContent { get; private set; }

    public void OnGet(string? filePath)
    {
        // load all .md files (with the directory structure) under the wwwroot/faq directory.
        var markdownsRoot = Path.Combine(hostEnvironment.ContentRootPath, "FAQ");

        // enumerate all files
        var markdowns = Directory.EnumerateFiles(
                markdownsRoot, 
                "*.md", 
                SearchOption.AllDirectories)
            .Select(file => file.Substring(markdownsRoot.Length + 1));

        // build a virtual tree (nested folders and files)
        foreach (var markdown in markdowns)
        {
            var parts = markdown.Split(Path.DirectorySeparatorChar);
            var node = Root;
            foreach (var part in parts)
            {
                var child = node.Children.SingleOrDefault(c => c.Title == part);
                if (child == null)
                {
                    child = new(part);
                    node.Children.Add(child);
                }

                node = child;
            }

            node.Children.Add(new FaqFile(parts[^1], markdown));
        }

        if (!string.IsNullOrEmpty(filePath))
        {
            // Sanitize the file path to prevent security issues
            filePath = filePath.Replace("/", Path.DirectorySeparatorChar.ToString())
                .Replace("\\", Path.DirectorySeparatorChar.ToString());

            if (Path.IsPathRooted(filePath) || filePath.Contains(".."))
            {
                // Invalid file path
                logger.LogWarning("Invalid file path: {FilePath}", filePath);
                return;
            }

            var fullPath = Path.Combine(markdownsRoot, filePath);
            if (System.IO.File.Exists(fullPath))
            {
                var markdown = System.IO.File.ReadAllText(fullPath);
                HtmlContent = Markdown.ToHtml(markdown);
            }
            else
            {
                logger.LogWarning("File not found: {FullPath}", fullPath);
            }
        }
    }

    public record FaqNode(string Title)
    {
        public List<FaqNode> Children { get; } = new();
    }

    public record FaqFile(string Title, string Path) : FaqNode(Title);
}