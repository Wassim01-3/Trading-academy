<?php

namespace App\Controller\Api;

use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/upload', name: 'api_upload_')]
class UploadController extends BaseApiController
{
    #[Route('', name: 'file', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function uploadFile(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        
        if (!$file) {
            return new JsonResponse([
                'error' => 'No file uploaded'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Configure Cloudinary
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => 'dsfrwlrdz',
                    'api_key' => '719331843411869',
                    'api_secret' => 'sQ5iSnL2KICOigCgtip2BytJHKE'
                ]
            ]);

            $cloudinary = new Cloudinary();
            
            // Upload to Cloudinary
            $uploadResult = $cloudinary->uploadApi()->upload(
                $file->getPathname(),
                [
                    'folder' => 'sigma-trade-content',
                    'resource_type' => 'auto' // auto-detect image, video, raw files
                ]
            );

            // Return the URL
            return new JsonResponse([
                'success' => true,
                'url' => $uploadResult['secure_url'],
                'public_id' => $uploadResult['public_id']
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Upload failed: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

