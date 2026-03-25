<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260325_AddOdooAccessUrl extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add odoo_access_url column to media_object for direct Odoo document links';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE media_object ADD odoo_access_url VARCHAR(512) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE media_object DROP COLUMN odoo_access_url');
    }
}
