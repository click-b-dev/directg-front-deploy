/**
 * 상품 상세(게임/DLC/번들/패키지/액세서리/홀로모델) 공용 UI.
 * legacy `pc/game/*_view.html` 계열이 공유하는 표시·인터랙션 컴포넌트.
 */
export { MediaGallery } from "./ui/media-gallery";
export { ToggleSection } from "./ui/toggle-section";
export { DlcCollapseButton } from "./ui/dlc-collapse-button";
export { WishlistButton, CartButton, CartWishlistModals } from "./ui/option-actions";
export { RecommandCard } from "./ui/recommand-card";
export {
  GameEditionCard,
  DlcSection,
  DlcBundleSection,
  PlatformLogo,
  DeliveryBadge,
} from "./ui/option-sections";
