<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251017170910 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE achat_tax (achat_id INT NOT NULL, tax_id INT NOT NULL, PRIMARY KEY(achat_id, tax_id))');
        $this->addSql('CREATE INDEX IDX_6678C2F3FE95D117 ON achat_tax (achat_id)');
        $this->addSql('CREATE INDEX IDX_6678C2F3B2A824D8 ON achat_tax (tax_id)');
        $this->addSql('ALTER TABLE achat_tax ADD CONSTRAINT FK_6678C2F3FE95D117 FOREIGN KEY (achat_id) REFERENCES achat (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE achat_tax ADD CONSTRAINT FK_6678C2F3B2A824D8 FOREIGN KEY (tax_id) REFERENCES tax (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE achat ADD global_taxes_amount DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE achat ADD global_total_rate DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE category_tax ADD taxes_amount DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE category_tax ADD total_ht DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE category_tax ADD total_qty INT DEFAULT NULL');
        $this->addSql('ALTER TABLE category_tax ADD total_rate DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE category_tax ADD total_ttc DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE achat_tax DROP CONSTRAINT FK_6678C2F3FE95D117');
        $this->addSql('ALTER TABLE achat_tax DROP CONSTRAINT FK_6678C2F3B2A824D8');
        $this->addSql('DROP TABLE achat_tax');
        $this->addSql('ALTER TABLE category_tax DROP taxes_amount');
        $this->addSql('ALTER TABLE category_tax DROP total_ht');
        $this->addSql('ALTER TABLE category_tax DROP total_qty');
        $this->addSql('ALTER TABLE category_tax DROP total_rate');
        $this->addSql('ALTER TABLE category_tax DROP total_ttc');
        $this->addSql('ALTER TABLE achat DROP global_taxes_amount');
        $this->addSql('ALTER TABLE achat DROP global_total_rate');
    }
}
