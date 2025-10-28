<?php

namespace App\Controller\Api;

use App\Entity\Content;
use App\Repository\ContentRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Controller\Api\BaseApiController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/content', name: 'api_content_')]
class ContentController extends BaseApiController
{
    public function __construct(
        private ContentRepository $contentRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        $userPlan = $user->getPlan();

        $content = $this->contentRepository->findAvailableForUser($userPlan);

        $contentData = array_map(function ($item) {
            return [
                'id' => $item->getId(),
                'title' => $item->getTitle(),
                'description' => $item->getDescription(),
                'fileUrl' => $item->getFileUrl(),
                'videoUrl' => $item->getVideoUrl(),
                'allowedPlans' => $item->getAllowedPlans(),
                'createdAt' => $item->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $content);

        return new JsonResponse(['content' => $contentData]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function show(int $id): JsonResponse
    {
        $content = $this->contentRepository->find($id);

        if (!$content) {
            return new JsonResponse(['error' => 'Content not found'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        $userPlan = $user->getPlan();

        // Check if user has access to this content
        $allowedPlans = explode(',', $content->getAllowedPlans());
        if (!in_array($userPlan, $allowedPlans)) {
            return new JsonResponse(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return new JsonResponse([
            'content' => [
                'id' => $content->getId(),
                'title' => $content->getTitle(),
                'description' => $content->getDescription(),
                'fileUrl' => $content->getFileUrl(),
                'videoUrl' => $content->getVideoUrl(),
                'allowedPlans' => $content->getAllowedPlans(),
                'createdAt' => $content->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['title'])) {
            return new JsonResponse(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $content = new Content();
        $content->setTitle($data['title']);
        $content->setDescription($data['description'] ?? null);
        $content->setFileUrl($data['fileUrl'] ?? null);
        $content->setVideoUrl($data['videoUrl'] ?? null);
        $content->setContentType($data['contentType'] ?? null);
        $content->setLinkUrl($data['linkUrl'] ?? null);
        $content->setAllowedPlans($data['allowedPlans'] ?? 'basic,advanced,premium');

        $errors = $this->validator->validate($content);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($content);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Content created successfully',
            'content' => [
                'id' => $content->getId(),
                'title' => $content->getTitle(),
                'description' => $content->getDescription(),
                'fileUrl' => $content->getFileUrl(),
                'videoUrl' => $content->getVideoUrl(),
                'allowedPlans' => $content->getAllowedPlans(),
                'createdAt' => $content->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $content = $this->contentRepository->find($id);

        if (!$content) {
            return new JsonResponse(['error' => 'Content not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $content->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $content->setDescription($data['description']);
        }
        if (isset($data['fileUrl'])) {
            $content->setFileUrl($data['fileUrl']);
        }
        if (isset($data['videoUrl'])) {
            $content->setVideoUrl($data['videoUrl']);
        }
        if (isset($data['allowedPlans'])) {
            $content->setAllowedPlans($data['allowedPlans']);
        }

        $content->setUpdatedAt(new \DateTime());

        $errors = $this->validator->validate($content);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Content updated successfully',
            'content' => [
                'id' => $content->getId(),
                'title' => $content->getTitle(),
                'description' => $content->getDescription(),
                'fileUrl' => $content->getFileUrl(),
                'videoUrl' => $content->getVideoUrl(),
                'allowedPlans' => $content->getAllowedPlans(),
                'updatedAt' => $content->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $content = $this->contentRepository->find($id);

        if (!$content) {
            return new JsonResponse(['error' => 'Content not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($content);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Content deleted successfully']);
    }
}
