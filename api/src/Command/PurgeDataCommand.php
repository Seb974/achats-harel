<?php

namespace App\Command;

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:data:purge',
    description: 'Purge transactional data (achats, expenses, etc.) while keeping reference data.',
)]
class PurgeDataCommand extends Command
{
    private const TABLES_TO_PURGE = [
        'achat_tax',
        'covering_cost',
        'other_cost',
        'category_tax',
        'item',
        'media_object',
        'achat',
        'payment_detail',
        'expense',
        'recurring_cost',
    ];

    public function __construct(private readonly Connection $connection)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('force', null, InputOption::VALUE_NONE, 'Execute without confirmation');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $counts = [];
        foreach (self::TABLES_TO_PURGE as $table) {
            try {
                $counts[$table] = (int) $this->connection->fetchOne("SELECT COUNT(*) FROM {$table}");
            } catch (\Exception) {
                $counts[$table] = '—';
            }
        }

        $io->title('Purge des données transactionnelles');

        $io->table(
            ['Table', 'Enregistrements'],
            array_map(fn($t, $c) => [$t, $c], array_keys($counts), array_values($counts))
        );

        $total = array_sum(array_filter($counts, 'is_int'));
        if ($total === 0) {
            $io->success('La base est déjà vide, rien à purger.');
            return Command::SUCCESS;
        }

        if (!$input->getOption('force')) {
            if (!$io->confirm("Supprimer {$total} enregistrements ? Cette action est irréversible.", false)) {
                $io->warning('Opération annulée.');
                return Command::SUCCESS;
            }
        }

        $this->connection->executeStatement('SET session_replication_role = replica');

        try {
            foreach (self::TABLES_TO_PURGE as $table) {
                try {
                    $this->connection->executeStatement("TRUNCATE TABLE {$table} CASCADE");
                    $io->writeln("  <info>✓</info> {$table} vidée");
                } catch (\Exception $e) {
                    $io->writeln("  <comment>⚠</comment> {$table} : {$e->getMessage()}");
                }
            }
        } finally {
            $this->connection->executeStatement('SET session_replication_role = DEFAULT');
        }

        $io->newLine();
        $io->success('Purge terminée. Les données de référence (client, statuts, taxes, devises) sont intactes.');

        return Command::SUCCESS;
    }
}
