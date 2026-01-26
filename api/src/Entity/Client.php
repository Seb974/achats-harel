<?php

declare(strict_types=1);

namespace App\Entity;

use App\Dto\ClientInput;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\ClientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Controller\CreateClientController;
use App\Controller\UpdateClientController;
use Symfony\Component\Serializer\Annotation\Groups;
use App\DataTransformer\ClientInputDataTransformer;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;

#[ORM\Entity(repositoryClass: ClientRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    uriTemplate: '/clients{._format}',
    operations: [
        new GetCollection(
            itemUriTemplate: '/clients/{id}{._format}',
            paginationClientItemsPerPage: true
        ),
        new Post(
            input: ClientInput::class,
            output: Client::class,
            uriTemplate: '/clients{._format}',
            processor: ClientInputDataTransformer::class,
            controller: CreateClientController::class,
            inputFormats: ['multipart' => ['multipart/form-data']],
            deserialize: false,
            security: 'is_granted("OIDC_ADMIN")'
        ), 
        new Get(
            uriTemplate: '/clients/{id}{._format}'
        ),
        new Put(
            uriTemplate: '/clients/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
        new Delete(
            uriTemplate: '/clients/{id}{._format}',
            security: 'is_granted("OIDC_ADMIN")'
        ),
    ],
    normalizationContext: [
        AbstractNormalizer::GROUPS => ['Client:read'],
        AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    ],
    denormalizationContext: [
        AbstractNormalizer::GROUPS => ['Client:write'],
    ],
    collectDenormalizationErrors: true,
    security: 'is_granted("OIDC_USER")',
    mercure: true
)]
class Client
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $slug = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Email]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $email = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Assert\Regex('/^[\d\s\+\-()]+$/', message: 'Numéro de téléphone invalide.')]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $logo = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $favicon = null;

    #[ORM\Column(length: 7, nullable: true)]
    #[Assert\Regex('/^#[0-9A-Fa-f]{6}$/')]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $color = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $active = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $timezone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $address = null;

    #[ORM\Column(length: 10, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $zipcode = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $city = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $website = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write'])]
    private ?string $emailServer = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $emailAddressSender = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $url = null;

    #[ORM\Column(length: 120, nullable: true)]
    #[Groups(groups: ['Client:write'])]
    private ?string $harelApiKey = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $harelUrl = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write'])]
    private ?string $exchangeRateApiKey = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $mainCurrency = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?int $decimalRound = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasCategoryTaxes = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasGlobalTaxes = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $repartitionMethod = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasCoeffApp = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $rateEditable = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $convertedPriceEditable = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $itemsPartName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $taxesPartName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $costPricesPartName = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $dateRateName = null;

    #[ORM\Column(length: 60, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $groupingElement = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?bool $hasCoeffCalculation = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $coeffCalculationPartName = null;

    // =========================================================================
    // CONFIGURATION ODOO
    // =========================================================================

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $odooUrl = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $odooDatabase = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $odooUsername = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(groups: ['Client:write'])]
    private ?string $odooApiKey = null;

    #[ORM\Column(length: 20, nullable: true, options: ['default' => 'harel'])]
    #[Groups(groups: ['Client:write', 'Client:read'])]
    private ?string $dataSource = 'harel';  // 'harel' ou 'odoo'

    #[Groups(groups: ['Client:read'])]
    public function getEmailParams(): string
    {
        if (!$this->emailServer) {
            return '';
        }

        $hidden = str_repeat('*', 6);
        return "transporter+api://{$hidden}:{$hidden}@default";
    }

    #[Groups(groups: ['Client:read'])]
    public function getApiKey(): string
    {
        if (!$this->harelApiKey) {
            return '';
        }

        return str_repeat('*', 15);
    }

    #[Groups(groups: ['Client:read'])]
    public function getExchangeApiKey(): string
    {
        if (!$this->exchangeRateApiKey) {
            return '';
        }

        return str_repeat('*', 15);
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

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

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getLogo(): string|UploadedFile|null
    {
        return $this->logo;
    }

    public function setLogo(string|UploadedFile|null $logo): static
    {
        $this->logo = $logo;

        return $this;
    }

    public function getFavicon(): string|UploadedFile|null
    {
        return $this->favicon;
    }

    public function setFavicon(string|UploadedFile|null $favicon): static
    {
        $this->favicon = $favicon;

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

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(?bool $active): static
    {
        $this->active = $active;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(?\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getTimezone(): ?string
    {
        return $this->timezone;
    }

    public function setTimezone(?string $timezone): static
    {
        $this->timezone = $timezone;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getZipcode(): ?string
    {
        return $this->zipcode;
    }

    public function setZipcode(?string $zipcode): static
    {
        $this->zipcode = $zipcode;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;

        return $this;
    }

    public function getEmailServer(): ?string
    {
        return $this->emailServer;
    }

    public function setEmailServer(?string $emailServer): static
    {
        $this->emailServer = $emailServer;

        return $this;
    }

    public function getEmailAddressSender(): ?string
    {
        return $this->emailAddressSender;
    }

    public function setEmailAddressSender(?string $emailAddressSender): static
    {
        $this->emailAddressSender = $emailAddressSender;

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): static
    {
        $this->url = $url;

        return $this;
    }

    public function getHarelApiKey(): ?string
    {
        return $this->harelApiKey;
    }

    public function setHarelApiKey(?string $harelApiKey): static
    {
        $this->harelApiKey = $harelApiKey;

        return $this;
    }

    public function getHarelUrl(): ?string
    {
        return $this->harelUrl;
    }

    public function setHarelUrl(?string $harelUrl): static
    {
        $this->harelUrl = $harelUrl;

        return $this;
    }

    public function getExchangeRateApiKey(): ?string
    {
        return $this->exchangeRateApiKey;
    }

    public function setExchangeRateApiKey(?string $exchangeRateApiKey): static
    {
        $this->exchangeRateApiKey = $exchangeRateApiKey;

        return $this;
    }

    public function getMainCurrency(): ?string
    {
        return $this->mainCurrency;
    }

    public function setMainCurrency(?string $mainCurrency): static
    {
        $this->mainCurrency = $mainCurrency;

        return $this;
    }

    public function getDecimalRound(): ?int
    {
        return $this->decimalRound;
    }

    public function setDecimalRound(?int $decimalRound): static
    {
        $this->decimalRound = $decimalRound;

        return $this;
    }

    public function getHasCategoryTaxes(): ?bool
    {
        return $this->hasCategoryTaxes;
    }

    public function setHasCategoryTaxes(?bool $hasCategoryTaxes): static
    {
        $this->hasCategoryTaxes = $hasCategoryTaxes;

        return $this;
    }

    public function getHasGlobalTaxes(): ?bool
    {
        return $this->hasGlobalTaxes;
    }

    public function setHasGlobalTaxes(?bool $hasGlobalTaxes): static
    {
        $this->hasGlobalTaxes = $hasGlobalTaxes;

        return $this;
    }

    public function getRepartitionMethod(): ?string
    {
        return $this->repartitionMethod;
    }

    public function setRepartitionMethod(?string $repartitionMethod): static
    {
        $this->repartitionMethod = $repartitionMethod;

        return $this;
    }

    public function getHasCoeffApp(): ?bool
    {
        return $this->hasCoeffApp;
    }

    public function setHasCoeffApp(?bool $hasCoeffApp): static
    {
        $this->hasCoeffApp = $hasCoeffApp;

        return $this;
    }

    public function getItemsPartName(): ?string
    {
        return $this->itemsPartName;
    }

    public function setItemsPartName(?string $itemsPartName): static
    {
        $this->itemsPartName = $itemsPartName;

        return $this;
    }

    public function getTaxesPartName(): ?string
    {
        return $this->taxesPartName;
    }

    public function setTaxesPartName(?string $taxesPartName): static
    {
        $this->taxesPartName = $taxesPartName;

        return $this;
    }

    public function getCostPricesPartName(): ?string
    {
        return $this->costPricesPartName;
    }

    public function setCostPricesPartName(?string $costPricesPartName): static
    {
        $this->costPricesPartName = $costPricesPartName;

        return $this;
    }

    public function getDateRateName(): ?string
    {
        return $this->dateRateName;
    }

    public function setDateRateName(?string $dateRateName): static
    {
        $this->dateRateName = $dateRateName;

        return $this;
    }

    public function isRateEditable(): ?bool
    {
        return $this->rateEditable;
    }

    public function setRateEditable(?bool $rateEditable): static
    {
        $this->rateEditable = $rateEditable;

        return $this;
    }

    public function isConvertedPriceEditable(): ?bool
    {
        return $this->convertedPriceEditable;
    }

    public function setConvertedPriceEditable(?bool $convertedPriceEditable): static
    {
        $this->convertedPriceEditable = $convertedPriceEditable;

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

    public function getHasCoeffCalculation(): ?bool
    {
        return $this->hasCoeffCalculation;
    }

    public function setHasCoeffCalculation(?bool $hasCoeffCalculation): static
    {
        $this->hasCoeffCalculation = $hasCoeffCalculation;

        return $this;
    }

    public function getCoeffCalculationPartName(): ?string
    {
        return $this->coeffCalculationPartName;
    }

    public function setCoeffCalculationPartName(?string $coeffCalculationPartName): static
    {
        $this->coeffCalculationPartName = $coeffCalculationPartName;

        return $this;
    }

    // =========================================================================
    // GETTERS & SETTERS ODOO
    // =========================================================================

    public function getOdooUrl(): ?string
    {
        return $this->odooUrl;
    }

    public function setOdooUrl(?string $odooUrl): static
    {
        $this->odooUrl = $odooUrl;

        return $this;
    }

    public function getOdooDatabase(): ?string
    {
        return $this->odooDatabase;
    }

    public function setOdooDatabase(?string $odooDatabase): static
    {
        $this->odooDatabase = $odooDatabase;

        return $this;
    }

    public function getOdooUsername(): ?string
    {
        return $this->odooUsername;
    }

    public function setOdooUsername(?string $odooUsername): static
    {
        $this->odooUsername = $odooUsername;

        return $this;
    }

    public function getOdooApiKey(): ?string
    {
        return $this->odooApiKey;
    }

    public function setOdooApiKey(?string $odooApiKey): static
    {
        $this->odooApiKey = $odooApiKey;

        return $this;
    }

    public function getDataSource(): ?string
    {
        return $this->dataSource ?? 'harel';
    }

    public function setDataSource(?string $dataSource): static
    {
        $this->dataSource = $dataSource;

        return $this;
    }

    #[Groups(groups: ['Client:read'])]
    public function getOdooApiKeyMasked(): string
    {
        if (!$this->odooApiKey) {
            return '';
        }

        return str_repeat('*', 15);
    }

    /**
     * Vérifie si le client est configuré pour utiliser Odoo
     */
    public function isOdooConfigured(): bool
    {
        return $this->odooUrl && $this->odooDatabase && $this->odooUsername && $this->odooApiKey;
    }

    /**
     * Vérifie si le client utilise Odoo comme source de données
     */
    public function usesOdoo(): bool
    {
        return $this->dataSource === 'odoo' && $this->isOdooConfigured();
    }
}
