<?php

namespace App\Repository;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    public function findByChapter(string $chapter): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.chapter = :chapter')
            ->setParameter('chapter', $chapter)
            ->orderBy('p.orderIndex', 'ASC')
            ->addOrderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByMenu(string $menu): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.menu = :menu')
            ->setParameter('menu', $menu)
            ->orderBy('p.orderIndex', 'ASC')
            ->addOrderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findBySubmenu(string $submenu): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.submenu = :submenu')
            ->setParameter('submenu', $submenu)
            ->orderBy('p.orderIndex', 'ASC')
            ->addOrderBy('p.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

