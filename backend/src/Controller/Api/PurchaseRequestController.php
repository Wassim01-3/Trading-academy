<?php

namespace App\Controller\Api;

use App\Entity\PurchaseRequest;
use App\Repository\PurchaseRequestRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Controller\Api\BaseApiController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/purchase-requests', name: 'api_purchase_requests_')]
class PurchaseRequestController extends BaseApiController
{
    public function __construct(
        private PurchaseRequestRepository $purchaseRequestRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['name'], $data['email'], $data['phone'], $data['selectedPlan'])) {
            return new JsonResponse(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $purchaseRequest = new PurchaseRequest();
        $purchaseRequest->setName($data['name']);
        $purchaseRequest->setEmail($data['email']);
        $purchaseRequest->setPhone($data['phone']);
        $purchaseRequest->setSelectedPlan($data['selectedPlan']);
        $purchaseRequest->setMessage($data['message'] ?? null);

        $errors = $this->validator->validate($purchaseRequest);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['error' => $errorMessages], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($purchaseRequest);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Purchase request submitted successfully',
            'request' => [
                'id' => $purchaseRequest->getId(),
                'name' => $purchaseRequest->getName(),
                'email' => $purchaseRequest->getEmail(),
                'phone' => $purchaseRequest->getPhone(),
                'selectedPlan' => $purchaseRequest->getSelectedPlan(),
                'status' => $purchaseRequest->getStatus(),
                'createdAt' => $purchaseRequest->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function list(): JsonResponse
    {
        $requests = $this->purchaseRequestRepository->findAll();

        $requestsData = array_map(function ($request) {
            return [
                'id' => $request->getId(),
                'name' => $request->getName(),
                'email' => $request->getEmail(),
                'phone' => $request->getPhone(),
                'selectedPlan' => $request->getSelectedPlan(),
                'status' => $request->getStatus(),
                'message' => $request->getMessage(),
                'createdAt' => $request->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $request->getUpdatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $requests);

        return new JsonResponse(['requests' => $requestsData]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function show(int $id): JsonResponse
    {
        $request = $this->purchaseRequestRepository->find($id);

        if (!$request) {
            return new JsonResponse(['error' => 'Purchase request not found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse([
            'request' => [
                'id' => $request->getId(),
                'name' => $request->getName(),
                'email' => $request->getEmail(),
                'phone' => $request->getPhone(),
                'selectedPlan' => $request->getSelectedPlan(),
                'status' => $request->getStatus(),
                'message' => $request->getMessage(),
                'createdAt' => $request->getCreatedAt()->format('Y-m-d H:i:s'),
                'updatedAt' => $request->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $purchaseRequest = $this->purchaseRequestRepository->find($id);

        if (!$purchaseRequest) {
            return new JsonResponse(['error' => 'Purchase request not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['status']) || !in_array($data['status'], ['pending', 'approved', 'rejected'])) {
            return new JsonResponse(['error' => 'Invalid status'], Response::HTTP_BAD_REQUEST);
        }

        $purchaseRequest->setStatus($data['status']);
        $purchaseRequest->setUpdatedAt(new \DateTime());

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Status updated successfully',
            'request' => [
                'id' => $purchaseRequest->getId(),
                'status' => $purchaseRequest->getStatus(),
                'updatedAt' => $purchaseRequest->getUpdatedAt()->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $purchaseRequest = $this->purchaseRequestRepository->find($id);

        if (!$purchaseRequest) {
            return new JsonResponse(['error' => 'Purchase request not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($purchaseRequest);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Purchase request deleted successfully']);
    }
}
