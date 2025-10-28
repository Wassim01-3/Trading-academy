<?php

namespace App\Controller\Api;

use App\Entity\Announcement;
use App\Repository\AnnouncementRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Controller\Api\BaseApiController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/announcements', name: 'api_announcements_')]
class AnnouncementController extends BaseApiController
{
    public function __construct(
        private AnnouncementRepository $announcementRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(): JsonResponse
    {
        $announcements = $this->announcementRepository->findRecent(10);

        $announcementsData = array_map(function ($announcement) {
            return [
                'id' => $announcement->getId(),
                'title' => $announcement->getTitle(),
                'message' => $announcement->getMessage(),
                'createdAt' => $announcement->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $announcements);

        return new JsonResponse(['announcements' => $announcementsData]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function show(int $id): JsonResponse
    {
        $announcement = $this->announcementRepository->find($id);

        if (!$announcement) {
            return new JsonResponse(['error' => 'Announcement not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'announcement' => [
                'id' => $announcement->getId(),
                'title' => $announcement->getTitle(),
                'message' => $announcement->getMessage(),
                'createdAt' => $announcement->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['title'], $data['message'])) {
            return new JsonResponse(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $announcement = new Announcement();
        $announcement->setTitle($data['title']);
        $announcement->setMessage($data['message']);

        $errors = $this->validator->validate($announcement);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($announcement);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Announcement created successfully',
            'announcement' => [
                'id' => $announcement->getId(),
                'title' => $announcement->getTitle(),
                'message' => $announcement->getMessage(),
                'createdAt' => $announcement->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $announcement = $this->announcementRepository->find($id);

        if (!$announcement) {
            return new JsonResponse(['error' => 'Announcement not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $announcement->setTitle($data['title']);
        }
        if (isset($data['message'])) {
            $announcement->setMessage($data['message']);
        }

        $announcement->setUpdatedAt(new \DateTime());

        $errors = $this->validator->validate($announcement);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Announcement updated successfully',
            'announcement' => [
                'id' => $announcement->getId(),
                'title' => $announcement->getTitle(),
                'message' => $announcement->getMessage(),
                'updatedAt' => $announcement->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $announcement = $this->announcementRepository->find($id);

        if (!$announcement) {
            return new JsonResponse(['error' => 'Announcement not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($announcement);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Announcement deleted successfully']);
    }
}
