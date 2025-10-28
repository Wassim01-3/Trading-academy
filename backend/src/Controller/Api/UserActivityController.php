<?php

namespace App\Controller\Api;

use App\Controller\Api\BaseApiController;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user-activity')]
class UserActivityController extends BaseApiController
{
    private static array $activeUsers = [];
    private static array $lastActivity = [];

    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/heartbeat', name: 'user_heartbeat', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function heartbeat(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $userId = $user->getId();
        $timestamp = time();

        // Update user activity
        self::$activeUsers[$userId] = true;
        self::$lastActivity[$userId] = $timestamp;

        // Clean up inactive users (inactive for more than 5 minutes)
        $this->cleanupInactiveUsers();

        return new JsonResponse([
            'message' => 'Heartbeat received',
            'timestamp' => $timestamp
        ]);
    }

    #[Route('/status', name: 'user_status', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUserStatus(): JsonResponse
    {
        $this->cleanupInactiveUsers();
        
        $userStatuses = [];
        $users = $this->userRepository->findAll();

        foreach ($users as $user) {
            $userId = $user->getId();
            $isActive = isset(self::$activeUsers[$userId]) && self::$activeUsers[$userId];
            $lastSeen = self::$lastActivity[$userId] ?? null;

            $userStatuses[] = [
                'userId' => $userId,
                'isActive' => $isActive,
                'lastSeen' => $lastSeen,
                'lastSeenFormatted' => $lastSeen ? date('Y-m-d H:i:s', $lastSeen) : null
            ];
        }

        return new JsonResponse([
            'userStatuses' => $userStatuses,
            'timestamp' => time()
        ]);
    }

    #[Route('/logout', name: 'user_logout_activity', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function logoutActivity(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $userId = $user->getId();
        
        // Remove user from active users
        unset(self::$activeUsers[$userId]);
        unset(self::$lastActivity[$userId]);

        return new JsonResponse([
            'message' => 'User marked as offline'
        ]);
    }

    private function cleanupInactiveUsers(): void
    {
        $currentTime = time();
        $inactiveThreshold = 300; // 5 minutes

        foreach (self::$lastActivity as $userId => $lastSeen) {
            if ($currentTime - $lastSeen > $inactiveThreshold) {
                unset(self::$activeUsers[$userId]);
                unset(self::$lastActivity[$userId]);
            }
        }
    }
}
