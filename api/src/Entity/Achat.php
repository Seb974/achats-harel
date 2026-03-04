<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\AchatRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: AchatRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationClientEnabled: true,
            paginationClientItemsPerPage: true,
            filters: [
                'app.filter.achat.date',
                'app.filter.achat.status',
                'app.filter.achat.supplier'
            ],
        ),
        new Post(),
        new Get(),
        new Put(),
        new Patch(inputFormats: ['json' => ['application/merge-patch+json']]),
        new Delete(),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Achat:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Achat:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Achat
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?\DateTimeInterface $deliveryDate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?int $supplierId = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?string $supplier = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?string $baseCurrency = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?string $targetCurrency = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?float $exchangeRate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?float $totalHT = null;

    /**
     * @var Collection<int, Item>
     */
    #[ORM\OneToMany(targetEntity: Item::class, mappedBy: 'achat', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Achat:write', 'Achat:read'])]
    private Collection $items;

    #[ORM\ManyToOne]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?Status $status = null;

    /**
     * @var Collection<int, MediaObject>
     */
    #[ORM\OneToMany(targetEntity: MediaObject::class, mappedBy: 'achat')]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private Collection $documents;

    /**
     * @var Collection<int, CategoryTax>
     */
    #[ORM\OneToMany(targetEntity: CategoryTax::class, mappedBy: 'achat', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private Collection $categoryTaxes;

    /**
     * @var Collection<int, Tax>
     */
    #[ORM\ManyToMany(targetEntity: Tax::class)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private Collection $globalTaxes;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?float $globalTaxesAmount = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?float $globalTotalRate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?float $coeffApp = null;

    #[ORM\Column(length: 60, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?string $groupingElement = null;

    /**
     * @var Collection<int, OtherCost>
     */
    #[ORM\OneToMany(targetEntity: OtherCost::class, mappedBy: 'achat', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private Collection $otherCosts;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?string $comment = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?float $coveringExchangeRate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?\DateTimeInterface $coveringDate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?float $totalCoveringHT = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private ?string $shipNumber = null;

    /**
     * @var Collection<int, CoveringCost>
     */
    #[ORM\OneToMany(targetEntity: CoveringCost::class, mappedBy: 'achat', cascade: ['persist', 'remove'])]
    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    private Collection $coveringCosts;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read'])]
    private ?int $odooPurchaseOrderId = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read'])]
    private ?string $odooPurchaseOrderName = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Achat:write', 'Achat:read'])]
    private ?int $odooPickingId = null;

    public function __construct()
    {
        $this->items = new ArrayCollection();
        $this->documents = new ArrayCollection();
        $this->categoryTaxes = new ArrayCollection();
        $this->globalTaxes = new ArrayCollection();
        $this->otherCosts = new ArrayCollection();
        $this->coveringCosts = new ArrayCollection();
    }

    #[Groups(groups: ['Achat:write', 'Achat:read', 'Item:read'])]
    public function getTaxIds(): ?array
    {
        return $this->globalTaxes
            ->map(fn($tax) => '/taxes/'. $tax->getId())
            ->toArray();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(?\DateTimeInterface $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getDeliveryDate(): ?\DateTimeInterface
    {
        return $this->deliveryDate;
    }

    public function setDeliveryDate(?\DateTimeInterface $deliveryDate): static
    {
        $this->deliveryDate = $deliveryDate;

        return $this;
    }

    public function getSupplierId(): ?int
    {
        return $this->supplierId;
    }

    public function setSupplierId(?int $supplierId): static
    {
        $this->supplierId = $supplierId;

        return $this;
    }

    public function getSupplier(): ?string
    {
        return $this->supplier;
    }

    public function setSupplier(?string $supplier): static
    {
        $this->supplier = $supplier;

        return $this;
    }

    public function getBaseCurrency(): ?string
    {
        return $this->baseCurrency;
    }

    public function setBaseCurrency(?string $baseCurrency): static
    {
        $this->baseCurrency = $baseCurrency;

        return $this;
    }

    public function getTargetCurrency(): ?string
    {
        return $this->targetCurrency;
    }

    public function setTargetCurrency(?string $targetCurrency): static
    {
        $this->targetCurrency = $targetCurrency;

        return $this;
    }

    public function getExchangeRate(): ?float
    {
        return $this->exchangeRate;
    }

    public function setExchangeRate(?float $exchangeRate): static
    {
        $this->exchangeRate = $exchangeRate;

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

    /**
     * @return Collection<int, Item>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(Item $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setAchat($this);
        }

        return $this;
    }

    public function removeItem(Item $item): static
    {
        if ($this->items->removeElement($item)) {
            // set the owning side to null (unless already changed)
            if ($item->getAchat() === $this) {
                $item->setAchat(null);
            }
        }

        return $this;
    }

    public function getStatus(): ?Status
    {
        return $this->status;
    }

    public function setStatus(?Status $status): static
    {
        $this->status = $status;

        return $this;
    }

    /**
     * @return Collection<int, MediaObject>
     */
    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function addDocument(MediaObject $document): static
    {
        if (!$this->documents->contains($document)) {
            $this->documents->add($document);
            $document->setAchat($this);
        }

        return $this;
    }

    public function removeDocument(MediaObject $document): static
    {
        if ($this->documents->removeElement($document)) {
            // set the owning side to null (unless already changed)
            if ($document->getAchat() === $this) {
                $document->setAchat(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, CategoryTax>
     */
    public function getCategoryTaxes(): Collection
    {
        return $this->categoryTaxes;
    }

    public function addCategoryTax(CategoryTax $categoryTax): static
    {
        if (!$this->categoryTaxes->contains($categoryTax)) {
            $this->categoryTaxes->add($categoryTax);
            $categoryTax->setAchat($this);
        }

        return $this;
    }

    public function removeCategoryTax(CategoryTax $categoryTax): static
    {
        if ($this->categoryTaxes->removeElement($categoryTax)) {
            // set the owning side to null (unless already changed)
            if ($categoryTax->getAchat() === $this) {
                $categoryTax->setAchat(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Tax>
     */
    public function getGlobalTaxes(): Collection
    {
        return $this->globalTaxes;
    }

    public function addGlobalTax(Tax $globalTax): static
    {
        if (!$this->globalTaxes->contains($globalTax)) {
            $this->globalTaxes->add($globalTax);
        }

        return $this;
    }

    public function removeGlobalTax(Tax $globalTax): static
    {
        $this->globalTaxes->removeElement($globalTax);

        return $this;
    }

    public function getGlobalTaxesAmount(): ?float
    {
        return $this->globalTaxesAmount;
    }

    public function setGlobalTaxesAmount(?float $globalTaxesAmount): static
    {
        $this->globalTaxesAmount = $globalTaxesAmount;

        return $this;
    }

    public function getGlobalTotalRate(): ?float
    {
        return $this->globalTotalRate;
    }

    public function setGlobalTotalRate(?float $globalTotalRate): static
    {
        $this->globalTotalRate = $globalTotalRate;

        return $this;
    }

    public function getCoeffApp(): ?float
    {
        return $this->coeffApp;
    }

    public function setCoeffApp(?float $coeffApp): static
    {
        $this->coeffApp = $coeffApp;

        return $this;
    }

    public function getGroupingElement(): ?string
    {
        return $this->groupingElement;
    }

    public function setGroupingElement(?string $groupingElement): static
    {
        $this->groupingElement = $groupingElement;

        return $this;
    }

    /**
     * @return Collection<int, OtherCost>
     */
    public function getOtherCosts(): Collection
    {
        return $this->otherCosts;
    }

    public function addOtherCost(OtherCost $otherCost): static
    {
        if (!$this->otherCosts->contains($otherCost)) {
            $this->otherCosts->add($otherCost);
            $otherCost->setAchat($this);
        }

        return $this;
    }

    public function removeOtherCost(OtherCost $otherCost): static
    {
        if ($this->otherCosts->removeElement($otherCost)) {
            // set the owning side to null (unless already changed)
            if ($otherCost->getAchat() === $this) {
                $otherCost->setAchat(null);
            }
        }

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }

    public function getCoveringExchangeRate(): ?float
    {
        return $this->coveringExchangeRate;
    }

    public function setCoveringExchangeRate(?float $coveringExchangeRate): static
    {
        $this->coveringExchangeRate = $coveringExchangeRate;

        return $this;
    }

    public function getCoveringDate(): ?\DateTimeInterface
    {
        return $this->coveringDate;
    }

    public function setCoveringDate(?\DateTimeInterface $coveringDate): static
    {
        $this->coveringDate = $coveringDate;

        return $this;
    }

    public function getTotalCoveringHT(): ?float
    {
        return $this->totalCoveringHT;
    }

    public function setTotalCoveringHT(?float $totalCoveringHT): static
    {
        $this->totalCoveringHT = $totalCoveringHT;

        return $this;
    }

    public function getShipNumber(): ?string
    {
        return $this->shipNumber;
    }

    public function setShipNumber(?string $shipNumber): static
    {
        $this->shipNumber = $shipNumber;

        return $this;
    }

    /**
     * @return Collection<int, CoveringCost>
     */
    public function getCoveringCosts(): Collection
    {
        return $this->coveringCosts;
    }

    public function addCoveringCost(CoveringCost $coveringCost): static
    {
        if (!$this->coveringCosts->contains($coveringCost)) {
            $this->coveringCosts->add($coveringCost);
            $coveringCost->setAchat($this);
        }

        return $this;
    }

    public function removeCoveringCost(CoveringCost $coveringCost): static
    {
        if ($this->coveringCosts->removeElement($coveringCost)) {
            if ($coveringCost->getAchat() === $this) {
                $coveringCost->setAchat(null);
            }
        }

        return $this;
    }

    public function getOdooPurchaseOrderId(): ?int
    {
        return $this->odooPurchaseOrderId;
    }

    public function setOdooPurchaseOrderId(?int $odooPurchaseOrderId): static
    {
        $this->odooPurchaseOrderId = $odooPurchaseOrderId;

        return $this;
    }

    public function getOdooPurchaseOrderName(): ?string
    {
        return $this->odooPurchaseOrderName;
    }

    public function setOdooPurchaseOrderName(?string $odooPurchaseOrderName): static
    {
        $this->odooPurchaseOrderName = $odooPurchaseOrderName;

        return $this;
    }

    public function getOdooPickingId(): ?int
    {
        return $this->odooPickingId;
    }

    public function setOdooPickingId(?int $odooPickingId): static
    {
        $this->odooPickingId = $odooPickingId;

        return $this;
    }
}
