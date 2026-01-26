<?php

namespace App\Command;

use App\Entity\Currency;
use App\Service\DataInitializer\Data;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import:currencies',
    description: 'Importe les devises définies dans la classe Data en base de données'
)]
class ImportCurrenciesCommand extends Command
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
        $currencies = $this->data->getCurrencies();
        $repo = $this->em->getRepository(Currency::class);

        $io->title('Import des devises');
        $count = 0;

        foreach ($currencies as $item) {

            $currency = (new Currency())
                ->setCode($item['code'])
                ->setName($item['devise'])
                ->setCountry($item['pays'])
                ->setInUse(false);

            $this->em->persist($currency);
            $count++;
        }

        if ($count > 0) {
            $this->em->flush();
        }

        $io->success("$count devises importées avec succès !");
        return Command::SUCCESS;
    }
}
