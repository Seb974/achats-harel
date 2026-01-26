<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251015133508 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE achat ADD status_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE achat ADD CONSTRAINT FK_26A984566BF700BD FOREIGN KEY (status_id) REFERENCES status (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_26A984566BF700BD ON achat (status_id)');
        $this->addSql('ALTER TABLE media_object ADD achat_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE media_object ADD CONSTRAINT FK_14D43132FE95D117 FOREIGN KEY (achat_id) REFERENCES achat (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_14D43132FE95D117 ON media_object (achat_id)');
        $this->addSql('ALTER TABLE status ADD is_default BOOLEAN DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE status DROP is_default');
        $this->addSql('ALTER TABLE media_object DROP CONSTRAINT FK_14D43132FE95D117');
        $this->addSql('DROP INDEX IDX_14D43132FE95D117');
        $this->addSql('ALTER TABLE media_object DROP achat_id');
        $this->addSql('ALTER TABLE achat DROP CONSTRAINT FK_26A984566BF700BD');
        $this->addSql('DROP INDEX IDX_26A984566BF700BD');
        $this->addSql('ALTER TABLE achat DROP status_id');
    }
}
