<?php

namespace App\Repository;

use App\Entity\Content;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Content>
 *
 * @method Content|null find($id, $lockMode = null, $lockVersion = null)
 * @method Content|null findOneBy(array $criteria, array $orderBy = null)
 * @method Content[]    findAll()
 * @method Content[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Content::class);
    }

    /**
     * @return Content[] Returns an array of Content objects
     */
    public function findByPlan(string $plan): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.allowedPlans LIKE :plan')
            ->setParameter('plan', '%' . $plan . '%')
            ->orderBy('c.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findAvailableForUser(string $userPlan): array
    {
        $planHierarchy = [
            'basic' => ['basic'],
            'advanced' => ['basic', 'advanced'],
            'premium' => ['basic', 'advanced', 'premium']
        ];

        $allowedPlans = $planHierarchy[$userPlan] ?? ['basic'];

        $qb = $this->createQueryBuilder('c');
        $orX = $qb->expr()->orX();
        
        foreach ($allowedPlans as $plan) {
            $orX->add($qb->expr()->like('c.allowedPlans', ':plan' . $plan));
            $qb->setParameter('plan' . $plan, '%' . $plan . '%');
        }
        
        return $qb->andWhere($orX)
            ->orderBy('c.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
