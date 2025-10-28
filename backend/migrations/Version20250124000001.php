<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add Post and MentorshipBooking tables
 */
final class Version20250124000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Post and MentorshipBooking tables for course content and mentorship bookings';
    }

    public function up(Schema $schema): void
    {
        // Create post table
        $this->addSql('CREATE TABLE post (
            id INT AUTO_INCREMENT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            video_url LONGTEXT DEFAULT NULL,
            pdf_url LONGTEXT DEFAULT NULL,
            doc_url LONGTEXT DEFAULT NULL,
            image_url LONGTEXT DEFAULT NULL,
            chapter LONGTEXT DEFAULT NULL,
            menu LONGTEXT DEFAULT NULL,
            submenu LONGTEXT DEFAULT NULL,
            order_index INT NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create mentorship_booking table
        $this->addSql('CREATE TABLE mentorship_booking (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            booking_date DATE NOT NULL,
            booking_time TIME NOT NULL,
            duration INT NOT NULL,
            status VARCHAR(20) NOT NULL,
            message LONGTEXT DEFAULT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            INDEX IDX_user (user_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Add foreign key
        $this->addSql('ALTER TABLE mentorship_booking ADD CONSTRAINT FK_mentorship_booking_user FOREIGN KEY (user_id) REFERENCES `user` (id)');

        // Update content table to add new columns
        $this->addSql('ALTER TABLE content ADD content_type VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE content ADD link_url LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE mentorship_booking DROP FOREIGN KEY FK_mentorship_booking_user');
        $this->addSql('ALTER TABLE content DROP content_type');
        $this->addSql('ALTER TABLE content DROP link_url');
        $this->addSql('DROP TABLE mentorship_booking');
        $this->addSql('DROP TABLE post');
    }
}

