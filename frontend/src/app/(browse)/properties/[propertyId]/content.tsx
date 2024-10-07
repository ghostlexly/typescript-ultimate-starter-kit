"use client";

import Container from "@/components/ui/container";
import { GhostImage } from "@/components/ui/ghost-image";
import LoadingDots from "@/components/ui/loading-dots";
import { OpenWhatsAppButton } from "@/components/ui/project/open-whatsapp";
import { QueryErrorMessage } from "@/components/ui/query-error-message";
import { s3 } from "@/lib/s3";
import { wolfios } from "@/lib/wolfios";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { Details } from "./details";
import { KeyFigures } from "./key-figures";
import { RequestPhoneDialog } from "./request-phone-dialog";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CallToAction } from "./call-to-action";
import { Documents } from "./documents";
import { PhotosCard } from "./photos";
import { ImagesCarouselDialog } from "./images-carousel-dialog";
import { AccessReservedCard } from "./access-reserved";
import { Badge } from "@/components/ui/badge";
import { PropertyStatusBadge } from "./property-status-badge";

const Content = () => {
  const { propertyId } = useParams();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");
  const subscriberId = searchParams.get("subscriberId");
  const [isPhoneUnlockDialogOpen, setIsPhoneUnlockDialogOpen] = useState(true);
  const [isImagesCarouselDialogOpen, setIsImagesCarouselDialogOpen] =
    useState(false);
  const [subscriber, setSubscriber] = useState(null);
  const priceFormatter = Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const property = useQuery({
    queryKey: ["properties", propertyId, "custom"],
    queryFn: () =>
      wolfios
        .get(`/api/properties/${propertyId}/custom`, {
          params: { subscriberId: subscriberId ?? "" },
        })
        .then(async (res) => await res.json()),
    enabled: !!subscriberId,
  });

  const customer = useQuery({
    queryKey: ["customers", customerId],
    queryFn: () =>
      wolfios
        .get(`/api/customers/${customerId}`)
        .then(async (res) => await res.json()),
    enabled: !!customerId,
  });

  if (subscriber === null) {
    return (
      <AccessReservedCard
        subscriberId={subscriberId}
        setSubscriber={setSubscriber}
        isPhoneUnlockDialogOpen={isPhoneUnlockDialogOpen}
        setIsPhoneUnlockDialogOpen={setIsPhoneUnlockDialogOpen}
      />
    );
  }

  if (property.status === "pending" || customer.status === "pending") {
    return (
      <div className="flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  } else if (property.status === "error" || customer.status === "error") {
    return <QueryErrorMessage />;
  }

  return (
    <>
      <Container>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <PhotosCard
            property={property}
            setIsImagesCarouselDialogOpen={setIsImagesCarouselDialogOpen}
          />

          <KeyFigures property={property} />
        </div>

        <div className="mt-4 font-visbycfBold text-xl">
          {property.data?.name}
        </div>

        <div className="my-2">
          <PropertyStatusBadge property={property} />
        </div>

        <div>
          {property.data?.rooms} pièces · {property.data?.squareMeters} m² ·{" "}
          {property.data?.address}
        </div>

        <h2 className="my-4 font-visbycfBold text-xl">
          {priceFormatter.format(property.data?.price)}
        </h2>

        <div className="my-6">
          <div className="mb-2 mt-4 font-visbycfBold text-lg">
            Si tu es intéressé, appelle-moi !
          </div>

          {customer.data?.phone && (
            <CallToAction
              property={property}
              phoneNumber={customer.data?.phone}
            />
          )}
        </div>

        <Details property={property} />

        <div className="my-4">
          <Card>
            <CardContent className="pt-6">
              <div className="whitespace-pre-line">
                {property.data?.description}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-2 mt-4 font-visbycfBold text-lg">
          Si tu es intéressé, appelle-moi !
        </div>

        {customer.data?.phone && (
          <CallToAction
            property={property}
            phoneNumber={customer.data?.phone}
          />
        )}

        <Documents property={property} />
      </Container>

      <ImagesCarouselDialog
        isOpen={isImagesCarouselDialogOpen}
        setIsOpen={setIsImagesCarouselDialogOpen}
        property={property}
      />
    </>
  );
};

export default Content;
