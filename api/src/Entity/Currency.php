<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CurrencyRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;


#[ORM\Entity(repositoryClass: CurrencyRepository::class)]
#[ApiResource(
    uriTemplate: '/currencies{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/currencies/{id}{._format}',
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.currency.usable',
                'app.filter.currency.intitule'
            ],
        ),
        new Post(
            itemUriTemplate: '/currencies/{id}{._format}'
        ),
        new Get(
            uriTemplate: '/currencies/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/currencies/{id}{._format}',
        ),
        new Delete(
            uriTemplate: '/currencies/{id}{._format}',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Currency:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Currency:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Currency
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Currency:write', 'Currency:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups(groups: ['Currency:write', 'Currency:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 120, nullable: true)]
    #[Groups(groups: ['Currency:write', 'Currency:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 120, nullable: true)]
    #[Groups(groups: ['Currency:write', 'Currency:read'])]
    private ?string $country = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Currency:write', 'Currency:read'])]
    private ?bool $inUse = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(?string $country): static
    {
        $this->country = $country;

        return $this;
    }

    public function isInUse(): ?bool
    {
        return $this->inUse;
    }

    public function setInUse(?bool $inUse): static
    {
        $this->inUse = $inUse;

        return $this;
    }
}
