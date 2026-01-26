<?php

namespace App\Dto;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

final class ClientInput
{
    #[Groups(['Client:write'])]
    public ?string $name = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $slug = null;

    #[Assert\Email]
    #[Groups(['Client:write'])]
    public ?string $email = null;

    #[Assert\Regex('/^[\d\s\+\-()]+$/', message: 'Numéro de téléphone invalide.')]
    #[Groups(['Client:write'])]
    public ?string $phone = null;

    #[Assert\File(maxSize: '4M')]
    #[Groups(['Client:write'])]
    public ?UploadedFile $logo = null;

    #[Assert\File(maxSize: '2M')]
    #[Groups(['Client:write'])]
    public ?UploadedFile $favicon = null;

    #[Assert\Regex('/^#[0-9A-Fa-f]{6}$/')]
    #[Groups(['Client:write'])]
    public ?string $color = null;

    #[Groups(['Client:write'])]
    public ?bool $active = null;

    #[Groups(['Client:write'])]
    public ?string $timezone = null;

    #[Groups(['Client:write'])]
    public ?string $address = null;

    #[Groups(['Client:write'])]
    public ?string $zipcode = null;

    #[Groups(['Client:write'])]
    public ?string $city = null;

    #[Groups(['Client:write'])]
    public ?string $website = null;

    #[Groups(['Client:write'])]
    public ?string $emailServer = null;

    #[Groups(['Client:write'])]
    public ?string $emailAddressSender = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $url = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $harelApiKey = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $harelUrl = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $exchangeRateApiKey = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $mainCurrency = null;

    #[Groups(groups: ['Client:write'])]
    public ?int $decimalRound = null;

    #[Groups(groups: ['Client:write'])]
    public ?bool $hasCategoryTaxes = null;

    #[Groups(groups: ['Client:write'])]
    public ?bool $hasGlobalTaxes = null;

    #[Groups(groups: ['Client:write'])]
    public ?bool $hasCoeffApp = null;

    #[Groups(groups: ['Client:write'])]
    public ?bool $rateEditable = null;

    #[Groups(groups: ['Client:write'])]
    public ?bool $convertedPriceEditable = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $itemsPartName = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $taxesPartName = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $costPricesPartName = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $dateRateName = null;

    #[Groups(groups: ['Client:write'])]
    public ?bool $hasCoeffCalculation = null;

    #[Groups(groups: ['Client:write'])]
    public ?string $coeffCalculationPartName = null;
}
