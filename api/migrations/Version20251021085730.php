<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251021085730 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE client ADD has_coeff_app BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD rate_editable BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD converted_price_editable BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD items_part_name VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD taxes_part_name VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD cost_prices_part_name VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD date_rate_name VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE client DROP has_coeff_app');
        $this->addSql('ALTER TABLE client DROP rate_editable');
        $this->addSql('ALTER TABLE client DROP converted_price_editable');
        $this->addSql('ALTER TABLE client DROP items_part_name');
        $this->addSql('ALTER TABLE client DROP taxes_part_name');
        $this->addSql('ALTER TABLE client DROP cost_prices_part_name');
        $this->addSql('ALTER TABLE client DROP date_rate_name');
    }
}
