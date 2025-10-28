<?php

namespace App\Repository;

use App\Entity\MentorshipBooking;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MentorshipBookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MentorshipBooking::class);
    }

    public function findPendingBookings(): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.status = :status')
            ->setParameter('status', 'pending')
            ->orderBy('m.bookingDate', 'ASC')
            ->addOrderBy('m.bookingTime', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findUpcomingBookings(): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.status = :status')
            ->setParameter('status', 'approved')
            ->andWhere('m.bookingDate >= :today')
            ->setParameter('today', new \DateTime())
            ->orderBy('m.bookingDate', 'ASC')
            ->addOrderBy('m.bookingTime', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}

