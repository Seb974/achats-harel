<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter les champs de configuration Odoo à la table client
 */
final class Version20260125120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute les champs de configuration Odoo (odoo_url, odoo_database, odoo_username, odoo_api_key, data_source) à la table client';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE client ADD odoo_url VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD odoo_database VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD odoo_username VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD odoo_api_key VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD data_source VARCHAR(20) DEFAULT \'harel\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE client DROP odoo_url');
        $this->addSql('ALTER TABLE client DROP odoo_database');
        $this->addSql('ALTER TABLE client DROP odoo_username');
        $this->addSql('ALTER TABLE client DROP odoo_api_key');
        $this->addSql('ALTER TABLE client DROP data_source');
    }
}
