<?php

namespace App\Serializer;

use App\Entity\MediaObject;
use App\Service\ClientGetter;
use Vich\UploaderBundle\Storage\StorageInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class MediaObjectNormalizer implements NormalizerInterface
{

  private const ALREADY_CALLED = 'MEDIA_OBJECT_NORMALIZER_ALREADY_CALLED';

  public function __construct(
    #[Autowire(service: 'api_platform.jsonld.normalizer.item')]
    private readonly NormalizerInterface $normalizer,
    private readonly StorageInterface $storage,
    private readonly ClientGetter $clientGetter
  ) {
  }

  public function normalize($object, ?string $format = null, array $context = []): array|string|int|float|bool|\ArrayObject|null
  {
    $context[self::ALREADY_CALLED] = true;

    if ($object->isStoredInOdoo()) {
      try {
        $client = $this->clientGetter->get();
        $odooUrl = rtrim($client?->getOdooUrl() ?? '', '/');
        $object->contentUrl = $odooUrl . '/odoo/documents/' . $object->getOdooDocumentId();
      } catch (\Throwable) {
        $object->contentUrl = '/odoo/attachment/' . $object->getOdooDocumentId() . '/download';
      }
    } else {
      $object->contentUrl = $this->storage->resolveUri($object, 'file');
    }

    return $this->normalizer->normalize($object, $format, $context);
  }

  public function supportsNormalization($data, ?string $format = null, array $context = []): bool
  {

    if (isset($context[self::ALREADY_CALLED])) {
      return false;
    }

    return $data instanceof MediaObject;
  }

  public function getSupportedTypes(?string $format): array
  {
    return [
      MediaObject::class => true,
    ];
  }
}