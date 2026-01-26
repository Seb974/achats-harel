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

class ClientDataController extends AbstractController
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

    #[Route('/harel/products/custom_fields', name: 'harel_get_custom_fields', methods: ['GET'])]
    public function getProducts(Request $request): JsonResponse
    {
        $limit = $request->query->getInt('limit', 1000);
        $offset = $request->query->getInt('offset', 0); 

        return $this->fetchFromHarel('products/custom_fields', $limit, $offset);
    }

    #[Route('/harel/products', name: 'harel_get_products', methods: ['GET'])]
    public function getCustomFields(Request $request): JsonResponse
    {
        $limit = $request->query->getInt('limit', 1000);
        $offset = $request->query->getInt('offset', 0); 

        return $this->fetchFromHarel('products', $limit, $offset);
    }

    #[Route('/harel/suppliers', name: 'harel_get_suppliers', methods: ['GET'])]
    public function getSuppliers(Request $request): JsonResponse
    {
        $limit = $request->query->getInt('limit', 1000);
        $offset = $request->query->getInt('offset', 0); 
        
        return $this->fetchFromHarel('suppliers', $limit, $offset);
    }

    #[Route('/harel/products/custom_fields/{id}', name: 'harel_get_one_custom_field', methods: ['GET'])]
    public function getOneCustomFields(string $id, Request $request): JsonResponse
    {
        return $this->fetchOneFromHarel('products/custom_fields', $id);
    }

    #[Route('/harel/products/{id}', name: 'harel_get_one_product', methods: ['GET'])]
    public function getOneProduct(string $id, Request $request): JsonResponse
    {
        return $this->fetchOneFromHarel('products', $id);
    }

    private function fetchFromHarel(string $endpoint, int $limit = 1000, int $offset = 0): JsonResponse
    {
        $parameters = $this->getRequestParameters();
        if (isset($parameters['error'])) return $this->json($parameters, 400);

        try {
            $url = "{$parameters['baseUrl']}/api/v1/{$endpoint}?limit={$limit}&offset={$offset}";
            $response = $this->httpClient->request('GET', $url, [
                'headers' => $parameters['headers'],
                'timeout' => 10
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode >= 400) {
                return $this->json([
                    'error' => "API returned error $statusCode",
                    'body' => $response->getContent(false),
                ], $statusCode);
            }

            return $this->json([$endpoint => $response->toArray(false)]);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'API request failed', 'message' => $e->getMessage()], 500);
        }
    }

    private function fetchOneFromHarel(string $endpoint, string $id): JsonResponse
    {
        $parameters = $this->getRequestParameters();
        if (isset($parameters['error'])) return $this->json($parameters, 400);

        try {
            $url = "{$parameters['baseUrl']}/api/v1/{$endpoint}/{$id}";
            $response = $this->httpClient->request('GET', $url, [
                'headers' => $parameters['headers'],
                'timeout' => 10
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode >= 400) {
                return $this->json([
                    'error' => "API returned error $statusCode",
                    'body' => $response->getContent(false),
                ], $statusCode);
            }

            return $this->json(['data' => $response->toArray(false)]);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'API request failed', 'message' => $e->getMessage()], 500);
        }
    }

    private function getRequestParameters() : ?array
    {
        $client = $this->clientGetter->get();
        if (!$client) return ['error' => 'Client not found'];

        $apiKey = $client->getHarelApiKey();
        if (!$apiKey) return ['error' => 'No API key for this client'];

        $baseUrl = $client->getHarelUrl();
        if (!$baseUrl) return ['error' => 'No API URL for this client'];

        return [
            'headers' => ['X-AUTH-TOKEN' => $apiKey],
            'baseUrl' => rtrim($baseUrl, '/'),
        ];
    }
}
