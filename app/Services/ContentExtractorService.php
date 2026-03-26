<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Smalot\PdfParser\Parser as PdfParser;

class ContentExtractorService
{
    private const MAX_TEXT_LENGTH = 50000;

    // ─────────────────────────────────────────────────────────────
    // PDF
    // ─────────────────────────────────────────────────────────────

    /**
     * Extract text from a stored PDF file.
     */
    public function extractFromPdf(string $filePath): string
    {
        $absolutePath = Storage::path($filePath);

        if (!file_exists($absolutePath)) {
            throw new RuntimeException("PDF file not found: {$filePath}");
        }

        $parser = new PdfParser();

        try {
            $pdf  = $parser->parseFile($absolutePath);
            $text = $pdf->getText();
        } catch (\Throwable $e) {
            throw new RuntimeException("Failed to parse PDF: " . $e->getMessage());
        }

        $text = $this->cleanText($text);

        if (empty(trim($text))) {
            throw new RuntimeException(
                'No text could be extracted from this PDF. It may be a scanned document. '
                . 'Try uploading an image instead.'
            );
        }

        return $this->truncate($text);
    }

    // ─────────────────────────────────────────────────────────────
    // YouTube
    // ─────────────────────────────────────────────────────────────

    /**
     * Extract transcript from a YouTube video URL.
     * Falls back to Jina Reader if captions are unavailable.
     */
    public function extractFromYoutube(string $url): array
    {
        $videoId = $this->parseYoutubeVideoId($url);
        if (!$videoId) {
            throw new RuntimeException("Invalid YouTube URL: {$url}");
        }

        try {
            $transcript = $this->fetchYoutubeCaptions($videoId);
            if (!empty($transcript)) {
                return [
                    'text'     => $this->truncate($transcript),
                    'method'   => 'youtube_captions',
                    'video_id' => $videoId,
                ];
            }
        } catch (\Throwable $e) {
            Log::warning("YouTube caption fetch failed for {$videoId}: " . $e->getMessage());
        }

        // Fallback: Jina Reader for page metadata
        Log::info("Falling back to Jina for YouTube URL: {$url}");
        $jinaText = $this->extractFromArticle($url);

        return [
            'text'     => $jinaText,
            'method'   => 'jina_fallback',
            'video_id' => $videoId,
        ];
    }

    /**
     * Fetch captions from YouTube's timedtext API.
     */
    private function fetchYoutubeCaptions(string $videoId): string
    {
        $response = Http::withHeaders([
            'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language' => 'en-US,en;q=0.9,id;q=0.8',
        ])->timeout(20)->get("https://www.youtube.com/watch?v={$videoId}");

        if (!$response->successful()) {
            return '';
        }

        $html = $response->body();

        // Extract captionTracks JSON from page
        if (!preg_match('/"captionTracks":\s*(\[.*?\])\s*,\s*"audioTracks"/', $html, $matches)) {
            return '';
        }

        $captionTracks = json_decode($matches[1], true);
        if (!$captionTracks) {
            return '';
        }

        // Prefer English or Indonesian captions
        $track = null;
        foreach ($captionTracks as $t) {
            $lang = $t['languageCode'] ?? '';
            if (str_starts_with($lang, 'en') || str_starts_with($lang, 'id')) {
                $track = $t;
                break;
            }
        }
        $track ??= $captionTracks[0] ?? null;

        if (empty($track['baseUrl'])) {
            return '';
        }

        $captionResponse = Http::timeout(15)->get($track['baseUrl']);
        if (!$captionResponse->successful()) {
            return '';
        }

        // Parse XML caption track
        $xmlContent = $captionResponse->body();
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlContent);
        if (!$xml) {
            return '';
        }

        $transcript = '';
        foreach ($xml->text as $segment) {
            $text = html_entity_decode(strip_tags((string) $segment), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $transcript .= trim($text) . ' ';
        }

        return trim($transcript);
    }

    /**
     * Parse a YouTube video ID from various URL formats.
     */
    private function parseYoutubeVideoId(string $url): ?string
    {
        $patterns = [
            '/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/',
            '/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/',
            '/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/',
            '/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    // ─────────────────────────────────────────────────────────────
    // Web Article (Jina Reader)
    // ─────────────────────────────────────────────────────────────

    /**
     * Extract clean text from a web article using Jina Reader API.
     */
    public function extractFromArticle(string $url): string
    {
        $jinaKey = config('services.jina.api_key', '');

        $headers = [
            'Accept'          => 'text/plain',
            'X-Return-Format' => 'text',
        ];

        if (!empty($jinaKey)) {
            $headers['Authorization'] = "Bearer {$jinaKey}";
        }

        $response = Http::withHeaders($headers)
            ->timeout(30)
            ->get('https://r.jina.ai/' . $url);

        if (!$response->successful()) {
            throw new RuntimeException("Jina Reader failed [{$response->status()}] for URL: {$url}");
        }

        $text = $this->cleanText($response->body());

        if (empty(trim($text))) {
            throw new RuntimeException("No content extracted from URL: {$url}");
        }

        return $this->truncate($text);
    }

    // ─────────────────────────────────────────────────────────────
    // Image (via Gemini Vision)
    // ─────────────────────────────────────────────────────────────

    /**
     * For image content — return a placeholder so Gemini can analyze from filename/title.
     * Full vision support can be added later.
     */
    public function extractFromImage(string $filePath): string
    {
        $filename = basename($filePath);
        return "Image file: {$filename}. Please analyze the visual content and create educational sections based on what you can infer from the filename and context.";
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private function cleanText(string $text): string
    {
        // Normalize line breaks
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        // Remove excessive blank lines
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        // Remove null bytes and control characters (except newline/tab)
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $text);

        return trim($text);
    }

    private function truncate(string $text): string
    {
        if (mb_strlen($text) > self::MAX_TEXT_LENGTH) {
            $text = mb_substr($text, 0, self::MAX_TEXT_LENGTH)
                . "\n\n[Content truncated for analysis]";
        }

        return $text;
    }
}
