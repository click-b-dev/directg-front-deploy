import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MemberOrderItem } from "@entities/member";
import iconOpenInNew from "@/renewal/assets/icon-open-in-new.svg";
import { Chip, DataTable, TableFooter, type DataTableColumn } from "@/renewal/shared/ui";
import {
  ORDER_FILTERS,
  ORDER_PAGE_SIZE,
  filterOrders,
  formatPrice,
  type OrderFilter,
} from "../model/detail";

type OrdersPanelProps = { orders: MemberOrderItem[]; email: string };

export const OrdersPanel = ({ orders, email }: OrdersPanelProps) => {
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = filterOrders(orders, filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDER_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * ORDER_PAGE_SIZE, currentPage * ORDER_PAGE_SIZE);

  const columns: DataTableColumn<MemberOrderItem>[] = [
    { key: "order_date", header: "주문일", width: "rn:w-180", cell: (order) => order.order_date },
    {
      key: "ordno",
      header: "주문 번호",
      width: "rn:w-200",
      cell: (order) => (
        <Link
          to="/order/order_view"
          search={{ settle_no: order.settle_no }}
          className="rn:inline-flex rn:items-center rn:gap-2 rn:text-body3 rn:font-medium rn:text-primary"
        >
          {order.ordno}
          <img src={iconOpenInNew} alt="" width={20} height={20} />
        </Link>
      ),
    },
    { key: "settle_no", header: "결제 번호", width: "rn:w-240", cell: (order) => order.settle_no },
    { key: "product", header: "주문 상품", align: "left", cell: (order) => order.product_name },
    { key: "email", header: "계정", width: "rn:w-280", align: "left", cell: () => email },
    {
      key: "price",
      header: "주문 금액",
      width: "rn:w-180",
      cell: (order) => formatPrice(order.price),
    },
    { key: "status", header: "주문 상태", width: "rn:w-160", cell: (order) => order.status_label },
  ];

  return (
    <>
      <div className="rn:flex rn:items-center rn:gap-8">
        {ORDER_FILTERS.map((item) => (
          <Chip
            key={item.value}
            selected={filter === item.value}
            onClick={() => {
              setFilter(item.value);
              setPage(1);
            }}
          >
            {item.label}
          </Chip>
        ))}
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(order) => `${order.settle_no}-${order.ordno}`}
        emptyText="주문 내역이 없습니다."
      />
      <TableFooter
        page={currentPage}
        totalPages={totalPages}
        pageSize={ORDER_PAGE_SIZE}
        totalResults={filtered.length}
        onPageChange={setPage}
      />
    </>
  );
};
