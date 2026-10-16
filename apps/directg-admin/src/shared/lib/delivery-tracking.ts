// legacy _Admin_/event/*(btn_delivery_search) 배송조회 스크립트 재현.
// delivery_code=="002"면 우체국(epost), else CJ대한통운. 하이픈 제거한 송장번호로 target _blank form POST.
export const openDeliveryTracking = (trackingNo: string, deliveryCode: string) => {
  const form = document.createElement("form");
  form.method = "post";
  form.target = "_blank";
  const input = document.createElement("input");
  input.type = "hidden";
  input.value = trackingNo;
  if (deliveryCode === "002") {
    form.action = "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm";
    input.name = "sid1";
  } else {
    form.action = "https://trace.cjlogistics.com/web/detail.jsp";
    input.name = "slipno";
  }
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
