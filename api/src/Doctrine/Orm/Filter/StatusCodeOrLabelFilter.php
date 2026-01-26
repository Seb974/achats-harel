<?php

declare(strict_types=1);

namespace App\Doctrine\Orm\Filter;

use Doctrine\DBAL\Types\Types;
use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\PropertyHelperTrait;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

final class StatusCodeOrLabelFilter extends AbstractFilter
{
    use PropertyHelperTrait;

    public function getDescription(string $resourceClass): array
    {
        return [
            'status' => [
                'property' => 'status',
                'type' => 'string',
                'required' => false,
                'strategy' => 'iword_start',
                'is_collection' => true,
            ],
        ];
    }

    /**
     * @param string|null $value
     */
    protected function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if ('status' !== $property || !$value) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];

        $statusAlias = $queryNameGenerator->generateJoinAlias('status');

        if (!\in_array($statusAlias, array_map(fn($join) => $join->getAlias(), $queryBuilder->getDQLPart('join')[$alias] ?? []), true)) {
            $queryBuilder->leftJoin("$alias.status", $statusAlias);
        }

        $queryBuilder
            ->andWhere(
                $queryBuilder->expr()->orX(
                    $queryBuilder->expr()->like("LOWER($statusAlias.label)", ':status'),
                    $queryBuilder->expr()->like("LOWER($statusAlias.code)", ':status')
                )
            )
            ->setParameter('status', '%' . strtolower($value) . '%');
    }
}
