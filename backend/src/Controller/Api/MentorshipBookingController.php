<?php

namespace App\Controller\Api;

use App\Entity\MentorshipBooking;
use App\Entity\User;
use App\Repository\MentorshipBookingRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/mentorship-bookings', name: 'api_mentorship_bookings_')]
class MentorshipBookingController extends BaseApiController
{
    public function __construct(
        private MentorshipBookingRepository $bookingRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        // If user is admin, return all bookings, otherwise return only their bookings
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            $bookings = $this->bookingRepository->findAll();
        } else {
            $bookings = $this->bookingRepository->findByUser($user->getId());
        }

        $bookingsData = array_map(function ($booking) {
            return [
                'id' => $booking->getId(),
                'userId' => $booking->getUser()->getId(),
                'userName' => $booking->getUser()->getName(),
                'userEmail' => $booking->getUser()->getEmail(),
                'bookingDate' => $booking->getBookingDate()->format('Y-m-d'),
                'bookingTime' => $booking->getBookingTime()->format('H:i'),
                'duration' => $booking->getDuration(),
                'status' => $booking->getStatus(),
                'message' => $booking->getMessage(),
                'createdAt' => $booking->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $bookings);

        return new JsonResponse(['bookings' => $bookingsData]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        // Check if user has premium plan
        if ($user->getPlan() !== 'premium') {
            return new JsonResponse(['error' => 'Only premium users can book mentorship sessions'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['bookingDate'], $data['bookingTime'], $data['duration'])) {
            return new JsonResponse(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $booking = new MentorshipBooking();
        $booking->setUser($user);
        $booking->setBookingDate(new \DateTime($data['bookingDate']));
        $booking->setBookingTime(new \DateTime($data['bookingTime']));
        $booking->setDuration($data['duration']);
        $booking->setStatus('pending');
        $booking->setMessage($data['message'] ?? null);

        $errors = $this->validator->validate($booking);
        if (count($errors) > 0) {
            return new JsonResponse(['error' => 'Invalid booking data'], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($booking);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Booking created successfully',
            'booking' => [
                'id' => $booking->getId(),
                'bookingDate' => $booking->getBookingDate()->format('Y-m-d'),
                'bookingTime' => $booking->getBookingTime()->format('H:i'),
                'duration' => $booking->getDuration(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $booking = $this->bookingRepository->find($id);

        if (!$booking) {
            return new JsonResponse(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['status'])) {
            return new JsonResponse(['error' => 'Status is required'], Response::HTTP_BAD_REQUEST);
        }

        $booking->setStatus($data['status']);
        $booking->setUpdatedAt(new \DateTime());
        
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Booking status updated successfully']);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $booking = $this->bookingRepository->find($id);

        if (!$booking) {
            return new JsonResponse(['error' => 'Booking not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['bookingDate'])) {
            $booking->setBookingDate(new \DateTime($data['bookingDate']));
        }
        if (isset($data['bookingTime'])) {
            $booking->setBookingTime(new \DateTime($data['bookingTime']));
        }
        if (isset($data['duration'])) {
            $booking->setDuration($data['duration']);
        }
        if (isset($data['status'])) {
            $booking->setStatus($data['status']);
        }

        $booking->setUpdatedAt(new \DateTime());
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Booking updated successfully']);
    }
}

