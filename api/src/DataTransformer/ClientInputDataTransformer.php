<?php

namespace App\DataTransformer;

use ApiPlatform\Symfony\Validator\Exception\ValidationException;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\State\ProviderInterface;
use ApiPlatform\Validator\ValidatorInterface;
use App\Dto\ClientInput;
use App\Entity\Client;
use App\Service\FileUploader;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ClientInputDataTransformer implements ProcessorInterface
{
    public function __construct(
        private readonly ProcessorInterface $persistProcessor,
        private readonly ValidatorInterface $validator,
        private readonly FileUploader $fileUploader,
        private readonly ProviderInterface $itemProvider
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Client
    {
        $this->validator->validate($data);

        if ($data instanceof ClientInput) {
            // Récupère un Client existant ou en crée un nouveau
            $shouldHydrateExistingClient = isset($context['input']['class'])
                && $context['input']['class'] === ClientInput::class
                && isset($uriVariables['id']);

            $client = $shouldHydrateExistingClient
                ? $this->itemProvider->provide($operation->withClass(Client::class), $uriVariables, $context)
                : new Client();

            $client->setName($data->name);
            $client->setSlug($data->slug);
            $client->setEmail($data->email);
            $client->setPhone($data->phone);
            $client->setColor($data->color);
            $client->setActive($data->active);
            $client->setTimezone($data->timezone);
            $client->setAddress($data->address);
            $client->setZipcode($data->zipcode);
            $client->setCity($data->city);
            $client->setWebsite($data->website);
            $client->setUrl($data->url);
            $client->setHarelApiKey($data->harelApiKey);
            $client->setHarelUrl($data->harelUrl);
            $client->setExchangeRateApiKey($data->exchangeRateApiKey);
            $client->setEmailServer($data->emailServer);
            $client->setEmailAddressSender($data->emailAddressSender);
            $client->setMainCurrency($data->mainCurrency);
            $client->setDecimalRound($data->decimalRound);
            $client->setHasCategoryTaxes($data->hasCategoryTaxes);
            $client->setHasGlobalTaxes($data->hasGlobalTaxes);
            $client->setHasCoeffApp($data->hasCoeffApp);
            $client->setHasCoeffCalculation($data->hasCoeffCalculation);
            $client->isRateEditable($data->rateEditable);
            $client->isConvertedPriceEditable($data->convertedPriceEditable);
            $client->setDateRateName($data->dateRateName);
            $client->setItemsPartName($data->itemsPartName);
            $client->setTaxesPartName($data->taxesPartName);
            $client->setCostPricesPartName($data->costPricesPartName);
            $client->setCoeffCalculationPartName($data->coeffCalculationPartName);

            // Uploads de fichiers
            if ($data->logo instanceof UploadedFile) {
                $client->setLogo($this->fileUploader->upload($data->logo, 'logo'));
            } elseif ($data->logo === 'DELETE') {
                $client->setLogo(null);
            }

            if ($data->favicon instanceof UploadedFile) {
                $client->setFavicon($this->fileUploader->upload($data->favicon, 'favicon'));
            } elseif ($data->favicon === 'DELETE') {
                $client->setFavicon(null);
            }
        } else {
            $client = $data;
        }

        return $this->persistProcessor->process($client, $operation, $uriVariables, $context);
    }
}
