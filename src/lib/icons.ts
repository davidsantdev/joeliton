/**
 * Registro tipado dos ícones usados no site.
 * - Ícones de interface: Lucide (ISC), importados um a um → só entra no build o que é usado.
 * - Ícones de marca (Instagram, Facebook, WhatsApp, LinkedIn): o Lucide v1 removeu,
 *   então ficam aqui como SVG preenchido.
 */
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Blocks,
  Boxes,
  Check,
  ChartColumn,
  ChartLine,
  ChevronDown,
  CircleCheck,
  Clock,
  Cloud,
  CloudCheck,
  CodeXml,
  CreditCard,
  FileCheck,
  Handshake,
  HardHat,
  Headset,
  House,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  MessageSquareMore,
  Monitor,
  Moon,
  Package,
  PackageCheck,
  Phone,
  Puzzle,
  Receipt,
  ReceiptText,
  Rocket,
  ScanBarcode,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  TabletSmartphone,
  Tag,
  Truck,
  Wallet,
  Waypoints,
  Weight,
  X,
  Zap,
} from 'lucide-static';

const brand = {
  instagram:
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.25" fill="currentColor"/>',
  facebook:
    '<path fill="currentColor" d="M13.5 21.95v-7.2h2.43l.37-2.83H13.5v-1.8c0-.82.23-1.38 1.4-1.38h1.5V6.2a20 20 0 0 0-2.18-.11c-2.16 0-3.64 1.32-3.64 3.74v2.09H8.14v2.83h2.44v7.2A10 10 0 1 1 13.5 21.95Z"/>',
  linkedin:
    '<path fill="currentColor" d="M4.98 3.5a2.48 2.48 0 1 1 0 4.96 2.48 2.48 0 0 1 0-4.96ZM3 9.75h3.96V21H3V9.75Zm6.44 0h3.8v1.54h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.74 2.64 4.74 6.07V21h-3.95v-5.06c0-1.2-.02-2.76-1.68-2.76-1.69 0-1.95 1.32-1.95 2.67V21H9.44V9.75Z"/>',
  whatsapp:
    '<path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.03 1.02-1.03 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35Zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.82 9.82 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88Zm8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.9-11.9a11.82 11.82 0 0 0-3.49-8.41Z"/>',
} as const;

/** Extrai só o miolo do SVG do Lucide para podermos controlar os atributos do <svg>. */
const inner = (svg: string) =>
  svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();

const lucide = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  bell: Bell,
  blocks: Blocks,
  boxes: Boxes,
  check: Check,
  'chart-column': ChartColumn,
  'chart-line': ChartLine,
  'chevron-down': ChevronDown,
  'circle-check': CircleCheck,
  clock: Clock,
  cloud: Cloud,
  'cloud-check': CloudCheck,
  'code-xml': CodeXml,
  'credit-card': CreditCard,
  'file-check': FileCheck,
  handshake: Handshake,
  'hard-hat': HardHat,
  headset: Headset,
  house: House,
  'layout-dashboard': LayoutDashboard,
  mail: Mail,
  'map-pin': MapPin,
  menu: Menu,
  'message-square-more': MessageSquareMore,
  monitor: Monitor,
  moon: Moon,
  package: Package,
  'package-check': PackageCheck,
  phone: Phone,
  puzzle: Puzzle,
  receipt: Receipt,
  'receipt-text': ReceiptText,
  rocket: Rocket,
  'scan-barcode': ScanBarcode,
  search: Search,
  settings: Settings,
  'shield-check': ShieldCheck,
  'shopping-basket': ShoppingBasket,
  'shopping-cart': ShoppingCart,
  smartphone: Smartphone,
  sparkles: Sparkles,
  store: Store,
  sun: Sun,
  'tablet-smartphone': TabletSmartphone,
  tag: Tag,
  truck: Truck,
  wallet: Wallet,
  waypoints: Waypoints,
  weight: Weight,
  x: X,
  zap: Zap,
} as const;

export type IconName = keyof typeof lucide | keyof typeof brand;

export function getIcon(name: IconName): { body: string; filled: boolean } {
  if (name in brand) return { body: brand[name as keyof typeof brand], filled: true };
  return { body: inner(lucide[name as keyof typeof lucide]), filled: false };
}
