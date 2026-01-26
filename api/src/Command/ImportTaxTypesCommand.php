<?php

namespace App\Command;

use App\Entity\TaxType;
use App\Service\DataInitializer\Data;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import:tax_types',
    description: 'Importe les types de taxe en base de données'
)]
class ImportTaxTypesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private Data $data,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $types = $this->data->getTaxTypes();
        $repo = $this->em->getRepository(TaxType::class);

        $io->title('Import des types de taxe');
        $count = 0;

        foreach ($types as $item) {

            $type = (new TaxType())
                ->setCode($item['code'])
                ->setLabel($item['label']);

            $this->em->persist($type);
            $count++;
        }

        if ($count > 0) {
            $this->em->flush();
        }

        $io->success("$count types de taxe importés avec succès !");
        return Command::SUCCESS;
    }
}
