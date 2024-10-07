### Example of a simple usage with pagination

```tsx
"use client";

import PlaceholderImg from "@/assets/images/search/placeholder-avatar.jpg";
import HousekeeperStatusBadge from "@/app/project/housekeeper-status.badge";
import { Badge } from "@/components/ui/badge";
import { GhostImage } from "@/components/ui/ghost-image/ghost-image";
import {
  columnHelper,
  GhostTable,
} from "@/components/ui/ghost-table/ghost-table";
import { s3 } from "@/lib/s3";
import { wolfios } from "@/lib/wolfios";
import { useQuery } from "@tanstack/react-query";
import { Car, Eye, UserRoundPen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SearchHousekeeperTable = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 1, //initial page index
    pageSize: 50, //default page size
  });
  const [filters, setFilters] = useState<any>();

  // ------------------
  // Load
  // ------------------
  const { data, status } = useQuery({
    queryKey: [
      "admin",
      "housekeepers",
      JSON.stringify(pagination),
      JSON.stringify(filters),
    ],
    queryFn: () =>
      wolfios
        .get("/api/admin/housekeepers", {
          params: {
            page: pagination.pageIndex,
            first: pagination.pageSize,
            ...filters,
          },
        })
        .then((res) => res.data),
  });

  return (
    <>
      <GhostTable
        data={data?.nodes || []}
        isLoading={status === "pending"}
        setFilters={setFilters}
        pagination={pagination}
        setPagination={setPagination}
        pagesCount={data?.pagination.pagesCount || 0}
        columns={[
          columnHelper.accessor("avatar", {
            header: "",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => (
              <div className="relative h-8 w-8">
                <GhostImage
                  className="border-foreground rounded-full border object-contain"
                  src={
                    props.row.original.avatar?.fileKey
                      ? s3.getDomainName() + props.row.original.avatar?.fileKey
                      : PlaceholderImg
                  }
                  alt={`${props.row.original.informations?.firstName} ${props.row.original.informations?.lastName}`}
                  fill
                  sizes="(max-width: 768px) 200px, (max-width: 1200px) 500px, 900px"
                />
              </div>
            ),
          }),
          columnHelper.accessor((row) => row.email, {
            id: "email",
            header: "E-mail",
          }),
          columnHelper.accessor((row) => row.status, {
            id: "status",
            header: "Statut",
            meta: {
              type: "combobox",
              options: [
                { value: "IN_PROGRESS", label: "En cours" },
                {
                  value: "PENDING_FOR_APPROVAL",
                  label: "En attente d'approbation",
                },
                { value: "APPROVED", label: "Approuvé" },
                { value: "REJECTED", label: "Refusé" },
              ],
            },
            cell: (props) => (
              <HousekeeperStatusBadge status={props.getValue()} />
            ),
          }),
          columnHelper.accessor((row) => row.informations?.lastName ?? "-", {
            id: "informations_lastName",
            header: "Nom",
          }),
          columnHelper.accessor((row) => row.informations?.firstName ?? "-", {
            id: "informations_firstName",
            header: "Prénom",
          }),
          columnHelper.accessor((row) => row.informations?.phoneNumber ?? "-", {
            id: "informations_phoneNumber",
            header: "Numéro de téléphone",
            enableSorting: false,
          }),
          columnHelper.accessor((row) => row.informations?.companyAddress, {
            id: "informations_companyAddress",
            header: "Adresse siège social",
            enableSorting: false,
            cell: (props) => {
              const value = props.getValue();

              if (!value) {
                return "-";
              }

              return (
                <div>
                  {value.street} {value.streetDetails} {value.city}{" "}
                  {value.postalCode} {value.countryCode}
                </div>
              );
            },
          }),
          columnHelper.accessor((row) => row.informations?.hasVehicle, {
            id: "informations_hasVehicle",
            header: "Véhiculé",
            enableColumnFilter: false,
            cell: (props) => {
              const value = props.getValue();

              if (!value) {
                return "-";
              }

              return (
                <div>
                  <Badge>
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      <div>Véhiculé</div>
                    </div>
                  </Badge>
                </div>
              );
            },
          }),
          columnHelper.accessor((row) => row.services, {
            id: "services",
            header: "Services",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => {
              const services = props.getValue();

              if (services.length === 0) {
                return "-";
              }

              return (
                <div>
                  {services.map((service) => (
                    <Badge key={service.id} className="text-nowrap">
                      {service.serviceType.text}
                    </Badge>
                  ))}
                </div>
              );
            },
          }),
          columnHelper.accessor("actions", {
            header: "Actions",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin-area/housekeepers/${props.row.original.id}`}
                >
                  <Eye className="h-5 w-5" />
                </Link>

                <Link
                  href={`/admin-area/housekeepers/${props.row.original.id}/edit`}
                >
                  <UserRoundPen className="h-5 w-5" />
                </Link>
              </div>
            ),
          }),
        ]}
      />
    </>
  );
};

export default SearchHousekeeperTable;
```

### Example of a simple usage with infinite scroll

```tsx
"use client";

import { GhostImage } from "@/components/ui/ghost-image/ghost-image";
import {
  columnHelper,
  GhostTable,
} from "@/components/ui/ghost-table/ghost-table";
import { s3 } from "@/lib/s3";
import { wolfios } from "@/lib/wolfios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Car, Eye, Pen, UserRoundPen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import PlaceholderImg from "@/assets/images/search/placeholder-avatar.jpg";
import HousekeeperStatusBadge from "@/app/project/housekeeper-status.badge";
import { Badge } from "@/components/ui/badge";

const SearchHousekeeperTable = () => {
  const [filters, setFilters] = useState<any>();

  // ------------------
  // Load
  // ------------------
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["admin", "housekeepers", JSON.stringify(filters)],
      queryFn: ({ pageParam }) =>
        wolfios
          .get("/api/admin/housekeepers", {
            params: { after: pageParam, ...filters },
          })
          .then((res) => res.data),
      initialPageParam: undefined,
      getNextPageParam: (lastPage, pages) => {
        return lastPage.pagination.nextCursor;
      },
    });

  return (
    <>
      <GhostTable
        columns={[
          columnHelper.accessor("avatar", {
            header: "",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => (
              <div className="relative h-8 w-8">
                <GhostImage
                  className="border-foreground rounded-full border object-contain"
                  src={
                    props.row.original.avatar?.fileKey
                      ? s3.getDomainName() + props.row.original.avatar?.fileKey
                      : PlaceholderImg
                  }
                  alt={`${props.row.original.informations?.firstName} ${props.row.original.informations?.lastName}`}
                  fill
                  sizes="(max-width: 768px) 200px, (max-width: 1200px) 500px, 900px"
                />
              </div>
            ),
          }),
          columnHelper.accessor((row) => row.email, {
            id: "email",
            header: "E-mail",
          }),
          columnHelper.accessor((row) => row.status, {
            id: "status",
            header: "Statut",
            enableColumnFilter: false,
            cell: (props) => (
              <HousekeeperStatusBadge status={props.getValue()} />
            ),
          }),
          columnHelper.accessor((row) => row.informations?.lastName ?? "-", {
            id: "informations_lastName",
            header: "Nom",
          }),
          columnHelper.accessor((row) => row.informations?.firstName ?? "-", {
            id: "informations_firstName",
            header: "Prénom",
          }),
          columnHelper.accessor((row) => row.informations?.phoneNumber ?? "-", {
            id: "informations_phoneNumber",
            header: "Numéro de téléphone",
            enableSorting: false,
          }),
          columnHelper.accessor((row) => row.informations?.companyAddress, {
            id: "informations_companyAddress",
            header: "Adresse siège social",
            enableSorting: false,
            cell: (props) => {
              const value = props.getValue();

              if (!value) {
                return "-";
              }

              return (
                <div>
                  {value.street} {value.streetDetails} {value.city}{" "}
                  {value.postalCode} {value.countryCode}
                </div>
              );
            },
          }),
          columnHelper.accessor((row) => row.informations?.hasVehicle, {
            id: "informations_hasVehicle",
            header: "Véhiculé",
            enableColumnFilter: false,
            cell: (props) => {
              const value = props.getValue();

              if (!value) {
                return "-";
              }

              return (
                <div>
                  <Badge>
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      <div>Véhiculé</div>
                    </div>
                  </Badge>
                </div>
              );
            },
          }),
          columnHelper.accessor((row) => row.services, {
            id: "services",
            header: "Services",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => {
              const services = props.getValue();

              if (services.length === 0) {
                return "-";
              }

              return (
                <div>
                  {services.map((service) => (
                    <Badge key={service.id} className="text-nowrap">
                      {service.serviceType.text}
                    </Badge>
                  ))}
                </div>
              );
            },
          }),
          columnHelper.accessor("actions", {
            header: "Actions",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin-area/housekeepers/${props.row.original.id}`}
                >
                  <Eye className="h-5 w-5" />
                </Link>

                <Link
                  href={`/admin-area/housekeepers/${props.row.original.id}/edit`}
                >
                  <UserRoundPen className="h-5 w-5" />
                </Link>
              </div>
            ),
          }),
        ]}
        data={data?.pages.map((page) => page.nodes).flat() || []}
        isLoading={status === "pending" || isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        setFilters={setFilters}
      />
    </>
  );
};

export default SearchHousekeeperTable;
```
