<?php

namespace App\Controller;

use App\Entity\Client;
use App\Service\ClientGetter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ExchangeRateController extends AbstractController
{
    private EntityManagerInterface $em;
    private ClientGetter $clientGetter;
    private HttpClientInterface $httpClient;

    public function __construct(EntityManagerInterface $em, HttpClientInterface $httpClient, ClientGetter $clientGetter) 
    {
        $this->em = $em;
        $this->httpClient = $httpClient;
        $this->clientGetter = $clientGetter;
    }

    #[Route('/exchange_rate/{base}/{target}/{date}', name: 'get_exchange_rate', methods: ['GET'])]
    public function getEchangeRate(string $base, string $target, string $date, Request $request): JsonResponse
    {
        try {
            $apiKey = $this->getApiKey();
            $requestedDate = new \DateTimeImmutable($date);
            $today = new \DateTimeImmutable('today');

            $isToday = $requestedDate->format('Y-m-d') === $today->format('Y-m-d');
            $root = $isToday ? "https://api.unirateapi.com/api/rates" : "https://api.unirateapi.com/api/historical/rates";
            $queryParams = ['api_key' => $apiKey, 'amount' => 1, 'from' => strtoupper($base), 'to' => strtoupper($target), 'format' => 'json'];

            if (!$isToday)
                $queryParams['date'] = $requestedDate->format('Y-m-d');

            $query = http_build_query($queryParams);
            $response = $this->httpClient->request('GET', $root . '?' . $query, ['timeout' => 10]);

            $statusCode = $response->getStatusCode();
            if ($statusCode >= 400) {
                return $this->json([
                    'error' => "API returned error $statusCode",
                    'body' => $response->getContent(false),
                ], $statusCode);
            }

            $data = $response->toArray();
            return $this->json($data);

        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    private function getApiKey() : ?string
    {
        $client = $this->clientGetter->get();
        if (!$client) return ['error' => 'Client not found'];

        $apiKey = $client->getExchangeRateApiKey();
        if (!$apiKey) return ['error' => 'No API key for this client'];

        return $apiKey;
    }
}
