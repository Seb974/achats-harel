<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\TaxRepository;
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

#[ORM\Entity(repositoryClass: TaxRepository::class)]
#[ApiResource(
    uriTemplate: '/taxes{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/taxes/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            itemUriTemplate: '/taxes/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")',
        ),
        new Get(
            uriTemplate: '/taxes/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/taxes/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")',
        ),
        new Delete(
            uriTemplate: '/taxes/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")',
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Tax:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Tax:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Tax
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Tax:write', 'Tax:read', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 120, nullable: true)]
    #[Groups(groups: ['Tax:write', 'Tax:read', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?string $label = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Tax:write', 'Tax:read', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?float $rate = null;

    #[ORM\Column(length: 60, nullable: true)]
    #[Groups(groups: ['Tax:write', 'Tax:read', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?string $code = null;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Tax:write', 'Tax:read', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?TaxType $type = null;

     #[Groups(groups: ['Tax:read', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    public function getName(): ?string
    {
        return ($this->code ?? '') . ' - ' . ($this->label ?? '');
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getRate(): ?float
    {
        return $this->rate;
    }

    public function setRate(?float $rate): static
    {
        $this->rate = $rate;

        return $this;
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

    public function getType(): ?TaxType
    {
        return $this->type;
    }

    public function setType(?TaxType $type): static
    {
        $this->type = $type;

        return $this;
    }
}
