<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251024153935 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Conversion de integer → string avec un cast explicite
        $this->addSql('ALTER TABLE category_tax ALTER COLUMN category_id TYPE VARCHAR(255) USING category_id::TEXT');
    }

    public function down(Schema $schema): void
    {
        // Conversion inverse string → integer avec un cast explicite
        $this->addSql('ALTER TABLE category_tax ALTER COLUMN category_id TYPE INT USING category_id::INTEGER');
    }
}
