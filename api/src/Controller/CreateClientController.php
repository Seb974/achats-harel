<?php

namespace App\Controller;

use App\Entity\Client;
use App\Dto\ClientInput;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use App\DataTransformer\ClientInputDataTransformer;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class CreateClientController extends AbstractController
{
    public function __invoke(Request $request, ClientInputDataTransformer $transformer): Client
    {
        $dto = new ClientInput();

        // Champs texte
        $dto->name = $request->request->get('name');
        $dto->slug = $request->request->get('slug');
        $dto->email = $request->request->get('email');
        $dto->phone = $request->request->get('phone');
        $dto->color = $request->request->get('color');
        $dto->timezone = $request->request->get('timezone');
        $dto->address = $request->request->get('address');
        $dto->zipcode = $request->request->get('zipcode');
        $dto->city = $request->request->get('city');
        $dto->website = $request->request->get('website');
        $dto->url = $request->request->get('url');
        $dto->exchangeRateApiKey = $request->request->get('exchangeRateApiKey');
        $dto->harelApiKey = $request->request->get('harelApiKey');
        $dto->harelUrl = $request->request->get('harelUrl');
        $dto->emailServer = $request->request->get('emailServer');
        $dto->mainCurrency = $request->request->get('mainCurrency');
        $dto->dateRateName = $request->request->get('dateRateName');
        $dto->itemsPartName = $request->request->get('itemsPartName');
        $dto->taxesPartName = $request->request->get('taxesPartName');
        $dto->costPricesPartName = $request->request->get('costPricesPartName');
        $dto->coeffCalculationPartName = $request->request->get('coeffCalculationPartName');

        // Champs Number/ Boolean
        $dto->active = $this->getBool($request, 'active');
        $dto->decimalRound = $this->getInt($request, 'decimalRound');
        $dto->hasCategoryTaxes = $this->getBool($request, 'hasCategoryTaxes');
        $dto->hasGlobalTaxes = $this->getBool($request, 'hasGlobalTaxes');
        $dto->hasCoeffApp = $this->getBool($request, 'hasCoeffApp');
        $dto->hasCoeffCalculation = $this->getBool($request, 'hasCoeffCalculation');
        $dto->rateEditable = $this->getBool($request, 'rateEditable');
        $dto->convertedPriceEditable = $this->getBool($request, 'convertedPriceEditable');


        // Fichiers
        $dto->logo = $request->files->get('logo');
        $dto->favicon = $request->files->get('favicon');

        $client = $transformer->process($dto, $request->attributes->get('_api_operation'));

        return $client;
    }

    private function getFloat(Request $request, string $key): ?float
    {
        $val = $request->request->get($key);
        return $val !== null && $val !== '' ? (float) $val : null;
    }

    private function getInt(Request $request, string $key): ?int
    {
        $val = $request->request->get($key);
        return $val !== null && $val !== '' ? (int) $val : null;
    }

    private function getBool(Request $request, string $key): ?bool
    {
        $val = $request->request->get($key);
        return $val !== null ? filter_var($val, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null;
    }

    private function getTime(Request $request, string $key): ?\DateTimeInterface
    {
        $val = $request->request->get($key);
        if ($val === null || $val === '') {
            return null;
        }

        try {
            return \DateTimeImmutable::createFromFormat('H:i', $val) ?: null;
        } catch (\Exception $e) {
            throw new BadRequestHttpException(sprintf('Invalid time format for "%s". Expected HH:MM.', $key));
        }
    }

    private function parseArrayField(Request $request, string $field): array
    {
        $value = $request->request->get($field);

        if (is_string($value) && str_starts_with(trim($value), '[')) {
            $json = json_decode($value, true);
            return json_last_error() === JSON_ERROR_NONE ? $json : [];
        }

        if (is_array($value)) {
            return $value;
        }

        return [];
    }
}
