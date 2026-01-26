<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ItemRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: ItemRepository::class)]
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
        AbstractNormalizer::GROUPS => ['Item:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Item:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Item
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?int $id = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?int $productId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?string $product = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?int $packagingId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?string $packaging = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?string $categoryId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?string $category = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $quantity = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $weight = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $incomingUnitPrice = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $outGoingUnitPriceHT = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $totalPriceHT = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $approchCoeff = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $costPriceHT = null;

    #[ORM\ManyToOne(inversedBy: 'items')]
    #[Groups(groups: ['Item:read'])]
    private ?Achat $achat = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $mainQuantity = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?float $mainOutGoingUnitPriceHT = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?string $mainPackaging = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?int $mainPackagingId = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Item:write', 'Achat:write', 'Item:read', 'Achat:read'])]
    private ?int $unitFactor = null;

    #[Groups(groups: ['Item:read', 'Achat:read'])]
    public function getTargetCurrency(): ?string 
    {
        return $this->achat?->getTargetCurrency();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProductId(): ?int
    {
        return $this->productId;
    }

    public function setProductId(?int $productId): static
    {
        $this->productId = $productId;

        return $this;
    }

    public function getProduct(): ?string
    {
        return $this->product;
    }

    public function setProduct(?string $product): static
    {
        $this->product = $product;

        return $this;
    }

    public function getPackagingId(): ?int
    {
        return $this->packagingId;
    }

    public function setPackagingId(?int $packagingId): static
    {
        $this->packagingId = $packagingId;

        return $this;
    }

    public function getPackaging(): ?string
    {
        return $this->packaging;
    }

    public function setPackaging(?string $packaging): static
    {
        $this->packaging = $packaging;

        return $this;
    }

    public function getCategoryId(): ?string
    {
        return $this->categoryId;
    }

    public function setCategoryId(?string $categoryId): static
    {
        $this->categoryId = $categoryId;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getQuantity(): ?float
    {
        return $this->quantity;
    }

    public function setQuantity(?float $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getWeight(): ?float
    {
        return $this->weight;
    }

    public function setWeight(?float $weight): static
    {
        $this->weight = $weight;

        return $this;
    }

    public function getIncomingUnitPrice(): ?float
    {
        return $this->incomingUnitPrice;
    }

    public function setIncomingUnitPrice(?float $incomingUnitPrice): static
    {
        $this->incomingUnitPrice = $incomingUnitPrice;

        return $this;
    }

    public function getOutGoingUnitPriceHT(): ?float
    {
        return $this->outGoingUnitPriceHT;
    }

    public function setOutGoingUnitPriceHT(?float $outGoingUnitPriceHT): static
    {
        $this->outGoingUnitPriceHT = $outGoingUnitPriceHT;

        return $this;
    }

    public function getTotalPriceHT(): ?float
    {
        return $this->totalPriceHT;
    }

    public function setTotalPriceHT(?float $totalPriceHT): static
    {
        $this->totalPriceHT = $totalPriceHT;

        return $this;
    }

    public function getApprochCoeff(): ?float
    {
        return $this->approchCoeff;
    }

    public function setApprochCoeff(?float $approchCoeff): static
    {
        $this->approchCoeff = $approchCoeff;

        return $this;
    }

    public function getCostPriceHT(): ?float
    {
        return $this->costPriceHT;
    }

    public function setCostPriceHT(?float $costPriceHT): static
    {
        $this->costPriceHT = $costPriceHT;

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

    public function getMainQuantity(): ?float
    {
        return $this->mainQuantity;
    }

    public function setMainQuantity(?float $mainQuantity): static
    {
        $this->mainQuantity = $mainQuantity;

        return $this;
    }

    public function getMainOutGoingUnitPriceHT(): ?float
    {
        return $this->mainOutGoingUnitPriceHT;
    }

    public function setMainOutGoingUnitPriceHT(?float $mainOutGoingUnitPriceHT): static
    {
        $this->mainOutGoingUnitPriceHT = $mainOutGoingUnitPriceHT;

        return $this;
    }

    public function getMainPackaging(): ?string
    {
        return $this->mainPackaging;
    }

    public function setMainPackaging(?string $mainPackaging): static
    {
        $this->mainPackaging = $mainPackaging;

        return $this;
    }

    public function getMainPackagingId(): ?int
    {
        return $this->mainPackagingId;
    }

    public function setMainPackagingId(?int $mainPackagingId): static
    {
        $this->mainPackagingId = $mainPackagingId;

        return $this;
    }

    public function getUnitFactor(): ?int
    {
        return $this->unitFactor;
    }

    public function setUnitFactor(?int $unitFactor): static
    {
        $this->unitFactor = $unitFactor;

        return $this;
    }
}
