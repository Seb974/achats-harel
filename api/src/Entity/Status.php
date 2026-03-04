<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\StatusRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: StatusRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_STATUS_CODE', columns: ['code'])]
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
        AbstractNormalizer::GROUPS => ['Status:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Status:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Status
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Status:write', 'Status:read', 'Achat:read', 'Item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 120, nullable: true)]
    #[Groups(groups: ['Status:write', 'Status:read', 'Achat:read', 'Item:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Status:write', 'Status:read', 'Achat:read', 'Item:read'])]
    private ?string $label = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Status:write', 'Status:read', 'Achat:read', 'Item:read'])]
    private ?bool $isDefault = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(groups: ['Status:write', 'Status:read', 'Achat:read', 'Item:read'])]
    private ?string $color = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Status:write', 'Status:read', 'Achat:read'])]
    private ?int $odooLocationId = null;

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

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getIsDefault(): ?bool
    {
        return $this->isDefault;
    }

    public function setIsDefault(?bool $isDefault): static
    {
        $this->isDefault = $isDefault;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color): static
    {
        $this->color = $color;

        return $this;
    }

    public function getOdooLocationId(): ?int
    {
        return $this->odooLocationId;
    }

    public function setOdooLocationId(?int $odooLocationId): static
    {
        $this->odooLocationId = $odooLocationId;

        return $this;
    }
}
