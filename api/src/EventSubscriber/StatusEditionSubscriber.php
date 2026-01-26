<?php

namespace App\EventSubscriber;

use App\Entity\Status;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use ApiPlatform\Symfony\EventListener\EventPriorities;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

final class StatusEditionSubscriber implements EventSubscriberInterface
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public static function getSubscribedEvents()
    {
        return [ KernelEvents::VIEW => ['onStatusWrite', EventPriorities::PRE_WRITE] ];
    }

    public function onStatusWrite(ViewEvent $event): void
    {   
        $status = $event->getControllerResult();
        $method = $event->getRequest()->getMethod(); 

        if (!$status instanceof Status || !in_array($method, [Request::METHOD_POST, Request::METHOD_PUT, Request::METHOD_PATCH])) 
            return;

        if ($status->getIsDefault()) {
            $this->setNotDefaultToOtherStatuses($status);
        }
    }

    private function setNotDefaultToOtherStatuses(Status $status) :void 
    {
        $repository = $this->em->getRepository(Status::class);
        $allStatuses = $repository->findAll();

        foreach ($allStatuses as $otherStatus) {
            if ($otherStatus !== $status && ($otherStatus->getIsDefault() || \is_null($otherStatus->getIsDefault()))) {
                $otherStatus->setIsDefault(false);
            }
        }
    }

}