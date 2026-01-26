<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CategoryTaxRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

#[ORM\Entity(repositoryClass: CategoryTaxRepository::class)]
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
        AbstractNormalizer::GROUPS => ['CategoryTax:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['CategoryTax:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class CategoryTax
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['CategoryTax:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['CategoryTax:write', 'CategoryTax:read', 'Achat:write', 'Achat:read', 'Item:read'])]
    private ?string $categoryId = null;

    #[ORM\ManyToOne(inversedBy: 'categoryTaxes')]
    #[Groups(groups: ['CategoryTax:read'])]
    private ?Achat $achat = null;

    /**
     * @var Collection<int, Tax>
     */
    #[ORM\ManyToMany(targetEntity: Tax::class)]
    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?Collection $taxes = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?float $taxesAmount = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?float $totalHT = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?int $totalQty = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?float $totalRate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?float $totalTTC = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    private ?string $categoryName = null;

    #[Groups(groups: ['CategoryTax:write', 'Achat:write', 'CategoryTax:read', 'Achat:read', 'Item:read'])]
    public function getTaxIds(): ?array
    {
        return $this->taxes
            ->map(fn($tax) => '/taxes/'. $tax->getId())
            ->toArray();
    }

    public function __construct()
    {
        $this->taxes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getAchat(): ?Achat
    {
        return $this->achat;
    }

    public function setAchat(?Achat $achat): static
    {
        $this->achat = $achat;

        return $this;
    }

    /**
     * @return Collection<int, Tax>
     */
    public function getTaxes(): Collection
    {
        if (is_null($this->taxes)) {
            return new ArrayCollection();
        }

        return $this->taxes;
    }

    public function addTax(Tax $tax): static
    {
        if (is_null($this->taxes)) {
            $this->taxes = new ArrayCollection();
        }
        
        if (!$this->taxes->contains($tax)) {
            $this->taxes->add($tax);
        }

        return $this;
    }

    public function removeTax(Tax $tax): static
    {
        $this->taxes->removeElement($tax);

        return $this;
    }

    public function getTaxesAmount(): ?float
    {
        return $this->taxesAmount;
    }

    public function setTaxesAmount(?float $taxesAmount): static
    {
        $this->taxesAmount = $taxesAmount;

        return $this;
    }

    public function getTotalHT(): ?float
    {
        return $this->totalHT;
    }

    public function setTotalHT(?float $totalHT): static
    {
        $this->totalHT = $totalHT;

        return $this;
    }

    public function getTotalQty(): ?int
    {
        return $this->totalQty;
    }

    public function setTotalQty(?int $totalQty): static
    {
        $this->totalQty = $totalQty;

        return $this;
    }

    public function getTotalRate(): ?float
    {
        return $this->totalRate;
    }

    public function setTotalRate(?float $totalRate): static
    {
        $this->totalRate = $totalRate;

        return $this;
    }

    public function getTotalTTC(): ?float
    {
        return $this->totalTTC;
    }

    public function setTotalTTC(?float $totalTTC): static
    {
        $this->totalTTC = $totalTTC;

        return $this;
    }

    public function getCategoryName(): ?string
    {
        return $this->categoryName;
    }

    public function setCategoryName(?string $categoryName): static
    {
        $this->categoryName = $categoryName;

        return $this;
    }
}
