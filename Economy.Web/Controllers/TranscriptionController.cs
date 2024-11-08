using Microsoft.AspNetCore.Mvc;
using Economy.AiInterface;
using Economy.AiInterface.StateManagement;

namespace Economy.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TranscriptionController(TranscriptionService transcriptionService, Chat chat) : ControllerBase
    {
        [HttpPost]
        [Route("transcribe")]
        public async Task<IActionResult> TranscribeAudio()
        {
            var audioFile = Request.Form.Files["audio"];
            if (audioFile == null || audioFile.Length == 0)
            {
                return BadRequest("No audio file provided.");
            }

            using var memoryStream = new MemoryStream();
            await audioFile.CopyToAsync(memoryStream);

            memoryStream.Position = 0;

            var transcription = await transcriptionService.Transcribe(memoryStream);
            var response = await chat.Go(transcription);
            return Ok(new { transcription = $"{transcription}{Environment.NewLine}{response}" });
        }
    }
}
