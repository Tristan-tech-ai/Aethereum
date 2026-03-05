<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeContentJob;
use App\Models\LearningContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContentController extends Controller
{
    /**
     * POST /api/v1/content/upload
     *
     * Handle multipart file upload (PDF, image, PPTX).
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file'  => ['required', 'file', 'max:20480', 'mimes:pdf,jpg,jpeg,png,gif,webp,pptx'],
            'title' => ['nullable', 'string', 'max:500'],
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());

        // Determine content type from extension
        $contentType = match ($extension) {
            'pdf'                       => 'pdf',
            'pptx'                      => 'pptx',
            'jpg', 'jpeg', 'png', 'gif', 'webp' => 'image',
            default                     => 'pdf',
        };

        // Store file: local for dev, S3 for prod (configured via FILESYSTEM_DISK)
        $path = $file->store(
            'contents/' . $request->user()->id,
            config('filesystems.default')
        );

        $content = LearningContent::create([
            'user_id'           => $request->user()->id,
            'title'             => $request->input('title', pathinfo($originalName, PATHINFO_FILENAME)),
            'content_type'      => $contentType,
            'original_filename' => $originalName,
            'file_path'         => $path,
            'status'            => 'processing',
        ]);

        AnalyzeContentJob::dispatch($content);

        return response()->json([
            'message' => 'Content uploaded successfully. Processing started.',
            'data'    => $content,
        ], 201);
    }

    /**
     * POST /api/v1/content/url
     *
     * Handle YouTube & web article URLs.
     */
    public function url(Request $request): JsonResponse
    {
        $request->validate([
            'url'   => ['required', 'url', 'max:2000'],
            'title' => ['nullable', 'string', 'max:500'],
        ]);

        $url = $request->input('url');
        $contentType = $this->detectUrlContentType($url);

        // Derive a title from the URL if none provided
        $title = $request->input('title')
            ?? ($contentType === 'youtube' ? 'YouTube Video' : 'Web Article');

        $content = LearningContent::create([
            'user_id'      => $request->user()->id,
            'title'        => $title,
            'content_type' => $contentType,
            'source_url'   => $url,
            'status'       => 'processing',
        ]);

        AnalyzeContentJob::dispatch($content);

        return response()->json([
            'message' => 'URL submitted successfully. Processing started.',
            'data'    => $content,
        ], 201);
    }

    /**
     * GET /api/v1/content
     *
     * List user's contents (paginated, filterable).
     */
    public function index(Request $request): JsonResponse
    {
        $query = LearningContent::where('user_id', $request->user()->id)
            ->orderByDesc('created_at');

        if ($request->filled('content_type')) {
            $query->where('content_type', $request->input('content_type'));
        }

        if ($request->filled('subject_category')) {
            $query->where('subject_category', $request->input('subject_category'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $contents = $query->paginate($perPage);

        return response()->json($contents);
    }

    /**
     * GET /api/v1/content/{id}
     *
     * Show a single content with its status (for polling).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $content = LearningContent::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['data' => $content]);
    }

    /**
     * DELETE /api/v1/content/{id}
     *
     * Delete content + related files + cards.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $content = LearningContent::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Delete the stored file if it exists
        if ($content->file_path && Storage::exists($content->file_path)) {
            Storage::delete($content->file_path);
        }

        // Related knowledge_cards, quizzes, sessions are cascade-deleted via FK
        $content->delete();

        return response()->json(['message' => 'Content deleted successfully.']);
    }

    // ─── Helpers ─────────────────────────────────────────────

    /**
     * Detect whether the URL is YouTube or a generic article.
     */
    private function detectUrlContentType(string $url): string
    {
        $host = parse_url($url, PHP_URL_HOST) ?? '';

        if (Str::contains($host, ['youtube.com', 'youtu.be'])) {
            return 'youtube';
        }

        return 'article';
    }
}
