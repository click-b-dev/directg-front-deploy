import { useVaultnConnectionPriceList } from "@entities/vaultn";

// legacy vaultn_connection_pricelist.php — print_r($result); exit; (레이아웃 include 이전 → 원시 덤프만 출력).
export const VaultnConnectionPricelistScreen = ({ connectionGuid }: { connectionGuid: string }) => {
  const { data } = useVaultnConnectionPriceList(connectionGuid);
  if (data === undefined) {
    return null;
  }

  return <pre className="mb-0">{JSON.stringify(data, null, 2)}</pre>;
};
