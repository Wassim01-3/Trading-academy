<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Create an admin user for the application',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Check if admin already exists
        $existingAdmin = $this->entityManager->getRepository(User::class)
            ->findOneBy(['email' => 'admin@tradeacademy.com']);

        if ($existingAdmin) {
            $output->writeln('<error>Admin user already exists!</error>');
            return Command::FAILURE;
        }

        // Create admin user
        $admin = new User();
        $admin->setEmail('admin@tradeacademy.com');
        $admin->setName('Admin User');
        $admin->setPlan('Premium');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setIsActive(true);

        // Hash password
        $hashedPassword = $this->passwordHasher->hashPassword($admin, 'admin123');
        $admin->setPassword($hashedPassword);

        // Save to database
        $this->entityManager->persist($admin);
        $this->entityManager->flush();

        $output->writeln('<info>Admin user created successfully!</info>');
        $output->writeln('Email: admin@tradeacademy.com');
        $output->writeln('Password: admin123');
        $output->writeln('Role: ROLE_ADMIN');
        $output->writeln('Plan: Premium');

        return Command::SUCCESS;
    }
}
