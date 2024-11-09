using Microsoft.Extensions.Options;
using OpenAI.Audio;

namespace Economy.AiInterface.Transcription;

public class TranscriptionService(IOptions<AiInterfaceOptions> aiInterfaceOptions)
{
    public async Task<string> Transcribe(Stream stream)
    {
        AudioClient client = new("whisper-1", aiInterfaceOptions.Value.ApiKey);

        AudioTranscriptionOptions options = new()
        {
            ResponseFormat = AudioTranscriptionFormat.Text,
            TimestampGranularities = AudioTimestampGranularities.Default,
        };

        AudioTranscription transcription = await client.TranscribeAudioAsync(stream, "audio.webm", options);

        return transcription.Text;
    }
}