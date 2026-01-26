<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\OtherCostRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: OtherCostRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientItemsPerPage: true
        ),
        new Post(),
        new Get(),
        new Put(),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['OtherCost:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['OtherCost:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class OtherCost
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['OtherCost:write', 'Achat:write', 'OtherCost:read', 'Achat:read', 'Item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['OtherCost:write', 'Achat:write', 'OtherCost:read', 'Achat:read', 'Item:read'])]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['OtherCost:write', 'Achat:write', 'OtherCost:read', 'Achat:read', 'Item:read'])]
    private ?bool $isFix = null;

    #[ORM\Column(length: 12, nullable: true)]
    #[Groups(groups: ['OtherCost:write', 'Achat:write', 'OtherCost:read', 'Achat:read', 'Item:read'])]
    private ?string $currency = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['OtherCost:write', 'Achat:write', 'OtherCost:read', 'Achat:read', 'Item:read'])]
    private ?float $value = null;

    #[ORM\ManyToOne(inversedBy: 'otherCosts')]
    #[Groups(groups: ['OtherCost:read'])]
    private ?Achat $achat = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function isFix(): ?bool
    {
        return $this->isFix;
    }

    public function setFix(?bool $isFix): static
    {
        $this->isFix = $isFix;

        return $this;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }

    public function setCurrency(?string $currency): static
    {
        $this->currency = $currency;

        return $this;
    }

    public function getValue(): ?float
    {
        return $this->value;
    }

    public function setValue(?float $value): static
    {
        $this->value = $value;

        return $this;
    }

    public function getAchat(): ?Achat
    {
        return $this->achat;
    }

    public function setAchat(?Achat $achat): static
    {
        $this->achat = $achat;

        return $this;
    }
}
