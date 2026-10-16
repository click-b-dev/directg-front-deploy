import { useVaultnConnectionPrice } from "@entities/vaultn";

// legacy vaultn_connection_price.php — print_r($result); exit; (레이아웃 include 이전 → 원시 덤프만 출력).
export const VaultnConnectionPriceScreen = ({
  connectionGuid,
  priceListGuid,
}: {
  connectionGuid: string;
  priceListGuid: string;
}) => {
  const { data } = useVaultnConnectionPrice(connectionGuid, priceListGuid);
  if (data === undefined) {
    return null;
  }

  return <pre className="mb-0">{JSON.stringify(data, null, 2)}</pre>;
};
